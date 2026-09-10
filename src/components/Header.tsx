import React from 'react';
import {
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff,
  Globe,
  Sliders,
  MapPin,
  ShieldAlert,
  FileText,
  Activity,
  ChevronDown,
} from 'lucide-react';
import { NerState, SupportedLanguage, EmergencyAlert, AppTab } from '../types';

interface HeaderProps {
  selectedState: NerState;
  onSelectState?: (state: NerState) => void;
  setSelectedState?: (state: NerState) => void;
  selectedLanguage?: SupportedLanguage;
  onSelectLanguage?: (lang: SupportedLanguage) => void;
  activeTab: AppTab | 'map' | 'prediction' | 'authority' | 'reporting' | 'datasources';
  onSelectTab?: (tab: 'map' | 'prediction' | 'authority' | 'reporting' | 'datasources' | AppTab) => void;
  setActiveTab?: (tab: AppTab) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode?: () => void;
  setIsOfflineMode?: React.Dispatch<React.SetStateAction<boolean>> | ((val: boolean | ((prev: boolean) => boolean)) => void);
  offlineQueueCount?: number;
  latestAlert?: EmergencyAlert;
  emergencyAlerts?: EmergencyAlert[];
  onOpenBroadcastModal: () => void;
  onOpenAdvisoryModal: () => void;
}

const NER_STATES: NerState[] = [
  'All NER',
  'Assam',
  'Meghalaya',
  'Sikkim',
  'Arunachal Pradesh',
  'Nagaland',
  'Manipur',
  'Mizoram',
  'Tripura',
];

const LANGUAGES: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'Assamese', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { code: 'Mizo', label: 'Mizo', native: 'Mizo ṭawng' },
  { code: 'Khasi', label: 'Khasi', native: 'Ka Ktien Khasi' },
  { code: 'Nepali', label: 'Nepali', native: 'नेपाली' },
];

export const Header: React.FC<HeaderProps> = ({
  selectedState,
  onSelectState,
  setSelectedState,
  selectedLanguage = 'English',
  onSelectLanguage,
  activeTab,
  onSelectTab,
  setActiveTab,
  isOfflineMode,
  onToggleOfflineMode,
  setIsOfflineMode,
  offlineQueueCount = 0,
  latestAlert,
  emergencyAlerts,
  onOpenBroadcastModal,
  onOpenAdvisoryModal,
}) => {
  const activeAlert = latestAlert || (emergencyAlerts && emergencyAlerts.length > 0 ? emergencyAlerts[0] : undefined);

  const handleStateChange = (newState: NerState) => {
    if (typeof onSelectState === 'function') {
      onSelectState(newState);
    }
    if (typeof setSelectedState === 'function') {
      setSelectedState(newState);
    }
  };

  const handleTabSelect = (tab: 'map' | 'prediction' | 'authority' | 'reporting' | 'datasources') => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tab);
    }
    if (typeof setActiveTab === 'function') {
      const mappedTab: AppTab =
        tab === 'map' ? 'gis-map' :
        tab === 'prediction' ? 'ai-predict' :
        tab === 'authority' ? 'authority-command' :
        tab === 'reporting' ? 'field-reports' :
        'data-sources';
      setActiveTab(mappedTab);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (typeof onSelectLanguage === 'function') {
      onSelectLanguage(lang);
    }
  };

  const handleToggleOffline = () => {
    if (typeof onToggleOfflineMode === 'function') {
      onToggleOfflineMode();
    } else if (typeof setIsOfflineMode === 'function') {
      setIsOfflineMode((prev: boolean) => !prev);
    }
  };

  const isMapActive = activeTab === 'map' || activeTab === 'gis-map';
  const isPredictionActive = activeTab === 'prediction' || activeTab === 'ai-predict';
  const isAuthorityActive = activeTab === 'authority' || activeTab === 'authority-command';
  const isReportingActive = activeTab === 'reporting' || activeTab === 'field-reports';
  const isDataSourcesActive = activeTab === 'datasources' || activeTab === 'data-sources';
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-xl">
      {/* Top emergency broadcast ticker */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 px-4 py-1.5 border-b border-red-800/60 text-xs flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 font-medium tracking-wide text-red-200 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-rose-300 animate-pulse" /> NER Live Early Warning:
          </span>
        </div>

        <div className="overflow-hidden whitespace-nowrap mx-3 flex-1 text-slate-200">
          <span className="animate-marquee inline-block font-mono">
            {activeAlert ? (
              <span>
                <strong className="text-amber-300 font-semibold">[{activeAlert.district}, {activeAlert.state}]</strong>{' '}
                {activeAlert.translations[selectedLanguage] || activeAlert.originalEnglish} • Affected:{' '}
                {activeAlert.affectedRoad} • Level: <span className="text-rose-300 font-bold">{activeAlert.level}</span>
              </span>
            ) : (
              'Continuous IMD & InSAR slope deformation telemetry streaming across 8 North East Indian States.'
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-quick-broadcast"
            onClick={onOpenBroadcastModal}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 transition-all shadow-sm"
          >
            <Radio className="w-3 h-3" />
            <span>SMS/App Broadcast</span>
          </button>
          <button
            id="btn-quick-advisory"
            onClick={onOpenAdvisoryModal}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-medium px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 transition-all"
          >
            <FileText className="w-3 h-3 text-amber-400" />
            <span>DDMA SOP Generator</span>
          </button>
        </div>
      </div>

      {/* Main navigation and identity */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                LandAlert <span className="text-rose-400">AI</span>
              </h1>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-rose-500/30 uppercase tracking-wider">
                SIH Disaster Mgmt
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              North Eastern Region (NER) Landslide Early Warning &amp; GIS Decision Platform
            </p>
          </div>
        </div>

        {/* State selector & low-network offline toggle */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* State selector */}
          <div className="relative">
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
              <select
                id="select-ner-state"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value as NerState)}
                aria-label="Select North East State"
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {NER_STATES.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-slate-200">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multilingual selector */}
          <div className="relative">
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-md px-2 py-1 text-slate-200">
              <Globe className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
              <select
                id="select-multilingual"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                aria-label="Select Language for Notifications"
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                    {l.native} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Low-network / Offline Mode Switcher */}
          <button
            id="btn-toggle-offline"
            onClick={handleToggleOffline}
            title="Simulate remote terrain low-connectivity mode with offline cache sync"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              isOfflineMode
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-700/80'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Offline Mode ({offlineQueueCount} queued)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloud Live (Auto-Sync)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Module tab navigation */}
      <nav className="bg-slate-950/60 border-t border-slate-800/80 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
          <button
            id="nav-tab-map"
            onClick={() => handleTabSelect('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isMapActive
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Interactive GIS Risk Map &amp; Roads</span>
          </button>

          <button
            id="nav-tab-prediction"
            onClick={() => handleTabSelect('prediction')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isPredictionActive
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>AI/ML Predictive Engine &amp; What-If Sandbox</span>
          </button>

          <button
            id="nav-tab-authority"
            onClick={() => handleTabSelect('authority')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isAuthorityActive
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            <span>DDMA/NDMA Command Center</span>
          </button>

          <button
            id="nav-tab-reporting"
            onClick={() => handleTabSelect('reporting')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap relative ${
              isReportingActive
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Field &amp; Citizen Incident Reporting</span>
            {offlineQueueCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {offlineQueueCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-datasources"
            onClick={() => handleTabSelect('datasources')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isDataSourcesActive
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi-Source Ingestion Feeds (IMD/SAR/DEM)</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
