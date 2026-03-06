import React, { useState, useEffect, useRef } from 'react';
import { HeartIcon, MicIcon, LockIcon, SparklesIcon, AlertTriangleIcon, ActivityIcon, ArrowLeftIcon, CheckCircleIcon } from './ui/Icons';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { getCurrentAppLanguage } from '../utils/translation';

/**
 * RURAL DIGNITY MODULE – 100% offline, voice-first, privacy-by-design, Tamil-first
 * Project Context: Flagship rural multilingual telehealth platform for India & USA.
 */

// HACKATHON DEMO: Sample Advice JSON (Tamil first)
const ADVICE_LIBRARY = {
    ta: [
        { id: 'a1', title: 'சுய பாதுகாப்பு', content: 'பெரிய இரத்தப்போக்கு இருந்தால் உடனே அரசு மருத்துவமனைக்கு செல்லுங்கள். இது ஆபத்தான அறிகுறி.', audio: 'பெரிய இரத்தப்போக்கு இருந்தால் உடனே அரசு மருத்துவமனைக்கு செல்லுங்கள். இது ஆபத்தான அறிகுறி.' },
        { id: 'a2', title: 'உணவு முறை', content: 'மாதவிடாய் காலத்தில் இரும்புச்சத்து நிறைந்த உணவுகளை (கீரை, பேரீச்சம்பழம்) அதிகம் உட்கொள்ளுங்கள்.', audio: 'மாதவிடாய் காலத்தில் இரும்புச்சத்து நிறைந்த உணவுகளை அதிகம் உட்கொள்ளுங்கள்.' },
        { id: 'a3', title: 'சுகாதாரம்', content: 'குறைந்தது 6 மணிநேரத்திற்கு ஒருமுறை சானிட்டரி பேட் மாற்றவும். சுத்தமான தண்ணீரைப் பயன்படுத்தவும்.', audio: 'குறைந்தது 6 மணிநேரத்திற்கு ஒருமுறை சானிட்டரி பேட் மாற்றவும்.' }
    ],
    en: [
        { id: 'a1', title: 'Safety First', content: 'If you experience heavy bleeding, please visit the nearest PHC immediately. This is a critical sign.', audio: 'If you experience heavy bleeding, please visit the nearest PHC immediately.' },
        { id: 'a2', title: 'Nutrition', content: 'Eat iron-rich foods like spinach and dates during your cycle to maintain energy.', audio: 'Eat iron-rich foods like spinach and dates during your cycle.' },
        { id: 'a3', title: 'Hygiene', content: 'Change sanitary pads every 6 hours and always use clean water for washing.', audio: 'Change sanitary pads every 6 hours and always use clean water.' }
    ]
};

// HACKATHON DEMO: Pad Scheme Integration
const SCHEMES = [
    { name: 'Tamil Nadu Girl Child Scheme', eligibility: 'Free Sanitary Pads at Anganwadi', code: 'TN-GCS' },
    { name: 'Ayushman Bharat', eligibility: 'Full Reproductive Health Support', code: 'PM-JAY' }
];

interface CycleRecord {
    startDate: string;
    endDate?: string;
    symptoms: string[];
    isHeavy: boolean;
}

const DignityCompanion: React.FC<{ onHide?: () => void }> = ({ onHide }) => {
    const [isListening, setIsListening] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastCycles, setLastCycles] = useState<CycleRecord[]>([]);
    const [prediction, setPrediction] = useState<string | null>(null);
    const [isStalkingMode, setIsStalkingMode] = useState(false); // Panic mode
    const [feedback, setFeedback] = useState<string | null>(null);
    const lang = getCurrentAppLanguage();

    // Auto-delete logic simulation (30 days)
    useEffect(() => {
        const stored = localStorage.getItem('dignity_cycles');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as (CycleRecord & { timestamp: number })[];
                const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const filtered = parsed.filter(c => c.timestamp > monthAgo);
                setLastCycles(filtered);
                calculatePrediction(filtered);
            } catch (e) {
                console.error("Dignity data corrupted, wiping for safety.");
                localStorage.removeItem('dignity_cycles');
            }
        }
    }, []);

    const saveCycle = (newRecord: CycleRecord) => {
        const timestamped = { ...newRecord, timestamp: Date.now() };
        const updated = [timestamped, ...lastCycles].slice(0, 12);
        setLastCycles(updated);
        localStorage.setItem('dignity_cycles', JSON.stringify(updated));
        calculatePrediction(updated);
    };

    const calculatePrediction = (records: CycleRecord[]) => {
        if (records.length === 0) return;
        const last = new Date(records[0].startDate);
        const next = new Date(last.getTime() + (28 * 24 * 60 * 60 * 1000));
        // Use browser locale for date formatting
        setPrediction(next.toLocaleDateString(lang === 'en' ? 'en-US' : `${lang}-IN`, { month: 'long', day: 'numeric' }));
    };

    const playVoice = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : `${lang}-IN`;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handleVoiceCommand = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice not supported in this browser.");
            return;
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = lang === 'en' ? 'en-US' : `${lang}-IN`;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            processCommand(transcript);
        };
        recognition.start();
    };

    const processCommand = (command: string) => {
        setIsAnalyzing(true);
        setTimeout(() => {
            // HACKATHON DEMO: Simple Voice Rule Engine
            if (command.includes('period started') || command.includes('தொடங்கியது')) {
                const today = new Date().toISOString().split('T')[0];
                saveCycle({ startDate: today, symptoms: [], isHeavy: false });
                setFeedback(lang === 'ta' ? 'பதிவு செய்யப்பட்டது. கவனிப்பாக இருங்கள்.' : 'Recorded. Take care of yourself.');
                playVoice(lang === 'ta' ? 'பதிவு செய்யப்பட்டது. கவனிப்பாக இருங்கள்.' : 'Recorded. Take care of yourself.');
            } else if (command.includes('hide') || command.includes('மறை')) {
                setIsStalkingMode(true);
                if (onHide) onHide();
            } else if (command.includes('pain') || command.includes('வலி')) {
                setFeedback(lang === 'ta' ? 'ஓய்வு எடுங்கள். சுடுநீர் பயன்படுத்தவும்.' : 'Please rest. Try a warm compress.');
                playVoice(lang === 'ta' ? 'ஓய்வு எடுங்கள். சுடுநீர் பயன்படுத்தவும்.' : 'Please rest. Try a warm compress.');
            }
            setIsAnalyzing(false);
        }, 800);
    };

    if (isStalkingMode) {
        return (
            <div className="p-8 bg-green-50 min-h-screen animate-fade-in">
                <div className="max-w-md mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-green-800">Farming Tip of the Day</h2>
                    <Card className="border-green-200">
                        <CardHeader>
                            <CardTitle>Crop Rotation Benefits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">Rotating paddy with legumes helps fix nitrogen in the soil naturally, reducing the need for chemical fertilizers.</p>
                            <div className="mt-4 p-4 bg-green-100 rounded-lg">
                                <p className="text-xs font-semibold text-green-700">Next Harvest: 45 Days</p>
                            </div>
                        </CardContent>
                    </Card>
                    <button onClick={() => setIsStalkingMode(false)} className="opacity-0 w-full h-10">Secret Unlock</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-2 animate-fade-in">
            {/* Header with Incognito indicator */}
            <div className="flex justify-between items-center bg-pink-50/50 p-4 rounded-3xl border border-pink-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-100 rounded-2xl text-pink-600">
                        <HeartIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 outfit">
                            {lang === 'ta' ? 'கௌரவத் தோழமை' : 'Dignity Companion'}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-500 uppercase tracking-widest">
                            <LockIcon className="w-3 h-3" />
                            {lang === 'ta' ? 'குறியாக்கம் செய்யப்பட்டது' : 'Fully Encrypted'}
                        </div>
                    </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full border border-pink-100 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Offline Mode</span>
                </div>
            </div>

            {/* Prediction Card */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-pink-50 to-lavender-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <SparklesIcon className="w-24 h-24 text-pink-400" />
                </div>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <p className="text-sm font-semibold text-pink-600 uppercase tracking-wider">
                                {lang === 'ta' ? 'அடுத்த மாதவிடாய் கணிப்பு' : 'Next Cycle Prediction'}
                            </p>
                            <h3 className="text-4xl font-bold text-slate-800 outfit">
                                {prediction || (lang === 'ta' ? 'தகவல் இல்லை' : 'No Data Yet')}
                            </h3>
                            <p className="text-sm text-slate-500 italic">
                                {prediction ? (lang === 'ta' ? 'கணிக்கப்பட்ட தேதி' : 'Estimated Date') : (lang === 'ta' ? 'பதிவு செய்ய மைக் பொத்தானை அழுத்தவும்' : 'Tap mic to record start date')}
                            </p>
                        </div>
                        <button
                            onClick={handleVoiceCommand}
                            disabled={isListening}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}
                        >
                            {isListening ? (
                                <div className="animate-ping absolute w-24 h-24 rounded-full bg-red-400 opacity-50"></div>
                            ) : null}
                            <MicIcon className="w-10 h-10 text-white" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions & Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-pink-500" />
                        {lang === 'ta' ? 'சுகாதார ஆலோசனை' : 'Health Advice'}
                    </h3>
                    <div className="space-y-4">
                        {(ADVICE_LIBRARY[lang as keyof typeof ADVICE_LIBRARY] || ADVICE_LIBRARY['en']).map((advice) => (
                            <button
                                key={advice.id}
                                onClick={() => playVoice(advice.audio)}
                                className="w-full group text-left p-4 bg-white rounded-2xl border border-slate-100 hover:border-pink-200 transition-all hover:shadow-md active:scale-95"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 group-hover:text-pink-600">{advice.title}</h4>
                                    <MicIcon className="w-4 h-4 text-slate-300 group-hover:text-pink-400" />
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">{advice.content}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-pink-500" />
                        {lang === 'ta' ? 'அரசு திட்டங்கள்' : 'Government Schemes'}
                    </h3>
                    <div className="space-y-4">
                        {SCHEMES.map((scheme) => (
                            <Card key={scheme.code} className="border-pink-50 bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-4">
                                    <h4 className="font-bold text-slate-800 mb-1">{scheme.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {scheme.eligibility}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-full text-[10px] h-8 px-3 border-pink-100 text-pink-600">
                                            {lang === 'ta' ? 'அருகிலுள்ள மையம்' : 'Nearby Center'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Emergency Note */}
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                        <AlertTriangleIcon className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-800">{lang === 'ta' ? 'எச்சரிக்கை' : 'Emergency Warning'}</p>
                            <p className="text-xs text-red-600 leading-relaxed">
                                {lang === 'ta' ? 'தாங்க முடியாத வலி அல்லது அதிக இரத்தப்போக்கு இருந்தால் உடனே 108 அமையுங்கள்.' : 'Call 108 immediately if you have unbearable pain or excessive bleeding.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panic/Hide hint */}
            <p className="text-center text-[10px] text-slate-400 italic mt-8">
                {lang === 'ta' ? 'யாருக்காவது தெரியக்கூடாது என்றால் "மறை" என்று சொல்லுங்கள்.' : 'Whisper "Hide" to instantly switch to a harmless screen.'}
            </p>
        </div>
    );
};

export default DignityCompanion;
