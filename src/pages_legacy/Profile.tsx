import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, theme } = useApp();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGender(user.gender || 'female');
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!gender) {
      setError('Gender must be selected.');
      return;
    }

    updateUserProfile(name.trim(), gender);
    setSuccess('Profile updated successfully.');

    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4', theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900')}>
      <div className={cn('w-full max-w-lg rounded-3xl border p-8 shadow-xl', theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')}>
        <h1 className="text-3xl font-bold mb-4">Personal Details</h1>
        <p className={cn('mb-6', theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}>Update your profile information and save changes.</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className={cn('w-full rounded-xl border px-4 py-2 outline-none', theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900')}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'male' | 'female' | 'other')}
              className={cn('w-full rounded-xl border px-4 py-2 outline-none', theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900')}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className={cn('w-full rounded-xl border px-4 py-2 bg-slate-100 text-slate-500 cursor-not-allowed', theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-500')}
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
          {success && <p className="text-sm text-emerald-500">{success}</p>}

          <div className="flex gap-3 mt-3">
            <button type="submit" className="w-full rounded-xl bg-primary py-2 text-white font-bold hover:opacity-90 transition">Save Changes</button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className={cn('w-full rounded-xl border py-2 font-bold transition', theme === 'dark' ? 'border-slate-700 text-slate-100 hover:border-slate-500' : 'border-slate-300 text-slate-900 hover:bg-slate-100')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
