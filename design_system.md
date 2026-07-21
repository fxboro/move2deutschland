# Move2Deutschland Design System

Welcome to the **Move2Deutschland Design System**. This document serves as the single source of truth for all future user interface (UI) and user experience (UX) implementation across the platform.

---

## 1. Core Visual Principles

1. **Premium & Luxurious**: We use subtle gradients, deep blues, refined golds, and glassmorphic card overlays to convey top-tier credibility.
2. **Accessible & Inclusive**: High-contrast ratios for all typography ensuring readability for individuals from diverse backgrounds.
3. **Clean & Structured**: Respect for negative space, intentional page grid systems, and structural focus guidelines.
4. **Responsive & Fluid**: Tailored for smooth viewport transitions with standard border-radius and grid behaviors.
5. **Interactive Delight**: Dynamic micro-animations on interactive states using custom cubic-bezier timing curves.

---

## 2. Color Tokens

### 2.1 Brand Primary (Prussian Blue)
Used for primary backgrounds, dark headers, sidebars, and critical text emphasis.
- **Deep Prussian Blue** (`--color-prussian-blue-dark`): `#001F35`
- **Theme Prussian Blue** (`--color-prussian-blue`): `#003153`
- **Light Prussian Blue** (`--color-prussian-blue-light`): `#0D4F7C`

### 2.2 Brand Accent (Gold)
Used to guide the user's attention, signal key CTAs, and highlight selected achievements.
- **Classic Gold** (`--color-gold`): `#D4AF37`
- **Golden Hover** (`--color-gold-hover`): `#FFCC00`
- **Golden Sand** (`--color-gold-bright`): `#FFD700`
- **Soft Gold Glow** (`--color-gold-soft`): `#FCF8E3`

### 2.3 Semantic States
- **Success**: `#10B981` (Background Light: `#ECFDF5`)
- **Warning**: `#F59E0B` (Background Light: `#FFFBEB`)
- **Error**: `#EF4444` (Background Light: `#FEF2F2`)
- **Info**: `#3B82F6` (Background Light: `#EFF6FF`)

---

## 3. Typography & Hierarchy

### 3.1 Font Families
- **Display & Headings**: `"Playfair Display"`, Georgia, serif (elegant, academic, and trusted).
- **Body & Interface**: `"Satoshi"`, `"Inter"`, sans-serif (modern, legible, geometric).

### 3.2 Font Scaling Guidelines
| Size Token | Tailwind Class | Font Size | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **XS** | `text-xs` | `0.75rem` (12px) | `1rem` | Tiny captions, badge text, helper hints |
| **SM** | `text-sm` | `0.875rem` (14px) | `1.25rem` | Secondary text, forms, sub-labels |
| **Base** | `text-base` | `1rem` (16px) | `1.5rem` | Default body copy, paragraphs |
| **LG** | `text-lg` | `1.125rem` (18px) | `1.75rem` | Large menu links, intro paragraphs |
| **XL** | `text-xl` | `1.25rem` (20px) | `1.75rem` | H3 Headings, card titles |
| **2XL** | `text-2xl` | `1.5rem` (24px) | `2rem` | H2 Headings, section titles |
| **3XL** | `text-3xl` | `1.875rem` (30px) | `2.25rem` | H1 Headings, modal titles |
| **4XL** | `text-4xl` | `2.25rem` (36px) | `2.5rem` | Page headers, main hero titles |

---

## 4. Spacing & Borders

### 4.1 Spacing Scale
Always use standard spacing multipliers (e.g., `gap-4`, `p-6`, `mb-8`) to maintain consistent alignment.
- **Micro**: `0.25rem` (4px), `0.5rem` (8px)
- **Compact**: `0.75rem` (12px), `1rem` (16px)
- **Standard**: `1.5rem` (24px), `2rem` (32px)
- **Hero**: `3rem` (48px), `4rem` (64px)

### 4.2 Rounded Borders
- **Standard Rounded**: `rounded-xl` (`0.75rem`) - Used for button widgets, tag highlights, and minor inputs.
- **Card Rounded**: `rounded-2xl` (`1rem`) - Standard dashboard cards and navigation drawers.
- **Section Rounded**: `rounded-3xl` (`1.5rem`) - Hero frames and large page segment layouts.
- **Pill**: `rounded-full` - Action buttons, profile picture frames, and badge overlays.

---

## 5. UI Components (Standardized Snippets)

Use these exact copy-pasteable Tailwind class patterns when constructing components:

### 5.1 Primary Buttons
```html
<button class="bg-prussian-blue hover:bg-prussian-blue-light text-white font-bold py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
  Explore Programs
</button>
```

### 5.2 Accent Buttons (Gold Highlight)
```html
<button class="bg-gold hover:bg-gold-hover text-prussian-blue font-bold py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
  Apply Now
</button>
```

### 5.3 Glass Action Buttons
```html
<button class="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 px-6 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer">
  Learn More
</button>
```

### 5.4 Premium Interactive Cards
```html
<div class="glass-card-premium rounded-3xl p-8 hover:translate-y-[-4px] hover:shadow-premium transition-all duration-300">
  <h3 class="font-heading text-2xl font-bold text-prussian-blue mb-3">Opportunity Card</h3>
  <p class="text-slate-600 text-sm leading-relaxed mb-6">Learn how you can qualify for the job search opportunity card in Germany.</p>
  <a href="/opportunity-card" class="text-gold font-bold text-sm inline-flex items-center hover:underline">
    Calculate Points &rarr;
  </a>
</div>
```

### 5.5 Premium Form Inputs
```html
<div class="space-y-2">
  <label class="text-xs font-bold text-prussian-blue tracking-wider uppercase">Email Address</label>
  <input 
    type="email" 
    placeholder="you@example.com" 
    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-prussian-blue focus:ring-2 focus:ring-prussian-blue/10 bg-white/50 backdrop-blur-sm transition-all outline-none"
  />
</div>
```

---

## 6. Motion & Transitions

Always use consistent transition curves for a premium interactive feel:
- **Cubic Bezier curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (declared as `var(--transition-timing-function-premium)`).
- **Default timing limit**: `duration-300` for cards, `duration-200` for buttons and links.
