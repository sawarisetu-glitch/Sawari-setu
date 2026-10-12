// Authentic Indian Vehicle Asset Mapping for Sawari Setu
// Real Indian Vehicles: Commuter Bike Taxi, Green & Yellow Bajaj CNG Auto, Indian E-Rickshaw Toto, Dzire Cab, Ertiga SUV, Tata Ace Chhota Hathi

export const INDIAN_VEHICLE_IMAGES = {
  bike: '/src/assets/images/indian_bike_taxi_1791805763841.jpg',
  auto: '/src/assets/images/indian_auto_rickshaw_1791805774927.jpg',
  erickshaw: '/src/assets/images/indian_erickshaw_toto_1791805785043.jpg',
  erickshaw_share: '/src/assets/images/indian_erickshaw_toto_1791805785043.jpg',
  erickshaw_direct: '/src/assets/images/indian_erickshaw_toto_1791805785043.jpg',
  car_4_5: '/src/assets/images/indian_cab_car_1791805794913.jpg',
  car_6_7: '/src/assets/images/indian_suv_taxi_1791805808023.jpg',
  suv: '/src/assets/images/indian_suv_taxi_1791805808023.jpg',
  tata_ace: '/src/assets/images/indian_chhota_hathi_1791805871540.jpg',
  logistics: '/src/assets/images/indian_chhota_hathi_1791805871540.jpg',
} as const;

export type VehicleImageKey = keyof typeof INDIAN_VEHICLE_IMAGES;

/**
 * Get authentic Indian vehicle image path with fallback
 */
export function getIndianVehicleImage(key: string): string {
  if (key in INDIAN_VEHICLE_IMAGES) {
    return INDIAN_VEHICLE_IMAGES[key as VehicleImageKey];
  }
  if (key.includes('bike') || key.includes('moto')) return INDIAN_VEHICLE_IMAGES.bike;
  if (key.includes('auto') || key.includes('rickshaw')) return INDIAN_VEHICLE_IMAGES.auto;
  if (key.includes('erickshaw') || key.includes('toto')) return INDIAN_VEHICLE_IMAGES.erickshaw;
  if (key.includes('suv') || key.includes('6_7')) return INDIAN_VEHICLE_IMAGES.suv;
  if (key.includes('car') || key.includes('cab') || key.includes('sedan')) return INDIAN_VEHICLE_IMAGES.car_4_5;
  if (key.includes('tata') || key.includes('truck') || key.includes('freight') || key.includes('logistics')) return INDIAN_VEHICLE_IMAGES.tata_ace;
  return INDIAN_VEHICLE_IMAGES.car_4_5;
}
