import React, { useState } from 'react';
import {
  X,
  Radio,
  Send,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Globe,
  Users,
  Smartphone,
  Volume2,
} from 'lucide-react';
import { EmergencyAlert, NerState, SupportedLanguage } from '../types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: NerState;
  onBroadcastSuccess: (newAlert: EmergencyAlert) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  selectedState,
  onBroadcastSuccess,
}) => {
  const [district, setDistrict] = useState('Dima Hasao');
  const [state, setState] = useState<Exclude<NerState, 'All NER'>>(
    selectedState === 'All NER' ? 'Assam' : selectedState
  );
  const [severity, setSeverity] = useState<'WARNING' | 'CRITICAL'>('CRITICAL');
  const [title, setTitle] = useState('CRITICAL LANDSLIDE EVACUATION ALERT');
  const [message, setMessage] = useState(
    'IMD radar confirms cloudburst peak over Haflong ridge. Soil moisture 92%. Inhabitants of lower valley slopes must evacuate immediately to designated Higher Secondary School relief shelter. Avoid NH-27.'
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<SupportedLanguage, string>>({
    English: message,
    Hindi: '',
    Assamese: '',
    Bengali: '',
    Mizo: '',
    Khasi: '',
    Nepali: '',
  });
  const [channels, setChannels] = useState({
    sms: true,
    siren: true,
    whatsapp: true,
    vhfRadio: true,
  });
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  // AI Multilingual Translation via Gemini
  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/ai/multilingual-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          targetLanguages: ['Assamese', 'Bengali', 'Mizo', 'Khasi', 'Hindi', 'Nepali'],
        }),
      });
      const data = await res.json();
      if (data.translations) {
        setTranslations({
          English: message,
          ...data.translations,
        });
      }
    } catch (err) {
      console.error('Translation error:', err);
      // Fallback sensible translations for demonstration
      setTranslations({
        English: message,
        Hindi: 'हाफलोंग रिज पर बादल फटने की पुष्टि। निचले इलाकों के निवासी तुरंत सुरक्षित आश्रय स्थलों पर जाएं। NH-27 से बचें।',
        Assamese: 'হাফলং পাহাৰত ডাৱৰ বিস্ফোৰণ। তলৰ অঞ্চলৰ লোকসকলে অবিলম্বে নিৰাপদ আশ্ৰয়স্থললৈ স্থানান্তৰ হওক। NH-27 ব্যৱহাৰ নকৰিব।',
        Bengali: 'হাফলং শৈলশিরায় মেঘভাঙা বৃষ্টি। নিম্নভূমির বাসিন্দারা অবিলম্বে উচ্চ বিদ্যালয়ের আশ্রয়কেন্দ্রে চলে যান। NH-27 এড়িয়ে চলুন।',
        Mizo: 'Haflong tlang chhipah ruah nasa tak a sur. Hmun hniam a chengte chu Higher Secondary School chhanhimna hmunah in sawn chhuak nghal rawh u.',
        Khasi: 'Kmie ka jinghap slap ha Haflong. Kito kiba shong ha ki jaka barim ki dei ban phet noh sha ka jaka shongthait. Kiad na surok NH-27.',
        Nepali: 'हाफलोंग पहाडमा भारी वर्षा। तल्लो भेगका बासिन्दाहरू तुरुन्तै सुरक्षित आश्रयस्थलमा जानुहोस्। NH-27 प्रयोग नगर्नुहोस्।',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDispatch = () => {
    const selectedChannels: ('SMS' | 'APP_PUSH' | 'VILLAGE_SIREN' | 'ALL_INDIA_RADIO')[] = [];
    if (channels.sms) selectedChannels.push('SMS');
    if (channels.siren) selectedChannels.push('VILLAGE_SIREN');
    if (channels.whatsapp) selectedChannels.push('APP_PUSH');
    if (channels.vhfRadio) selectedChannels.push('ALL_INDIA_RADIO');

    const alertRecord: EmergencyAlert = {
      id: `alert-${Date.now().toString().slice(-6)}`,
      timestamp: 'Just now',
      district,
      state,
      level: severity,
      title,
      affectedRoad: 'Lifeline Highway & Hill Settlements',
      originalEnglish: message,
      translations,
      channels: selectedChannels,
      targetCount: 42500,
      acknowledgedByDDMA: true,
    };

    onBroadcastSuccess(alertRecord);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-5 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-600/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Multilingual Early Warning</h3>
              <p className="text-xs text-slate-400">Pushes cell-broadcast SMS &amp; siren alerts across mountain hamlets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="text-slate-400 block mb-1 font-semibold">Target District:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Alert Urgency:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                aria-label="Alert Urgency"
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 font-bold text-rose-400"
              >
                <option value="CRITICAL">CRITICAL (Immediate Evacuation)</option>
                <option value="WARNING">WARNING (Prepare &amp; Stand By)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Alert Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-bold"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-semibold">English Message Body:</label>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isTranslating ? 'Translating via Gemini...' : 'Translate to 6 NER Regional Languages'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-sans"
            />
          </div>

          {/* Regional Languages Translation Preview */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Multilingual Previews (Assamese, Bengali, Mizo, Khasi, Hindi, Nepali):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {Object.entries(translations)
                .filter(([lang]) => lang !== 'English')
                .map(([lang, text]) => (
                  <div key={lang} className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-0.5">{lang}:</span>
                    <p className="text-slate-300 line-clamp-2">{text || 'Click translate button above to generate.'}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Dispatch Channels */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Transmission Vectors:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <label className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="accent-rose-600"
                />
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>SMS Cell Broadcast</span>
              </label>

              <label className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.siren}
                  onChange={(e) => setChannels({ ...channels, siren: e.target.checked })}
                  className="accent-rose-600"
                />
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Valley Siren Tower</span>
              </label>

              <label className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="accent-rose-600"
                />
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Bot</span>
              </label>

              <label className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.vhfRadio}
                  onChange={(e) => setChannels({ ...channels, vhfRadio: e.target.checked })}
                  className="accent-rose-600"
                />
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>VHF Police Radio</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>Estimated Audience:</span>
            <b className="text-white">~42,500 Registered Residents</b>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={isSent}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSent ? 'Dispatched to Towers!' : 'Authorize & Broadcast Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
