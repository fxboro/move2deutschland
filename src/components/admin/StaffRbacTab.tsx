import React, { useState } from "react";
import { UserItem, AuditLogItem } from "../../services/adminService";
import { ShieldCheck, UserCheck, Key, History, Search, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "../Toast";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

interface StaffRbacTabProps {
  users: UserItem[];
  auditLogs: AuditLogItem[];
  currentSuperAdminEmail: string;
}

export default function StaffRbacTab({
  users,
  auditLogs,
  currentSuperAdminEmail,
}: StaffRbacTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<string>("counselor");
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const staffUsers = users.filter((u) => {
    const isStaff =
      u.role === "super_admin" ||
      u.role === "counselor" ||
      u.role === "document_verifier" ||
      u.email === "chimadayo43@gmail.com" ||
      u.email === "admin@move2deutschland.com";
    return isStaff;
  });

  const allEligibleUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.displayName || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  const handleAssignRole = async (targetUser: UserItem, roleToAssign: string) => {
    setUpdating(true);
    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        role: roleToAssign,
        roleAssignedAt: serverTimestamp(),
        roleAssignedBy: currentSuperAdminEmail,
      });

      toast.success(`Role for ${targetUser.displayName || targetUser.email} set to: ${roleToAssign}`);
      setSelectedUser(null);
    } catch (e: any) {
      toast.error(`Failed to assign role: ${e.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role?: string, email?: string) => {
    if (email === "chimadayo43@gmail.com" || role === "super_admin") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#003153] text-[#FFCC00] border border-[#FFCC00]/30 flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Super Admin</span>
        </span>
      );
    }
    if (role === "counselor") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center space-x-1">
          <UserCheck className="w-3 h-3" />
          <span>Counselor</span>
        </span>
      );
    }
    if (role === "document_verifier") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center space-x-1">
          <Key className="w-3 h-3" />
          <span>Document Verifier</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        Candidate / Student
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Active Staff List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#003153] dark:text-[#FFCC00]" />
              <span>Active Administrative Staff ({staffUsers.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Accounts authorized with custom claims and administrative dashboard privileges.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {staffUsers.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                  {u.displayName || u.profile?.name || "Staff Member"}
                </p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>

              <div className="flex items-center space-x-3">
                {getRoleBadge(u.role, u.email)}
                {u.email !== "chimadayo43@gmail.com" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setNewRole(u.role || "counselor");
                    }}
                    className="text-xs font-semibold text-[#003153] dark:text-[#FFCC00] hover:underline"
                  >
                    Change Role
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Assignment Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Grant or Change Staff Access
          </h3>
          <p className="text-xs text-slate-500">
            Search registered accounts to grant Counselor or Document Verifier permissions.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate by name or email to promote to staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
          />
        </div>

        {searchTerm.trim().length > 1 && (
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
            {allEligibleUsers.slice(0, 8).map((cand) => (
              <div
                key={cand.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {cand.displayName || cand.profile?.name || "Candidate"}
                  </p>
                  <p className="text-[11px] text-slate-500">{cand.email}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {getRoleBadge(cand.role, cand.email)}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(cand);
                      setNewRole(cand.role || "counselor");
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#003153] text-[#FFCC00] hover:bg-[#002540]"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Audit Log Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-500" />
            <span>Administrative Audit Trail ({auditLogs.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Live synchronized</span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No audit log records recorded yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </span>
                  {log.details && <p className="text-[11px] text-slate-500">{log.details}</p>}
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p className="font-medium text-slate-600 dark:text-slate-300">{log.by}</p>
                  <p>
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Recently"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Assign Staff Role
            </h3>
            <p className="text-xs text-slate-500">
              Configure access levels for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.email}</span>.
            </p>

            <div className="space-y-2">
              {[
                {
                  id: "counselor",
                  title: "Counselor",
                  desc: "Can review applications, contact inquiries, and publish testimonials.",
                },
                {
                  id: "document_verifier",
                  title: "Document Verifier",
                  desc: "Can approve and request re-uploads for transcripts and passports.",
                },
                {
                  id: "super_admin",
                  title: "Super Admin",
                  desc: "Full permissions: role management, data deletions, system configuration.",
                },
                {
                  id: "user",
                  title: "Demote to Student / Candidate",
                  desc: "Revokes administrative access.",
                },
              ].map((r) => (
                <label
                  key={r.id}
                  onClick={() => setNewRole(r.id)}
                  className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                    newRole === r.id
                      ? "border-[#003153] bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {r.title}
                    </span>
                    <input
                      type="radio"
                      name="roleOption"
                      checked={newRole === r.id}
                      onChange={() => setNewRole(r.id)}
                      className="text-[#003153]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{r.desc}</p>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleAssignRole(selectedUser, newRole)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#003153] text-[#FFCC00] hover:bg-[#002540]"
              >
                {updating ? "Saving..." : "Confirm Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
