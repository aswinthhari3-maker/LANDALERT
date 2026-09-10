/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GisRiskMap } from './components/GisRiskMap';
import { AiPredictionEngine } from './components/AiPredictionEngine';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { FieldReportingView } from './components/FieldReportingView';
import { DataSourcesView } from './components/DataSourcesView';
import { BroadcastModal } from './components/BroadcastModal';
import { AdvisoryModal } from './components/AdvisoryModal';

import {
  INITIAL_RISK_ZONES,
  IOT_SENSORS,
  ROAD_STATUS,
  INITIAL_CITIZEN_REPORTS,
  RESPONSE_UNITS,
  INITIAL_EMERGENCY_ALERTS,
} from './data/nerData';
import {
  AppTab,
  NerState,
  RiskZone,
  CitizenReport,
  RoadConnectivity,
  EmergencyResponseUnit,
  EmergencyAlert,
  SupportedLanguage,
} from './types';

const OFFLINE_STORAGE_KEY = 'landalert_offline_reports_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('gis-map');
  const [selectedState, setSelectedState] = useState<NerState>('All NER');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('English');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Core Data States
  const [riskZones, setRiskZones] = useState<RiskZone[]>(INITIAL_RISK_ZONES);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [roads, setRoads] = useState<RoadConnectivity[]>(ROAD_STATUS);
  const [selectedRoad, setSelectedRoad] = useState<RoadConnectivity | null>(null);
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);
  const [responseUnits, setResponseUnits] = useState<EmergencyResponseUnit[]>(RESPONSE_UNITS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);

  // Offline Queue stored in localStorage
  const [offlineQueue, setOfflineQueue] = useState<CitizenReport[]>([]);

  // Modals
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState<boolean>(false);

  // Load offline queue from localStorage on boot
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        setOfflineQueue(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read offline queue from localStorage', e);
    }
  }, []);

  // Sync offline queue to localStorage
  const saveOfflineQueue = (items: CitizenReport[]) => {
    setOfflineQueue(items);
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save offline queue', e);
    }
  };

  // Handle adding new citizen or ranger report
  const handleAddNewReport = (report: CitizenReport) => {
    if (isOfflineMode) {
      // Store in offline mountain queue
      const updatedQueue = [report, ...offlineQueue];
      saveOfflineQueue(updatedQueue);
    } else {
      // Broadcast to live reports feed
      setReports((prev) => [report, ...prev]);
    }
  };

  // Sync all offline queued reports to cloud
  const handleSyncOfflineReports = () => {
    if (offlineQueue.length === 0) return;
    const syncedItems = offlineQueue.map((item) => ({
      ...item,
      offlineStored: false,
      verificationStatus: 'AI_VERIFIED' as const,
    }));
    setReports((prev) => [...syncedItems, ...prev]);
    saveOfflineQueue([]);
  };

  // Handle dispatching emergency response unit
  const handleDeployUnit = (unitId: string) => {
    setResponseUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          const nextStatus = u.status === 'READY_IN_BASE' ? 'MOBILIZING' : 'ON_SITE';
          return {
            ...u,
            status: nextStatus,
            etaMinutes: nextStatus === 'ON_SITE' ? 0 : 15,
          };
        }
        return u;
      })
    );
  };

  // Handle adding a newly broadcast alert
  const handleBroadcastSuccess = (newAlert: EmergencyAlert) => {
    setEmergencyAlerts((prev) => [newAlert, ...prev]);
  };

  // Handler when road is clicked in Authority Dashboard to jump to map
  const handleSelectRoadToMap = (road: RoadConnectivity) => {
    setSelectedRoad(road);
    setActiveTab('gis-map');
  };

  // Handler when risk zone is selected to jump to simulation
  const handleSelectZoneToSim = (zone: RiskZone) => {
    setSelectedZone(zone);
    setActiveTab('ai-predict');
  };

  // Safe tab selection handler normalizing all tab alias formats
  const handleSelectTab = (tab: AppTab | 'map' | 'prediction' | 'authority' | 'reporting' | 'datasources') => {
    if (tab === 'map' || tab === 'gis-map') setActiveTab('gis-map');
    else if (tab === 'prediction' || tab === 'ai-predict') setActiveTab('ai-predict');
    else if (tab === 'authority' || tab === 'authority-command') setActiveTab('authority-command');
    else if (tab === 'reporting' || tab === 'field-reports') setActiveTab('field-reports');
    else if (tab === 'datasources' || tab === 'data-sources') setActiveTab('data-sources');
    else setActiveTab(tab as AppTab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onSelectTab={handleSelectTab}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        onSelectState={setSelectedState}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        isOfflineMode={isOfflineMode}
        setIsOfflineMode={setIsOfflineMode}
        onToggleOfflineMode={() => setIsOfflineMode((prev) => !prev)}
        offlineQueueCount={offlineQueue.length}
        latestAlert={emergencyAlerts[0]}
        emergencyAlerts={emergencyAlerts}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onOpenAdvisoryModal={() => setIsAdvisoryModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-10">
        {(activeTab === 'gis-map' || activeTab === 'map') && (
          <div className="h-[calc(100vh-105px)] w-full">
            <GisRiskMap
              riskZones={riskZones}
              sensors={IOT_SENSORS}
              roads={roads}
              reports={reports}
              citizenReports={reports}
              selectedState={selectedState}
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onSelectRoad={(road) => {
                setSelectedRoad(road);
                setActiveTab('authority-command');
              }}
              onSimulateZone={handleSelectZoneToSim}
              onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
              onOpenAdvisoryModal={() => setIsAdvisoryModalOpen(true)}
            />
          </div>
        )}

        {(activeTab === 'ai-predict' || activeTab === 'prediction') && (
          <AiPredictionEngine
            riskZones={riskZones}
            selectedZone={selectedZone}
            onSelectZone={(zone) => setSelectedZone(zone)}
            selectedState={selectedState}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            onOpenAdvisoryModal={() => setIsAdvisoryModalOpen(true)}
          />
        )}

        {(activeTab === 'authority-command' || activeTab === 'authority') && (
          <AuthorityDashboard
            selectedState={selectedState}
            riskZones={riskZones}
            roads={roads}
            responseUnits={responseUnits}
            emergencyAlerts={emergencyAlerts}
            onDeployUnit={handleDeployUnit}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            onOpenAdvisoryModal={() => setIsAdvisoryModalOpen(true)}
            onSelectRoad={handleSelectRoadToMap}
          />
        )}

        {(activeTab === 'field-reports' || activeTab === 'reporting') && (
          <FieldReportingView
            selectedState={selectedState}
            reports={reports}
            isOfflineMode={isOfflineMode}
            offlineQueueCount={offlineQueue.length}
            onAddNewReport={handleAddNewReport}
            onSyncOfflineReports={handleSyncOfflineReports}
          />
        )}

        {(activeTab === 'data-sources' || activeTab === 'datasources') && (
          <DataSourcesView selectedState={selectedState} />
        )}
      </main>

      {/* Multilingual Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        selectedState={selectedState}
        onBroadcastSuccess={handleBroadcastSuccess}
      />

      {/* AI Disaster Management Evacuation Advisory Modal */}
      <AdvisoryModal
        isOpen={isAdvisoryModalOpen}
        onClose={() => setIsAdvisoryModalOpen(false)}
        selectedState={selectedState}
      />
    </div>
  );
}

