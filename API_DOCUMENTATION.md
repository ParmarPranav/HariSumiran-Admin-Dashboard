# HariSumiran Mobile & Web Client — Complete REST API & cURL Specification

> **HariSumiran Mandir Operations & Devotee Engagement Platform**  
> *Backend Base URL (Production)*: `https://hari-sumiran-admin-dashboard.vercel.app`  
> *Backend Base URL (Local Development)*: `http://localhost:3000`  
> *Standard Content-Type*: `application/json`  
> *Authorization*: `Bearer <token>` (provided in headers for authenticated requests)

---

## Table of Contents
1. [Architecture & Persona Scopes](#1-architecture--persona-scopes)
2. [Global Headers & Error Handling](#2-global-headers--error-handling)
3. [Authentication & Biometrics](#3-authentication--biometrics)
4. [Push Notifications & Device Registration](#4-push-notifications--device-registration)
5. [Aggregated Dashboard ("HariSumiran Pulse")](#5-aggregated-dashboard-harisumiran-pulse)
6. [Thal Rotation & Mahaprasad Turns](#6-thal-rotation--mahaprasad-turns)
7. [Thal Swaps & Two-Step Approval Workflow](#7-thal-swaps--two-step-approval-workflow)
8. [Sabha Management & Attendance (QR Check-In)](#8-sabha-management--attendance-qr-check-in)
9. [Seva Opportunities, Slot Claiming & Rosters](#9-seva-opportunities-slot-claiming--rosters)
10. [Kitchen Scaling & Recipe Engine](#10-kitchen-scaling--recipe-engine)
11. [Carpool & Transportation](#11-carpool--transportation)
12. [Families & Household Directory](#12-families--household-directory)
13. [Member Registry & Verification Queue](#13-member-registry--verification-queue)
14. [Karyakarta Follow-Up & Pastoral Care](#14-karyakarta-follow-up--pastoral-care)
15. [Assets, Borrowing & Room Bookings](#15-assets-borrowing--room-bookings)
16. [Events, Mahotsav & QR Gate Passes](#16-events-mahotsav--qr-gate-passes)
17. [Announcements, Analytics & Admin Seed](#17-announcements-analytics--admin-seed)
18. [Mobile Client Developer Best Practices](#18-mobile-client-developer-best-practices)

---

## 1. Architecture & Persona Scopes

Every user profile in HariSumiran contains one or more `responsibilities` determining their data visibility and capabilities:

| Persona Scope | Responsibility Enum | Primary Capabilities |
| :--- | :--- | :--- |
| **Mandir Super Admin** | `super_admin` / `mandir_admin` | Full CRUD across all 17 modules, approve swaps, user management, audit logs. |
| **Thal Captain** | `thal_captain` | View assigned family turns, confirm/decline, request swaps, approve incoming swaps. |
| **Sabha Karyakarta** | `sabha_karyakarta` | Manage sabha checklists, scan QR attendance, view roster streaks. |
| **Kitchen Lead / Cook** | `main_cook` / `sub_cook` | Access recipes, calculate ingredient quantities dynamically by headcount. |
| **Car Owner / Driver** | `car_owner` | Offer carpool rides, approve/reject passenger seat requests. |
| **Pastoral Karyakarta** | `karyakarta` | Log family interactions, manage follow-up cases with confidential notes. |
| **Regular Devotee** | `regular_member` | Claim open seva slots, book rides, view sabha schedules, generate event passes. |

---

## 2. Global Headers & Error Handling

### Request Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
```

### Standard Response Envelope
All successful requests return a JSON object with `success: true`:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Standard Error Envelope
Failed requests return an HTTP 4xx or 5xx code with `success: false`:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---

## 3. Authentication & Biometrics

### 3.1 Passcode / PIN Login & Unlock
* **Endpoint**: `POST /api/auth`
* **Description**: Authenticate user via 4-digit PIN (default demo PIN: `3690`) or phone/email.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "pin": "3690",
    "phone": "9825056789"
  }'
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "message": "Unlock successful",
  "user": {
    "_id": "66dd10010000000000000003",
    "name": "Rameshbhai Patel",
    "phone": "9825056789",
    "role": "family_captain",
    "familyId": "66dd10010000000000000010",
    "familyName": "Patel Household (Rameshbhai)",
    "responsibilities": [
      {
        "type": "thal_captain",
        "title": "Thal Captain",
        "scope": { "familyId": "66dd10010000000000000010" }
      }
    ]
  },
  "scope": {
    "isAdmin": false,
    "isThalCaptain": true,
    "isKaryakarta": false,
    "isMainCook": false,
    "isCarOwner": false,
    "familyId": "66dd10010000000000000010"
  },
  "token": "jwt_token_1726050000000"
}
```

---

### 3.2 Update / Setup Passcode PIN
* **Endpoint**: `POST /api/auth`
* **Description**: Set or change user's 4-digit PIN.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setup_pin",
    "userId": "66dd10010000000000000003",
    "newPin": "1234"
  }'
```

---

### 3.3 List Active Personas (Fast Switcher)
* **Endpoint**: `GET /api/auth`
* **Description**: Fetches all available personas and active user profiles for quick switching in demo/development mode.

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/auth \
  -H "Accept: application/json"
```

---

### 3.4 Google OAuth Mobile Token Exchange
* **Endpoint**: `POST /api/auth/google`
* **Description**: Authenticate or auto-register devotee using Google Sign-In identity token.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh.patel@gmail.com",
    "name": "Rameshbhai Patel",
    "googleId": "google-oauth2-1082390123"
  }'
```

---

### 3.5 Apple Sign-In Token Exchange
* **Endpoint**: `POST /api/auth/apple`
* **Description**: Authenticate or auto-register devotee using Apple Private Relay / Sign In with Apple credential.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/auth/apple \
  -H "Content-Type: application/json" \
  -d '{
    "appleId": "000123.abcde987654.1234",
    "email": "devotee.private@privaterelay.appleid.com",
    "name": "Pranav Parmar"
  }'
```

---

## 4. Push Notifications & Device Registration

### 4.1 Register Device APNs / FCM Push Token
* **Endpoint**: `POST /api/notifications/register-device`
* **Description**: Registers an iOS (APNs) or Android (FCM) device token to receive instant Thal turn reminders, carpool alerts, and seva notifications.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "66dd10010000000000000003",
    "phone": "9825056789",
    "deviceToken": "fcm_token_sample_abc123xyz789_apns_devotee_iphone",
    "platform": "ios"
  }'
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "message": "Registered IOS device push token successfully",
  "registeredTokens": 1
}
```

---

## 5. Aggregated Dashboard ("HariSumiran Pulse")

### 5.1 Get Home Dashboard Summary
* **Endpoint**: `GET /api/dashboard/home`
* **Query Parameters**:
  * `userId`: *(optional)* MongoDB User ID
  * `userName`: *(optional)* Devotee Name (e.g., `Rameshbhai Patel`)
* **Description**: Returns a tailored 3-part feed:
  1. `whatIsHappening`: Upcoming Sabhas, Events, Carpools, Announcements.
  2. `whatDoINeedToDo`: Role-scoped urgent action items (Thal turn due, pending swap approvals, follow-up visits, carpool requests).
  3. `whereCanIHelp`: Open seva opportunities with unfilled volunteer slots.

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/dashboard/home?userId=66dd10010000000000000003" \
  -H "Accept: application/json"
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "whatIsHappening": {
    "upcomingSabhas": [ ... ],
    "upcomingEvents": [ ... ],
    "activeRides": [ ... ],
    "announcements": [ ... ]
  },
  "whatDoINeedToDo": [
    {
      "id": "action-thal",
      "type": "thal",
      "title": "Your Household Thal Turn",
      "gujaratiTitle": "તમારા પરિવારનો થાળ વારો",
      "description": "Breakfast (Morning Thal) on 2026-09-08 (Headcount: 55)",
      "link": "/thal",
      "urgency": "High",
      "badge": "Assigned"
    }
  ],
  "whereCanIHelp": [ ... ]
}
```

---

## 6. Thal Rotation & Mahaprasad Turns

### 6.1 Get Monthly Thal Schedule & Fairness Ranking
* **Endpoint**: `GET /api/thal`
* **Query Parameters**:
  * `month`: *(optional)* Filter month (e.g., `2026-09`)
* **Description**: Returns all morning and evening Thal allocations, assigned families, headcount, status, and fairness ranking.

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/thal?month=2026-09" \
  -H "Accept: application/json"
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "count": 60,
  "schedules": [
    {
      "_id": "66dd20010000000000000001",
      "scheduleCode": "THAL-2026-0901-M",
      "date": "2026-09-01",
      "monthPeriod": "2026-09",
      "mealType": "Breakfast (Morning Thal)",
      "assignedFamilyId": "66dd10010000000000000010",
      "assignedFamilyName": "Patel Household (Rameshbhai)",
      "assignedPhone": "9825056789",
      "captainName": "Rameshbhai Patel",
      "headcount": 50,
      "status": "Confirmed",
      "specialInstructions": "Puri, Shrikhand, Bataka nu Shaak, Dal Bhat"
    }
  ],
  "fairnessRanking": [
    {
      "familyId": "66dd10010000000000000010",
      "familyName": "Patel Household (Rameshbhai)",
      "turnsThisYear": 3
    }
  ]
}
```

---

### 6.2 Assign Manual Thal Turn
* **Endpoint**: `POST /api/thal`
* **Description**: Assign a specific family to a meal slot.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/thal \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-09-25",
    "mealType": "Dinner (Evening Thal)",
    "assignedFamilyId": "66dd10010000000000000010",
    "assignedFamilyName": "Patel Household (Rameshbhai)",
    "assignedPhone": "9825056789",
    "headcount": 65,
    "specialInstructions": "Kathiyawadi Khichdi, Kadhi, Lasaniya Bataka"
  }'
```

---

### 6.3 Auto-Generate Full Month Schedule
* **Endpoint**: `POST /api/thal`
* **Description**: Automatically rotates active families across morning and evening turns for the given month.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/thal \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auto_generate",
    "month": "2026-10"
  }'
```

---

### 6.4 Update Thal Turn Status / Notes
* **Endpoint**: `PUT /api/thal`
* **Description**: Confirm, complete, or decline a Thal turn.

```bash
curl -X PUT https://hari-sumiran-admin-dashboard.vercel.app/api/thal \
  -H "Content-Type: application/json" \
  -d '{
    "id": "66dd20010000000000000001",
    "status": "Confirmed",
    "specialInstructions": "Will bring Shrikhand and Puri on time by 7:30 AM"
  }'
```

---

### 6.5 Get / Dispatch 1-Day Prior Push Reminders
* **Endpoint**: `GET /api/thal/notifications` (List pending reminders)
* **Endpoint**: `POST /api/thal/notifications` (Mark dispatched)

```bash
# 1. Fetch upcoming turn notifications
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/thal/notifications \
  -H "Accept: application/json"

# 2. Dispatch reminder push notification
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/thal/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "66dd20010000000000000001"
  }'
```

---

## 7. Thal Swaps & Two-Step Approval Workflow

### 7.1 List All Thal Swap Requests
* **Endpoint**: `GET /api/thal/swap`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap \
  -H "Accept: application/json"
```

---

### 7.2 Submit a Thal Swap Request
* **Endpoint**: `POST /api/thal/swap`
* **Description**: Devotee requests a direct swap with another family or releases turn into the open pool.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap \
  -H "Content-Type: application/json" \
  -d '{
    "thalScheduleId": "66dd20010000000000000001",
    "originalDate": "2026-09-12",
    "mealType": "Dinner (Evening Thal)",
    "requestingFamilyId": "66dd10010000000000000010",
    "requestingFamilyName": "Patel Household (Rameshbhai)",
    "requestingCaptainName": "Rameshbhai Patel",
    "swapType": "family_to_family",
    "targetFamilyId": "66dd10010000000000000012",
    "targetFamilyName": "Shah Family (Kiritbhai)",
    "targetCaptainName": "Kiritbhai Shah",
    "suggestedDate": "2026-09-18",
    "reason": "Family attending hospital medical checkup in Ahmedabad."
  }'
```

---

### 7.3 Target Captain Decision (Accept / Reject)
* **Endpoint**: `PUT /api/thal/swap`
* **Action**: `target_accept` or `target_reject`

```bash
# Target captain accepts the swap request
curl -X PUT https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap \
  -H "Content-Type: application/json" \
  -d '{
    "swapId": "66dd25010000000000000001",
    "action": "target_accept"
  }'
```

---

### 7.4 Mandir Admin Final Approval / Override
* **Endpoint**: `PUT /api/thal/swap`
* **Action**: `admin_approve`, `admin_reject`, or `admin_override`

```bash
# Admin grants final approval (automatically updates the master Thal schedule)
curl -X PUT https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap \
  -H "Content-Type: application/json" \
  -d '{
    "swapId": "66dd25010000000000000001",
    "action": "admin_approve",
    "adminNotes": "Approved by Mandir Coordinator Nitinbhai"
  }'
```

---

## 8. Sabha Management & Attendance (QR Check-In)

### 8.1 List Sabha Sessions
* **Endpoint**: `GET /api/sabha`
* **Query Parameters**:
  * `type`: Filter by type (e.g. `Youth Male`, `Family Sabha`, `Evening Sabha`)
  * `status`: Filter by status (`Scheduled`, `Live`, `Completed`)
  * `date`: Filter by `YYYY-MM-DD`

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/sabha?status=Scheduled" \
  -H "Accept: application/json"
```

---

### 8.2 Schedule a New Sabha
* **Endpoint**: `POST /api/sabha`

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/sabha \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sunday Youth Evening Sabha",
    "gujaratiTitle": "રવિવાર યુવક સાંધ્ય સભા",
    "type": "Youth Male",
    "date": "2026-09-13",
    "startTime": "18:00",
    "endTime": "20:00",
    "location": "Main Satsang Hall, Nadiad",
    "expectedCount": 150,
    "checklist": [
      { "item": "Sound system & mic check", "completed": true },
      { "item": "Stage floral decoration", "completed": false },
      { "item": "Mahaprasad ready in dining hall", "completed": false }
    ],
    "notes": "Special kirtan aradhana session."
  }'
```

---

### 8.3 Get Sabha Live Roster & Attendance Counts
* **Endpoint**: `GET /api/sabha/attendance?sabhaId=<id>`

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/sabha/attendance?sabhaId=66dd30010000000000000001" \
  -H "Accept: application/json"
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "totalCount": 42,
  "presentCount": 18,
  "roster": [
    {
      "memberId": "66dd40010000000000000001",
      "memberName": "Pranav Parmar",
      "gujaratiName": "પ્રણવ પરમાર",
      "familyName": "Parmar Family",
      "phone": "9825012345",
      "isPresent": true,
      "attendanceStreak": 14
    }
  ]
}
```

---

### 8.4 Mark Attendance (QR Scanner / Member Code / Name Search)
* **Endpoint**: `POST /api/sabha/attendance`
* **Description**: 1-tap or QR camera check-in for devotees. Automatically increments attendance streak.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/sabha/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "sabhaId": "66dd30010000000000000001",
    "memberCode": "MEM-NAD-001",
    "mode": "QR",
    "markedBy": "Jaimin Trivedi (Karyakarta)"
  }'
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "message": "Marked attendance for Pranav Parmar",
  "member": {
    "id": "66dd40010000000000000001",
    "name": "Pranav Parmar",
    "familyName": "Parmar Family",
    "streak": 15
  },
  "liveCount": 19
}
```

---

## 9. Seva Opportunities, Slot Claiming & Rosters

### 9.1 List Seva Opportunities & Assigned Rosters
* **Endpoint**: `GET /api/seva`
* **Query Parameters**:
  * `department`: `Kitchen`, `Sound & Audio`, `Stage`, `Parking`, `Decoration`, `Medical`

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/seva?department=Kitchen" \
  -H "Accept: application/json"
```

---

### 9.2 Devotee 1-Tap Seva Slot Claiming
* **Endpoint**: `POST /api/seva/claim`
* **Description**: Devotee self-enrolls into an open seva opportunity from their mobile app.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/seva/claim \
  -H "Content-Type: application/json" \
  -d '{
    "opportunityTitle": "Mahaprasad Vegetable Chopping Seva",
    "memberId": "66dd40010000000000000001",
    "memberName": "Pranav Parmar",
    "phone": "9825012345"
  }'
```

---

### 9.3 Assign Volunteer to Shift Roster
* **Endpoint**: `POST /api/seva/roster`

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/seva/roster \
  -H "Content-Type: application/json" \
  -d '{
    "opportunityId": "66dd50010000000000000001",
    "date": "2026-09-13",
    "shiftStartTime": "16:00",
    "shiftEndTime": "19:30",
    "volunteerId": "66dd40010000000000000001",
    "volunteerName": "Pranav Parmar",
    "volunteerPhone": "9825012345"
  }'
```

---

### 9.4 Volunteer Shift Check-In / Check-Out / Replacement Request
* **Endpoint**: `POST /api/seva/check-in`
* **Action**: `check_in`, `check_out`, or `request_replacement`

```bash
# Check in for shift duty
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/seva/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "rosterId": "66dd55010000000000000001",
    "action": "check_in"
  }'
```

---

## 10. Kitchen Scaling & Recipe Engine

### 10.1 List Standard Temple Recipes
* **Endpoint**: `GET /api/kitchen/recipes`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/kitchen/recipes \
  -H "Accept: application/json"
```

---

### 10.2 Calculate Ingredient Quantities by Headcount
* **Endpoint**: `POST /api/kitchen/calculate`
* **Description**: Dynamically calculates raw ingredient weights (kg, liters, grams) based on devotee headcount.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/kitchen/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "recipeCode": "REC-001",
    "headcount": 350
  }'
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "recipeName": "Kathiyawadi Khichdi & Gujarati Kadhi",
  "gujaratiRecipeName": "કાઠિયાવાડી ખીચડી અને ગુજરાતી કઢી",
  "headcount": 350,
  "ingredients": [
    {
      "name": "Basmati Rice",
      "gujaratiName": "ચોખા",
      "baseQuantityFor10": 1.2,
      "calculatedQuantity": 42.0,
      "unit": "kg",
      "notes": "Wash and soak 30 min"
    },
    {
      "name": "Tuver Dal & Moong Dal",
      "gujaratiName": "તુવેર દાળ અને મગ દાળ",
      "baseQuantityFor10": 0.8,
      "calculatedQuantity": 28.0,
      "unit": "kg"
    },
    {
      "name": "Desi Cow Ghee",
      "gujaratiName": "શુદ્ધ ઘી",
      "baseQuantityFor10": 0.4,
      "calculatedQuantity": 14.0,
      "unit": "kg"
    }
  ]
}
```

---

## 11. Carpool & Transportation

### 11.1 List Scheduled Carpool Rides
* **Endpoint**: `GET /api/transportation/rides`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/transportation/rides \
  -H "Accept: application/json"
```

---

### 11.2 Offer a Carpool Ride
* **Endpoint**: `POST /api/transportation/rides`
* **Description**: Devotee driver registers empty seats in their vehicle for Sabha or Event travel.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/transportation/rides \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ride from Station Road to Mandir",
    "gujaratiTitle": "સ્ટેશન રોડ થી મંદિર સુધી રાઈડ",
    "driverName": "Amitbhai Soni",
    "driverPhone": "9825098765",
    "vehicleModel": "Toyota Innova Crysta (White)",
    "vehicleNumber": "GJ-07-AB-1234",
    "totalSeats": 6,
    "departureTime": "2026-09-13T17:15:00",
    "departureLocation": "Station Road Cross, Nadiad",
    "destination": "HariPrabodham Mandir, Nadiad",
    "routeNotes": "Can pick up devotees near College Road and Santram Mandir."
  }'
```

---

### 11.3 Request a Seat on a Ride
* **Endpoint**: `POST /api/transportation/request`
* **Description**: Passenger requests 1 or more seats with a specified pickup point.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/transportation/request \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "66dd60010000000000000001",
    "passengerName": "Pranav Parmar",
    "passengerPhone": "9825012345",
    "pickupPoint": "College Road Bus Stand",
    "seatsRequested": 2
  }'
```

---

### 11.4 Driver Approve / Reject Passenger Request
* **Endpoint**: `PUT /api/transportation/request`
* **Action**: `approve` or `reject`

```bash
# Driver approves seat
curl -X PUT https://hari-sumiran-admin-dashboard.vercel.app/api/transportation/request \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "66dd60010000000000000001",
    "requestId": "REQ-1234",
    "action": "approve"
  }'
```

---

## 12. Families & Household Directory

### 12.1 Search & Filter Families
* **Endpoint**: `GET /api/families`
* **Query Parameters**:
  * `search`: Search name, captain name, phone, or address
  * `area`: Filter area (e.g. `Station Road`, `Santram Road`, `College Road`)
  * `engagement`: `High`, `Medium`, `Low`, `At-Risk`
  * `status`: `Active`, `Pending Review`, `Duplicate Flagged`

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/families?search=Patel&area=Station%20Road" \
  -H "Accept: application/json"
```

---

### 12.2 Register a New Household Family
* **Endpoint**: `POST /api/families`
* **Description**: Includes duplicate detection check on phone and name.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/families \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Patel Household (Nitinbhai)",
    "gujaratiName": "પટેલ પરિવાર (નીતિનભાઈ)",
    "captainName": "Nitinbhai Patel",
    "phone": "9825011223",
    "alternatePhone": "9825011224",
    "address": "B-402, Shivalik Heights, Station Road",
    "area": "Station Road",
    "zone": "Central Nadiad",
    "notes": "Active family, interested in Thal and Kitchen seva.",
    "members": [
      {
        "name": "Nitinbhai Patel",
        "dob": "1975-04-12",
        "gender": "Male",
        "relationship": "Head of Family",
        "sevaSkills": ["Thal Coordination", "Admin"]
      },
      {
        "name": "Geetaben Patel",
        "dob": "1978-08-20",
        "gender": "Female",
        "relationship": "Spouse",
        "sevaSkills": ["Kitchen Preparation", "Rangoli"]
      }
    ]
  }'
```

---

### 12.3 Get Family Deep 360-Degree Profile
* **Endpoint**: `GET /api/families/[id]`
* **Description**: Fetches family details, linked members, active follow-up cases, Thal history, and interaction audit trail.

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/families/66dd10010000000000000010" \
  -H "Accept: application/json"
```

---

### 12.4 Log Pastoral Interaction & Open Follow-Up Case
* **Endpoint**: `POST /api/families/[id]`

```bash
curl -X POST "https://hari-sumiran-admin-dashboard.vercel.app/api/families/66dd10010000000000000010" \
  -H "Content-Type: application/json" \
  -d '{
    "interactionType": "Home Visit",
    "notes": "Visited family for Padharmani. Both parents are healthy. Son requested youth sabha reminder.",
    "requiresFollowUp": true,
    "urgency": "Upcoming",
    "category": "Youth Engagement"
  }'
```

---

## 13. Member Registry & Verification Queue

### 13.1 Search Members
* **Endpoint**: `GET /api/members`
* **Query Parameters**:
  * `search`: Name, phone, memberCode
  * `skill`: Filter by seva skill (e.g. `Sound`, `Kitchen`, `Medical`)
  * `status`: `Verified`, `Pending Verification`, `Rejected`
  * `familyId`: Filter members of a specific family

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/members?status=Pending%20Verification" \
  -H "Accept: application/json"
```

---

### 13.2 Register Canonical Member with Auto QR Code
* **Endpoint**: `POST /api/members`

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "familyName": "Patel Household (Rameshbhai)",
    "name": "Harsh Patel",
    "gujaratiName": "હર્ષ પટેલ",
    "dob": "2002-06-15",
    "gender": "Male",
    "phone": "9825099887",
    "email": "harsh.patel@gmail.com",
    "relationship": "Son",
    "sabhaCategory": "Youth Male",
    "sevaSkills": ["Sound & Audio", "Photography", "Live Streaming"],
    "communicationConsent": true,
    "photoConsent": true
  }'
```

---

### 13.3 Verify / Update Member
* **Endpoint**: `PUT /api/members/[id]`

```bash
curl -X PUT "https://hari-sumiran-admin-dashboard.vercel.app/api/members/66dd40010000000000000001" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationStatus": "Verified"
  }'
```

---

## 14. Karyakarta Follow-Up & Pastoral Care

### 14.1 List Follow-Up Cases
* **Endpoint**: `GET /api/follow-up`
* **Query Parameters**:
  * `urgency`: `Overdue`, `Due Today`, `Upcoming`
  * `status`: `Open`, `Visit Planned`, `Pending Approval`, `Closed`

```bash
curl -X GET "https://hari-sumiran-admin-dashboard.vercel.app/api/follow-up?urgency=Overdue&status=Open" \
  -H "Accept: application/json"
```

---

### 14.2 Create Follow-Up Case
* **Endpoint**: `POST /api/follow-up`

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/follow-up \
  -H "Content-Type: application/json" \
  -d '{
    "familyId": "66dd10010000000000000010",
    "familyName": "Patel Household (Rameshbhai)",
    "category": "Extended Absence",
    "urgency": "Due Today",
    "dueDate": "2026-09-12",
    "assignedKaryakartaName": "Jaimin Trivedi",
    "initialNote": "Absent from last 3 Sunday sabhas. Please call and schedule visit."
  }'
```

---

### 14.3 Add Confidential Note / Plan Visit / Request Closure
* **Endpoint**: `PUT /api/follow-up/[id]`
* **Action**: `add_note`, `plan_visit`, `request_closure`, `approve_closure`

```bash
# Add a confidential note
curl -X PUT "https://hari-sumiran-admin-dashboard.vercel.app/api/follow-up/66dd70010000000000000001" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_note",
    "authorName": "Jaimin Trivedi",
    "note": "Spoke to father on phone. Family was out of town for wedding. Will attend this Sunday."
  }'
```

---

## 15. Assets, Borrowing & Room Bookings

### 15.1 List Assets & Facilities
* **Endpoint**: `GET /api/assets`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/assets \
  -H "Accept: application/json"
```

---

### 15.2 Borrow / Return Equipment
* **Endpoint**: `POST /api/assets/borrow`
* **Action**: `borrow`, `return`, `report_maintenance`

```bash
# Borrow wireless microphone
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/assets/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "66dd80010000000000000001",
    "action": "borrow",
    "holderName": "Pranav Parmar",
    "returnDate": "2026-09-14"
  }'
```

---

### 15.3 Book Sabha Hall / Room with Collision Check
* **Endpoint**: `POST /api/assets/rooms`

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/assets/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "Main Satsang Hall",
    "purpose": "Yuva Mandal Kirtan Practice",
    "bookedBy": "Harsh Patel",
    "date": "2026-09-12",
    "startTime": "15:00",
    "endTime": "17:00",
    "attendees": 25
  }'
```

---

## 16. Events, Mahotsav & QR Gate Passes

### 16.1 List Upcoming Events & Mahotsav
* **Endpoint**: `GET /api/events`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/events \
  -H "Accept: application/json"
```

---

### 16.2 Generate Digital QR Gate Pass for Devotee
* **Endpoint**: `POST /api/events/register`
* **Description**: Generates a verified entrance pass code (`PASS-2026-XXXX`) for scanning at event gates.

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/events/register \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "66dd90010000000000000001",
    "memberName": "Pranav Parmar",
    "memberId": "66dd40010000000000000001",
    "familyId": "66dd10010000000000000010"
  }'
```

#### Response (HTTP 200)
```json
{
  "success": true,
  "message": "Event pass generated successfully",
  "passCode": "PASS-2026-7K9A2",
  "registration": {
    "_id": "66dd95010000000000000001",
    "eventId": "66dd90010000000000000001",
    "eventTitle": "Janmashtami Mahotsav 2026",
    "memberName": "Pranav Parmar",
    "passCode": "PASS-2026-7K9A2",
    "status": "Registered"
  }
}
```

---

## 17. Announcements, Analytics & Admin Seed

### 17.1 Broadcast Announcement
* **Endpoint**: `POST /api/announcements`

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Special Jal Jhilani Ekadashi Utsav this Friday",
    "gujaratiTitle": "આ શુક્રવારે વિશેષ જલ ઝીલણી એકાદશી ઉત્સવ",
    "body": "Jay Swaminarayan! All devotees are cordially invited for the Jal Jhilani Utsav and boat procession at 5:30 PM followed by Mahaprasad.",
    "targetAudience": "Everyone",
    "channels": ["App Push", "WhatsApp"],
    "authorName": "Mandir Office"
  }'
```

---

### 17.2 Get Executive Analytics & Attendance Trends
* **Endpoint**: `GET /api/analytics`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/analytics \
  -H "Accept: application/json"
```

---

### 17.3 System Role Permissions Matrix & Audit Logs
* **Endpoint**: `GET /api/admin`

```bash
curl -X GET https://hari-sumiran-admin-dashboard.vercel.app/api/admin \
  -H "Accept: application/json"
```

---

### 17.4 Database Reset & Seed Operational Data
* **Endpoint**: `POST /api/seed`
* **Description**: Flushes and repopulates database with pristine September 2026 operational records (60 Thal turns, 30 families, 120 members, recipes, rides, sabhas).

```bash
curl -X POST https://hari-sumiran-admin-dashboard.vercel.app/api/seed \
  -H "Content-Type: application/json"
```

---

## 18. Mobile Client Developer Best Practices

### 1. QR Code Formats
* **Member Digital ID QR**: `MEMBER:<MEMBER_CODE>:<NAME>`  
  *(Example: `MEMBER:MEM-NAD-001:PRANAV_PARMAR`)*
* **Event Gate Pass QR**: `PASS:<EVENT_CODE>:<PASS_CODE>`  
  *(Example: `PASS:EVT-2026-001:PASS-2026-7K9A2`)*
* **Thal Turn Verification QR**: `THAL:<SCHEDULE_CODE>:<FAMILY_CODE>`  
  *(Example: `THAL:THAL-2026-0901-M:FAM-NAD-001`)*

### 2. Local Caching & Offline Mode
* Cache `GET /api/dashboard/home` and member profile in SQLite / Hive / CoreData.
* When offline, allow Sabha attendance QR scanning into local queue, then batch-post via `POST /api/sabha/attendance` on network reconnection.

### 3. Biometric Authentication Workflow
1. On initial login with PIN (`3690`), receive JWT `token` and store securely in Keychain / EncryptedSharedPreferences.
2. Prompt devotee: *"Enable Face ID / Fingerprint unlock for HariSumiran"*.
3. On subsequent app cold starts, authenticate biometric locally on device without requiring PIN re-entry.
