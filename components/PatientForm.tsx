import React, { useState } from 'react';
import { PatientData, MedicalRecord, ReportStatus } from '../types';
import { COMMON_SYMPTOMS } from '../constants';
import { analyzePatientData } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

interface PatientFormProps {
  patientId: string;
  onSubmitSuccess: (newRecord: MedicalRecord) => void;
  onCancel: () => void;
}

// FIX: Add missing 'gender' property to initial data to match Omit<PatientData, 'id'> type.
const emptyPatientData: Omit<PatientData, 'id'> = {
  name: '',
  age: '',
  gender: 'Male',
  email: '',
  symptoms: [],
  otherSymptoms: '',
  medicalHistory: '',
  medicalHistoryFileName: undefined,
  currentMedications: '',
};

const PatientForm: React.FC<PatientFormProps> = ({ patientId, onSubmitSuccess, onCancel }) => {
  const [patientData, setPatientData] = useState(emptyPatientData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    // FIX: Add 'gender' and 'email' to the validation check.
    if (!patientData.name || !patientData.age || !patientData.gender || !patientData.email) {
        setError("Name, Age, Gender, and Email are required.");
        return;
    }
    setError('');
    setIsLoading(true);

    const fullPatientData: PatientData = { id: patientId, ...patientData };
    const tempRecord: MedicalRecord = {
        id: `temp-${Date.now()}`,
        date: new Date().toISOString(),
        patientData: fullPatientData,
        aiReport: null,
        status: ReportStatus.PENDING_AI
    };
    
    // Optimistically update UI
    onSubmitSuccess(tempRecord);

    try {
      const aiReport = await analyzePatientData(fullPatientData);
      onSubmitSuccess({
        ...tempRecord,
        id: `rec-${Date.now()}`, // Final ID
        aiReport,
        status: ReportStatus.PENDING_DOCTOR
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      // Revert optimistic update on failure by passing back a record to be removed
      onSubmitSuccess({ ...tempRecord, status: ReportStatus.NOT_STARTED }); // Special status to signify removal
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Medical Report</CardTitle>
        <CardDescription>Please fill out your details accurately for AI analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FIX: Add input for 'gender' and adjust grid layout. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input type="text" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Age</label>
              <input type="number" value={patientData.age} onChange={e => setPatientData({...patientData, age: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Gender</label>
              <select value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value as 'Male' | 'Female' | 'Other'})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
              </select>
            </div>
             <div>
              <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700" />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Symptoms</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {COMMON_SYMPTOMS.map(symptom => (
                <label key={symptom} className="flex items-center space-x-2 text-base text-slate-600 dark:text-slate-400">
                  <input type="checkbox" checked={patientData.symptoms.includes(symptom)} onChange={() => handleSymptomChange(symptom)} className="rounded text-teal-600 focus:ring-teal-500 border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-600" />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Other Symptoms (if any)</label>
            <input type="text" value={patientData.otherSymptoms} onChange={e => setPatientData({...patientData, otherSymptoms: e.target.value})} placeholder="e.g., Skin rash, joint pain" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700" />
          </div>
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Past Medical History</label>
            <p className="text-sm text-slate-500 mb-2">You can upload a file (image, PDF, .txt) or type below.</p>
            <input type="file" accept=".pdf,image/*,.txt" onChange={(e) => {
                const file = e.target.files?.[0];
                if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        setPatientData(prev => ({...prev, medicalHistory: ev.target?.result as string, medicalHistoryFileName: file.name}));
                    }
                    reader.readAsDataURL(file);
                }
            }} className="mt-1 block w-full text-base" />
            {patientData.medicalHistoryFileName && <p className="text-sm mt-1">Uploaded: {patientData.medicalHistoryFileName}</p>}
            <textarea rows={3} value={patientData.medicalHistory.startsWith('data:') ? '' : patientData.medicalHistory} onChange={e => setPatientData({...patientData, medicalHistory: e.target.value})} disabled={!!patientData.medicalHistoryFileName} placeholder="e.g., Diabetes, Hypertension" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700 disabled:bg-slate-200"></textarea>
          </div>
          <div>
            <label className="block text-base font-medium text-slate-700 dark:text-slate-300">Current Medications</label>
            <textarea rows={3} value={patientData.currentMedications} onChange={e => setPatientData({...patientData, currentMedications: e.target.value})} placeholder="e.g., Metformin 500mg, Aspirin 81mg" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-base bg-slate-50 dark:bg-slate-700"></textarea>
          </div>
          {error && <p className="text-base text-red-500">{error}</p>}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Submit for AI Analysis'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;