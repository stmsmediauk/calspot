# Calspot

> **Calspot** — *Your coaching. All in one spot.* A premium, single-page coaching profile and booking-request platform for independent padel coaches.

## Brand and product identity

- **Product name:** Calspot (working brand; final trademark clearance pending).
- **Tagline:** Your coaching. All in one spot.
- **Product descriptor:** Profiles · Bookings · Calendar.
- **Logo:** the lowercase `calspot` wordmark with a square "o" (the "spot"). SVG files are in `public/logos/`: lime on navy backgrounds, navy on white or light ones. Steve's original artwork is in `public/logos/SVG/`. Never stretch or recolour it, and never put lime on white.
- **Palette:** navy `#0B1030` (primary), lime `#D6FD69` (accent, always small: buttons and highlights), blue `#3A5CF5` (secondary), with light `#F5F5F7`, ink `#1D1D1F` and greys. Tokens are the `--cs-*` custom properties in `src/app/globals.css`. Lime is never used on white, and lime and blue never share a large area.
- **Type:** Bricolage Grotesque (ExtraBold 800 maximum) for headings and buttons, loaded with `next/font/google`; Geist for body text. Landing H1s are Title Case, H2s uppercase. Coach pages keep their own type pairings.
- **White-label rule:** Calspot is the platform brand, not a forced visible brand on coaches' public booking pages.
- **Brand decisions pending:** registered domain and trademark clearance. Do not assume any domain is owned or configured.

## Project status

**Live on Vercel, in early access.** Coaches can sign up, build a page, publish it and receive booking requests. Auth, database and file storage run on Supabase. Updated November 2026. Sections further down are the original planning and prototype notes; the section **Current state** at the end of this file is the up-to-date description.

| Area | Status |
| --- | --- |
| Landing page (`/`), sign-up, log in, password reset | Built |
| Coach dashboard (requests, calendar, availability, clubs, lessons, profile and looks) | Built, saved to Supabase |
| Public coach pages (`/<address>`), booking requests, share images, SEO | Built |
| Master admin (`/admin`) | Built |
| 14-day free trial | Built (needs `supabase/trial.sql`) |
| Billing (Stripe), email notifications | Not started |
| Legal text | Drafts, need review and completing |

## Product vision

One centrally maintained application serves multiple independent coaches. Each coach has one branded personal booking page and a simple, mobile-friendly dashboard to manage their profile, clubs, lessons, availability and booking requests. Calspot is not a traditional website builder: coaches fill in a few fields rather than create pages or arrange blocks. Players request sessions without creating accounts; **every request must be approved by the coach**. No online lesson payments, club booking integrations, player accounts or complex CRM in the MVP.

Initial commercial hypothesis: approximately **£29/month per coach**, subject to validation. Platform subscription collection can be handled manually at launch; do not implement subscription billing in the MVP.

### Core principles

1. **Simplicity first:** a coach can update their weekly schedule in under a minute.
2. **White-label by configuration:** never fork or duplicate code for each coach.
3. **Mobile-first:** most coach admin actions happen on a phone.
4. **Light, minimal, Apple-inspired design:** polished and restrained, not a dark sports theme.
5. **Coach-controlled bookings:** a request is not a confirmed booking or a confirmed court reservation.
6. **Data portability:** coaches can export their own information.
7. **Maintainability:** source code, migrations, documentation and deployment are transferable to another developer.

## Users and roles

- **Platform admin:** creates and manages tenants, invites coach owners, configures subscriptions/status and supports onboarding.
- **Coach owner:** edits only their own site, clubs, lesson types, availability and bookings.
- **Player/visitor:** views site and availability, requests a lesson, receives email status updates; no login.

The initial product supports one coach schedule per tenant. Additional staff and academies are out of scope, but avoid architecture that makes future expansion impossible.

## MVP features

### Public coach booking page

- One premium, single-page coach profile with an integrated three-step booking request.
- Oversized coach-name typography with a large editorial photograph immediately below, followed by an open introduction/booking grid.
- Profile: photograph, name, coaching title, a 2–3 sentence introduction, optional qualifications/experience and clubs/location.
- Mobile: scaled hero typography, prominent photography, concise introduction and expandable experience/locations, with direct booking anchors.
- Personalisation: photograph (with focal point), name, tagline, introduction, an optional highlights strip and testimonials, and a whole-page "look" chosen from curated presets. Coaches can fine-tune page style, palette, accent, type pairing and corner style from curated lists. No page builder, raw colour editing or drag-and-drop.
- Coach-specific clubs, lesson types, durations, indicative prices and availability.
- Optional WhatsApp click-to-chat, displayed only when the coach has supplied a valid number; optional Instagram enquiry link.
- Every request needs coach approval; a request does not reserve a court.
- Coach-specific subdomains initially, custom domains later. No domain is assumed to be owned.
- Appropriate legal disclosures/content are required before production launch; do not add extra public marketing pages.

### Coach dashboard

- Overview: upcoming sessions and pending requests.
- Calendar: week/month views, availability and booking statuses.
- Clubs: create/edit/deactivate venues with address and notes.
- Lessons: create/edit/deactivate types, durations and indicative prices.
- Availability: recurring weekly rules, one-off extra slots, blocked dates and holidays.
- Requests: approve/decline pending bookings and review confirmed bookings.
- My profile: edit photograph, name, title, short introduction, experience, coaching area, curated palette, optional logo and contact links.
- Data & Backups: export own records and website content (details below).

### Booking workflow

1. Coach creates a club, lesson type and availability.
2. Player chooses a currently available slot and submits name, email and optional phone, playing level and message.
3. Server atomically holds the slot and creates a **pending** request. Allow only one active pending/confirmed booking per slot.
4. Coach receives an email notification and can approve or decline in the dashboard.
5. Approval marks the booking **confirmed** and sends a confirmation email; decline releases the slot and notifies the player.
6. Public UI explicitly states that requests are **not confirmed until approved** and that the coach must arrange/verify court availability independently.

Statuses: `pending`, `confirmed`, `declined`, `cancelled`; reserve `expired` for a later automatic-expiry feature. Record all status transitions in an event log. Ensure notification retries are idempotent. No automatic payment, refund or invoicing logic.

### Availability rules

- Recurring weekly schedule by club and lesson type, with effective start/end dates.
- One-off additional availability and blocked dates/times.
- Configurable forward booking window (default 30 days) and minimum notice.
- Fixed-duration slots for MVP (e.g., 60 or 90 minutes); do not attempt complex variable-duration scheduling initially.
- Existing confirmed bookings survive changes to recurring rules.
- Prevent overlapping active holds/bookings for a coach across clubs, including concurrent requests.
- Store appointment instants in UTC and recurring rules in the tenant's IANA timezone (default `Europe/London`); test DST transitions.

## Visual design direction

**Premium editorial sports style for public pages; light, minimal, Apple-inspired for the dashboard.** The public page uses oversized tightly tracked coach-name typography, a large photograph, an open grid and an integrated request flow. The dashboard retains its existing quieter design.

- Background: `#FFFFFF`; secondary surface: `#F5F5F7`.
- Text: `#1D1D1F`; borders: `#E8E8ED`.
- Typeface: Bricolage Grotesque for headings and buttons, Geist for body text.
- Generous whitespace, consistent spacing, precise alignment.
- Subtle 1px borders; avoid heavy shadows, gradients, glassmorphism and decorative clutter.
- Navy primary buttons with lime text on light surfaces, lime buttons with navy text on navy, and accessible focus states.
- Lucide icons, subtle 150–250ms transitions; respect reduced-motion preferences.
- Public booking pages use a coach-selected look (hero layout, palette, accent, type pairing, corners) and imagery; **dashboard remains consistent** across tenants.
- Use selected components from [21st.dev](https://21st.dev/) only after reviewing dependencies, accessibility and licensing. Adapt them to a coherent shared design system; do not assemble mismatched components.
- Aim for WCAG 2.2 AA and excellent small-screen usability.

## Recommended stack

- Next.js (App Router), React, TypeScript.
- Tailwind CSS and selected shadcn/ui components.
- Supabase PostgreSQL, Auth, Storage and Row Level Security.
- Vercel hosting (deployment later).
- Resend or Postmark for transactional email (integration later).
- GitHub for source control; Sentry or similar for production monitoring.

**Budget:** Supabase Free is suitable for local development and pilot prototyping, subject to current quotas and inactivity policies. Before paid production launch, choose a reliable database/backup plan and test recovery. Do not treat the free tier as a backup strategy.

## Multi-tenant architecture

Use one application and shared database, with explicit `tenant_id` ownership for tenant-scoped records. Resolve public tenant identity from a validated hostname/subdomain. Authorize dashboard actions using the authenticated user's tenant membership. Never trust a client-supplied tenant ID as an authorization boundary.

Implement PostgreSQL RLS and server-side authorization. Test cross-tenant isolation for reads, writes, file access and exports. Avoid public access to private player contact details.

### Proposed database tables

| Table | Main fields / purpose |
| --- | --- |
| `tenants` | `id`, `name`, `slug`, `status`, `timezone`, timestamps |
| `tenant_users` | `tenant_id`, `user_id`, `role`, timestamps; unique tenant/user membership |
| `tenant_domains` | `tenant_id`, `hostname`, `verified_at`, status |
| `tenant_branding` | `tenant_id`, logo/media paths, theme, colours, versioned content JSON, SEO JSON |
| `clubs` | `id`, `tenant_id`, name, address, postcode, notes, active |
| `lesson_types` | `id`, `tenant_id`, name, duration, indicative price, description, active |
| `availability_rules` | `id`, `tenant_id`, club, lesson type, weekday, local start/end, effective dates |
| `availability_exceptions` | `id`, `tenant_id`, local date, optional time range, block/extra, club, lesson type |
| `slots` | `id`, `tenant_id`, club, lesson type, UTC start/end, source rule, open/held/booked/blocked |
| `bookings` | `id`, `tenant_id`, slot, player contact, status, request/decision timestamps, immutable lesson/venue snapshots |
| `booking_events` | booking, actor, prior/new status, timestamp, optional reason |
| `notification_outbox` | tenant, event, recipient, payload, delivery state, attempts, idempotency key |
| `contact_enquiries` | tenant, contact fields, message, timestamps |
| `platform_subscriptions` | tenant, plan, billing status, manual renewal notes; **no payment integration** |
| `audit_logs` | actor, tenant, action, resource, timestamp |

Create real SQL migrations and constraints when implementing the backend. Ensure tenant-scoped foreign keys cannot accidentally reference records owned by another tenant. Booking creation/approval must use transactions and database-enforced concurrency protection, not just UI checks.

## API / server actions (planned)

- Public: read tenant profile/lesson types/clubs/available slots; submit booking request; submit contact enquiry.
- Coach-authenticated: manage clubs, lesson types, availability, bookings, website content and exports.
- Platform-admin: create/suspend tenants, invite coach owners, manage domain mappings and account statuses.

Validate all input on the server; apply rate limiting and anti-bot measures to public forms. Do not expose Supabase service-role credentials to the browser.

## Data export, backups and continuity

### Coach self-service export (MVP)

Add **My Data & Backups** to the coach dashboard:

- CSV: bookings, player contacts, clubs and lesson types.
- ICS: confirmed appointments, suitable for calendar import.
- Versioned JSON: profile, branding, page content, availability rules and exceptions.
- Media ZIP or export links: coach-uploaded assets, where practical.
- Server-side, tenant-scoped export with authentication, secure expiring download, audit log and privacy protections.

An export is for **portability**, not a promise of instant website restoration. Do not build a user-facing restore/import feature in the first release.

### Platform continuity (production requirement)

- Independent, encrypted off-site backups of database **and** uploaded media; daily target with retention policy.
- Monitor backup failures and perform documented restore tests.
- Keep database migrations, deployment configuration, environment variable inventory and recovery runbook in GitHub.
- Maintain a secure emergency-access/handover procedure for a successor developer; never commit credentials or recovery keys.
- Include appropriately reviewed UK terms, privacy notices, retention/deletion procedures and proportionate limitation-of-liability language. A disclaimer cannot override statutory or data protection obligations.

## Out of scope for MVP

- Online payments for lessons or payment collection from players.
- Stripe Connect or automated platform subscription billing.
- Player accounts and player-facing dashboards.
- Club court-booking API integrations or guaranteed court reservations.
- Multi-coach academy scheduling, memberships, packages, player progression and analytics-heavy CRM.
- Multi-page coach websites, drag-and-drop page builders or fully bespoke layouts per coach.
- Native mobile apps.

## Development roadmap

### Phase 1 — App foundation and dashboard prototype

Set up Next.js/TypeScript/Tailwind, repository conventions and design tokens. Build mobile-first coach dashboard with **clearly labelled mock data**: calendar, club editor, lesson editor, availability editor and booking inbox. No backend yet.

**Done when:** prototype runs locally, looks polished on mobile and desktop, and navigation/components are reusable.

### Phase 2 — Supabase and tenant security

Add migrations, Supabase Auth, tenant membership, RLS, server-side authorization and tests proving tenant isolation.

**Done when:** two test tenants cannot access one another's records.

### Phase 3 — Availability and booking lifecycle

Implement recurring rules, exceptions, slot generation, atomic request holds, approval/decline and booking event history.

**Done when:** a player can request and a coach can approve a lesson without double-booking, including concurrent requests.

### Phase 4 — Personal booking pages and notifications

Connect the shared single-page profile template, branding configuration, SEO, request form, email outbox and transactional notifications. No multi-page websites or visual site builder.

**Done when:** two coach sites have distinct branding/content while sharing the same code.

### Phase 5 — Master admin and data portability

Implement tenant onboarding, subdomains, account status, self-service exports and basic platform support tools.

**Done when:** a new coach can be provisioned without a new codebase or deployment and can export their own data.

### Phase 6 — Production readiness and pilot

Accessibility, security, email deliverability, DST/concurrency tests, monitoring, backup/restore, documentation and 2–3 pilot coaches.

**Done when:** critical flows are tested and operational recovery procedures are verified before accepting paid customers.

## MVP acceptance tests

- [ ] Coach logs in and edits their own profile.
- [ ] Coach adds clubs and lesson types.
- [ ] Coach sets recurring availability and one-off exceptions.
- [ ] Player requests a lesson without an account.
- [ ] Request stays pending until coach approves/declines.
- [ ] Approval confirms; decline releases the slot.
- [ ] Booking emails are sent reliably without duplicate sends.
- [ ] Concurrent requests cannot double-book a slot.
- [ ] Existing bookings remain intact when availability rules change.
- [ ] Cross-tenant reads/writes/exports are denied.
- [ ] Coach can export CSV, ICS and website configuration.
- [ ] A second branded tenant can be provisioned without copying code.
- [ ] Mobile layouts and keyboard accessibility are tested.
- [ ] Backups and a documented recovery test exist before commercial launch.

## Instructions for Codex

1. **Read this README first** and treat it as the project brief.
2. Inspect the repository before proposing changes. Do not assume files or services exist.
3. **Keep the current prototype local.** Reuse the dashboard and single-page profile components. Backend phases start only when requested.
4. Do not connect Supabase, email providers, domains or production services until requested.
5. Prefer small, reviewable changes with clear component boundaries, strict TypeScript and no unnecessary dependencies.
6. Run available lint/typecheck/tests after each meaningful implementation step and report results accurately.
7. Keep mock data explicitly labelled; never imply bookings or notifications are real before integration.
8. Update this README when decisions change; maintain a concise `CHANGELOG.md` and `.env.example` when appropriate.
9. Do not implement online lesson payments.
10. Ask before making irreversible architectural decisions or deploying to production.

## Original kickoff brief (historical)

The public profile and local personalisation were subsequently authorised; the
current single-page scope above and implementation notes below supersede this
original dashboard-only brief.

> Read `README.md` in full. This product is **Calspot**, a white-label website and booking-request platform for independent coaches. Implement **Phase 1 only**: set up Next.js App Router, TypeScript and Tailwind, and build a polished, responsive, Apple-inspired coach dashboard prototype. Use a restrained lowercase `calspot.` wordmark for the platform UI. Prioritise overview, calendar, recurring availability, club and lesson management, and pending booking requests with approve/decline interactions. Use clearly labelled mock data and local-only state; do not connect Supabase, implement authentication, send real emails, build the public coach websites, or deploy. First inspect the repository and outline your proposed structure, then implement, run available checks and document local preview instructions. Preserve the white-label principle and do not invent a final logo, domain or trademark status.

## Local prototype — Phase 1

The coach dashboard now has a local-only implementation. No coach's details are bundled in the code: the app starts at **/signup**, and every dashboard and public page redirects there until a coach has signed up in that browser tab. Kelly-Jane Whalley is the first pilot coach and will sign up like any new coach.
No authentication, database, court booking,
email delivery or production services are connected. Profile, club, lesson, availability and booking-decision changes are shared across the dashboard and booking page
and are saved only in this browser tab’s session storage. The initial calendar opens on **23–29 November 2026** so the
sample schedule is consistent; “Demo week” returns to this period.

### Run locally

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
```

Open `http://localhost:3000`, which redirects to the dashboard. Stop the development server with Ctrl+C.

```sh
npm run lint
npm run typecheck
npm run build
```

For a production-mode **local** preview, run `npm run build` then `npm start`.
These commands do not deploy the application. No environment variables are needed.

### Structure

- `src/app/`: App Router routes (`/dashboard/*`, `/kelly-jane`, `/preview`), metadata, layout and the dashboard's design tokens in `globals.css`.
- `src/components/admin/`: dashboard shell, page components and shared context.
- `src/components/`: editors, calendar and shared UI primitives; `coach-site/` is the public template; `profile/` holds the profile editor and live preview.
- `src/lib/`: `mock-data.ts` (demo fixtures), `coach-workspace.ts` (shared store), `coach-theme.ts`, `availability.ts` (start-time calculation), `platform.ts` (prototype switches), `dates.ts`, `use-media.ts`.

### Prototype scope

- Overview of confirmed sessions and pending requests.
- Navigable week/month calendars, club filtering and session details.
- Create/edit/deactivate clubs and lesson types (60 or 90 minutes, indicative prices).
- Recurring weekly availability with effective dates; date-specific blocks and extras.
- Approve/decline requests locally and review status history.
- Mobile bottom tab bar, keyboard focus styling, modal keyboard handling and reduced motion.

See **Dashboard (admin)** below for the current routes, shell and editing flows.

Availability editing is a prototype, not a production slot generator. The public
form now derives illustrative start times from the coach's rules, exceptions and
bookings (see `src/lib/availability.ts`), but it does not enforce database-level
concurrency, apply booking-window constraints, convert appointment instants to UTC, or send notifications. The default
booking window and minimum notice are informational. Production scheduling, DST,
security, authentication and event logs remain later-phase work. Month view shows
bookings; availability shading is in week view. Blocking availability preserves
existing sessions. No user-facing data export is implemented in Phase 1.

### Verification

The initial implementation passed `npm run lint`, `npm run typecheck` and
`npm run build`. The build script uses Next.js's supported Webpack option because
Turbopack's internal build subprocess could not bind a port in this development
sandbox.

Local headless Chrome checks covered desktop calendar navigation, club and lesson
creation, recurring availability and blocked exceptions, request approval and
decline, mobile navigation at 390px, absence of page-wide overflow and closing a
modal with Escape. No browser page errors were reported. Desktop and mobile
screenshots were visually inspected. This is prototype verification, not a full
accessibility or production scheduling audit.

### Logo and dashboard palette

The dashboard and landing page use the wordmark SVGs from `public/logos/` through `src/components/logo.tsx` (`tone="light"` is the lime version for navy backgrounds). This asset choice does not imply trademark clearance or domain ownership.

The dashboard's primary colour is navy (`--accent` is `#0B1030`), with lime text on filled buttons and a pale blue tint for selection. Green, amber and red remain semantic booking-status colours. Tokens are centralised in `src/app/globals.css`; public coach branding remains independently configurable.

### First pilot coach

Kelly-Jane Whalley is the first real coach who will test Calspot. Her details are not stored in the repository; she enters them through the sign-up wizard, and nothing about her is fabricated. Her photograph and biography are entered or uploaded by her, and contact details, venues and branding need her approval.

## Personal coach booking page — local prototype

The current direction is **professional coach profile + simple booking requests,
all on one page**. There is no full website builder, extra marketing pages or
custom layout editor.

- Public booking page: `http://localhost:3000/kelly-jane`
- Dashboard: `http://localhost:3000/dashboard` → **My profile**, **Clubs**, **Lessons**, **Availability**
- Legacy `/kelly-jane/book` URLs redirect to the same page's booking section.
  Old `private`, `duo`, `group` links still select their matching lessons.

### Profile and photograph

The public presentation follows the supplied fashion-editorial reference: dominant name typography, a wide photograph directly beneath, minimal navigation and an open introduction/booking grid. There are no ecommerce features, extra pages or site-building controls. Removing a photograph shows a neutral portrait placeholder. Do not invent credentials, venues, testimonials or personal contact details for any coach.

On mobile the hero name wraps at smaller sizes, followed by the photograph and a concise introduction. Experience and locations expand in a native disclosure. Header and photo-caption booking links jump directly to the integrated flow. Contact options remain optional.

### Personalisation: looks and appearance

The public page is one template. Each coach's identity comes from configuration, never forked code. In the dashboard, **My profile → Page look** offers five whole-page looks (Studio, Journal, Clay split, Fresh court, Midnight bold). Each look bundles a hero layout, palette, accent, type pairing and corner style, with a small live preview of the coach's own name. A collapsed **Fine-tune** panel exposes the individual options:

| Option | Choices |
| --- | --- |
| Page style (hero) | Editorial (stacked name over a wide photo), Split (name beside a portrait), Full-bleed (name over the photo) |
| Colours | Studio, Clay, Court, Midnight, Sand |
| Accent | Match the palette, or one of ten vetted swatches |
| Type | Modern sans (Geist), Editorial serif (Instrument Serif + Geist), Bold condensed (Barlow Condensed + Geist) |
| Corners | Sharp, Soft, Rounded |

Accent text colour is chosen automatically for contrast. If an accent is too light to use for small text, it is used only as a fill and text stays in the palette's ink. Coaches see the button contrast ratio while choosing.

**Page content** (all optional): tagline, up to three highlights (headline plus detail) shown under the hero, up to two testimonials, a generic "Before you ask" FAQ and a "Powered by calspot." footer line (off by default, respecting the white-label rule). The testimonials section renders only when the coach has entered one, and the app never supplies testimonials. A photograph focus control keeps the face in frame when the image is cropped. An optional logo replaces the text header wordmark on the public page only.

Image inputs accept JPEG, PNG and WebP files up to 1 MB. Images are decoded before acceptance and kept as local data URLs; nothing is uploaded to a server. The Calspot dashboard retains its platform branding.

Existing club and lesson editors are reused. Active records appear on the profile and in booking choices; deactivated records disappear. If no active clubs or lessons remain, the page displays a helpful empty state.

All appearance values resolve to CSS tokens (`--coach-*`) in `src/lib/coach-theme.ts`. Coach-page fonts are bundled locally (`geist` and `@fontsource` packages); no external font requests are made from coach pages. Public content, highlights, FAQ and the sample week live in `src/components/coach-site/content.ts`. A single `publicCoach.demoMode` flag controls the prototype wording ("sample", "demo request", the preview bar and its dashboard link). Turning it off removes that wording once real availability and email are connected.

### Public page structure

- `site-shell.tsx`: theme tokens, header, footer, optional preview bar.
- `coach-hero.tsx`: the three hero layouts and the stacked name lockup, sized to fit the longest word.
- `sections.tsx`: highlights strip, testimonials and FAQ.
- `coach-profile-card.tsx`: biography, experience and clubs, with a native disclosure on narrow screens.
- `booking-form.tsx`: the three-step request flow with a persistent session summary, week navigation and per-day availability. Sample times are illustrative. Dates and the timezone label (GMT or BST) are formatted with `Intl`.

Responsive breakpoints are 820px and 560px. Headline entry and step transitions are subtle and are disabled under reduced-motion preferences.

### Local state and privacy

`src/lib/coach-workspace.ts` provides the shared, typed local demo workspace for
the profile, clubs, lessons, bookings, recurring availability and exceptions. Saved edits survive navigation and refresh in the
same tab via `sessionStorage` under `calspot:coach-workspace:v1`. They are not shared
with another browser/device, published, authenticated or stored in a database.
Malformed saved data falls back to defaults. If storage is unavailable/full,
edits still work in memory and the profile form reports that refresh will reset
them. This is prototype continuity, not a tenant/security boundary.

Player names, emails, phone numbers and request details typed into the public form
are **not** saved in this store. Demo requests still live only in the form's component
memory. They do not sync into the dashboard, reserve slots/courts, take payments or
send notifications. The fictional demo bookings, availability rules, exceptions and
approve/decline decisions in the dashboard are saved in the same per-tab store, so
availability changes show on the public page immediately and reset when the tab closes.

To reset profile, club, lesson and availability customisations, close the tab or remove
`calspot:coach-workspace:v1` from this origin's session storage and reload.

### Dashboard (admin)

The dashboard follows the same principles as the public template: fewer decisions, clearer hierarchy and the same readable sizes.

- **Routes:** `/` redirects to `/dashboard`, which opens on **Requests** when something is pending and **Overview** otherwise. Each section has a real URL: `/dashboard/overview`, `requests`, `calendar`, `availability`, `clubs`, `lessons`, `profile` (`?tab=appearance` opens a tab). Browser Back, refresh and deep links work.
- **Shell:** one identity card (coach photo as avatar, current look name), one demo indicator driven by `platform.demoMode`, a prominent **View my page** button and **Copy link**. On phones the hamburger is replaced by a bottom tab bar (Requests with a pending count, Calendar, Availability, My profile, More).
- **Overview:** one "needs attention" card, confirmed sessions this week, a booking-page card (link, look, copy) and a "Finish setting up" checklist that disappears when complete.
- **Requests:** requested-ago text and a warning when approving would overlap a confirmed session.
- **Calendar:** phones default to a day-by-day **Agenda** view; Week and Month remain. The zone label comes from the date (GMT or BST).
- **Availability:** a weekly editor (one row per day with time chips, **Add time**, **Copy to…** other days), **Block a date**, and a **What players see** panel that shows the start times the public form will offer, for a chosen lesson. Availability rules can apply to **All lessons**.
- **Clubs and Lessons:** compact lists with an "On my page" switch and, for lessons, up/down ordering. Lesson descriptions and club notes now appear on the public page.
- **My profile:** **Profile**, **Appearance** and **Contact** tabs, a live preview of the unsaved draft (an iframe of the real page at `/preview`, with Desktop and Phone widths; on narrow screens a full-screen Preview sheet), and a sticky save bar with Discard and an unsaved-changes browser warning.

**Design tokens.** `globals.css` defines shared tokens (`--text-2`, `--border-strong`, `--surface-2`, radius, spacing and `--tap`). Readable text is at least 13px; the calendar's compact meta text is 12px. Interactive control borders use `--border-strong` for non-text contrast. Primary actions are 44px high on phones. Small switches and reorder arrows have enlarged hit areas.

### Coach sign-up (prototype)

`/signup` is a guided six-step flow that creates a coach's page in about three minutes: **You** (photo, name, what you coach, area), **Your story** (tagline, introduction, experience), **Your look** (the five look presets with the coach's own name), **Clubs & lessons** (one club and starter lessons with editable length and guide price), **Your week** (days and hours, applied to the club and all lessons) and **Review**. A live preview of the real public page, in Desktop and Phone widths or a full-screen sheet on narrow screens, updates as the coach answers. Each step validates inline, moves focus to the step heading and has Back and Continue. **Create my page** replaces the tab's workspace with the new coach's data (no demo bookings), saves it in session storage and opens the dashboard Overview, where the setup checklist shows what is left.

It is prototype-only: no account, email or hosting is created, and the public page still lives at the single pilot route. The dashboard sidebar links to it ("Preview the sign-up flow") while `platform.demoMode` is on. The wizard reuses the look presets, `AssetInput`, `PreviewFrame` and the availability model.

### Prototype gap fixes

- **Server rendering seam.** `src/lib/tenant.ts` (`getTenantWorkspace`) is where Supabase will resolve a coach from the hostname. For now it returns the bundled pilot workspace. The public page uses it for `generateMetadata` (title, description, Open Graph image) and Person structured data, so the HTML is meaningful before JavaScript runs. Pages stay `noindex` while the app is a prototype. Pure model, defaults and validation moved to `src/lib/workspace-model.ts` so server code can import them; `coach-workspace.ts` keeps the client store and re-exports the model.
- **Legal pages.** Draft `/kelly-jane/privacy` and `/kelly-jane/terms`, linked from the page footer, in the coach's chosen look. They carry a visible "Draft for legal review" notice and `[bracketed]` placeholders. They are not legal advice and must be completed and reviewed before launch.
- **Logo variants.** An optional "Logo for dark looks" is used on the Midnight look. Without one, the coach's name is shown as text so a dark logo never disappears.
- **Request inbox.** Requests use a list-and-detail layout on wide screens (cards on narrow ones). The detail view has an optional note to the player, a **Suggest another time** menu built from the coach's real availability (approve is disabled while a suggestion is chosen, so the action is decline and suggest), an overlap badge and warning, and the offered time in booking history. Nothing is emailed.
- **Unsaved changes.** Leaving My profile through any in-app link (sidebar, tab bar, View my page, sign-up) asks to stay or discard. A browser warning covers reload and close.

### WhatsApp (click-to-chat)

Coaches mostly talk to their clients on WhatsApp, so it is the primary way to follow up, with email as a fallback and record. This uses **click-to-chat `wa.me` links only**: a link opens a chat with the message already typed in, and the person presses Send in their own WhatsApp. Calspot sends nothing, uses no WhatsApp API and stores no chats. This replaces the earlier "unsent preview, no external chat launches" decision.

**Player to coach** (only when the coach has saved a valid number in My profile → Contact):
- A **Message on WhatsApp** button beside the main call to action in every hero layout, and in the coach's contact links.
- The request form defaults to WhatsApp as the contact preference and asks for the player's number.
- After a request, **Send to {coach} on WhatsApp** opens a chat with the lesson, club, time and the player's note ready to send.

**Coach to player** (needs the player's number, which sample bookings now carry as fictional numbers in the reserved UK drama range):
- On a pending request, **Open WhatsApp with a draft message** is ticked by default. **Approve**, **Decline** and **Decline and suggest time** record the decision in the dashboard and open the right draft. A personal line can be added and appears under the template text.
- On decided requests: **Send a reminder** and **Resend confirmation** (confirmed), or **Message** about a decline or suggested time.
- Overview shows a **Tomorrow** list with a one-tap **Send reminder** for each session.
- Drafts come from four editable templates (approved, declined, suggest another time, reminder) in My profile → Contact, with {first}, {name}, {lesson}, {club}, {date}, {time}, {suggestion} and {coach} and a live example. Coaches can still edit any draft inside WhatsApp before sending.

**Limits.** Calspot cannot see replies typed in WhatsApp, so the dashboard stays the record and **approve and message** is a single action. A coach's number is public once saved. UK-style numbers starting 0 are treated as +44. Helpers are in `src/lib/whatsapp.ts` and `src/components/admin/whatsapp-drafts.ts`.

**Later (Phase B).** Automated messages, such as an alert to the coach when a request arrives, would need the WhatsApp Business API: Meta business verification, approved message templates, per-message costs and explicit opt-in, sent from a platform number. Replies inside Calspot would be a larger two-way inbox build. Neither is planned for the MVP; check Meta's current pricing and policies first.

### Curated public-page palettes

| Palette | Direction |
| --- | --- |
| Studio (default) | Off-white, charcoal, electric blue |
| Clay | Warm cream, dark brown, terracotta |
| Court | Muted sage, deep green, lime |
| Midnight | Dark charcoal, warm white, ice blue |
| Sand | Beige, dark brown, muted bronze |

Palettes, accents, type pairings, corner styles and looks are defined in `src/lib/coach-theme.ts`. The saved profile stores only validated IDs. Older drafts without appearance fields, or with a legacy palette ID or arbitrary accent, keep their content and migrate to valid defaults (an old palette is preserved when valid). Interactive controls use a stronger border colour than decorative hairlines so they meet non-text contrast guidance. Uploaded photographs retain their original colours.

### Verification

Lint, strict TypeScript and the production build pass. Local headless-Chrome checks covered:

- Four looks (Studio, Midnight bold, Clay split, Journal) at 1440px and 390px, with no page errors and no horizontal overflow.
- The full request flow: lesson, week navigation, day and time, details, confirmation.
- Choosing a look in My profile, saving, and seeing it applied on the public page.

Findings from that pass were fixed: the dashboard's global `main` offset leaked into the public page, and button text colour was overridden by link styles. Screenshots were inspected visually. A mobile sticky "Request a session" bar was prototyped and removed because the mobile layout leaves no scroll range where it would be useful; the header button covers that need. This is prototype verification, not a full accessibility audit. Player details remain outside session storage. No services were connected or deployed.

### Not yet built (historical, from the local prototype)

- Drag-and-drop ordering of lessons (up/down buttons are used). The unsaved-changes prompt covers in-app links and reloads, not the browser Back button.
- Production slot generation, booking window and minimum notice. The availability the public page shows is illustrative.
- Real sign-up: accounts, email verification, authentication, subdomains and publishing. The wizard below is a local prototype only.
- Real tenant data on the server. The public page is server-rendered from the bundled pilot data (see below), but dashboard edits live in the browser tab, so an edited page can briefly show the pilot defaults first.
- Solicitor-reviewed legal text. Draft Privacy and Terms pages exist but are placeholders.

## Next steps

1. **Stripe billing** for £29 a month, started when a trial ends. Until then an admin moves coaches to Paid by hand in `/admin`.
2. **Email notifications** (Resend or Postmark): a coach is told when a request arrives, a player when it is answered, and a coach before their trial ends.
3. **Legal review.** Complete the `[square bracket]` placeholders in `src/components/legal/calspot-legal.tsx` and the per-coach drafts in `src/components/coach-site/legal-content.ts`, then have a solicitor check them.
4. **Content for the landing page.** Real coach testimonials (add to `quotes` in `src/components/landing/landing.tsx`), the FAQ answers about what happens after the trial and how players pay, and a photo for step 2.
5. **Pilot.** Have Kelly-Jane sign up like any coach, test on her phone and gather feedback before onboarding more coaches.

## Source control and deployment

Repository: https://github.com/stmsmediauk/calspot

`main` deploys automatically to Vercel (project `calspot`). Push to `main` to release. Environment files and build output are git-ignored.

## Current state

### Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev                  # http://localhost:3000
npm run lint && npm run build
```

### Environment variables

Set these in `.env.local` and in Vercel (Project Settings, Environment Variables).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project. Required. |
| `NEXT_PUBLIC_SITE_URL` | The public address (for example `https://calspot.co.uk`). Used for canonical links, the sitemap and share images. Falls back to the Vercel production URL. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional. Turns on a Cloudflare Turnstile CAPTCHA on the booking form. |

Supabase Auth, URL Configuration: the Site URL and redirect URLs must include the live address and `http://localhost:3000/**`.

### SQL to run in the Supabase SQL editor

Tables, row-level security and the booking function were applied as migrations. The admin, spam and trial functions are plain SQL files you run once, in this order (each is safe to run again):

1. `supabase/admin_delete_coach.sql` lets an admin delete a coach.
2. `supabase/admin_tools.sql` adds suspend, plans, activity and spam clean-up.
3. `supabase/admin_support_view.sql` adds the admin support view (setup and counts, no player details).
4. `supabase/spam_limits.sql` adds database-level limits on booking requests.
5. `supabase/trial.sql` adds the 14-day free trial.
6. `supabase/group_sessions.sql` adds lesson capacity and group booking. **Run it before deploying the code that saves `capacity` on lessons**, or saving lessons will fail.
7. `supabase/playtomic_courts.sql` adds the club Playtomic link and the "Court booked" tick. **Run it before deploying the code that saves them**, or saving clubs and requests will fail.
8. `supabase/calendar_feed.sql` adds the private calendar link. **Run it before deploying the code that shows "Sync to your calendar"**, or that panel will show an error.
9. `supabase/repeat_lessons.sql` adds weekly repeat bookings. **Run it before deploying the code that offers "Repeat weekly"**. It replaces `request_booking` with a version that has one extra optional argument (a transaction drops the old one, so it is never missing), and adds `request_booking_series`. After running it, you can run `supabase/repeat_lessons_test.sql`: it ends in an error on purpose so nothing is saved, and the message tells you whether each check passed.
10. `supabase/demo_coach.sql` is optional: it adds `seed_demo_coach(email)`, which builds a fictional demo coach at `/demo` (never indexed or listed in the sitemap). Create a separate login for it in Supabase Authentication first, then run `select public.seed_demo_coach('that-email');`. Run the select again to reset it before a demo.

The app tolerates a missing file (the related feature just stays off), so deploys do not break if one has not been run yet.

### Routes

| Route | What it is |
| --- | --- |
| `/` | Landing page. A name typed here is passed to sign-up as `?slug=&name=`. |
| `/signup`, `/login`, `/forgot-password`, `/reset-password` | Accounts. |
| `/onboarding` | The page-building wizard, shown after the first sign-up. |
| `/dashboard/*` | The coach dashboard. |
| `/admin` | Master admin. Only for users in `platform_admins`. |
| `/privacy`, `/terms` | Calspot's own legal pages (drafts). |
| `/<address>` | A coach's public page, with `/<address>/privacy` and `/<address>/terms`. |
| `/api/book` | Receives booking requests and filters spam. |
| `/sitemap.xml`, `/robots.txt` | Search engine files. |

### Public pages and booking requests

- A coach's page lives at `/<their-address>` and is served from Supabase using the public key, so row-level security decides what is visible (`src/lib/tenant.ts`). It stays hidden until the coach presses **Publish my page**. An admin can unpublish or suspend it.
- Players send requests through `/api/book`, which calls the `request_booking` database function. That function checks the time against the coach's real availability, blocked days and existing requests (including lesson length) and limits one email to three waiting requests. The public page only ever receives busy times from `booked_times`, never player details.
- Requests appear in the coach's Requests screen. **No emails are sent yet**; coaches reply by WhatsApp or their own email.
- Spam protection, in layers: a hidden field, a minimum fill-in time, a per-IP limit, an optional Turnstile CAPTCHA, and database limits (30 an hour per coach, 5 a day per email and per phone number).
- Reserved page addresses (such as `admin`, `login`, `privacy`) are blocked at sign-up by `slug_available`.

### Checking courts on Playtomic

Many clubs take court bookings through Playtomic. A coach can paste the club's Playtomic page into **Clubs → Playtomic page**. Each request then shows **Check court on Playtomic**, which opens that page in a new tab, and a **Court booked** tick the coach uses as their own reminder. Only links on `playtomic.com` or `playtomic.io` are accepted (`src/lib/playtomic.ts`).

Calspot never reads from or writes to Playtomic, holds no courts and cannot see whether the tick is true. A request is still not a confirmed court reservation, and the coach must verify court availability themselves.

### Repeat lessons

On the request form a player can choose **Repeat weekly**: the same day, time, club and lesson for up to 4 weeks. Only weeks that are actually free are offered, and the database checks every week again. **All or nothing:** if any week is unavailable, nothing is requested and the player is told which week failed (`request_booking_series`).

Each week is its own booking row, linked by `series_id`. A series counts as one waiting request towards the limit of 3 per player, but each week still counts towards the 5-an-hour/day limits, so a player cannot send a second 4-week series on the same day. In the dashboard the weeks show together ("Week 2 of 4"). The coach can **approve all or decline all** waiting weeks in one go (one WhatsApp draft covers them, and it is blocked if any week overlaps a confirmed session), or approve, decline and tick off each week on its own. A coach can also **repeat a confirmed booking** for up to 3 more weeks from its details; every week must be inside their availability and free, or none are added, and they are confirmed straight away.

### Calendar sync

**Calendar → Sync to your calendar** gives a coach a private link they subscribe to in Apple Calendar, Google Calendar or Outlook. It is a one-way feed (`/api/calendar/<token>.ics`, built in `src/lib/ics.ts`) of confirmed sessions, showing first name, lesson, club, time and whether the court is ticked as booked. It never includes emails, phone numbers or messages. The token lives in `coach_calendar_tokens`, not on `coaches` (coach rows are readable once a page is published), and a coach can make a new link to cut off old copies. Calendar apps refresh on their own schedule: Apple within about an hour, Google can take several. Two-way Google sync and reading a coach's busy times back in are not built.

### Group sessions

- A lesson has **Players per session** (`capacity`): 1 private, 2 duo, 4 small group, 12 americano. Price is per person. Lesson length can be 60, 90 or 120 minutes.
- A request takes one or more **spaces** (`bookings.spaces`). Players share a session only when the lesson, club, date and start time match. Any other overlap with a pending or confirmed request still blocks the time. A session closes when its spaces are used.
- `request_booking` takes a per-coach, per-date advisory lock and counts spaces itself, so two players cannot take the last space. This replaces the old unique index `bookings_one_live_per_slot`, which `group_sessions.sql` drops.
- `booked_times` also returns the lesson and spaces so the public page can show "5 left". It still returns no player details.
- The booking form offers "How many spaces?" for group lessons. The dashboard shows spaces on each request and "N of M confirmed", and no longer warns about a clash between players in the same session.
- **Not built yet:** fixed-date sessions (one-off or weekly events such as an americano night), attendee lists and a message-everyone action, a minimum number of players, and a waiting list. For now a group lesson uses the coach's normal availability windows.
- The app sends `p_spaces` only for group bookings, so one-to-one requests keep working before the SQL has been run.

### SEO and share images

- Published coach pages are indexable. Each has its own title, description, canonical link and JSON-LD (a `Person` with their lessons as offers).
- `src/app/[slug]/opengraph-image.tsx` (and `twitter-image.tsx`) draws a share image per coach from their name, title, location, tagline, photo and look. The landing page has its own in `src/app/opengraph-image.tsx`. Share images can only use JPEG or PNG photos; uploads are converted automatically.
- `/sitemap.xml` lists the landing page, the legal pages and every live coach page. `/robots.txt` keeps the dashboard, admin, auth and API routes out of search.

### Free trial and plans

- A new coach gets `trial_ends_at` 14 days after sign-up, with no card. `billing_status` is `trial`, `paid`, `free` or `overdue`.
- A coach is active when paid or free, or on a trial that has not ended. An expired trial or an overdue plan pauses the page: it returns 404, players cannot send requests, and it leaves the sitemap. Nothing is deleted and the dashboard still opens, with a banner explaining.
- Coaches cannot change their own plan or trial; the database blocks it. Admins set the plan and can extend a trial by 14 days in `/admin`.
- There is no billing yet. Until Stripe is added, move a paying coach to **Paid** in `/admin`.

### Brand assets and icons

- `public/logos/`: wordmarks, icon tiles and icon grids in navy, lime, blue and white. Use the file that matches the background.
- `src/app/icon.svg`, `src/app/apple-icon.png`, `public/favicon.ico`, `public/icon-192.png`, `public/icon-512.png` and `public/site.webmanifest`: browser, home-screen and app icons. Theme colour is `#0B1030`.
- `public/og-image.png`: the share image, served by `src/app/opengraph-image.tsx`. Coach pages keep their own per-coach share images.
- Headings and buttons use `--cs-font-display` (Bricolage Grotesque). Elements inside `[data-coach-site]` are excluded so coach pages keep their chosen type.
- An earlier trial copy of the Altair font was dropped because of its non-commercial licence. Keep any trial or unlicensed fonts out of the repo (`/fonts-source/` is git-ignored).

### Master admin (`/admin`)

Overview with totals and a Needs attention list, a coach list with search, CSV export and filters, and a page per coach with: plan, extend trial, view page, publish or unpublish, suspend, clear waiting requests, delete, and a support view. The admin never sees player names, emails, phone numbers or messages. To make someone an admin, add their user id to `platform_admins` in Supabase.

### Landing page

`src/components/landing/` holds the page, built from `calspot-handoff/design-reference.html` (kept in the repo for reference). Colours and type come from the brand tokens above. The five looks in "Make it look like you" are drawn from the real presets in `src/lib/coach-theme.ts`. The testimonials section stays hidden until real quotes are added.

### Known gaps

- No email, no billing, no CAPTCHA unless Turnstile keys are set.
- Calspot's legal pages contain placeholders and are drafts.
- Coach pages live at `calspot.../<address>`; per-coach subdomains and custom domains are not built.
- The old `taken_slots` database function is unused and can be dropped.
- Group sessions use the coach's availability windows. Fixed-date events, attendee lists and a waiting list are not built.
