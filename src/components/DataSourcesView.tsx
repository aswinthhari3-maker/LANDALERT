import React, { useState } from 'react';
import {
  Activity,
  CloudRain,
  Radio,
  Layers,
  Database,
  Satellite,
  Compass,
  CheckCircle,
  ExternalLink,
  Wifi,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { WEATHER_STATIONS, IOT_SENSORS } from '../data/nerData';
import { NerState } from '../types';

interface DataSourcesViewProps {
  selectedState: NerState;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ selectedState }) => {
  const [activeTab, setActiveTab] = useState<'sensors' | 'weather' | 'satellite' | 'terrain' | 'historical'>('sensors');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const filteredWeather = selectedState === 'All NER'
    ? WEATHER_STATIONS
    : WEATHER_STATIONS.filter((w) => w.state === selectedState);

  const filteredSensors = selectedState === 'All NER'
    ? IOT_SENSORS
    : IOT_SENSORS.filter((s) => s.state === selectedState);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-purple-500/30">
              Multi-Source Ingestion &amp; Telemetry Hub
            </span>
            <span className="text-xs text-slate-400">SIH Disaster Management Stream</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Data Collection, Sensors &amp; Satellite Pipeline (NER)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous ingestion from IMD weather Doppler radar, IoT pore pressure stations, ESA Sentinel InSAR, ALOS-PALSAR DEM, and GSI historical inventories.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Poll Ingestion APIs</span>
        </button>
      </div>

      {/* 5 Ingestion Stream Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('sensors')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'sensors'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>IoT Geotechnical Borehole Sensors ({filteredSensors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('weather')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'weather'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <span>IMD Weather Radar &amp; Rain Gauges ({filteredWeather.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('satellite')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'satellite'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Satellite className="w-3.5 h-3.5 text-purple-400" />
          <span>ESA Copernicus Sentinel-1 &amp; 2 InSAR</span>
        </button>

        <button
          onClick={() => setActiveTab('terrain')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'terrain'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>DEM Terrain, Slopes &amp; Lithology</span>
        </button>

        <button
          onClick={() => setActiveTab('historical')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'historical'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-rose-400" />
          <span>GSI 30-Year Landslide Records</span>
        </button>
      </div>

      {/* Tab 1: IoT Sensors Telemetry */}
      {activeTab === 'sensors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Active Geotechnical IoT Inclinometers &amp; Piezometers</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Solar-powered LoRaWAN and BGAN Satellite transmitters streaming pore pressure (kPa) and tilt deformation.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">Station Code &amp; Name</th>
                  <th className="py-2 px-3">District / State</th>
                  <th className="py-2 px-3">Elevation</th>
                  <th className="py-2 px-3">Pore Pressure (kPa)</th>
                  <th className="py-2 px-3">Soil Moisture</th>
                  <th className="py-2 px-3">Tilt Angle Creep</th>
                  <th className="py-2 px-3">Transmission</th>
                  <th className="py-2 px-3">Battery</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSensors.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1.5">
                        {s.stationCode}
                      </span>
                      <span className="text-slate-200">{s.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{s.district}, {s.state}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{s.elevationM} m</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{s.porePressureKpa} kPa</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{s.soilMoisturePct}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{s.tiltAngleDeg}°</td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">{s.signalStrength}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{s.batteryPct}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.status === 'ALERT'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : s.status === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: IMD Weather Radar */}
      {activeTab === 'weather' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span>India Meteorological Department (IMD) Live Rainfall Stations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated Weather Stations (AWS) tracking cumulative 24-hr precipitation and cloudburst burst intensity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWeather.map((w, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{w.district}</h4>
                    <span className="text-[11px] text-slate-400">{w.state}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      w.imdWarningColor === 'RED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : w.imdWarningColor === 'ORANGE'
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    IMD {w.imdWarningColor} Warning
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 text-[10px] block">24h Cumulative</span>
                    <span className="font-bold text-cyan-400 text-sm">{w.rainfall24hMm} mm</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 text-[10px] block">Intensity</span>
                    <span className="font-bold text-sky-400 text-sm">{w.rainfallCurrentMmHr} mm/hr</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500 text-[10px] block">Humidity / Temp</span>
                    <span className="font-bold text-slate-300 text-sm">{w.humidityPct}% / {w.tempC}°C</span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] bg-slate-900/50 p-2 rounded border border-slate-800/80">
                  {w.forecast24h}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Satellite Radar InSAR */}
      {activeTab === 'satellite' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Satellite className="w-4 h-4 text-purple-400" />
              <span>ESA Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) &amp; Sentinel-2</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Differential SAR Interferometry (DInSAR) measuring millimetric slope creep and surface subsidence through dense cloud cover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-purple-400 font-bold uppercase text-[10px]">SAR Sensor Specification</span>
              <h4 className="font-bold text-white">Sentinel-1 C-Band SAR (5.405 GHz)</h4>
              <p className="text-slate-400 text-[11px]">
                Penetrates monsoon precipitation and cloud cover. Interferometric Wide (IW) swath mode with 250km coverage.
              </p>
              <div className="text-[11px] font-mono text-slate-300">
                Repeat Cycle: <b>12 Days (Ascending &amp; Descending Pass)</b>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold uppercase text-[10px]">Optical Multispectral (NDVI)</span>
              <h4 className="font-bold text-white">Sentinel-2 MSI (10m Resolution)</h4>
              <p className="text-slate-400 text-[11px]">
                Tracks normalized difference vegetation index (NDVI). Rapid drops indicate fresh scarps, logging, or unauthorized road cutting.
              </p>
              <div className="text-[11px] font-mono text-slate-300">
                Bands: <b>B4 (Red) &amp; B8 (Near-Infrared)</b>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold uppercase text-[10px]">Current Displacement Alert</span>
              <h4 className="font-bold text-white">Pakyong &amp; Haflong Subsidence</h4>
              <p className="text-slate-400 text-[11px]">
                Line-of-sight velocity exceeds <b>68 mm/year</b> along the Sevoke-Rangpo rail formation and Jatinga thrust fault line.
              </p>
              <div className="text-[11px] font-mono text-rose-400">
                Phase Coherence: <b>0.82 (High Quality)</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: DEM & Terrain */}
      {activeTab === 'terrain' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Digital Elevation Model (DEM) &amp; Geomorphology</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High-resolution 12.5m ALOS PALSAR &amp; CartoDEM topographic models calculating slope angles, curvature, and hydrological flow accumulation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Mean Slope Gradient</span>
              <span className="text-xl font-bold font-mono text-white">48.2°</span>
              <span className="text-[10px] text-rose-400 block mt-0.5">Steep &gt;45° critical threshold</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Elevation Range</span>
              <span className="text-xl font-bold font-mono text-white">120m – 3,850m</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Foothills to Eastern Himalayan peaks</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Dominant Geology</span>
              <span className="text-base font-bold text-amber-300">Weathered Shale / Schist</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">High friability when saturated</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Seismic Zone</span>
              <span className="text-xl font-bold font-mono text-rose-400">Zone V (Extreme)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Active tectonic thrust zones</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: GSI Historical Records */}
      {activeTab === 'historical' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <span>Geological Survey of India (GSI) 30-Year Incident Database</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical baseline records used to train the XGBoost &amp; Random Forest early warning classifiers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Annual Major Landslide Events</span>
              <span className="text-2xl font-bold font-mono text-rose-400">30+ Events / Yr</span>
              <span className="text-[10px] text-slate-400 block mt-1">Recorded across 8 NER states</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Average Annual Fatalities</span>
              <span className="text-2xl font-bold font-mono text-amber-400">~500 Lives / Yr</span>
              <span className="text-[10px] text-slate-400 block mt-1">Directly attributed to slope failures</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Critical Rainfall Trigger Threshold</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">&gt; 180 mm / 24h</span>
              <span className="text-[10px] text-slate-400 block mt-1">Triggers mass slope movements</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
