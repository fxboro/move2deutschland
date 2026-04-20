# Technical Architecture Document: move2deutschland

**Role:** Senior Full-Stack Developer & UI/UX Designer
**Project:** move2deutschland - Premium Student Placement Portal
**Tech Stack:** Flutter Web (Frontend) / React (Current Prototype) & Firebase (Backend/Storage)

---

## 1. Firebase Firestore Schema

To ensure a scalable and secure backend, we will use a NoSQL document-oriented structure in Firestore. The data is normalized to prevent massive document sizes and ensure efficient querying.

### Collection: `users`
Stores core identity and profile information for each student.
*   **Document ID:** Firebase Auth `uid`
*   **Fields:**
    *   `uid` (String): Unique identifier from Firebase Auth.
    *   `email` (String): User's email address.
    *   `displayName` (String): Full name.
    *   `phoneNumber` (String): Contact number (crucial for WhatsApp integration).
    *   `role` (String): "student" (default) or "admin".
    *   `onboardingCompleted` (Boolean): Tracks if the user has finished the initial setup.
    *   `createdAt` (Timestamp): Account creation date.
    *   `lastLogin` (Timestamp): Last active session.

### Collection: `applications`
Stores the multi-step application data. Separated from the `users` collection so users can theoretically have multiple applications (e.g., different intakes) and to keep the user document lightweight.
*   **Document ID:** Auto-generated ID
*   **Fields:**
    *   `userId` (String): Reference to the `users` document ID.
    *   `status` (String): "draft", "submitted", "under_review", "action_required", "accepted", "rejected".
    *   `academicBackground` (Map):
        *   `highestDegree` (String)
        *   `gpa` (Number)
        *   `institution` (String)
    *   `programPreferences` (Array of Maps): Desired courses and universities.
    *   `documents` (Map): Links to Firebase Storage objects.
        *   `passportUrl` (String)
        *   `transcriptUrl` (String)
        *   `languageCertificateUrl` (String)
    *   `createdAt` (Timestamp)
    *   `updatedAt` (Timestamp)

---

## 2. Authentication Flow (Email & Google Sign-In)

We will utilize **Firebase Authentication** to handle secure sign-ups and logins.

**The Flow:**
1.  **Entry Point:** User clicks "Apply Now" or "Check Eligibility" on the landing page.
2.  **Auth Modal/Page:** User is presented with "Continue with Google" (Primary) and "Sign up with Email" (Secondary).
    *   *Google Sign-In:* Uses OAuth 2.0. Best for conversion rates as it requires one click.
    *   *Email/Password:* Requires email verification to ensure high-quality leads.
3.  **Backend Handshake:** Upon successful Firebase Auth, a Cloud Function (or client-side logic) checks if a document exists in the `users` collection for that `uid`.
4.  **Provisioning:** If no document exists, a new `users` document is created with default values (`role: "student"`, `onboardingCompleted: false`).
5.  **Routing:** 
    *   If `onboardingCompleted` is false -> Redirect to Lead Qualification Questionnaire.
    *   If `onboardingCompleted` is true -> Redirect to Student Dashboard.

---

## 3. Brand Guide Integration Plan

**Core Colors:**
*   **Primary:** Prussian Blue (`#003153`) - Conveys trust, security, and "German Engineering" stability.
*   **Accent/Action:** Vibrant Gold (`#FFCC00`) - Conveys opportunity, premium service, and draws the eye for high-conversion CTAs.
*   **Neutrals:** Slate/Off-whites (`#f8fafc`, `#f1f5f9`) for backgrounds to keep the interface clean and readable.

**Typography:**
*   **Headings:** *Playfair Display* (Serif) - Adds editorial luxury and prestige.
*   **Body:** *Satoshi* (Sans-serif) - Clean, highly legible, modern.

**Implementation Strategy:**
*   **Flutter Web:** Create a centralized `AppTheme` class defining the `ThemeData`. Map Prussian Blue to `colorScheme.primary` and Vibrant Gold to `colorScheme.secondary`. Define `textTheme` using Google Fonts packages for Playfair Display and Satoshi.
*   **React/Tailwind (Current Prototype):** Variables are mapped in `index.css` (`--color-prussian-blue`, `--color-gold`) and configured in the Tailwind theme to ensure utility classes like `bg-prussian-blue` and `text-gold` are globally available.

---

## 4. State Management Strategy (Multi-Step Forms)

The Lead Qualification Questionnaire and the main Application are multi-step forms. If a user refreshes the page or navigates away, losing data will severely impact conversion rates.

**Strategy:**
1.  **Global State Container:**
    *   *Flutter:* Use **Riverpod** or **Provider** to hold the `ApplicationState` object in memory. This allows different form pages/widgets to read and update the same data object without passing props down deeply.
    *   *React:* Use **Zustand** or **React Context + useReducer** for a lightweight, globally accessible store.
2.  **Local Persistence (Drafting):**
    *   As the user completes each step, serialize the current state to JSON and save it to the browser's `localStorage` (or `shared_preferences` in Flutter).
    *   On app initialization, check local storage. If a draft exists, hydrate the state manager and prompt the user to "Resume Application".
3.  **Incremental Backend Syncing (Optional but recommended):**
    *   For the main application (post-signup), sync the draft to the Firestore `applications` collection (with `status: "draft"`) every time a step is completed. This ensures data is safe even if the user switches devices.
4.  **Validation:**
    *   Each step validates its own local state before allowing the user to proceed to the next step, ensuring the global state only contains valid data.
