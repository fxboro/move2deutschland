import { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Checks if a Firebase user has administrative privileges.
 * First checks for the 'admin' Custom Claim, and falls back to checking
 * the fallback admin email 'chimadayo43@gmail.com'.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims.admin) {
      return true;
    }
  } catch (error) {
    console.error("Error fetching custom claims:", error);
  }
  const adminEmails = ["chimadayo43@gmail.com", "admin@move2deutschland.com"];
  return !!user.email && adminEmails.includes(user.email.toLowerCase());
}

/**
 * Synchronous check for immediate UI rendering.
 */
export function checkIsAdminSync(user: User | null): boolean {
  if (!user) return false;
  return user.email === "chimadayo43@gmail.com";
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

