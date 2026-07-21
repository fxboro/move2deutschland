import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
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
  ArrowLeft,
  Landmark,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { auth, db, storage } from "../firebase";
import { checkIsAdmin, checkIsAdminSync } from "../utils/auth";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"application" | "resources">(
    "application",
  );
  const [appStatus, setAppStatus] = useState<string>("pending");
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [opportunityCardData, setOpportunityCardData] = useState<any>(null);

  // Form & Calculation State
  const [cgpa, setCgpa] = useState("");
  const [germanGrade, setGermanGrade] = useState<string | null>(null);

  // Document Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [docStatuses, setDocStatuses] = useState<
    Record<string, "missing" | "pending" | "verified">
  >({
    waec: "missing",
    transcript: "missing",
    passport: "missing",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loading & Error State for Firestore data fetch
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    displayName: "",
    cgpa: "",
    institution: "",
    fieldOfInterest: "",
    financialReadiness: "",
    highSchoolExam: "",
    subjects: [] as { name: string; grade: string }[],
  });

  // Submission gating logic
  const isHighSchool =
    editProfileData.highSchoolExam !== "" &&
    editProfileData.subjects &&
    editProfileData.subjects.length > 0;
  const isAcademicComplete =
    isHighSchool || (!!cgpa && parseFloat(cgpa) >= 1.0 && germanGrade !== null);
  const hasUploadedDoc = Object.values(docStatuses).some(
    (status) => status === "pending" || status === "verified",
  );
  const isReadyToSubmit = isAcademicComplete && hasUploadedDoc;
  const isAlreadySubmitted = ["submitted", "reviewing", "approved"].includes(
    appStatus,
  );

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

  const loadUserData = async (
    currentUser: FirebaseUser,
    isRetry = false,
  ): Promise<void> => {
    const userDocRef = doc(db, "users", currentUser.uid);

    try {
      const userDoc = await getDoc(userDocRef);

      let profileData = {};
      let docData = {};

      if (userDoc.exists()) {
        const data = userDoc.data();
        profileData = data.profile || {};
        docData = data.documents || {};
        setAppStatus(data.status || "pending");
        setOpportunityCardData(data.opportunityCard || null);
      }

      // Sync Chancenkarte point calculator if exists (for users coming from Opportunity Card quiz)
      const storedChancenkarte = localStorage.getItem(
        "move2deutschland_chancenkarte_form",
      );
      if (storedChancenkarte) {
        try {
          const parsedChancenkarte = JSON.parse(storedChancenkarte);
          const opCardData = {
            ...parsedChancenkarte,
            calculatedAt: new Date().toISOString(),
          };
          await setDoc(
            userDocRef,
            {
              opportunityCard: opCardData,
            },
            { merge: true },
          );
          setOpportunityCardData(opCardData);
          localStorage.removeItem("move2deutschland_chancenkarte_form");
        } catch (e) {
          console.error("Error syncing Chancenkarte data:", e);
        }
      }

      // Sync local storage data if exists (for first-time users coming from landing page)
      const storedLeadData = localStorage.getItem("move2deutschland_lead_form");
      if (storedLeadData) {
        try {
          const parsedData = JSON.parse(storedLeadData);
          // Only merge if Firestore doesn't already have these fields or if they are empty
          profileData = {
            ...profileData,
            whatsapp: (profileData as any).whatsapp || parsedData.whatsapp,
            fieldOfInterest:
              (profileData as any).fieldOfInterest ||
              parsedData.fieldOfInterest,
            cgpa: (profileData as any).cgpa || parsedData.cgpa,
            financialReadiness:
              (profileData as any).financialReadiness ||
              parsedData.financialReadiness,
            highSchoolExam:
              (profileData as any).highSchoolExam || parsedData.highSchoolExam,
            subjects: (profileData as any).subjects || parsedData.subjects,
          };

          // Recalculate priority
          let hasHighGrades = false;
          if (parsedData.academicStatus === "High School") {
            const highGradesCount = (
              (profileData as any).subjects || []
            ).filter((sub: any) =>
              ["A1", "B2", "B3"].includes(sub.grade),
            ).length;
            if (highGradesCount >= 5) hasHighGrades = true;
          } else {
            const cgpaVal = parseFloat((profileData as any).cgpa);
            if (!isNaN(cgpaVal) && cgpaVal >= 3.5) hasHighGrades = true;
          }
          (profileData as any).isHighPriority =
            ["High", "Sponsor"].includes(
              (profileData as any).financialReadiness,
            ) && hasHighGrades;

          // Clear local storage after sync
          localStorage.removeItem("move2deutschland_lead_form");

          // Save the merged data back to Firestore
          await setDoc(
            userDocRef,
            {
              email: currentUser.email,
              profile: profileData,
            },
            { merge: true },
          );
        } catch (e) {
          console.error("Error parsing lead data:", e);
        }
      } else if (!userDoc.exists()) {
        // If no doc and no lead data, create initial doc
        await setDoc(
          userDocRef,
          {
            email: currentUser.email,
            profile: {
              name: currentUser.displayName || "",
              status: "pending",
            },
          },
          { merge: true },
        );
      }

      // Pre-fill the 'Edit Profile' modal's form fields with the latest data
      setEditProfileData({
        displayName: (profileData as any).name || currentUser.displayName || "",
        cgpa: (profileData as any).cgpa || "",
        institution: (profileData as any).institution || "",
        fieldOfInterest: (profileData as any).fieldOfInterest || "",
        financialReadiness: (profileData as any).financialReadiness || "",
        highSchoolExam: (profileData as any).highSchoolExam || "",
        subjects: (profileData as any).subjects || [],
      });

      // Update other UI states
      if ((profileData as any).cgpa) {
        setCgpa((profileData as any).cgpa.toString());
        calculateGrade((profileData as any).cgpa.toString());
      }

      if (docData) {
        setDocStatuses((prev) => ({
          ...prev,
          waec: (docData as any).waec?.status || "missing",
          transcript: (docData as any).transcript?.status || "missing",
          passport: (docData as any).passport?.status || "missing",
        }));
      }

      // Data loaded successfully
      setLoadError(null);
    } catch (error: any) {
      const isPermissionError =
        error?.code === "permission-denied" ||
        error?.message?.includes("Missing or insufficient permissions");

      if (isPermissionError && !isRetry) {
        // Token may be stale — force refresh and retry once
        console.warn(
          "Firestore permission denied. Forcing token refresh and retrying...",
        );
        try {
          await currentUser.reload();
          await currentUser.getIdToken(true);
          return loadUserData(currentUser, true);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          setLoadError(
            "Unable to load your data. Your email verification may still be processing. Please sign out and sign back in.",
          );
        }
      } else if (isPermissionError) {
        setLoadError(
          "Unable to load your data. Your email verification may still be processing. Please sign out and sign back in.",
        );
      } else {
        console.error("Error loading user data:", error);
        setLoadError(
          "Something went wrong while loading your data. Please try again.",
        );
      }
    }
  };

  useEffect(() => {
    document.title = "Candidate Dashboard | Move2Deutschland";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Track your admission applications, verify document status, and get resources to relocate to Germany on your candidate dashboard.",
      );
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          navigate("/verify-email");
          return;
        }

        const isAdmin = await checkIsAdmin(currentUser);
        if (isAdmin) {
          navigate("/admin");
          return;
        }

        setUser(currentUser);
        setIsLoading(true);
        setLoadError(null);

        // Load user data from Firestore with retry logic
        await loadUserData(currentUser);
        setIsLoading(false);
      } else {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleCgpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCgpa(val);
    calculateGrade(val);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
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
        setUser({
          ...user,
          displayName: editProfileData.displayName,
        } as FirebaseUser);
      }

      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          profile: {
            name: editProfileData.displayName,
            cgpa: editProfileData.cgpa,
            institution: editProfileData.institution,
            fieldOfInterest: editProfileData.fieldOfInterest,
            financialReadiness: editProfileData.financialReadiness,
            highSchoolExam: editProfileData.highSchoolExam,
            subjects: editProfileData.subjects,
            isHighPriority:
              ["High", "Sponsor"].includes(
                editProfileData.financialReadiness,
              ) &&
              (editProfileData.highSchoolExam
                ? editProfileData.subjects.filter((s) =>
                    ["A1", "B2", "B3"].includes(s.grade),
                  ).length >= 5
                : parseFloat(editProfileData.cgpa) >= 3.5),
          },
        },
        { merge: true },
      );

      // Update local CGPA state if it changed
      if (editProfileData.cgpa) {
        setCgpa(editProfileData.cgpa);
        calculateGrade(editProfileData.cgpa);
      }
      setIsEditProfileOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadClick = (docId: string) => {
    setActiveDocId(docId);
    fileInputRef.current?.click();
  };

  const getFileType = (file: File): string => {
    if (file.type && file.type.trim() !== "") {
      return file.type.toLowerCase();
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "application/pdf";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "png") return "image/png";
    return "";
  };

  const uploadFile = async (file: File, docId: string, isRetry = false) => {
    if (!user) return;

    const mimeType = getFileType(file);
    const isValidPDF =
      mimeType === "application/pdf" ||
      mimeType === "application/x-pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const isValidImage =
      mimeType.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);

    if (!isValidPDF && !isValidImage) {
      toast.warning("Please upload a valid PDF, JPG, or PNG file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning(
        "File size exceeds 10MB limit. Please upload a smaller file.",
      );
      return;
    }

    setUploadingDoc(docId);
    const finalContentType = isValidPDF
      ? "application/pdf"
      : mimeType || "image/jpeg";
    const storageRef = ref(
      storage,
      `users/${user.uid}/documents/${docId}_${file.name}`,
    );
    const metadata = { contentType: finalContentType };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress((prev) => ({ ...prev, [docId]: progress }));
      },
      async (error: any) => {
        console.error("Upload error:", error);
        const isPermissionError =
          error?.code === "storage/unauthorized" ||
          error?.message?.includes("user does not have permission");

        if (isPermissionError && !isRetry) {
          console.warn(
            "Storage permission error. Forcing token refresh and retrying upload...",
          );
          try {
            await user.reload();
            await user.getIdToken(true);
            return uploadFile(file, docId, true);
          } catch (refreshErr) {
            console.error(
              "Token refresh failed during file upload:",
              refreshErr,
            );
          }
        }

        setUploadingDoc(null);
        setUploadProgress((prev) => ({ ...prev, [docId]: 0 }));
        if (isPermissionError) {
          toast.error(
            "Permission denied. Please check email verification or try signing in again.",
          );
        } else {
          toast.error("Upload failed. Please try again.");
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const userDocRef = doc(db, "users", user.uid);
          await setDoc(
            userDocRef,
            {
              documents: {
                [docId]: {
                  url: downloadURL,
                  status: "pending",
                  uploadedAt: new Date().toISOString(),
                },
              },
            },
            { merge: true },
          );

          setDocStatuses((prev) => ({ ...prev, [docId]: "pending" }));
          toast.success(`${docId.toUpperCase()} uploaded successfully!`);
        } catch (dbErr) {
          console.error("Error saving document status to Firestore:", dbErr);
          toast.error(
            "File uploaded but failed to update status. Please refresh.",
          );
        } finally {
          setUploadingDoc(null);
          setUploadProgress((prev) => ({ ...prev, [docId]: 0 }));
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocId) {
      uploadFile(file, activeDocId);
    }
  };

  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (docStatuses[docId] !== "verified") {
      setDragActiveId(docId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(null);
  };

  const handleDrop = async (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(null);

    if (docStatuses[docId] === "verified" || uploadingDoc === docId) return;

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      uploadFile(file, docId);
    }
  };

  const handleSubmitApplication = async () => {
    if (isAlreadySubmitted) {
      toast.info(
        "Your application has already been submitted and is currently under review.",
      );
      return;
    }

    if (!isReadyToSubmit) {
      if (!isAcademicComplete) {
        toast.warning(
          "Please complete your academic profile (CGPA or High School details) before submitting.",
        );
      } else if (!hasUploadedDoc) {
        toast.warning(
          "Please upload at least one required document (WAEC, Transcript, or Passport) before submitting.",
        );
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          profile: {
            cgpa: parseFloat(cgpa),
            germanGrade: parseFloat(germanGrade),
            submittedAt: new Date().toISOString(),
          },
          status: "submitted",
        },
        { merge: true },
      );

      setAppStatus("submitted");

      // Trigger Email Extension via 'mail' collection
      await addDoc(collection(db, "mail"), {
        to: "admin@move2deutschland.com",
        message: {
          subject: `New Application Submitted: ${user.displayName || user.email}`,
          html: `
            <h2>New Application</h2>
            <p><strong>Name:</strong> ${user.displayName || "N/A"}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            ${isHighSchool ? `<p><strong>High School Exam:</strong> ${editProfileData.highSchoolExam}</p>` : ""}
            ${!isHighSchool ? `<p><strong>Nigerian CGPA:</strong> ${cgpa}</p>` : ""}
            ${!isHighSchool ? `<p><strong>German Grade:</strong> ${germanGrade}</p>` : ""}
            <p>Please review their documents in the dashboard.</p>
          `,
        },
      });

      toast.success(
        "Application submitted successfully! We will review your documents shortly.",
      );
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDynamicSteps = () => {
    const isSubmitted = ["submitted", "reviewing", "approved"].includes(
      appStatus,
    );
    const hasUploadedAny = Object.values(docStatuses).some(
      (status) => status === "pending" || status === "verified",
    );
    const hasUploadedAll = Object.values(docStatuses).every(
      (status) => status === "pending" || status === "verified",
    );

    const step1Status = "completed"; // Eligibility always completed

    let step2Status: "completed" | "current" | "upcoming" = "current";
    if (isSubmitted || hasUploadedAll) {
      step2Status = "completed";
    } else if (hasUploadedAny) {
      step2Status = "current";
    }

    let step3Status: "completed" | "current" | "upcoming" = "upcoming";
    if (appStatus === "approved") {
      step3Status = "completed";
    } else if (appStatus === "submitted" || appStatus === "reviewing") {
      step3Status = "current";
    } else if (step2Status === "completed") {
      step3Status = "current";
    }

    let step4Status: "completed" | "current" | "upcoming" = "upcoming";
    if (appStatus === "approved") {
      step4Status = "current";
    }

    let step5Status: "completed" | "current" | "upcoming" = "upcoming";

    return [
      { id: 1, title: "Eligibility", status: step1Status },
      { id: 2, title: "Document Upload", status: step2Status },
      { id: 3, title: "Expert Review", status: step3Status },
      { id: 4, title: "Visa Prep", status: step4Status },
      { id: 5, title: "Pre-Departure", status: step5Status },
    ];
  };

  const steps = getDynamicSteps();

  const getProgressPercentage = () => {
    const completedCount = steps.filter((s) => s.status === "completed").length;
    if (completedCount <= 1) return 0;
    if (completedCount === 2) return 25;
    if (completedCount === 3) return 50;
    if (completedCount === 4) return 75;
    if (completedCount === 5) return 100;
    return 0;
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    const name =
      editProfileData.displayName.split(" ")[0] ||
      user?.displayName?.split(" ")[0] ||
      "Candidate";
    if (hrs < 12) return `Good morning, ${name} 👋`;
    if (hrs < 18) return `Good afternoon, ${name} 👋`;
    return `Good evening, ${name} 👋`;
  };

  const documentsList = [
    { id: "waec", name: "WAEC Certificate", icon: FileCheck },
    { id: "transcript", name: "University Transcript", icon: Clock },
    { id: "passport", name: "International Passport", icon: AlertCircle },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          color: "text-green-600 ",
          bg: "bg-green-50 ",
          border: "border-green-200 ",
          label: "Verified",
        };
      case "pending":
        return {
          color: "text-yellow-600 ",
          bg: "bg-yellow-50 ",
          border: "border-yellow-200 ",
          label: "Pending Review",
        };
      default:
        return {
          color: "text-red-500 ",
          bg: "bg-red-50 ",
          border: "border-red-200 ",
          label: "Missing",
        };
    }
  };

  const resources = [
    {
      id: 1,
      title: "Blocked Account Guide",
      description: "Step-by-step instructions for opening your Sperrkonto.",
      size: "2.4 MB",
      icon: Landmark,
      isNew: true,
      url: "/resources/blocked_account_guide.pdf",
      filename: "Blocked_Account_Guide.pdf",
    },
    {
      id: 2,
      title: "Health Insurance Overview",
      description: "Comparing public vs. private insurance options.",
      size: "1.8 MB",
      icon: ShieldCheck,
      isNew: false,
      url: "/resources/health_insurance_overview.pdf",
      filename: "Health_Insurance_Overview.pdf",
    },
    {
      id: 3,
      title: "Visa Application Checklist",
      description:
        "Official documents required for German embassy appointment.",
      size: "1.2 MB",
      icon: FileCheck,
      isNew: true,
      url: "/resources/visa_application_checklist.pdf",
      filename: "Visa_Application_Checklist.pdf",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row relative overflow-hidden transition-colors duration-300">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px] pointer-events-none z-0"></div>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-prussian-blue text-white py-4 px-6 flex justify-between items-center z-20 shadow-md">
        <Logo size="md" variant="light" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold overflow-hidden border border-gold/30">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"
            )}
          </div>
        </div>
      </div>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-64 bg-prussian-blue/95 backdrop-blur-3xl border-r border-white/10 text-white flex-col h-screen sticky top-0 z-20 shadow-2xl transition-all">
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="mb-12 flex justify-between items-center">
            <Logo size="lg" variant="light" />
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("application")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === "application"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <User size={20} />
              My Application
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === "resources"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <BookOpen size={20} />
              Resources
            </button>
          </nav>
        </div>

        {/* Pinned Bottom Section */}
        <div className="p-6 border-t border-white/10 ">
          {checkIsAdminSync(user) && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 text-gold hover:bg-white/5 rounded-xl font-bold transition-colors mb-2"
            >
              <ShieldAlert size={20} />
              Admin Portal
            </Link>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate">
                  {user?.displayName || "Candidate"}
                </p>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full text-left mb-2"
          >
            <ArrowLeft size={18} />
            Exit to Home
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full text-left cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full relative z-10 pb-48 md:pb-12">
        {/* Error Banner */}
        {loadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <p className="text-sm font-medium text-red-700 ">{loadError}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={async () => {
                  if (user) {
                    setIsLoading(true);
                    setLoadError(null);
                    await loadUserData(user);
                    setIsLoading(false);
                  }
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="animate-pulse space-y-8">
            {/* Greeting Skeleton */}
            <div>
              <div className="h-10 w-80 bg-slate-200 rounded-xl mb-2"></div>
              <div className="h-5 w-96 bg-slate-100 rounded-lg"></div>
            </div>
            {/* Progress Tracker Skeleton */}
            <div className="bg-white/60 backdrop-blur-3xl rounded-2xl border border-white/50 p-6 md:p-8">
              <div className="h-6 w-48 bg-slate-200 rounded-lg mb-8"></div>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 "></div>
                    <div className="h-4 w-20 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Academic Profile Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/60 backdrop-blur-3xl rounded-2xl border border-white/50 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 "></div>
                    <div>
                      <div className="h-6 w-40 bg-slate-200 rounded-lg mb-1"></div>
                      <div className="h-4 w-64 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-12 bg-slate-100 rounded-xl"></div>
                    <div className="h-12 bg-slate-100 rounded-xl"></div>
                  </div>
                </div>
                {/* Document Cards Skeleton */}
                <div className="bg-white/60 backdrop-blur-3xl rounded-2xl border border-white/50 p-6 md:p-8">
                  <div className="h-6 w-44 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 "></div>
                          <div>
                            <div className="h-5 w-36 bg-slate-200 rounded mb-2"></div>
                            <div className="h-4 w-20 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Resource Hub Skeleton */}
              <div className="bg-white/60 backdrop-blur-3xl rounded-2xl border border-white/50 p-6">
                <div className="h-6 w-32 bg-slate-200 rounded-lg mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white/85 rounded-2xl p-5 border border-slate-100 "
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-200 mb-3"></div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-full bg-slate-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-prussian-blue mb-2">
                  {getGreeting()}
                </h1>
                <p className="text-slate-500 ">
                  Track your progress and manage your application documents.
                </p>
              </div>
              <div className="relative group hidden md:block">
                <button
                  onClick={handleSubmitApplication}
                  disabled={
                    !isReadyToSubmit || isSubmitting || isAlreadySubmitted
                  }
                  className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all ${
                    isAlreadySubmitted
                      ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                      : isReadyToSubmit
                        ? "bg-gold text-prussian-blue hover:bg-yellow-400 cursor-pointer shadow-md shadow-gold/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : isAlreadySubmitted ? (
                    <>
                      <CheckCircle2 size={18} /> Application Submitted
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Submit Application
                    </>
                  )}
                </button>
                {!isReadyToSubmit && !isAlreadySubmitted && (
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl text-center z-50 pointer-events-none border border-slate-800">
                    {!isAcademicComplete
                      ? "⚠️ Complete your Academic Profile (CGPA or High School) to submit."
                      : "⚠️ Upload at least 1 required document to submit."}
                  </div>
                )}
              </div>
            </header>

            {/* Application Progress Tracker */}
            <section className="bg-white/60 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] [0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 p-6 md:p-8 mb-8 transition-all">
              <h2 className="font-heading text-xl font-bold text-prussian-blue mb-8">
                Application Progress
              </h2>

              <div className="relative">
                {/* Progress Line (Desktop) */}
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full hidden md:block"></div>
                <div
                  className="absolute top-5 left-0 h-1 bg-gold rounded-full hidden md:block transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>

                {/* Vertical Connecting Line (Mobile) */}
                <div
                  className="absolute top-5 left-5 w-0.5 bg-slate-200 md:hidden"
                  style={{ height: "calc(100% - 40px)" }}
                ></div>
                <div
                  className="absolute top-5 left-5 w-0.5 bg-gold md:hidden transition-all duration-1000"
                  style={{
                    height: `calc((100% - 40px) * ${getProgressPercentage() / 100})`,
                  }}
                ></div>

                <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex md:flex-col items-center md:text-center gap-4 md:gap-3"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-slate-50 shadow-sm transition-colors ${
                          step.status === "completed"
                            ? "bg-green-500 text-white"
                            : step.status === "current"
                              ? "bg-gold text-prussian-blue"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 size={20} />
                        ) : step.status === "current" ? (
                          <span className="font-bold text-sm">{step.id}</span>
                        ) : (
                          <Circle size={12} className="fill-current" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm md:text-base ${
                            step.status === "upcoming"
                              ? "text-slate-400 "
                              : "text-prussian-blue "
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-slate-500 md:hidden mt-0.5">
                          {step.status === "completed"
                            ? "Completed"
                            : step.status === "current"
                              ? "In Progress"
                              : "Pending"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <section
                id="application"
                className={`lg:col-span-2 space-y-8 ${activeTab === "application" ? "block" : "hidden md:block"}`}
              >
                {/* Opportunity Card (Chancenkarte) Score Card */}
                {opportunityCardData && (
                  <div className="bg-white/60 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] [0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 p-6 md:p-8 transition-all space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
                          <Compass size={20} />
                        </div>
                        <div>
                          <h2 className="font-heading text-xl font-bold text-prussian-blue ">
                            Opportunity Card (Chancenkarte)
                          </h2>
                          <p className="text-xs text-slate-500 ">
                            Points assessment for the Germany Job Seeker visa.
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                          opportunityCardData.eligible
                            ? "bg-green-50 border-green-200 text-green-700 "
                            : "bg-red-50 border-red-200 text-red-700 "
                        }`}
                      >
                        {opportunityCardData.eligible
                          ? "Eligible"
                          : "Ineligible"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <p className="text-4xl font-extrabold text-prussian-blue font-heading">
                          {opportunityCardData.score}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                          Total Points
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center col-span-2 text-center md:text-left">
                        <p className="text-sm font-semibold text-slate-600 ">
                          {opportunityCardData.eligible
                            ? "Congratulations! You meet the minimum threshold of 6 points required to apply for the Chancenkarte."
                            : "You do not meet the minimum 6 points threshold. Try improving German language skills or gaining more certified experience."}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="font-bold text-sm text-slate-700 mb-3">
                        Points Breakdown:
                      </h4>
                      <ul className="space-y-2">
                        {opportunityCardData.breakdown &&
                          opportunityCardData.breakdown.map(
                            (item: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm text-slate-600 "
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                                {item}
                              </li>
                            ),
                          )}
                        {(!opportunityCardData.breakdown ||
                          opportunityCardData.breakdown.length === 0) && (
                          <li className="text-sm text-slate-500 italic">
                            Qualifies directly via full recognition (no points
                            needed).
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Academic Profile & Grade Conversion */}
                <div className="bg-white/60 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] [0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 p-6 md:p-8 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-prussian-blue flex items-center justify-center">
                      <Calculator size={20} />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-prussian-blue">
                        Academic Profile
                      </h2>
                      <p className="text-sm text-slate-500">
                        Convert your Nigerian CGPA to the German grading scale.
                      </p>
                    </div>
                  </div>

                  {editProfileData.highSchoolExam ? (
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          High School Exam: {editProfileData.highSchoolExam}
                        </label>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="p-3 font-semibold text-slate-600">
                                  Subject
                                </th>
                                <th className="p-3 font-semibold text-slate-600">
                                  Grade
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {editProfileData.subjects.map((sub, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-medium text-prussian-blue">
                                    {sub.name || "-"}
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${["A1", "B2", "B3"].includes(sub.grade) ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
                                    >
                                      {sub.grade || "-"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Nigerian CGPA (5.0 Scale)
                        </label>
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          German Grade (Modified Bavarian)
                        </label>
                        <div
                          className={`w-full px-4 py-3 rounded-xl border ${germanGrade ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-400"} font-bold text-lg flex items-center`}
                        >
                          {germanGrade
                            ? `${germanGrade} (1.0 is highest)`
                            : "Enter CGPA to calculate"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Management */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 md:p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-prussian-blue">
                        Required Documents
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Please upload clear, scanned copies (PDF/JPG).
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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
                          onDragOver={(e) => handleDragOver(e, docItem.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, docItem.id)}
                          className={`rounded-2xl p-5 shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md relative overflow-hidden ${
                            dragActiveId === docItem.id
                              ? "border-gold border-dashed bg-gold/5 scale-[1.01] "
                              : "bg-white border-slate-100 "
                          }`}
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
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}
                            >
                              <docItem.icon size={24} />
                            </div>
                            <div>
                              <h3 className="font-bold text-prussian-blue ">
                                {docItem.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.color} ${config.border}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="hidden lg:block text-xs text-slate-400 font-medium relative z-10">
                            {dragActiveId === docItem.id
                              ? "Drop file here"
                              : "Drag & drop PDF/JPG here"}
                          </div>

                          <button
                            onClick={() => handleUploadClick(docItem.id)}
                            disabled={status === "verified" || isUploading}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors relative z-10 cursor-pointer ${
                              status === "verified"
                                ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                                : isUploading
                                  ? "bg-blue-50 text-prussian-blue cursor-wait"
                                  : "bg-prussian-blue text-white hover:bg-prussian-blue/90 "
                            }`}
                          >
                            {status === "verified" ? (
                              "Uploaded"
                            ) : isUploading ? (
                              `Uploading ${Math.round(progress)}%`
                            ) : (
                              <>
                                <UploadCloud size={16} /> Upload
                              </>
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Sticky Submit Button Bar */}
                <div className="md:hidden fixed bottom-[60px] left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 z-30 flex flex-col justify-center items-center shadow-lg gap-1.5">
                  <button
                    onClick={handleSubmitApplication}
                    disabled={
                      !isReadyToSubmit || isSubmitting || isAlreadySubmitted
                    }
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md ${
                      isAlreadySubmitted
                        ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                        : isReadyToSubmit
                          ? "bg-gold text-prussian-blue hover:bg-yellow-400 shadow-gold/20 cursor-pointer"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : isAlreadySubmitted ? (
                      <>
                        <CheckCircle2 size={18} /> Application Submitted
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit Application
                      </>
                    )}
                  </button>
                  {!isReadyToSubmit && !isAlreadySubmitted && (
                    <p className="text-[10px] text-slate-500 text-center font-medium">
                      {!isAcademicComplete
                        ? "⚠️ Complete academic profile to enable submit"
                        : "⚠️ Upload at least 1 document to enable submit"}
                    </p>
                  )}
                </div>
              </section>

              {/* Resource Hub */}
              <section
                id="resources"
                className={`space-y-6 ${activeTab === "resources" ? "block" : "hidden md:block"}`}
              >
                <div className="bg-white/60 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] [0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 p-6 transition-all">
                  <div className="mb-4">
                    <h2 className="font-heading text-xl font-bold text-prussian-blue ">
                      Resource Hub
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Essential guides for your journey.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {resources.map((resource) => {
                      const IconComponent = resource.icon;
                      return (
                        <div
                          key={resource.id}
                          className="bg-white/85 rounded-2xl p-5 shadow-sm border border-slate-100 group hover:border-gold/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50/80 text-prussian-blue flex items-center justify-center relative">
                              <IconComponent size={20} />
                              {resource.isNew && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
                                </span>
                              )}
                            </div>
                            <a
                              href={resource.url}
                              download={resource.filename}
                              className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-prussian-blue flex items-center justify-center group-hover:bg-gold group-hover:text-prussian-blue transition-all duration-300 group-hover:scale-110 cursor-pointer"
                              title="Download PDF"
                            >
                              <Download
                                size={16}
                                className="group-hover:translate-y-0.5 transition-transform duration-200"
                              />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-prussian-blue text-sm">
                              {resource.title}
                            </h3>
                            {resource.isNew && (
                              <span className="bg-gold/10 text-gold border border-gold/20 text-[9px] font-extrabold py-0.5 px-2 rounded-full uppercase tracking-wider scale-90">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <FileText size={12} /> PDF • {resource.size}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-gradient-to-br from-prussian-blue/90 to-slate-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white mt-6 shadow-xl">
                  <h3 className="font-heading font-bold text-lg mb-2">
                    Need Assistance?
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Our expert consultants are available to help you with your
                    application.
                  </p>
                  <a
                    href="https://wa.me/2348123456789?text=Hello%20Move2Deutschland%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="w-full bg-gold text-prussian-blue font-bold py-2.5 rounded-xl hover:bg-yellow-400 transition-colors text-sm shadow-md cursor-pointer">
                      Contact Support
                    </button>
                  </a>
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 ">
              <h3 className="font-heading text-xl font-bold text-prussian-blue ">
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editProfileData.displayName}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      displayName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Institution
                </label>
                <input
                  type="text"
                  value={editProfileData.institution}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      institution: e.target.value,
                    })
                  }
                  placeholder="e.g. University of Lagos"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                />
              </div>
              {!editProfileData.highSchoolExam && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      CGPA (5.0 Scale)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      max="5.0"
                      value={editProfileData.cgpa}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          cgpa: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Field of Interest
                    </label>
                    <select
                      value={editProfileData.fieldOfInterest}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          fieldOfInterest: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="" className="bg-white text-slate-900 ">
                        Select Field
                      </option>
                      <option
                        value="Engineering"
                        className="bg-white text-slate-900 "
                      >
                        Engineering
                      </option>
                      <option
                        value="IT & Computer Science"
                        className="bg-white text-slate-900 "
                      >
                        IT & Computer Science
                      </option>
                      <option
                        value="Healthcare & Medicine"
                        className="bg-white text-slate-900 "
                      >
                        Healthcare & Medicine
                      </option>
                      <option
                        value="Business & Finance"
                        className="bg-white text-slate-900 "
                      >
                        Business & Finance
                      </option>
                      <option
                        value="Arts & Humanities"
                        className="bg-white text-slate-900 "
                      >
                        Arts & Humanities
                      </option>
                      <option
                        value="Other"
                        className="bg-white text-slate-900 "
                      >
                        Other
                      </option>
                    </select>
                  </div>
                </div>
              )}
              {editProfileData.highSchoolExam && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Field of Interest
                  </label>
                  <select
                    value={editProfileData.fieldOfInterest}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        fieldOfInterest: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-white text-slate-900 ">
                      Select Field
                    </option>
                    <option
                      value="Engineering"
                      className="bg-white text-slate-900 "
                    >
                      Engineering
                    </option>
                    <option
                      value="IT & Computer Science"
                      className="bg-white text-slate-900 "
                    >
                      IT & Computer Science
                    </option>
                    <option
                      value="Healthcare & Medicine"
                      className="bg-white text-slate-900 "
                    >
                      Healthcare & Medicine
                    </option>
                    <option
                      value="Business & Finance"
                      className="bg-white text-slate-900 "
                    >
                      Business & Finance
                    </option>
                    <option
                      value="Arts & Humanities"
                      className="bg-white text-slate-900 "
                    >
                      Arts & Humanities
                    </option>
                    <option value="Other" className="bg-white text-slate-900 ">
                      Other
                    </option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Financial Readiness
                </label>
                <select
                  value={editProfileData.financialReadiness}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      financialReadiness: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/20 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-white text-slate-900 ">
                    Select Readiness
                  </option>
                  <option value="High" className="bg-white text-slate-900 ">
                    I have the €11,904 ready
                  </option>
                  <option value="Sponsor" className="bg-white text-slate-900 ">
                    I have a sponsor in Germany
                  </option>
                  <option value="Medium" className="bg-white text-slate-900 ">
                    I am currently saving up
                  </option>
                  <option value="Low" className="bg-white text-slate-900 ">
                    I need a scholarship
                  </option>
                </select>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-prussian-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-prussian-blue/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-prussian-blue/95 border-t border-white/10 text-white py-2 px-6 flex justify-around items-center z-40 shadow-2xl backdrop-blur-lg">
        <button
          onClick={() => setActiveTab("application")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors duration-200 ${
            activeTab === "application"
              ? "text-gold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User size={20} />
          <span>Application</span>
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors duration-200 ${
            activeTab === "resources"
              ? "text-gold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen size={20} />
          <span>Resources</span>
        </button>
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <Edit2 size={20} />
          <span>Edit Profile</span>
        </button>
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft size={20} />
          <span>Exit</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
