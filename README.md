# HariSumiran — Mandir Operations Web Platform (Production Ready)

Authenticated temple operations and seva management platform for **HariPrabodham, Nadiad**, built with **Next.js 15+ (App Router)**, **Tailwind CSS**, **Framer Motion**, and **MongoDB Atlas**.

Adapted from the complete 66-screen specification in `stitch_harisumiran_nadiad_app`.

---

## Visual Design System & Brand Palette

The platform strictly reflects the warm, organic spiritual palette defined in `harisumiran_design_system/DESIGN.md`:
- **Canvas / Background**: `#FBF9F5` (Soft warm canvas to reduce fatigue)
- **Surfaces**: `#FFFFFF` with hairline borders (`#E8E0D8`) and subtle diffused shadows
- **Primary / Brand Action**: Deep Saffron (`#B84D17` / `#963700`)
- **Secondary / Growth**: Forest Green (`#2F6B4F` / `#2D694D`)
- **Typography**: `Plus Jakarta Sans` (Headings/Branding), `Inter` (Functional UI & Data), `Noto Sans Gujarati` (Gujarati script support)
- **Liquid Glass Navigation**: Floating blurred header, mobile pill tab bar, and command palette

---

## Key Modules & Features

1. **Multi-Persona Role Switcher (Top Header)**:
   - Instant switching between all 5 personas:
     1. **Mandir Administrator**: Mandir-wide operations hub, pending approvals queue, alerts & risks, KPIs
     2. **Karyakarta**: Fieldwork today view, 3 priority next actions, live QR attendance console
     3. **Department Head**: Kitchen, sound & volunteer roster coordination
     4. **Family Captain**: Household Thal turn confirmation/decline/swap, Sabha RSVPs, mandir announcements
     5. **Super Administrator**: System permissions matrix, audit logs, database purge & re-seed

2. **Families Module**:
   - 360° Household Profiles with members, touchpoints timeline, Thal history, and audit log
   - 3-step Registration Wizard with autosave draft & duplicate detection check
   - Field Interaction logger (Home Visit, Phone Call, Sabha contact) with follow-up case trigger

3. **Members Registry**:
   - Individual member directory with Seva skill tags and attendance streaks
   - Document & ID Verification Queue with approve/reject actions for admins

4. **Sabha & Live Attendance Console**:
   - 3 real-time entry modes: Fast Search Typeahead, Full Roster Checklist, and Interactive Camera/QR Scanner
   - Live attendance counter (Present / Expected) with instant checkmark pulse

5. **Follow-Up & Pastoral Care**:
   - Urgency-sorted queue (Overdue > 7 days, Due Today, Upcoming)
   - Role-masked confidential notes with visible lock indicators
   - Visit planner and closure request & supervisor approval workflow

6. **Seva & Volunteer Rosters**:
   - Seva opportunities catalog by department (Kitchen, Sound, Security, Bal Mandal)
   - Volunteer shift scheduler, duty QR check-in/out, and replacement request

7. **Assets & Hall Bookings**:
   - QR asset inventory management, borrow/return with return dates
   - Mandir hall/room reservation calendar with conflict detection

8. **Events & Digital Passes**:
   - Festival planning timeline, committee leads, checklist tasks
   - Apple Wallet-style Digital QR Entry Passes for members and gate pass scanner

9. **Thal (Meal Seva) Rotation**:
   - Monthly rotation calendar with unassigned alerts
   - AI-assisted fairness ranking algorithm (ensures equitable turns)
   - Swap request and coordinator approval workflow

10. **Communication & Broadcast**:
    - Multilingual broadcast composer (English & Gujarati) with WhatsApp & SMS previews
    - Targeted audience filter builder (Everyone, Area, Department)

11. **Admin & Controls**:
    - Interactive Role-Permission Matrix editor
    - Complete unmasked system audit trail
    - Type-to-confirm safe destructive action dialogs

---

## MongoDB Atlas Connection

Configured in `.env.local`:
```env
MONGODB_URI=mongodb+srv://pranavparmar1809_db_user:2YdrU4GRDBbDc69Y@cluster0.icxn6gj.mongodb.net/harisumiran?retryWrites=true&w=majority
```

---

## Postman API Collection

A full Postman Collection (v2.1) is included in the project root:
- File: [`postman_collection.json`](./postman_collection.json)
- Covers 20+ endpoints across all 12 operational modules with sample request bodies and variables (`{{baseUrl}}`).

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Seed initial data to MongoDB Atlas
# (You can also seed from the UI or via POST /api/seed)
curl -X POST http://localhost:3000/api/seed

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
