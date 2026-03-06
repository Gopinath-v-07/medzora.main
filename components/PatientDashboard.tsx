import React, { useState, useRef, useEffect } from 'react';
// FIX: Import UserRole to be used when rendering the ReportView component.
import { MedicalRecord, ReportStatus, PatientData, UserRole, ChatMessage, UserProfile } from '../types';
import ReportView from './ReportView';
import { Sidebar, TabType } from './Sidebar';
import VisionTriage from './VisionTriage';
import DignityCompanion from './DignityCompanion';
import { getCurrentAppLanguage } from '../utils/translation';
import { LanguageSelector } from './LanguageSelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { COMMON_SYMPTOMS } from '../constants';
import { analyzePatientData } from '../services/geminiService';
import { FolderIcon, DownloadIcon, MessageSquareIcon, PencilIcon, CornerUpRightIcon, PlusIcon, MicIcon, PillIcon, SettingsIcon, ActivityIcon, HeartIcon } from './ui/Icons';
import ChatInterface from './ChatInterface';
import { generateReportPDF } from '../services/pdfService';
import Header from './Header';

const getInitialPatientData = (profile: UserProfile): Omit<PatientData, 'id'> => ({
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    email: profile.email,
    symptoms: [],
    otherSymptoms: '',
    medicalHistory: '',
    medicalHistoryFileName: undefined,
    currentMedications: '',
});

const PastReportItem: React.FC<{ record: MedicalRecord, currentUserId: string, authToken: string | null, onSendMessage: (recordId: string, message: ChatMessage) => void, onFollowUp: (recordId: string, note: string) => void }> = ({ record, currentUserId, authToken, onSendMessage, onFollowUp }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isRequestingFollowUp, setIsRequestingFollowUp] = useState(false);
    const [followUpNote, setFollowUpNote] = useState('');
    const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
    const [pharmacies, setPharmacies] = useState<{ name: string, address: string, rating: number, lat: number, lng: number, score?: number }[] | null>(null);
    const [pharmacyError, setPharmacyError] = useState('');

    const handleDownload = () => {
        generateReportPDF(record);
    };

    const handleSendMessage = (text: string) => {
        if (!record.verifiedBy) return;
        const doctorId = record.verifiedBy.split(' ').pop()!;
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUserId,
            text,
            timestamp: new Date().toISOString()
        };
        onSendMessage(record.id, newMessage);
    };

    const handleFollowUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!followUpNote.trim()) {
            alert("Please provide a reason for the follow-up.");
            return;
        }
        onFollowUp(record.id, followUpNote);
        setIsRequestingFollowUp(false);
        setFollowUpNote('');
    };

    const rankPharmacies = (pharmacies: any[], userLat: number, userLng: number) => {
        return pharmacies.map(shop => {
            const distance = Math.sqrt(
                Math.pow(shop.lat - userLat, 2) +
                Math.pow(shop.lng - userLng, 2)
            );
            const r = shop.rating || 3;
            const score = (0.6 * distance) - (0.4 * r);
            return { ...shop, score, distance_approx: (distance * 111).toFixed(1) }; // Rough km approx for display
        }).sort((a, b) => a.score - b.score);
    };

    const handleSuggestPharmacies = () => {
        setIsLoadingPharmacies(true);
        setPharmacyError('');
        setPharmacies(null);

        if (!navigator.geolocation) {
            setPharmacyError("Geolocation is not supported by your browser.");
            setIsLoadingPharmacies(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                console.log("Geolocation retrieved:", lat, lng);
                try {
                    const response = await fetch(`/api/nearby-medicals?lat=${lat}&lon=${lng}`, {
                        headers: {
                            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                        }
                    });

                    console.log("Pharmacy API response status:", response.status);
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Pharmacy API error:", errorData);
                        throw new Error(errorData.error || 'Failed to fetch pharmacies');
                    }

                    const data: { name: string, address: string, rating: number, lat: number, lng: number }[] = await response.json();
                    console.log("Pharmacies received from API:", data.length);

                    const rankedData = rankPharmacies(data, lat, lng).slice(0, 5);
                    console.log("Ranked pharmacies:", rankedData.length);
                    setPharmacies(rankedData as any);
                } catch (err: any) {
                    console.error("Pharmacy fetch error:", err);
                    setPharmacyError(err.message || 'Error communicating with the server.');
                } finally {
                    setIsLoadingPharmacies(false);
                }
            },
            (error) => {
                let errorMessage = "Geolocation error: ";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Location permission denied.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred.";
                }
                setPharmacyError(errorMessage);
                setIsLoadingPharmacies(false);
            }
        );
    };


    return (
        <div className="border-t border-slate-200">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50">
                <span className="font-medium text-slate-700">Report #{record.id.substring(4, 10)}</span>
                <div className="flex items-center gap-4">
                    <span className="text-base text-slate-500">{new Date(record.verifiedDate!).toLocaleString()}</span>
                    <span className="text-base font-semibold text-sky-600">{isExpanded ? 'Collapse' : 'Expand'}</span>
                </div>
            </button>
            {isExpanded && record.aiReport && (
                <div className="p-4 bg-slate-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div><strong>Symptoms:</strong> <p className="text-slate-600">{[...record.patientData.symptoms, record.patientData.otherSymptoms].filter(Boolean).join(', ')}</p></div>
                        <div><strong>Diagnosis:</strong> <p className="text-slate-600">{record.aiReport.diagnosis}</p></div>
                        <div><strong>Severity:</strong> <p className="text-slate-600">{record.aiReport.severity}</p></div>
                        <div><strong>Recommended Medications:</strong> <p className="text-slate-600 whitespace-pre-wrap">{record.aiReport.medication}</p></div>
                        <div className="sm:col-span-2"><strong>Diet Plan:</strong> <p className="text-slate-600 whitespace-pre-wrap">{record.aiReport.dietPlan}</p></div>
                        <div className="sm:col-span-2"><strong>Doctor's Notes:</strong> <p className="text-slate-600 whitespace-pre-wrap">{record.doctorNotes || 'No additional notes.'}</p></div>
                        <div className="sm:col-span-2"><strong>Verified By:</strong> <p className="text-slate-600">{record.verifiedBy} on {new Date(record.verifiedDate!).toLocaleDateString()}</p></div>
                    </div>

                    {isRequestingFollowUp ? (
                        <form onSubmit={handleFollowUpSubmit} className="mt-4 p-4 border rounded-lg bg-white space-y-3">
                            <h4 className="font-semibold text-slate-800">Request a Follow-up</h4>
                            <div>
                                <label htmlFor={`followup-${record.id}`} className="block text-base font-medium text-slate-700 mb-1">Reason for follow-up</label>
                                <textarea id={`followup-${record.id}`} value={followUpNote} onChange={e => setFollowUpNote(e.target.value)} placeholder="e.g., Symptoms have not improved, I am experiencing side effects from the medication, etc." rows={3} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-base bg-white focus:border-sky-500 focus:ring-sky-500" required></textarea>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="secondary" onClick={() => setIsRequestingFollowUp(false)}>Cancel</Button>
                                <Button type="submit">Submit Request</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setIsChatOpen(!isChatOpen)}>
                                    <MessageSquareIcon className="h-4 w-4" /> {isChatOpen ? 'Close Chat' : 'Chat with Doctor'}
                                </Button>
                                <Button variant="secondary" onClick={() => setIsRequestingFollowUp(true)}>
                                    <CornerUpRightIcon className="h-4 w-4" /> Request Follow-up
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="default" onClick={handleSuggestPharmacies} className="bg-primary hover:bg-teal-700 text-white shadow-premium border-none" disabled={isLoadingPharmacies}>
                                    {isLoadingPharmacies ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
                                    ) : (
                                        <PillIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                    )}
                                    {isLoadingPharmacies ? 'Finding Pharmacies...' : 'Find Nearby Pharmacies'}
                                </Button>
                                <Button variant="secondary" onClick={handleDownload}><DownloadIcon className="h-4 w-4" /> Download Report</Button>
                            </div>
                        </div>
                    )}


                    {isChatOpen && !isRequestingFollowUp && (
                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-lg font-semibold text-slate-800 mb-2">Chat with {record.verifiedBy}</h4>
                            <ChatInterface
                                messages={record.chat || []}
                                currentUserId={currentUserId}
                                onSendMessage={handleSendMessage}
                            />
                        </div>
                    )}

                    {/* Pharmacies Display */}
                    {(pharmacies !== null || pharmacyError) && (
                        <div className="mt-6 border-t pt-5 animate-fade-in-up">
                            <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><PillIcon className="h-5 w-5" /></span>
                                Nearby Pharmacies
                            </h4>

                            {pharmacyError && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                                    <strong className="font-semibold block mb-1">Could not find pharmacies</strong>
                                    {pharmacyError}
                                </div>
                            )}

                            {pharmacies && pharmacies.length === 0 && !pharmacyError && (
                                <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-sm">
                                    No pharmacies were found near your current location within a 5km radius.
                                </div>
                            )}

                            {pharmacies && pharmacies.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {pharmacies.map((pharmacy, idx) => (
                                        <a key={idx}
                                            href={`https://www.google.com/maps/search/?api=1&query=${pharmacy.lat},${pharmacy.lng}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="block p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1" title={pharmacy.name}>{pharmacy.name}</h5>
                                                {pharmacy.rating && (
                                                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium ml-2 whitespace-nowrap">â­ {pharmacy.rating}</span>
                                                )}
                                            </div>
                                            {pharmacy.address && (
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{pharmacy.address}</p>
                                            )}
                                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                                                <CornerUpRightIcon className="h-3 w-3" /> Get Directions
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Fast Online Delivery Section */}
                            <div className="mt-8">
                                <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="p-1.5 bg-teal-100 text-teal-600 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
                                    </span>
                                    Fast Online Delivery
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <a href="https://www.apollo247.com/specialtys/pharmacy" target="_blank" rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all group">
                                        <div className="h-8 w-8 mb-2 rounded border border-slate-100 p-1 flex items-center justify-center bg-white overflow-hidden">
                                            <img src="https://images.apollo247.com/images/ic_logo.png" alt="Apollo" className="w-full h-auto object-contain" />
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700 group-hover:text-teal-700">Apollo 24|7</span>
                                    </a>

                                    <a href="https://pharmeasy.in/" target="_blank" rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all group">
                                        <div className="h-8 w-8 mb-2 rounded border border-slate-100 p-1 flex items-center justify-center bg-white overflow-hidden">
                                            <span className="text-teal-600 font-bold text-xl leading-none">P</span>
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700 group-hover:text-teal-700">PharmEasy</span>
                                    </a>

                                    <a href="https://www.1mg.com/" target="_blank" rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-red-300 hover:shadow-md transition-all group">
                                        <div className="h-8 w-8 mb-2 rounded border border-slate-100 p-1 flex items-center justify-center bg-white overflow-hidden">
                                            <span className="text-red-500 font-black text-lg italic leading-none">1mg</span>
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700 group-hover:text-red-600">Tata 1mg</span>
                                    </a>

                                    <a href="https://www.swiggy.com/instamart" target="_blank" rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-md transition-all group">
                                        <div className="h-8 w-8 mb-2 rounded border border-slate-100 p-0.5 flex items-center justify-center bg-orange-50 overflow-hidden">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700 group-hover:text-orange-600">10-Min Delivery</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


interface PatientDashboardProps {
    patientProfile: UserProfile;
    records: MedicalRecord[];
    notifications: { id: string, message: string }[];
    addOrUpdateRecord: (record: MedicalRecord) => void;
    addChatMessage: (recordId: string, message: ChatMessage) => void;
    updatePatientProfile: (profile: UserProfile) => void;
    dismissNotification: (notificationId: string) => void;
    selectedRecord: MedicalRecord | null;
    setSelectedRecord: (record: MedicalRecord | null) => void;
    user: { role: UserRole, id: string | null };
    onLogout: () => void;
    authToken: string | null;
    apiStatus?: boolean;
    dbStatus?: boolean;
    userName?: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientProfile, records, notifications, addOrUpdateRecord, addChatMessage, updatePatientProfile, dismissNotification, selectedRecord, setSelectedRecord, user, onLogout, authToken, apiStatus, dbStatus, userName }) => {
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [patientData, setPatientData] = useState(getInitialPatientData(patientProfile));
    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile>(patientProfile);
    const historyFileRef = useRef<HTMLInputElement>(null);

    // RURAL DIGNITY MODULE: Global Secret Voice Access Listener
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = getCurrentAppLanguage() === 'ta' ? 'ta-IN' : 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            // HACKATHON DEMO: Secret Code Words (Emma/அம்மா)
            if (transcript.includes('emma') || transcript.includes('அம்மா')) {
                setActiveTab('dignity-companion');
                setSelectedRecord(null);
            }
        };

        recognition.start();
        return () => recognition.stop();
    }, []);

    const handleListen = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support the Web Speech API. Please try Google Chrome or Microsoft Edge.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        // Language will default to the browser/OS language if not specified, 
        // allowing patients to dictate in their native language
        recognition.lang = document.documentElement.lang || 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setPatientData(prev => ({
                ...prev,
                otherSymptoms: prev.otherSymptoms ? `${prev.otherSymptoms} ${transcript}` : transcript
            }));
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsListening(false);
            if (event.error !== 'no-speech') {
                alert(`Microphone error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    React.useEffect(() => {
        setEditedProfile(patientProfile);
    }, [patientProfile]);

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedProfile.name.trim() || !editedProfile.age.trim() || !editedProfile.email.trim()) {
            alert("Name, Age, and Email cannot be empty.");
            return;
        };
        updatePatientProfile(editedProfile);
        setPatientData(prev => ({ ...prev, name: editedProfile.name, age: editedProfile.age, gender: editedProfile.gender, email: editedProfile.email }));
        setIsEditingProfile(false);
    };

    const handleCreateFollowUp = (originalRecordId: string, note: string) => {
        const originalRecord = records.find(r => r.id === originalRecordId);
        if (!originalRecord) return;

        const followUpRecord: MedicalRecord = {
            id: `rec-${Date.now()}`,
            date: new Date().toISOString(),
            patientData: originalRecord.patientData, // Use original data
            aiReport: originalRecord.aiReport, // Carry over original report
            status: ReportStatus.PENDING_DOCTOR,
            followUpFor: originalRecordId,
            followUpNote: note,
        };
        addOrUpdateRecord(followUpRecord);
        // Optionally, give user feedback
        alert("Follow-up request submitted successfully. A doctor will review it shortly.");
    };

    const verifiedRecords = records
        .filter(r => r.patientData.id === patientProfile.id && r.status === ReportStatus.VERIFIED)
        .sort((a, b) => new Date(b.verifiedDate!).getTime() - new Date(a.verifiedDate!).getTime());

    const handleSymptomChange = (symptom: string) => {
        setPatientData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientData.name || !patientData.age || !patientData.gender || !patientData.email) {
            setError("Full Name, Age, Gender, and Email are required.");
            return;
        }
        setError('');
        setIsAnalyzing(true);

        const fullPatientData: PatientData = { id: patientProfile.id, ...patientData };
        const tempRecord: MedicalRecord = {
            id: `temp-${Date.now()}`,
            date: new Date().toISOString(),
            patientData: fullPatientData,
            aiReport: null,
            status: ReportStatus.PENDING_AI
        };

        setSelectedRecord(tempRecord); // Switch to report view with loading state

        try {
            const aiReport = await analyzePatientData(fullPatientData);
            const newRecord = {
                ...tempRecord,
                id: `rec-${Date.now()}`, // Final ID
                aiReport,
                status: ReportStatus.PENDING_DOCTOR
            };
            addOrUpdateRecord(newRecord);
            setSelectedRecord(newRecord); // Update view with full data
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setSelectedRecord(null); // Go back to dashboard on error
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleHistoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setPatientData(prev => ({
                    ...prev,
                    medicalHistory: dataUrl,
                    medicalHistoryFileName: file.name
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeHistoryFile = () => {
        setPatientData(prev => ({
            ...prev,
            medicalHistory: '',
            medicalHistoryFileName: undefined
        }));
        if (historyFileRef.current) {
            historyFileRef.current.value = '';
        }
    };

    const handleBackToDashboard = () => {
        setSelectedRecord(null);
    }

    if (selectedRecord) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <ReportView
                    record={selectedRecord}
                    userRole={UserRole.PATIENT}
                    onBack={handleBackToDashboard}
                    updateRecord={() => { }} // Patient does not update records
                />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans">
            <Sidebar
                activeTab={activeTab}
                userRole={user.role}
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    setSelectedRecord(null);
                }}
            />

            <div className="flex-1 flex flex-col md:ml-64 ml-20 h-screen overflow-hidden animate-fade-in-up transition-all duration-300">
                <Header
                    onLogout={onLogout}
                    userId={user.id}
                    userName={userName}
                    userRole={user.role}
                    reportStatus={selectedRecord?.status}
                    notifications={notifications}
                    dismissNotification={dismissNotification}
                    apiStatus={apiStatus}
                    dbStatus={dbStatus}
                />
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-8">

                    {selectedRecord ? (
                        <div className="space-y-6">
                            <button onClick={handleBackToDashboard} className="text-primary hover:text-teal-700 font-medium flex items-center space-x-2 transition-colors mb-4 bg-white/50 px-4 py-2 rounded-lg shadow-sm border border-slate-200/50 backdrop-blur-sm w-fit hover:bg-white/80">
                                <span>&larr;</span> <span>Back to Dashboard</span>
                            </button>
                            <ReportView
                                record={selectedRecord}
                                currentUserRole={UserRole.PATIENT}
                                onSendMessage={addChatMessage}
                            />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* HOME TAB (New Consultation) */}
                            {activeTab === 'home' && (
                                <div className="space-y-6">
                                    <Card className="border-none bg-white">
                                        <CardHeader className="bg-gradient-to-r from-teal-50/50 to-transparent border-none pb-4">
                                            <CardTitle className="text-3xl text-primary flex items-center gap-3">
                                                <span className="p-2.5 bg-teal-50 rounded-2xl"><PlusIcon className="w-6 h-6 text-primary" /></span>
                                                New Consultation
                                            </CardTitle>
                                            <CardDescription className="text-base text-slate-500">Provide details for AI analysis. The more details you provide, the better the analysis.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">

                                                {/* Basic Information */}
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                                        <div>
                                                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                                            <input id="fullName" type="text" value={patientData.name} onChange={e => setPatientData({ ...patientData, name: e.target.value })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Enter full name" required />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1.5">Age <span className="text-red-500">*</span></label>
                                                            <input id="age" type="number" value={patientData.age} onChange={e => setPatientData({ ...patientData, age: e.target.value })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. 30" required />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1.5">Gender <span className="text-red-500">*</span></label>
                                                            <select id="gender" value={patientData.gender} onChange={e => setPatientData({ ...patientData, gender: e.target.value as 'Male' | 'Female' | 'Other' })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" required>
                                                                <option>Male</option>
                                                                <option>Female</option>
                                                                <option>Other</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">Email <span className="text-red-500">*</span></label>
                                                            <input id="email" type="email" value={patientData.email} onChange={e => setPatientData({ ...patientData, email: e.target.value })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Enter email address" required />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Symptoms */}
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Symptoms <span className="text-red-500">*</span></h3>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                        {COMMON_SYMPTOMS.map(symptom => (
                                                            <label key={symptom} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${patientData.symptoms.includes(symptom) ? 'bg-teal-50 border-primary text-primary font-medium' : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                                                                <input type="checkbox" checked={patientData.symptoms.includes(symptom)} onChange={() => handleSymptomChange(symptom)} className="h-4 w-4 rounded text-primary focus:ring-primary border-slate-300" />
                                                                {symptom}
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <label htmlFor="otherSymptoms" className="block text-sm font-medium text-slate-600">Other Symptoms</label>
                                                            <button
                                                                type="button"
                                                                onClick={handleListen}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                            >
                                                                <MicIcon className={`w-3.5 h-3.5 ${isListening ? 'animate-pulse' : ''}`} />
                                                                {isListening ? 'Listening...' : 'Voice Input'}
                                                            </button>
                                                        </div>
                                                        <textarea id="otherSymptoms" value={patientData.otherSymptoms} onChange={e => setPatientData({ ...patientData, otherSymptoms: e.target.value })} placeholder="Describe any other symptoms you're experiencing" rows={3} className="block w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"></textarea>
                                                    </div>
                                                </div>

                                                {/* Medical History */}
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Medical History</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label htmlFor="historyFile" className="block text-sm font-medium text-slate-600 mb-1">Attach History File <span className="text-slate-400 font-normal">(Optional - PDF, image, or text)</span></label>
                                                            <input ref={historyFileRef} id="historyFile" type="file" accept=".pdf,image/*,.txt" onChange={handleHistoryFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors" />
                                                        </div>
                                                        {patientData.medicalHistoryFileName && (
                                                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
                                                                <p className="text-sm text-slate-700 truncate">ðŸ“Ž <span className="font-medium">{patientData.medicalHistoryFileName}</span></p>
                                                                <Button type="button" size="sm" variant="secondary" onClick={removeHistoryFile}>Remove</Button>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label htmlFor="history" className="block text-sm font-medium text-slate-600 mb-1">Or Type Past Medical History</label>
                                                            <textarea id="history" value={patientData.medicalHistory.startsWith('data:') ? '' : patientData.medicalHistory} onChange={e => setPatientData({ ...patientData, medicalHistory: e.target.value })} disabled={!!patientData.medicalHistoryFileName} placeholder="Any previous illnesses, surgeries, or chronic conditions" rows={3} className="block w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400"></textarea>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="meds" className="block text-sm font-medium text-slate-600 mb-1">Current Medications <span className="text-slate-400 font-normal">(Optional)</span></label>
                                                            <textarea id="meds" value={patientData.currentMedications} onChange={e => setPatientData({ ...patientData, currentMedications: e.target.value })} placeholder="List any medications you are currently taking" rows={3} className="block w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                {error && <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

                                                <Button
                                                    type="submit"
                                                    disabled={isAnalyzing}
                                                    className="w-full h-12 text-base font-semibold shadow-sm"
                                                    size="lg"
                                                    variant="default"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                            Analyzing with Medzora AI...
                                                        </>
                                                    ) : (
                                                        'Submit for AI Analysis'
                                                    )}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    {/* Profile Summary Card */}
                                    <Card className="border-none bg-white">
                                        <CardHeader className="pb-4 border-b border-slate-100/50">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-teal-50 rounded-xl">
                                                        <FolderIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <CardTitle className="text-xl">Your Profile</CardTitle>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(!isEditingProfile)} className="h-9 px-3 text-primary bg-teal-50/50 hover:bg-teal-100 rounded-lg">
                                                    {isEditingProfile ? 'Cancel' : 'Edit'}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-5">
                                            {isEditingProfile ? (
                                                <form onSubmit={handleProfileUpdate} className="max-w-2xl space-y-6">
                                                    {/* Personal Details */}
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1.5 border-b border-slate-100">Personal Details</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                                            <div>
                                                                <label htmlFor="editName" className="block text-sm font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                                                <input id="editName" type="text" value={editedProfile.name} onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Full name" required />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="editAge" className="block text-sm font-medium text-slate-600 mb-1.5">Age <span className="text-red-500">*</span></label>
                                                                <input id="editAge" type="number" value={editedProfile.age} onChange={e => setEditedProfile({ ...editedProfile, age: e.target.value })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Age" required />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="editGender" className="block text-sm font-medium text-slate-600 mb-1.5">Gender <span className="text-red-500">*</span></label>
                                                                <select id="editGender" value={editedProfile.gender} onChange={e => setEditedProfile({ ...editedProfile, gender: e.target.value as 'Male' | 'Female' | 'Other' })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" required>
                                                                    <option>Male</option>
                                                                    <option>Female</option>
                                                                    <option>Other</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="editEmail" className="block text-sm font-medium text-slate-600 mb-1.5">Email <span className="text-red-500">*</span></label>
                                                                <input id="editEmail" type="email" value={editedProfile.email} onChange={e => setEditedProfile({ ...editedProfile, email: e.target.value })} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Email address" required />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Address */}
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1.5 border-b border-slate-100">Address</h3>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label htmlFor="editAddrLine1" className="block text-sm font-medium text-slate-600 mb-1.5">Address Line 1</label>
                                                                <input id="editAddrLine1" type="text" value={(editedProfile as any).addressLine1 ?? ''} onChange={e => setEditedProfile({ ...editedProfile, addressLine1: e.target.value } as any)} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="House / Flat No., Street" />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="editAddrLine2" className="block text-sm font-medium text-slate-600 mb-1.5">Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
                                                                <input id="editAddrLine2" type="text" value={(editedProfile as any).addressLine2 ?? ''} onChange={e => setEditedProfile({ ...editedProfile, addressLine2: e.target.value } as any)} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="Area, Landmark" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label htmlFor="editDistrict" className="block text-sm font-medium text-slate-600 mb-1.5">District</label>
                                                                    <input id="editDistrict" type="text" value={(editedProfile as any).district ?? ''} onChange={e => setEditedProfile({ ...editedProfile, district: e.target.value } as any)} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Chennai" />
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="editState" className="block text-sm font-medium text-slate-600 mb-1.5">State</label>
                                                                    <input id="editState" type="text" value={(editedProfile as any).state ?? ''} onChange={e => setEditedProfile({ ...editedProfile, state: e.target.value } as any)} className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="e.g. Tamil Nadu" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Country</label>
                                                                <input type="text" value="India" readOnly className="block w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-1">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                                        <Button type="submit" size="sm">Save Changes</Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-slate-500 mb-0.5">Patient ID</p>
                                                            <p className="text-sm font-semibold text-slate-800">{patientProfile.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                                            <p className="text-sm font-semibold text-slate-800">{patientProfile.email}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 mb-0.5">Age</p>
                                                            <p className="text-sm font-semibold text-slate-800">{patientProfile.age}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500 mb-0.5">Gender</p>
                                                            <p className="text-sm font-semibold text-slate-800">{patientProfile.gender}</p>
                                                        </div>
                                                    </div>
                                                    {(patientProfile.addressLine1 || patientProfile.district) && (
                                                        <div className="pt-3 border-t border-slate-100">
                                                            <p className="text-xs text-slate-500 mb-1">Address</p>
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {[patientProfile.addressLine1, patientProfile.addressLine2, patientProfile.district, patientProfile.state, patientProfile.country].filter(Boolean).join(', ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* RECORDS TAB */}
                            {activeTab === 'records' && (
                                <div className="space-y-6">
                                    <Card className="border-none bg-white">
                                        <CardHeader className="pb-4 border-b border-slate-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-teal-50 rounded-xl">
                                                    <FolderIcon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">Past Reports</CardTitle>
                                                    <CardDescription className="text-sm mt-0.5 text-slate-500">Your verified medical reports</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {verifiedRecords.length > 0 ? (
                                                verifiedRecords.map(rec => <PastReportItem key={rec.id} record={rec} currentUserId={patientProfile.id} authToken={authToken} onSendMessage={addChatMessage} onFollowUp={handleCreateFollowUp} />)
                                            ) : (
                                                <p className="text-slate-500 text-sm p-6 text-center">You have no verified reports yet.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <Card className="border-none bg-white">
                                        <CardHeader className="pb-4 border-b border-slate-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-teal-50 rounded-xl">
                                                    <SettingsIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <CardTitle className="text-xl">Settings & Preferences</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="max-w-3xl space-y-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-slate-800">Display Language</h3>
                                                        <p className="text-sm text-slate-500">Change the application's language natively. Your preference is saved automatically.</p>
                                                    </div>
                                                    <div className="w-full md:w-64">
                                                        <LanguageSelector className="w-full shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* PLACEHOLDER FOR OTHER TABS */}
                            {activeTab === 'chat' && (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <h2 className="text-2xl font-bold text-slate-700 capitalize mb-2">Doctor Chat coming soon</h2>
                                    <p className="text-slate-500">This feature is currently under development.</p>
                                </div>
                            )}

                            {/* EMERGENCIES TAB - Interactive Search */}
                            {activeTab === 'emergencies' && (() => {
                                const FIRST_AID_DATA = [
                                    {
                                        title: 'Cardiac Arrest / CPR', color: 'red',
                                        keywords: ['cardiac', 'heart', 'cpr', 'arrest', 'chest', 'resuscitation', 'heartbeat'],
                                        steps: [
                                            'Call 112 immediately.',
                                            'Lay the person on their back on a firm, flat surface.',
                                            'Place the heel of your hand on the centre of their chest.',
                                            'Push hard and fast - 100 to 120 compressions per minute (2 per second).',
                                            'If trained, give 2 rescue breaths after every 30 compressions.',
                                            'Continue until emergency services arrive or the person regains consciousness.',
                                        ],
                                    },
                                    {
                                        title: 'Choking (Adult)', color: 'orange',
                                        keywords: ['choke', 'choking', 'heimlich', 'airway', 'stuck', 'throat', 'food'],
                                        steps: [
                                            'Ask if they are choking - if they cannot speak or cough, act immediately.',
                                            'Give 5 sharp back blows between the shoulder blades with the heel of your hand.',
                                            'Give 5 abdominal thrusts (Heimlich manoeuvre): stand behind them, make a fist above the navel, pull sharply inward and upward.',
                                            'Alternate back blows and thrusts until the object is expelled or they lose consciousness.',
                                            'If unconscious, begin CPR and call 112.',
                                        ],
                                    },
                                    {
                                        title: 'Burns', color: 'amber',
                                        keywords: ['burn', 'fire', 'scald', 'hot', 'flame', 'chemical', 'skin'],
                                        steps: [
                                            'Remove the person from the source of the burn safely.',
                                            'Cool the burn under cool (not cold) running water for at least 20 minutes.',
                                            'Do NOT use ice, butter, or toothpaste.',
                                            'Remove jewellery or clothing near the burn (unless stuck to the skin).',
                                            'Cover loosely with a clean, dry bandage or cling film.',
                                            'Seek medical help for burns on the face, hands, joints, or chemical/electrical burns.',
                                        ],
                                    },
                                    {
                                        title: 'Fractures (Broken Bones)', color: 'blue',
                                        keywords: ['fracture', 'broken', 'bone', 'break', 'crack', 'limb', 'arm', 'leg'],
                                        steps: [
                                            'Do NOT try to straighten the bone.',
                                            'Immobilise the injured area using a splint or improvised support.',
                                            'Apply ice wrapped in a cloth to reduce swelling. Do not apply ice directly.',
                                            'Elevate the limb if possible.',
                                            'For an open fracture, cover the wound with a clean cloth and seek emergency help.',
                                        ],
                                    },
                                    {
                                        title: 'Severe Bleeding', color: 'rose',
                                        keywords: ['bleeding', 'blood', 'wound', 'cut', 'haemorrhage', 'hemorrhage', 'laceration'],
                                        steps: [
                                            'Apply firm, direct pressure on the wound using a clean cloth or bandage.',
                                            'Do not remove the cloth if it soaks through - add more on top.',
                                            'Elevate the injured limb above heart level if possible.',
                                            'Keep pressure for at least 15 minutes.',
                                            'Call 112 if bleeding is severe or does not stop.',
                                            'For amputations, apply a tourniquet 5 to 7 cm above the wound.',
                                        ],
                                    },
                                    {
                                        title: 'Seizure / Epilepsy', color: 'violet',
                                        keywords: ['seizure', 'epilepsy', 'fit', 'convulsion', 'shaking', 'twitch', 'epileptic'],
                                        steps: [
                                            'Stay calm. Time the seizure with your phone.',
                                            'Clear the area of sharp or hard objects.',
                                            'Cushion the person head with something soft.',
                                            'Turn them gently onto their side (recovery position) after jerking stops.',
                                            'Do NOT restrain them or put anything in their mouth.',
                                            'Call 112 if the seizure lasts more than 5 minutes or it is their first seizure.',
                                        ],
                                    },
                                    {
                                        title: 'Fainting', color: 'teal',
                                        keywords: ['faint', 'fainting', 'unconscious', 'collapse', 'dizzy', 'passed out', 'syncope'],
                                        steps: [
                                            'Help the person lie down safely - prevent them from falling.',
                                            'Raise their legs about 30 cm above heart level.',
                                            'Loosen tight clothing around the neck and waist.',
                                            'Ensure fresh air - open windows or move to an open area.',
                                            'If they do not regain consciousness within 1 to 2 minutes, call 112.',
                                        ],
                                    },
                                    {
                                        title: 'Snake Bite', color: 'green',
                                        keywords: ['snake', 'bite', 'venom', 'poison', 'reptile', 'sting'],
                                        steps: [
                                            'Keep the person calm and still - movement spreads venom faster.',
                                            'Immobilise the bitten limb and keep it below heart level.',
                                            'Remove watches, rings, and tight clothing near the bite.',
                                            'Do NOT cut the wound, suck out venom, or apply a tourniquet.',
                                            'Note the time of the bite and the appearance of the snake.',
                                            'Reach a hospital with anti-venom as quickly as possible.',
                                        ],
                                    },
                                    {
                                        title: 'Stroke', color: 'pink',
                                        keywords: ['stroke', 'brain', 'droop', 'speech', 'paralysis', 'face', 'arm weakness', 'slurred'],
                                        steps: [
                                            'Use the FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call 112.',
                                            'Do NOT give food, water, or medication.',
                                            'Lay the person down with head and shoulders slightly raised.',
                                            'Do NOT leave them alone.',
                                            'Note the time symptoms started - critical for treatment.',
                                            'Call 112 immediately.',
                                        ],
                                    },
                                    {
                                        title: 'Heat Stroke', color: 'orange',
                                        keywords: ['heat', 'heatstroke', 'sunstroke', 'hot', 'temperature', 'dehydration', 'sun'],
                                        steps: [
                                            'Move the person to a cool, shaded area immediately.',
                                            'Remove excess clothing.',
                                            'Apply cool water to the skin or wrap in a cool wet cloth.',
                                            'Fan them to promote evaporation.',
                                            'Place ice packs under armpits, neck, and groin if available.',
                                            'Call 112 - heat stroke is life-threatening.',
                                        ],
                                    },
                                    {
                                        title: 'Drowning', color: 'blue',
                                        keywords: ['drown', 'drowning', 'water', 'submerge', 'swim', 'lake', 'river', 'pool'],
                                        steps: [
                                            'Call 112 immediately.',
                                            'Do NOT jump in unless trained - use a rope, pole, or floating object.',
                                            'Once safe on land, check for breathing.',
                                            'If not breathing, begin CPR immediately (30 compressions : 2 breaths).',
                                            'Turn them onto their side if they vomit during CPR.',
                                            'Keep them warm with a blanket and do not leave alone.',
                                        ],
                                    },
                                    {
                                        title: 'Electric Shock', color: 'yellow',
                                        keywords: ['electric', 'shock', 'electricity', 'electrocution', 'wire', 'current', 'voltage'],
                                        steps: [
                                            'Do NOT touch the person until the power source is switched off.',
                                            'Turn off the power at the main switch or breaker.',
                                            'If you cannot turn off power, use a dry wooden stick to push them away from the source.',
                                            'Call 112.',
                                            'Check for breathing and start CPR if needed.',
                                            'Cover burns with a clean, dry dressing.',
                                        ],
                                    },
                                ];

                                const colorMap: Record<string, { bg: string; border: string; text: string; step: string; tag: string }> = {
                                    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', step: 'bg-red-500', tag: 'bg-red-100 text-red-700' },
                                    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', step: 'bg-orange-500', tag: 'bg-orange-100 text-orange-700' },
                                    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', step: 'bg-amber-500', tag: 'bg-amber-100 text-amber-700' },
                                    blue: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', step: 'bg-teal-500', tag: 'bg-teal-100 text-teal-700' },
                                    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', step: 'bg-rose-500', tag: 'bg-rose-100 text-rose-700' },
                                    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', step: 'bg-violet-500', tag: 'bg-violet-100 text-violet-700' },
                                    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', step: 'bg-teal-500', tag: 'bg-teal-100 text-teal-700' },
                                    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', step: 'bg-green-500', tag: 'bg-green-100 text-green-700' },
                                    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', step: 'bg-pink-500', tag: 'bg-pink-100 text-pink-700' },
                                    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', step: 'bg-yellow-500', tag: 'bg-yellow-100 text-yellow-700' },
                                };

                                const EmergencyTab = () => {
                                    const [query, setQuery] = React.useState('');
                                    const q = query.toLowerCase().trim();
                                    const filtered = q
                                        ? FIRST_AID_DATA.filter(item =>
                                            item.title.toLowerCase().includes(q) ||
                                            item.keywords.some(k => k.includes(q) || q.includes(k))
                                        )
                                        : [];

                                    return (
                                        <div className="space-y-6">


                                            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                                                <h2 className="text-xl font-bold text-red-700">Emergency First Aid Guide</h2>
                                                <p className="text-sm text-red-600 mt-1">Type a condition below to get instant first aid steps. In a life-threatening emergency, <strong>call 112 immediately</strong>.</p>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={query}
                                                    onChange={e => setQuery(e.target.value)}
                                                    placeholder="Type a condition (burn, heart attack, choking, snake bite...)"
                                                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-base bg-white shadow-sm transition-all"
                                                    autoFocus
                                                />
                                                {query && (
                                                    <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700 font-semibold border border-slate-200 rounded-lg px-2 py-1">Clear</button>
                                                )}
                                            </div>

                                            {!query && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Pick</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Heart Attack', 'Burn', 'Choking', 'Bleeding', 'Seizure', 'Stroke', 'Snake Bite', 'Drowning', 'Fainting', 'Heat Stroke'].map(label => (
                                                            <button
                                                                key={label}
                                                                onClick={() => setQuery(label)}
                                                                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all shadow-sm"
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {query && filtered.length === 0 && (
                                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                                                    <p className="text-slate-600 font-semibold text-lg mb-1">No results for <strong>{query}</strong></p>
                                                    <p className="text-slate-400 text-sm">Try: burn, choke, heart, seizure, or bleeding</p>
                                                </div>
                                            )}

                                            {filtered.map(item => {
                                                const c = colorMap[item.color] || colorMap['blue'];
                                                return (
                                                    <div key={item.title} className={`${c.bg} border-2 ${c.border} rounded-2xl p-6`}>
                                                        <div className="mb-4">
                                                            <h3 className={`text-xl font-bold ${c.text}`}>{item.title}</h3>
                                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.tag} mt-2 inline-block`}>First Aid Steps</span>
                                                        </div>
                                                        <ol className="space-y-3">
                                                            {item.steps.map((step, i) => (
                                                                <li key={i} className="flex items-start gap-4 bg-white/60 rounded-xl p-3">
                                                                    <span className={`${c.step} text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>{i + 1}</span>
                                                                    <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{step}</p>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                );
                                            })}

                                            <div className="p-5 bg-slate-800 text-white rounded-2xl">
                                                <h4 className="font-bold text-lg mb-3">Emergency Numbers (India)</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {[
                                                        { label: 'National Emergency', number: '112' },
                                                        { label: 'Ambulance', number: '108' },
                                                        { label: 'Police', number: '100' },
                                                        { label: 'Fire Brigade', number: '101' },
                                                        { label: 'Women Helpline', number: '1091' },
                                                        { label: 'Poison Control', number: '1800-11-6117' },
                                                    ].map(n => (
                                                        <div key={n.label} className="bg-white/10 rounded-xl p-3 text-center">
                                                            <p className="text-xs text-slate-300 mb-1">{n.label}</p>
                                                            <a href={`tel:${n.number}`} className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">{n.number}</a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                };
                                return <EmergencyTab />;
                            })()}

                            {activeTab === 'vision-triage' && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4 mb-6">
                                        <div className="p-2 bg-teal-50 rounded-xl">
                                            <ActivityIcon className="h-7 w-7 text-teal-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-teal-800 outfit tracking-tight">Vision Analyzer</h2>
                                            <p className="text-slate-500 mt-2 text-base">Complete health triage using AI and your device's camera.</p>
                                        </div>
                                    </div>
                                    <VisionTriage />
                                </div>
                            )}

                            {activeTab === 'dignity-companion' && (
                                <DignityCompanion
                                    onHide={() => {
                                        setActiveTab('home'); // Panic hide: Go to innocuous home screen
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
