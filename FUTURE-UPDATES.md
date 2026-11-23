# Future updates

Ideas that are planned but not started. Move an item to the changelog once it ships.

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
