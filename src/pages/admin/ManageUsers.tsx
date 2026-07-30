import React, { useEffect, useState } from 'react';
import { Users, Edit2, Shield } from 'lucide-react';
import { userService } from '../../services/userService';
import { User, UserRole } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('Resident');
  const [editFlat, setEditFlat] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = userService.listenToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditFlat(user.flatNumber || '');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.uid) return;

    setSaving(true);
    try {
      await userService.updateUserProfile(selectedUser.uid, {
        role: editRole,
        flatNumber: editFlat.trim()
      });
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Fetching user registry from Firestore..." />;

  const columns: Column<User>[] = [
    {
      header: 'Name',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-[10px] text-slate-400">{row.email}</p>
        </div>
      )
    },
    {
      header: 'System Role',
      accessor: (row) => <Badge status={row.role} />
    },
    {
      header: 'Flat Number',
      accessor: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.flatNumber || 'N/A'}
        </span>
      )
    },
    {
      header: 'Assigned Flat',
      accessor: (row) => (
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {row.flatNumber || 'Flat A-101'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          User & Role Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Control access permissions for Residents, Security Guards, and Administrators
        </p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search user by name, email, or flat..."
        searchFilterKey={(row) => `${row.name} ${row.email} ${row.flatNumber}`}
        actions={(row) => (
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Role
          </button>
        )}
      />

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Update User System Role">
        {selectedUser && (
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <p className="text-slate-500 mb-1">Target User</p>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedUser.name}</p>
              <p className="text-slate-400 text-[11px]">{selectedUser.email}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assign Role
              </label>
              <select
                value={editRole}
                onChange={e => setEditRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Resident">Resident</option>
                <option value="Security">Security Guard</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Flat / Apartment Number
              </label>
              <input
                type="text"
                value={editFlat}
                onChange={e => setEditFlat(e.target.value)}
                placeholder="e.g. A-101"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
              >
                {saving ? 'Updating...' : 'Save Role Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
