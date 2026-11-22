# Calspot

> **Calspot** — *Your coaching. All in one spot.* A premium, minimal, white-label website and booking-request platform for independent padel coaches.

## Brand and product identity

- **Product name:** Calspot (working brand; final trademark clearance pending).
- **Wordmark direction:** lowercase `calspot.` with a restrained, typography-first identity.
- **Tagline:** Your coaching. All in one spot.
- **Product descriptor:** Websites · Bookings · Calendar.
- **Visual language:** bright white, subtle warm-grey surfaces, fine neutral borders, excellent spacing, contemporary sans-serif typography (Geist or Inter), restrained transitions.
- **White-label rule:** Calspot is the platform brand, not a forced visible brand on coaches’ public websites.
- **Brand decisions pending:** final logo, accent colour, registered domain and trademark clearance. Do not assume any domain is owned or configured.

## Project status

**Planning / initial build.** This README is the source of truth for the first Codex session. There is no existing implementation assumed. Build incrementally; do not claim features are complete until implemented and tested.

## Product vision

One centrally maintained application serves multiple independent coaches. Each coach has a branded public website and a simple, mobile-friendly admin dashboard to manage clubs, lessons, availability and booking requests. Players request sessions without creating accounts; **every request must be approved by the coach**. No online lesson payments, club booking integrations, player accounts or complex CRM in the MVP.

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

### Public website

- Home: photographic hero, coach introduction, coaching options, venues, testimonials and clear booking CTA.
- About: coach biography, experience, qualifications, images.
- Coaching: lesson types, descriptions, durations and optional **indicative** prices.
- Book: choose club, lesson type, date/time and submit request.
- Contact: email, WhatsApp link, social links and enquiry form.
- Legal: privacy, terms and cancellation policy content.
- Tenant-specific SEO metadata, logo, favicon, imagery, colours and content.
- Coach-specific subdomains initially; design for custom domains later.

### Coach dashboard

- Overview: upcoming sessions and pending requests.
- Calendar: week/month views, availability and booking statuses.
- Clubs: create/edit/deactivate venues with address and notes.
- Lessons: create/edit/deactivate types, durations and indicative prices.
- Availability: recurring weekly rules, one-off extra slots, blocked dates and holidays.
- Requests: approve/decline pending bookings and review confirmed bookings.
- Website: edit biography, text, images, contact links and brand accent.
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

**Light, minimal, Apple-inspired.** Public sites are editorial and photography-led; the dashboard is quieter and utility-focused.

- Background: `#FFFFFF`; secondary surface: `#F8F9FA`.
- Text: `#171717`; borders: `#EAEAEA`.
- Typeface: Geist or Inter.
- Generous whitespace, consistent spacing, precise alignment.
- Subtle 1px borders; avoid heavy shadows, gradients, glassmorphism and decorative clutter.
- Restrained black primary buttons and accessible focus states.
- Lucide icons, subtle 150–250ms transitions; respect reduced-motion preferences.
- Public website may use each coach's brand accent and imagery; **dashboard remains consistent** across tenants.
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
- Custom visual page builders or fully bespoke layouts per coach.
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

### Phase 4 — Public white-label website and notifications

Build reusable public pages, branding configuration, SEO, booking form, email outbox and transactional notifications.

**Done when:** two coach sites have distinct branding/content while sharing the same code.

### Phase 5 — Master admin and data portability

Implement tenant onboarding, subdomains, account status, self-service exports and basic platform support tools.

**Done when:** a new coach can be provisioned without a new codebase or deployment and can export their own data.

### Phase 6 — Production readiness and pilot

Accessibility, security, email deliverability, DST/concurrency tests, monitoring, backup/restore, documentation and 2–3 pilot coaches.

**Done when:** critical flows are tested and operational recovery procedures are verified before accepting paid customers.

## MVP acceptance tests

- [ ] Coach logs in and edits their own website details.
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
3. **Start with Phase 1 only.** Propose the file structure and implementation steps, then build the dashboard prototype using mock data.
4. Do not connect Supabase, email providers, domains or production services until requested.
5. Prefer small, reviewable changes with clear component boundaries, strict TypeScript and no unnecessary dependencies.
6. Run available lint/typecheck/tests after each meaningful implementation step and report results accurately.
7. Keep mock data explicitly labelled; never imply bookings or notifications are real before integration.
8. Update this README when decisions change; maintain a concise `CHANGELOG.md` and `.env.example` when appropriate.
9. Do not implement online lesson payments.
10. Ask before making irreversible architectural decisions or deploying to production.

## First task for Codex

> Read `README.md` in full. This product is **Calspot**, a white-label website and booking-request platform for independent coaches. Implement **Phase 1 only**: set up Next.js App Router, TypeScript and Tailwind, and build a polished, responsive, Apple-inspired coach dashboard prototype. Use a restrained lowercase `calspot.` wordmark for the platform UI. Prioritise overview, calendar, recurring availability, club and lesson management, and pending booking requests with approve/decline interactions. Use clearly labelled mock data and local-only state; do not connect Supabase, implement authentication, send real emails, build the public coach websites, or deploy. First inspect the repository and outline your proposed structure, then implement, run available checks and document local preview instructions. Preserve the white-label principle and do not invent a final logo, domain or trademark status.

## Local prototype — Phase 1

The coach dashboard now has a local-only implementation. The first pilot coach is **Kelly-Jane Whalley**, as supplied by the project owner.
All player details, clubs, lessons and sessions are fictional. No authentication, database, court booking,
email delivery or production services are connected. Changes live in React state
and reset on refresh. The initial calendar opens on **23–29 November 2026** so the
sample schedule is consistent; “Demo week” returns to this period.

### Run locally

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Stop the development server with Ctrl+C.

```sh
npm run lint
npm run typecheck
npm run build
```

For a production-mode **local** preview, run `npm run build` then `npm start`.
These commands do not deploy the application. No environment variables are needed.

### Structure

- `src/app/`: App Router page, metadata, layout and responsive design tokens/styles.
- `src/components/`: client dashboard, editors and shared UI primitives.
- `src/lib/mock-data.ts`: typed demo fixtures and local date helpers.

### Prototype scope

- Overview of confirmed sessions and pending requests.
- Navigable week/month calendars, club filtering and session details.
- Create/edit/deactivate clubs and lesson types (60 or 90 minutes, indicative prices).
- Recurring weekly availability with effective dates; date-specific blocks and extras.
- Approve/decline requests locally and review status history.
- Mobile navigation, keyboard focus styling, modal keyboard handling and reduced motion.

Availability editing is a visual prototype, not a production slot generator. It does
not enforce overlap/concurrency, generate bookable slots, apply booking-window
constraints, convert appointment instants to UTC, or send notifications. The default
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

### Supplied logo

The dashboard uses the supplied `Calspot Blue Ring Logo.png` artwork, served from
`public/brand/calspot-logo.png` through a reusable logo component. The original file
is preserved. Its surrounding whitespace is framed with CSS without stretching the
artwork. This asset choice does not imply trademark clearance or domain ownership.

### Dashboard palette

The prototype now uses the supplied logo's electric blue (`#0038FC`) for primary
actions, selection and keyboard focus, with pale blue supporting surfaces, white,
black and neutral greys. This supersedes the initial black-button direction above.
Green, amber and red remain semantic booking-status colours. Accent tokens are
centralised in `src/app/globals.css`; public coach branding remains independently
configurable in later phases.

The dashboard's visual refinement uses system-first typography (Geist fallback),
soft off-white canvas, white panels, subtle borders and more rounded controls.
Logo blue remains an accent for actions and key selections; navigation and
segmented controls use quieter neutral selection surfaces.


### First pilot coach

Kelly-Jane Whalley is the first real coach who will test Calspot. Her name is shared
through `coachProfile` in `src/lib/mock-data.ts`. Demo players, venues, lessons and
bookings are fictional and are not claims about her business. Use her identity for
the public mini-site prototype; her biography, qualifications, photography,
contact details, venues and personal branding still need to be supplied or verified.

## Booking-focused coach mini-site

The public design has been simplified to a one-page mini-site at the owner's
request, before backend integration. Backend phases remain pending.

- Mini-site and inline request flow: `http://localhost:3000/kelly-jane`
- Dashboard: `http://localhost:3000/`
- Existing `/kelly-jane/book` links redirect to the mini-site's booking section;
  valid `?lesson=private`, `duo` or `group` selections are preserved.

Run `npm run dev` as above. The dashboard includes a “View coach site” link.

### One-page experience

The mini-site now contains a short introduction, a small coach card and the
three-step request form directly on the page. On mobile the request form comes
first, with WhatsApp accessible in the header. The longer about, lesson marketing,
venue, how-it-works and FAQ sections have been removed. Lesson formats, duration,
indicative prices and club choices are contained in the request flow. Coach approval
and separate court arrangements are explained beside it.

Kelly-Jane's name is real and supplied by the owner. Her portrait, short biography,
branding, venues and commercial details still need her approval. Sessions, prices,
dates and venues remain explicitly fictional sample content. No credentials or
testimonials have been invented. The mini-site uses a proposed muted blue-grey
accent and coach identity, without requiring Calspot branding.

### WhatsApp in the prototype

- “Ask on WhatsApp” previews a short enquiry before choosing a session.
- Players can select email or WhatsApp as their preferred request contact method.
  Email remains required; choosing WhatsApp additionally requires a phone number.
- The local confirmation includes a WhatsApp follow-up draft with the selected
  lesson, venue, date, time and player name.
- Message drafts can be copied manually. Native dialogs support Escape, keyboard
  focus and closing back to their trigger.

**No WhatsApp number has been supplied.** These are clearly labelled previews, with
no external messaging links, WhatsApp API, outgoing messages or automatic
notifications. Contact preferences and player details stay in component memory.
A chat or enquiry does not create an approved lesson or reserve a court. A real
coach contact field and user-initiated chat link can be added once contact details
are provided; automated messaging is not part of this prototype.

### Local request behaviour

Sample dates are fixed to 23–28 November 2026 in Europe/London. The form requires a
time before continuing, validates name/email and conditionally requires a WhatsApp
number, then displays a local pending-approval confirmation. The flow can be reset.
Nothing is persisted or sent, and the public demo does not sync with dashboard
state. Details disappear on refresh or navigation away. No authentication, real
availability, slot holds, payments or court reservations are implemented. Both
public routes remain non-indexable via the destination page's no-index metadata.

The reusable shell, inline request form, WhatsApp preview and content configuration
live in `src/components/coach-site/`, with scoped styles. A coach setup editor,
approved contact/legal content and backend integration remain future work.

### Concept image

Final web asset: `public/coach/court-editorial.webp` (1536 × 1024, approximately
336 KB). Created with the built-in ImageGen tool, then encoded as WebP for local
use. It is labelled concept imagery and does not depict a verified coaching venue.
No portrait of Kelly-Jane has been generated.

Final image-generation prompt:

> Use case: photorealistic-natural. Asset type: premium padel coaching website hero,
> wide landscape editorial photograph, 3:2 aspect. Subject: an empty real-looking
> outdoor padel court with deep muted blue playing surface, crisp white lines, black
> fine mesh and glass walls, a padel racket and two yellow balls resting near the net
> in the foreground. Composition: low courtside angle, net receding diagonally to
> upper right, restrained architectural geometry, distant trees softly out of focus.
> Natural late-afternoon sunlight and beautiful soft shadows. Premium understated
> sports magazine photography, tactile realistic surfaces, calm and inviting, subtle
> film grain. No people, no text, no logos, no watermark, no invented venue signage.
> This is illustrative concept imagery, not a specific real venue.

### Mini-site verification

Lint, strict TypeScript and production build pass. Local headless Chrome checks
covered desktop and 390px mobile layouts, inline requests, WhatsApp preview and
Escape/close, required number validation for WhatsApp, email requests without a
phone, follow-up message content, reset, old booking-link redirects and the
existing dashboard. No browser page errors, external requests or page-wide mobile
overflow were reported. Desktop, mobile and WhatsApp dialog screenshots were
visually inspected. No services were connected or deployed.

## Source control

Repository: https://github.com/stmsmediauk/calspot

The local project tracks `main` with `origin` pointing to this repository. Commit
source changes and push them to save progress; pushing source does not deploy the
application. Dependencies, build output, environment files and TypeScript caches
are excluded by `.gitignore`. No deployment workflow is configured.
