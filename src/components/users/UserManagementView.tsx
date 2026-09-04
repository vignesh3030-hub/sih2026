import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Key, Search, Edit2, Trash2, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AUTHORIZED_USERS } from '../auth/LoginView';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'Admin' | 'MoSPI Officer' | 'Ministry Officer' | 'Project Officer' | 'Project Tracker' | 'Engineer';
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

interface UserManagementViewProps {
  currentUser?: { name: string; username: string; role: string; department: string };
}

const INITIAL_USERS: User[] = [
  { id: 'usr-001', name: 'Varshini', username: 'varshini', email: 'varshini@paimana.gov.in', role: 'Admin', department: 'Data Informatics & Innovation Division (DIID)', status: 'Active', lastLogin: '2026-09-04T09:30:00Z' },
  { id: 'usr-002', name: 'Vicky', username: 'vicky', email: 'vicky@paimana.gov.in', role: 'MoSPI Officer', department: 'MoSPI Project Monitoring Group (PMG)', status: 'Active', lastLogin: '2026-09-04T09:15:00Z' },
  { id: 'usr-003', name: 'Yuhaa', username: 'yuhaa', email: 'yuhaa@paimana.gov.in', role: 'Project Officer', department: 'Field Execution & Civil Engineering', status: 'Active', lastLogin: '2026-09-04T08:45:00Z' },
  { id: 'usr-004', name: 'Vathsala', username: 'vathsala', email: 'vathsala@paimana.gov.in', role: 'Project Officer', department: 'Structural & Quality Control Engineering', status: 'Active', lastLogin: '2026-09-04T08:30:00Z' },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State for Adding New Engineer
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Project Officer' | 'Engineer' | 'Ministry Officer'>('Engineer');
  const [newDept, setNewDept] = useState('Geotechnical & Infrastructure Engineering');

  // Permission Check: ONLY Admin (varshini) and Project Tracker / MoSPI Officer (vicky) can add engineers
  const userRole = currentUser?.role?.toLowerCase() || '';
  const username = currentUser?.username?.toLowerCase() || '';
  const canAddUser = username === 'varshini' || username === 'vicky' || userRole.includes('admin') || userRole.includes('tracker') || userRole.includes('mospi');

  // Fetch users from database on load
  useEffect(() => {
    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.warn('Database users fetch fallback:', err));
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    if (!canAddUser) {
      setPermissionError('Access Restricted: Only Admin (Varshini) and Project Tracker (Vicky) are authorized to add new engineers.');
      setTimeout(() => setPermissionError(''), 5000);
      return;
    }
    setPermissionError('');
    setIsModalOpen(true);
  };

  const handleCreateEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    const formattedUsername = newUsername.trim().toLowerCase();
    const formattedEmail = newEmail.trim() || `${formattedUsername}@paimana.gov.in`;

    // 1. Save and Persist Engineer Credentials into Backend Database
    try {
      const res = await fetch('/api/auth/add-engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy: username || 'varshini',
          name: newName.trim(),
          email: formattedEmail,
          username: formattedUsername,
          password: newPassword.trim(),
          role: newRole,
          department: newDept,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPermissionError(data.error || 'Failed to persist engineer in database.');
        return;
      }

      // 2. Also register credential in client auth lookup for instant access
      AUTHORIZED_USERS[formattedUsername] = {
        pass: newPassword.trim(),
        name: newName.trim(),
        role: 'Engineer',
        department: newDept
      };

      // 3. Fetch latest active users directly from backend database
      const usersRes = await fetch('/api/auth/users');
      const usersData = await usersRes.json();
      if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      } else {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: newName.trim(),
          username: formattedUsername,
          email: formattedEmail,
          role: newRole === 'Engineer' ? 'Project Officer' : newRole,
          department: newDept,
          status: 'Active',
          lastLogin: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
      }

      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setSuccessMessage(`Engineer account "@${formattedUsername}" successfully created & persisted in Database! (Password: ${newPassword.trim()})`);
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (err: any) {
      setPermissionError('Error connecting to database server: ' + err.message);
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MoSPI Officer':
      case 'Project Tracker': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ministry Officer': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Project Officer':
      case 'Engineer': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-200">
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-xs text-slate-500 font-mono">Authorized Creator: Varshini (Admin) & Vicky (Tracker)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-700" />
            User Management & Authorized Engineers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage government monitoring accounts, civil engineers, and platform roles</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
            canAddUser 
              ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-900/20' 
              : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
          }`}
          title={canAddUser ? 'Add new engineer account' : 'Only Varshini (Admin) & Vicky (Tracker) can add new engineers'}
        >
          {canAddUser ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />}
          <span>Add New Engineer</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Permission Warning Banner */}
      {permissionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{permissionError}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-slate-900">{users.length}</span> Total Registered Accounts
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Key className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">4</span> RBAC Tiers Active
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-6 py-3.5">User & Account Details</th>
                <th className="px-6 py-3.5">Role & Permissions</th>
                <th className="px-6 py-3.5">Department / Division</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{user.name}</span>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        @{user.username || user.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-sans">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ● {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                    {new Date(user.lastLogin).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW ENGINEER MODAL (Only for Admin: Varshini & Tracker: Vicky) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Add New Civil / Project Engineer</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Authorized by: {currentUser?.name} ({currentUser?.role})</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEngineer} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Engineer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Username / Login ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ramesh"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Official Email</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@paimana.gov.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-hidden font-bold"
                >
                  <option value="Engineer">Engineer / Project Officer</option>
                  <option value="Ministry Officer">Ministry Liaison Officer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Department / Engineering Division</label>
                <input
                  type="text"
                  placeholder="e.g. Geotechnical & Infrastructure Engineering"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md"
                >
                  Create & Register Engineer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
