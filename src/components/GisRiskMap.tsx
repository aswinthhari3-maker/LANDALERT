import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Activity,
  AlertTriangle,
  Radio,
  MapPin,
  TrendingUp,
  Shield,
  Eye,
  Info,
  Car,
  Compass,
  Zap,
} from 'lucide-react';
import { RiskZone, IoTSensorNode, RoadConnectivity, CitizenReport, NerState } from '../types';

interface GisRiskMapProps {
  selectedState: NerState;
  riskZones?: RiskZone[];
  sensors?: IoTSensorNode[];
  roads?: RoadConnectivity[];
  citizenReports?: CitizenReport[];
  reports?: CitizenReport[];
  selectedZone?: RiskZone | null;
  onSelectZone?: (zone: RiskZone) => void;
  onSelectRoad?: (road: RoadConnectivity) => void;
  onSimulateZone?: (zone: RiskZone) => void;
  onOpenBroadcastModal?: () => void;
  onOpenAdvisoryModal?: () => void;
  onOpenReportModalWithCoords?: (coords: { lat: number; lng: number }) => void;
}

export const GisRiskMap: React.FC<GisRiskMapProps> = ({
  selectedState,
  riskZones = [],
  sensors = [],
  roads = [],
  citizenReports,
  reports,
  selectedZone,
  onSelectZone,
  onSelectRoad,
  onSimulateZone,
  onOpenBroadcastModal,
  onOpenAdvisoryModal,
  onOpenReportModalWithCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    zones?: L.LayerGroup;
    sensors?: L.LayerGroup;
    roads?: L.LayerGroup;
    reports?: L.LayerGroup;
    sarOverlay?: L.LayerGroup;
  }>({});

  const [mapStyle, setMapStyle] = useState<'dark' | 'topo' | 'satellite'>('dark');
  const [showZones, setShowZones] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showSarSimulation, setShowSarSimulation] = useState(false);
  const [activeInspectorItem, setActiveInspectorItem] = useState<{
    type: 'zone' | 'sensor' | 'road' | 'report';
    data: any;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Default center for North East India
    const map = L.map(mapContainerRef.current, {
      center: [25.8, 92.8],
      zoom: 7,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Click handler on map to add geo-tagged field report
    map.on('click', (e) => {
      if (onOpenReportModalWithCoords) {
        // Can be tapped by user
      }
    });

    mapInstanceRef.current = map;

    // Create Layer Groups
    layerGroupsRef.current.zones = L.layerGroup().addTo(map);
    layerGroupsRef.current.sensors = L.layerGroup().addTo(map);
    layerGroupsRef.current.roads = L.layerGroup().addTo(map);
    layerGroupsRef.current.reports = L.layerGroup().addTo(map);
    layerGroupsRef.current.sarOverlay = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a>';

    if (mapStyle === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap contributors';
    } else if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri &mdash; Earthstar Geographics';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
    }).addTo(map);
  }, [mapStyle]);

  const allReports = citizenReports || reports || [];

  // Filter items by state if needed
  const filteredZones = (selectedState === 'All NER'
    ? riskZones
    : riskZones.filter((z) => z.state === selectedState)) || [];

  const filteredSensors = (selectedState === 'All NER'
    ? sensors
    : sensors.filter((s) => s.state === selectedState)) || [];

  const filteredRoads = (selectedState === 'All NER'
    ? roads
    : roads.filter((r) => r.state === selectedState)) || [];

  const filteredReports = (selectedState === 'All NER'
    ? allReports
    : allReports.filter((rep) => rep.state === selectedState)) || [];

  // Pan to selected state center if single state is picked
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedState === 'All NER') {
      map.setView([25.8, 92.8], 7);
    } else if (filteredZones.length > 0) {
      map.setView(filteredZones[0].coordinates, 8);
    }
  }, [selectedState]);

  // Render Risk Zones Layer
  useEffect(() => {
    const lg = layerGroupsRef.current.zones;
    if (!lg) return;
    lg.clearLayers();

    if (!showZones) return;

    filteredZones.forEach((zone) => {
      const color =
        zone.riskTier === 'CRITICAL'
          ? '#ef4444'
          : zone.riskTier === 'HIGH'
          ? '#f97316'
          : zone.riskTier === 'MEDIUM'
          ? '#eab308'
          : '#10b981';

      // Polygon polygon
      const polygon = L.polygon(zone.polygon, {
        color: color,
        fillColor: color,
        fillOpacity: zone.riskTier === 'CRITICAL' ? 0.45 : 0.3,
        weight: 2.5,
        dashArray: zone.riskTier === 'CRITICAL' ? '4, 4' : undefined,
      });

      polygon.on('click', () => {
        setActiveInspectorItem({ type: 'zone', data: zone });
        if (onSelectZone) onSelectZone(zone);
      });

      polygon.bindTooltip(
        `<div class="text-xs font-semibold p-1">
          <div class="text-slate-900 font-bold">${zone.name}</div>
          <div class="text-[10px] text-slate-700">${zone.district}, ${zone.state}</div>
          <div class="text-[10px] mt-0.5 font-mono">Risk: <b style="color:${color}">${zone.riskScore}/100 (${zone.riskTier})</b></div>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      polygon.addTo(lg);

      // Centered pulsing circle marker
      const centerMarker = L.circleMarker(zone.coordinates, {
        radius: zone.riskTier === 'CRITICAL' ? 12 : 9,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      });

      centerMarker.on('click', () => {
        setActiveInspectorItem({ type: 'zone', data: zone });
        onSelectZone(zone);
      });

      centerMarker.addTo(lg);
    });
  }, [filteredZones, showZones]);

  // Render IoT Sensors Layer
  useEffect(() => {
    const lg = layerGroupsRef.current.sensors;
    if (!lg) return;
    lg.clearLayers();

    if (!showSensors) return;

    filteredSensors.forEach((sensor) => {
      const sensorColor =
        sensor.status === 'ALERT'
          ? '#ef4444'
          : sensor.status === 'WARNING'
          ? '#f59e0b'
          : '#10b981';

      const sensorHtml = `
        <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background-color:${sensorColor}; opacity:0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:14px; height:14px; border-radius:50%; background-color:${sensorColor}; border:2px solid #ffffff; box-shadow:0 0 8px ${sensorColor};"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-sensor-icon',
        html: sensorHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([sensor.lat, sensor.lng], { icon });

      marker.on('click', () => {
        setActiveInspectorItem({ type: 'sensor', data: sensor });
      });

      marker.bindTooltip(
        `<div class="text-xs p-1">
          <div class="font-bold text-slate-900">${sensor.name}</div>
          <div class="text-[10px] text-slate-700">${sensor.stationCode} • ${sensor.district}</div>
          <div class="text-[10px] font-mono mt-1">Pore Pressure: <b>${sensor.porePressureKpa} kPa</b></div>
          <div class="text-[10px] font-mono">Soil Moisture: <b>${sensor.soilMoisturePct}%</b></div>
        </div>`,
        { sticky: true }
      );

      marker.addTo(lg);
    });
  }, [filteredSensors, showSensors]);

  // Render Roads Layer
  useEffect(() => {
    const lg = layerGroupsRef.current.roads;
    if (!lg) return;
    lg.clearLayers();

    if (!showRoads) return;

    filteredRoads.forEach((road) => {
      const statusColor =
        road.status === 'SEVERELY_CUT'
          ? '#ef4444'
          : road.status === 'PARTIALLY_BLOCKED'
          ? '#f97316'
          : road.status === 'DETOUR_ACTIVE'
          ? '#0ea5e9'
          : '#10b981';

      // Road indicator circle
      const marker = L.circleMarker([road.lat, road.lng], {
        radius: 8,
        color: '#ffffff',
        fillColor: statusColor,
        fillOpacity: 0.95,
        weight: 2,
      });

      marker.on('click', () => {
        setActiveInspectorItem({ type: 'road', data: road });
        if (onSelectRoad) onSelectRoad(road);
      });

      marker.bindTooltip(
        `<div class="text-xs p-1">
          <div class="font-bold text-slate-900">${road.highwayNo}: ${road.corridorName}</div>
          <div class="text-[10px] font-semibold uppercase" style="color:${statusColor}">Status: ${road.status.replace('_', ' ')}</div>
          <div class="text-[10px] text-slate-700">${road.obstructionType}</div>
        </div>`,
        { sticky: true }
      );

      marker.addTo(lg);
    });
  }, [filteredRoads, showRoads]);

  // Render Citizen & Field Reports Layer
  useEffect(() => {
    const lg = layerGroupsRef.current.reports;
    if (!lg) return;
    lg.clearLayers();

    if (!showReports) return;

    filteredReports.forEach((rep) => {
      const repColor =
        rep.aiSeverity === 'CRITICAL'
          ? '#ef4444'
          : rep.aiSeverity === 'HIGH'
          ? '#f97316'
          : '#3b82f6';

      const iconHtml = `
        <div style="background-color:${repColor}; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:12px; border:1.5px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.5); display:flex; align-items:center; gap:2px;">
          <span>⚠ ${rep.incidentType.replace('_', ' ')}</span>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-report-pill',
        html: iconHtml,
        iconSize: [120, 20],
        iconAnchor: [60, 10],
      });

      const marker = L.marker([rep.lat, rep.lng], { icon });

      marker.on('click', () => {
        setActiveInspectorItem({ type: 'report', data: rep });
      });

      marker.addTo(lg);
    });
  }, [filteredReports, showReports]);

  // Render Simulated Satellite SAR Interferometry Deformation Overlay
  useEffect(() => {
    const lg = layerGroupsRef.current.sarOverlay;
    if (!lg) return;
    lg.clearLayers();

    if (!showSarSimulation) return;

    // Add synthetic InSAR fringe polygons across high-deformation ridges
    filteredZones.forEach((zone) => {
      const offsetLat = zone.coordinates[0];
      const offsetLng = zone.coordinates[1];

      // Simulated SAR line of sight fringe circle
      const sarCircle = L.circle([offsetLat, offsetLng], {
        radius: 4500,
        color: '#c084fc',
        weight: 1.5,
        fillColor: '#9333ea',
        fillOpacity: 0.25,
        dashArray: '3, 6',
      });

      sarCircle.bindTooltip(
        `<div class="text-xs p-1">
          <div class="font-bold text-purple-900">ESA Sentinel-1 SAR Interferometry</div>
          <div class="text-[10px] text-slate-700">Line-of-Sight Displacement: <b>${zone.sarDisplacementMmYr} mm/year</b></div>
          <div class="text-[10px] text-purple-700">Slope Creep Accelerated by Monsoon Rainfall</div>
        </div>`,
        { sticky: true }
      );

      sarCircle.addTo(lg);
    });
  }, [filteredZones, showSarSimulation]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] bg-slate-950 flex overflow-hidden">
      {/* Map canvas container */}
      <div id="gis-leaflet-canvas" ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-xs">
        {/* Layer Controls Pill */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs shadow-xl text-slate-200">
          <div className="font-bold text-slate-100 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>GIS Layer Controls</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              {filteredZones.length} Zones
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Landslide Risk Zones</span>
              </span>
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                className="accent-rose-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>IoT Sensor Stations</span>
              </span>
              <input
                type="checkbox"
                checked={showSensors}
                onChange={(e) => setShowSensors(e.target.checked)}
                className="accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Highway &amp; Road Status</span>
              </span>
              <input
                type="checkbox"
                checked={showRoads}
                onChange={(e) => setShowRoads(e.target.checked)}
                className="accent-sky-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Field Incident Reports</span>
              </span>
              <input
                type="checkbox"
                checked={showReports}
                onChange={(e) => setShowReports(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-purple-300 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>Sentinel-1 SAR Radar</span>
              </span>
              <input
                type="checkbox"
                checked={showSarSimulation}
                onChange={(e) => setShowSarSimulation(e.target.checked)}
                className="accent-purple-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Map style selection */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
            <span className="text-[10px] text-slate-400">Basemap:</span>
            <div className="flex gap-1">
              <button
                id="btn-basemap-dark"
                onClick={() => setMapStyle('dark')}
                className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                  mapStyle === 'dark' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Dark
              </button>
              <button
                id="btn-basemap-topo"
                onClick={() => setMapStyle('topo')}
                className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                  mapStyle === 'topo' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Topo
              </button>
              <button
                id="btn-basemap-sat"
                onClick={() => setMapStyle('satellite')}
                className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                  mapStyle === 'satellite' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-900/85 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-lg">
          <div className="font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Hazard Risk Tiers (AI Model)</span>
          </div>
          <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
              <span>Critical (&gt;85)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500"></span>
              <span>High (70-84)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
              <span>Medium (40-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Low (0-39)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Item Geotechnical Inspector Drawer */}
      {activeInspectorItem && (
        <div className="absolute top-4 right-4 z-20 w-84 sm:w-96 bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-xl p-4 shadow-2xl text-slate-100 max-h-[calc(100%-2rem)] overflow-y-auto">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                {activeInspectorItem.type === 'zone' && 'Landslide Hazard Zone'}
                {activeInspectorItem.type === 'sensor' && 'IoT Geotechnical Station'}
                {activeInspectorItem.type === 'road' && 'Corridor Connectivity'}
                {activeInspectorItem.type === 'report' && 'Field Incident Report'}
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                {activeInspectorItem.type === 'zone' && activeInspectorItem.data.name}
                {activeInspectorItem.type === 'sensor' && activeInspectorItem.data.name}
                {activeInspectorItem.type === 'road' && `${activeInspectorItem.data.highwayNo}: ${activeInspectorItem.data.corridorName}`}
                {activeInspectorItem.type === 'report' && activeInspectorItem.data.locationName}
              </h3>
              <p className="text-xs text-slate-400">
                {activeInspectorItem.data.district}, {activeInspectorItem.data.state}
              </p>
            </div>
            <button
              id="btn-close-inspector"
              onClick={() => setActiveInspectorItem(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Detailed content based on type */}
          {activeInspectorItem.type === 'zone' && (
            <div className="space-y-3 text-xs">
              {/* Risk Gauge Bar */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-medium">Predictive Risk Score:</span>
                  <span
                    className={`font-bold font-mono text-sm ${
                      activeInspectorItem.data.riskTier === 'CRITICAL'
                        ? 'text-rose-400'
                        : activeInspectorItem.data.riskTier === 'HIGH'
                        ? 'text-orange-400'
                        : 'text-amber-300'
                    }`}
                  >
                    {activeInspectorItem.data.riskScore}/100 ({activeInspectorItem.data.riskTier})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      activeInspectorItem.data.riskTier === 'CRITICAL'
                        ? 'bg-rose-500'
                        : activeInspectorItem.data.riskTier === 'HIGH'
                        ? 'bg-orange-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${activeInspectorItem.data.riskScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>Factor of Safety (FoS): <b>{activeInspectorItem.data.factorOfSafety}</b></span>
                  <span>Status: <b className="text-rose-300">{activeInspectorItem.data.status}</b></span>
                </div>
              </div>

              {/* Geotechnical Parameters Grid */}
              <div className="grid grid-cols-2 gap-2 text-slate-200">
                <div className="bg-slate-800/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">24h Rainfall:</span>
                  <div className="font-bold font-mono text-cyan-300">{activeInspectorItem.data.rainfall24hMm} mm</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Pore Pressure:</span>
                  <div className="font-bold font-mono text-amber-300">{activeInspectorItem.data.poreWaterPressureKpa} kPa</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Slope Gradient:</span>
                  <div className="font-bold font-mono text-slate-200">{activeInspectorItem.data.slopeAngleDeg}° degrees</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">SAR Displacement:</span>
                  <div className="font-bold font-mono text-purple-300">{activeInspectorItem.data.sarDisplacementMmYr} mm/yr</div>
                </div>
              </div>

              {/* Explainable AI (XAI) breakdown */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                  AI Model Feature Importance (XAI):
                </span>
                <div className="space-y-1 bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rainfall Intensity Trigger</span>
                    <span className="text-cyan-400">{activeInspectorItem.data.xai.rainfallContribution}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pore Water Pressure Saturation</span>
                    <span className="text-amber-400">{activeInspectorItem.data.xai.porePressureContribution}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Steep Slope Geometry</span>
                    <span className="text-orange-400">{activeInspectorItem.data.xai.slopeSteepnessContribution}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vegetation / Road Cut Loss</span>
                    <span className="text-emerald-400">{activeInspectorItem.data.xai.vegetationLossContribution}%</span>
                  </div>
                </div>
              </div>

              {/* Impacted villages & highways */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Vulnerable Villages &amp; Settlements:
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeInspectorItem.data.vulnerableVillages.map((v: string) => (
                    <span key={v} className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                      {v}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-rose-300 mt-1">
                  Estimated Population at Risk: <b>{activeInspectorItem.data.populationAtRisk.toLocaleString()} people</b>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    if (onSimulateZone) {
                      onSimulateZone(activeInspectorItem.data);
                    } else if (onSelectZone) {
                      onSelectZone(activeInspectorItem.data);
                    }
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-1.5 rounded text-xs transition-colors"
                >
                  Simulate in AI Sandbox
                </button>
              </div>
            </div>
          )}

          {activeInspectorItem.type === 'sensor' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Station Telemetry Status:</span>
                <span
                  className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    activeInspectorItem.data.status === 'ALERT'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {activeInspectorItem.data.status} ({activeInspectorItem.data.signalStrength})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">Pore Pressure:</span>
                  <div className="font-bold text-amber-300 text-sm">{activeInspectorItem.data.porePressureKpa} kPa</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">Soil Saturation:</span>
                  <div className="font-bold text-cyan-300 text-sm">{activeInspectorItem.data.soilMoisturePct}%</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">Tilt Angle Creep:</span>
                  <div className="font-bold text-slate-100 text-sm">{activeInspectorItem.data.tiltAngleDeg}°</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">Sensor Battery:</span>
                  <div className="font-bold text-emerald-300 text-sm">{activeInspectorItem.data.batteryPct}% Solar</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Last Heartbeat: <b className="text-slate-200">{activeInspectorItem.data.lastTelemetry}</b>
              </div>
            </div>
          )}

          {activeInspectorItem.type === 'road' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">Current Road Condition:</div>
                <div className="font-bold text-sm text-rose-300 uppercase mt-0.5">
                  {activeInspectorItem.data.status.replace('_', ' ')}
                </div>
                <div className="text-slate-300 mt-1 text-[11px]">{activeInspectorItem.data.obstructionType}</div>
              </div>

              <div className="bg-slate-800/60 p-2 rounded text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Affected Stretch:</span>
                  <span className="font-bold text-slate-200">{activeInspectorItem.data.affectedStretchKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Clearance Time:</span>
                  <span className="font-bold text-amber-300">{activeInspectorItem.data.clearingEstimatedHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Vehicles Passable:</span>
                  <span className={activeInspectorItem.data.emergencyConvoyPassable ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {activeInspectorItem.data.emergencyConvoyPassable ? 'YES (Convoy Only)' : 'NO (Impassable)'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block">Designated Alternate Detour:</span>
                <div className="font-medium text-sky-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800 mt-0.5">
                  {activeInspectorItem.data.detourRouteName}
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectRoad) onSelectRoad(activeInspectorItem.data);
                }}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-1.5 rounded text-xs transition-colors"
              >
                View in Authority Dispatch Matrix
              </button>
            </div>
          )}

          {activeInspectorItem.type === 'report' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Reported by: <b className="text-slate-200">{activeInspectorItem.data.reporterName}</b></span>
                  <span className="text-slate-400">{activeInspectorItem.data.timestamp}</span>
                </div>
                <div className="text-slate-200 font-medium mt-1">{activeInspectorItem.data.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">Measured Crack:</span>
                  <div className="font-bold text-amber-300">{activeInspectorItem.data.crackWidthCm ? `${activeInspectorItem.data.crackWidthCm} cm` : 'Not recorded'}</div>
                </div>
                <div className="bg-slate-800/60 p-2 rounded">
                  <span className="text-slate-400 text-[10px]">AI Verification:</span>
                  <div className="font-bold text-emerald-400">{activeInspectorItem.data.verificationStatus}</div>
                </div>
              </div>

              {activeInspectorItem.data.suggestedAction && (
                <div className="bg-rose-950/40 border border-rose-900/60 p-2 rounded text-rose-200 text-[11px]">
                  <span className="font-bold block text-rose-300 text-[10px]">Recommended Immediate Action:</span>
                  {activeInspectorItem.data.suggestedAction}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
