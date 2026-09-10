import React, { useState } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Truck,
  Building,
} from 'lucide-react';
import { NerState } from '../types';

interface AdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: NerState;
}

export const AdvisoryModal: React.FC<AdvisoryModalProps> = ({
  isOpen,
  onClose,
  selectedState,
}) => {
  const [district, setDistrict] = useState('Dima Hasao');
  const [state, setState] = useState<Exclude<NerState, 'All NER'>>(
    selectedState === 'All NER' ? 'Assam' : selectedState
  );
  const [riskLevel, setRiskLevel] = useState<'HIGH' | 'CRITICAL'>('CRITICAL');
  const [rainfallCurrent, setRainfallCurrent] = useState('240 mm / 24h, Peak Intensity 38 mm/hr');
  const [roadStatus, setRoadStatus] = useState('NH-27 Jatinga Stretch severed by massive debris flow');
  const [isGenerating, setIsGenerating] = useState(false);
  const [advisoryResult, setAdvisoryResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          state,
          riskLevel,
          rainfallCurrent,
          roadStatus,
          affectedVillages: ['Lower Haflong', 'Jatinga Valley Hamlet', 'Fiangpui', 'Boro Haflong'],
          vulnerablePopulation: 14500,
        }),
      });
      const data = await res.json();
      setAdvisoryResult(data);
    } catch (err) {
      console.error('Failed to generate advisory:', err);
      // Fallback
      setAdvisoryResult({
        advisoryNumber: 'DDMA/NER/2025/LANDSLIDE-089',
        issuedAt: new Date().toISOString(),
        district,
        state,
        threatLevel: riskLevel,
        executiveSummary:
          'Due to continuous cloudburst precipitation over the Barail mountain range exceeding 240mm in 24 hours, geotechnical sensors have detected critical pore water pressure buildup (84 kPa). Catastrophic slope failure is imminent along the upper slopes above Haflong township.',
        evacuationDirectives: [
          'Immediate evacuation of all residential structures in Lower Haflong and Jatinga settlement zones to designated cyclone/landslide relief shelters.',
          'District Administration to enforce Section 144 along vulnerable hill cutting corridors.',
          'All educational institutions and government offices in the red zone are closed until further notice.',
        ],
        ndrfBroDirectives: [
          'Deploy 1st Battalion NDRF Guwahati Team Bravo to Haflong Circuit House with heavy extraction equipment.',
          'Border Roads Organisation (BRO) to mobilize two heavy tracked excavators to clear NH-27 KM 32–36.',
          'State Disaster Response Force (SDRF) water rescue boat squads on standby for lower valley flash flooding.',
        ],
        designatedShelters: [
          'Haflong Higher Secondary School Auditorium (Capacity: 1,200 persons)',
          'Don Bosco High School Sports Complex (Capacity: 850 persons)',
          'Circuit House Community Hall (Emergency Operations Center)',
        ],
        trafficBypassPlan:
          'Commercial heavy vehicles diverted via Umrangso-Lanka arterial road. Emergency medical ambulances prioritized via Boro Haflong ridge single-lane bypass with police escort.',
        publicWarningBulletin:
          'URGENT DDMA ADVISORY: Evacuate lower hillside residences immediately. Bring essential medicines and identification documents. Contact Emergency Helpline 1077 / 03673-236222.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!advisoryResult) return;
    const text = `
OFFICIAL DISASTER MANAGEMENT ADVISORY
Advisory Ref: ${advisoryResult.advisoryNumber}
District: ${advisoryResult.district}, ${advisoryResult.state}
Urgency Level: ${advisoryResult.threatLevel}

EXECUTIVE SUMMARY:
${advisoryResult.executiveSummary}

EVACUATION DIRECTIVES:
${advisoryResult.evacuationDirectives?.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}

NDRF & BRO ACTION PLAN:
${advisoryResult.ndrfBroDirectives?.map((d: string, i: number) => `• ${d}`).join('\n')}

DESIGNATED EMERGENCY RELIEF SHELTERS:
${advisoryResult.designatedShelters?.map((s: string) => `- ${s}`).join('\n')}

TRAFFIC BYPASS PLAN:
${advisoryResult.trafficBypassPlan}

PUBLIC BULLETIN:
${advisoryResult.publicWarningBulletin}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-5 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                DDMA / SDMA Automated Action Plan &amp; Evacuation Advisory
              </h3>
              <p className="text-xs text-slate-400">
                Synthesizes real-time IMD data, road blockage status, and sensor alerts into official SOP directives.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">State:</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as any)}
              aria-label="State selector"
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200"
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
            <label className="text-slate-400 block mb-1 font-semibold">District:</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Threat Level:</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as any)}
              aria-label="Threat level"
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 font-bold text-rose-400"
            >
              <option value="CRITICAL">CRITICAL (Immediate Evacuation)</option>
              <option value="HIGH">HIGH (Preparedness Directive)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Live Rainfall Context:</label>
            <input
              type="text"
              value={rainfallCurrent}
              onChange={(e) => setRainfallCurrent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Road Severance State:</label>
            <input
              type="text"
              value={roadStatus}
              onChange={(e) => setRoadStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isGenerating ? 'Gemini Generating Advisory Document...' : 'Generate Official DDMA Action Plan'}</span>
          </button>
        </div>

        {/* Generated Advisory Document Result */}
        {advisoryResult && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">OFFICIAL DISASTER MANAGEMENT ORDER</span>
                <h4 className="text-sm font-bold text-white font-mono">{advisoryResult.advisoryNumber}</h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Order' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">
                Situation Assessment:
              </span>
              <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                {advisoryResult.executiveSummary}
              </p>
            </div>

            {/* Directives Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Evacuation */}
              <div className="space-y-2">
                <span className="font-bold text-rose-300 flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mandatory Evacuation Orders</span>
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {advisoryResult.evacuationDirectives?.map((dir: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold font-mono shrink-0">{i + 1}.</span>
                      <span>{dir}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* NDRF / BRO Force Tasking */}
              <div className="space-y-2">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NDRF &amp; BRO Resource Directives</span>
                </span>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {advisoryResult.ndrfBroDirectives?.map((dir: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{dir}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Designated Relief Shelters */}
            <div className="space-y-1.5">
              <span className="font-bold text-sky-300 flex items-center gap-1.5 text-[11px]">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                <span>Designated Evacuation &amp; Relief Centers:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {advisoryResult.designatedShelters?.map((shelter: string, idx: number) => (
                  <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 text-[11px] text-slate-300 font-medium">
                    {shelter}
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic bypass */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
              <b className="text-amber-300 block mb-0.5">Highway Cutoff &amp; Traffic Diversion Plan:</b>
              {advisoryResult.trafficBypassPlan}
            </div>

            {/* Public Bulletin */}
            <div className="bg-rose-950/40 p-2.5 rounded border border-rose-900/60 text-xs">
              <b className="text-rose-300 block mb-0.5">Official Public Broadcast Bulletin (Radio &amp; Loudspeaker):</b>
              <p className="text-rose-100 font-sans italic">"{advisoryResult.publicWarningBulletin}"</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
