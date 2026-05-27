import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as http from 'http';
import * as https from 'https';

admin.initializeApp();

const db = admin.firestore();
const ADMIN_EMAIL = 'chimadayo43@gmail.com'; // Admin email

// Helper function to send HTTP POST requests for WhatsApp notifications
function postRequest(urlStr: string, body: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const data = JSON.stringify(body);
      const client = url.protocol === 'https:' ? https : http;
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const req = client.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      });

      req.on('error', (err) => reject(err));
      req.write(data);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Task 1 & 2: User Welcome Email, Admin Notification & Admin Custom Claims
 * Triggered when a new user signs up via Firebase Auth.
 */
export const onUserSignup = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || 'Future Student';

  if (!email) {
    console.log('User created without email, skipping welcome email.');
    return;
  }

  // Assign Admin claim if signing up with the designated admin email
  const ADMIN_EMAILS = [ADMIN_EMAIL];
  if (ADMIN_EMAILS.includes(email)) {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`Successfully assigned admin custom claim to: ${email}`);
    } catch (error) {
      console.error(`Error setting admin custom claim for ${email}:`, error);
    }
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

    batch.update(doc.ref, { nudgeSent: true });
  });

  await batch.commit();
  console.log(`Sent nudge emails to ${unverifiedUsersSnapshot.size} users.`);
  return null;
});

/**
 * Task 4: Application Status Change Notification
 * Triggered when a student's application status is updated.
 */
export const onApplicationStatusChange = functions.firestore
  .document('applications/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only proceed if status field exists and has changed
    if (!before || !after || before.status === after.status) {
      return null;
    }

    const userId = context.params.userId;
    const newStatus = after.status;

    // Fetch user details from Firestore users collection
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    let email = userData?.email;
    let displayName = userData?.displayName || 'Future Student';
    const phoneNumber = userData?.phoneNumber;

    // Fallback to Auth service if not found in Firestore doc
    if (!email) {
      try {
        const userRecord = await admin.auth().getUser(userId);
        email = userRecord.email;
        displayName = userRecord.displayName || displayName;
      } catch (err) {
        console.error(`Failed to fetch user auth record for ${userId}:`, err);
      }
    }

    if (!email) {
      console.log(`No email found for user ${userId}, skipping notification.`);
      return null;
    }

    // Determine subject and message based on the status change
    let statusSubject = 'Application Status Updated';
    let statusMessage = `Your application status has been updated to: ${newStatus}.`;

    switch (newStatus) {
      case 'pending':
        statusSubject = 'Application Submitted 📝';
        statusMessage = 'Your application has been successfully submitted and is pending verification. We will check it shortly.';
        break;
      case 'under_review':
        statusSubject = 'Application Under Review 🔍';
        statusMessage = 'Your application is now under review by our admissions and placement team. We will notify you once evaluation is complete.';
        break;
      case 'action_required':
        statusSubject = 'Action Required on your Application ⚠️';
        statusMessage = 'Your application requires attention. We need you to re-upload or update documents. Please check your dashboard.';
        break;
      case 'approved':
        statusSubject = 'Congratulations! Application Approved 🎉';
        statusMessage = 'Great news! Your eligibility has been approved for tuition-free German university placement. Please check your dashboard for the next steps.';
        break;
      case 'rejected':
        statusSubject = 'Application Status Update';
        statusMessage = 'We regret to inform you that your application could not be approved at this time. Log in to your dashboard to view evaluator feedback.';
        break;
    }

    const batch = db.batch();

    // 1. Queue Email
    const mailRef = db.collection('mail').doc();
    batch.set(mailRef, {
      to: email,
      message: {
        subject: statusSubject,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #003153; padding: 30px 20px; text-align: center;">
              <h1 style="color: #FFD700; margin: 0; font-size: 28px; letter-spacing: -0.5px;">move<span style="color: #ffffff;">2</span>deutschland</h1>
            </div>
            <div style="padding: 30px 20px; background-color: #ffffff;">
              <p style="font-size: 16px; line-height: 1.6;">Hi ${displayName},</p>
              <p style="font-size: 16px; line-height: 1.6;">${statusMessage}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://move2deutschland.com/dashboard" style="display: inline-block; background-color: #FFD700; color: #003153; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">Access Dashboard</a>
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

    await batch.commit();
    console.log(`Notification email for status: ${newStatus} queued to: ${email}`);

    // 2. Queue WhatsApp Notification
    if (phoneNumber) {
      try {
        const notifyUrl = process.env.NOTIFY_API_URL || 'http://localhost:3000/api/notify';
        await postRequest(notifyUrl, {
          to: phoneNumber,
          message: `Hi ${displayName}, your Move2Deutschland application status has been updated to: ${newStatus}. Log in to check details: https://move2deutschland.com/dashboard`
        });
        console.log(`Successfully dispatched WhatsApp notification for ${userId} to ${phoneNumber}`);
      } catch (err: any) {
        console.error(`Failed to dispatch WhatsApp notification for ${userId}:`, err.message);
      }
    }

    return null;
  });

/**
 * Task 5: Contact Submission Admin Notification
 * Triggered when a visitor submits a contact form message.
 */
export const onContactSubmissionCreated = functions.firestore
  .document('contactSubmissions/{submissionId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    if (!data) return null;

    const { name, email, phone, message } = data;

    const mailRef = db.collection('mail').doc();
    await mailRef.set({
      to: ADMIN_EMAIL,
      message: {
        subject: `📞 New Contact Query from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #003153; padding: 20px; text-align: center;">
              <h2 style="color: #FFD700; margin: 0;">New Contact Form Submission</h2>
            </div>
            <div style="padding: 20px; background-color: #ffffff;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="border-left: 4px solid #003153; padding-left: 15px; margin: 15px 0; color: #555; font-style: italic;">
                ${message}
              </blockquote>
            </div>
          </div>
        `
      }
    });

    console.log(`Admin alert email queued for contact submission from ${email}`);
    return null;
  });

