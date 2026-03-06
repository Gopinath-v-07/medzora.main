import React, { useState, useRef, useEffect } from 'react';
import { LogOutIcon, BellIcon } from './ui/Icons';
import { UserRole, ReportStatus } from '../types';

interface HeaderProps {
  onLogout: () => void;
  userId: string | null;
  userName?: string;
  userRole: UserRole | null;
  reportStatus?: ReportStatus;
  notifications?: { id: string, message: string }[];
  dismissNotification?: (id: string) => void;
  apiStatus?: boolean;
  dbStatus?: boolean;
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING_AI:
    case ReportStatus.PENDING_DOCTOR:
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case ReportStatus.VERIFIED:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
}

const Header: React.FC<HeaderProps> = ({ onLogout, userId, userName, userRole, reportStatus, notifications = [], dismissNotification, apiStatus, dbStatus }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = () => {
    switch (userRole) {
      case UserRole.PATIENT: return "Patient";
      case UserRole.DOCTOR: return "Doctor";
      default: return "User";
    }
  }

  return (
    <header className="w-full bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight outfit flex items-center gap-3 md:hidden">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#1e3a8a] text-white flex items-center justify-center text-xl shadow-premium">M</span>
              Medzora
            </h1>
            <div className="flex flex-col">
              <h2 className="hidden md:block text-2xl font-bold text-slate-800 outfit tracking-tight">
                Dashboard
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5" title={dbStatus ? "Firebase Connected" : "Firebase Disconnected"}>
                  <div className={`w-2 h-2 rounded-full ${dbStatus ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DB</span>
                </div>
                <div className="flex items-center gap-1.5" title={apiStatus ? "ML API Online" : "ML API Offline"}>
                  <div className={`w-2 h-2 rounded-full ${apiStatus ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">API</span>
                </div>
              </div>
            </div>
            {reportStatus && (
              <span className={`px-4 py-1.5 text-xs font-semibold rounded-full hidden sm:inline-flex items-center shadow-sm ${getStatusColor(reportStatus)}`}>
                <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse opacity-70"></span>
                {reportStatus}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-100"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length > 0 ? (
                      <div className="space-y-1">
                        {notifications.map(notif => (
                          <div key={notif.id} className="flex justify-between items-start gap-2 p-3 hover:bg-slate-50 rounded-lg group transition-colors">
                            <p className="text-sm text-slate-600 leading-tight">{notif.message}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification && dismissNotification(notif.id);
                              }}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Dismiss"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p className="text-sm">You have no new notifications.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {userId && userRole && (
              <div className="px-3 py-1.5 rounded-full bg-secondary text-sm font-medium text-secondary-foreground shadow-inner border border-white/50 backdrop-blur-md hidden sm:flex items-center gap-2">
                <span className="opacity-70">{getRoleLabel()}</span>
                <span className="w-px h-3 bg-slate-300"></span>
                <span className="font-bold text-primary">{userName || userId}</span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-destructive transition-colors px-3 py-2 rounded-md hover:bg-destructive/10"
              aria-label="Logout"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;