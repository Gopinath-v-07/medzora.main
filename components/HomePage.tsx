import React from 'react';
import { MedicalRecord, UserRole } from '../types';
import ReportList from './ReportList';
import { Button } from './ui/Button';
import { PlusCircleIcon, FolderIcon } from './ui/Icons';

interface HomePageProps {
  userRole: UserRole;
  records: MedicalRecord[];
  onSelectReport: (id: string) => void;
  onCreateReport: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ userRole, records, onSelectReport, onCreateReport }) => {
  const title = userRole === UserRole.PATIENT ? "My Medical Reports" : "Patient Submissions";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <FolderIcon className="h-7 w-7 text-teal-600" />
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                {userRole === UserRole.PATIENT ? "View your past reports or create a new one." : "Review, edit, and verify patient reports."}
            </p>
        </div>
        {userRole === UserRole.PATIENT && (
          <Button onClick={onCreateReport}>
            <PlusCircleIcon className="h-5 w-5" />
            Create New Report
          </Button>
        )}
      </div>

      {/* FIX: Removed unused and undeclared `userRole` prop from ReportList component. */}
      <ReportList 
        records={records} 
        onSelectReport={onSelectReport}
      />
    </div>
  );
};

export default HomePage;