import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Logo } from '../../components/common/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
        <Logo size="lg" className="mb-2" />
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Contingent Workforce & Timesheet Management
        </p>
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
            placeholder="name@company.com"
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
        </div>

        <Button type="submit" className="w-full py-2.5 font-medium shadow-md shadow-primary-500/20" isLoading={isLoading}>
          Sign in
        </Button>
      </form>
    </div>
  );
};

