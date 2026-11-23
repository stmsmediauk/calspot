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

## 0.4.0 — Personal coach profile and basic personalisation

- Preserved the single-page two-column layout and existing three-step booking flow.
- Added Kelly-Jane’s supplied photograph, concise biography, experience and Instagram enquiry link, with compact mobile framing and expandable details.
- Added My profile to the dashboard for local photo/logo uploads, identity, introduction, experience, location, accent and optional contact details.
- Shared profile, clubs and lesson types between the dashboard and public page using a typed per-tab session store; player request details remain temporary and are never persisted there.
- Hid WhatsApp buttons, preferences and follow-ups until a valid coach number is supplied; previews remain unsent.
- Kept inactive records out of public choices, handled empty availability configuration and preserved old lesson links.
- Updated the product brief to specify a personal booking page, not a multi-page website builder.
- Verified desktop/mobile layouts, local editing and media, contact visibility, state continuity, existing requests, lint, TypeScript and production build.

## 0.5.0 — Editorial public-page direction

- Adapted the supplied fashion-site reference into oversized coach-name typography, a large editorial portrait and a minimal one-page composition.
- Removed profile/booking card chrome in favour of a consistent open grid, selectable lesson rows and restrained rules.
- Preserved the existing three-step request logic, pending approval, validation, local data and conditional WhatsApp controls.
- Introduced Studio, Clay, Court, Midnight and Sand as complete curated palettes; removed arbitrary colour editing.
- Migrated older local profile accents to Studio without losing profile content. Unknown palette IDs use Studio.
- Kept the dashboard's existing design; changed only its profile palette selector.
- Verified five-theme contrast, desktop/mobile layouts, full request flow, contact behaviour, legacy links, palette restoration, lint, TypeScript and production build.

## 0.6.0 — Template redesign and appearance options

- Rebuilt the public coach page as a reusable template driven by an `appearance` configuration instead of Kelly-Jane specific styling.
- Added three hero layouts (Editorial, Split, Full-bleed) with a stacked first-name/surname lockup sized to its longest word.
- Added five whole-page looks plus fine-tuning of palette, accent (ten vetted swatches, automatic readable button text), three type pairings (bundled locally) and three corner styles.
- Added an optional highlights strip, testimonials (shown only when real ones are entered), a generic FAQ, tagline, photograph focal point and an optional "Powered by calspot." footer line.
- Replaced the dashboard palette picker with My profile → Page look and Page content, with live look previews and a contrast readout.
- Booking flow: persistent session summary, week navigation, per-day availability, accessible step list, dates and timezone formatted with `Intl`, and clearer single-verb calls to action.
- Gated prototype wording behind `publicCoach.demoMode` and replaced the public "Coach dashboard" footer link with a preview-bar link visible only in demo mode.
- Raised the minimum text size, strengthened interactive control borders for contrast and added subtle headline and step motion that respects reduced-motion preferences.
- Migrated saved drafts safely, keeping content and validating every appearance field.
- Fixed a global dashboard `main` offset leaking into the public page.
- Not included: the sign-up wizard, server-rendered public pages and real legal links (see README).

## 0.7.0 — Dashboard redesign

- Gave every dashboard section a real URL under `/dashboard`; `/` redirects there. Opens on Requests when requests are pending.
- Moved bookings, recurring availability and exceptions into the shared per-tab workspace store. The public request form now offers start times derived from them, hiding blocked and already requested times. Added "All lessons" availability.
- Rebuilt the shell: one identity card with the coach's photo and look, a single demo indicator, **View my page** and **Copy link**, and a mobile bottom tab bar. Removed the help card, repeated stats, banner, "Phase 1" badges and footer logo.
- Overview now has a needs-attention card, booking-page card and a setup checklist. Requests show how long ago they arrived and warn about overlaps.
- Calendar gained an Agenda view (default on phones). Booking details and the calendar header use the correct GMT/BST label.
- Availability: weekly editor with Add time, Copy to other days, Block a date and a "What players see" preview.
- Clubs and Lessons: compact lists with "On my page" switches and lesson ordering. Lesson descriptions and club notes now show publicly.
- My profile: Profile, Appearance and Contact tabs, a live preview of the unsaved draft (desktop split view, phone sheet) and a sticky save bar with discard and an unsaved-changes browser warning.
- Introduced shared dashboard tokens, a 13px readable-text floor, stronger control borders, 44px mobile targets and `platform.ts` as the single demo-mode switch.
- Verified lint, strict types, production build, all seven dashboard pages at 1440px and 390px (no overflow, no text under 12px), availability changes reaching the public page, and live preview, save and approve flows.

## 0.8.0 — Coach sign-up prototype

- Added `/signup`, a six-step guided flow (You, Your story, Your look, Clubs & lessons, Your week, Review) with inline validation, focus management and a live preview of the real public page.
- Creating a page replaces the tab's workspace with the new coach's data and opens the dashboard Overview with the setup checklist.
- Reused the look presets, image input, preview frame and availability model. Exported `AssetInput` and `LookPreview` for reuse.
- Added a demo-only "Preview the sign-up flow" link to the dashboard sidebar.
- Prototype only: no accounts, email, authentication or hosting. The public page remains at the single pilot route.
- Verified lint, strict types, production build, validation errors, a full run-through at 1440px and 390px, the resulting dashboard and public page, and no horizontal overflow.

## 0.9.0 — Prototype gap fixes

- Added a server-side tenant lookup seam (`getTenantWorkspace`); the public page now has `generateMetadata`, Open Graph data and Person structured data. Split pure workspace model and validation into `workspace-model.ts`.
- Added draft Privacy and Terms pages with footer links, a visible draft notice and placeholders for legal review.
- Added an optional logo for dark looks; dark looks fall back to a text wordmark without one.
- Requests: list-and-detail inbox on wide screens, optional notes, "suggest another time" from real availability, overlap badges and history of offered times.
- Added an unsaved-changes prompt for in-app navigation away from My profile.
- Removed duplicate component `<title>` tags in favour of page metadata.
- Verified lint, strict types, production build, server HTML metadata, legal pages and footer links, inbox note and suggestion flow, overlap warning, the unsaved guard (stay, discard, clean) and logo fallback.

## 0.10.0 — WhatsApp click-to-chat

- Replaced the unsent WhatsApp preview dialog with real `wa.me` click-to-chat links. Nothing is sent by Calspot; people press Send in their own WhatsApp. No WhatsApp API is used.
- Public page: **Message on WhatsApp** beside the main call to action in all hero layouts, WhatsApp as the default contact preference when the coach has a number, and **Send to {coach} on WhatsApp** after a request with the details ready to send.
- Dashboard: approve, decline and suggest-another-time open a draft message to the player (opt-out tick box, optional personal line); follow-up buttons on decided requests; a **Tomorrow** reminders list on Overview.
- Added four editable message templates with placeholders and a live example in My profile → Contact.
- Added fictional player phone numbers to sample bookings and a shared helper for number normalisation (UK 0-numbers become +44), template rendering and link building.
- Fixed the request form choosing its contact default before saved data loaded.
- Verified lint, strict types, production build, hero and confirmation links, the approve and suggest flows opening the right drafts, custom templates, reminders, the no-phone case and earlier flows.


## Group sessions

- Lessons have a number of spaces (capacity) and a per-person price; lengths of 120 minutes are allowed.
- Booking requests can take several spaces; players share a session until it is full. `supabase/group_sessions.sql` must be run first.
- The booking form shows spaces left, the dashboard shows spaces per request, and clashes between players in one session are no longer flagged.
