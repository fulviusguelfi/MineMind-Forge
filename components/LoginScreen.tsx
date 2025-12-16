
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { loginUser, registerUser, verifyMfaToken, generateMfaSecret, generateMfaQrCode, enableMfaForUser, resetPassword } from '../services/authService';
import { Shield, Lock, Mail, Smartphone, ArrowRight, Github, Apple, AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import QRious from 'qrious';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'mfa' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  
  // MFA Setup State
  const [setupSecret, setSetupSecret] = useState<any>(null);
  const [setupQr, setSetupQr] = useState<string>('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  // Reset State
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Configuration check
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;
  const appleEnabled = !!process.env.APPLE_CLIENT_ID;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await loginUser(email, password);
      if (user.mfaEnabled) {
        setTempUser(user);
        setMode('mfa');
      } else {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await registerUser(email, password);
      // Offer MFA setup immediately after registration
      setTempUser(user);
      setShowMfaSetup(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser || !tempUser.mfaSecret) return;
    
    const isValid = verifyMfaToken(mfaToken, tempUser.mfaSecret);
    if (isValid) {
      onLoginSuccess(tempUser);
    } else {
      setError("Invalid Authenticator Code");
    }
  };

  const startMfaSetup = () => {
      const secret = generateMfaSecret();
      const otpauthUrl = generateMfaQrCode(tempUser!.email, secret.base32);
      
      const qr = new QRious({
          value: otpauthUrl,
          size: 200
      });

      setSetupSecret(secret);
      setSetupQr(qr.toDataURL());
  };

  const confirmMfaSetup = () => {
     if (!setupSecret || !tempUser) return;
     const isValid = verifyMfaToken(mfaToken, setupSecret.base32);
     if (isValid) {
         const updated = enableMfaForUser(tempUser, setupSecret.base32);
         onLoginSuccess(updated);
     } else {
         setError("Invalid code. MFA setup failed.");
     }
  };

  const skipMfa = () => {
      if (tempUser) onLoginSuccess(tempUser);
  };

  const handleReset = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await resetPassword(email);
        setResetMessage("If an account exists, a secure reset link has been sent to your email.");
      } catch (err: any) {
        setResetMessage("If an account exists, a secure reset link has been sent to your email."); // Security: Don't reveal user existence
      }
  };

  // Render Logic

  if (showMfaSetup) {
      if (!setupSecret) startMfaSetup();
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-500"/> Secure Your Account
                </h2>
                <p className="text-gray-400 text-sm mb-6">Scan this QR code with Google Authenticator or Microsoft Authenticator.</p>
                
                <div className="flex justify-center mb-6 bg-white p-4 rounded-lg">
                    <img src={setupQr} alt="MFA QR" />
                </div>

                <input 
                    type="text" 
                    placeholder="Enter 6-digit code"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white mb-4 tracking-widest text-center text-lg"
                    maxLength={6}
                />

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                    <button onClick={confirmMfaSetup} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold">Enable 2FA</button>
                    <button onClick={skipMfa} className="px-4 text-gray-500 hover:text-white">Skip</button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-[#0f172a] flex items-center justify-center p-4 font-sans">
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
                <Lock className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">MineMind Forge</h1>
            <p className="text-gray-500 text-sm mt-2">Secure AI Plugin Development Environment</p>
        </div>

        {/* Forms */}
        {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 cursor-help" title="Check Docker logs for password">
                         <Terminal className="w-3 h-3" /> admin@minemind.net
                      </span>
                    </div>
                    <div className="relative mt-1">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="builder@minecraft.net" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button type="button" onClick={() => setMode('reset')} className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</button>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2">
                    Log In <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        )}

        {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                    <div className="relative mt-1">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                    </div>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all">
                    Create Account
                </button>
            </form>
        )}

        {mode === 'mfa' && (
             <form onSubmit={handleMfaVerify} className="space-y-6">
                <div className="text-center">
                    <div className="bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                        <Smartphone className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold">2-Factor Authentication</h3>
                    <p className="text-xs text-gray-400 mt-1">Enter code from your authenticator app.</p>
                </div>
                <input 
                    type="text" 
                    autoFocus
                    required 
                    value={mfaToken} 
                    onChange={e => setMfaToken(e.target.value)} 
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-4 text-white text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="000000"
                    maxLength={6}
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold">
                    Verify
                </button>
                <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-gray-500 hover:text-gray-300">Back to Login</button>
             </form>
        )}

        {mode === 'reset' && (
            <div className="space-y-4">
                {!resetMessage ? (
                    <form onSubmit={handleReset} className="space-y-4">
                        <p className="text-sm text-gray-400">Enter your email for a secure automatic reset link.</p>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white" placeholder="Email" />
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-bold">Send Reset Link</button>
                        <button type="button" onClick={() => setMode('login')} className="w-full text-gray-500 text-sm">Cancel</button>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-300 text-sm">{resetMessage}</p>
                        <button onClick={() => { setMode('login'); setResetMessage(null); }} className="mt-6 text-blue-400 text-sm hover:underline">Return to Login</button>
                    </div>
                )}
            </div>
        )}

        {/* Error Display */}
        {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
            </div>
        )}

        {/* Social Login / Footer */}
        {mode === 'login' && (
            <>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#151c2d] px-2 text-gray-500">Or continue with</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button" 
                        disabled={!googleEnabled}
                        title={googleEnabled ? 'Sign in with Google' : 'Configure GOOGLE_CLIENT_ID in docker-compose to enable'}
                        className={`flex items-center justify-center gap-2 bg-white text-gray-900 py-2.5 rounded-lg font-bold transition-colors text-sm ${!googleEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Google
                    </button>
                    <button 
                        type="button" 
                        disabled={!appleEnabled}
                        title={appleEnabled ? 'Sign in with Apple' : 'Configure APPLE_CLIENT_ID in docker-compose to enable'}
                        className={`flex items-center justify-center gap-2 bg-gray-900 border border-gray-700 text-white py-2.5 rounded-lg font-bold transition-colors text-sm ${!appleEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                    >
                        <Apple className="w-4 h-4" />
                        Apple ID
                    </button>
                </div>
            </>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? (
                <>Don't have an account? <button onClick={() => setMode('register')} className="text-green-400 hover:text-green-300 font-bold ml-1">Sign Up</button></>
            ) : mode === 'register' ? (
                <>Already have an account? <button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-bold ml-1">Log In</button></>
            ) : null}
        </div>
      </div>
    </div>
  );
};
