import React, { useState } from 'react';
import { UserRole } from '../types';
import { Button } from './ui/Button';
import { UserIcon, StethoscopeIcon } from './ui/Icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { LanguageSelector } from './LanguageSelector';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => boolean;
  onSignUp: (data: { password: string, name: string, age: string, gender: 'Male' | 'Female' | 'Other', email: string, preferredLanguage: string, role: UserRole, doctorCode?: string, addressLine1?: string, addressLine2?: string, district?: string, state?: string, country?: string }) => 'SUCCESS' | 'ID_EXISTS' | 'INVALID_CODE';
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp, onBack }) => {
  const [isPatientLogin, setIsPatientLogin] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Login State
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // SignUp State
  const [signUpName, setSignUpName] = useState('');
  const [signUpAge, setSignUpAge] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpGender, setSignUpGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [signUpLanguage, setSignUpLanguage] = useState('en');
  const [signUpAddressLine1, setSignUpAddressLine1] = useState('');
  const [signUpAddressLine2, setSignUpAddressLine2] = useState('');
  const [signUpDistrict, setSignUpDistrict] = useState('');
  const [signUpState, setSignUpState] = useState('');
  const [signUpCountry] = useState('India');
  const [signUpDoctorCode, setSignUpDoctorCode] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setError('');
    setSuccessMessage('');
    setId('');
    setPassword('');
    setSignUpName('');
    setSignUpAge('');
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
    setSignUpGender('Male');
    setSignUpLanguage('en');
    setSignUpAddressLine1('');
    setSignUpAddressLine2('');
    setSignUpDistrict('');
    setSignUpState('');
    setSignUpDoctorCode('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    const success = await onLogin(id, password);
    if (!success) {
      setError('Invalid ID or password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!signUpName || !signUpPassword || !signUpEmail) {
      setError("All required fields must be filled.");
      return;
    }
    if (isPatientLogin && (!signUpAge || !signUpGender || !signUpDoctorCode)) {
      setError("Please fill in age, gender, and doctor connection code.");
      return;
    }
    if (!isPatientLogin && !signUpDoctorCode) {
      setError("Doctor Verification Code is required.");
      return;
    }

    try {
      const result = await onSignUp({
        password: signUpPassword,
        name: signUpName,
        age: signUpAge,
        gender: signUpGender,
        email: signUpEmail,
        preferredLanguage: signUpLanguage,
        role: isPatientLogin ? UserRole.PATIENT : UserRole.DOCTOR,
        addressLine1: signUpAddressLine1,
        addressLine2: signUpAddressLine2,
        district: signUpDistrict,
        state: signUpState,
        country: signUpCountry,
        doctorCode: signUpDoctorCode
      });

      if (result === 'ID_EXISTS') {
        setError('This email is already in use. Please use another.');
      } else if (result === 'INVALID_CODE') {
        setError('Invalid Doctor Verification Code. Please contact administration.');
      } else if (result === 'SUCCESS') {
        setSuccessMessage('Account created! Logging you in...');
        // We don't necessarily need to reset setIsSigningUp(false) here 
        // if the App state will transition us, but let's be safe.
        // If the reactive listener works, the user will be redirected.
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign up.");
    }
  };

  const inputClasses = "flex h-12 w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background";
  const labelClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-secondary-foreground/80 mb-2 block";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Decorative Side */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-teal-50 to-white p-12">
        <div className="absolute inset-0 bg-radial-primary opacity-50 z-0"></div>
        {/* Abstract floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl shadow-premium mb-8">
            <StethoscopeIcon className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary tracking-tight outfit">
            Medzora Intelligence
          </h1>
          <p className="text-xl text-slate-600 font-light leading-relaxed">
            AI-driven preliminary medical analysis. Structured data for doctors, empowering insights for patients before the consultation even begins.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        {/* Subtle background gradient for the form side on mobile */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-teal-100 lg:hidden -z-10"></div>

        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10 lg:hidden">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-premium mb-6">
              <StethoscopeIcon className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary tracking-tight outfit mb-2">Medzora</h1>
            <p className="text-slate-500">AI Medical Assistant</p>
          </div>

          <Card className="w-full relative overflow-hidden border-none shadow-premium bg-white/90 backdrop-blur-2xl rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-teal-50/50 pointer-events-none"></div>

            <CardHeader className="relative z-10 pb-0 bg-transparent border-none pt-8">
              <button
                onClick={onBack}
                className="absolute top-4 left-4 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back
              </button>
              <CardTitle className="text-3xl font-bold text-center text-slate-800">
                {isSigningUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-center mt-3 text-slate-500 text-base">
                {isSigningUp ? 'Join Medzora to start receiving AI-driven insights.' : 'Log in to access your dashboard and reports.'}
              </CardDescription>

              <div className="flex bg-slate-100/80 rounded-2xl p-1.5 mt-8 mb-4 shadow-inner">
                <button
                  type="button"
                  onClick={() => { setIsPatientLogin(true); resetForm(); }}
                  className={`w-1/2 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isPatientLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                  <UserIcon className="h-4 w-4" /> Patient
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPatientLogin(false); resetForm(); }}
                  className={`w-1/2 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${!isPatientLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                  <StethoscopeIcon className="h-4 w-4" /> Doctor
                </button>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-6">
              {isSigningUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label htmlFor="signUpName" className={labelClasses}>Full Name</label>
                    <input id="signUpName" name="signUpName" type="text" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} className={inputClasses} placeholder={isPatientLogin ? "John Doe" : "Dr. Jane Smith"} required />
                  </div>

                  <div>
                    <label htmlFor="signUpEmail" className={labelClasses}>Email Address</label>
                    <input id="signUpEmail" name="signUpEmail" type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} className={inputClasses} placeholder="email@example.com" required />
                  </div>

                  {isPatientLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="signUpAge" className={labelClasses}>Age</label>
                        <input id="signUpAge" name="signUpAge" type="number" value={signUpAge} onChange={(e) => setSignUpAge(e.target.value)} className={inputClasses} placeholder="e.g. 30" required={isPatientLogin} />
                      </div>
                      <div>
                        <label htmlFor="signUpGender" className={labelClasses}>Gender</label>
                        <select id="signUpGender" name="signUpGender" value={signUpGender} onChange={(e) => setSignUpGender(e.target.value as 'Male' | 'Female' | 'Other')} className={inputClasses} required={isPatientLogin}>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 items-start">
                    {isPatientLogin && (
                      <div>
                        <label htmlFor="signUpLanguage" className={labelClasses}>Preferred Language</label>
                        <LanguageSelector
                          id="signUpLanguage"
                          value={signUpLanguage}
                          onChange={setSignUpLanguage}
                          autoTranslateOnSelect={false}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Address Section */}
                  <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</p>
                    <div>
                      <label htmlFor="signUpAddrLine1" className={labelClasses}>Address Line 1</label>
                      <input id="signUpAddrLine1" name="signUpAddrLine1" type="text" value={signUpAddressLine1} onChange={(e) => setSignUpAddressLine1(e.target.value)} placeholder="House / Flat No., Street" className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="signUpAddrLine2" className={labelClasses}>Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input id="signUpAddrLine2" name="signUpAddrLine2" type="text" value={signUpAddressLine2} onChange={(e) => setSignUpAddressLine2(e.target.value)} placeholder="Area, Landmark" className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="signUpDistrict" className={labelClasses}>District</label>
                        <input id="signUpDistrict" name="signUpDistrict" type="text" value={signUpDistrict} onChange={(e) => setSignUpDistrict(e.target.value)} placeholder="e.g. Chennai" className={inputClasses} />
                      </div>
                      <div>
                        <label htmlFor="signUpState" className={labelClasses}>State</label>
                        <input id="signUpState" name="signUpState" type="text" value={signUpState} onChange={(e) => setSignUpState(e.target.value)} placeholder="e.g. Tamil Nadu" className={inputClasses} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="signUpCountry" className={labelClasses}>Country</label>
                      <input id="signUpCountry" name="signUpCountry" type="text" value={signUpCountry} readOnly className={`${inputClasses} bg-slate-100 text-slate-500 cursor-not-allowed`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="signUpPassword" className={labelClasses}>Password</label>
                      <input id="signUpPassword" name="signUpPassword" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                      <label htmlFor="signUpConfirmPassword" className={labelClasses}>Confirm Password</label>
                      <input id="signUpConfirmPassword" name="signUpConfirmPassword" type="password" value={signUpConfirmPassword} onChange={(e) => setSignUpConfirmPassword(e.target.value)} className={inputClasses} required />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label htmlFor="doctorCode" className={`${labelClasses} text-primary font-bold`}>
                      {isPatientLogin ? "Doctor Connection Code" : "Doctor Verification Code"}
                    </label>
                    <input
                      id="doctorCode"
                      name="doctorCode"
                      type="text"
                      value={signUpDoctorCode}
                      onChange={(e) => setSignUpDoctorCode(e.target.value)}
                      placeholder={isPatientLogin ? "Enter your doctor's unique code" : "Enter secret verification code"}
                      className={`${inputClasses} border-primary/30 ring-primary/20 shadow-sm`}
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isPatientLogin
                        ? "Ask your doctor for their unique connection code to link your reports."
                        : "Verification is required to register as a medical professional."}
                    </p>
                  </div>

                  {error && <p className="text-sm text-destructive font-medium text-center bg-destructive/10 p-2 rounded-md">{error}</p>}

                  <Button type="submit" className="w-full mt-4" size="lg">Create {isPatientLogin ? 'Patient' : 'Doctor'} Account</Button>

                  <p className="text-center text-sm pt-4">
                    <span className="text-slate-500">Already have an account? </span>
                    <button type="button" onClick={() => setIsSigningUp(false)} className="font-semibold text-primary hover:text-teal-700 transition-colors">Log In</button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-6">
                  {successMessage && <p className="text-sm text-green-700 font-medium text-center bg-green-50 p-3 rounded-md border border-green-200">{successMessage}</p>}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="id" className={labelClasses}>
                        Email Address
                      </label>
                      <input id="id" name="userId" type="email" value={id} onChange={(e) => setId(e.target.value)} placeholder="email@example.com" className={inputClasses} required />
                    </div>
                    <div>
                      <label htmlFor="password" className={labelClasses}>Password</label>
                      <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className={inputClasses} required />
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive font-medium text-center bg-destructive/10 p-2 rounded-md">{error}</p>}

                  <Button type="submit" className="w-full" size="lg">
                    Log in as {isPatientLogin ? 'Patient' : 'Doctor'}
                  </Button>

                  {isPatientLogin && (
                    <p className="text-center text-sm pt-4">
                      <span className="text-slate-500">New to Medzora? </span>
                      <button type="button" onClick={() => { setIsSigningUp(true); resetForm(); }} className="font-semibold text-primary hover:text-teal-700 transition-colors">Sign Up for free</button>
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;