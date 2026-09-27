import React, { useState } from "react";
import { ApplicationItem, updateApplicationStatus } from "../../services/adminService";
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  GraduationCap,
  Download,
} from "lucide-react";
import { useToast } from "../Toast";

interface ApplicationsTabProps {
  applications: ApplicationItem[];
  userRole: string;
}

export default function ApplicationsTab({ applications, userRole }: ApplicationsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    app: ApplicationItem | null;
    targetStatus: "pending" | "under_review" | "approved" | "rejected";
    notes: string;
  }>({
    isOpen: false,
    app: null,
    targetStatus: "under_review",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const filtered = applications.filter((app) => {
    const matchesSearch =
      (app.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdate = async () => {
    if (!statusModal.app) return;
    setSubmitting(true);
    try {
      await updateApplicationStatus(
        statusModal.app.id,
        statusModal.targetStatus,
        statusModal.notes
      );
      toast.success(
        `Application for ${statusModal.app.fullName} set to: ${statusModal.targetStatus.replace("_", " ")}`
      );
      setStatusModal({ isOpen: false, app: null, targetStatus: "under_review", notes: "" });
    } catch (e: any) {
      toast.error(`Failed to update status: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case "under_review":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#003153] dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {(["all", "pending", "under_review", "approved", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? "bg-[#003153] text-[#FFCC00] shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Academic Score</th>
                <th className="py-3.5 px-4">German Grade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Documents</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No applications matching this criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{app.fullName}</div>
                      <div className="text-[11px] text-slate-400">{app.email || app.uid}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {app.nigerianCgpa ? `${app.nigerianCgpa} / 5.0` : "N/A"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFCC00]/20 text-[#003153] dark:text-[#FFCC00]">
                        {app.germanGrade ? app.germanGrade.toFixed(2) : "N/A"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {app.transcriptUrl ? (
                          <a
                            href={app.transcriptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline"
                            title="View Academic Transcript"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Transcript</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">No transcript</span>
                        )}
                        {app.passportUrl && (
                          <a
                            href={app.passportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                            title="View Passport Data Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Passport</span>
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {app.createdAt?.toDate
                        ? app.createdAt.toDate().toLocaleDateString()
                        : "Recently"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setStatusModal({
                              isOpen: true,
                              app,
                              targetStatus: "under_review",
                              notes: app.notes || "",
                            })
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStatusModal({
                              isOpen: true,
                              app,
                              targetStatus: "approved",
                              notes: app.notes || "",
                            })
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      {statusModal.isOpen && statusModal.app && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Application Status
            </h3>
            <p className="text-xs text-slate-500">
              Set new placement status for <span className="font-semibold text-slate-800 dark:text-slate-200">{statusModal.app.fullName}</span>.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Status
              </label>
              <select
                value={statusModal.targetStatus}
                onChange={(e) =>
                  setStatusModal((prev) => ({
                    ...prev,
                    targetStatus: e.target.value as any,
                  }))
                }
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Counselor Review Notes
              </label>
              <textarea
                value={statusModal.notes}
                onChange={(e) =>
                  setStatusModal((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="e.g. Preliminary eligibility verified. Candidate recommended for TU Munich & RWTH Aachen."
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setStatusModal({ isOpen: false, app: null, targetStatus: "under_review", notes: "" })
                }
                className="px-4 py-2 text-xs rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleUpdate}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#003153] text-[#FFCC00] hover:bg-[#002540]"
              >
                {submitting ? "Saving..." : "Confirm Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
