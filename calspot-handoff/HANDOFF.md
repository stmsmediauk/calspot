# Calspot landing page rebuild: handoff brief

Replace the current marketing landing page (the `/` route) with the new sales-funnel design. Build it in the project's existing stack and conventions. Don't change the app, auth, signup flow or dashboard.

- `design-reference.html` is the approved design: the source of truth for layout, copy, colours and spacing. It's a design-tool file (Design Component format), so read it for structure and styles. Don't ship it as-is: the `<x-dc>`, `<sc-for>`, `{{ }}` and `support.js` parts are design-tool syntax. Rebuild it as proper components.
- `images/` holds the web-optimised photos to use (see the asset map below).

## Brand tokens (Calspot's existing colours, nothing new)

| Token | Value | Use |
|---|---|---|
| blue | `#0038FC` | Primary brand, CTAs, hero background, accents |
| navy | `#0B1030` | Dark sections, header, footer, headline strips |
| ink | `#1D1D1F` | Body text on light |
| grey-700 | `#4A4F5A` | Secondary text |
| grey-500 | `#6E6E73` | Muted text, captions |
| grey-300 | `#D3D4DA` | Borders and dividers |
| grey-100 | `#E8E8ED` | Chat bubble area |
| light | `#F5F5F7` | Light section background |
| tint | `#DCE4FF` | Eyebrows and small labels on navy or blue |
| tint-50 | `#F0F3FF` | Image placeholder background |
| whatsapp | `#D9FDD3` | Outgoing chat bubbles |
| white | `#FFFFFF` | |

The pricing section keeps the existing blue glow: `background: #0B1030` plus `radial-gradient(60% 90% at 90% 0, rgba(0,56,252,.45), transparent 70%)`.

## Typography

Keep the current font stack: Geist / `-apple-system, system-ui, 'Segoe UI', sans-serif`. Use `next/font` Geist if this is Next.js and it's already set up.

- **Display headlines:** weight 900, UPPERCASE, `letter-spacing: -0.04em to -0.045em`, `line-height: .86–.9`.
  - Hero: `clamp(56px, 9vw, 132px)`
  - Section H2: `clamp(40px, 5vw, 72px)`
  - Final CTA: `clamp(48px, 7vw, 104px)`
- **Eyebrows:** 13px, weight 600, uppercase, `letter-spacing: .14em`.
- **Body:** 17–20px, `line-height: 1.5–1.6`.
- **Highlight strip:** the second line of the hero and final headlines sits on a solid block (`display:inline-block; padding: 0 .12em .04em`):
  - hero: navy strip on the blue/photo background
  - final CTA: blue strip on the photo

## Sections, in order

1. **Header (navy):** `calspot` wordmark (weight 900, -0.04em), links (How it works, Pricing, FAQ, Log in) and a blue "Start free trial" button. Wraps on mobile.
2. **Hero:**
   - Full-bleed photo with a gradient overlay. Desktop: `hero-desktop.jpg`, positioned right, with a left-to-right navy fade. Mobile under 768px: `hero-mobile.jpg`, positioned bottom, with a top-to-bottom navy fade.
   - Text: eyebrow "For independent coaches", the headline "LESS ADMIN. / MORE COURT TIME." (second line on the navy strip), then the subcopy.
   - **Claim-your-link field:** a `calspot.com/` prefix plus a text input and a white "CLAIM MY PAGE" button. Microcopy below: "14-day free trial · No card needed · Cancel anytime".
3. **Problem (light):**
   - Left column: "TEN MESSAGES TO BOOK ONE LESSON.", the copy, then `problem.jpg`.
   - Right column: a messy WhatsApp thread (grey) next to a navy "After · Calspot" card with an Approve/Suggest time request and a confirmation bubble.
4. **How it works (white):**
   - Three columns, each with a blue top rule, a big blue numeral (01, 02, 03), a title, copy and an image: `step1.jpg`, a placeholder, `step3.jpg`.
5. **Make it look like you (light):**
   - Headline "HERE'S YOUR PAGE." changes to "HERE'S SAM'S PAGE." once a name is entered.
   - A name input, then five preset cards (Studio, Journal, Clay, Court, Midnight) that show the entered name, plus a line with the live `calspot.com/<slug>`. The preset colours are in the design file's `looks` array.
6. **Benefits (navy):** headline with "on court." underlined in blue (10px thick), then three benefit columns.
7. **Proof (white):** three testimonial cards. These are **placeholder slots** because there are no real coaches yet. Build the component with the dashed-border placeholder look so real quotes can drop in later. Don't invent testimonials.
8. **Pricing (navy plus glow):**
   - Left: "LESS THAN ONE LESSON A MONTH."
   - Right: a light card with a large "£29", "First 14 days free", a five-item tick list, a blue CTA, and "No card needed · Cancel anytime".
9. **FAQ (light):** five native `<details>` accordions. Two answers are still placeholders (after trial, payments). Keep them clearly marked as TODO.
10. **Final CTA:** `final-court.jpg` background with a navy overlay, the headline "YOUR PAGE IS / ONE TAP AWAY." (blue strip), the slug display, a white "CLAIM IT FREE" button and the trial microcopy.
11. **Footer (navy):** wordmark, Log in, Privacy, Terms, Contact, © Calspot.

## Behaviour

- **Shared name state:** the hero input and the "Make it look like you" input share one value.
  - Slug = lowercase, non-alphanumerics become `-`, trimmed. Empty means "your-name" and "Your Name".
  - The slug shows in the presets section and the final CTA.
- **Claim buttons:** pass the slug to the existing signup route as a query param (e.g. `/signup?slug=sam-taylor`), using whatever the signup route is in this repo. If signup can't accept it yet, link to signup and leave a TODO. The design's anchor-scroll to the presets section was only for the mockup.
- **Sticky mobile CTA:** under 768px, a fixed bottom bar with "Claim your page". It appears after the hero scrolls out of view.
- **Anchors:** header links scroll smoothly to `#how`, `#pricing` and `#faq`.

## Asset map

| File | Slot | Alt text |
|---|---|---|
| `hero-desktop.jpg` | Hero background, 768px and up | Padel coach feeding a ball at the net under floodlights |
| `hero-mobile.jpg` | Hero background, under 768px | (same) |
| `problem.jpg` | Problem section | Coach checking their phone courtside next to a padel racket and balls |
| `step1.jpg` | Step 01 | Coach setting up their page on a laptop courtside |
| `step3.jpg` | Step 03 | Coach waving a player onto a floodlit padel court |
| `final-court.jpg` | Final CTA background | (decorative) |

Step 02 has no image yet. Use a `#F0F3FF` placeholder block.

Use the framework's image optimisation (e.g. `next/image`). Give the hero image priority; lazy-load the rest.

## Acceptance

- Matches `design-reference.html` at 1440px, 768px and 375px.
- Text contrast passes WCAG AA, touch targets are 44px or larger, and inputs have labels.
- Update the page metadata (title, description, OG) to the new headline.
- No new dependencies unless they're really needed.
- When done, run the dev server and report anything that couldn't be matched.
