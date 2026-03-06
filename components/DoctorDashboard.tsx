import React, { useState } from 'react';
import { MedicalRecord, ReportStatus, UserRole, ChatMessage, UserProfile } from '../types';
import ReportView from './ReportView';
import ReportList from './ReportList';
import Header from './Header';
import { Sidebar, TabType } from './Sidebar';
import { FolderIcon, CheckCircleIcon, DownloadIcon, MessageSquareIcon, SettingsIcon } from './ui/Icons';
import { LanguageSelector } from './LanguageSelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import ChatInterface from './ChatInterface';
import { generateReportPDF } from '../services/pdfService';


const VerifiedReportItem: React.FC<{ record: MedicalRecord, currentUserId: string, onSendMessage: (recordId: string, message: ChatMessage) => void }> = ({ record, currentUserId, onSendMessage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasUnreadMessage = record.chat && record.chat.length > 0 && record.chat[record.chat.length - 1].senderId !== currentUserId;

  const handleDownload = () => {
    generateReportPDF(record);
  };

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      text,
      timestamp: new Date().toISOString()
    };
    onSendMessage(record.id, newMessage);
  };

  return (
    <div className="border-t border-slate-100/50">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center gap-3">
          {hasUnreadMessage && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>}
          <div>
            <span className="font-semibold text-slate-800">Patient: {record.patientData.name}</span>
            <span className="text-sm text-slate-500 ml-2 font-medium">(ID: {record.patientData.id})</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-500 bg-slate-100/80 px-3 py-1 rounded-md">{new Date(record.verifiedDate!).toLocaleDateString()}</span>
          <span className="text-sm font-bold text-primary flex items-center gap-1">
            {isExpanded ? 'Collapse' : 'Expand'}
            <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
          </span>
        </div>
      </button>
      {isExpanded && record.aiReport && (
        <div className="p-6 bg-slate-50/50 border-t border-slate-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <strong className="text-primary block mb-1">Patient Details</strong>
              <p className="text-slate-700">{record.patientData.name} <span className="text-slate-500">(Age: {record.patientData.age})</span></p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <strong className="text-primary block mb-1">Severity</strong>
              <p className="text-slate-700 font-medium">{record.aiReport.severity}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
              <strong className="text-primary block mb-1">Symptoms</strong>
              <p className="text-slate-700">{[(record.patientData.symptoms || []), record.patientData.otherSymptoms].flat().filter(Boolean).join(', ')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
              <strong className="text-primary block mb-1">Diagnosis</strong>
              <p className="text-slate-700 leading-relaxed">{record.aiReport.diagnosis}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <strong className="text-primary block mb-1">Recommended Medications</strong>
              <p className="text-slate-700 whitespace-pre-wrap">{record.aiReport.medication}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <strong className="text-primary block mb-1">Diet Plan</strong>
              <p className="text-slate-700 whitespace-pre-wrap">{record.aiReport.dietPlan}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
              <strong className="text-primary block mb-1">My Notes</strong>
              <p className="text-slate-700 whitespace-pre-wrap">{record.doctorNotes || 'No additional notes.'}</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" size="sm" onClick={handleDownload} className="shadow-sm">
              <DownloadIcon className="h-4 w-4 mr-2" /> Download Report
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 outfit">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary"><MessageSquareIcon className="h-5 w-5" /></span>
              Chat with {record.patientData.name}
            </h4>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <ChatInterface
                messages={record.chat || []}
                currentUserId={currentUserId}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DoctorDashboardProps {
  doctorProfile?: UserProfile;
  records: MedicalRecord[];
  updateRecord: (updatedRecord: MedicalRecord) => void;
  doctorId: string;
  addChatMessage: (recordId: string, message: ChatMessage) => void;
  selectedRecord: MedicalRecord | null;
  setSelectedRecord: (record: MedicalRecord | null) => void;
  user: { role: UserRole, id: string | null };
  onLogout: () => void;
  apiStatus?: boolean;
  dbStatus?: boolean;
  userName?: string;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctorProfile, records, updateRecord, doctorId, addChatMessage, selectedRecord, setSelectedRecord, user, onLogout, apiStatus, dbStatus, userName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const handleSelectReport = (id: string) => {
    const record = records.find(r => r.id === id);
    if (record) {
      setSelectedRecord(record);
    }
  };

  const handleBack = () => {
    setSelectedRecord(null);
  };

  const handleUpdateAndGoBack = (updatedRecord: MedicalRecord) => {
    const now = new Date();
    updateRecord({
      ...updatedRecord,
      status: ReportStatus.VERIFIED,
      verifiedBy: `Dr. ${doctorId}`,
      verifiedDate: now.toISOString(),
    });
    handleBack();
  }

  const reportsToReview = records
    .filter(r => r.status === ReportStatus.PENDING_DOCTOR)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const verifiedReports = records
    .filter(r => r.status === ReportStatus.VERIFIED && r.verifiedBy === `Dr. ${doctorId}`)
    .sort((a, b) => new Date(b.verifiedDate!).getTime() - new Date(a.verifiedDate!).getTime());

  if (selectedRecord) {
    const originalRecord = selectedRecord.followUpFor
      ? records.find(r => r.id === selectedRecord.followUpFor)
      : undefined;

    return (
      <div className="container mx-auto p-4 md:p-8">
        <ReportView
          record={selectedRecord}
          originalRecord={originalRecord}
          userRole={UserRole.DOCTOR}
          onBack={handleBack}
          updateRecord={handleUpdateAndGoBack}
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
          setSelectedRecord(null); // Clear selected record when switching tabs
        }}
      />

      <div className="flex-1 flex flex-col md:ml-64 ml-20 h-screen overflow-hidden animate-fade-in-up transition-all duration-300">
        <Header
          onLogout={onLogout}
          userId={user.id}
          userName={userName}
          userRole={user.role}
          reportStatus={selectedRecord?.status}
          apiStatus={apiStatus}
          dbStatus={dbStatus}
        />
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-8">

          {activeTab === 'home' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Pending Reports Section */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200/60 pb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-primary flex items-center gap-3 outfit tracking-tight">
                      <span className="p-2 bg-primary/10 rounded-xl"><FolderIcon className="h-7 w-7 text-primary" /></span>
                      Patient Reports for Review
                    </h2>
                    <p className="text-slate-500 mt-2 text-base">
                      Review, edit, and verify new patient reports submitted for AI analysis.
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200/50 shadow-sm">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</span>
                    <p className="text-2xl font-bold text-primary text-center leading-none mt-1">{reportsToReview.length}</p>
                  </div>
                </div>

                <div className="relative">
                  {/* Decorative background blur for the list */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-2xl blur-xl -z-10"></div>
                  <ReportList
                    records={reportsToReview}
                    onSelectReport={handleSelectReport}
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in-up">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-md">
                      {doctorProfile?.name?.charAt(0) || doctorId.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-slate-800">{doctorProfile?.name || `Dr. ${doctorId}`}</CardTitle>
                      <CardDescription className="text-primary font-medium mt-1">Verified Medical Professional</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Contact Information</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Email Address</p>
                          <p className="text-base text-slate-800 font-medium">{doctorProfile?.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Phone Number</p>
                          <p className="text-base text-slate-800 font-medium">+91 Not available</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Professional Details</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Clinic / Hospital Address</p>
                          <p className="text-base text-slate-800 font-medium">{[doctorProfile?.addressLine1, doctorProfile?.addressLine2, doctorProfile?.district, doctorProfile?.state, doctorProfile?.country].filter(Boolean).join(', ') || 'Address not listed'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Preferred Language</p>
                          <p className="text-base text-slate-800 font-medium capitalize">{doctorProfile?.preferredLanguage || 'English'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200/60 pb-4">
                <div>
                  <h2 className="text-3xl font-bold text-emerald-700 flex items-center gap-3 outfit tracking-tight">
                    <span className="p-2 bg-emerald-100/80 rounded-xl"><CheckCircleIcon className="h-7 w-7 text-emerald-600" /></span>
                    Verified Reports
                  </h2>
                  <p className="text-slate-500 mt-2 text-base">
                    Patient reports that you have personally reviewed and verified.
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200/50 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                  <p className="text-2xl font-bold text-emerald-600 text-center leading-none mt-1">{verifiedReports.length}</p>
                </div>
              </div>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden mt-6">
                <CardContent className="p-0">
                  {verifiedReports.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {verifiedReports.map(rec => <VerifiedReportItem key={rec.id} record={rec} currentUserId={doctorId} onSendMessage={addChatMessage} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium text-lg">No verified reports yet.</p>
                      <p className="text-slate-400 text-sm mt-1">Review pending reports from the Home tab to add them here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-2xl font-bold text-slate-700 capitalize mb-2">Doctor Chat coming soon</h2>
              <p className="text-slate-500">This feature is currently under development.</p>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;