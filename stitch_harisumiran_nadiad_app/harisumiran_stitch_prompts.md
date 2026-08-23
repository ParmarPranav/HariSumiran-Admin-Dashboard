# HariSumiran — Role-Wise Stitch Prompt Library

## How to use this document
Each module below is broken into **role-specific prompts**. Every prompt is self-contained: paste the **Shared Design System Block** once at the start of a new Stitch project/chat, then paste the individual **module + role** prompt when you're ready to generate that flow. Do this one role at a time — do not merge two roles into a single Stitch generation, or the tool will blend permissions and navigation.

Order to generate in: `00 Foundations → 03 Auth & Shell → HOME (all roles) → then any module in the order you need it`.

---

## 🔒 SHARED DESIGN SYSTEM BLOCK (paste before every prompt below)

```
Design HariSumiran, a native iOS 27 temple-operations app for HariPrabodham, Nadiad.
This is an authenticated operations app for temple staff and families — NOT a temple website, social app, generic ERP, or CRUD dashboard.

VISUAL SYSTEM
Canvas #FBF9F5 · Surface #FFFFFF · Primary text #24211F · Secondary text #6E655F
Border #E8E0D8 · Action (deep saffron) #B84D17 · Success (forest) #2F6B4F
Warning (amber) #A66A12 · Error (red) #B5473F · Info (blue) #376D9C
Typography: SF Pro for native UI, Poppins Semibold only for the HariSumiran wordmark, Noto Sans Gujarati for Gujarati text.
8pt spacing rhythm with 4pt half-steps. Content radii 12–20pt. Hairline borders. Minimal shadows.
Large abstract mandala motif at 3–5% opacity allowed ONLY on welcome/empty/hero states.
No gradients, neon, 3D charts, confetti, cartoon icons, stock spirituality imagery, or decorative glassmorphism.

iOS 27 SYSTEM DIRECTION
Two visual layers: (1) adaptive Liquid Glass for floating tab bars, nav/toolbars, search, compact contextual controls, sheets; (2) calm flat branded content layer underneath. Never glass on ordinary cards. Never stack glass on glass. Floating tab bar minimizes on scroll. Native large-title-to-inline-title behavior. Native SF Symbols, Dynamic Type, system sheets/menus/alerts/pickers.

UX RULES
One screen = one responsibility + one obvious primary action. User must know where they are / what to do within 3 seconds. Surface today's work, pending decisions, and risks before charts or menus. Daily tasks completable in ≤3 interactions. Use progressive disclosure, recent items, autosave, undo/confirm, constructive errors, and immediate success feedback. Never expose technical IDs. AI may suggest/summarize/prioritize but never silently change sensitive data — always show reasoning + require explicit human confirmation.

DATA
Use realistic fictional Nadiad Gujarati names, addresses, and phone numbers — never Lorem Ipsum. Mask sensitive phone, wellbeing, relationship, and audit data according to the active role's permission level.

MOTION
150ms micro-feedback, 250ms navigation/state change, 350ms sheet/contextual expansion. Physically coherent ease/spring, no bounce. Card-to-detail matched-geometry transitions, tab-bar minimize on scroll, skeleton-to-content dissolve, animated SF Symbols for status/completion, subtle success haptics. Under Reduce Motion: crossfade only, never motion-only feedback.
```

---

## MODULE — FOUNDATIONS
*(System-wide; generate once, owned conceptually by Super Administrator, used as the design source of truth for every other page)*

### Role: Super Administrator / Design System Owner
**Goal:** Establish the product map, variables, and component library every other module inherits.

**Pages/Screens to generate:**
1. `00 Product Map` — a single canvas-style board: box per module (Auth, Home, Families, Members, Sabha, Follow-up, Seva, Assets, Events, Thal, Communication, Reports, Admin), arrows showing cross-links (Family → Member → Attendance → Sabha → Follow-up → Seva → Thal), and a role matrix table (rows = 6 roles, columns = 14 modules, cell = Full / View-only / Masked / No access).
2. `01 Variables` — swatches for all semantic colors (light mode base + placeholders for future dark/high-contrast tokens), 8pt spacing scale, radius scale (12/16/20pt), elevation levels (0–2, hairline + minimal shadow only), motion durations (150/250/350ms).
3. `02 iOS Components` — a component sheet showing every global component at every state: Button (Primary/Secondary/Destructive/Ghost × Default/Pressed/Focused/Disabled/Loading), Text/Phone/Search fields (Default/Focused/Error/Read-only), Pickers, Toggles, Status chips (Present/Absent/Pending/Approved/Overdue), Avatars, Card variants, List rows, Tabs, Calendar cell, Task/Approval card, Timeline item, Chart (bar/line only, flat, no 3D/gradient), Banner, Toast, Sheet, Dialog, File/document upload, QR card + scanner overlay, Skeleton, Progress indicator, Offline/sync banner, Empty/Error/Success/No-permission states.
4. App icon concept — a single mark using the saffron action color, restrained mandala geometry, no literal deity imagery, on canvas #FBF9F5.

**Components:** all Global Components listed in the design system.
**States to show on the component sheet:** Default, Pressed, Focused, Selected, Disabled, Loading, Error, Success, Read-only, Permission-masked.
**Deliverable framing:** this is a reference sheet, not a user-facing flow — no prototype interactions needed here.

---

## MODULE — AUTH & SHELL
*(Shared entry point for all roles — role determines only the destination after login, not the auth UI itself)*

### Role: All Roles (role-aware branching happens after OTP)
**Goal:** Get any authenticated person (Karyakarta, Family Captain, Family Member, Dept Head, Mandir Administrator, Super Admin) into the app safely and route them to their correct Home in ≤3 steps.

**Screen flow:**
1. **Welcome** — HariSumiran wordmark (Poppins Semibold), calm mandala hero at 4% opacity, one-line trust statement ("Your seva, organized with care"), primary button "Continue with Mobile Number", secondary "Continue with Email".
2. **Mobile/Email entry** — single input, native keyboard, inline validation, primary action "Send OTP".
3. **OTP verification** — 6-digit native OTP field with autofill, resend timer, "Trouble receiving code?" link.
4. **Device trust** — "Remember this device for 30 days" toggle, explains why (fewer OTP prompts), Face ID enrollment prompt if biometrics available.
5. **Role-aware onboarding (first login only)** — 2–3 short cards confirming detected role (e.g. "You've been added as Karyakarta for HariPrabodham, Nadiad — Sabha & Follow-up team") with a "This isn't me" escape hatch to contact admin.
6. **Notification permission** — native system prompt framed with one calm sentence on why ("Get notified when a family needs follow-up or your seva duty changes").
7. **Face ID re-entry (subsequent logins)** — Face ID sheet, fallback to passcode/OTP after 2 failed attempts.
8. **Expired session** — friendly re-auth sheet mid-task ("Your session timed out — sign in again to continue where you left off"), preserves any unsaved draft.
9. **Locked account** — clear reason (too many attempts / disabled by admin), contact-admin action, no retry timer gamesmanship.

**Components:** Text/phone field, OTP field, Toggle, Button/Primary/Large, System permission sheet, Banner (error/info).
**States:** Default, Loading (sending OTP), Error (wrong OTP, network fail), Locked, Expired, Success (redirect transition).
**Prototype paths:**
- Happy: Welcome → Mobile entry → OTP → Device trust → role Home.
- Error/recovery: wrong OTP 3× → constructive error copy → resend flow.
- Permission variant: Family Member with no assigned role yet → routed to a lightweight "Awaiting activation by your Mandir office" state instead of a Home dashboard.

---

## MODULE — HOME

### Role: Karyakarta
**Goal:** Know exactly what needs doing today, in under 3 seconds, without digging.

**Screen flow:** `Today view (Home) → tap any card → relevant module detail → back to Home`
1. **Today view** top to bottom: greeting header with name + today's date in Gujarati/English, sync status chip (Synced / Syncing / Offline), **Next Actions** section (max 3, e.g. "Call Patel family — follow-up overdue 2 days", "Mark attendance — Evening Sabha starts in 40 min"), **Today's Duties** card (Sabha/Thal/Seva assignments with time + location), **Pending Approvals requiring you** (if applicable), compact **KPI strip** (families visited this week / attendance logged / open follow-ups — numbers only, no charts here), **Recent Activity** (last 5 actions you took, tappable to undo/view), floating **quick-add** (QR scan / new follow-up note / mark attendance).
2. Tapping a Next Action deep-links straight into that module's Action screen (not its list) — e.g. tapping the follow-up card opens the Case Detail directly.

**Components:** Card/Home/NextAction, Card/Home/Duty, Chip/Sync-status, Row/Activity, Banner/offline, Avatar.
**States:** Populated, Empty ("No pending actions — well done"), Loading (skeleton), Offline (banner + cached data marked "last synced 10 min ago"), Error (server unreachable, retry action).
**Prototype paths:** Happy — tap "Mark attendance" → Sabha live attendance screen. Error — offline banner appears, quick-add still works and queues for sync. Permission — Karyakarta without Follow-up access sees Duties + Sabha only, no Follow-up card.

### Role: Mandir Administrator
**Goal:** See operational health of the whole mandir at a glance and clear bottlenecks.

**Screen flow:**
1. **Operations Dashboard** — greeting header, sync/system status, **Alerts & Risks** band (e.g. "3 follow-up cases overdue >7 days", "Asset AMC expiring this week"), **Pending Approvals** queue (Thal swaps, Follow-up closures, Event budgets) with inline Approve/Reject, **Today Across Mandir** summary (Sabha attendance %, active Seva duties, Thal coverage), **Concise KPIs** (families engaged, member growth, volunteer utilization — flat bar/line charts only), **Recent Activity** across departments, quick links to People / Operations / Reports.
2. Tapping an alert opens the relevant module's exception/detail view filtered to that issue.

**Components:** Card/Home/Alert, Card/Approval, Chart/Bar-Flat, Row/Activity, Chip/Status.
**States:** Populated, Empty, Loading skeleton, Offline, Error, Success toast after inline approval.
**Prototype paths:** Happy — approve a Thal swap inline, success toast + card removed from queue with a brief count-down undo. Error — approval fails (conflict), constructive inline error explaining why. Permission — Department Head sees the same layout scoped to only their department's data (see below).

### Role: Department Head
**Goal:** Manage their department's (e.g. Seva/Kitchen/Events) day without wading through mandir-wide data.

**Screen flow:** Same structure as Administrator's dashboard, but scoped: **Alerts & Risks** limited to their department, **Pending Approvals** limited to items they can approve (e.g. Seva roster swaps, not Thal or Asset procurement), **Today** summary shows only their department's duties/attendance, KPIs scoped to their team.
**Components/States:** identical component set to Administrator Home, filtered via permission-masked data binding.
**Prototype path — permission variant:** attempt to open a mandir-wide report card → shown a calm "No permission" state ("This report is managed by your Mandir Administrator") instead of an error.

### Role: Family Captain
**Goal:** Handle the household's obligations (Thal turn, Sabha attendance, updates from mandir) quickly.

**Screen flow:**
1. **Home** — greeting with family name, **Your Thal Turn** card (next assigned date, confirm/decline actions), **Upcoming Sabha** card (RSVP if applicable), **Updates from Mandir** (announcements relevant to the family, unread indicator), **Family Snapshot** (members count, recent attendance streak — light, non-clinical framing), quick links to Thal / Sabha / Updates / Profile.
2. Tapping Thal card opens Thal confirmation flow directly.

**Components:** Card/Home/ThalTurn, Card/Home/Sabha, Card/Announcement, Avatar-group.
**States:** Populated, Empty ("No Thal turn this month"), Loading, Offline, Error, Success (after confirming Thal).
**Prototype paths:** Happy — confirm Thal turn → success + calendar updates. Error — decline requires a reason, validation blocks empty submit. Permission — Family Captain cannot see other families' Thal schedule, only a read-only "This week's mandir Thal roster" summary card.

---

## MODULE — FAMILIES

### Role: Karyakarta
**Goal:** Look up, register, and maintain family records encountered during daily fieldwork.

**Screen flow:** `Directory → Family 360° Profile → Action (edit/log interaction) → Timeline`
1. **Directory** — search bar (name/phone/address/QR), filter chips (Area, Engagement level, Has open follow-up), sortable list rows (Family name, captain, member count, last interaction date), floating "+ Register Family".
2. **Registration wizard** — 3 short steps: Household basics (name, address, area) → Captain + initial members (add via search-existing-member or new) → Review & confirm. Autosave draft between steps.
3. **Duplicate review** — triggered mid-registration if a similar family/phone number is found; side-by-side compare card with "This is the same family / This is different" decision.
4. **360° Family Profile** — header (family name, QR identity chip, engagement badge), tabs: Overview (members list, captain, address), Interactions (log of visits/calls), Documents, Timeline, Communication log. Primary action "Log Interaction".
5. **Log interaction (sheet)** — type (visit/call/sabha-contact), short note, follow-up needed toggle → if on, hands off into Follow-up module's case-create.
6. **Household/captain management** — reassign captain, add/remove members, each change requires confirm step (not silent).
7. **Privacy & audit tab** — who viewed/edited this record and when (Karyakarta sees this is logged, cannot see other families' audit).

**Components:** Card/Family/Summary, Row/Family/List, Field/Search, Chip/Filter, Sheet/LogInteraction, Card/Duplicate-compare, Tabs, QR-card.
**States:** Populated, Empty (no families match filter), Loading skeleton, Offline (log interaction queues), Error, Success (registration complete), No-permission (health/wellbeing tab masked for Karyakarta without Follow-up access).
**Prototype paths:** Happy — search → open profile → log interaction → success toast. Error — duplicate detected mid-registration → resolve → continue. Permission — Karyakarta tries to edit captain assignment without rights → read-only field + "Contact your Administrator" tooltip.

### Role: Family Captain
**Goal:** Keep their own household's info accurate and see the family's standing with the mandir.

**Screen flow:**
1. **My Family Profile** (no directory — this role only ever sees their own family, so it opens directly to the profile) — Overview tab (members, editable contact info for self only), Documents tab (upload/view household documents), Timeline (Sabha attendance, Thal history — read-only), Communication log (announcements received).
2. **Edit member (self/dependents only)** — name, phone, relationship; changes to phone trigger a confirm-with-OTP step since it affects notifications.
3. **Add family member request** — Captain fills a request form (not a direct write) that routes to Karyakarta/Admin for confirmation — reinforces "AI/user never silently changes sensitive data" rule at the human level too.

**Components:** Card/Family/Summary, Tabs, Field/Text-Phone, File-upload, Timeline-item.
**States:** Populated, Loading, Offline, Error (OTP confirm fails), Success, Read-only (fields the Captain can't edit, e.g. area/zone, shown greyed with explanation).
**Prototype paths:** Happy — edit own phone → OTP confirm → success. Permission — attempt to view another family's profile via a shared link → "No permission" state, not a 404.

### Role: Mandir Administrator
**Goal:** Oversee the full family directory, resolve duplicates, manage captains, and audit access mandir-wide.

**Screen flow:** Same Directory → 360° Profile structure as Karyakarta, plus:
1. **Bulk duplicate review queue** — list of flagged pairs across the whole directory, batch resolve.
2. **Full audit tab** (unmasked) — every user who viewed/edited any family record, filterable by user/date.
3. **Reassign captain / merge households** — elevated destructive-ish actions behind a confirm dialog with explicit consequence text ("This will move 4 members to a new household").

**Components:** same as Karyakarta view + Dialog/Confirm-destructive, Row/Audit.
**States:** adds "Locked" (record frozen pending merge decision).
**Prototype path — permission variant:** Administrator view shows full phone numbers and wellbeing flags unmasked, contrasted directly against the Karyakarta view of the same record where sensitive fields are masked with a "•••• Contact admin to view" affordance.

---

## MODULE — MEMBERS

### Role: Karyakarta
**Goal:** Maintain accurate individual member records and log attendance/seva touchpoints.

**Screen flow:** `Directory → 360° Member Profile → Action → Timeline/Insights`
1. **Directory** — search/filter (family, age group, seva interest, attendance streak), list rows with avatar, name, family, last attendance.
2. **Registration** — short form: name, DOB, phone, family link (search existing or create new), consent capture (communication preference) — required, cannot skip.
3. **360° Member Profile** — header (avatar, name, QR identity), tabs: Overview, Attendance, Seva & Skills, Milestones, Communication preferences, Documents/Verification, Privacy.
4. **Attendance tab** — calendar heat-strip of Sabha attendance, quick "Log today's attendance" if not already marked.
5. **Milestones** — lifecycle events (birthday, upanayan, anniversary) with a gentle reminder toggle to notify the family captain — never auto-sent without confirm.
6. **Skills/talents** — tag-based picker (music, cooking, logistics...) feeding Seva volunteer matching.
7. **Recognition** — read-only list of seva recognitions/certificates earned.

**Components:** Card/Member/Summary, Row/Member/List, Calendar-heat-strip, Chip/Skill-tag, Tabs, QR-card, Consent-toggle.
**States:** Populated, Empty, Loading, Offline, Error, Success, No-permission (wellbeing/relationship notes masked unless Karyakarta has Follow-up access).
**Prototype paths:** Happy — register member → consent step → profile created. Error — missing required consent choice blocks save with a plain-language explanation, not a generic "field required." Permission — skills/seva tab visible but attendance-editing disabled for a read-only Karyakarta variant.

### Role: Family Member
**Goal:** View and lightly manage their own profile, attendance history, and seva involvement.

**Screen flow:**
1. **My Profile** (opens directly, no directory) — Overview (editable: photo, phone, communication preference), Attendance (read-only history + streak), My Seva (current duties, upcoming shifts, QR check-in shortcut), Recognition (certificates), Documents (their own uploads only).
2. **Edit communication preference** — channel (WhatsApp/SMS/App) + quiet hours, immediate save with confirmation toast.
3. **Consent management** — view/withdraw specific consents (e.g. photo use in event albums) with plain explanation of what each consent controls.

**Components:** Card/Member/Summary, Toggle, Chip/Skill-tag (read-only), QR-card (own identity, for check-in).
**States:** Populated, Loading, Offline, Error, Success, Read-only (fields owned by mandir office, e.g. verified DOB).
**Prototype path — permission variant:** attempting to view another member's profile from a shared roster list shows only name + department, not phone/attendance — "Full profile visible to Karyakarta and Administrators only."

### Role: Mandir Administrator
**Goal:** Full directory oversight, verification, and data quality.

**Screen flow:** Directory + 360° Profile as Karyakarta, plus:
1. **Verification queue** — members pending document/ID verification, approve/reject with reason.
2. **Insights** — flat charts: member growth over time, attendance distribution, engagement segments (High/Medium/At-risk) — used to prioritize Follow-up, not vanity metrics.
**Components:** Card/Verification, Chart/Bar-Flat, Chart/Line-Flat.
**States:** adds "Pending verification," full unmasked view of wellbeing/relationship/audit fields.
**Prototype path:** Happy — approve verification → member status badge updates from "Pending" to "Verified" with an animated SF Symbol checkmark.

---

## MODULE — SABHA

### Role: Karyakarta
**Goal:** Run live attendance smoothly and follow up on absences without friction.

**Screen flow:** `Schedule/Calendar → Session Detail → Live Attendance → Completion Summary → Absent Follow-up`
1. **Schedule/Calendar** — month/week toggle, session type chips (Morning/Evening/Special), tapping a date opens Session Detail; floating "+ New Sabha" for authorized Karyakartas.
2. **Session Detail** — agenda/program list, volunteer & resource readiness checklist (mic set up? prasad ready?), primary action "Start Attendance" enabled only near session time.
3. **Live Attendance** — three entry modes as segmented control: **Search** (type-ahead name list, tap to mark present), **List** (full roster, swipe to toggle present/absent), **QR** (scanner overlay, haptic + animated checkmark on scan). Running count of present/expected at top.
4. **Completion Summary** — final counts, list of absentees, primary action "Send Absent Follow-up" (batch-creates lightweight Follow-up flags, not full cases) and "Post Announcement" shortcut.
5. **Analytics** (light) — attendance trend line for this Sabha type over past sessions.

**Components:** Calendar-cell, Card/Session, Checklist-row, Segmented-control, Row/Attendance/Present, Row/Attendance/Absent, QR-scanner overlay, Progress/count, Chart/Line-Flat.
**States:** Populated, Empty (no sessions this week), Loading, Offline (attendance queues, banner shows "3 check-ins pending sync"), Error (QR scan fails to match — constructive "Member not found, try search"), Success (session completed).
**Prototype paths:** Happy — QR scan 5 members → complete → summary. Error/recovery — offline mid-session → local queue → banner → auto-sync on reconnect with a subtle success toast. Permission — Karyakarta without "create session" rights sees Calendar + Live Attendance only, no "+ New Sabha."

### Role: Mandir Administrator
**Goal:** Configure Sabha types/templates and monitor attendance mandir-wide.

**Screen flow:** adds **Types/Templates** management screen (create a Sabha template: name, recurrence, default checklist) ahead of the Calendar, and an **Analytics** tab with mandir-wide attendance trends, comparison across Sabha types, and exportable view.
**Components:** Card/Template, Chart/Bar-Flat, Export-button.
**States:** same set + "Draft" (unpublished template).
**Prototype path — permission variant:** Administrator can edit a template mid-cycle; system warns "This affects 4 upcoming scheduled sessions" before confirm.

### Role: Family Member
**Goal:** Know when the next Sabha is and see their own attendance history.

**Screen flow:** **Upcoming Sabha** card on Home → tap → simple **Session Detail (read-only)**: date, time, type, location, RSVP toggle if the mandir has enabled RSVP for that session type. **My Attendance** view: personal streak, not comparative to others.
**Components:** Card/Session (read-only variant), Toggle/RSVP.
**States:** Populated, Loading, Offline, Success (RSVP confirmed).
**Prototype path:** Happy — RSVP yes → confirmation + calendar reminder offer.

---

## MODULE — FOLLOW-UP
*(Most sensitive module — confidential notes are strictly role-masked everywhere)*

### Role: Karyakarta
**Goal:** Work assigned cases with empathy and clear next steps, without ever exposing sensitive notes to unauthorized eyes.

**Screen flow:** `Prioritized Cases → Case Detail → Visit Planning → Confidential Note → Next Action/Reminder → Closure Request`
1. **Prioritized Cases** — list sorted by urgency (Overdue / Due today / Upcoming), each row shows family name, reason category (light label like "Extended absence," never a diagnosis-style label), assigned-to-you badge.
2. **Case Detail** — family snapshot, relationship timeline (interactions across modules, unified), current status, primary action "Plan Visit."
3. **Visit Planning** — date/time picker, location, optional co-visitor.
4. **Confidential Interaction Note (sheet)** — free-text note explicitly marked "Confidential — visible to assigned Karyakarta and Follow-up supervisors only," with a visible lock icon reinforcing the boundary.
5. **Next Action / Reminder** — set a follow-up date, escalate toggle (routes to Department Head if unresolved past a threshold).
6. **Closure request** — Karyakarta requests closure with a summary; goes to an approver, not auto-closed (reinforces human-confirmation rule).

**Components:** Card/Task-Approval (as case card), Timeline-item, Sheet/Confidential-note (with lock affordance), Field/Date-time, Toggle/Escalate, Banner/Confidential.
**States:** Populated, Empty ("No cases assigned to you"), Loading, Offline, Error, Success, No-permission (Karyakarta without Follow-up rights never sees this tab at all — not even a locked placeholder, per "never expose unauthorized destinations").
**Prototype paths:** Happy — plan visit → log confidential note → set reminder. Error — closure request submitted without a summary → blocked with plain guidance. Permission — a second Karyakarta not assigned to this case sees only the family's general profile, no case list entry.

### Role: Department Head (Follow-up Supervisor)
**Goal:** Oversee case load, approve closures, and catch escalations early.

**Screen flow:** **Prioritized Cases** (team-wide view) → **Case Detail** (full history + all confidential notes for assigned Karyakartas) → **Closure Approval** screen (approve/return-with-feedback) → **Insights** (case volume, average resolution time, category distribution — flat charts, no individual-identifying data in the chart view itself).
**Components:** Card/Task-Approval, Dialog/Confirm, Chart/Bar-Flat.
**States:** adds "Escalated" status chip (amber/red).
**Prototype path:** Happy — approve closure → case moves to Closed with animated status change. Permission — Department Head sees confidential notes only for cases within their department's assignment scope, not mandir-wide.

### Role: Mandir Administrator
**Goal:** Mandir-wide wellbeing oversight without micromanaging individual notes.

**Screen flow:** **Insights**-first view (case volume, overdue %, escalation trend) with drill-down into case list only when needed; confidential note content stays masked by default here ("1 confidential note — view requires stated reason," logging the access).
**Components:** Chart/Line-Flat, Dialog/Access-reason.
**States:** No-permission variant shown for note content until access reason is logged (this itself is the permission-variant prototype path).

---

## MODULE — SEVA

### Role: Family Member (Volunteer)
**Goal:** Find a seva opportunity that matches their skills and manage their own duties.

**Screen flow:** `Catalog → Enrollment → Onboarding/Readiness → My Roster → Duty Detail → QR Check-in/out`
1. **Catalog** — browse by department (Kitchen, Sound, Security, Kids' Program...), each card shows role, time commitment, skill match badge if their profile skills align.
2. **Enrollment** — short form confirming availability, primary action "Request to Join" (routes to Department Head approval — not instant).
3. **Onboarding/Readiness** — checklist (orientation attended, training video watched) before duties are assignable.
4. **My Roster** — upcoming duties list, each with date/time/location.
5. **Duty Detail** — instructions, co-volunteers, primary action "Check In" near duty time.
6. **QR Check-in/out** — scanner with success haptic + animated confirmation, auto-starts a light duty timer.
7. **Replacement request** — if unable to attend, request a substitute; shows pending until a match is found or Department Head steps in.
8. **Recognition** — certificates/badges earned over time.

**Components:** Card/Seva/Catalog, Chip/Skill-match, Checklist-row, QR-scanner, Card/Duty, Row/Roster.
**States:** Populated, Empty (no matching seva yet — suggests broadening filters), Loading, Offline (check-in queues), Error, Success, Pending-approval.
**Prototype paths:** Happy — enroll → approved (notification) → check in via QR → check out → recognition unlocked. Error — check-in attempted outside the valid time window → constructive message, offers to notify coordinator instead. Permission — cannot see other volunteers' contact info in the roster, only names + roles.

### Role: Department Head
**Goal:** Keep their department's roster staffed and readiness on track.

**Screen flow:** **Roster/Schedule** (department-wide calendar) → **Enrollment approvals** queue → **Duty assignment** (drag-style reassignment or tap-to-assign) → **Replacement flow** (match open replacement requests to available volunteers, suggested by skill/availability) → **Training/certification tracking** → **Capacity analytics** (flat chart: filled vs open duty slots per week).
**Components:** Card/Task-Approval, Calendar-cell, Chart/Bar-Flat, Row/Roster (editable).
**States:** adds "Understaffed" warning state on a duty slot.
**Prototype path:** Happy — approve a volunteer enrollment → auto-added to next matching open slot with confirm step, not silently. Permission — Department Head only manages their own department's roster, others shown read-only in a mandir-wide readiness summary.

### Role: Karyakarta
**Goal:** Support day-of seva coordination across departments they're assigned to help.

**Screen flow:** Similar to Department Head but scoped to duties they coordinate; primary emphasis on **Today's readiness** view (which duties are staffed vs at-risk today) surfaced from Home.
**Components/States:** shares Department Head's components, read/limited-write access reflected via disabled states on cross-department items.

---

## MODULE — ASSETS

### Role: Karyakarta
**Goal:** Handle day-to-day asset movement — borrow/return, quick checks, and simple bookings.

**Screen flow:** `Dashboard → QR Registry lookup → Asset Detail → Borrow/Issue/Return → Room Booking`
1. **Dashboard** — quick stats (items due back today, rooms free right now), shortcut "Scan Asset QR."
2. **Registry lookup** — search or scan; list rows show item name, location, status (Available/In use/Under maintenance).
3. **Asset Detail** — photo, condition notes, current holder if borrowed, history log, primary action varies by state (Borrow / Return / Report Issue).
4. **Borrow/Issue flow** — select purpose + expected return date, confirm step, generates a light digital acknowledgment (no signature scanning needed for Karyakarta tier).
5. **Room Booking** — calendar of rooms/halls, tap a slot to request booking, conflict warning shown inline if double-booked.
6. **Report lost/damaged** — short form + photo upload, routes to Administrator for triage, never silently marks the asset unavailable without that confirm.

**Components:** Card/Asset, Row/Registry, QR-card/scanner, Calendar-cell (room booking), File-upload, Chip/Status (Available/In-use/Maintenance/Lost).
**States:** Populated, Empty, Loading, Offline (borrow/return queues), Error (booking conflict), Success.
**Prototype paths:** Happy — scan → borrow → confirm → success. Error — booking conflict → offers next available slot instead of a dead-end. Permission — Karyakarta cannot approve procurement or edit asset master data, sees those fields read-only.

### Role: Mandir Administrator
**Goal:** Own the full asset lifecycle — procurement, maintenance, vendors, and reporting.

**Screen flow:** Dashboard (facility-wide) → **Stock movement log** → **Maintenance/Inspection/Work order** flow (schedule inspection → log findings → create work order → assign vendor → close) → **Procurement/Vendor/Donation** intake (new asset entry, linked donor record if applicable) → **Operational analytics** (utilization, maintenance cost trend, lost/damaged rate — flat charts).
**Components:** Card/Work-order, Row/Stock-movement, Chart/Bar-Flat, Dialog/Confirm-destructive (for marking an asset permanently retired).
**States:** adds "Under inspection," "Retired."
**Prototype path:** Happy — schedule inspection → log condition → auto-suggest work order if issue found (AI-suggested, human-confirmed) → assign vendor.

---

## MODULE — EVENTS

### Role: Karyakarta
**Goal:** Execute assigned event tasks and manage check-in on the day.

**Screen flow:** `Event Overview → My Tasks → Registration/Check-in (QR) → Live Status → Post-event review`
1. **Event Overview** — hero card (event name, date, readiness %), tabs: Timeline, Committee, Tasks, Registration.
2. **My Tasks** — checklist assigned to this Karyakarta with due dates, mark-complete with a lightweight note.
3. **QR Pass/Check-in** — scanner for attendee passes, running headcount, quick manual search fallback if QR fails.
4. **Live Status (day-of)** — simple ops board: task completion %, current headcount, any flagged issues, communication shortcut to committee.
5. **Post-event review** — short structured reflection (what worked / what to improve) feeding the reusable knowledge base.

**Components:** Card/Event/Hero, Checklist-row, QR-scanner, Progress/count, Card/Task-Approval.
**States:** Populated, Empty, Loading, Offline (check-in queues, count reconciles on sync), Error, Success.
**Prototype paths:** Happy — check in 20 attendees via QR → live count updates with number-transition animation. Error — QR unreadable → manual search fallback, no dead end. Permission — Karyakarta not on the organizing committee sees Event Overview read-only, no task/check-in access.

### Role: Mandir Administrator
**Goal:** Plan the festival/event calendar and steward budget/committee formation.

**Screen flow:** **Planning timeline** (Gantt-like flat timeline, milestones) → **Organizing committee** (assign roles, department heads as leads) → **Task/readiness rollup** across all committees → **Registration setup** (public-facing form config, capacity limits) → **Communication** (announcement scheduling, tied into Communication module) → **Analytics** (attendance vs capacity, budget vs actual, feedback themes from post-event reviews) → **Reusable knowledge** (past event templates for reuse next year).
**Components:** Timeline (flat, milestone markers), Card/Committee-member, Chart/Bar-Flat, Template-card.
**States:** adds "Planning," "Live," "Completed," "Archived."
**Prototype path:** Happy — clone last year's Diwali event template → adjust dates → publish. Permission — Administrator approves budget items Department Heads submit, never auto-approved.

### Role: Family Member
**Goal:** Discover and register for events, get their pass.

**Screen flow:** **Upcoming Events** list (from Home/Updates) → **Event Detail** (read-only: date, description, capacity remaining) → **Register** (simple form, household member selection) → **My Pass** (QR pass card, add-to-wallet style action) → **Post-event feedback** (short optional survey).
**Components:** Card/Event (read-only), QR-card (pass), Field/Simple-form.
**States:** Populated, Loading, Offline, Error (event full — waitlist offered), Success (registered).
**Prototype path:** Happy — register → QR pass generated → reminder offer. Error — capacity full → waitlist join with clear expectation-setting copy.

---

## MODULE — THAL

### Role: Mandir Administrator (Thal Coordinator)
**Goal:** Keep the Thal (meal-seva) rotation fair, fully covered, and easy to adjust when families can't make their turn.

**Screen flow:** `Calendar/Rotation → Family Assignment → Availability review → Swap/Waitlist management → Coordinator Approval → Reminders → Fairness Insight → Reports`
1. **Calendar/Rotation** — month view, each day shows assigned family (or "Unassigned" in warning amber), tap a day to manage.
2. **Family Assignment** — for an unassigned/open day: suggested families ranked by fairness (longest since last turn, availability match — AI-suggested, coordinator confirms, never auto-assigns), assign with one tap + confirm.
3. **Availability review** — see which families have marked upcoming unavailability, cross-referenced against the rotation to avoid scheduling conflicts before they happen.
4. **Swap/Waitlist management** — queue of pending swap requests between families, approve/deny with a reason, waitlist of families wanting extra turns (for merit/preference) shown separately from the obligation rotation.
5. **Coordinator Approval** — any decline-with-reason from a family lands here for review (e.g. deciding whether to excuse or reassign).
6. **Reminders** — configure reminder cadence (e.g. 3 days and 1 day before), preview the message.
7. **Fairness Insight** — flat chart showing turn frequency per family over the year, flags any family over/under-served, directly actionable ("Assign next open slot to Shah family — 4 months since last turn").
8. **Reports** — exportable Thal history by family, by month, completion rate.

**Components:** Calendar-cell (Thal variant: shows family avatar + status color), Card/Task-Approval (swap requests), Chart/Bar-Flat (fairness), Row/Family-assignment, Dialog/Confirm.
**States:** Populated, Empty (rotation not yet built for this month), Loading, Offline, Error (assignment conflict — family already assigned elsewhere that day), Success, Unassigned (warning), Locked (day too close to change without override).
**Prototype paths:**
- Happy: open unassigned day → view AI-ranked suggestions → assign Trivedi family → confirm → calendar updates with success animation.
- Error/recovery: assign a family already double-booked → constructive inline warning with alternative suggestions, blocked until resolved.
- Permission variant: a Department Head with Thal visibility but not coordination rights sees the same calendar fully populated but every action button replaced with a "View only — managed by Thal Coordinator" state.

### Role: Family Captain
**Goal:** Know their Thal turn, confirm or decline in time, and request swaps without needing to call anyone.

**Screen flow:** `Home Thal card → Turn Detail → Confirm/Decline → Swap request → Confirmation/Completion → Family History`
1. **Turn Detail** — date, meal type, headcount expected, any special instructions (dietary notes, quantity guidance), primary actions "Confirm" / "Decline."
2. **Decline with reason** — required short reason (not optional — feeds coordinator's approval screen), offers "Suggest a swap with another family" as an alternative to a plain decline.
3. **Swap/Waitlist request** — pick a preferred family (if known) or "Any available family," submits to coordinator queue, status shown as Pending until resolved.
4. **Confirmation** — once confirmed, a calm confirmation state with a calendar reminder offer and prep checklist (quantities, drop-off time).
5. **Today's Thal (on the day)** — simple checklist: prepared, delivered, a single "Mark Complete" action.
6. **Family History** — past turns fulfilled, a light non-competitive "thank you" framing rather than a leaderboard.

**Components:** Card/Home/ThalTurn, Field/Reason-text, Card/Task-Approval (swap status), Checklist-row, Timeline-item.
**States:** Populated, Empty ("No upcoming Thal turn"), Loading, Offline, Error (decline submitted without reason — blocked), Success (confirmed / marked complete), Pending (swap awaiting coordinator).
**Prototype paths:**
- Happy: view turn → confirm → reminder set → mark complete on the day → thank-you success state.
- Error/recovery: decline without reason blocked → guided to add reason → submit → routed to coordinator.
- Permission variant: Family Captain can see this week's overall Thal roster (who else is serving) in a read-only summary card, but cannot tap into another family's turn detail or contact info — tapping shows "Only your own household's Thal detail is available here."

---

## MODULE — COMMUNICATION
*(Sensitive Follow-up notes never appear here — this module is broadcast/notification only)*

### Role: Mandir Administrator / Karyakarta (Sender)
**Goal:** Compose and send announcements to the right audience without spamming or leaking sensitive data.

**Screen flow:** `Notification Center → Templates → Audience Builder → Composer → Preview → Approval (if required) → Delivery Status`
1. **Notification Center** — inbox-style list of sent/scheduled announcements, status chips (Sent/Scheduled/Draft/Needs approval).
2. **Templates** — reusable message templates (Sabha reminder, Event invite, General notice), pick or start blank.
3. **Audience Builder** — filter-based selection (by area, engagement level, seva department, "everyone") with a live recipient count, never a raw phone-number list exposed here.
4. **Composer** — subject/body with plain-language field, channel selection (App/WhatsApp/SMS), timing (now/scheduled), Gujarati/English toggle.
5. **Preview** — exact rendering per channel, mobile-safe preview.
6. **Approval** — if the sender's role requires it, routes to Administrator with the same explicit confirm principle used elsewhere; Karyakarta-authored broadcasts to large audiences always require approval.
7. **Delivery Status** — sent/delivered/failed counts, retry action for failures, never guarantees read-receipts as fact if channel can't confirm them.
8. **Preferences view (admin-side)** — see aggregate opt-out rates by channel, not individual message content people sent elsewhere.

**Components:** Row/Notification, Card/Template, Field/Audience-filter, Field/Composer, Chip/Delivery-status, Card/Task-Approval (for approval step).
**States:** Draft, Scheduled, Pending-approval, Sending, Sent, Partially-failed, Failed, Offline (drafts save locally).
**Prototype paths:** Happy — pick template → build audience → preview → send → delivery status. Error/recovery — some deliveries fail → retry only the failed subset, not a full resend. Permission — Karyakarta composing a mandir-wide broadcast is blocked at Send with "This needs Administrator approval" rather than silently failing.

### Role: Family Member (Recipient)
**Goal:** See relevant updates and control their own notification preferences.

**Screen flow:** **Updates** tab (chronological, unread indicator, grouped by day) → **Announcement Detail** (full text, related action if any, e.g. "RSVP to this Sabha") → **Preferences** (channel choice, quiet hours, category opt-outs like "Event invites only, no general notices").
**Components:** Row/Announcement, Toggle/Preference-category, Card/Announcement.
**States:** Populated, Empty ("No updates right now"), Loading, Offline (cached), Success (preference saved).
**Prototype path:** Happy — open update → tap related RSVP action → routed into that module. Permission — Family Member never sees delivery/audience-builder screens, only the Updates + Preferences surface.

---

## MODULE — REPORTS

### Role: Mandir Administrator
**Goal:** Turn operational data into clear, exportable, drill-down-able insight — never decoration.

**Screen flow:** `Report Categories → Report View → Filter/Saved View → Drill-down → Export`
1. **Report Categories** — cards grouped by theme: Attendance & Participation, Follow-up & Wellbeing (access-logged), Seva Workload & Fairness, Assets, Events, Engagement Trends.
2. **Report View** — one flat chart (bar or line, never 3D/gradient) + a supporting data table beneath it, headline callout stat above the chart ("Attendance up 6% this quarter").
3. **Filter/Saved View** — date range, department/area filters, "Save this view" for recurring checks.
4. **Drill-down** — tapping a chart segment opens the underlying list (e.g. tapping "Overdue follow-ups" bar opens that filtered case list in the Follow-up module) — this is the cross-link principle applied to reporting.
5. **Export** — CSV/PDF export sheet, confirms what's included before generating (especially for anything touching Follow-up data, which requires an access-reason note, same as the Follow-up module's masked view).

**Components:** Card/Report-category, Chart/Bar-Flat, Chart/Line-Flat, Data-table, Field/Filter, Export-sheet.
**States:** Populated, Empty (no data in range), Loading, Offline (cached last-generated report shown with timestamp), Error, Success (export ready).
**Prototype paths:** Happy — open Attendance report → filter to last 90 days → drill into a dip → find the underlying Sabha session. Error — export of sensitive report attempted without stating access reason → blocked with a clear one-field form to proceed. Permission — Department Head sees the same report categories scoped to their department only.

### Role: Department Head
**Goal:** Track their team's workload and fairness without needing mandir-wide access.

**Screen flow:** Same as Administrator, but Report Categories limited to Seva Workload & Fairness (their department) and Events (if they lead one) — Follow-up and Asset financials excluded entirely from their category list, not shown-then-blocked.
**Components/States:** identical to Administrator's, permission enforced at the category-list level (cleanest permission variant: absence, not a lock icon).

---

## MODULE — ADMIN

### Role: Super Administrator
**Goal:** Configure the system safely — settings, permissions, and destructive actions all require explicit, well-explained confirmation.

**Screen flow:** `Settings Home → Mandir/Department/Area/Location settings → Users & Roles → Master Data → Approval Rules → Audit/Activity → Scheduler/Automation → Imports/Exports → Monitoring/Backup`
1. **Settings Home** — grouped list (Organization, People & Access, Data, Automation, System Health), each row shows a one-line current-state summary.
2. **Mandir/Department/Area/Location settings** — structural configuration (add a new department, define geographic areas for Family/Member filtering).
3. **Users & Roles / Permissions** — user list with role badges, tap a user to edit role assignment; role-permission matrix editor (toggle module access per role) with a clear warning of downstream effect ("12 Karyakartas will lose Follow-up access").
4. **Master Data** — reference lists (Seva departments, Sabha types, Asset categories) — simple CRUD but every delete requires the destructive-confirm pattern.
5. **Approval Rules** — configure which actions require approval and by whom (e.g. "Thal swaps require Coordinator approval," "Broadcasts over 200 recipients require Administrator approval") — this screen is the literal control panel for the "AI/human never silently changes sensitive data" principle across the app.
6. **Audit/Activity** — full unmasked activity log, filterable by user/module/date, exportable.
7. **Scheduler/Automation** — recurring jobs (reminder cadences, report generation), each with an on/off toggle and last-run status.
8. **Imports/Exports** — bulk data import wizard (map columns → preview → confirm, with row-level error reporting) and export center.
9. **Monitoring/Backup** — system health chips (sync status, last backup time), manual "Run backup now" action.
10. **Safe destructive-action confirmation (shared pattern)** — every delete/merge/deactivate anywhere in Admin uses the same Dialog/Confirm-destructive: plain-language consequence statement, requires typing a confirmation word for the highest-risk actions (e.g. deleting a role), explicit Cancel always available and pre-focused.

**Components:** Row/Settings, Card/User, Matrix-editor (role × module permission grid), Row/Master-data, Card/Approval-rule, Row/Audit, Toggle/Automation, Import-wizard-step, Chip/System-health, Dialog/Confirm-destructive (with type-to-confirm variant).
**States:** Populated, Empty, Loading, Offline (config changes blocked while offline, clearly stated), Error, Success, Locked (a setting mid-change by another admin — optimistic-lock warning), No-permission (irrelevant here since this is the top role, but reused to show a Department-Head-attempting-Admin-access example for the permission-variant prototype).
**Prototype paths:**
- Happy: edit a role's permissions → matrix toggle → downstream-impact warning → confirm → success + audit entry created.
- Error/recovery: bulk import has 3 malformed rows → import proceeds for valid rows, malformed rows listed with plain-language fixes, re-upload just those.
- Permission variant: simulate a Department Head somehow reaching an Admin URL → calm full-screen "This area is for Mandir Administrators" state with a clear path back to their own Home, never a raw 403 error.

---

## Quick-reference: Role → Primary Modules Matrix

| Role | Home variant | Full access | View-only / scoped | Masked / no access |
|---|---|---|---|---|
| Karyakarta | Today view | Families, Members, Sabha, Seva (assigned), Assets (basic), Follow-up (if assigned) | Events (assigned tasks), Communication (send, needs approval for broadcasts) | Admin, Reports (mandir-wide), Follow-up (unassigned cases) |
| Family Captain | Home (Thal/Sabha/Updates) | Own family profile, own Thal turns | Sabha RSVP, mandir-wide Thal roster (read-only) | Other families, Follow-up, Admin, Reports |
| Family Member | Home | Own member profile, own Seva enrollment | Events registration, Communication preferences | Other members' data, Admin, Reports, Follow-up |
| Department Head | Operations dashboard (scoped) | Seva roster (own dept), Reports (own dept), Events (if leading) | Follow-up (own dept cases), Assets (own dept) | Admin, mandir-wide Reports, other departments' data |
| Mandir Administrator | Operations dashboard (full) | People, Operations, Reports, Communication (approve), Assets, Events, Thal, Follow-up (oversight) | — | — |
| Super Administrator | (uses Admin as home context) | Everything, incl. Admin/system config | — | — |

---

*End of prompt library. Paste the Shared Design System Block once per new Stitch project, then paste each Module + Role prompt one at a time, in the order: Foundations → Auth & Shell → Home (per role) → remaining modules per role, following the cross-links noted in each flow.*
