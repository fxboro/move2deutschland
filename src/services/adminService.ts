import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { AdminRole } from "../utils/auth";

export interface UserItem {
  id: string;
  uid?: string;
  email: string;
  displayName?: string;
  status?: string;
  archived?: boolean;
  role?: AdminRole;
  createdAt?: any;
  profile?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    cgpa?: string | number;
    germanGrade?: string | number;
    fieldOfInterest?: string;
    institution?: string;
    isHighPriority?: boolean;
  };
  documents?: Record<
    string,
    {
      url?: string;
      status?: "verified" | "action_required" | "pending";
      feedback?: string;
      uploadedAt?: string;
    }
  >;
  activityLog?: Array<{
    action: string;
    timestamp: string;
    by?: string;
  }>;
}

export interface ApplicationItem {
  id: string;
  uid: string;
  fullName: string;
  email?: string;
  phone?: string;
  nigerianCgpa: number;
  germanGrade: number;
  transcriptUrl?: string;
  passportUrl?: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  assignedCounselor?: string;
  notes?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface ContactSubmissionItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  assignedTo?: string;
  adminNotes?: string;
  createdAt: any;
}

export interface TestimonialItem {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  university: string;
  programme: string;
  quote: string;
  photoUrl?: string;
  approved: boolean;
  createdAt: any;
}

export interface AuditLogItem {
  id: string;
  action: string;
  targetId?: string;
  details?: string;
  by: string;
  timestamp: any;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "application" | "inquiry" | "document" | "system";
  timestamp: string;
  read: boolean;
  linkTab: "candidates" | "applications" | "inquiries" | "testimonials" | "staff";
  targetId?: string;
}

/**
 * Subscribes to the candidates/users collection in real-time.
 */
export function subscribeToUsers(
  onUpdate: (users: UserItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, "users");
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserItem[];
      onUpdate(data);
    },
    (err) => {
      console.error("Users subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to the applications collection in real-time.
 */
export function subscribeToApplications(
  onUpdate: (apps: ApplicationItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, "applications");
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ApplicationItem[];
      onUpdate(data);
    },
    (err) => {
      console.error("Applications subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to the contact submissions (inquiries) collection in real-time.
 */
export function subscribeToContactSubmissions(
  onUpdate: (inquiries: ContactSubmissionItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, "contactSubmissions");
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ContactSubmissionItem[];
      onUpdate(data);
    },
    (err) => {
      console.error("Contact inquiries subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to the testimonials collection in real-time.
 */
export function subscribeToTestimonials(
  onUpdate: (testimonials: TestimonialItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, "testimonials");
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TestimonialItem[];
      onUpdate(data);
    },
    (err) => {
      console.error("Testimonials subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to recent audit logs.
 */
export function subscribeToAuditLogs(
  onUpdate: (logs: AuditLogItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AuditLogItem[];
      onUpdate(data);
    },
    (err) => {
      // In case indexing isn't set up yet, fall back without order
      const fallbackQuery = collection(db, "auditLogs");
      return onSnapshot(fallbackQuery, (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AuditLogItem[];
        onUpdate(data);
      });
    }
  );
}

/**
 * Live multi-collection notification listener using snapshot.docChanges().
 */
export function subscribeToAdminNotifications(
  onNotification: (notif: AdminNotification) => void
): () => void {
  let isInitialLoadApps = true;
  let isInitialLoadContact = true;

  // Watch for new applications
  const unsubsApps = onSnapshot(collection(db, "applications"), (snapshot) => {
    if (isInitialLoadApps) {
      isInitialLoadApps = false;
      return;
    }
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const app = change.doc.data() as ApplicationItem;
        onNotification({
          id: `notif-app-${change.doc.id}-${Date.now()}`,
          title: "New Application Received",
          message: `${app.fullName || "A candidate"} submitted a placement application.`,
          type: "application",
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: "applications",
          targetId: change.doc.id,
        });
      }
    });
  });

  // Watch for new contact inquiries
  const unsubsContact = onSnapshot(collection(db, "contactSubmissions"), (snapshot) => {
    if (isInitialLoadContact) {
      isInitialLoadContact = false;
      return;
    }
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const inquiry = change.doc.data() as ContactSubmissionItem;
        onNotification({
          id: `notif-inquiry-${change.doc.id}-${Date.now()}`,
          title: "New Contact Lead Received",
          message: `${inquiry.name || "A visitor"} submitted an inquiry: "${(inquiry.message || "").slice(0, 40)}..."`,
          type: "inquiry",
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: "inquiries",
          targetId: change.doc.id,
        });
      }
    });
  });

  return () => {
    unsubsApps();
    unsubsContact();
  };
}

/**
 * Updates application status in Firestore.
 */
export async function updateApplicationStatus(
  appId: string,
  newStatus: "pending" | "under_review" | "approved" | "rejected",
  notes?: string
): Promise<void> {
  const appRef = doc(db, "applications", appId);
  await updateDoc(appRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    ...(notes ? { notes } : {}),
  });
  await recordAuditLog(`Application status updated to ${newStatus}`, appId);
}

/**
 * Updates contact submission status and triage notes.
 */
export async function updateContactStatus(
  submissionId: string,
  status: "new" | "in_progress" | "resolved",
  adminNotes?: string
): Promise<void> {
  const subRef = doc(db, "contactSubmissions", submissionId);
  await updateDoc(subRef, {
    status,
    ...(adminNotes !== undefined ? { adminNotes } : {}),
    updatedAt: serverTimestamp(),
  });
  await recordAuditLog(`Inquiry marked as ${status}`, submissionId);
}

/**
 * Toggles approval status for student testimonials.
 */
export async function toggleTestimonialApproval(
  testimonialId: string,
  currentApproved: boolean
): Promise<void> {
  const docRef = doc(db, "testimonials", testimonialId);
  await updateDoc(docRef, {
    approved: !currentApproved,
    updatedAt: serverTimestamp(),
  });
  await recordAuditLog(
    `Testimonial ${!currentApproved ? "Approved" : "Unapproved"}`,
    testimonialId
  );
}

/**
 * Deletes a testimonial (Super Admin only).
 */
export async function deleteTestimonial(testimonialId: string): Promise<void> {
  await deleteDoc(doc(db, "testimonials", testimonialId));
  await recordAuditLog("Deleted testimonial", testimonialId);
}

/**
 * Creates a new testimonial.
 */
export async function createTestimonial(
  item: Omit<TestimonialItem, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "testimonials"), {
    ...item,
    createdAt: serverTimestamp(),
  });
  await recordAuditLog(`Created testimonial for ${item.name}`, docRef.id);
  return docRef.id;
}

/**
 * Appends an entry to the audit log collection.
 */
export async function recordAuditLog(action: string, targetId?: string, details?: string): Promise<void> {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, "auditLogs"), {
      action,
      targetId: targetId || null,
      details: details || null,
      by: user?.email || "Admin",
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Audit log creation bypassed:", err);
  }
}
