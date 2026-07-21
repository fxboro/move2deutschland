import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { checkIsAdmin } from "../utils/auth";
import { useToast } from "../components/Toast";
import {
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
  User,
  LayoutDashboard,
  Users,
  LogOut,
  Bell,
  FileText,
  X,
  Download,
  Archive,
  Trash2,
  Edit,
  AlertCircle,
  Send,
  RefreshCw,
  Mail,
  Check,
  RotateCcw,
} from "lucide-react";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [activeTab, setActiveTab] = useState("applicants"); // 'applicants' | 'overview'
  const [archivedFilter, setArchivedFilter] = useState<"active" | "archived">("active");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Modals state
  const [notesModal, setNotesModal] = useState<{
    isOpen: boolean;
    userId: string;
    text: string;
    userName: string;
  }>({ isOpen: false, userId: "", text: "", userName: "" });

  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: any | null;
  }>({ isOpen: false, user: null });

  const [docRejectModal, setDocRejectModal] = useState<{
    isOpen: boolean;
    userId: string;
    docType: string;
    feedback: string;
  }>({ isOpen: false, userId: "", docType: "", feedback: "" });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });

  const [notifyModal, setNotifyModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    phone: string;
    email: string;
    message: string;
  }>({ isOpen: false, userId: "", userName: "", phone: "", email: "", message: "" });

  const [detailDrawerUser, setDetailDrawerUser] = useState<any | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Control Panel | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Move2Deutschland Administration Panel for real-time candidate pipeline management, document verification, and user management.",
      );
    }

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdminUser = await checkIsAdmin(user);
        if (isAdminUser) {
          setIsAdmin(true);
          setLoading(true);
          
          // Real-time Firestore Listener
          unsubscribeSnapshot = onSnapshot(
            collection(db, "users"),
            (snapshot) => {
              const usersData = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              }));
              setUsers(usersData);
              setLoading(false);
            },
            (error) => {
              console.error("Real-time listener error:", error);
              toast.error("Failed to sync live data from database.");
              setLoading(false);
            }
          );
          return;
        }
      }
      navigate("/dashboard"); // Redirect non-admins
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [navigate]);

  // Helper to add activity log entry
  const logActivity = async (userId: string, actionDescription: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        activityLog: arrayUnion({
          action: actionDescription,
          timestamp: new Date().toISOString(),
          by: "Admin",
        }),
      });
    } catch (e) {
      console.error("Failed to record activity log:", e);
    }
  };

  // Status Update
  const handleUpdateStatus = async (
    userId: string,
    newStatus: string,
    phone: string,
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { status: newStatus });
      await logActivity(userId, `Application status updated to ${newStatus.toUpperCase()}`);

      if (phone) {
        const formattedPhone = phone.startsWith("+")
          ? phone
          : `+234${phone.replace(/^0/, "")}`;
        const message = `Hello! Your Move2Deutschland application status has been updated to: ${newStatus.toUpperCase()}. Log in to your dashboard for more details.`;

        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: formattedPhone, message }),
          });
        } catch (e) {
          console.warn("SMS notification failed:", e);
        }
      }
      toast.success(`Status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  // Document Verification - Approve
  const handleApproveDocument = async (
    userId: string,
    docType: string,
    phone: string,
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        [`documents.${docType}.status`]: "verified",
        [`documents.${docType}.feedback`]: "",
      });
      await logActivity(userId, `Approved document: ${docType.toUpperCase()}`);

      if (phone) {
        const formattedPhone = phone.startsWith("+")
          ? phone
          : `+234${phone.replace(/^0/, "")}`;
        const message = `Great news from Move2Deutschland! Your ${docType.toUpperCase()} has been approved. You're one step closer to Germany!`;

        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: formattedPhone, message }),
          });
        } catch (e) {
          console.warn("Notification failed:", e);
        }
      }
      toast.success(`${docType.toUpperCase()} approved!`);
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error("Failed to approve document.");
    }
  };

  // Document Verification - Reject / Request Re-upload
  const handleRejectDocument = async () => {
    const { userId, docType, feedback } = docRejectModal;
    if (!userId || !docType) return;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        [`documents.${docType}.status`]: "action_required",
        [`documents.${docType}.feedback`]: feedback || "Document needs to be re-uploaded.",
      });
      await logActivity(userId, `Requested re-upload for ${docType.toUpperCase()}: ${feedback}`);

      setDocRejectModal({ isOpen: false, userId: "", docType: "", feedback: "" });
      toast.warning(`${docType.toUpperCase()} marked for re-upload.`);
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error("Failed to update document status.");
    }
  };

  // Archive / Unarchive User
  const handleToggleArchive = async (userId: string, currentArchived: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { archived: !currentArchived });
      await logActivity(
        userId,
        currentArchived ? "Candidate unarchived" : "Candidate archived"
      );
      toast.success(currentArchived ? "Candidate unarchived." : "Candidate moved to archives.");
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.error("Failed to toggle archive status.");
    }
  };

  // Delete User Data Permanently
  const handleDeleteUser = async () => {
    const { userId, userName } = deleteConfirmModal;
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      toast.success(`User data for ${userName} has been permanently deleted.`);
      setDeleteConfirmModal({ isOpen: false, userId: "", userName: "" });
      if (detailDrawerUser?.id === userId) setDetailDrawerUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete candidate data.");
    }
  };

  // Edit User Details Submission
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user) return;
    const u = editUserModal.user;
    try {
      const userRef = doc(db, "users", u.id);
      await updateDoc(userRef, {
        displayName: u.displayName,
        email: u.email,
        status: u.status,
        "profile.name": u.displayName,
        "profile.whatsapp": u.whatsapp,
        "profile.fieldOfInterest": u.fieldOfInterest,
        "profile.cgpa": u.cgpa,
        "profile.institution": u.institution,
        "profile.isHighPriority": u.isHighPriority,
      });
      await logActivity(u.id, "Admin updated profile details");
      toast.success("Candidate details updated successfully!");
      setEditUserModal({ isOpen: false, user: null });
    } catch (error) {
      console.error("Error saving user edits:", error);
      toast.error("Failed to save changes.");
    }
  };

  // Direct Message Notification
  const handleSendNotification = async () => {
    const { userId, phone, message } = notifyModal;
    if (!userId || !message.trim()) return;
    try {
      if (phone) {
        const formattedPhone = phone.startsWith("+")
          ? phone
          : `+234${phone.replace(/^0/, "")}`;
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: formattedPhone, message }),
        });
      }
      await logActivity(userId, `Admin sent custom message: "${message}"`);
      toast.success("Notification sent to candidate!");
      setNotifyModal({ isOpen: false, userId: "", userName: "", phone: "", email: "", message: "" });
    } catch (e) {
      console.error("Notification trigger error:", e);
      toast.error("Failed to send notification.");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.warning("No candidate records to export.");
      return;
    }
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone/WhatsApp",
      "Status",
      "Field of Interest",
      "CGPA",
      "Priority",
      "Archived",
      "Created At",
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.profile?.name || u.displayName || u.email || ''}"`,
      `"${u.email || ''}"`,
      `"${u.profile?.whatsapp || ''}"`,
      `"${u.status || 'pending'}"`,
      `"${u.profile?.fieldOfInterest || ''}"`,
      `"${u.profile?.cgpa || ''}"`,
      `"${u.profile?.isHighPriority ? 'High Priority' : 'Normal'}"`,
      `"${u.archived ? 'Yes' : 'No'}"`,
      `"${u.createdAt || ''}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Move2Deutschland_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredUsers.length} candidate records to CSV!`);
  };

  // Bulk Actions
  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (!newStatus || selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const updates = selectedUsers.map(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { status: newStatus });
        await logActivity(userId, `Bulk update: status set to ${newStatus.toUpperCase()}`);
      });
      await Promise.all(updates);
      toast.success(`Bulk updated ${selectedUsers.length} users to ${newStatus}`);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk status update", error);
      toast.error("Bulk status update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const updates = selectedUsers.map(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { archived: true });
        await logActivity(userId, "Bulk archived by admin");
      });
      await Promise.all(updates);
      toast.success(`Archived ${selectedUsers.length} candidate accounts.`);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk archive", error);
      toast.error("Bulk archive failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApproveDocuments = async () => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const updates = selectedUsers.map(async (userId) => {
        const user = users.find((u) => u.id === userId);
        if (!user || !user.documents) return null;

        const docUpdates: any = {};
        ["waec", "transcript", "passport"].forEach((docType) => {
          if (
            user.documents[docType] &&
            user.documents[docType].status === "pending"
          ) {
            docUpdates[`documents.${docType}.status`] = "verified";
            docUpdates[`documents.${docType}.feedback`] = "";
          }
        });

        if (Object.keys(docUpdates).length > 0) {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, docUpdates);
          await logActivity(userId, "Bulk document verification approved");
        }
      });

      await Promise.all(updates);
      toast.success(`Bulk approved pending documents for ${selectedUsers.length} candidates.`);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk approve", error);
      toast.error("Bulk document approval failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSaveNote = async () => {
    if (!notesModal.userId) return;
    try {
      const userRef = doc(db, "users", notesModal.userId);
      await updateDoc(userRef, { adminNotes: notesModal.text });
      await logActivity(notesModal.userId, "Updated admin private notes");
      setNotesModal({ isOpen: false, userId: "", text: "", userName: "" });
      toast.success("Note saved successfully!");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note.");
    }
  };

  // Filter Pipeline Logic
  const filteredUsers = users.filter((u) => {
    const isArchivedDoc = !!u.archived;
    if (archivedFilter === "active" && isArchivedDoc) return false;
    if (archivedFilter === "archived" && !isArchivedDoc) return false;

    const matchPriority =
      filterPriority === "All" ||
      (filterPriority === "High" && u.profile?.isHighPriority) ||
      (filterPriority === "Normal" && !u.profile?.isHighPriority);

    const matchCourse =
      filterCourse === "All" || u.profile?.fieldOfInterest === filterCourse;

    return matchPriority && matchCourse;
  });

  const stats = {
    total: users.filter((u) => !u.archived).length,
    pending: users.filter((u) => !u.archived && (u.status === "pending" || !u.status)).length,
    highPriority: users.filter((u) => !u.archived && u.profile?.isHighPriority).length,
    verifiedDocs: users.filter((u) => !u.archived).reduce((acc, u) => {
      const docs = u.documents || {};
      const verifiedCount = Object.values(docs).filter(
        (d: any) => d.status === "verified",
      ).length;
      return acc + verifiedCount;
    }, 0),
    archivedCount: users.filter((u) => u.archived).length,
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/auth");
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 font-sans flex flex-col md:flex-row relative overflow-hidden text-slate-800 transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px] pointer-events-none z-0"></div>

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 backdrop-blur-xl border-r border-white/10 text-white flex flex-col md:min-h-screen sticky top-0 z-20 shadow-2xl">
        <div className="p-6">
          <div className="mb-12">
            <Logo size="lg" variant="light" />
            <span className="block text-[10px] uppercase tracking-widest text-gold/60 mt-1 font-sans">
              Admin Control Panel
            </span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("applicants")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "applicants" ? "bg-gold text-prussian-blue font-bold shadow-md" : "text-slate-300 hover:bg-white/5"}`}
            >
              <Users size={20} />
              Candidates
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "overview" ? "bg-gold text-prussian-blue font-bold shadow-md" : "text-slate-300 hover:bg-white/5"}`}
            >
              <LayoutDashboard size={20} />
              Overview Stats
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full text-left mb-2"
          >
            <ArrowLeft size={18} />
            Exit to Home
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 relative z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-prussian-blue flex items-center gap-3">
                {activeTab === "applicants"
                  ? "Candidate Control Pipeline"
                  : "Platform Overview"}
                <span className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold border border-emerald-200 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Firestore Sync
                </span>
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === "applicants"
                  ? "Manage, verify, edit, and communicate with Nigerian candidates in real-time."
                  : "Global metrics and conversion analytics across candidate applications."}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 text-prussian-blue font-bold hover:bg-white transition-all flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {[
              {
                label: "Active Candidates",
                value: stats.total,
                icon: User,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Pending Review",
                value: stats.pending,
                icon: Clock,
                color: "text-yellow-600",
                bg: "bg-yellow-50",
              },
              {
                label: "High Priority Leads",
                value: stats.highPriority,
                icon: Filter,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Verified Docs",
                value: stats.verifiedDocs,
                icon: CheckCircle,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Archived Candidates",
                value: stats.archivedCount,
                icon: Archive,
                color: "text-slate-600",
                bg: "bg-slate-100",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/60 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
                  >
                    <stat.icon size={20} />
                  </div>
                  <span className="text-2xl font-bold text-prussian-blue">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {activeTab === "applicants" && (
            <>
              {/* Controls Header: Active/Archived Tabs + Filters */}
              <div className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/60 mb-6 flex flex-wrap gap-4 items-center justify-between">
                {/* Active / Archived Toggle */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setArchivedFilter("active")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${archivedFilter === "active" ? "bg-white text-prussian-blue shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Active Pipeline ({stats.total})
                  </button>
                  <button
                    onClick={() => setArchivedFilter("archived")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${archivedFilter === "archived" ? "bg-white text-prussian-blue shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Archived ({stats.archivedCount})
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <Filter size={16} /> Filters:
                  </div>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 bg-white text-slate-800 font-medium shadow-sm"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">⭐ High Priority</option>
                    <option value="Normal">Normal Priority</option>
                  </select>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 bg-white text-slate-800 font-medium shadow-sm"
                  >
                    <option value="All">All Courses</option>
                    <option value="Engineering">Engineering</option>
                    <option value="IT & Computer Science">IT & Computer Science</option>
                    <option value="Healthcare & Medicine">Healthcare & Medicine</option>
                    <option value="Business & Finance">Business & Finance</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedUsers.length > 0 && (
                <div className="bg-prussian-blue text-white p-4 rounded-2xl shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-gold text-prussian-blue px-3 py-1 rounded-full text-xs font-extrabold">
                      {selectedUsers.length} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkUpdateStatus(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-gold font-medium text-white"
                    >
                      <option value="" className="text-slate-800">
                        Set Status...
                      </option>
                      <option value="pending" className="text-slate-800">Pending</option>
                      <option value="submitted" className="text-slate-800">Submitted</option>
                      <option value="reviewing" className="text-slate-800">Reviewing</option>
                      <option value="approved" className="text-slate-800">Approved</option>
                      <option value="rejected" className="text-slate-800">Rejected</option>
                    </select>
                    <button
                      onClick={handleBulkApproveDocuments}
                      className="bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      Approve Pending Docs
                    </button>
                    <button
                      onClick={handleBulkArchive}
                      className="bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-slate-600 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Archive size={14} /> Archive Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Main Candidate Table */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="p-5 w-12">
                          <input
                            type="checkbox"
                            checked={
                              filteredUsers.length > 0 &&
                              selectedUsers.length === filteredUsers.length
                            }
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-prussian-blue focus:ring-prussian-blue cursor-pointer"
                          />
                        </th>
                        <th className="p-5 font-bold">Candidate Info</th>
                        <th className="p-5 font-bold">Course & Status</th>
                        <th className="p-5 font-bold">Academic Profile</th>
                        <th className="p-5 font-bold">Documents & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="p-5"></td>
                            <td className="p-5">
                              <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-2"></div>
                              <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                            </td>
                            <td className="p-5">
                              <div className="h-4 bg-slate-200 rounded-md w-2/3 mb-2"></div>
                              <div className="h-6 bg-slate-200 rounded-md w-1/2"></div>
                            </td>
                            <td className="p-5">
                              <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-2"></div>
                            </td>
                            <td className="p-5">
                              <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
                            </td>
                          </tr>
                        ))
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-12 text-center text-slate-500 font-medium"
                          >
                            No candidates found matching the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className={`hover:bg-blue-50/30 transition-colors border-b border-slate-100 ${selectedUsers.includes(user.id) ? "bg-blue-50/50" : ""}`}
                          >
                            <td className="p-5">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                                className="w-4 h-4 rounded border-slate-300 text-prussian-blue focus:ring-prussian-blue cursor-pointer"
                              />
                            </td>
                            <td className="p-5">
                              <div className="font-bold text-prussian-blue text-base flex items-center gap-2">
                                <button
                                  onClick={() => setDetailDrawerUser(user)}
                                  className="hover:underline text-left text-blue-900"
                                >
                                  {user.profile?.name || user.displayName || user.email || "Candidate"}
                                </button>
                                {user.profile?.isHighPriority && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md border border-amber-200">
                                    ⭐ Priority
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                {user.email}
                              </div>
                              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 bg-white inline-flex px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                                <MessageSquare size={12} className="text-slate-400" />
                                {user.profile?.whatsapp || "No phone"}
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() =>
                                    setNotesModal({
                                      isOpen: true,
                                      userId: user.id,
                                      text: user.adminNotes || "",
                                      userName:
                                        user.profile?.name ||
                                        user.displayName ||
                                        user.email ||
                                        "Candidate",
                                    })
                                  }
                                  className="text-[11px] text-slate-700 flex items-center gap-1 bg-white hover:bg-slate-50 transition-colors px-2 py-1 rounded-md border border-slate-200 shadow-2xs font-medium"
                                >
                                  <FileText
                                    size={12}
                                    className={user.adminNotes ? "text-blue-500" : "text-slate-400"}
                                  />
                                  {user.adminNotes ? "Notes" : "Add Note"}
                                </button>
                                <button
                                  onClick={() => setEditUserModal({ isOpen: true, user: { ...user, whatsapp: user.profile?.whatsapp, cgpa: user.profile?.cgpa, fieldOfInterest: user.profile?.fieldOfInterest, isHighPriority: user.profile?.isHighPriority } })}
                                  className="text-[11px] text-slate-700 flex items-center gap-1 bg-white hover:bg-slate-50 transition-colors px-2 py-1 rounded-md border border-slate-200 shadow-2xs font-medium"
                                >
                                  <Edit size={12} className="text-slate-400" /> Edit
                                </button>
                              </div>
                            </td>
                            <td className="p-5">
                              <div className="text-sm font-bold text-slate-700">
                                {user.profile?.fieldOfInterest || "Not specified"}
                              </div>
                              <div className="mt-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Application Status
                                </label>
                                <select
                                  value={user.status || "pending"}
                                  onChange={(e) =>
                                    handleUpdateStatus(
                                      user.id,
                                      e.target.value,
                                      user.profile?.whatsapp,
                                    )
                                  }
                                  className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-prussian-blue shadow-2xs"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="submitted">Submitted</option>
                                  <option value="reviewing">Reviewing</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            </td>
                            <td className="p-5">
                              {user.profile?.highSchoolExam ? (
                                <div className="text-xs">
                                  <div className="mb-1">
                                    <span className="text-slate-400">Exam:</span>{" "}
                                    <span className="font-bold text-prussian-blue">
                                      {user.profile.highSchoolExam}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(user.profile.subjects || [])
                                      .filter((s: any) => s.name && s.grade)
                                      .map((sub: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${["A1", "B2", "B3"].includes(sub.grade) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                                        >
                                          {sub.name.substring(0, 3).toUpperCase()}: {sub.grade}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs space-y-1">
                                  <div>
                                    <span className="text-slate-400">CGPA:</span>{" "}
                                    <span className="font-bold text-prussian-blue">
                                      {user.profile?.cgpa || "-"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">German Grade:</span>{" "}
                                    <span className="font-bold text-prussian-blue">
                                      {user.profile?.germanGrade || "-"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="p-5">
                              <div className="space-y-2">
                                {["waec", "transcript", "passport"].map((docType) => {
                                  const docData = user.documents?.[docType];
                                  if (!docData) return null;

                                  return (
                                    <div
                                      key={docType}
                                      className="flex items-center justify-between gap-3 bg-white/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs"
                                    >
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="capitalize font-bold text-slate-700 w-16">
                                          {docType}
                                        </span>
                                        {docData.status === "verified" ? (
                                          <span className="text-emerald-700 flex items-center gap-1 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            <CheckCircle size={12} /> Verified
                                          </span>
                                        ) : docData.status === "action_required" ? (
                                          <span className="text-rose-700 flex items-center gap-1 text-[10px] font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                            <AlertCircle size={12} /> Re-upload
                                          </span>
                                        ) : (
                                          <span className="text-amber-700 flex items-center gap-1 text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                            <Clock size={12} /> Pending
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={docData.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs font-bold text-blue-600 hover:underline"
                                        >
                                          View
                                        </a>
                                        {docData.status !== "verified" && (
                                          <button
                                            onClick={() =>
                                              handleApproveDocument(
                                                user.id,
                                                docType,
                                                user.profile?.whatsapp,
                                              )
                                            }
                                            className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                                          >
                                            Approve
                                          </button>
                                        )}
                                        {docData.status !== "action_required" && (
                                          <button
                                            onClick={() =>
                                              setDocRejectModal({
                                                isOpen: true,
                                                userId: user.id,
                                                docType,
                                                feedback: "",
                                              })
                                            }
                                            className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-1 rounded hover:bg-rose-100 transition-colors"
                                          >
                                            Reject
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {!user.documents || Object.keys(user.documents).length === 0 ? (
                                  <span className="text-xs text-slate-400 italic">
                                    No documents uploaded
                                  </span>
                                ) : null}
                              </div>

                              {/* Action Bar per candidate */}
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                  onClick={() => setNotifyModal({ isOpen: true, userId: user.id, userName: user.profile?.name || user.email, phone: user.profile?.whatsapp || "", email: user.email, message: "" })}
                                  className="text-xs text-slate-600 hover:text-prussian-blue flex items-center gap-1 font-medium"
                                >
                                  <Send size={12} /> Message
                                </button>
                                <button
                                  onClick={() => handleToggleArchive(user.id, !!user.archived)}
                                  className="text-xs text-slate-600 hover:text-prussian-blue flex items-center gap-1 font-medium"
                                >
                                  {user.archived ? <RotateCcw size={12} /> : <Archive size={12} />}
                                  {user.archived ? "Restore" : "Archive"}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmModal({ isOpen: true, userId: user.id, userName: user.profile?.name || user.email })}
                                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                                >
                                  <Trash2 size={12} /> Delete
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
            </>
          )}

          {activeTab === "overview" && (
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/60">
              <h2 className="text-xl font-bold text-prussian-blue mb-4">Pipeline Analytics Summary</h2>
              <p className="text-sm text-slate-600 mb-6">Real-time candidate metrics generated from live Firestore state.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 text-sm mb-2">Total Candidates Registered</h3>
                  <div className="text-4xl font-extrabold text-prussian-blue">{users.length}</div>
                </div>
                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <h3 className="font-bold text-amber-900 text-sm mb-2">High Priority Conversion Rate</h3>
                  <div className="text-4xl font-extrabold text-amber-600">
                    {users.length ? Math.round((stats.highPriority / users.length) * 100) : 0}%
                  </div>
                </div>
                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <h3 className="font-bold text-emerald-900 text-sm mb-2">Documents Verified Total</h3>
                  <div className="text-4xl font-extrabold text-emerald-600">{stats.verifiedDocs}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Candidate Detail Drawer */}
      {detailDrawerUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 border-l border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-prussian-blue">
                  {detailDrawerUser.profile?.name || detailDrawerUser.displayName || "Candidate Details"}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{detailDrawerUser.email}</p>
              </div>
              <button
                onClick={() => setDetailDrawerUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-6 space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Account Overview</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                  <div><span className="text-slate-500">UID:</span> <code className="text-xs">{detailDrawerUser.id}</code></div>
                  <div><span className="text-slate-500">Sign-up Date:</span> <span className="font-semibold">{detailDrawerUser.createdAt || "N/A"}</span></div>
                  <div><span className="text-slate-500">Status:</span> <span className="font-bold uppercase text-prussian-blue">{detailDrawerUser.status || "pending"}</span></div>
                  <div><span className="text-slate-500">Archived:</span> <span className="font-semibold">{detailDrawerUser.archived ? "Yes" : "No"}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Academic & Preference Info</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                  <div><span className="text-slate-500">Field of Interest:</span> <span className="font-bold">{detailDrawerUser.profile?.fieldOfInterest || "N/A"}</span></div>
                  <div><span className="text-slate-500">CGPA:</span> <span className="font-bold">{detailDrawerUser.profile?.cgpa || "N/A"}</span></div>
                  <div><span className="text-slate-500">Institution:</span> <span className="font-bold">{detailDrawerUser.profile?.institution || "N/A"}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Activity Audit Log</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 max-h-48 overflow-y-auto">
                  {(detailDrawerUser.activityLog || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                  ) : (
                    (detailDrawerUser.activityLog || []).map((log: any, idx: number) => (
                      <div key={idx} className="text-xs border-b border-slate-200/50 pb-1.5 last:border-0">
                        <div className="font-semibold text-slate-800">{log.action}</div>
                        <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()} ({log.by})</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUserEdit}
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-heading text-lg font-bold text-prussian-blue flex items-center gap-2">
                <Edit size={18} className="text-gold" /> Edit Candidate Details
              </h3>
              <button
                type="button"
                onClick={() => setEditUserModal({ isOpen: false, user: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUserModal.user.displayName || ""}
                  onChange={(e) => setEditUserModal({ ...editUserModal, user: { ...editUserModal.user, displayName: e.target.value } })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-prussian-blue"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editUserModal.user.whatsapp || ""}
                    onChange={(e) => setEditUserModal({ ...editUserModal, user: { ...editUserModal.user, whatsapp: e.target.value } })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-prussian-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CGPA</label>
                  <input
                    type="text"
                    value={editUserModal.user.cgpa || ""}
                    onChange={(e) => setEditUserModal({ ...editUserModal, user: { ...editUserModal.user, cgpa: e.target.value } })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-prussian-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Field of Interest</label>
                <input
                  type="text"
                  value={editUserModal.user.fieldOfInterest || ""}
                  onChange={(e) => setEditUserModal({ ...editUserModal, user: { ...editUserModal.user, fieldOfInterest: e.target.value } })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-prussian-blue"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="highPriorityCheck"
                  checked={!!editUserModal.user.isHighPriority}
                  onChange={(e) => setEditUserModal({ ...editUserModal, user: { ...editUserModal.user, isHighPriority: e.target.checked } })}
                  className="w-4 h-4 rounded text-prussian-blue"
                />
                <label htmlFor="highPriorityCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  ⭐ Tag as High-Priority Candidate
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditUserModal({ isOpen: false, user: null })}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-prussian-blue bg-gold hover:bg-yellow-400 rounded-xl shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Reject / Request Re-upload Modal */}
      {docRejectModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-prussian-blue mb-2 flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-500" />
              Request Document Re-upload
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify feedback for why the {docRejectModal.docType.toUpperCase()} was rejected. This reason will be displayed on the candidate's dashboard.
            </p>
            <textarea
              value={docRejectModal.feedback}
              onChange={(e) => setDocRejectModal({ ...docRejectModal, feedback: e.target.value })}
              placeholder="e.g. The transcript file is blurry or missing the university stamp. Please upload a clear PDF."
              className="w-full h-28 p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-prussian-blue resize-none mb-4"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDocRejectModal({ isOpen: false, userId: "", docType: "", feedback: "" })}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDocument}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-rose-600 mb-2 flex items-center gap-2">
              <Trash2 size={20} /> Permanently Delete Candidate Data?
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to delete all record data for <strong>{deleteConfirmModal.userName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, userId: "", userName: "" })}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Notification Modal */}
      {notifyModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6">
            <h3 className="font-bold text-lg text-prussian-blue mb-1 flex items-center gap-2">
              <Send size={18} className="text-gold" /> Send Message to Candidate
            </h3>
            <p className="text-xs text-slate-500 mb-4">To: {notifyModal.userName} ({notifyModal.email})</p>
            <textarea
              value={notifyModal.message}
              onChange={(e) => setNotifyModal({ ...notifyModal, message: e.target.value })}
              placeholder="Type your message or notification here..."
              className="w-full h-32 p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-prussian-blue resize-none mb-4"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNotifyModal({ isOpen: false, userId: "", userName: "", phone: "", email: "", message: "" })}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 text-xs font-bold text-prussian-blue bg-gold hover:bg-yellow-400 rounded-xl shadow-sm"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {notesModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-heading text-xl font-bold text-prussian-blue flex items-center gap-2">
                  <FileText size={20} className="text-gold" /> Private Notes
                </h3>
                <p className="text-sm text-slate-500 mt-1">For {notesModal.userName}</p>
              </div>
              <button
                onClick={() => setNotesModal({ isOpen: false, userId: "", text: "", userName: "" })}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={notesModal.text}
                onChange={(e) => setNotesModal({ ...notesModal, text: e.target.value })}
                placeholder="Add internal notes, interview feedback, or specific candidate details here. These notes are only visible to administrators."
                className="w-full h-40 p-4 border border-slate-200 rounded-xl outline-none focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 resize-none text-sm text-slate-700 bg-slate-50/50 placeholder:text-slate-400"
              ></textarea>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                onClick={() => setNotesModal({ isOpen: false, userId: "", text: "", userName: "" })}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2.5 text-sm font-bold text-prussian-blue bg-gold hover:bg-yellow-400 rounded-xl transition-colors shadow-sm"
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
