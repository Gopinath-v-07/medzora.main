import React, { useState, useEffect } from 'react';
import { UserRole, MedicalRecord, ReportStatus, ChatMessage, UserCredentials, UserProfile } from './types';
import LoginScreen from './components/LoginScreen';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import { changeAppLanguage } from './utils/translation';

interface SignUpData extends UserProfile {
  password?: string;
  role: UserRole;
  doctorCode?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole, id: string | null }>({ role: UserRole.NONE, id: null });
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [notifications, setNotifications] = useState<Record<string, { id: string, message: string }[]>>({});

  const [apiStatus, setApiStatus] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<boolean>(false);

  // Check Backend Connections
  useEffect(() => {
    const checkConnections = async () => {
      try {
        const response = await fetch('/api/health');
        setApiStatus(response.ok);
        setDbStatus(response.ok);
      } catch (e) {
        setApiStatus(false);
        setDbStatus(false);
      }
    };

    checkConnections();
    const interval = setInterval(checkConnections, 30000);
    return () => clearInterval(interval);
  }, []);

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Sync Data
  useEffect(() => {
    if (!user.id) return;

    const fetchData = async () => {
      try {
        const params = user.role === UserRole.PATIENT
          ? `?patient_id=${user.id}`
          : `?doctor_id=${user.id}`;
        const res = await fetch(`/api/records${params}`, {
          headers: { ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          setMedicalRecords(data);
        }
      } catch (e) {
        console.error("Sync failed", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setUser({ role: data.user.role as UserRole, id: data.user.id.toString() });
        setUserProfiles([data.profile]);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  };

  const handleSignUp = async (data: Omit<SignUpData, 'id'>): Promise<'SUCCESS' | 'ID_EXISTS' | 'INVALID_CODE'> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setAuthToken(result.token);
        const newUser = { role: result.user.role as UserRole, id: result.user.id.toString() };
        setUser(newUser);

        // Reconstruct profile object to avoid "Loading Profile"
        const newProfile: UserProfile = {
          id: result.user.id.toString(),
          name: data.name,
          age: data.age,
          role: data.role,
          gender: data.gender,
          email: data.email,
          preferredLanguage: data.preferredLanguage,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          district: data.district,
          state: data.state,
          country: data.country
        };
        setUserProfiles([newProfile]);

        return 'SUCCESS';
      } else {
        const err = await response.json();
        if (err.error === 'ID_EXISTS') return 'ID_EXISTS';
        if (err.error === 'INVALID_CODE') return 'INVALID_CODE';
        return 'SUCCESS';
      }
    } catch (e) {
      console.error("Signup failed", e);
      return 'SUCCESS'; // Fallback for demo
    }
  }

  const handleLogout = async () => {
    setUser({ role: UserRole.NONE, id: null });
    setAuthToken(null);
    setSelectedRecord(null);
  };

  const addOrUpdateRecord = async (record: MedicalRecord) => {
    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(record)
      });
    } catch (e) {
      console.error("Record update failed", e);
    }
  };

  const addChatMessage = async (recordId: string, message: ChatMessage) => {
    const record = medicalRecords.find(r => r.id === recordId);
    if (record) {
      const updatedRecord = {
        ...record,
        chat: record.chat ? [...record.chat, message] : [message]
      };
      await addOrUpdateRecord(updatedRecord);
    }
  };

  const dismissNotification = async (userId: string, notificationId: string) => {
    // Notifications logic can be implemented via Postgres as well if needed
  };

  const updatePatientProfile = async (profile: UserProfile) => {
    // TODO: Implement profile update endpoint
    console.log("Profile update", profile);
  };

  const renderContent = () => {
    if (!user.id) {
      if (authView === 'landing') {
        return <LandingPage onLoginClick={() => setAuthView('login')} />;
      }
      return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} onBack={() => setAuthView('landing')} />;
    }

    switch (user.role) {
      case UserRole.PATIENT:
        const profile = userProfiles.find(p => p.id.toString() === user.id);
        if (!profile) {
          // Fallback if profile didn't sync yet
          return <div className="p-10 text-center">Loading Profile...</div>;
        }
        return <PatientDashboard
          patientProfile={profile}
          records={medicalRecords}
          notifications={notifications[user.id] || []}
          addOrUpdateRecord={addOrUpdateRecord}
          addChatMessage={addChatMessage}
          updatePatientProfile={updatePatientProfile}
          dismissNotification={(notifId) => dismissNotification(user.id!, notifId)}
          selectedRecord={selectedRecord}
          setSelectedRecord={setSelectedRecord}
          user={user}
          onLogout={handleLogout}
          authToken={authToken}
          apiStatus={apiStatus}
          dbStatus={dbStatus}
          userName={profile.name}
        />;
      case UserRole.DOCTOR:
        const doctorProfile = userProfiles.find(p => p.id.toString() === user.id);
        return <DoctorDashboard
          doctorProfile={doctorProfile}
          doctorId={user.id}
          records={medicalRecords}
          updateRecord={addOrUpdateRecord}
          addChatMessage={addChatMessage}
          selectedRecord={selectedRecord}
          setSelectedRecord={setSelectedRecord}
          user={user}
          onLogout={handleLogout}
          apiStatus={apiStatus}
          dbStatus={dbStatus}
          userName={doctorProfile?.name || 'Doctor'}
        />;
      default:
        return <LandingPage onLoginClick={() => setAuthView('login')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default App;