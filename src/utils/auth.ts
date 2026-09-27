import { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export type AdminRole = "super_admin" | "counselor" | "document_verifier" | "user";

export type AdminAction =
  | "manage_roles"
  | "delete_user"
  | "export_csv"
  | "update_status"
  | "verify_document"
  | "reply_inquiry"
  | "manage_testimonials"
  | "view_analytics";

const ADMIN_EMAILS = ["chimadayo43@gmail.com", "admin@move2deutschland.com"];

/**
 * Checks if a Firebase user has administrative privileges.
 * Checks for the 'admin' Custom Claim or designated admin emails.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims.admin || tokenResult.claims.role) {
      return true;
    }
  } catch (error) {
    console.error("Error fetching custom claims:", error);
  }
  return !!user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Synchronous check for immediate UI rendering.
 */
export function checkIsAdminSync(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Retrieves the specific administrative role for the user.
 */
export async function getUserRole(user: User | null): Promise<AdminRole> {
  if (!user) return "user";
  try {
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims.role) {
      return tokenResult.claims.role as AdminRole;
    }
    if (tokenResult.claims.admin) {
      return "super_admin";
    }
  } catch (error) {
    console.error("Error fetching user role claim:", error);
  }

  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return "super_admin";
  }

  return "user";
}

/**
 * Synchronous fallback to get user role.
 */
export function getUserRoleSync(user: User | null): AdminRole {
  if (!user || !user.email) return "user";
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return "super_admin";
  }
  return "user";
}

/**
 * Evaluates whether a given administrative role has permission for a specific action.
 */
export function hasPermission(role: AdminRole, action: AdminAction): boolean {
  if (role === "super_admin") return true;

  switch (action) {
    case "manage_roles":
    case "delete_user":
      return false; // Only super_admin

    case "export_csv":
    case "update_status":
    case "reply_inquiry":
    case "manage_testimonials":
    case "view_analytics":
      return role === "counselor";

    case "verify_document":
      return role === "counselor" || role === "document_verifier";

    default:
      return false;
  }
}

/**
 * Ensures a user document exists in Firestore immediately upon sign-up.
 */
export async function ensureUserDocumentExists(user: User | null): Promise<void> {
  if (!user) return;
  try {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "Candidate",
          status: "pending",
          archived: false,
          createdAt: new Date().toISOString(),
          profile: {
            name: user.displayName || "Candidate",
            email: user.email || "",
          },
          documents: {},
          activityLog: [
            {
              action: "Account Created",
              timestamp: new Date().toISOString(),
              by: "User",
            },
          ],
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("Error ensuring user document exists:", err);
  }
}
