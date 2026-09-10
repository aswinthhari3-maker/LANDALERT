import React, { useState } from 'react';
import {
  ShieldAlert,
  Car,
  Users,
  AlertTriangle,
  Radio,
  FileText,
  CheckCircle,
  Truck,
  Compass,
  ArrowRight,
  Send,
  Zap,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  RiskZone,
  RoadConnectivity,
  EmergencyResponseUnit,
  EmergencyAlert,
  NerState,
  SupportedLanguage,
} from '../types';

interface AuthorityDashboardProps {
  selectedState: NerState;
  riskZones: RiskZone[];
  roads: RoadConnectivity[];
  responseUnits: EmergencyResponseUnit[];
  emergencyAlerts: EmergencyAlert[];
  onDeployUnit: (unitId: string) => void;
  onOpenBroadcastModal: () => void;
  onOpenAdvisoryModal: () => void;
  onSelectRoad: (road: RoadConnectivity) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  selectedState,
  riskZones,
  roads,
  responseUnits,
  emergencyAlerts,
  onDeployUnit,
  onOpenBroadcastModal,
  onOpenAdvisoryModal,
  onSelectRoad,
}) => {
  const [roadFilter, setRoadFilter] = useState<'ALL' | 'BLOCKED' | 'PASSABLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredZones = selectedState === 'All NER'
    ? riskZones
    : riskZones.filter((z) => z.state === selectedState);

  const filteredRoads = selectedState === 'All NER'
    ? roads
    : roads.filter((r) => r.state === selectedState);

  const filteredUnits = selectedState === 'All NER'
    ? responseUnits
    : responseUnits.filter((u) => u.state === selectedState);

  const filteredAlerts = selectedState === 'All NER'
    ? emergencyAlerts
    : emergencyAlerts.filter((a) => a.state === selectedState);

  // Road filter logic
  const displayedRoads = filteredRoads.filter((road) => {
    const matchesSearch =
      road.highwayNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      road.corridorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      road.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roadFilter === 'BLOCKED') return road.status === 'SEVERELY_CUT' || road.status === 'PARTIALLY_BLOCKED';
    if (roadFilter === 'PASSABLE') return road.status === 'OPEN' || road.status === 'DETOUR_ACTIVE';
    return true;
  });

  // Calculate High-level KPIs
  const criticalZonesCount = filteredZones.filter((z) => z.riskTier === 'CRITICAL').length;
  const highZonesCount = filteredZones.filter((z) => z.riskTier === 'HIGH').length;
  const totalPopulationAtRisk = filteredZones.reduce((acc, z) => acc + z.populationAtRisk, 0);
  const severedRoadsCount = filteredRoads.filter((r) => r.status === 'SEVERELY_CUT').length;
  const partialRoadsCount = filteredRoads.filter((r) => r.status === 'PARTIALLY_BLOCKED').length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Banner & Emergency Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-wider">
              Disaster Management Authority (DDMA / SDMA / NDMA)
            </span>
            <span className="text-xs text-slate-400">Regional Incident Response Command</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            North Eastern Emergency Response &amp; Connectivity Command
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated priority triage, highway blockage detours, NDRF/BRO deployment, and real-time early warning dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-broadcast-command"
            onClick={onOpenBroadcastModal}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Multilingual Alert</span>
          </button>

          <button
            id="btn-advisory-command"
            onClick={onOpenAdvisoryModal}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate DDMA Action Plan (AI)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Critical Hazard Zones */}
        <div className="bg-slate-900 border border-rose-900/50 rounded-xl p-4 shadow-lg text-slate-100">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>Critical / High Zones</span>
            <span className="p-1 rounded bg-rose-950 text-rose-400 border border-rose-800">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono mt-1">
            {criticalZonesCount + highZonesCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({criticalZonesCount} Critical)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Active slope rupture breach in {selectedState}
          </div>
        </div>

        {/* Card 2: Road Arteries Severed */}
        <div className="bg-slate-900 border border-amber-900/50 rounded-xl p-4 shadow-lg text-slate-100">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>Highways Severed / Cut</span>
            <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800">
              <Car className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {severedRoadsCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              (+{partialRoadsCount} partial)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            NH-10 Sikkim &amp; NH-27 Haflong severely impacted
          </div>
        </div>

        {/* Card 3: Population in Runout Zone */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>Population at Risk</span>
            <span className="p-1 rounded bg-slate-800 text-sky-400">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-1">
            {totalPopulationAtRisk.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {filteredZones.reduce((acc, z) => acc + z.vulnerableVillages.length, 0)} hillside hamlets
          </div>
        </div>

        {/* Card 4: Broadcast Early Warnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-100">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>Dispatched Alerts</span>
            <span className="p-1 rounded bg-slate-800 text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {filteredAlerts.length}{' '}
            <span className="text-xs font-normal text-slate-400">Bulletins</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Covering 96,500+ registered SMS endpoints
          </div>
        </div>
      </div>

      {/* Road Connectivity Matrix & Detours */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-rose-400" />
              <span>North Eastern Highway &amp; Lifeline Road Connectivity Status</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time monitoring of debris blockage, heavy machinery clearance ETA, and emergency vehicle bypass routes.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search highway or corridor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs pl-8 pr-3 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setRoadFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium ${
                  roadFilter === 'ALL' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRoadFilter('BLOCKED')}
                className={`px-2.5 py-1 rounded font-medium ${
                  roadFilter === 'BLOCKED' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                Blocked
              </button>
              <button
                onClick={() => setRoadFilter('PASSABLE')}
                className={`px-2.5 py-1 rounded font-medium ${
                  roadFilter === 'PASSABLE' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                Passable
              </button>
            </div>
          </div>
        </div>

        {/* Road Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2 px-3">Highway &amp; Corridor</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Obstruction Description</th>
                <th className="py-2 px-3">Clearance ETA</th>
                <th className="py-2 px-3">Emergency Convoy</th>
                <th className="py-2 px-3">Designated Detour Route</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayedRoads.map((road) => (
                <tr key={road.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded mr-1.5">
                      {road.highwayNo}
                    </span>
                    <span className="text-slate-200">{road.corridorName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{road.state}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        road.status === 'SEVERELY_CUT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : road.status === 'PARTIALLY_BLOCKED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : road.status === 'DETOUR_ACTIVE'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {road.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={road.obstructionType}>
                    {road.obstructionType}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    {road.clearingEstimatedHours > 0 ? `${road.clearingEstimatedHours} Hrs` : 'Normal Flow'}
                  </td>
                  <td className="py-2.5 px-3">
                    {road.emergencyConvoyPassable ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Passable
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Blocked
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-sky-300 text-[11px] max-w-xs truncate" title={road.detourRouteName}>
                    {road.detourRouteName}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectRoad(road)}
                      className="text-rose-400 hover:text-white bg-slate-800 hover:bg-rose-600 px-2.5 py-1 rounded text-[11px] transition-colors"
                    >
                      View Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Response Prioritisation & Resource Mobilization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Emergency Response Units (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Emergency Response Force Prioritisation &amp; Dispatch</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                NDRF, SDRF, and Border Roads Organisation (BRO) mountain clearance units.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              {filteredUnits.length} Units Ready
            </span>
          </div>

          <div className="space-y-3">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{unit.unitName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        unit.status === 'ON_SITE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : unit.status === 'CLEARING_ROAD'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : unit.status === 'MOBILIZING'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {unit.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Base: <b className="text-slate-300">{unit.stationBase}</b> ({unit.state}) • Personnel:{' '}
                    <b className="text-slate-300">{unit.personnelCount} rescuers</b> • Target Zone:{' '}
                    <b className="text-rose-300">{unit.assignedZone}</b>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {unit.equipment.map((eq, i) => (
                      <span key={i} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="text-[11px] font-mono text-amber-400">
                    ETA: {unit.etaMinutes === 0 ? 'On-Scene' : `${unit.etaMinutes} Mins`}
                  </div>
                  <button
                    onClick={() => onDeployUnit(unit.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{unit.status === 'ON_SITE' ? 'Reinforce' : 'Dispatch'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dispatched Alert Bulletins & Multilingual Audit (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>Active Broadcast Early Warnings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted SMS &amp; siren alerts pushed to district populations.
              </p>
            </div>
            <button
              onClick={onOpenBroadcastModal}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              + New Alert
            </button>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.level === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-orange-950 text-orange-300 border border-orange-800'
                      }`}
                    >
                      {alert.level}
                    </span>
                    <h4 className="font-bold text-white text-xs mt-1">{alert.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{alert.timestamp}</span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/80 p-2 rounded border border-slate-800/80 font-sans">
                  "{alert.originalEnglish}"
                </p>

                {/* Multilingual Pills */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Available Regional Translations:</span>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(alert.translations).map((lang) => (
                      <span key={lang} className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-amber-300 border border-slate-700">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                  <span>Targeted Population: <b className="text-white">{alert.targetCount.toLocaleString()} SMS</b></span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> DDMA Acknowledged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
