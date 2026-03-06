import React, { useState } from 'react';
import { MedicalRecord, ReportStatus, AIReport, UserRole } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { CheckCircleIcon, ArrowLeftIcon } from './ui/Icons';
import { Button } from './ui/Button';

interface ReportViewProps {
    record: MedicalRecord;
    originalRecord?: MedicalRecord; // For follow-ups
    userRole: UserRole;
    onBack: () => void;
    updateRecord: (record: MedicalRecord) => void;
}

const ReportField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-3 px-4 rounded-lg bg-white/50 border border-slate-100/50 shadow-sm transition-all hover:bg-white flex flex-col justify-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="text-sm text-slate-800 font-medium">{children}</div>
    </div>
);

const ReportView: React.FC<ReportViewProps> = ({ record, originalRecord, userRole, onBack, updateRecord }) => {
    const [editableReport, setEditableReport] = useState<AIReport>(() => JSON.parse(JSON.stringify(record.aiReport)));
    const [doctorNotes, setDoctorNotes] = useState('');

    const handleVerify = () => {
        updateRecord({
            ...record,
            aiReport: editableReport,
            doctorNotes: doctorNotes
        });
    };

    // Loading view while AI is analyzing
    if (record.status === ReportStatus.PENDING_AI) {
        return (
            <Card className="max-w-2xl mx-auto text-center border-none shadow-premium bg-white animate-fade-in-up mt-8">
                <CardContent className="p-12 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary absolute top-0 left-0"></div>
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl outfit">AI</div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 outfit mb-2">Analyzing Health Data</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Please wait a moment while Medzora AI processes the provided symptoms and medical history...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Doctor's editable review view
    if (userRole === UserRole.DOCTOR) {
        const { medicalHistory, medicalHistoryFileName } = record.patientData;
        const isHistoryFile = medicalHistory?.startsWith('data:');

        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-teal-700 transition-colors bg-white/50 px-4 py-2 rounded-lg shadow-sm w-fit border border-slate-200/50 backdrop-blur-sm">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Reports
                </button>
                <Card className="border-none shadow-premium bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/5 pb-5">
                        <CardTitle className="text-2xl text-primary outfit flex items-center gap-3">
                            <span className="p-2 bg-primary/10 rounded-xl"><CheckCircleIcon className="h-6 w-6" /></span>
                            Review AI Analysis
                        </CardTitle>
                        <CardDescription className="text-slate-500 mt-2">Carefully review the medical analysis and make any professional adjustments before finalizing the patient report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {record.followUpNote && (
                            <div className="p-5 border border-primary/20 rounded-xl bg-primary/5 space-y-2 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                <h3 className="font-bold text-primary flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] leading-none">!</span>
                                    Follow-up Request
                                </h3>
                                <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{record.followUpNote}</p>
                            </div>
                        )}

                        {originalRecord && originalRecord.aiReport && (
                            <details className="group border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                <summary className="p-4 font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <span className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">O</span>
                                        Previous Report Details
                                    </span>
                                    <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">▼</span>
                                </summary>
                                <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><strong className="block text-primary mb-1 text-xs uppercase tracking-wider">Diagnosis</strong><span className="text-slate-700">{originalRecord.aiReport.diagnosis}</span></div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><strong className="block text-primary mb-1 text-xs uppercase tracking-wider">Medication</strong><span className="text-slate-700">{originalRecord.aiReport.medication}</span></div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm md:col-span-2"><strong className="block text-primary mb-1 text-xs uppercase tracking-wider">Doctor's Notes</strong><span className="text-slate-700">{originalRecord.doctorNotes || 'N/A'}</span></div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 text-right">
                                        Verified On: <span className="font-medium">{new Date(originalRecord.verifiedDate!).toLocaleString()}</span>
                                    </div>
                                </div>
                            </details>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 outfit">
                                <span className="w-8 h-px bg-slate-200 block"></span>
                                Patient Profile
                                <span className="flex-1 h-px bg-slate-200 block"></span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReportField label="Patient Name">{record.patientData.name}</ReportField>
                                <ReportField label="Age">{record.patientData.age}</ReportField>
                                <ReportField label="Gender">{record.patientData.gender}</ReportField>
                                <div className="md:col-span-3">
                                    <ReportField label="Email">{record.patientData.email}</ReportField>
                                </div>
                                <div className="md:col-span-3">
                                    <ReportField label="Symptoms">{[(record.patientData.symptoms || []), record.patientData.otherSymptoms].flat().filter(Boolean).join(', ')}</ReportField>
                                </div>
                                <div className="md:col-span-3">
                                    <ReportField label="Medical History">
                                        {isHistoryFile ? (
                                            <div className="space-y-2">
                                                <Button variant="outline" size="sm" asChild className="mb-2">
                                                    <a href={medicalHistory} download={medicalHistoryFileName} className="flex items-center gap-2">
                                                        Download: <span className="font-semibold truncate max-w-[200px]">{medicalHistoryFileName}</span>
                                                    </a>
                                                </Button>
                                                {medicalHistory.startsWith('data:image') && <div className="p-2 bg-white rounded-lg border border-slate-200 inline-block"><img src={medicalHistory} alt="Medical history preview" className="max-w-xs rounded shadow-sm" /></div>}
                                            </div>
                                        ) : (
                                            <span className={medicalHistory ? 'text-slate-700' : 'text-slate-400 italic'}>{medicalHistory || 'No history provided'}</span>
                                        )}
                                    </ReportField>
                                </div>
                                <div className="md:col-span-3">
                                    <ReportField label="Current Medications">
                                        <span className={record.patientData.currentMedications ? 'text-slate-700' : 'text-slate-400 italic'}>{record.patientData.currentMedications || 'None listed'}</span>
                                    </ReportField>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 -mx-6 px-6 bg-slate-50/50 border-y border-slate-100/80 shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 text-xl outfit">Medical Assessment</h3>
                                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded uppercase tracking-wider border border-primary/20">Editable</span>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Diagnosis</label>
                                    <input type="text" value={editableReport.diagnosis} onChange={e => setEditableReport({ ...editableReport, diagnosis: e.target.value })} className="block w-full rounded-lg border-slate-200 shadow-sm sm:text-sm bg-slate-50 hover:bg-white focus:bg-white focus:border-primary focus:ring-primary transition-colors py-2.5 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Severity Level</label>
                                    <div className="relative">
                                        <select value={editableReport.severity} onChange={e => setEditableReport({ ...editableReport, severity: e.target.value })} className="block w-full rounded-lg border-slate-200 shadow-sm sm:text-sm bg-slate-50 hover:bg-white focus:bg-white focus:border-primary focus:ring-primary transition-colors py-2.5 px-3 appearance-none">
                                            <option value="Low">Low - Routine monitoring</option>
                                            <option value="Medium">Medium - Requires attention</option>
                                            <option value="High">High - Urgent care needed</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Recommended Medications</label>
                                    <textarea value={editableReport.medication} onChange={e => setEditableReport({ ...editableReport, medication: e.target.value })} placeholder="e.g., Ibuprofen 400mg every 8 hours" rows={3} className="block w-full rounded-lg border-slate-200 shadow-sm sm:text-sm bg-slate-50 hover:bg-white focus:bg-white focus:border-primary focus:ring-primary transition-colors py-2.5 px-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Diet Tracking & Physical Activity</label>
                                    <textarea value={editableReport.dietPlan} onChange={e => setEditableReport({ ...editableReport, dietPlan: e.target.value })} rows={3} className="block w-full rounded-lg border-slate-200 shadow-sm sm:text-sm bg-slate-50 hover:bg-white focus:bg-white focus:border-primary focus:ring-primary transition-colors py-2.5 px-3" />
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Extra Doctor's Notes (Only visible to Patient)</label>
                                    <textarea value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)} placeholder="Add any reassuring comments or specific instructions here..." rows={4} className="block w-full rounded-lg border-slate-200 shadow-sm sm:text-sm bg-sky-50 focus:bg-white focus:border-primary focus:ring-primary transition-colors py-2.5 px-3 placeholder:text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">Cancel Review</Button>
                            <Button onClick={handleVerify} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-none shadow-lg shadow-emerald-500/30 font-bold tracking-wide">
                                <CheckCircleIcon className="h-5 w-5 mr-2" /> Finalize & Verify Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Patient's view of the AI analysis (pending review)
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up mt-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-teal-700 transition-colors bg-white/50 px-4 py-2 rounded-lg shadow-sm border border-slate-200/50 backdrop-blur-sm w-fit">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Dashboard
            </button>
            <Card className="border-none shadow-premium bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                </div>
                <CardHeader className="text-center bg-gradient-to-b from-slate-50 to-transparent pb-4 border-b border-slate-100">
                    <CardTitle className="text-2xl outfit text-primary">Medical Analysis</CardTitle>
                    <CardDescription className="text-slate-500">The results below are AI-generated and awaiting review from an authorized doctor.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReportField label="Patient Name">{record.patientData.name}</ReportField>
                        <div className="grid grid-cols-2 gap-4">
                            <ReportField label="Age">{record.patientData.age}</ReportField>
                            <ReportField label="Gender">{record.patientData.gender}</ReportField>
                        </div>
                        <div className="md:col-span-2">
                            <ReportField label="Symptoms">{[(record.patientData.symptoms || []), record.patientData.otherSymptoms].flat().filter(Boolean).join(', ')}</ReportField>
                        </div>
                        <div className="md:col-span-2 border-t border-slate-100 my-2 pt-4"></div>
                        <div className="md:col-span-2">
                            <ReportField label="Probable Diagnosis">
                                <span className="text-lg font-bold text-slate-800 leading-tight">{record.aiReport?.diagnosis}</span>
                            </ReportField>
                        </div>
                        <ReportField label="Severity">
                            <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm ${record.aiReport?.severity === 'Low' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                record.aiReport?.severity === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                } border`}>
                                {record.aiReport?.severity === 'Low' ? '🟢' : record.aiReport?.severity === 'Medium' ? '🟡' : '🔴'}
                                {record.aiReport?.severity}
                            </span>
                        </ReportField>
                        <div className="md:col-span-2">
                            <ReportField label="Recommended Care & Medications">{record.aiReport?.medication}</ReportField>
                        </div>
                        <div className="md:col-span-2">
                            <ReportField label="Diet & Lifestyle Plan">{record.aiReport?.dietPlan}</ReportField>
                        </div>
                        <div className="md:col-span-2 mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            <p className="font-bold text-amber-800 text-sm flex items-center gap-2">
                                <span className="text-lg leading-none">⏳</span> Verification Pending
                            </p>
                            <p className="text-xs text-amber-700/80 font-medium mt-1 ml-6">
                                A doctor will review this report shortly to provide an official prescription and further instructions.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportView;