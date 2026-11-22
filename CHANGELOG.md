# Changelog

## 0.1.0 — Phase 1 prototype

- Added Next.js App Router, strict TypeScript, Tailwind CSS and Lucide icons.
- Built a responsive coach workspace with overview, week/month calendar, recurring availability, date exceptions, club and lesson editors, and booking requests.
- Added local approve/decline interactions, calendar club filtering, active/inactive records and session details.
- Explicitly labelled all records and changes as mock data; refresh resets the workspace.
- Kept services, authentication, public websites, payments and deployment out of scope.
- Verified lint, strict type checking, static production build and desktop/mobile browser smoke flows.
- Bundled Geist locally and used the supported Webpack build option for sandbox compatibility.

## 0.1.1 — Supplied brand artwork

- Replaced the dashboard sidebar and footer text wordmarks with the supplied blue-ring Calspot logo.
- Preserved the original root artwork and added a web-served copy with accessible alternative text and responsive sizing.

## 0.1.2 — Logo colour palette

- Introduced a shared electric-blue accent (`#0038FC`), sampled from the supplied logo, with pale blue surfaces and neutral greys.
- Applied the brand palette to primary actions, selected navigation, keyboard focus, calendar selection, avatars and supporting icons.
- Kept distinct green, amber and red booking status colours for clarity.

## 0.1.3 — Dashboard refinement

- Refined the Apple-inspired feel with system-first typography, more generous spacing, softer neutral surfaces and rounded panels and controls.
- Quietened selected navigation and segmented controls while retaining the logo blue for primary actions and key highlights.
- Preserved responsive layouts, reduced-motion preferences and distinct booking statuses.

## 0.1.4 — Pilot coach identity

- Set Kelly-Jane Whalley as the first pilot coach using a shared profile, replacing the fictional dashboard coach name and initials.
- Kept all player, club, lesson and booking fixtures explicitly fictional; no personal biography or credentials added.

## 0.2.0 — Public coach-site design prototype

- Added Kelly-Jane’s local public-site preview at `/kelly-jane`, with coach-led typography, editorial court imagery, about placeholder, sample coaching formats, venues, FAQs and booking calls to action.
- Added a three-step local request flow at `/kelly-jane/book`, including lesson deep links, sample dates/times, player details and a clearly labelled pending demo confirmation.
- Preserved the dashboard at `/` and added a link to the coach-site preview.
- Generated and saved court-only concept imagery, without inventing a portrait, biography, credentials, testimonials or business details for Kelly-Jane.
- Kept forms in memory only; no database, email, payments, real reservations or deployment.
- Verified desktop/mobile flows, menu, FAQs, mobile overflow, dashboard continuity, lint, TypeScript and production build.

## 0.3.0 — Booking-first mini-site and WhatsApp previews

- Replaced the longer public site with a concise one-page mini-site and inline request flow; put the form first on mobile.
- Removed extended marketing sections and retained a small coach introduction, session/club choices and approval guidance.
- Added accessible WhatsApp enquiry and contextual follow-up previews with copyable drafts, without using a real phone number or sending messages.
- Added email/WhatsApp contact preferences and conditional phone validation to demo requests.
- Kept old booking URLs working through redirects with validated lesson selections.
- Verified desktop/mobile layouts, request and messaging preview flows, existing dashboard, lint, TypeScript and production build.

## Source control setup

- Initialised Git on `main` and connected the project to `stmsmediauk/calspot`.
- Included source, lockfile, documentation and prototype assets; excluded dependencies, builds, environment files and caches.
