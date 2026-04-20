# Move2Deutschland Email Notifications

This directory contains the Firebase Cloud Functions required to automate email notifications for the Move2Deutschland platform.

## Prerequisites

1. **Firebase Blaze Plan**: Cloud Functions require the pay-as-you-go Blaze plan.
2. **Trigger Email Extension**: You must install the "Trigger Email" extension from the Firebase Extensions Hub.
   - **Collection path**: Set this to `mail` (this is what our functions write to).
   - **SMTP Connection URI**: Configure this with your SendGrid, Mailgun, or Mailjet credentials (e.g., `smtps://username:password@smtp.sendgrid.net:465`).

## Deployment

To deploy these functions to your Firebase project:

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Best Practice Implementation Guide

### 1. The "Magic Link" Experience (Firebase Dynamic Links)
To ensure users on mobile devices are seamlessly redirected back to your app after clicking "Verify Email" in their Gmail app:
1. Go to the Firebase Console -> Authentication -> Settings.
2. Under "Email enumeration protection", ensure your settings allow for email link authentication if you are using passwordless login.
3. Set up **Firebase Dynamic Links** (or Firebase Hosting custom domains for the new App Links standard) and configure your Action Code Settings in your frontend code to use this domain. This ensures the link opens the app directly rather than a browser window.

### 2. Email Deliverability (Avoiding Spam)
To ensure your emails land in the Inbox and not the Spam folder, you **must** authenticate your domain with your SMTP provider (SendGrid, Mailgun, etc.):
1. **SPF (Sender Policy Framework)**: Add a TXT record to your DNS settings (e.g., `v=spf1 include:sendgrid.net ~all`). This tells email providers that SendGrid is allowed to send emails on behalf of `move2deutschland.com`.
2. **DKIM (DomainKeys Identified Mail)**: Add the CNAME records provided by your SMTP provider to your DNS. This digitally signs your emails.
3. **DMARC**: Add a `_dmarc` TXT record (e.g., `v=DMARC1; p=none;`) to monitor delivery reports.

### 3. Prevent "Dashboard Ghosting"
The `sendVerificationNudge` function runs every 24 hours. It looks for users in your `users` collection who:
- Signed up more than 24 hours ago (`createdAt`).
- Have not verified their email (`emailVerified == false`).
- Have not already received a nudge (`nudgeSent == false`).

*Note: Ensure your frontend code writes `createdAt: admin.firestore.FieldValue.serverTimestamp()` and `emailVerified: false` to the user's document upon registration.*

### 4. Professional Footer
All email templates in `src/index.ts` include a professional footer with:
- The physical/virtual office address.
- A link to the Privacy Policy.
- A link to Manage Preferences/Unsubscribe (Crucial for GDPR compliance).
