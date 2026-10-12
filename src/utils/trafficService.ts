import { LiveTrafficInfo, AlternativeRouteOption } from '../types';

/**
 * Fetch live traffic conditions for the active ride or logistics shipment.
 * Queries the backend proxy service which models live route bottlenecks,
 * congestion speed, delay minutes, and alternative detour routes.
 */
export async function fetchLiveTrafficConditions(
  fromCoords: { lat: number; lng: number },
  toCoords: { lat: number; lng: number },
  mode: 'ride' | 'logistics' = 'ride',
  vehicleType?: string
): Promise<LiveTrafficInfo> {
  try {
    const url = `/api/traffic/conditions?fromLat=${fromCoords.lat}&fromLng=${fromCoords.lng}&toLat=${toCoords.lat}&toLng=${toCoords.lng}&mode=${mode}&vehicleType=${vehicleType || ''}`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data: LiveTrafficInfo = await resp.json();
      return data;
    }
  } catch (err) {
    console.warn('Network error fetching traffic from server, calculating client-side traffic model:', err);
  }

  // Graceful client fallback
  const dLat = toCoords.lat - fromCoords.lat;
  const dLng = toCoords.lng - fromCoords.lng;
  const distKm = Math.max(1, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 1.3 * 10) / 10);
  const now = new Date();
  const hour = now.getHours();
  const isRushHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);

  const delayMins = isRushHour ? Math.max(3, Math.round(distKm * 0.8)) : Math.max(1, Math.round(distKm * 0.3));
  const freeFlowMins = Math.max(3, Math.round(distKm * 1.6));
  const currentDurationMins = freeFlowMins + delayMins;
  const congestionPercent = isRushHour ? 68 : 34;

  const numPts = 12;
  const primaryCoordinates: [number, number][] = [];
  const bypassCoordinates: [number, number][] = [];

  for (let i = 0; i <= numPts; i++) {
    const t = i / numPts;
    const curve = Math.sin(t * Math.PI) * 0.005;
    primaryCoordinates.push([
      fromCoords.lat + (toCoords.lat - fromCoords.lat) * t + curve,
      fromCoords.lng + (toCoords.lng - fromCoords.lng) * t - curve * 0.8,
    ]);
    const bCurve = -Math.sin(t * Math.PI) * 0.01;
    bypassCoordinates.push([
      fromCoords.lat + (toCoords.lat - fromCoords.lat) * t + bCurve,
      fromCoords.lng + (toCoords.lng - fromCoords.lng) * t + bCurve * 1.1,
    ]);
  }

  const alternativeRoutes: AlternativeRouteOption[] = [
    {
      id: 'route_primary',
      name: 'वर्तमान मुख्य मार्ग (Current Core Route)',
      via: 'मुख्य बाजार व तिराहा',
      distanceKm: distKm,
      durationMins: currentDurationMins,
      delayMins: delayMins,
      timeSavingsMins: 0,
      status: isRushHour ? 'heavy' : 'moderate',
      statusLabel: isRushHour ? `भारी ट्रैफिक (+${delayMins} मि.)` : 'मध्यम गति',
      color: isRushHour ? '#f97316' : '#eab308',
      isRecommended: !isRushHour,
      coordinates: primaryCoordinates,
    },
    {
      id: 'route_bypass',
      name: 'वैकल्पिक आउटर बाईपास (Recommended Outer Bypass)',
      via: 'रिंग रोड / बाईपास चौड़ा मार्ग',
      distanceKm: Math.round(distKm * 1.14 * 10) / 10,
      durationMins: Math.max(3, Math.round(freeFlowMins * 0.95)),
      delayMins: 0,
      timeSavingsMins: Math.max(2, delayMins - 1),
      status: 'light',
      statusLabel: 'जाम-मुक्त (तेज गति)',
      color: '#10b981',
      isRecommended: isRushHour,
      coordinates: bypassCoordinates,
    },
  ];

  return {
    overallStatus: isRushHour ? 'heavy' : 'moderate',
    statusLabelHindi: isRushHour ? 'भारी ट्रैफिक (धीमी गति)' : 'मध्यम ट्रैफिक (सामान्य गति)',
    statusBadgeColor: isRushHour ? '#f97316' : '#eab308',
    averageSpeedKmH: isRushHour ? 19 : 30,
    delayMins,
    congestionPercent,
    totalDistanceKm: distKm,
    currentDurationMins,
    freeFlowDurationMins: freeFlowMins,
    recommendation: isRushHour
      ? `चालक सलाह: मुख्य मार्ग पर +${delayMins} मिनट का जाम है। आउटर बाईपास मार्ग अपनाएं।`
      : 'चालक सलाह: वर्तमान मुख्य मार्ग सामान्य है।',
    bottlenecks: [
      {
        id: 'btn_fallback',
        name: 'मुख्य बाजार व तिराहा',
        lat: (fromCoords.lat + toCoords.lat) / 2,
        lng: (fromCoords.lng + toCoords.lng) / 2,
        severity: isRushHour ? 'heavy' : 'moderate',
        delayMins,
        description: 'सड़क पर स्थानीय दुकानें व धीमी आवाजाही',
      },
    ],
    segments: [
      {
        id: 'seg_1',
        name: 'प्रारंभिक मार्ग',
        status: 'light',
        color: '#10b981',
        speedKmH: 40,
        delayMins: 0,
        coordinates: primaryCoordinates.slice(0, 5),
      },
      {
        id: 'seg_2',
        name: 'मुख्य गलियारा',
        status: isRushHour ? 'heavy' : 'moderate',
        color: isRushHour ? '#f97316' : '#eab308',
        speedKmH: isRushHour ? 15 : 26,
        delayMins,
        coordinates: primaryCoordinates.slice(4, 9),
      },
      {
        id: 'seg_3',
        name: 'अंतिम पहुंच',
        status: 'light',
        color: '#10b981',
        speedKmH: 34,
        delayMins: 0,
        coordinates: primaryCoordinates.slice(8),
      },
    ],
    alternativeRoutes,
    lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}
