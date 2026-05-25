# Week One — UI/UX Feature Request

**Project:** Move2Deutschland — Student & Talent Placement Portal  
**Role:** Senior Frontend Engineer  
**Date:** 2026-05-25  
**Status:** Approved for implementation

---

## 1. Overview

This document captures the full UI/UX audit of the Move2Deutschland web portal and defines a prioritised, 8-phase implementation plan for the first development sprint. The portal targets African and Nigerian candidates seeking university placement and skilled-worker visas in Germany.

### Current State

| Area | Files | Status |
|------|-------|--------|
| Landing Page | `src/pages/Landing.tsx` (active), `src/pages/LandingPage.tsx` (dead draft) | Functional, needs conversion optimisation |
| Auth | `src/pages/Auth.tsx`, `src/pages/AuthPage.tsx` (dead draft) | Functional, needs polish |
| Dashboard | `src/pages/Dashboard.tsx`, `src/pages/DashboardPage.tsx` (dead draft) | Functional, needs responsive fixes |
| Admin | `src/pages/Admin.tsx` | Functional, minor polish |
| Opportunity Card | `src/pages/OpportunityCard.tsx` | Functional, needs real images |
| Lead Questionnaire | `src/components/LeadQuestionnaire.tsx` | Functional, working well |
| FAQ | `src/components/FAQ.tsx` | Functional, working well |
| Shared Components | None | ❌ No reusable Navbar, Footer, or Logo component |

### Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React
- **Routing:** React Router DOM v7
- **Backend:** Firebase (Auth, Firestore, Storage) + Express server
- **Fonts:** Outfit (currently loaded), Playfair Display + Satoshi (loaded but unused)

---

## 2. Audit Findings

### 2.1 Missing Pages (Critical for Conversion)

| Page | Why It's Needed |
|------|-----------------|
| **About Us** | Nigerian candidates research the team behind a service before committing. Without this, visitors lack the trust signal needed to submit personal documents and financial information. #2 most-visited page on any service website. |
| **Success Stories / Testimonials** | Social proof is the single most powerful conversion lever for this demographic. Seeing real Nigerians who relocated removes "is this legitimate?" doubt. Testimonials increase conversion by ~34%. |
| **Programs / Services** | No page explains what the service delivers step-by-step. Visitors take the quiz and sign up but never learn what they get. Causes drop-off between sign-up and document submission. |
| **Contact** | No dedicated contact page. WhatsApp widget alone is insufficient. Some users want email, a form, or to know if there's a physical office. Also helps SEO. |
| **Terms of Service** | Referenced in the auth page signup checkbox but links to `href="#"`. Legal liability and trust issue. |
| **Privacy Policy** | Same as above. Required for GDPR compliance if handling EU-bound user data. |

### 2.2 Missing Conversion Features

| Feature | Impact |
|---------|--------|
| **Social proof counter strip** ("500+ Students Placed", "40+ Universities") | Immediately answers "is this credible?" before the user scrolls. Standard on every high-converting education placement site. |
| **Testimonial carousel** on landing page | Reinforces trust at peak engagement. Increases form completion by 15-25%. |
| **"Resume Application" banner** for returning users | LocalStorage draft system exists in `LeadQuestionnaire.tsx` but there's no visual prompt. Directly recovers abandoned leads. |
| **Dynamic dashboard checklist** | Current progress tracker is hardcoded. A reactive checklist tied to Firestore data guides users to complete their application. |
| **Email notifications** alongside WhatsApp | WhatsApp delivery depends on Twilio sandbox. Email is a reliable backup with a paper trail. |

### 2.3 Responsive Design Issues

#### Navigation Bar
- Mobile menu only shows Login/Apply Now — no section anchor links
- Nav is always transparent (`bg-white/10`), text unreadable over white content sections on scroll
- Logo brand name shows inconsistent markup across pages
- User dropdown z-index conflicts with mobile menu on some Android browsers

#### Hero Section (Mobile)
- Title `text-3xl` too small for hero on small phones (375px)
- CTA "Check My Eligibility – 2 Minute Quiz" wraps on small screens
- `pb-40` pushes content too far down on mobile

#### Dashboard
- Sidebar collapses to full-width horizontal bar on mobile — takes too much vertical space
- Grid `lg:grid-cols-3` means tablet (768-1023px) is single column
- Submit button hidden on desktop (`hidden md:flex`), mobile version is easy to miss
- Edit Profile modal not scrollable on short screens

#### Comparison Table
- Three-column table cramped on `< 375px` screens, text truncates

#### Footer
- Minimal (logo + one paragraph + copyright). No links, no social media, no secondary navigation
- Different footers across Landing, OpportunityCard pages

### 2.4 Aesthetics Issues

| Area | Current Problem | Fix |
|------|----------------|-----|
| **Typography** | Only Outfit loaded; ARCHITECTURE.md specifies Playfair Display + Satoshi. Headings and body visually identical. | Implement dual-font system: serif headings (prestige), sans-serif body (readability). |
| **Colour depth** | Only 2 brand colours used. Backgrounds are flat `slate-50`. | Add gradient backgrounds, coloured section dividers, tinted glass cards. |
| **Shadows** | Mix of `shadow-lg`, `shadow-2xl`, and custom shadows. Inconsistent depth. | Define 3 standardised shadow levels in design system. |
| **Border radius** | `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` used interchangeably. | Standardise: `rounded-xl` cards, `rounded-full` buttons, `rounded-2xl` modals. |
| **Dark mode** | Partially implemented on Landing and Dashboard but not Auth, FAQ, OpportunityCard, or Admin. | Either fully implement everywhere or remove all `dark:` classes. |
| **Hero image** | External Unsplash hotlink — can break and slows FCP. | Serve locally optimised WebP or use generated ambient gradient. |

### 2.5 Code Quality Issues

| Issue | Location | Fix |
|-------|----------|-----|
| Hardcoded admin email | `Landing.tsx:L137`, `Dashboard.tsx:L69`, `firestore.rules:L14`, `functions/src/index.ts:L7` | Move to Firebase Auth Custom Claims |
| Duplicate/dead page files | `LandingPage.tsx`, `DashboardPage.tsx`, `AuthPage.tsx` | Delete after confirming no imports |
| WhatsApp widget dead link | `Landing.tsx:L538` — `href="#"` | Replace with actual WhatsApp Business URL |
| Broken legal links | `Auth.tsx:L212` — Terms/Privacy `href="#"` | Create pages, update links |
| Content typos | `Landing.tsx:L401-402` — "partway", "priviledge", "carry" | Fix spelling |

---

## 3. Implementation Plan — 8 Phases

### Phase 1 — Foundation (Design System & Shared Components)

> Everything else builds on top of this. Do first.

- [ ] **1.1 — Resolve typography**: Decide Playfair Display + Satoshi (per ARCHITECTURE.md) vs. Outfit-only. Update `index.css` with the chosen dual-font system (serif headings, sans-serif body). Remove unused font `<link>` tags from `index.html` if not needed.
- [ ] **1.2 — Expand design tokens in `index.css`**: Add standardised shadow levels (`--shadow-sm`, `--shadow-md`, `--shadow-lg`), border-radius tokens, gradient presets, and extended colour palette (success green, warning amber, error red, info blue).
- [ ] **1.3 — Extract `<Logo />` component**: Replace the 6+ inline brand name renders with a reusable `src/components/Logo.tsx` accepting `size` and `variant` (light/dark) props.
- [ ] **1.4 — Extract `<Navbar />` component**: Unified navigation bar with scroll-aware background (transparent at top → solid on scroll), section anchor links for mobile menu, consistent auth state dropdown. Replace nav code in `Landing.tsx`, `LandingPage.tsx`, `OpportunityCard.tsx`.
- [ ] **1.5 — Extract `<Footer />` component**: Multi-column footer with nav links (About, Programs, FAQ, Contact), social media icons, legal links (Terms, Privacy), WhatsApp CTA, and newsletter signup placeholder. Replace 3 different footer implementations.
- [ ] **1.6 — Delete dead files**: Remove `LandingPage.tsx`, `DashboardPage.tsx`, `AuthPage.tsx` (unused earlier drafts) after confirming no imports reference them.

---

### Phase 2 — Landing Page Conversion Optimisation

> Highest-traffic page. Every 1% improvement here has outsized impact.

- [ ] **2.1 — Nav scroll behaviour**: Add `useEffect` scroll listener — when `scrollY > 80`, apply `bg-prussian-blue/95 shadow-lg` instead of `bg-white/10`. Smooth transition.
- [ ] **2.2 — Hero responsive fixes**: Increase mobile title to `text-4xl`, reduce bottom padding to `pb-24 sm:pb-40`, shorten CTA text on small screens ("Check Eligibility" instead of "Check My Eligibility – 2 Minute Quiz").
- [ ] **2.3 — Social proof counter strip**: New section between Hero and Lead Questionnaire. Four animated counters ("500+ Students", "40+ Universities", "98% Visa Rate", "★ 4.9 Rating") with `IntersectionObserver`-triggered count-up animation.
- [ ] **2.4 — "Resume Application" banner**: Check `localStorage` for draft on mount. If exists, render a sticky/dismissible banner above the hero: "Welcome back! You have an unfinished eligibility check. [Continue →]".
- [ ] **2.5 — Testimonial carousel section**: New section between "Why Move2Deutschland?" and FAQ. Horizontally scrolling cards (photo, name, university, quote) with auto-play and manual nav dots. Use hardcoded data initially (backend `testimonials` collection comes later).
- [ ] **2.6 — University/Partner logo marquee**: Auto-scrolling horizontal strip of German university logos below the social proof section. CSS `@keyframes` infinite scroll.
- [ ] **2.7 — Gradient section dividers**: Replace flat `bg-slate-50` / `bg-white` colour jumps with smooth `bg-gradient-to-b` transitions between sections.
- [ ] **2.8 — Feature card micro-interactions**: Add icon bounce on hover, subtle border glow (`box-shadow` transition), and staggered entrance animations to the "Why Germany" and "Why Move2Deutschland" cards.
- [ ] **2.9 — Hero background**: Replace Unsplash hotlink with a locally served, optimised WebP image (or generate one). Add slow Ken Burns / parallax effect.
- [ ] **2.10 — Fix WhatsApp widget `href`**: Replace `href="#"` with the actual WhatsApp Business link (`https://wa.me/XXXXXXXXXXX?text=...`).
- [ ] **2.11 — Comparison table mobile layout**: On screens `< 640px`, switch from 3-column table to stacked cards (one card per feature row, Germany vs UK/USA side by side vertically).
- [ ] **2.12 — Fix typos in content**: "partway" → "pathway", "priviledge" → "privilege", "carry" → "carrying" in the Citizenship card (`Landing.tsx:L401-402`).

---

### Phase 3 — New Must-Have Pages

> Each page uses the shared Navbar + Footer from Phase 1.

- [ ] **3.1 — About page (`src/pages/About.tsx`)**: Founder story section, team cards with photos, mission statement, company stats (reuse social proof counter component), office location with map embed placeholder.
- [ ] **3.2 — Success Stories page (`src/pages/SuccessStories.tsx`)**: Grid of testimonial cards (photo, name, "Lagos → Munich", university, programme, quote). Filterable by university/year. Uses hardcoded data initially → swapped to Firestore `testimonials` collection when backend is ready.
- [ ] **3.3 — Programs/Services page (`src/pages/Programs.tsx`)**: Two-track layout (Study Route vs. Opportunity Card Route). Step-by-step timeline visualisation for each. Service inclusions list. CTA to eligibility quiz or contact.
- [ ] **3.4 — Contact page (`src/pages/Contact.tsx`)**: Contact form (name, email, phone, message), WhatsApp direct link, email address, operating hours. Form submits to Express `/api/contact` or directly to Firestore `contactSubmissions` (depending on backend decision).
- [ ] **3.5 — Update `App.tsx` router**: Add routes for `/about`, `/success-stories`, `/programs`, `/contact`, `/terms`, `/privacy`.
- [ ] **3.6 — Update Navbar links**: Add section links to About, Programs, Success Stories, Contact in both desktop and mobile menus.

---

### Phase 4 — Legal & Trust Pages

> Required for auth page compliance (Terms checkbox links to `#`).

- [ ] **4.1 — Terms of Service page (`src/pages/TermsOfService.tsx`)**: Static content page with proper legal formatting. Scrollable with table of contents sidebar.
- [ ] **4.2 — Privacy Policy page (`src/pages/PrivacyPolicy.tsx`)**: GDPR-compliant privacy policy. Static content, similar layout to Terms.
- [ ] **4.3 — Fix Auth page links**: Update `Auth.tsx` Terms/Privacy `href="#"` to actual routes (`/terms`, `/privacy`).

---

### Phase 5 — Dashboard UX Improvements

> Directly impacts application completion rate.

- [ ] **5.1 — Responsive sidebar**: Convert sidebar to a bottom tab bar on mobile (`< 768px`) with icons for My Application, Resources, Profile, Sign Out. Remove the sticky full-width horizontal bar.
- [ ] **5.2 — Dynamic progress tracker**: Replace hardcoded `steps` array with computed state from Firestore data (profile complete? → documents uploaded? → all verified? → application submitted?). Update progress bar width dynamically.
- [ ] **5.3 — Personalised greeting**: "Good morning, Chioma 👋" with time-of-day awareness (`getHours()` → morning/afternoon/evening).
- [ ] **5.4 — Edit Profile modal scroll fix**: Add `max-h-[90vh] overflow-y-auto` to the modal container for short screens.
- [ ] **5.5 — Tablet grid fix**: Change `lg:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-3` so tablet users see a 2-column layout instead of single-column.
- [ ] **5.6 — Sticky mobile submit button**: Make the mobile "Submit Application" button `fixed bottom-0` with a frosted glass background instead of inline at the bottom of the form.
- [ ] **5.7 — Document upload drag-and-drop**: Add a visual drop zone with animated border and "Drop your file here" text. Falls back to click-to-upload on mobile.
- [ ] **5.8 — Resource cards polish**: Add thumbnail preview icons, "New" badges, and hover state with download animation.

---

### Phase 6 — Auth Page Polish

> Lower priority — users already convert through auth, but polish increases confidence.

- [ ] **6.1 — Animated background**: Add slow Ken Burns effect or subtle parallax on the background image (currently static).
- [ ] **6.2 — Password strength indicator**: Visual bar (weak/medium/strong) on signup form with colour feedback (red → amber → green).
- [ ] **6.3 — Social proof nudge**: Add "Join 500+ students already on their journey" with an avatar stack on the left branding panel (desktop) and above the form (mobile).
- [ ] **6.4 — Forgot password flow**: Wire up the "Forgot password?" link (currently `href="#"`) to Firebase `sendPasswordResetEmail`.

---

### Phase 7 — Opportunity Card & Secondary Pages Polish

- [ ] **7.1 — OpportunityCard.tsx**: Replace `picsum.photos` placeholder images with real/generated images. Apply shared Navbar + Footer. Add Framer Motion entrance animations (currently only hero has them).
- [ ] **7.2 — Opportunity Card points calculator**: Interactive form where users input their credentials and see their points tally live (age, experience, language skills, education). High engagement feature.

---

### Phase 8 — Final Polish & Cleanup

- [ ] **8.1 — Dark mode decision**: Either complete dark mode across all pages (Auth, FAQ, OpportunityCard, Admin, all new pages) or strip all `dark:` classes to avoid half-broken state.
- [ ] **8.2 — SEO meta tags**: Add unique `<title>` and `<meta description>` for each new page via `react-helmet` or a custom `useDocumentTitle` hook.
- [ ] **8.3 — Lighthouse audit**: Target Performance > 90, Accessibility > 95, SEO > 95. Fix CLS from font loading, optimise images, add `alt` tags.
- [ ] **8.4 — Cross-browser/device testing**: Chrome, Safari iOS, Samsung Internet. Test on a real Android device (primary target market).
- [ ] **8.5 — Remove hardcoded admin email from frontend**: Replace `chimadayo43@gmail.com` checks with Custom Claims check (`user.getIdTokenResult().claims.admin`) once backend task 3.2 is complete.

---

## 4. Open Questions (Require Product Decision)

| # | Question | Impact |
|---|----------|--------|
| 1 | **Typography**: Keep Outfit-only or switch to Playfair Display (headings) + Satoshi (body) per ARCHITECTURE.md? | Affects every page. Must decide before Phase 1 starts. |
| 2 | **Dark mode**: Fully implement or remove? Currently half-done (Landing + Dashboard only). | Affects scope of Phase 8. |
| 3 | **Pricing model**: Do we charge for services? If yes, the Programs page needs a pricing table. | Affects Phase 3.3 scope. |
| 4 | **Testimonials**: Are there real student success stories, photos, or video testimonials available? | Determines if Phase 2.5 / 3.2 use real or placeholder content. |
| 5 | **WhatsApp number**: What is the actual WhatsApp Business number for the widget? | Blocks Phase 2.10. |
| 6 | **Legal content**: Are Terms of Service and Privacy Policy documents drafted? | Blocks Phase 4. |
| 7 | **Blog / Content section**: Is a blog with SEO articles (e.g., "How to open a blocked account from Nigeria") in scope for Week One? | Not currently planned. Would be Phase 9 if added. |

---

## 5. Backend Dependencies

Several frontend features require backend work to be completed in parallel. See `BACKEND_TASKS.md` (separate document) for the full backend engineer task breakdown. Key dependencies:

| Frontend Feature | Backend Dependency | Can Start Without Backend? |
|-----------------|-------------------|---------------------------|
| Contact page form | `contactSubmissions` Firestore collection + rules | ✅ Yes — build UI, wire up later |
| Success Stories page | `testimonials` Firestore collection | ✅ Yes — use hardcoded data initially |
| Dynamic dashboard checklist | `users` schema additions | ✅ Yes — compute from existing fields |
| Email notifications | `onApplicationStatusChange` Cloud Function | ❌ No — pure backend task |
| Admin role cleanup | Firebase Auth Custom Claims | ✅ Partial — frontend can prepare, backend sets claims |

---

## 6. Acceptance Criteria

Phase is considered complete when:

1. All checklist items are marked `[x]`
2. `npm run lint` passes with zero errors
3. All pages render correctly at 375px, 768px, 1024px, and 1440px breakpoints
4. Full user flow works: Landing → Quiz → Auth → Email Verify → Dashboard → Upload → Submit
5. No broken links (`href="#"`) remain
6. Lighthouse scores: Performance > 90, Accessibility > 95, SEO > 95
7. WhatsApp widget links to a real number
8. All shared components (`Logo`, `Navbar`, `Footer`) are used consistently across every page
