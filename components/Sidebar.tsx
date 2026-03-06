import React from 'react';
import { HomeIcon, UserIcon, DocumentIcon, MessageSquareIcon, SettingsIcon, EmergencyIcon, CameraIcon, HeartIcon } from './ui/Icons';
import { LanguageSelector } from './LanguageSelector';
import { UserRole } from '../types';

export type TabType = 'home' | 'profile' | 'records' | 'chat' | 'settings' | 'emergencies' | 'vision-triage' | 'dignity-companion';

interface SidebarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userRole }) => {
    const tabs = [
        { id: 'home', icon: HomeIcon, label: 'Home' },
        { id: 'profile', icon: UserIcon, label: 'Profile' },
        { id: 'records', icon: DocumentIcon, label: userRole === UserRole.DOCTOR ? 'Verified Reports' : 'Reports' },
        ...(userRole === UserRole.PATIENT ? [
            { id: 'emergencies', icon: EmergencyIcon, label: 'Emergencies' },
            { id: 'vision-triage', icon: CameraIcon, label: 'Vision Analyzer' },
            { id: 'dignity-companion', icon: HeartIcon, label: 'For Women' }
        ] : []),
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    ] as const;

    return (
        <div className="w-20 md:w-64 bg-primary flex flex-col pt-8 pb-6 shadow-xl flex-shrink-0 z-20 transition-all duration-300 fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden rounded-r-3xl md:rounded-r-none">
            {/* Logo Area */}
            <div className="flex items-center justify-center md:justify-start px-4 md:px-8 mb-10 w-full">
                <span className="w-10 h-10 rounded-2xl bg-white text-primary flex items-center justify-center text-2xl font-bold shadow-sm flex-shrink-0">M</span>
                <h1 className="hidden md:block text-2xl font-bold text-white tracking-tight outfit ml-3">
                    MedZora
                </h1>
            </div>

            <div className="flex-1 w-full flex flex-col space-y-2 mt-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <div key={tab.id} className="w-full relative py-1 pl-4 md:pl-6">
                            <button
                                onClick={() => onTabChange(tab.id)}
                                className={`w-full flex items-center py-3.5 md:py-4 px-4 md:px-6 rounded-l-3xl transition-all duration-300 relative group overflow-hidden ${isActive
                                    ? 'bg-slate-50 text-primary shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.1)] z-10'
                                    : 'text-white/80 hover:text-white bg-transparent hover:bg-white/10'
                                    }`}
                                title={tab.label}
                            >
                                {/* Visual connectors for active state to blend into main background */}
                                {isActive && (
                                    <>
                                        {/* Top curve */}
                                        <div className="absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-3xl shadow-[5px_5px_0_5px_#f8fafc] hidden md:block"></div>
                                        {/* Bottom curve */}
                                        <div className="absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-3xl shadow-[5px_-5px_0_5px_#f8fafc] hidden md:block"></div>
                                    </>
                                )}

                                <Icon className={`w-6 h-6 md:w-5 md:h-5 transition-transform duration-300 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`hidden md:block ml-4 font-medium text-base tracking-wide ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
