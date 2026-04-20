import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const ADMIN_EMAIL = 'chimadayo43@gmail.com'; // Admin email

/**
 * Task 1 & 2: User Welcome Email & Admin Notification
 * Triggered when a new user signs up via Firebase Auth.
 */
export const onUserSignup = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || 'Future Student';

  if (!email) {
    console.log('User created without email, skipping welcome email.');
    return;
  }

  const batch = db.batch();

  // 1. User Welcome Email Document (Triggers 'Trigger Email' extension)
  const welcomeMailRef = db.collection('mail').doc();
  batch.set(welcomeMailRef, {
    to: email,
    message: {
      subject: `Welcome to the Move2Deutschland Family, ${displayName}!`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #003153; padding: 30px 20px; text-align: center;">
            <h1 style="color: #FFD700; margin: 0; font-size: 28px; letter-spacing: -0.5px;">move<span style="color: #ffffff;">2</span>deutschland</h1>
          </div>
          <div style="padding: 30px 20px; background-color: #ffffff;">
            <p style="font-size: 16px; line-height: 1.6;">Hi ${displayName},</p>
            <p style="font-size: 16px; line-height: 1.6;">Success! You've taken the first step toward a tuition-free future in Germany.</p>
            <p style="font-size: 16px; line-height: 1.6;">Complete your verification to begin your Grade Conversion and Document Evaluation.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://move2deutschland.com/dashboard" style="display: inline-block; background-color: #FFD700; color: #003153; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">Verify & Access Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0;"><strong>Move2Deutschland</strong><br>123 Education Way, Berlin, Germany 10115</p>
            <p style="margin: 0;">
              <a href="https://move2deutschland.com/privacy" style="color: #003153; text-decoration: underline;">Privacy Policy</a> | 
              <a href="https://move2deutschland.com/preferences" style="color: #003153; text-decoration: underline;">Manage Preferences</a>
            </p>
          </div>
        </div>
      `
    }
  });

  // 2. Admin Notification Document
  const adminMailRef = db.collection('mail').doc();
  batch.set(adminMailRef, {
    to: ADMIN_EMAIL,
    message: {
      subject: `🚨 New Lead: ${displayName} from Nigeria`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #003153;">New Candidate Registration</h2>
          <p><strong>Name:</strong> ${displayName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>A new candidate has registered. Check the Admin Panel to review their initial eligibility score and documents.</p>
          <a href="https://move2deutschland.com/admin" style="display: inline-block; background-color: #003153; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 10px;">View Admin Panel</a>
        </div>
      `
    }
  });

  await batch.commit();
  console.log(`Welcome email and admin notification queued for ${email}`);
});

/**
 * Task 3: Prevent "Dashboard Ghosting" (Nudge Email)
 * Runs every day to find users who signed up > 24 hours ago but haven't verified.
 */
export const sendVerificationNudge = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  // Assuming a 'users' collection where documents are created on signup.
  const unverifiedUsersSnapshot = await db.collection('users')
    .where('createdAt', '<=', yesterday)
    .where('emailVerified', '==', false)
    .where('nudgeSent', '==', false)
    .get();

  if (unverifiedUsersSnapshot.empty) {
    console.log('No users to nudge today.');
    return null;
  }

  const batch = db.batch();

  unverifiedUsersSnapshot.docs.forEach(doc => {
    const userData = doc.data();
    if (!userData.email) return;

    const mailRef = db.collection('mail').doc();
    batch.set(mailRef, {
      to: userData.email,
      message: {
        subject: "Your German education is waiting 🇩🇪",
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #003153; padding: 30px 20px; text-align: center;">
              <h1 style="color: #FFD700; margin: 0; font-size: 28px; letter-spacing: -0.5px;">move<span style="color: #ffffff;">2</span>deutschland</h1>
            </div>
            <div style="padding: 30px 20px; background-color: #ffffff;">
              <p style="font-size: 16px; line-height: 1.6;">Hi ${userData.profile?.name || 'Future Student'},</p>
              <p style="font-size: 16px; line-height: 1.6;">Your German education is waiting. We noticed you haven't verified your email yet.</p>
              <p style="font-size: 16px; line-height: 1.6;">Click below to verify your account and unlock your <strong>18-month jobseeker strategy guide</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://move2deutschland.com/auth" style="display: inline-block; background-color: #FFD700; color: #003153; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">Verify My Email</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0;"><strong>Move2Deutschland</strong><br>123 Education Way, Berlin, Germany 10115</p>
              <p style="margin: 0;">
                <a href="https://move2deutschland.com/privacy" style="color: #003153; text-decoration: underline;">Privacy Policy</a> | 
                <a href="https://move2deutschland.com/preferences" style="color: #003153; text-decoration: underline;">Manage Preferences</a>
              </p>
            </div>
          </div>
        `
      }
    });

    // Mark that we sent the nudge so we don't spam them every day
    batch.update(doc.ref, { nudgeSent: true });
  });

  await batch.commit();
  console.log(`Sent nudge emails to ${unverifiedUsersSnapshot.size} users.`);
  return null;
});
