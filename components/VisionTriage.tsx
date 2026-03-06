import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, UploadIcon, MicIcon, AlertTriangleIcon, ActivityIcon, CheckCircleIcon } from './ui/Icons';
import { getCurrentAppLanguage } from '../utils/translation';

type Category = 'RED' | 'YELLOW' | 'GREEN';

interface TriageResult {
    category: Category;
    diagnosis: string;
    advice: string;
}

const TRANSLATIONS = {
    en: {
        title: 'Health Check (Vision Triage)',
        offline: '100% Offline | AI Diagnostics',
        placeholder: 'Your symptoms will appear here...',
        speak: 'Speak',
        takePhoto: 'Take Photo',
        uploadImage: 'Upload Image',
        analyzing: 'Analyzing offline...',
        redTitle: 'EMERGENCY',
        yellowTitle: 'ATTENTION',
        greenTitle: 'SAFE',
        firstAidTag: 'First Aid Advice',
        diagnosis: {
            snake: 'Snakebite Envenomation',
            pesticide: 'Pesticide Allergy / Allergic Rash',
            fungal: 'Fungal Infection'
        },
        advice: {
            snake: 'EMERGENCY (RED) – Go to the nearest hospital immediately! Tied the area firmly with a clean cloth and keep the patient still.',
            pesticide: 'ATTENTION (YELLOW) – Consult an ASHA worker or Primary Health Center tomorrow. Wash the area with soap and water.',
            fungal: 'SAFE (GREEN) – Can be managed at home. Apply coconut oil at night and avoid damp clothing.'
        }
    },
    ta: {
        title: 'சுகாதார பரிசோதனை (Vision Triage)',
        offline: '100% ஆஃப்லைன் | AI நோயறிதல்',
        placeholder: 'இங்கே உங்கள் அறிகுறிகள் தோன்றும்...',
        speak: 'பேசு',
        takePhoto: 'புகைப்படம் எடு',
        uploadImage: 'பதிவேற்று',
        analyzing: 'பரிசோதிக்கப்படுகிறது (Analyzing)...',
        redTitle: 'அவசரம் (EMERGENCY)',
        yellowTitle: 'கவனம் (ATTENTION)',
        greenTitle: 'பாதுகாப்பு (SAFE)',
        firstAidTag: 'முதலுதவி ஆலோசனைகள்',
        diagnosis: {
            snake: 'பாம்பு கடி (Snakebite)',
            pesticide: 'பூச்சிக்கொல்லி ஒவ்வாமை (Allergic Rash)',
            fungal: 'பூஞ்சை தொற்று (Fungal Infection)'
        },
        advice: {
            snake: 'அவசரம் (சிவப்பு) – உடனடியாக அருகிலுள்ள அரசு மருத்துவமனைக்கு செல்லவும்! காயத்தை சுத்தமான துணியால் இறுக்கமாக கட்டி, நோயாளியை அசைக்காமல் கொண்டு செல்லுங்கள்.',
            pesticide: 'கவனம் (மஞ்சள்) – நாளை ASHA அல்லது ஆரம்ப சுகாதார நிலையத்தை அணுகவும். சோப்பு போட்டு உடலை கழுவவும்.',
            fungal: 'பாதுகாப்பு (பச்சை) – வீட்டில் பராமரிக்கலாம். இரவில் மட்டும் தேங்காய் எண்ணெய் தடவவும். ஈரமாக துணிகளை உடுத்த வேண்டாம்.'
        }
    }
};

const OfflineDiagnosisService = {
    analyzeCondition: async (imageFile: File | null, textSymptoms: string, lang: 'en' | 'ta'): Promise<TriageResult> => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const textLower = textSymptoms.toLowerCase();
        const t = TRANSLATIONS[lang];

        if (textLower.includes('பாம்பு') || textLower.includes('snake')) {
            return {
                category: 'RED',
                diagnosis: t.diagnosis.snake,
                advice: t.advice.snake,
            };
        }

        if (textLower.includes('பூச்சிக்கொல்லி') || textLower.includes('pesticide') || textLower.includes('allergy')) {
            return {
                category: 'YELLOW',
                diagnosis: t.diagnosis.pesticide,
                advice: t.advice.pesticide,
            };
        }

        return {
            category: 'GREEN',
            diagnosis: t.diagnosis.fungal,
            advice: t.advice.fungal,
        };
    }
};

const VisionTriage: React.FC = () => {
    const currentLang = getCurrentAppLanguage();
    // Fallback to English if translation is missing for the new regional languages
    const appLang = (TRANSLATIONS[currentLang as keyof typeof TRANSLATIONS] ? currentLang : 'en') as keyof typeof TRANSLATIONS;
    const t = TRANSLATIONS[appLang] || TRANSLATIONS.en;

    const [isListening, setIsListening] = useState(false);
    const [symptomsText, setSymptomsText] = useState(t.placeholder);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [result, setResult] = useState<TriageResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    // Update placeholder when language changes
    useEffect(() => {
        if (symptomsText === TRANSLATIONS.en.placeholder || symptomsText === TRANSLATIONS.ta.placeholder) {
            setSymptomsText(t.placeholder);
        }
    }, [appLang]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = currentLang === 'en' ? 'en-US' : `${currentLang}-IN`;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setSymptomsText(currentTranscript);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, [appLang]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            if (symptomsText && symptomsText !== t.placeholder) {
                runDiagnosis(symptomsText);
            }
        } else {
            setSymptomsText("");
            recognitionRef.current?.start();
        }
    };

    const speakResult = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLang === 'en' ? 'en-US' : `${currentLang}-IN`;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                runDiagnosis(symptomsText, file);
            };
            reader.readAsDataURL(file);
        }
    };

    const runDiagnosis = async (text: string, file: File | null = imageFile) => {
        if (!file && (!text || text === t.placeholder)) return;
        setIsLoading(true);
        setResult(null);
        const res = await OfflineDiagnosisService.analyzeCondition(file, text, appLang);
        setResult(res);
        setIsLoading(false);
        speakResult(res.advice);
    };

    // UI Helpers for the Card
    const getCardStyles = (category: Category) => {
        switch (category) {
            case 'RED': return { bg: 'bg-red-700', border: 'border-red-700', text: 'text-red-700', icon: <AlertTriangleIcon className="w-8 h-8 text-white" />, title: t.redTitle };
            case 'YELLOW': return { bg: 'bg-orange-600', border: 'border-orange-600', text: 'text-orange-600', icon: <ActivityIcon className="w-8 h-8 text-white" />, title: t.yellowTitle };
            case 'GREEN': return { bg: 'bg-green-700', border: 'border-green-700', text: 'text-green-700', icon: <CheckCircleIcon className="w-8 h-8 text-white" />, title: t.greenTitle };
            default: return { bg: 'bg-slate-700', border: 'border-slate-700', text: 'text-slate-700', icon: null, title: '' };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="bg-teal-700 text-white p-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CameraIcon className="w-6 h-6" />
                    {t.title}
                </h2>
                <p className="text-teal-100 text-sm mt-1">{t.offline}</p>
            </div>

            <div className="p-5 md:p-8 space-y-8">
                {/* Voice Input Box */}
                <div className="bg-teal-50 rounded-2xl border-2 border-teal-200 p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-lg text-slate-800 mb-6 font-medium min-h-[50px] flex items-center">
                        {symptomsText}
                    </p>

                    <button
                        onClick={toggleListening}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-teal-600'}`}
                    >
                        <MicIcon className="w-10 h-10 text-white" />
                    </button>
                    <p className="mt-3 font-bold text-slate-700">{t.speak}</p>
                </div>

                {/* Camera / Photo Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-xl font-bold text-lg transition-colors shadow-sm"
                    >
                        <CameraIcon className="w-6 h-6" />
                        {t.takePhoto}
                    </button>

                    <button
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.removeAttribute('capture');
                                fileInputRef.current.click();
                            }
                        }}
                        className="flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-xl font-bold text-lg transition-colors border border-slate-300 shadow-sm"
                    >
                        <UploadIcon className="w-6 h-6" />
                        {t.uploadImage}
                    </button>
                </div>

                {imagePreview && (
                    <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-slate-200 inline-block">
                        <img src={imagePreview} alt="Preview" className="h-48 w-auto object-cover" />
                        <button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500">
                            Ã—
                        </button>
                    </div>
                )}

                {/* Results Section */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-medium">{t.analyzing}</p>
                    </div>
                )}

                {result && !isLoading && (
                    <div className={`mt-8 border-4 ${getCardStyles(result.category).border} rounded-2xl overflow-hidden shadow-lg animate-fade-in-up bg-white`}>
                        <div className={`${getCardStyles(result.category).bg} py-4 px-6 flex items-center justify-center gap-4`}>
                            {getCardStyles(result.category).icon}
                            <h3 className="text-white text-2xl font-bold tracking-wide">{getCardStyles(result.category).title}</h3>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col items-center text-center">
                            <h4 className={`text-3xl font-black mb-6 ${getCardStyles(result.category).text}`}>
                                {result.diagnosis}
                            </h4>
                            <div className="w-full h-px bg-slate-200 mb-6"></div>

                            <div className="flex items-start gap-4 text-left w-full max-w-2xl mx-auto bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <button
                                    onClick={() => speakResult(result.advice)}
                                    className="p-3 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors flex-shrink-0"
                                    title="Play Audio"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                </button>
                                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium pt-1">
                                    {result.advice}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisionTriage;

