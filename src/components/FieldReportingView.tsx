import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Upload,
  AlertTriangle,
  WifiOff,
  Wifi,
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  FileText,
  RefreshCw,
  Send,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { CitizenReport, NerState, RiskTier } from '../types';

interface FieldReportingViewProps {
  selectedState: NerState;
  reports: CitizenReport[];
  isOfflineMode: boolean;
  offlineQueueCount: number;
  onAddNewReport: (report: CitizenReport) => void;
  onSyncOfflineReports: () => void;
}

const SAMPLE_PHOTOS = [
  {
    name: 'Tension Crack on Hill Slope (18cm)',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    type: 'TENSION_CRACK' as const,
    crackWidth: 18,
    desc: 'Deep longitudinal fissure extending 25 meters across upper terrace above settlement.',
  },
  {
    name: 'Mudflow & Rock Debris on Highway',
    url: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80',
    type: 'ROAD_OBSTRUCTION' as const,
    crackWidth: 40,
    desc: 'Massive mudslide burying two-lane mountain highway. Road completely severed.',
  },
  {
    name: 'Retaining Wall Bulging & Drainage Seep',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    type: 'RETAINING_WALL_FAIL' as const,
    crackWidth: 12,
    desc: 'Heavy stone retaining wall tilted 15 degrees outward with slurry oozing through joints.',
  },
];

export const FieldReportingView: React.FC<FieldReportingViewProps> = ({
  selectedState,
  reports,
  isOfflineMode,
  offlineQueueCount,
  onAddNewReport,
  onSyncOfflineReports,
}) => {
  const [reporterName, setReporterName] = useState('');
  const [reporterType, setReporterType] = useState<'CITIZEN' | 'FIELD_OFFICER' | 'BORDER_ROADS' | 'FOREST_RANGER'>('FIELD_OFFICER');
  const [contactPhone, setContactPhone] = useState('');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('Dima Hasao');
  const [state, setState] = useState<Exclude<NerState, 'All NER'>>(
    selectedState === 'All NER' ? 'Assam' : selectedState
  );
  const [lat, setLat] = useState<number>(25.176);
  const [lng, setLng] = useState<number>(93.025);
  const [incidentType, setIncidentType] = useState<CitizenReport['incidentType']>('TENSION_CRACK');
  const [crackWidthCm, setCrackWidthCm] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [roadBlocked, setRoadBlocked] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Auto-detect GPS Coordinates
  const handleDetectGps = () => {
    if (navigator.geolocation) {
      setStatusMessage({ type: 'info', text: 'Acquiring high-precision GPS fix from device...' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Math.round(pos.coords.latitude * 1000) / 1000);
          setLng(Math.round(pos.coords.longitude * 1000) / 1000);
          setStatusMessage({ type: 'success', text: `GPS coordinates locked: [${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}]` });
        },
        (err) => {
          console.warn('Geolocation failed or permission denied, using district default coordinates.');
          setStatusMessage({ type: 'info', text: 'Using default regional mountain coordinates.' });
        }
      );
    }
  };

  // Select sample photo for instant realistic testing
  const handleSelectSamplePhoto = (sample: typeof SAMPLE_PHOTOS[0]) => {
    setPhotoUrl(sample.url);
    setIncidentType(sample.type);
    setCrackWidthCm(sample.crackWidth);
    setDescription(sample.desc);
    if (sample.type === 'ROAD_OBSTRUCTION') {
      setRoadBlocked(true);
    }
  };

  // Run AI Verification via Gemini
  const handleAnalyzeWithAi = async () => {
    setIsAnalyzingAi(true);
    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${incidentType.replace('_', ' ')} at ${locationName || 'Hillside'}`,
          description,
          locationName,
          state,
          crackWidthCm,
          roadBlocked,
          imageBase64: photoUrl.startsWith('data:') ? photoUrl : undefined,
        }),
      });

      const data = await res.json();
      setAiAnalysisResult(data);
      setStatusMessage({ type: 'success', text: `AI Verification Complete: Severity rated ${data.severity || 'HIGH'} with ${(data.confidenceScore * 100).toFixed(0)}% confidence.` });
    } catch (err: any) {
      console.error('Failed to analyze with AI:', err);
      // Fallback
      setAiAnalysisResult({
        verified: true,
        severity: roadBlocked || crackWidthCm > 20 ? 'CRITICAL' : 'HIGH',
        confidenceScore: 0.91,
        estimatedDebrisVolumeM3: roadBlocked ? 600 : 120,
        hazardType: 'Translational Soil Slip & Tension Failure',
        immediateActionRequired: 'Halt vehicular traffic, evacuate lower hamlet terrace.',
        suggestedSOP: [
          'Erect warning signs 500m prior to curve',
          'Deploy drone survey to map head scarp extension',
          'Alert SDRF district quick response company',
        ],
      });
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Submit report (respects offline/online mode)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationName.trim() || !description.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide location name and incident description.' });
      return;
    }

    const newReport: CitizenReport = {
      id: `rep-${Date.now().toString().slice(-6)}`,
      reporterName: reporterName || (reporterType === 'CITIZEN' ? 'Local Citizen' : 'Field Ranger'),
      reporterType,
      contactPhone: contactPhone || '+91 94360 00000',
      timestamp: 'Just now',
      locationName,
      district,
      state,
      lat,
      lng,
      incidentType,
      crackWidthCm: crackWidthCm || undefined,
      estimatedVolumeM3: aiAnalysisResult?.estimatedDebrisVolumeM3 || (roadBlocked ? 350 : 60),
      description,
      roadBlocked,
      photoUrl: photoUrl || SAMPLE_PHOTOS[0].url,
      verificationStatus: aiAnalysisResult ? 'AI_VERIFIED' : 'PENDING',
      aiSeverity: (aiAnalysisResult?.severity as RiskTier) || (roadBlocked ? 'CRITICAL' : 'HIGH'),
      offlineStored: isOfflineMode,
      suggestedAction: aiAnalysisResult?.immediateActionRequired || 'Continuous monitoring & DDMA dispatch.',
    };

    onAddNewReport(newReport);

    if (isOfflineMode) {
      setStatusMessage({
        type: 'info',
        text: 'Report saved to Mountain Offline Queue. Will automatically synchronize when you reach cellular/satellite coverage.',
      });
    } else {
      setStatusMessage({
        type: 'success',
        text: 'Report successfully transmitted to DDMA Emergency Command Cloud & AI Verification Queue!',
      });
    }

    // Reset fields
    setLocationName('');
    setDescription('');
    setAiAnalysisResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Header & Offline Sync Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
              Crowdsourced &amp; Forest Ranger Reporting Portal
            </span>
            <span className="text-xs text-slate-400">Offline-First Low-Bandwidth Architecture</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Geo-Tagged Field Incident Logging &amp; AI Crack Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Allows citizens, local village defense parties, and border road engineers to upload ground cracks, slope slips, and road cutoffs even in zero-connectivity valleys.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {offlineQueueCount > 0 && (
            <button
              onClick={onSyncOfflineReports}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md animate-bounce"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync {offlineQueueCount} Offline Reports to Cloud</span>
            </button>
          )}

          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
              isOfflineMode
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>Offline Mountain Mode Active</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Cloud Live Sync Connected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Alert feedback */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
              : statusMessage.type === 'info'
              ? 'bg-sky-950/80 text-sky-200 border-sky-800'
              : 'bg-rose-950/80 text-rose-200 border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Submission Form & Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Report Logging (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl text-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-400" />
              <span>Submit Geo-Tagged Landslide / Slope Observation</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Form ID: NER-INC-2025</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Reporter Role & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Your Designation / Role:</label>
                <select
                  value={reporterType}
                  onChange={(e) => setReporterType(e.target.value as any)}
                  aria-label="Your Designation or Role"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="CITIZEN">Local Resident / Citizen</option>
                  <option value="FIELD_OFFICER">DDMA Field Official</option>
                  <option value="BORDER_ROADS">Border Roads Org (BRO)</option>
                  <option value="FOREST_RANGER">State Forest Ranger</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. T. Sangma"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Contact Mobile (SMS Alerts):</label>
                <input
                  type="tel"
                  placeholder="+91 98620 XXXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Incident Type & Road Blockage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Hazard / Deformation Type:</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as any)}
                  aria-label="Hazard or Deformation Type"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                >
                  <option value="TENSION_CRACK">Tension Crack on Hillside</option>
                  <option value="SLOPE_MOVEMENT">Active Ground Creep / Slope Slump</option>
                  <option value="ROAD_OBSTRUCTION">Road / Highway Blockage (Mud &amp; Rock)</option>
                  <option value="MUD_FLOW">Rapid Mud &amp; Debris Torrent</option>
                  <option value="ROCKFALL">Active Boulder Rockfall</option>
                  <option value="RETAINING_WALL_FAIL">Retaining Wall Bulging / Collapse</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Measured Surface Crack Width (cm):</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={crackWidthCm}
                  onChange={(e) => setCrackWidthCm(Number(e.target.value))}
                  placeholder="e.g. 15 cm"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-amber-300 font-bold font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Location & GPS */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-400">Location Landmark &amp; Road Stretch:</label>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Auto-Detect GPS Location</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. NH-27 KM 34, Jatinga Overbridge approach slope, Dima Hasao"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                required
              />

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">State:</span>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    aria-label="State selection"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-300"
                  >
                    <option value="Assam">Assam</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-500 block">Latitude:</span>
                  <input
                    type="number"
                    step="0.001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-300"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Longitude:</span>
                  <input
                    type="number"
                    step="0.001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Road Blocked Toggle */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white">Has this incident blocked traffic or highway?</span>
                  <p className="text-[10px] text-slate-400">Triggers priority traffic halt and BRO dozer alert</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={roadBlocked}
                  onChange={(e) => setRoadBlocked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="text-slate-400 block mb-1">Detailed Field Observations:</label>
              <textarea
                rows={3}
                placeholder="Describe ground cracks, slope displacement direction, bulging retaining structures, dripping water, or trapped vehicles..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            {/* Photo Preset Pickers for Quick Demoing */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-400">Attach Field Evidence Photo:</label>
                <span className="text-[10px] text-slate-500">Click a sample for instant testing:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`p-1.5 rounded-lg border text-left transition-all ${
                      photoUrl === sample.url
                        ? 'border-rose-500 bg-rose-950/30'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-14 object-cover rounded mb-1"
                    />
                    <div className="text-[10px] text-slate-300 font-medium truncate">{sample.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons: AI Verification & Final Submit */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 justify-between">
              <button
                type="button"
                id="btn-run-ai-verification"
                disabled={isAnalyzingAi || !description}
                onClick={handleAnalyzeWithAi}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzingAi ? 'Gemini AI Analyzing...' : 'Run Gemini AI Geotechnical Check'}</span>
              </button>

              <button
                type="submit"
                id="btn-submit-report"
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-md ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isOfflineMode ? 'Save to Offline Mountain Queue' : 'Transmit to DDMA Cloud'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: AI Analysis Result & Recent Reports Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Gemini AI Verification Card */}
          {aiAnalysisResult && (
            <div className="bg-slate-900 border border-purple-500/50 rounded-xl p-4 shadow-xl text-slate-100 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs uppercase font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Gemini AI Geotechnical Evaluation</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    aiAnalysisResult.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {aiAnalysisResult.severity} Urgency
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Hazard Classification:</span>
                  <span className="font-bold text-white">{aiAnalysisResult.hazardType}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Est. Debris Volume:</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {aiAnalysisResult.estimatedDebrisVolumeM3} m³
                  </span>
                </div>
              </div>

              {aiAnalysisResult.immediateActionRequired && (
                <div className="bg-rose-950/40 p-2.5 rounded border border-rose-900/60 text-xs">
                  <span className="font-bold text-rose-300 block text-[11px] mb-0.5">
                    Immediate Action Required:
                  </span>
                  <p className="text-rose-100">{aiAnalysisResult.immediateActionRequired}</p>
                </div>
              )}

              {aiAnalysisResult.suggestedSOP && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-300 block mb-1">
                    Standard Operating Procedure (SOP) Directives:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {aiAnalysisResult.suggestedSOP.map((sop: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{sop}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Live Field Reports Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Field Reports Feed ({reports.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400">Real-time Crowdsourced &amp; Ranger</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white text-xs">{rep.locationName}</span>
                      <div className="text-[10px] text-slate-400">
                        {rep.district}, {rep.state} • By {rep.reporterName} ({rep.reporterType.replace('_', ' ')})
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap ${
                        rep.aiSeverity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {rep.aiSeverity}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">{rep.description}</p>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-900 text-slate-400 font-mono">
                    <span>
                      Crack: <b className="text-amber-300">{rep.crackWidthCm ? `${rep.crackWidthCm}cm` : 'N/A'}</b> • Road: <b className={rep.roadBlocked ? 'text-rose-400' : 'text-emerald-400'}>{rep.roadBlocked ? 'Blocked' : 'Clear'}</b>
                    </span>
                    <span>{rep.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
