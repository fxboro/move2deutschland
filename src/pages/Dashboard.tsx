import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  UploadCloud, 
  AlertCircle,
  FileCheck,
  BookOpen,
  Download,
  LogOut,
  User,
  Calculator,
  Send,
  ShieldAlert,
  Edit2,
  X,
  ArrowLeft
} from 'lucide-react';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  // Form & Calculation State
  const [cgpa, setCgpa] = useState('');
  const [germanGrade, setGermanGrade] = useState<string | null>(null);
  
  // Document Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [docStatuses, setDocStatuses] = useState<Record<string, 'missing' | 'pending' | 'verified'>>({
    waec: 'missing',
    transcript: 'missing',
    passport: 'missing'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    displayName: '',
    cgpa: '',
    institution: '',
    fieldOfInterest: '',
    financialReadiness: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          navigate('/verify-email');
          return;
        }
        
        if (currentUser.email === 'chimadayo43@gmail.com') {
          navigate('/admin');
          return;
        }

        setUser(currentUser);
        
        // Load user data from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let profileData = {};
          let docData = {};

          if (userDoc.exists()) {
            const data = userDoc.data();
            profileData = data.profile || {};
            docData = data.documents || {};
          }

          // Sync local storage data if exists (for first-time users coming from landing page)
          const storedLeadData = localStorage.getItem('move2deutschland_lead_form');
          if (storedLeadData) {
            try {
              const parsedData = JSON.parse(storedLeadData);
              // Only merge if Firestore doesn't already have these fields or if they are empty
              profileData = {
                ...profileData,
                whatsapp: (profileData as any).whatsapp || parsedData.whatsapp,
                fieldOfInterest: (profileData as any).fieldOfInterest || parsedData.fieldOfInterest,
                cgpa: (profileData as any).cgpa || parsedData.cgpa,
                financialReadiness: (profileData as any).financialReadiness || parsedData.financialReadiness,
              };
              
              // Recalculate priority
              (profileData as any).isHighPriority = ['High', 'Sponsor'].includes((profileData as any).financialReadiness) && parseFloat((profileData as any).cgpa) >= 3.5;

              // Clear local storage after sync
              localStorage.removeItem('move2deutschland_lead_form');
              
              // Save the merged data back to Firestore
              await setDoc(userDocRef, {
                email: currentUser.email,
                profile: profileData
              }, { merge: true });
            } catch (e) {
              console.error("Error parsing lead data:", e);
            }
          } else if (!userDoc.exists()) {
            // If no doc and no lead data, create initial doc
            await setDoc(userDocRef, {
              email: currentUser.email,
              profile: {
                name: currentUser.displayName || '',
                status: 'pending'
              }
            }, { merge: true });
          }

          // Pre-fill the 'Edit Profile' modal's form fields with the latest data
          setEditProfileData({
            displayName: (profileData as any).name || currentUser.displayName || '',
            cgpa: (profileData as any).cgpa || '',
            institution: (profileData as any).institution || '',
            fieldOfInterest: (profileData as any).fieldOfInterest || '',
            financialReadiness: (profileData as any).financialReadiness || ''
          });

          // Update other UI states
          if ((profileData as any).cgpa) {
            setCgpa((profileData as any).cgpa.toString());
            calculateGrade((profileData as any).cgpa.toString());
          }

          if (docData) {
            setDocStatuses(prev => ({
              ...prev,
              waec: (docData as any).waec?.status || 'missing',
              transcript: (docData as any).transcript?.status || 'missing',
              passport: (docData as any).passport?.status || 'missing',
            }));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const calculateGrade = (value: string) => {
    const nMax = 5.0;
    const nMin = 1.0;
    const nd = parseFloat(value);
    if (!isNaN(nd) && nd >= nMin && nd <= nMax) {
      // Modified Bavarian Formula
      const grade = ((nMax - nd) / (nMax - nMin)) * 3 + 1;
      setGermanGrade(grade.toFixed(1));
    } else {
      setGermanGrade(null);
    }
  };

  const handleCgpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCgpa(val);
    calculateGrade(val);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      // Update Firebase Auth profile if name changed
      if (editProfileData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: editProfileData.displayName });
        // Force a small refresh of the user object in state to trigger re-render
        setUser({ ...user, displayName: editProfileData.displayName } as FirebaseUser);
      }

      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profile: {
          name: editProfileData.displayName,
          cgpa: editProfileData.cgpa,
          institution: editProfileData.institution,
          fieldOfInterest: editProfileData.fieldOfInterest,
          financialReadiness: editProfileData.financialReadiness,
          isHighPriority: ['High', 'Sponsor'].includes(editProfileData.financialReadiness) && parseFloat(editProfileData.cgpa) >= 3.5
        }
      }, { merge: true });

      // Update local CGPA state if it changed
      if (editProfileData.cgpa) {
        setCgpa(editProfileData.cgpa);
        calculateGrade(editProfileData.cgpa);
      }

      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadClick = (docId: string) => {
    setActiveDocId(docId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocId || !user) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or JPG file.');
      return;
    }

    setUploadingDoc(activeDocId);
    const storageRef = ref(storage, `users/${user.uid}/documents/${activeDocId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({ ...prev, [activeDocId]: progress }));
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploadingDoc(null);
        alert('Upload failed. Please try again.');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          documents: {
            [activeDocId]: {
              url: downloadURL,
              status: 'pending',
              uploadedAt: new Date().toISOString()
            }
          }
        }, { merge: true });

        setDocStatuses(prev => ({ ...prev, [activeDocId]: 'pending' }));
        setUploadingDoc(null);
        setUploadProgress(prev => ({ ...prev, [activeDocId]: 0 }));
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const handleSubmitApplication = async () => {
    if (!user || !cgpa || !germanGrade) {
      alert("Please complete your academic profile first.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profile: {
          cgpa: parseFloat(cgpa),
          germanGrade: parseFloat(germanGrade),
          submittedAt: new Date().toISOString()
        },
        status: 'submitted'
      }, { merge: true });

      // Trigger Email Extension via 'mail' collection
      await addDoc(collection(db, 'mail'), {
        to: 'admin@move2deutschland.com',
        message: {
          subject: `New Application Submitted: ${user.displayName || user.email}`,
          html: `
            <h2>New Application</h2>
            <p><strong>Name:</strong> ${user.displayName || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Nigerian CGPA:</strong> ${cgpa}</p>
            <p><strong>German Grade:</strong> ${germanGrade}</p>
            <p>Please review their documents in the dashboard.</p>
          `
        }
      });

      alert('Application submitted successfully! We will review your documents shortly.');
    } catch (error) {
      console.error("Submission failed:", error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Eligibility', status: 'completed' },
    { id: 2, title: 'Document Upload', status: 'current' },
    { id: 3, title: 'Expert Review', status: 'upcoming' },
    { id: 4, title: 'Visa Prep', status: 'upcoming' },
    { id: 5, title: 'Pre-Departure', status: 'upcoming' },
  ];

  const documentsList = [
    { id: 'waec', name: 'WAEC Certificate', icon: FileCheck },
    { id: 'transcript', name: 'University Transcript', icon: Clock },
    { id: 'passport', name: 'International Passport', icon: AlertCircle },
  ];

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'verified': return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Verified' };
      case 'pending': return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Pending Review' };
      default: return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Missing' };
    }
  };

  const resources = [
    { id: 1, title: 'Blocked Account Guide', description: 'Step-by-step instructions for opening your Sperrkonto.', size: '2.4 MB' },
    { id: 2, title: 'Health Insurance Overview', description: 'Comparing public vs. private insurance options.', size: '1.8 MB' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 font-sans flex flex-col md:flex-row relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-prussian-blue/90 backdrop-blur-xl border-r border-white/10 text-white flex flex-col md:min-h-screen sticky top-0 z-20 shadow-2xl">
        <div className="p-6">
          <Link to="/" className="font-heading font-bold text-2xl tracking-tight block mb-12">
            move<span className="text-gold">2</span>deutschland
          </Link>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl font-medium text-white transition-colors">
              <User size={20} />
              My Application
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-xl font-medium transition-colors">
              <BookOpen size={20} />
              Resources
            </a>
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          {user?.email === 'chimadayo43@gmail.com' && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gold hover:bg-white/5 rounded-xl font-bold transition-colors mb-2">
              <ShieldAlert size={20} />
              Admin Portal
            </Link>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate">{user?.displayName || 'Candidate'}</p>
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
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
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full relative z-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-prussian-blue mb-2">
              Candidate Dashboard
            </h1>
            <p className="text-slate-500">Track your progress and manage your application documents.</p>
          </div>
          <button 
            onClick={handleSubmitApplication}
            disabled={isSubmitting}
            className="hidden md:flex items-center gap-2 bg-gold text-prussian-blue font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Application</>}
          </button>
        </header>

        {/* Application Progress Tracker */}
        <section className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 md:p-8 mb-8">
          <h2 className="font-heading text-xl font-bold text-prussian-blue mb-8">Application Progress</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full hidden md:block"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-gold rounded-full hidden md:block transition-all duration-1000"
              style={{ width: '25%' }}
            ></div>

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-colors ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'current' ? 'bg-gold text-prussian-blue' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 size={20} /> : 
                     step.status === 'current' ? <span className="font-bold text-sm">{step.id}</span> :
                     <Circle size={12} className="fill-current" />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm md:text-base ${
                      step.status === 'upcoming' ? 'text-slate-400' : 'text-prussian-blue'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 md:hidden mt-0.5">
                      {step.status === 'completed' ? 'Completed' : step.status === 'current' ? 'In Progress' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            
            {/* Academic Profile & Grade Conversion */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-prussian-blue flex items-center justify-center">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-prussian-blue">Academic Profile</h2>
                  <p className="text-sm text-slate-500">Convert your Nigerian CGPA to the German grading scale.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nigerian CGPA (5.0 Scale)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    value={cgpa}
                    onChange={handleCgpaChange}
                    placeholder="e.g. 4.20"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">German Grade (Modified Bavarian)</label>
                  <div className={`w-full px-4 py-3 rounded-xl border ${germanGrade ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'} font-bold text-lg flex items-center`}>
                    {germanGrade ? `${germanGrade} (1.0 is highest)` : 'Enter CGPA to calculate'}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Management */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 md:p-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-prussian-blue">Required Documents</h2>
                  <p className="text-sm text-slate-500 mt-1">Please upload clear, scanned copies (PDF/JPG).</p>
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.jpg,.jpeg" 
                className="hidden" 
              />

              <div className="grid gap-4">
                {documentsList.map((docItem) => {
                  const status = docStatuses[docItem.id];
                  const config = getStatusConfig(status);
                  const isUploading = uploadingDoc === docItem.id;
                  const progress = uploadProgress[docItem.id] || 0;

                  return (
                    <motion.div 
                      key={docItem.id}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md relative overflow-hidden"
                    >
                      {isUploading && (
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100 z-20">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-prussian-blue shadow-[0_0_10px_rgba(0,49,83,0.3)]"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
                          <docItem.icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-prussian-blue">{docItem.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.color} ${config.border}`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleUploadClick(docItem.id)}
                        disabled={status === 'verified' || isUploading}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors relative z-10 ${
                          status === 'verified' 
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
                            : isUploading
                              ? 'bg-blue-50 text-prussian-blue cursor-wait'
                              : 'bg-prussian-blue text-white hover:bg-prussian-blue/90'
                        }`}
                      >
                        {status === 'verified' ? 'Uploaded' : isUploading ? `Uploading ${Math.round(progress)}%` : <><UploadCloud size={16} /> Upload</>}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Submit Button */}
            <button 
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
              className="w-full md:hidden flex items-center justify-center gap-2 bg-gold text-prussian-blue font-bold py-4 px-6 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Application</>}
            </button>

          </section>

          {/* Resource Hub */}
          <section className="space-y-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6">
              <div className="mb-4">
                <h2 className="font-heading text-xl font-bold text-prussian-blue">Resource Hub</h2>
                <p className="text-sm text-slate-500 mt-1">Essential guides for your journey.</p>
              </div>

              <div className="grid gap-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-white/80 rounded-2xl p-5 shadow-sm border border-slate-100 group hover:border-gold/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50/80 text-prussian-blue flex items-center justify-center">
                        <BookOpen size={20} />
                      </div>
                      <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-gold group-hover:text-prussian-blue transition-colors">
                        <Download size={16} />
                      </button>
                    </div>
                    <h3 className="font-bold text-prussian-blue text-sm mb-1">{resource.title}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{resource.description}</p>
                    <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <FileText size={12} /> PDF • {resource.size}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-gradient-to-br from-prussian-blue/90 to-slate-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white mt-6 shadow-xl">
              <h3 className="font-heading font-bold text-lg mb-2">Need Assistance?</h3>
              <p className="text-sm text-slate-300 mb-4">Our expert consultants are available to help you with your application.</p>
              <button className="w-full bg-gold text-prussian-blue font-bold py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm shadow-md">
                Contact Support
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-prussian-blue/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200/50">
              <h3 className="font-heading text-xl font-bold text-prussian-blue">Edit Profile</h3>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Display Name</label>
                <input 
                  type="text" 
                  value={editProfileData.displayName}
                  onChange={(e) => setEditProfileData({...editProfileData, displayName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Institution</label>
                <input 
                  type="text" 
                  value={editProfileData.institution}
                  onChange={(e) => setEditProfileData({...editProfileData, institution: e.target.value})}
                  placeholder="e.g. University of Lagos"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">CGPA (5.0 Scale)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    value={editProfileData.cgpa}
                    onChange={(e) => setEditProfileData({...editProfileData, cgpa: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Field of Interest</label>
                  <select 
                    value={editProfileData.fieldOfInterest}
                    onChange={(e) => setEditProfileData({...editProfileData, fieldOfInterest: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                  >
                    <option value="">Select Field</option>
                    <option value="Engineering">Engineering</option>
                    <option value="IT & Computer Science">IT & Computer Science</option>
                    <option value="Healthcare & Medicine">Healthcare & Medicine</option>
                    <option value="Business & Finance">Business & Finance</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Financial Readiness</label>
                <select 
                  value={editProfileData.financialReadiness}
                  onChange={(e) => setEditProfileData({...editProfileData, financialReadiness: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                >
                  <option value="">Select Readiness</option>
                  <option value="High">I have the €11,904 ready</option>
                  <option value="Sponsor">I have a sponsor in Germany</option>
                  <option value="Medium">I am currently saving up</option>
                  <option value="Low">I need a scholarship</option>
                </select>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-prussian-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-prussian-blue/90 transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
