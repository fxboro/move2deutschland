import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { checkIsAdmin } from '../utils/auth';
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
  Settings, 
  LogOut,
  Bell,
  FileText,
  X
} from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [activeTab, setActiveTab] = useState('applicants');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notesModal, setNotesModal] = useState<{isOpen: boolean, userId: string, text: string, userName: string}>({isOpen: false, userId: '', text: '', userName: ''});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Panel | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Move2Deutschland Administration Panel for managing applicant pipelines and document verification.");
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdminUser = await checkIsAdmin(user);
        if (isAdminUser) {
          setIsAdmin(true);
          fetchUsers();
          return;
        }
      }
      navigate('/dashboard'); // Redirect non-admins
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string, phone: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));

      // Send Notification
      if (phone) {
        const formattedPhone = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`;
        const message = `Hello! Your Move2Deutschland application status has been updated to: ${newStatus.toUpperCase()}. Log in to your dashboard for more details.`;
        
        const response = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formattedPhone, message })
        });
        const result = await response.json();
        
        if (result.success) {
          alert(`Status updated to ${newStatus} and notification sent!`);
        } else {
          alert(`Status updated, but notification failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        alert(`Status updated to ${newStatus}! (No phone number for notification)`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleApproveDocument = async (userId: string, docType: string, phone: string) => {
    try {
      // Update Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`documents.${docType}.status`]: 'verified'
      });

      // Update local state
      setUsers(users.map(u => {
        if (u.id === userId && u.documents) {
          return {
            ...u,
            documents: {
              ...u.documents,
              [docType]: { ...u.documents[docType], status: 'verified' }
            }
          };
        }
        return u;
      }));

      // Send WhatsApp Notification via Twilio
      if (phone) {
        const formattedPhone = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`;
        const message = `Great news from Move2Deutschland! Your ${docType.toUpperCase()} has been approved. You're one step closer to Germany!`;
        
        const response = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formattedPhone, message })
        });
        const result = await response.json();
        
        if (result.success) {
          alert(`${docType.toUpperCase()} approved and notification sent!`);
        } else {
          alert(`${docType.toUpperCase()} approved, but notification failed.`);
        }
      } else {
        alert(`${docType.toUpperCase()} approved!`);
      }
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Failed to approve document.");
    }
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (!newStatus || selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const updates = selectedUsers.map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { status: newStatus });
      });
      await Promise.all(updates);
      
      setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: newStatus } : u));
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk status update", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApproveDocuments = async () => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const updates = selectedUsers.map(async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.documents) return null;
        
        const docUpdates: any = {};
        let updatedDocs = { ...user.documents };
        
        ['waec', 'transcript', 'passport'].forEach(docType => {
          if (user.documents[docType] && user.documents[docType].status === 'pending') {
            docUpdates[`documents.${docType}.status`] = 'verified';
            updatedDocs[docType] = { ...updatedDocs[docType], status: 'verified' };
          }
        });
        
        if (Object.keys(docUpdates).length > 0) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, docUpdates);
          return { userId, updatedDocs };
        }
        return null;
      });
      
      const results = await Promise.all(updates);
      
      setUsers(users.map(u => {
        const result = results.find(r => r?.userId === u.id);
        if (result) {
          return { ...u, documents: result.updatedDocs };
        }
        return u;
      }));
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk approve", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveNote = async () => {
    if (!notesModal.userId) return;
    try {
      const userRef = doc(db, 'users', notesModal.userId);
      await updateDoc(userRef, { adminNotes: notesModal.text });
      
      setUsers(users.map(u => u.id === notesModal.userId ? { ...u, adminNotes: notesModal.text } : u));
      setNotesModal({ isOpen: false, userId: '', text: '', userName: '' });
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note.");
    }
  };

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const matchPriority = filterPriority === 'All' || 
      (filterPriority === 'High' && u.profile?.isHighPriority) || 
      (filterPriority === 'Normal' && !u.profile?.isHighPriority);
    
    const matchCourse = filterCourse === 'All' || u.profile?.fieldOfInterest === filterCourse;
    
    return matchPriority && matchCourse;
  });

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending' || !u.status).length,
    highPriority: users.filter(u => u.profile?.isHighPriority).length,
    verifiedDocs: users.reduce((acc, u) => {
      const docs = u.documents || {};
      const verifiedCount = Object.values(docs).filter((d: any) => d.status === 'verified').length;
      return acc + verifiedCount;
    }, 0)
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 font-sans flex flex-col md:flex-row relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px] pointer-events-none z-0"></div>

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 backdrop-blur-xl border-r border-white/10 text-white flex flex-col md:min-h-screen sticky top-0 z-20 shadow-2xl">
        <div className="p-6">
          <div className="mb-12">
            <Logo size="lg" variant="light" />
            <span className="block text-[10px] uppercase tracking-widest text-gold/60 mt-1 font-sans">Admin Control</span>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('applicants')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'applicants' ? 'bg-gold text-prussian-blue' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Users size={20} />
              Applicants
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-gold text-prussian-blue' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <LayoutDashboard size={20} />
              Overview
            </button>
            <button 
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:bg-white/5 rounded-xl font-medium transition-colors opacity-50 cursor-not-allowed"
            >
              <Bell size={20} />
              Notifications
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full text-left mb-2">
            <ArrowLeft size={18} />
            Exit to Home
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full text-left">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 relative z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-prussian-blue dark:text-white flex items-center gap-3">
                {activeTab === 'applicants' ? 'Applicant Pipeline' : 'Admin Dashboard'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'applicants' 
                  ? 'Manage, verify, and communicate with Nigerian candidates.' 
                  : 'Global overview of your application ecosystem.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => fetchUsers()} 
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-prussian-blue dark:text-white font-bold hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Clock size={16} /> Refresh Data
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Applicants', value: stats.total, icon: User, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-slate-900/40' },
                { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-slate-900/40' },
                { label: 'High Priority', value: stats.highPriority, icon: Filter, color: 'text-gold', bg: 'bg-gold/10 dark:bg-gold/5' },
                { label: 'Verified Docs', value: stats.verifiedDocs, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-slate-900/40' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="text-2xl font-bold text-prussian-blue dark:text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-550 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'applicants' && (
            <>
              {/* Filters */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50 mb-8 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-655 dark:text-slate-300 font-bold">
                  <Filter size={18} /> Filters:
                </div>
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 bg-white/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Normal">Normal Priority</option>
                </select>
                <select 
                  value={filterCourse} 
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 bg-white/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 font-medium"
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

              {/* Bulk Actions Bar */}
              {selectedUsers.length > 0 && (
                <div className="bg-prussian-blue text-white p-4 rounded-2xl shadow-lg mb-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{selectedUsers.length} selected</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select 
                      onChange={(e) => {
                        if(e.target.value) {
                          handleBulkUpdateStatus(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold font-medium"
                    >
                      <option value="" className="text-slate-800">Change Status...</option>
                      <option value="pending" className="text-slate-800">Pending</option>
                      <option value="submitted" className="text-slate-800">Submitted</option>
                      <option value="reviewing" className="text-slate-800">Reviewing</option>
                      <option value="approved" className="text-slate-800">Approved</option>
                      <option value="rejected" className="text-slate-800">Rejected</option>
                    </select>
                    <button 
                      onClick={handleBulkApproveDocuments}
                      className="bg-gold text-prussian-blue text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      Approve All Documents
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 dark:border-slate-800/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/40 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="p-5 w-12">
                          <input 
                            type="checkbox" 
                            checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-prussian-blue focus:ring-prussian-blue cursor-pointer"
                          />
                        </th>
                        <th className="p-5 font-bold">Applicant</th>
                        <th className="p-5 font-bold">Course & Priority</th>
                        <th className="p-5 font-bold">Grades</th>
                        <th className="p-5 font-bold">Documents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="p-5"></td>
                            <td className="p-5"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2"></div><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div></td>
                            <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 mb-2"></div><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div></td>
                            <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 mb-2"></div><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div></td>
                            <td className="p-5"><div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div></td>
                          </tr>
                        ))
                      ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">No applicants found matching the current filters.</td></tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className={`hover:bg-white/50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100/50 dark:border-slate-800/50 ${selectedUsers.includes(user.id) ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                            <td className="p-5">
                              <input 
                                type="checkbox" 
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                                className="w-4 h-4 rounded border-slate-300 text-prussian-blue focus:ring-prussian-blue cursor-pointer"
                              />
                            </td>
                            <td className="p-5">
                              <div className="font-bold text-prussian-blue dark:text-white text-lg">{user.profile?.name || user.email || 'Unknown'}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 bg-white/50 dark:bg-slate-950/50 inline-flex px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/50">
                                <MessageSquare size={14} /> {user.profile?.whatsapp || 'No phone'}
                              </div>
                              <div className="mt-3">
                                <button 
                                  onClick={() => setNotesModal({ isOpen: true, userId: user.id, text: user.adminNotes || '', userName: user.profile?.name || user.email || 'Applicant' })}
                                  className="text-xs text-slate-600 dark:text-slate-355 flex items-center gap-1.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors inline-flex px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm font-medium"
                                >
                                  <FileText size={14} className={user.adminNotes ? "text-blue-500" : "text-slate-400"} /> 
                                  {user.adminNotes ? 'Edit Notes' : 'Add Note'}
                                </button>
                              </div>
                            </td>
                            <td className="p-5">
                              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.profile?.fieldOfInterest || 'Not specified'}</div>
                              {user.profile?.isHighPriority && (
                                <span className="inline-block mt-2 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold rounded-md border border-yellow-200 dark:border-yellow-900/40">
                                  ⭐ High Priority
                                </span>
                              )}
                              <div className="mt-4">
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">App Status</label>
                                <select 
                                  value={user.status || 'pending'} 
                                  onChange={(e) => handleUpdateStatus(user.id, e.target.value, user.profile?.whatsapp)}
                                  className="text-xs font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none focus:border-prussian-blue dark:text-slate-200"
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
                                <div className="text-sm">
                                  <div className="mb-2"><span className="text-slate-400 dark:text-slate-500 font-medium">Exam:</span> <span className="font-bold text-prussian-blue dark:text-white">{user.profile.highSchoolExam}</span></div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(user.profile.subjects || []).filter((s: any) => s.name && s.grade).map((sub: any, idx: number) => (
                                      <span key={idx} className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${['A1', 'B2', 'B3'].includes(sub.grade) ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800/80'}`} title={sub.name}>
                                        {sub.name.substring(0, 3).toUpperCase()}: {sub.grade}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-sm mb-1"><span className="text-slate-400 dark:text-slate-500 font-medium">CGPA:</span> <span className="font-bold text-prussian-blue dark:text-white">{user.profile?.cgpa || '-'}</span></div>
                                  <div className="text-sm"><span className="text-slate-400 dark:text-slate-500 font-medium">German:</span> <span className="font-bold text-prussian-blue dark:text-white">{user.profile?.germanGrade || '-'}</span></div>
                                </>
                              )}
                            </td>
                            <td className="p-5">
                              <div className="space-y-3">
                                {['waec', 'transcript', 'passport'].map(docType => {
                                  const docData = user.documents?.[docType];
                                  if (!docData) return null;
                                  
                                  return (
                                    <div key={docType} className="flex items-center justify-between gap-4 bg-white/80 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="capitalize font-bold text-slate-700 dark:text-slate-300 w-20">{docType}</span>
                                        {docData.status === 'verified' ? (
                                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 text-xs font-bold bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-md border border-green-100 dark:border-green-900/40"><CheckCircle size={14}/> Verified</span>
                                        ) : (
                                          <span className="text-yellow-600 dark:text-yellow-450 flex items-center gap-1.5 text-xs font-bold bg-yellow-50 dark:bg-yellow-950/20 px-2 py-1 rounded-md border border-yellow-100 dark:border-yellow-900/40"><Clock size={14}/> Pending</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <a href={docData.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 dark:text-blue-450 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">View</a>
                                        {docData.status === 'pending' && (
                                          <button 
                                            onClick={() => handleApproveDocument(user.id, docType, user.profile?.whatsapp)}
                                            className="bg-prussian-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-prussian-blue/90 transition-colors shadow-sm"
                                          >
                                            Approve
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {!user.documents && <span className="text-sm text-slate-400 dark:text-slate-500 italic">No documents uploaded yet</span>}
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
        </div>
      </main>

      {/* Notes Modal */}
      {notesModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <h3 className="font-heading text-xl font-bold text-prussian-blue dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-gold" />
                  Private Notes
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">For {notesModal.userName}</p>
              </div>
              <button 
                onClick={() => setNotesModal({ isOpen: false, userId: '', text: '', userName: '' })}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={notesModal.text}
                onChange={(e) => setNotesModal({ ...notesModal, text: e.target.value })}
                placeholder="Add internal notes, interview feedback, or specific candidate details here. These notes are only visible to administrators."
                className="w-full h-40 p-4 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 resize-none text-sm text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/50 placeholder:text-slate-400"
              ></textarea>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setNotesModal({ isOpen: false, userId: '', text: '', userName: '' })}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
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
