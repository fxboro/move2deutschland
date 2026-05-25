import { User } from 'firebase/auth';

/**
 * Checks if a Firebase user has administrative privileges.
 * First checks for the 'admin' Custom Claim, and falls back to checking 
 * the fallback admin email 'chimadayo43@gmail.com'.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin) {
      return true;
    }
  } catch (error) {
    console.error("Error fetching custom claims:", error);
  }
  return user.email === 'chimadayo43@gmail.com';
}

/**
 * Synchronous check for immediate UI rendering.
 */
export function checkIsAdminSync(user: User | null): boolean {
  if (!user) return false;
  return user.email === 'chimadayo43@gmail.com';
}
