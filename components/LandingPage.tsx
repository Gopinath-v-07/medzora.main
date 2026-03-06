import React from 'react';

interface LandingPageProps {
    onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    return (
        <div className="bg-gradient-to-br from-teal-50 to-white min-h-screen flex flex-col font-sans overflow-x-hidden">
            {/* Navigation Bar */}
            <header className="w-full bg-transparent absolute top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* CSS Logo icon */}
                        <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight outfit flex flex-col leading-tight">
                            <span>MedZora</span>
                            <span className="text-[10px] text-teal-600 uppercase tracking-widest font-semibold">AI Medical Assistant</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
                        <a href="#" className="text-slate-900 font-semibold">Home</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">About Us</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Services</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Doctors</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Contact Us</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLoginClick}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all active:scale-95"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-32 container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center">

                {/* Left Content */}
                <div className="lg:w-1/2 z-10 animate-fade-in-up pr-0 lg:pr-10">
                    <h2 className="text-xl md:text-2xl font-medium text-slate-700 mb-2">AI-Driven Medical Analysis</h2>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight outfit mb-6 leading-[1.1]">
                        Empowering Patients Before<br /> The Consultation
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base mb-10 max-w-lg leading-relaxed">
                        Discover preliminary insights, log your symptoms, and prepare structured reports for your doctor with the help of advanced artificial intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
                        <button onClick={onLoginClick} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium shadow-md transition-all">
                            Get Started
                        </button>
                        <button className="bg-transparent border border-teal-500 text-teal-600 hover:bg-teal-50 px-8 py-3 rounded-lg font-medium transition-all">
                            Learn More
                        </button>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur border border-teal-100 rounded-full py-2 px-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Verified Medical Professionals</p>
                            <p className="text-[10px] text-slate-500">Your AI reports are reviewed by real doctors.</p>
                        </div>
                    </div>
                </div>

                {/* Right Decorative Graphic (Replacing Image) */}
                <div className="lg:w-1/2 relative mt-16 lg:mt-0 flex justify-center items-center h-[500px]">
                    {/* Abstract overlapping shapes */}
                    <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-teal-400 rounded-bl-[150px] rounded-tl-full rounded-tr-full opacity-60 z-0 transform translate-x-10 translate-y-[-50px]"></div>
                    <div className="absolute right-10 bottom-10 w-[300px] h-[300px] bg-white rounded-tr-[100px] rounded-bl-[100px] rounded-tl-3xl rounded-br-3xl shadow-2xl z-10 p-8 flex flex-col items-center justify-center border border-teal-50">
                        <div className="w-24 h-24 mb-6 rounded-full bg-teal-50 flex items-center justify-center border-4 border-teal-100">
                            <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">AI Intelligent Assistant</h3>
                        <p className="text-slate-500 text-center text-sm">Analyze symptoms instantly with MedZora.</p>
                    </div>
                </div>

                {/* Floating Search Bar snippet */}
                <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 w-full max-w-3xl bg-white rounded-2xl shadow-premium border-2 border-teal-500 p-4 md:p-6 z-20 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-lg font-bold text-slate-800 mb-2">MedZora Intelligence Framework</h4>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input type="text" className="w-full pl-10 pr-3 py-2 bg-teal-50/50 border-none rounded-full text-sm focus:ring-2 focus:ring-teal-300" placeholder="Enter your symptoms for preliminary analysis..." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats section */}
            <section className="pt-32 pb-24 bg-white relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 outfit">Why Choose MedZora</h2>
                        <p className="text-slate-500 text-sm">Empowering your healthcare journey with artificial intelligence, secure records, and seamless doctor communication.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Stat 1 */}
                        <div className="bg-teal-50 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-teal-100/50">
                            <h3 className="text-4xl font-bold text-slate-900 mb-4">10,000+</h3>
                            <p className="text-lg font-bold text-slate-800 mb-4 leading-tight">AI Analyses<br /> Generated</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Instant, accurate preliminary medical assessments driven by advanced models.</p>
                        </div>
                        {/* Stat 2 */}
                        <div className="bg-teal-500 rounded-2xl p-8 text-white hover:-translate-y-2 transition-transform duration-300 shadow-lg shadow-teal-500/20">
                            <h3 className="text-4xl font-bold mb-4">100%</h3>
                            <p className="text-lg font-bold mb-4 leading-tight">Secure Data<br /> Storage</p>
                            <p className="text-[11px] text-white/80 leading-relaxed">Your medical records and history are completely encrypted and private.</p>
                        </div>
                        {/* Stat 3 */}
                        <div className="bg-slate-50 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
                            <h3 className="text-4xl font-bold text-slate-900 mb-4">24/7</h3>
                            <p className="text-lg font-bold text-slate-800 mb-4 leading-tight">AI Medical<br /> Assistant</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Always available to listen to your symptoms and provide guidance.</p>
                        </div>
                        {/* Stat 4 */}
                        <div className="bg-slate-50 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-slate-100">
                            <h3 className="text-4xl font-bold text-slate-900 mb-4">50+</h3>
                            <p className="text-lg font-bold text-slate-800 mb-4 leading-tight">Connected<br /> Specialists</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Easily share your AI-generated reports directly with verified doctors.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
