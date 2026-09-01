import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  LogIn,
  User,
  Building2,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

export const MockLoginPage: React.FC = () => {
  const { userSession, setUserSession, navigateTo, addToast } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(
    userSession.role !== 'citizen' ? userSession.role : 'district'
  );
  const [username, setUsername] = useState(
    userSession.role !== 'citizen' ? userSession.username : 'Sh. A. K. Sharma (IAS)'
  );
  const [stateName, setStateName] = useState(userSession.assignedState || 'Uttar Pradesh');
  const [districtName, setDistrictName] = useState(userSession.assignedDistrict || 'Lucknow');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    switch (role) {
      case 'district':
        setUsername('Sh. A. K. Sharma (District Magistrate / Collector)');
        setStateName('Uttar Pradesh');
        setDistrictName('Lucknow');
        break;
      case 'state':
        setUsername('Dr. V. Ramanathan (State Nodal Officer)');
        setStateName('Uttar Pradesh');
        setDistrictName('');
        break;
      case 'ministry':
        setUsername('Secretary, MoSPI Audit Directorate');
        setStateName('National HQ (New Delhi)');
        setDistrictName('');
        break;
      case 'citizen':
        setUsername('Public Citizen');
        setStateName('');
        setDistrictName('');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setUserSession({
      role: selectedRole,
      username: username.trim() || 'Official User',
      assignedState: stateName.trim() || undefined,
      assignedDistrict: districtName.trim() || undefined,
    });

    addToast({
      type: 'success',
      title: 'Role Activated',
      message: `Signed in as ${selectedRole.toUpperCase()}: ${username}`,
    });

    navigateTo('national-dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 overflow-x-hidden">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-5 sm:px-6 py-6 sm:py-8 text-white text-center relative">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 border border-white/20">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-[11px] uppercase tracking-widest text-blue-300 font-bold mb-1">
              Prativedak Access Portal
            </div>
            <h2 className="text-xl font-bold tracking-tight">Official Role-Based Login</h2>
            <p className="text-xs text-blue-200 mt-1">
              Select an administrative role to test authority triage and oversight features in Prativedak.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Role selection buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Administrative Role
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {/* District Authority */}
                <div
                  onClick={() => handleRoleChange('district')}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start space-x-3 min-h-[44px] ${
                    selectedRole === 'district'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      selectedRole === 'district' ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        District Authority
                      </span>
                      {selectedRole === 'district' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review flagged projects, triage local anomalies, trigger escalations
                    </p>
                  </div>
                </div>

                {/* State Nodal Officer */}
                <div
                  onClick={() => handleRoleChange('state')}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start space-x-3 min-h-[44px] ${
                    selectedRole === 'state'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      selectedRole === 'state' ? 'text-indigo-700' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        State Nodal Officer
                      </span>
                      {selectedRole === 'state' && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      State-wide risk monitoring, cross-district comparisons, audit oversight
                    </p>
                  </div>
                </div>

                {/* Ministry Admin */}
                <div
                  onClick={() => handleRoleChange('ministry')}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start space-x-3 min-h-[44px] ${
                    selectedRole === 'ministry'
                      ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      selectedRole === 'ministry' ? 'text-purple-700' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Ministry / National Admin
                      </span>
                      {selectedRole === 'ministry' && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Full national view, unrestricted anomaly escalation queues
                    </p>
                  </div>
                </div>

                {/* Citizen */}
                <div
                  onClick={() => handleRoleChange('citizen')}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start space-x-3 min-h-[44px] ${
                    selectedRole === 'citizen'
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <User
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      selectedRole === 'citizen' ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Public Citizen
                      </span>
                      {selectedRole === 'citizen' && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Read-only transparency access without administrative action buttons
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Designation/Name */}
            <div>
              <label
                htmlFor="login-username-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Official Name / Officer ID
              </label>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter name or designation..."
                className="w-full min-h-[44px] px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jurisdictional Context for District / State */}
            {selectedRole === 'district' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assigned State
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assigned District
                  </label>
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full min-h-[44px] py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Activate Session &amp; Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Transparent Notice / Small Print */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Demo login for Prativedak — role-based views only, not connected to real authentication.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
