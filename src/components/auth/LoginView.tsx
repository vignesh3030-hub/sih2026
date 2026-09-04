import React, { useState } from 'react';
import { Layers, Lock, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle, Key, UserCheck } from 'lucide-react';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'Project Tracker' | 'Engineer';
  department: string;
}

interface LoginViewProps {
  onLogin: (user: UserSession) => void;
}

export const AUTHORIZED_USERS: Record<string, { pass: string; name: string; role: 'Admin' | 'Project Tracker' | 'Engineer'; department: string }> = {
  varshini: {
    pass: 'varshini',
    name: 'Varshini',
    role: 'Admin',
    department: 'Data Informatics & Innovation Division (DIID)',
  },
  vicky: {
    pass: 'vicky',
    name: 'Vicky',
    role: 'Project Tracker',
    department: 'MoSPI Project Monitoring Group (PMG)',
  },
  yuhaa: {
    pass: '1234',
    name: 'Yuhaa',
    role: 'Engineer',
    department: 'Field Execution & Civil Engineering',
  },
  vathsala: {
    pass: '1234',
    name: 'Vathsala',
    role: 'Engineer',
    department: 'Structural & Quality Control Engineering',
  },
};

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectAccount = (key: string) => {
    const acc = AUTHORIZED_USERS[key];
    if (acc) {
      setUsername(key);
      setPassword(acc.pass);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const userKey = username.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userKey, password }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setIsLoading(false);
        const mappedRole: 'Admin' | 'Project Tracker' | 'Engineer' = 
          data.user.role === 'Admin' ? 'Admin' : 
          data.user.role === 'MoSPI Officer' || data.user.role === 'Project Tracker' ? 'Project Tracker' : 'Engineer';

        onLogin({
          id: data.user.id || `usr-${userKey}`,
          username: data.user.username || userKey,
          name: data.user.name,
          role: mappedRole,
          department: data.user.department || 'Field Execution & Civil Engineering',
        });
        return;
      }
    } catch (err) {
      console.warn('API login check failed, attempting fallback local verification:', err);
    }

    // Local fallback check
    setIsLoading(false);
    const match = AUTHORIZED_USERS[userKey];
    if (match && match.pass === password) {
      onLogin({
        id: `usr-${userKey}`,
        username: userKey,
        name: match.name,
        role: match.role,
        department: match.department,
      });
    } else {
      setErrorMessage('Invalid username or password. Please verify your registered database credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-purple-600 selection:text-white relative">
      {/* Background blur decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden z-10">
        <div className="p-8 pb-6 border-b border-slate-100 bg-slate-900 text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#451254] via-purple-700 to-indigo-600 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#451254] rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">PAIMANA <span className="text-purple-400">InfraPredict</span></h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">MoSPI • DIID Access Control Gateway</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight mb-1">Access Control Portal</h2>
          <p className="text-xs text-slate-400">Role-Based Infrastructure Decision & Monitoring Platform</p>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* Quick Demo Account Selector Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Select Authorized Role Account:</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAccount('varshini')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'varshini' ? 'bg-purple-900 text-white border-purple-900 shadow-sm' : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>👑 Varshini</span>
                  <span className="text-[10px] font-mono opacity-80">Admin</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: varshini</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('vicky')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'vicky' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>📊 Vicky</span>
                  <span className="text-[10px] font-mono opacity-80">Tracker</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: vicky</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('yuhaa')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'yuhaa' ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>👷 Yuhaa</span>
                  <span className="text-[10px] font-mono opacity-80">Engineer</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: 1234</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('vathsala')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'vathsala' ? 'bg-amber-900 text-white border-amber-900 shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>👷‍♀️ Vathsala</span>
                  <span className="text-[10px] font-mono opacity-80">Engineer</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: 1234</div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Username / ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. varshini, vicky, yuhaa, vathsala"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 transition-all outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 bg-slate-50/50 p-3.5 rounded-xl text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              Role-Based Access Control (RBAC) active for <span className="font-bold text-slate-700">MoSPI DIID Infrastructure Monitoring Platform</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
