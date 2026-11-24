# Future updates

## Launch checklist (switching to the live domain)

Do these together when the site moves off vercel.app.

1. **Commit and push the SEO prep.** It is written and tested but deliberately left uncommitted until launch: root metadata `robots`, `src/lib/site.ts` (`isIndexable`), `src/proxy.ts` (`X-Robots-Tag`), `src/app/page.tsx` (title, description, JSON-LD), `src/components/landing/landing.tsx` (padel copy, tennis/pickleball FAQ) and `.env.example`. Don't let a blanket `git add` include these earlier by accident.
2. **Vercel environment variables:** set `NEXT_PUBLIC_SITE_URL` to the live domain and `NEXT_PUBLIC_INDEXABLE` to `true`. Leave `NEXT_PUBLIC_INDEXABLE` unset (or `false`) until then.
3. **Make public coach pages follow the indexing switch.** They currently set `robots: index, follow` themselves, which overrides the site-wide noindex while indexing is off (the `X-Robots-Tag` header covers it for now).
4. **Supabase auth URLs:** Site URL to the live domain, and add `https://<domain>/**` to the redirect URLs, so confirmation and password-reset emails work.
5. **Same Supabase project** on the live deployment, so testers' data carries over. Testers will need to log in again (sessions are per domain).
6. **Redirect the old vercel.app address** to the new domain if links have been shared.
7. **Check testers' trial dates** before switching, so nobody's page is paused.
8. **Optional:** add a PNG/JPG version of the logo for the Organization structured data (Google prefers raster logos over SVG).
9. **Founding offer:** turn it off from `/admin` → Site settings when the 25 places are gone. Billing isn't built yet, so nothing enforces the £19 price or the cap.

Ideas that are planned but not started. Move an item to the changelog once it ships.

## Coach billing with Stripe

Parked 23 Nov 2026. Coaches pay Calspot a monthly subscription through Stripe. Coach billing only: players keep paying coaches directly, so there's no Stripe Connect and no booking fees. Do this after testers have proven the main flow and before opening to more coaches.

**Decisions made**
- Prices are **VAT-inclusive**: £29/month standard, £19/month founding. STMS Media LTD is VAT-registered.
- Use the **existing Stripe account** (STMS Media LTD), with Calspot kept separate by its own products, prices, restricted key and webhook.
- Founding places are **reserved at sign-up** and locked in at first payment. A place is released if the trial ends unpaid.
- **7 days' grace** after a failed payment before a page pauses.

**Stripe dashboard setup (test mode first)**
- Product with two monthly GBP prices (£29, £19), both VAT-inclusive. Turn on Stripe Tax with the VAT registration (check its current fee).
- Public business name, statement descriptor "CALSPOT", branding. Customer billing portal on.
- Restricted API key and a webhook endpoint. Keys go in Vercel as server-only environment variables.

**Database (new SQL file to run in Supabase)**
- On `coaches`: Stripe customer ID, subscription ID, `founding_number` (1 to 25, unique), subscription status, period end.
- Table of processed webhook event IDs, so events can't apply twice.
- A locked function to hand out founding numbers, so two sign-ups can't both take place 25.

**App**
- Checkout session endpoint: founding price if the coach has a founding number, otherwise standard. No charge until their free trial ends.
- Customer portal endpoint ("Manage billing").
- Webhook endpoint that verifies Stripe's signature and sets `billing_status` automatically. Keep the manual plan override in `/admin` (for example "free" for testers).
- Trial banner "Email us to carry on" becomes "Add payment"; add a billing card to the dashboard; show subscription state and founding place in `/admin`.
- Founding offer switches itself off when places run out, with the admin switch kept as an override. Optionally show places remaining on the landing page.
- Failed payments: rely on Stripe's retries, keep the page live for 7 days, pause only once the grace period ends.

**Legal and copy**
- Terms and privacy: billing, Stripe as payment processor, cancellation and refunds, and "Calspot is a trading name of STMS Media LTD" with company number and registered address.
- Add "inc. VAT" wherever prices appear: landing page, pricing card, FAQ, meta description, JSON-LD.

**Testing:** Stripe test mode and test clocks for trial end, successful and failed payment, cancellation and the 25th founding place.

## Players page and coach admin

Parked 23 Nov 2026. Give coaches player-level admin in the dashboard.

**Phase 1: Players page (no database change)**
- New dashboard page built from existing booking requests, grouped by player.
- List: name, sessions confirmed, pending and declined, last booked, next session, estimated spend, favourite lesson.
- Search, plus filters for Regulars, New this month and Not seen for 60+ days.
- Player detail panel: booking history, contact details, WhatsApp link using the existing templates.
- Matching: same email (case-insensitive), then same normalised phone. Never merge on name alone.
- Overview stats: sessions this week and month, estimated income, busiest day, top three regulars, players who haven't been back.
- Income is an estimate (lesson price × spaces on confirmed bookings) and must be labelled as one, because the app doesn't handle payments.
- Limit: friends' names exist only in the request message text, so guests can't be counted as players.

**Phase 2: Coach notes (needs a database change)**
- `player_notes` table keyed by coach and player email, with row-level security. A new SQL file in `supabase/` that must be run before deploying.
- Free-text notes and optional tags.

**Optional: paid tracking**
- A paid toggle per session, so income figures are real rather than estimated. Same kind of database change as notes.

**Open decisions**
1. Phase 1 only first, or notes in the same go?
2. Show estimated income, given payments happen outside the app?
3. Add paid tracking?
4. Confirm matching rule: email first, then phone.

**Recommendation:** build Phase 1 with income labelled as an estimate, then add notes and paid tracking afterwards.

Also update the README, the changelog and (optionally) a landing feature card.

## Brand the Supabase emails

Added 24 Nov 2026. Confirmation, password-reset and other auth emails currently go out with Supabase's default look and sender. Make them look like Calspot.

- Edit the templates in Supabase: Authentication → Emails (Confirm sign up, Reset password, Magic link, Change email, Invite).
- Use the brand palette (navy `#0B1030`, lime `#D6FD69` only on navy) and the navy-background lime wordmark from `public/logos/`. Host the logo at a public URL, as email clients block most inline SVG; a PNG is safest.
- Friendly Calspot wording, plus a line for people who open the link on a different device from the one they signed up on (the link confirms the email, then they log in).
- Set a custom SMTP sender (for example via Resend) so mail comes from a Calspot address, not Supabase's shared one. This also lifts the default email rate limit. Needs a domain with SPF/DKIM set up, so do it with the launch checklist and alongside the email notifications work.

## Booking and scheduling ideas

Added 24 Nov 2026. Ideas from testing, none started.

- **Repeat lessons.** Shipped 24 Nov 2026 (see the README, "Repeat lessons"). Not yet done: cancelling a whole series in one go, and a repeat longer than 4 weeks. Original notes:  Let a player or coach set up a lesson that repeats weekly, up to 4 weeks maximum. Needs thought on: each week is its own booking (so one can be declined or cancelled alone), the coach approving the whole series in one go, and what happens when one week clashes with existing availability or a blocked date.
- **Academy-style lessons (beginner / intermediate / advanced).** Parked by Steve on 24 Nov 2026 until later; do repeats and fixed-date sessions first. A session could be filled by up to 4 independent people, so there may be no single person who makes or manages the booking. Open questions: each player books and is approved separately into a shared session (builds on group sessions and `spaces`); a minimum number of players before it runs; a level label on the lesson and a check that players pick the right one; what happens if it doesn't fill; who gets messages (a "message everyone" action is already listed as not built). Probably needs fixed-date sessions first.
- **Playtomic or rating in setup.** Ask for a coach's Playtomic level or rating (or Playtomic profile link) in the sign-up wizard and show it on their page.
- **iCal / Google Calendar sync in the dashboard.** A first step has shipped: a private one-way calendar link on the Calendar page (confirmed sessions out). Reading the coach's busy times back in, and two-way Google sync, are still open. Confirmed sessions out to the coach's own calendar (an ICS feed they subscribe to is the simplest first step; two-way Google sync is bigger). Could also read busy times in so availability reflects the coach's other commitments.
- **Playtomic integration (worth investigating, could be a game changer).** A first step has shipped: a club can have a Playtomic link, so each request has a "Check court on Playtomic" button and a "Court booked" tick (no Playtomic data involved). The research below is still open. Today the coach gets a request, checks Playtomic by hand to see if a court is free, then goes back to the player to confirm. Research whether Playtomic offers a partner or API route, or any way to check court availability or hold a court from Calspot, so the coach can confirm in one step. First job is finding out what is possible and what Playtomic's terms allow, before designing anything. Note the README currently says Calspot makes no promise about court reservations, so any integration would change that wording.

## Club and address autocomplete

Added 24 Nov 2026. When a coach adds a club (in Clubs and in the sign-up wizard's "Clubs & lessons" step), suggest matching venues and addresses as they type. Picking one fills in the club name and address; typing by hand still works.

**Provider options (decision still open)**
- **Google Places (New) autocomplete.** Best at finding clubs by name. Free monthly allowance (about 10,000 autocomplete requests a month, and sessions that end in a place lookup may be free; check the live pricing page), but a Google Cloud project with billing and a card is required. Key restricted to calspot.co.uk and the Places API.
- **Geoapify.** Free plan of 3,000 requests a day, no card, but built on OpenStreetMap so smaller padel clubs may be missing. Needs attribution; check its terms on commercial use.
- **Photon (komoot's public service).** Free, same OpenStreetMap data, but meant for demos with no availability guarantee. Not recommended for a product.
- A UK postcode lookup would fill the address only, not the club name.

**How to build it**
- Key in an environment variable (for example `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`), and fall back to plain typing when it is missing, so it is safe to deploy before the key exists.
- Wait for a pause in typing and a few characters before searching, to keep requests down.
- Keep the provider as one swappable piece.
- The text a coach types is sent to the provider while they search. Mention it in the privacy page (still a draft awaiting legal review).
