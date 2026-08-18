import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Building2, Shield, UserCheck, Briefcase, User, Sparkles } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@example.com', password: 'Password123!', icon: Shield, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  { role: 'Manager', email: 'manager@example.com', password: 'Password123!', icon: UserCheck, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  { role: 'Vendor', email: 'vendor@example.com', password: 'Password123!', icon: Briefcase, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  { role: 'Contractor', email: 'contractor@example.com', password: 'Password123!', icon: User, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="mb-6 flex flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome to Workforce Hub
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          Contingent Workforce & Timesheet Management
        </p>
      </div>

      {/* Quick Demo Accounts Selector */}
      <div className="mb-6 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Quick Demo Login
          </span>
          <span className="text-[11px] font-normal normal-case text-slate-400">Click to fill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            const isSelected = email === acc.email;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-all ${acc.color} ${
                  isSelected ? 'ring-2 ring-primary-500 font-semibold shadow-sm' : 'opacity-85 hover:opacity-100 hover:shadow-sm'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="truncate">
                  <div className="font-medium leading-tight">{acc.role}</div>
                  <div className="text-[10px] opacity-75 truncate">{acc.email.split('@')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 p-3.5 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 animate-fadeIn">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <FormInput
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@example.com"
            required
          />

          <FormInput
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600 dark:border-slate-700 dark:bg-slate-900"
            />
            <span className="ml-2 text-xs">Remember me</span>
          </label>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Password: <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">Password123!</code>
          </span>
        </div>

        <Button type="submit" className="w-full py-2.5 font-medium shadow-md shadow-primary-500/20" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
    </div>
  );
};
