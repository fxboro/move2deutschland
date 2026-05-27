# Move2Deutschland - Backend & Security Task List

This document lists the required backend, database, and security tasks to support the features in the Week One UI/UX Feature Request.

---

## 1. Database & Schema Configuration

### Task 1.1: Firebase Firestore Schema Update
- **Description:** Define schema structures for the newly introduced collections: `contactSubmissions`, `testimonials`, and update the `applications` structure to reflect the actual implementation requirements.
- **Why:** Ensures strict data structure validation, prevents document bloat, and aligns with the React frontend form submissions.
- **Collection schemas:**
  - `/applications/{userId}`: Stores candidate applications, keyed by UID. Fields include: `uid`, `fullName`, `nigerianCgpa`, `germanGrade`, `transcriptUrl`, `passportUrl`, `status` ("pending", "under_review", "approved", "rejected"), and `createdAt`.
  - `/contactSubmissions/{submissionId}`: Stores user messages from the Contact Us page. Fields include: `name`, `email`, `phone`, `message`, and `createdAt`.
  - `/testimonials/{testimonialId}`: Stores student success stories. Fields include: `name`, `fromLocation` (e.g. Lagos), `toLocation` (e.g. Berlin), `university`, `programme`, `quote`, `photoUrl`, `approved` (boolean), and `createdAt`.
- **Acceptance Criteria:** `firebase-blueprint.json` defines all properties, required fields, and types for these collections.

---

## 2. Security Hardening

### Task 2.1: Hardening Firestore Security Rules (`firestore.rules`)
- **Description:** Update security rules to implement Role-based Access Control (RBAC) and protect user-uploaded data.
- **Why:**
  - Deprecates insecure email checks (`email == "chimadayo43@gmail.com"`) by verifying Auth Custom Claims (`request.auth.token.admin == true`).
  - Restricts application access: Students can only read/write their own document, and must have verified email (`request.auth.token.email_verified == true`).
  - Restricts contact submissions: Public can write-only (create); only admins can read/update/delete.
  - Restricts testimonials: Public can read only if `approved == true`; only admins can write.
- **Acceptance Criteria:** Updated `firestore.rules` passes unit tests and denies unauthenticated access or access to other users' data.

### Task 2.2: Enforce Secure Cloud Storage Rules (`storage.rules`)
- **Description:** Establish storage rules for applicant document uploads (transcripts, passports).
- **Why:** Prevents unauthorized document access and stops malicious uploads.
- **Rules:**
  - Limit read/write access to files under `/users/{userId}/documents/` to the owner (`{userId}`) and admins.
  - Enforce max file size of 10MB (`request.resource.size < 10 * 1024 * 1024`).
  - Restrict Content-Type to `application/pdf`, `image/png`, `image/jpeg`, and `image/webp`.
- **Acceptance Criteria:** `storage.rules` is defined and correctly restricts access, sizes, and file types.

---

## 3. Cloud Functions & Notifications

### Task 3.1: Whitelist-based Admin Claims Trigger (`onUserSignup`)
- **Description:** Set user claims (`admin: true`) on signup if the registering user matches a predefined email whitelist.
- **Why:** Dynamically assigns the admin role without storing sensitive flags in a modifiable Firestore user record.
- **Acceptance Criteria:** Signing up with `chimadayo43@gmail.com` automatically grants the admin claim, verified in custom claims decodes.

### Task 3.2: Status Change Trigger Notification (`onApplicationStatusChange`)
- **Description:** Trigger an email/WhatsApp alert when an application's `status` changes.
- **Why:** Minimizes application drop-off by prompting applicants to take action as soon as there is an status change.
- **Acceptance Criteria:** Updating `/applications/{userId}` status writes a document to the `/mail` collection (which sends a welcome/status update email via the Firebase Trigger Email extension) and prompts a WhatsApp log/API dispatch.

### Task 3.3: Contact Submission Admin Alert (`onContactSubmissionCreated`)
- **Description:** Trigger an admin email notification when a new contact query is created.
- **Why:** Guarantees responsiveness and avoids ignored leads.
- **Acceptance Criteria:** Submitting a contact message creates a document in `/mail` addressing the admin email with the contact details.

---

## 4. API Security

### Task 4.1: Express Server API Rate Limiting & Input Validation
- **Description:** Add rate limits and input sanitization to the Express dev/prod backend server.
- **Why:** Blocks denial of service and prevents SMS/WhatsApp endpoint exploitation/spamming.
- **Acceptance Criteria:** `/api/notify` rejects spam requests (HTTP 429) and enforces phone number formatting checks.
