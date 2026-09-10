export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AppTab =
  | 'gis-map'
  | 'ai-predict'
  | 'authority-command'
  | 'field-reports'
  | 'data-sources'
  | 'map'
  | 'prediction'
  | 'authority'
  | 'reporting'
  | 'datasources';

export type NerState =
  | 'All NER'
  | 'Assam'
  | 'Meghalaya'
  | 'Sikkim'
  | 'Arunachal Pradesh'
  | 'Nagaland'
  | 'Manipur'
  | 'Mizoram'
  | 'Tripura';

export type SupportedLanguage =
  | 'English'
  | 'Hindi'
  | 'Assamese'
  | 'Bengali'
  | 'Mizo'
  | 'Khasi'
  | 'Nepali';

export interface XAiFeatureContributions {
  rainfallContribution: number; // e.g. 40%
  porePressureContribution: number; // e.g. 28%
  slopeSteepnessContribution: number; // e.g. 20%
  vegetationLossContribution: number; // e.g. 12%
}

export interface RiskZone {
  id: string;
  name: string;
  district: string;
  state: Exclude<NerState, 'All NER'>;
  coordinates: [number, number]; // [lat, lng]
  polygon: [number, number][]; // rough bounding area
  slopeAngleDeg: number;
  soilMoisturePct: number;
  poreWaterPressureKpa: number;
  rainfall24hMm: number;
  rainfall72hMm: number;
  rainfallIntensityMmHr: number;
  sarDisplacementMmYr: number;
  ndviIndex: number;
  demElevationM: number;
  historicalEventsCount: number;
  riskScore: number; // 0 to 100
  riskTier: RiskTier;
  factorOfSafety: number; // < 1.0 means imminent failure
  populationAtRisk: number;
  vulnerableVillages: string[];
  criticalRoadways: string[];
  status: 'STABLE' | 'WATCH' | 'WARNING' | 'EVACUATION';
  xai: XAiFeatureContributions;
  lastAssessedTime: string;
}

export interface IoTSensorNode {
  id: string;
  stationCode: string;
  name: string;
  state: Exclude<NerState, 'All NER'>;
  district: string;
  lat: number;
  lng: number;
  elevationM: number;
  soilMoisturePct: number;
  porePressureKpa: number;
  tiltAngleDeg: number;
  batteryPct: number;
  signalStrength: '4G-LTE' | 'LoRaWAN' | 'Satellite-BGAN';
  status: 'ONLINE' | 'WARNING' | 'ALERT';
  lastTelemetry: string;
}

export interface RoadConnectivity {
  id: string;
  highwayNo: string;
  corridorName: string;
  state: Exclude<NerState, 'All NER'>;
  status: 'OPEN' | 'PARTIALLY_BLOCKED' | 'SEVERELY_CUT' | 'DETOUR_ACTIVE';
  affectedStretchKm: number;
  obstructionType: string;
  clearingEstimatedHours: number;
  detourRouteName: string;
  heavyVehiclesAllowed: boolean;
  emergencyConvoyPassable: boolean;
  lastUpdated: string;
  lat: number;
  lng: number;
}

export interface CitizenReport {
  id: string;
  reporterName: string;
  reporterType: 'CITIZEN' | 'FIELD_OFFICER' | 'BORDER_ROADS' | 'FOREST_RANGER';
  contactPhone: string;
  timestamp: string;
  locationName: string;
  district: string;
  state: Exclude<NerState, 'All NER'>;
  lat: number;
  lng: number;
  incidentType:
    | 'TENSION_CRACK'
    | 'SLOPE_MOVEMENT'
    | 'MUD_FLOW'
    | 'ROAD_OBSTRUCTION'
    | 'ROCKFALL'
    | 'RETAINING_WALL_FAIL';
  crackWidthCm?: number;
  estimatedVolumeM3?: number;
  description: string;
  roadBlocked: boolean;
  photoUrl?: string;
  verificationStatus: 'PENDING' | 'AI_VERIFIED' | 'DISPATCHED' | 'RESOLVED';
  aiSeverity?: RiskTier;
  offlineStored: boolean;
  suggestedAction?: string;
}

export interface EmergencyAlert {
  id: string;
  timestamp: string;
  level: RiskTier;
  title: string;
  state: Exclude<NerState, 'All NER'>;
  district: string;
  affectedRoad: string;
  targetCount: number;
  channels: ('SMS' | 'APP_PUSH' | 'VILLAGE_SIREN' | 'ALL_INDIA_RADIO')[];
  originalEnglish: string;
  translations: Partial<Record<SupportedLanguage, string>>;
  acknowledgedByDDMA: boolean;
}

export interface EmergencyResponseUnit {
  id: string;
  unitName: string;
  forceType: 'NDRF' | 'SDRF' | 'BRO' | 'PWD_QUICK_RESPONSE' | 'ARMY_ENGINEERS';
  stationBase: string;
  state: Exclude<NerState, 'All NER'>;
  personnelCount: number;
  status: 'STANDBY' | 'MOBILIZING' | 'ON_SITE' | 'CLEARING_ROAD';
  equipment: string[];
  assignedZone: string;
  etaMinutes: number;
}

export interface WeatherStationData {
  district: string;
  state: string;
  tempC: number;
  humidityPct: number;
  rainfallCurrentMmHr: number;
  rainfall24hMm: number;
  imdWarningColor: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  forecast24h: string;
}
