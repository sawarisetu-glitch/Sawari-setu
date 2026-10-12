import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Compass,
  Navigation,
  Plus,
  Minus,
  AlertTriangle,
  Zap,
  Split,
  RefreshCw,
  Clock,
  CheckCircle2,
  Gauge,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Radio,
  Play,
  Pause,
  MapPin,
} from 'lucide-react';
import { LiveVehicle, LiveTrafficInfo, AlternativeRouteOption, RideBooking } from '../types';
import { calculateRouteAndDistance } from '../utils/googleMapsService';
import { fetchLiveTrafficConditions } from '../utils/trafficService';
import { getIndianVehicleImage } from '../utils/vehicleAssets';

interface LiveMapProps {
  vehicles: LiveVehicle[];
  pickupCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
  pickupLabel?: string;
  destLabel?: string;
  showPassengerLayer?: boolean;
  showLogisticsLayer?: boolean;
  onSelectVehicle?: (vehicle: LiveVehicle) => void;
  className?: string;
  heightClass?: string;
  interactive?: boolean;
  onLocateUser?: () => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  // Live Traffic Feature Props
  showTrafficOverlay?: boolean;
  tripType?: 'ride' | 'logistics';
  activeTripId?: string;
  onSelectRoute?: (route: AlternativeRouteOption) => void;
  selectedRouteId?: string;
  onTrafficDataLoaded?: (traffic: LiveTrafficInfo) => void;
  // Active Ride Simulated Real-Time Tracking Props
  activeRide?: RideBooking | null;
  activeDriverName?: string;
  activeVehicleNumber?: string;
  activeVehicleType?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  vehicles,
  pickupCoords = { lat: 25.2642, lng: 82.0912 },
  destCoords = { lat: 25.2356, lng: 82.0724 },
  pickupLabel = 'पिकअप स्थान',
  destLabel = 'गंतव्य स्थान',
  showPassengerLayer = true,
  showLogisticsLayer = true,
  onSelectVehicle,
  className = '',
  heightClass = 'h-[320px]',
  interactive = true,
  onLocateUser,
  onMapClick,
  showTrafficOverlay = true,
  tripType = 'ride',
  activeTripId,
  onSelectRoute,
  selectedRouteId,
  onTrafficDataLoaded,
  activeRide,
  activeDriverName,
  activeVehicleNumber,
  activeVehicleType,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficPolylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const bottlenecksLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Simulated Real-Time Vehicle Tracking Refs & Layer
  const trackingLayerRef = useRef<L.LayerGroup | null>(null);
  const trackedMarkerRef = useRef<L.Marker | null>(null);
  const traveledPolylineRef = useRef<L.Polyline | null>(null);
  const trackingIntervalRef = useRef<number | null>(null);
  const waypointsRef = useRef<[number, number][]>([]);
  const simIndexRef = useRef(0);
  const totalDistanceKmRef = useRef(15);
  const totalDurationMinsRef = useRef(20);

  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'dark'>('satellite');
  const [isLocating, setIsLocating] = useState(false);
  const [isTrafficEnabled, setIsTrafficEnabled] = useState<boolean>(showTrafficOverlay);
  const [trafficData, setTrafficData] = useState<LiveTrafficInfo | null>(null);
  const [isTrafficLoading, setIsTrafficLoading] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string>(selectedRouteId || 'route_primary');
  const [isTrafficPanelExpanded, setIsTrafficPanelExpanded] = useState(false);

  // Simulated Real-time Tracking State
  const [isAutoFollow, setIsAutoFollow] = useState(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    speed: number;
    heading: number;
    progressPercent: number;
    distanceRemainingKm: number;
    etaMins: number;
    currentCoords: { lat: number; lng: number } | null;
  }>({
    speed: 38,
    heading: 0,
    progressPercent: 0,
    distanceRemainingKm: 0,
    etaMins: 0,
    currentCoords: null,
  });

  // Sync internal activeRouteId with external selectedRouteId prop
  useEffect(() => {
    if (selectedRouteId) {
      setActiveRouteId(selectedRouteId);
    }
  }, [selectedRouteId]);

  // Fetch live traffic conditions for the corridor
  const loadTraffic = useCallback(async () => {
    if (!pickupCoords || !destCoords) return;
    setIsTrafficLoading(true);
    try {
      const data = await fetchLiveTrafficConditions(pickupCoords, destCoords, tripType);
      setTrafficData(data);
      if (onTrafficDataLoaded) {
        onTrafficDataLoaded(data);
      }
    } catch (err) {
      console.warn('Traffic update failed:', err);
    } finally {
      setIsTrafficLoading(false);
    }
  }, [pickupCoords?.lat, pickupCoords?.lng, destCoords?.lat, destCoords?.lng, tripType, onTrafficDataLoaded]);

  // Initial traffic load & periodic refresh every 25 seconds
  useEffect(() => {
    if (pickupCoords && destCoords && isTrafficEnabled) {
      loadTraffic();
      const timer = setInterval(() => {
        loadTraffic();
      }, 25000);
      return () => clearInterval(timer);
    }
  }, [pickupCoords?.lat, pickupCoords?.lng, destCoords?.lat, destCoords?.lng, isTrafficEnabled, loadTraffic]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = pickupCoords?.lat || 25.2642;
    const defaultLng = pickupCoords?.lng || 82.0912;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    trafficPolylinesLayerRef.current = L.layerGroup().addTo(map);
    bottlenecksLayerRef.current = L.layerGroup().addTo(map);
    trackingLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = '';
    let maxZoom = 19;

    if (mapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    } else if (mapType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      maxZoom = 19;
    } else {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxZoom = 19;
    }

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Render Markers, Vehicles, and Traffic / Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const trafficLayer = trafficPolylinesLayerRef.current;
    const bottlenecksLayer = bottlenecksLayerRef.current;
    if (!map || !markersLayer || !trafficLayer || !bottlenecksLayer) return;

    markersLayer.clearLayers();
    trafficLayer.clearLayers();
    bottlenecksLayer.clearLayers();

    // 1. Add Pickup Marker
    if (pickupCoords) {
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
            <div style="background:#10b981; color:#000; font-weight:900; font-size:10px; padding:3px 7px; border-radius:12px; box-shadow:0 3px 10px rgba(0,0,0,0.6); border:2px solid #fff; white-space:nowrap; margin-bottom:2px;">
              🟢 पिकअप
            </div>
            <div style="width:16px; height:16px; background:#10b981; border:3px solid #fff; border-radius:50%; box-shadow:0 0 12px #10b981;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
        .addTo(markersLayer)
        .bindPopup(`<b>पिकअप:</b><br/>${pickupLabel}`);
    }

    // 2. Add Destination Marker
    if (destCoords) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
            <div style="background:#FF8C00; color:#000; font-weight:900; font-size:10px; padding:3px 7px; border-radius:12px; box-shadow:0 3px 10px rgba(0,0,0,0.6); border:2px solid #fff; white-space:nowrap; margin-bottom:2px;">
              🏁 गंतव्य
            </div>
            <div style="width:16px; height:16px; background:#FF8C00; border:3px solid #fff; border-radius:50%; box-shadow:0 0 12px #FF8C00;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
        .addTo(markersLayer)
        .bindPopup(`<b>गंतव्य:</b><br/>${destLabel}`);
    }

    // 3. Render Vehicles with dynamic icons
    const visibleVehicles = vehicles.filter((v) => {
      if (v.type === 'passenger' && !showPassengerLayer) return false;
      if (v.type === 'logistics' && !showLogisticsLayer) return false;
      return true;
    });

    visibleVehicles.forEach((v) => {
      const isLogistics = v.type === 'logistics';
      const vehicleKey = isLogistics ? 'tata_ace' : v.subType || 'car_4_5';
      const imgSrc = getIndianVehicleImage(vehicleKey);
      const color = isLogistics ? '#06b6d4' : '#f59e0b';

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
            <div style="background:rgba(0,0,0,0.85); color:${color}; font-size:9px; font-weight:800; padding:1px 5px; border-radius:6px; border:1px solid ${color}; white-space:nowrap; margin-bottom:2px;">
              ${v.vehicleNumber.split('-').slice(-2).join('-')}
            </div>
            <div style="width:34px; height:34px; background:#18181b; border:2px solid ${color}; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.7);">
              <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer" alt="${v.subType}" />
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([v.lat, v.lng], { icon: vehicleIcon })
        .addTo(markersLayer)
        .bindPopup(`
          <div style="font-size:12px; color:#18181b; line-height:1.4;">
            <b>${v.driverName}</b> (${v.vehicleNumber})<br/>
            ⭐ <b>${v.rating}</b> | ${v.subType?.toUpperCase() || v.type}<br/>
            📍 ${v.name}
          </div>
        `);

      marker.on('click', () => {
        if (onSelectVehicle) onSelectVehicle(v);
      });
    });

    // 4. Render Route & Live Traffic Flow
    if (pickupCoords && destCoords) {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      // If Live Traffic is Enabled and Traffic Data is ready
      if (isTrafficEnabled && trafficData) {
        const altRoutes = trafficData.alternativeRoutes || [];
        const bypassRoute = altRoutes.find((r) => r.id === 'route_bypass');

        // Draw alternative bypass route line if not active
        if (bypassRoute && activeRouteId !== 'route_bypass') {
          const bypassPts = bypassRoute.coordinates.map((pt) => [pt[0], pt[1]] as [number, number]);
          const altPolyline = L.polyline(bypassPts, {
            color: '#06b6d4',
            weight: 4,
            opacity: 0.65,
            dashArray: '6, 8',
            lineCap: 'round',
          }).addTo(trafficLayer);

          altPolyline.bindTooltip(
            `<b>${bypassRoute.name}</b><br/>जाम-मुक्त (${bypassRoute.timeSavingsMins} मिनट की बचत) - टैप कर चुनें`,
            { sticky: true }
          );

          altPolyline.on('click', () => {
            setActiveRouteId('route_bypass');
            if (onSelectRoute) onSelectRoute(bypassRoute);
          });
        }

        // Draw active chosen route:
        if (activeRouteId === 'route_bypass' && bypassRoute) {
          // Driver has chosen the faster bypass route!
          const bypassPts = bypassRoute.coordinates.map((pt) => [pt[0], pt[1]] as [number, number]);
          // Underlying glowing route line
          L.polyline(bypassPts, {
            color: '#000000',
            weight: 8,
            opacity: 0.7,
            lineCap: 'round',
          }).addTo(trafficLayer);

          const activePolyline = L.polyline(bypassPts, {
            color: '#10b981', // Clean green flow
            weight: 6,
            opacity: 0.95,
            dashArray: '10, 6',
            lineCap: 'round',
          }).addTo(trafficLayer);

          activePolyline.bindPopup(`
            <div style="font-size:12px; line-height:1.4;">
              <b style="color:#10b981;">✅ अनुशंसित तेज बाईपास (Active Bypass Route)</b><br/>
              मार्ग: ${bypassRoute.via}<br/>
              दूरी: ${bypassRoute.distanceKm} किमी | समय: ${bypassRoute.durationMins} मिनट<br/>
              <span style="color:#059669; font-weight:bold;">${bypassRoute.timeSavingsMins} मिनट की बचत</span>
            </div>
          `);
        } else {
          // Render multi-colored traffic segments for primary route
          const segments = trafficData.segments || [];
          segments.forEach((seg) => {
            if (!seg.coordinates || seg.coordinates.length < 2) return;
            const pts = seg.coordinates.map((pt) => [pt[0], pt[1]] as [number, number]);

            // Dark border glow underneath
            L.polyline(pts, {
              color: '#000000',
              weight: 8,
              opacity: 0.75,
              lineCap: 'round',
            }).addTo(trafficLayer);

            // Traffic colored top line
            const segLine = L.polyline(pts, {
              color: seg.color,
              weight: 6,
              opacity: 0.95,
              lineCap: 'round',
            }).addTo(trafficLayer);

            const statusText =
              seg.status === 'light'
                ? '🟢 सुचारू (Free Flow)'
                : seg.status === 'moderate'
                ? '🟡 मध्यम (Slow)'
                : '🔴 भारी जाम (Heavy Congestion)';

            segLine.bindTooltip(
              `<b>${seg.name}</b><br/>${statusText}<br/>गति: ~${seg.speedKmH} किमी/घंटा`,
              { sticky: true }
            );
          });
        }

        // 5. Draw Bottlenecks on the map
        if (trafficData.bottlenecks && trafficData.bottlenecks.length > 0) {
          trafficData.bottlenecks.forEach((btn) => {
            const btnColor = btn.severity === 'severe' ? '#ef4444' : btn.severity === 'heavy' ? '#f97316' : '#eab308';
            const bottleneckIcon = L.divIcon({
              className: 'custom-bottleneck-marker',
              html: `
                <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
                  <div style="background:rgba(20,20,20,0.92); color:${btnColor}; font-size:9px; font-weight:800; padding:2px 6px; border-radius:8px; border:1px solid ${btnColor}; box-shadow:0 2px 8px rgba(0,0,0,0.7); white-space:nowrap; margin-bottom:2px; display:flex; items-center; gap:3px;">
                    ⚠️ +${btn.delayMins}m
                  </div>
                  <div style="width:18px; height:18px; background:${btnColor}; border:2px solid #fff; border-radius:50%; box-shadow:0 0 10px ${btnColor}; display:flex; align-items:center; justify-content:center; color:#000; font-size:10px; font-weight:900;">
                    !
                  </div>
                </div>
              `,
              iconSize: [0, 0],
            });

            L.marker([btn.lat, btn.lng], { icon: bottleneckIcon })
              .addTo(bottlenecksLayer)
              .bindPopup(`
                <div style="font-size:12px; line-height:1.4; color:#18181b;">
                  <b style="color:${btnColor};">⚠️ ट्रैफिक रुकावट (Bottleneck):</b><br/>
                  <b>${btn.name}</b><br/>
                  विलंब: <b>+${btn.delayMins} मिनट</b><br/>
                  ${btn.description}
                </div>
              `);
          });
        }

        // Auto fit map bounds
        const bounds = L.latLngBounds([
          [pickupCoords.lat, pickupCoords.lng],
          [destCoords.lat, destCoords.lng],
        ]);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
      } else {
        // Fallback default single route polyline
        calculateRouteAndDistance(pickupCoords, destCoords).then((route) => {
          if (!mapInstanceRef.current) return;
          const latLngs = route.overviewPath.map((p) => [p.lat, p.lng] as [number, number]);

          if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
          }

          const polyline = L.polyline(latLngs, {
            color: '#FF8C00',
            weight: 5,
            opacity: 0.9,
            dashArray: '8, 8',
            lineCap: 'round',
          }).addTo(map);

          routePolylineRef.current = polyline;

          const bounds = L.latLngBounds([
            [pickupCoords.lat, pickupCoords.lng],
            [destCoords.lat, destCoords.lng],
          ]);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        });
      }
    } else if (pickupCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 14);
    }
  }, [
    vehicles,
    pickupCoords?.lat,
    pickupCoords?.lng,
    destCoords?.lat,
    destCoords?.lng,
    pickupLabel,
    destLabel,
    showPassengerLayer,
    showLogisticsLayer,
    isTrafficEnabled,
    trafficData,
    activeRouteId,
  ]);

  // -------------------------------------------------------------
  // Simulated Real-Time Vehicle Tracking (Active Ride Session)
  // -------------------------------------------------------------
  const effectiveDriverName =
    activeRide?.driverName ||
    activeDriverName ||
    (tripType === 'logistics' ? 'सुरेश कुमार (पिकअप पार्टनर)' : 'राम किशोर शुक्ल');
  const effectiveVehicleNumber =
    activeRide?.vehicleNumber ||
    activeVehicleNumber ||
    (tripType === 'logistics' ? 'UP 70 AT 8932' : 'UP 70 BK 4821');
  const effectiveVehicleMode =
    activeRide?.mode ||
    activeVehicleType ||
    (tripType === 'logistics' ? 'tata_ace' : 'car_4_5');

  const trackedVehicleEmoji =
    tripType === 'logistics'
      ? '🚚'
      : effectiveVehicleMode === 'bike'
      ? '🏍️'
      : effectiveVehicleMode === 'auto' || effectiveVehicleMode.includes('erickshaw')
      ? '🛺'
      : effectiveVehicleMode === 'suv'
      ? '🚙'
      : effectiveVehicleMode === 'walker'
      ? '🏃'
      : '🚗';

  // Helper to generate dense waypoints along route
  const generateDensePath = useCallback(
    (
      pickup: { lat: number; lng: number },
      dest: { lat: number; lng: number },
      overviewPath?: { lat: number; lng: number }[],
      steps = 60
    ): [number, number][] => {
      if (overviewPath && overviewPath.length >= 2) {
        const raw: [number, number][] = overviewPath.map((p) => [p.lat, p.lng]);
        const res: [number, number][] = [];
        const stepCount = Math.max(1, Math.floor(steps / (raw.length - 1)));
        for (let i = 0; i < raw.length - 1; i++) {
          const p1 = raw[i];
          const p2 = raw[i + 1];
          for (let s = 0; s < stepCount; s++) {
            const t = s / stepCount;
            res.push([p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t]);
          }
        }
        res.push(raw[raw.length - 1]);
        return res;
      }

      // Natural curved fallback path between pickup and destination
      const res: [number, number][] = [];
      const midLat = (pickup.lat + dest.lat) / 2 + 0.003;
      const midLng = (pickup.lng + dest.lng) / 2 - 0.0035;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat =
          (1 - t) * (1 - t) * pickup.lat + 2 * (1 - t) * t * midLat + t * t * dest.lat;
        const lng =
          (1 - t) * (1 - t) * pickup.lng + 2 * (1 - t) * t * midLng + t * t * dest.lng;
        res.push([lat, lng]);
      }
      return res;
    },
    []
  );

  // Bearing angle calculation in degrees (0 - 360)
  const calculateBearingAngle = useCallback((p1: [number, number], p2: [number, number]): number => {
    const dLng = (p2[1] - p1[1]) * (Math.PI / 180);
    const lat1 = p1[0] * (Math.PI / 180);
    const lat2 = p2[0] * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return Math.round((Math.atan2(y, x) * (180 / Math.PI) + 360) % 360);
  }, []);

  // Custom DivIcon for the live animated tracked vehicle
  const createTrackedVehicleDivIcon = useCallback(
    (heading: number, speed: number, plate: string, vehicleModeKey: string) => {
      const imgSrc = getIndianVehicleImage(vehicleModeKey);
      return L.divIcon({
        className: 'custom-live-tracked-vehicle',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer; pointer-events:auto;">
            <!-- Live Vehicle Top Badge -->
            <div style="background:rgba(18,18,20,0.95); color:#FF8C00; font-size:9.5px; font-weight:900; padding:2px 7px; border-radius:12px; border:1.5px solid #FF8C00; box-shadow:0 4px 12px rgba(0,0,0,0.85); white-space:nowrap; margin-bottom:3px; display:flex; align-items:center; gap:4px; backdrop-filter:blur(6px);">
              <span style="width:6px; height:6px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 6px #10b981;"></span>
              <span>${plate} • ${speed} km/h</span>
            </div>
            <!-- Concentric Pulsing Radar Waves -->
            <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
              <div style="position:absolute; inset:0; border-radius:50%; background:rgba(255,140,0,0.25); border:2px solid #FF8C00; animation:trackedRadarWave 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position:absolute; inset:6px; border-radius:50%; background:rgba(255,140,0,0.35);"></div>
              <!-- Inner Vehicle Pod Rotating with Heading Angle -->
              <div style="width:34px; height:34px; border-radius:50%; background:#121215; border:2.5px solid #FF8C00; box-shadow:0 0 16px rgba(255,140,0,0.95); overflow:hidden; display:flex; align-items:center; justify-content:center; transform:rotate(${heading}deg); transition:transform 0.4s ease-out;">
                <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer" />
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
    },
    []
  );

  // Simulated Real-Time Vehicle Tracking Timer Effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    const trackingLayer = trackingLayerRef.current;
    const isSessionActive = Boolean(activeTripId || activeRide);

    if (!isSessionActive || !map || !trackingLayer || !pickupCoords || !destCoords) {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      trackingLayer?.clearLayers();
      trackedMarkerRef.current = null;
      traveledPolylineRef.current = null;
      return;
    }

    let isSubscribed = true;

    calculateRouteAndDistance(pickupCoords, destCoords)
      .then((route) => {
        if (!isSubscribed || !mapInstanceRef.current || !trackingLayerRef.current) return;

        const totalKm = route.distanceKm || 15;
        const totalMins = route.durationMins || 20;
        totalDistanceKmRef.current = totalKm;
        totalDurationMinsRef.current = totalMins;

        const pathPoints = generateDensePath(pickupCoords, destCoords, route.overviewPath, 65);
        waypointsRef.current = pathPoints;

        if (pathPoints.length < 2) return;

        let idx = simIndexRef.current % pathPoints.length;
        const startPt = pathPoints[idx];
        const nextPt = pathPoints[(idx + 1) % pathPoints.length];
        const initialBearing = calculateBearingAngle(startPt, nextPt);

        // Create or update Tracked Vehicle Marker
        if (!trackedMarkerRef.current) {
          trackedMarkerRef.current = L.marker([startPt[0], startPt[1]], {
            icon: createTrackedVehicleDivIcon(
              initialBearing,
              38,
              effectiveVehicleNumber,
              effectiveVehicleMode
            ),
            zIndexOffset: 1500,
          }).addTo(trackingLayerRef.current);

          trackedMarkerRef.current.bindPopup(`
            <div style="font-size:12px; line-height:1.45; color:#18181b; min-width:180px;">
              <b style="color:#FF8C00; font-size:13px;">🔴 लाइव वाहन ट्रैकिंग (GPS Live)</b><br/>
              चालक: <b>${effectiveDriverName}</b><br/>
              गाड़ी: <b>${effectiveVehicleNumber}</b> (${effectiveVehicleMode.toUpperCase()})<br/>
              स्थिति: <b style="color:#10b981;">गंतव्य की ओर सक्रिय (In Transit)</b>
            </div>
          `);
        }

        // Create or update Covered Polyline Trail (emerald green)
        if (!traveledPolylineRef.current) {
          traveledPolylineRef.current = L.polyline(pathPoints.slice(0, idx + 1), {
            color: '#10b981',
            weight: 6,
            opacity: 0.95,
            lineCap: 'round',
          }).addTo(trackingLayerRef.current);
        }

        // Initialize telemetry
        setTelemetry({
          speed: 38,
          heading: initialBearing,
          progressPercent: Math.round((idx / pathPoints.length) * 100),
          distanceRemainingKm: Math.max(0.1, Math.round(totalKm * (1 - idx / pathPoints.length) * 10) / 10),
          etaMins: Math.max(1, Math.round(totalMins * (1 - idx / pathPoints.length))),
          currentCoords: { lat: startPt[0], lng: startPt[1] },
        });

        // Clear existing interval before starting a fresh one
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
        }

        // Live Simulation Timer (Ticks every 1200ms)
        trackingIntervalRef.current = window.setInterval(() => {
          if (!mapInstanceRef.current || !trackingLayerRef.current || isSimulationPaused) return;

          idx = (idx + 1) % pathPoints.length;
          simIndexRef.current = idx;

          const currentPoint = pathPoints[idx];
          const forwardPoint = pathPoints[(idx + 1) % pathPoints.length];
          const heading = calculateBearingAngle(currentPoint, forwardPoint);
          const speed = Math.round(35 + Math.sin(idx * 0.4) * 7);
          const progress = idx / pathPoints.length;
          const remainingKm = Math.max(0.1, Math.round(totalKm * (1 - progress) * 10) / 10);
          const remainingMins = Math.max(1, Math.round(totalMins * (1 - progress)));

          // Smoothly glide tracked vehicle marker
          if (trackedMarkerRef.current) {
            trackedMarkerRef.current.setLatLng([currentPoint[0], currentPoint[1]]);
            trackedMarkerRef.current.setIcon(
              createTrackedVehicleDivIcon(heading, speed, effectiveVehicleNumber, effectiveVehicleMode)
            );
          }

          // Update covered breadcrumb trail
          if (traveledPolylineRef.current) {
            traveledPolylineRef.current.setLatLngs(pathPoints.slice(0, idx + 1));
          }

          // Auto-follow vehicle if enabled by user
          if (isAutoFollow && mapInstanceRef.current) {
            mapInstanceRef.current.panTo([currentPoint[0], currentPoint[1]], {
              animate: true,
              duration: 0.8,
            });
          }

          // Update real-time telemetry state for on-map HUD
          setTelemetry({
            speed,
            heading,
            progressPercent: Math.round(progress * 100),
            distanceRemainingKm: remainingKm,
            etaMins: remainingMins,
            currentCoords: { lat: currentPoint[0], lng: currentPoint[1] },
          });
        }, 1200);
      })
      .catch((err) => {
        console.warn('Simulated tracking route calculation failed:', err);
      });

    return () => {
      isSubscribed = false;
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, [
    activeTripId,
    activeRide?.id,
    effectiveDriverName,
    effectiveVehicleNumber,
    effectiveVehicleMode,
    trackedVehicleEmoji,
    pickupCoords?.lat,
    pickupCoords?.lng,
    destCoords?.lat,
    destCoords?.lng,
    isSimulationPaused,
    isAutoFollow,
    generateDensePath,
    calculateBearingAngle,
    createTrackedVehicleDivIcon,
  ]);

  // Handle locating user
  const handleLocateMe = () => {
    setIsLocating(true);
    if (onLocateUser) {
      onLocateUser();
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const map = mapInstanceRef.current;
          if (map) {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
          }
        },
        () => {
          setIsLocating(false);
          const map = mapInstanceRef.current;
          if (map && pickupCoords) {
            map.flyTo([pickupCoords.lat, pickupCoords.lng], 14);
          }
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Alternative route selection handler
  const handleSelectAlternativeRoute = (route: AlternativeRouteOption) => {
    setActiveRouteId(route.id);
    if (onSelectRoute) {
      onSelectRoute(route);
    }
  };

  const recommendedRoute = trafficData?.alternativeRoutes?.find((r) => r.id === 'route_bypass');
  const isBypassActive = activeRouteId === 'route_bypass';

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl select-none ${className}`}
    >
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-zinc-950" />

      {/* Radar Wave Pulse Animation Styles */}
      <style>{`
        @keyframes trackedRadarWave {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Real-time Vehicle Tracking Overlay (During Active Ride Session) */}
      {(activeTripId || activeRide) && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs md:max-w-sm z-20 bg-zinc-950/95 backdrop-blur-md p-3 rounded-2xl border-2 border-amber-500 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
          {/* Top Status Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                लाइव वाहन ट्रैकिंग (GPS Active)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Recenter / Follow Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAutoFollow(!isAutoFollow);
                  if (telemetry.currentCoords && mapInstanceRef.current) {
                    mapInstanceRef.current.panTo([
                      telemetry.currentCoords.lat,
                      telemetry.currentCoords.lng,
                    ], { animate: true });
                  }
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isAutoFollow
                    ? 'bg-emerald-500 text-black shadow-sm font-black'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750'
                }`}
                title="वाहन के साथ नक्शा चलाएं (Auto-Follow)"
              >
                <Crosshair className="w-3 h-3" />
                <span>{isAutoFollow ? 'फॉलो चालू' : 'फोकस'}</span>
              </button>

              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={() => setIsSimulationPaused(!isSimulationPaused)}
                className="p-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition-all cursor-pointer"
                title={isSimulationPaused ? 'ट्रैकिंग फिर शुरू करें' : 'ट्रैकिंग रोकें'}
              >
                {isSimulationPaused ? (
                  <Play className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Pause className="w-3 h-3 text-amber-400" />
                )}
              </button>
            </div>
          </div>

          {/* Telemetry Stats: Speed, Remaining Dist, ETA */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-amber-400 font-mono font-black text-xs block">
                {telemetry.speed} km/h
              </span>
              <span className="text-zinc-400 text-[9px]">लाइव गति</span>
            </div>
            <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-emerald-400 font-mono font-black text-xs block">
                {telemetry.distanceRemainingKm} किमी
              </span>
              <span className="text-zinc-400 text-[9px]">शेष दूरी</span>
            </div>
            <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-cyan-400 font-mono font-black text-xs block">
                ~{telemetry.etaMins} मिनट
              </span>
              <span className="text-zinc-400 text-[9px]">ETA समय</span>
            </div>
          </div>

          {/* Route Progress Bar */}
          <div>
            <div className="flex justify-between text-[9px] text-zinc-400 mb-0.5 font-bold">
              <span>यात्रा प्रगति (Trip Progress)</span>
              <span className="text-amber-400 font-mono">{telemetry.progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(6, telemetry.progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Assigned Driver & Vehicle Details Footer */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-850">
            <span className="truncate">
              चालक: <strong className="text-white">{effectiveDriverName}</strong>
            </span>
            <span className="font-mono font-bold text-amber-400 shrink-0">
              {effectiveVehicleNumber}
            </span>
          </div>
        </div>
      )}

      {/* Top Left: Live Status Tag & Traffic Pill (When not in active ride session) */}
      {!(activeTripId || activeRide) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800 text-[11px] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3"></span>
            <span className="font-extrabold text-white">सवारी सेतु लाइव जीपीएस</span>
          </div>

          {/* Live Traffic Indicator Pill */}
          {isTrafficEnabled && trafficData && (
            <div
              onClick={() => setIsTrafficPanelExpanded(!isTrafficPanelExpanded)}
              className="flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-750 text-[10px] shadow-lg cursor-pointer hover:border-amber-500/50 transition-all"
              title="ट्रैफिक विवरण देखें"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: trafficData.statusBadgeColor }}
              />
              <span className="font-extrabold text-white">
                {trafficData.overallStatus === 'light'
                  ? '🟢 मार्ग सुचारू'
                  : trafficData.overallStatus === 'moderate'
                  ? '🟡 मध्यम ट्रैफिक'
                  : '🔴 भारी जाम (+ ' + trafficData.delayMins + ' मि.)'}
              </span>
              <span className="text-zinc-400 font-mono text-[9px]">
                {trafficData.averageSpeedKmH} km/h
              </span>
              {isTrafficPanelExpanded ? (
                <ChevronUp className="w-3 h-3 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Top Right: Layer & Live Traffic Switcher */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-zinc-800 shadow-lg text-[10px] font-bold">
        {/* Live Traffic Toggle Button */}
        <button
          type="button"
          onClick={() => setIsTrafficEnabled(!isTrafficEnabled)}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
            isTrafficEnabled
              ? 'bg-amber-500 text-black shadow-md font-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="लाइव ट्रैफिक परत चालू/बंद करें"
        >
          <span className="text-[12px]">🚦</span>
          <span>ट्रैफिक {isTrafficEnabled ? 'चालू' : 'बंद'}</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2 py-1 rounded-lg transition-all ${
            mapType === 'satellite' ? 'bg-[#FF8C00] text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          सैटेलाइट
        </button>
        <button
          type="button"
          onClick={() => setMapType('streets')}
          className={`px-2 py-1 rounded-lg transition-all ${
            mapType === 'streets' ? 'bg-[#FF8C00] text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          सड़क
        </button>
        <button
          type="button"
          onClick={() => setMapType('dark')}
          className={`px-2 py-1 rounded-lg transition-all ${
            mapType === 'dark' ? 'bg-[#FF8C00] text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          डार्क
        </button>
      </div>

      {/* Bottom Right: Zoom & My Location & Refresh Buttons */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
        {isTrafficEnabled && (
          <button
            type="button"
            onClick={loadTraffic}
            title="ट्रैफिक डेटा रीफ्रेश करें"
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-800 shadow-xl transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isTrafficLoading ? 'animate-spin' : ''}`} />
          </button>
        )}

        <button
          type="button"
          onClick={handleLocateMe}
          title="मेरी लोकेशन पर जाएं"
          className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-[#FF8C00] hover:text-black text-amber-400 border border-zinc-800 shadow-xl transition-all active:scale-95"
        >
          <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-800 shadow-xl transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-800 shadow-xl transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Traffic Route Advisory Banner (Bottom-Left & Center) */}
      {isTrafficEnabled && trafficData && pickupCoords && destCoords && (
        <div className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-80px)] sm:max-w-md bg-black/90 backdrop-blur-md p-2.5 rounded-2xl border border-zinc-800 text-zinc-300 shadow-2xl space-y-2">
          {/* Top line with live status & speed */}
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: trafficData.statusBadgeColor }}
              />
              <span className="font-extrabold text-white">
                {trafficData.statusLabelHindi}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" />
                {trafficData.averageSpeedKmH} km/h
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                {trafficData.delayMins > 0 ? `+${trafficData.delayMins}m विलंब` : 'समय पर'}
              </span>
            </div>
          </div>

          {/* Better Alternative Route Chooser for Drivers */}
          {recommendedRoute && (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-[10px]">
              <div className="truncate flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">
                  {isBypassActive ? (
                    <strong className="text-emerald-400">
                      ✓ आउटर बाईपास सक्रिय ({recommendedRoute.timeSavingsMins} मि. बचत)
                    </strong>
                  ) : (
                    <span>
                      <strong className="text-cyan-400">तेज विकल्प:</strong> बाईपास मार्ग (
                      <span className="text-emerald-400 font-bold">
                        {recommendedRoute.timeSavingsMins} मिनट की बचत
                      </span>
                      )
                    </span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSelectAlternativeRoute(
                    isBypassActive
                      ? trafficData.alternativeRoutes[0]
                      : recommendedRoute
                  )
                }
                className={`px-2.5 py-1 rounded-lg font-bold text-[9px] shrink-0 transition-all shadow-md active:scale-95 ${
                  isBypassActive
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-emerald-500/20'
                }`}
              >
                {isBypassActive ? 'मुख्य मार्ग पर लौटें' : 'बाईपास चुनें ⚡'}
              </button>
            </div>
          )}

          {/* Expanded Traffic Details (When user taps pill or expand) */}
          {isTrafficPanelExpanded && (
            <div className="space-y-1.5 pt-1 border-t border-zinc-800 text-[10px] animate-in fade-in duration-200">
              <p className="text-amber-300/90 leading-tight">
                💡 {trafficData.recommendation}
              </p>
              {trafficData.freightNotice && (
                <p className="text-cyan-400/90 leading-tight">
                  🚚 {trafficData.freightNotice}
                </p>
              )}
              {trafficData.bottlenecks.length > 0 && (
                <div className="text-[9px] text-zinc-400 flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-zinc-500">जाम बिंदु:</span>
                  {trafficData.bottlenecks.map((b) => (
                    <span
                      key={b.id}
                      className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-300"
                    >
                      ⚠️ {b.name} (+{b.delayMins}m)
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Route Label Summary (When traffic overlay is turned off) */}
      {!isTrafficEnabled && pickupCoords && destCoords && (
        <div className="absolute bottom-3 left-3 z-10 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px] text-zinc-300 shadow-lg flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#FF8C00]" />
          <span>
            <b>रूट:</b> {pickupLabel.split(',')[0]} → {destLabel.split(',')[0]}
          </span>
        </div>
      )}
    </div>
  );
};
