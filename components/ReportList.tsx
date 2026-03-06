import React from 'react';
import { MedicalRecord, ReportStatus } from '../types';
import { Card } from './ui/Card';
import { FolderIcon } from './ui/Icons';

interface ReportListProps {
  records: MedicalRecord[];
  onSelectReport: (id: string) => void;
}

const ReportList: React.FC<ReportListProps> = ({ records, onSelectReport }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-slate-200/60 rounded-3xl bg-white shadow-sm transition-all duration-300 hover:bg-slate-50 group">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
          <FolderIcon className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors duration-500 delay-100" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">All Clear!</h3>
        <p className="mt-3 text-base text-slate-500 max-w-sm mx-auto leading-relaxed">
          There are no new patient reports awaiting review at this time. Relax and take a breath.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
      {records.map(record => (
        <Card
          key={record.id}
          className="group hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden border-none shadow-premium bg-white relative"
          onClick={() => onSelectReport(record.id)}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div className="max-w-[70%]">
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors truncate" title={record.patientData.name}>{record.patientData.name}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1.5 tracking-wider uppercase font-mono bg-slate-100/50 inline-block px-2 py-0.5 rounded-md">ID: {record.patientData.id}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <div className="text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r relative from-amber-100 to-amber-50 text-amber-600 font-bold tracking-wider uppercase shadow-sm border border-amber-200/50 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Pending
                  </span>
                </div>
                {record.followUpFor && (
                  <div className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-bold tracking-wider uppercase border border-primary/20 shadow-sm flex items-center gap-1">
                    <span className="text-[14px]">↻</span> Follow-up
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm text-slate-500 font-medium">
                <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center mr-3 shadow-sm border border-slate-200/60">📅</span>
                {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>

              <div className="pt-4 border-t border-slate-100/80">
                <p className="text-sm font-medium text-slate-700 flex flex-col gap-1.5">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Symptoms Evaluated</span>
                  <span className="line-clamp-2 text-slate-600 leading-snug">
                    {record.patientData?.symptoms ? (record.patientData.symptoms.join(', ')) : 'None reported'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReportList;