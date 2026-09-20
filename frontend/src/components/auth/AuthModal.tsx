import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, Shield, Sparkles, 
  Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'recruiter' | 'admin'>('recruiter');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email address and password.');
        }
        await login(email, password);
        setSuccessMessage('Successfully signed in!');
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@') || !email.includes('.')) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register(email, password, fullName, role);
        setSuccessMessage('Account created! Welcome to HireFlow AI.');
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'admin' | 'recruiter') => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await loginAsDemo(demoRole);
      setSuccessMessage(`Logged in as Demo ${demoRole === 'admin' ? 'Administrator' : 'Recruiter'}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900/95 border border-slate-750 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {mode === 'login' ? 'Sign in to HireFlow AI' : 'Create your Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login' 
                  ? 'Access evidence-based candidate intelligence' 
                  : 'Start screening candidates with zero black-box bias'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Fast-Fill Buttons for Instant Evaluation */}
        <div className="px-6 py-2.5 mx-6 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-400 mb-2">
            <span className="flex items-center space-x-1">
              <KeyRound className="w-3 h-3" />
              <span>1-Click Hackathon Evaluation:</span>
            </span>
            <span className="text-slate-400 font-normal">Pre-configured credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Fast-Fill Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('recruiter')}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Fast-Fill Recruiter</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-950/80 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950/80 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Password
              </label>
              {mode === 'login' && (
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer" onClick={() => handleQuickDemo('recruiter')}>
                  Forgot? Use Demo Recruiter
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                className="w-full bg-slate-950/80 border border-slate-750 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Assign Platform Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === 'recruiter'
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-400">
                    <User className="w-3.5 h-3.5" />
                    <span>Recruiter</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Candidate screening &amp; AI interview conductor
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === 'admin'
                      ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Administrator</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Full system access, demo reset &amp; keys
                  </p>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            <span>
              {isLoading 
                ? 'Processing...' 
                : mode === 'login' 
                  ? 'Sign In to Workspace' 
                  : 'Complete Registration & Enter Workspace'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className="text-blue-400 hover:underline font-semibold"
              >
                Sign up for free
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className="text-blue-400 hover:underline font-semibold"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
