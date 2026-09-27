import React, { useState } from "react";
import { ContactSubmissionItem, updateContactStatus } from "../../services/adminService";
import { Mail, Phone, Clock, CheckCircle2, AlertCircle, Search, MessageSquare, ExternalLink } from "lucide-react";
import { useToast } from "../Toast";

interface InquiriesTabProps {
  inquiries: ContactSubmissionItem[];
  userRole: string;
}

export default function InquiriesTab({ inquiries, userRole }: InquiriesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [activeInquiry, setActiveInquiry] = useState<ContactSubmissionItem | null>(null);
  const [replyNotes, setReplyNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const filtered = inquiries.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    id: string,
    newStatus: "new" | "in_progress" | "resolved",
    notes?: string
  ) => {
    try {
      setSubmitting(true);
      await updateContactStatus(id, newStatus, notes);
      toast.success(`Inquiry marked as ${newStatus.replace("_", " ")}`);
      if (activeInquiry?.id === id) {
        setActiveInquiry((prev) => (prev ? { ...prev, status: newStatus, adminNotes: notes } : null));
      }
    } catch (e: any) {
      toast.error(`Failed to update status: ${e.message}`);
    } finally {
      setSubmitting(false);
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
            placeholder="Search inquiries by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#003153] dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Filter:</span>
          {(["all", "new", "in_progress", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === status
                  ? "bg-[#003153] text-[#FFCC00] shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Inquiries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No contact form inquiries found.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.name || "Anonymous Visitor"}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {item.createdAt?.toDate
                          ? item.createdAt.toDate().toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      item.status === "new"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                        : item.status === "in_progress"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-1 mb-4 text-xs text-slate-600 dark:text-slate-300">
                  <a
                    href={`mailto:${item.email}`}
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </a>
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="flex items-center space-x-2 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.phone}</span>
                    </a>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 line-clamp-4">
                  "{item.message}"
                </div>

                {item.adminNotes && (
                  <div className="mt-3 text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900">
                    <span className="font-bold">Staff Note: </span>
                    {item.adminNotes}
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveInquiry(item);
                    setReplyNotes(item.adminNotes || "");
                  }}
                  className="text-xs font-semibold text-[#003153] dark:text-[#FFCC00] hover:underline"
                >
                  Manage Note
                </button>

                <div className="flex items-center space-x-1.5">
                  {item.status !== "in_progress" && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleStatusChange(item.id, "in_progress")}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                    >
                      In Progress
                    </button>
                  )}
                  {item.status !== "resolved" && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleStatusChange(item.id, "resolved")}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Modal */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Triage Note for {activeInquiry.name}
            </h3>
            <p className="text-xs text-slate-500">
              Add internal resolution notes, follow-up status, or interview details.
            </p>

            <textarea
              value={replyNotes}
              onChange={(e) => setReplyNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Called candidate, verified B2 German certificate, scheduled consultation call."
              className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#003153] dark:text-white"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveInquiry(null)}
                className="px-4 py-2 text-sm rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleStatusChange(activeInquiry.id, activeInquiry.status, replyNotes)}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#003153] text-[#FFCC00] hover:bg-[#002540]"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
