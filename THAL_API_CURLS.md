# 🛕 HariSumiran — Thal Rotation Seva API Reference (cURL Commands)

This document contains all production and local **cURL** commands for **Module 1: Thal Rotation Seva**, authentication, swap management, and mobile push notifications for **HariSumiran (HariPrabodham, Nadiad)**.

> **Production Base URL**: `https://hari-sumiran-admin-dashboard.vercel.app`  
> **Local Base URL**: `http://localhost:3000`

---

## 🔐 1. Authentication & Session

### 1.1 Admin Email & Password Login
Authenticates the user as **Mandir Administrator** (`mandir_admin`).
* **Credentials**: `harisumiran369@gmail.com` / `Atmiyata@3690`

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/auth' \
--header 'Content-Type: application/json' \
--data '{
  "action": "login",
  "email": "harisumiran369@gmail.com",
  "password": "Atmiyata@3690"
}'
```

---

### 1.2 Sign in with Apple ID (Devotee / User Login)
Authenticates a devotee or family member (`family_captain` / `family_member`).

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/auth/apple' \
--header 'Content-Type: application/json' \
--data '{
  "appleId": "001928.82390184.apple",
  "name": "Rameshbhai Patel",
  "email": "ramesh.patel@privaterelay.appleid.com"
}'
```

---

## 🍲 2. Thal Schedule Management

### 2.1 Get Monthly Thal Rotation Schedule
Retrieves all Breakfast (Morning Thal) & Dinner (Evening Thal) rotation slots for a selected month along with fairness analytics.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal?month=2026-09'
```

---

### 2.2 Auto-Generate Monthly Rotation Plan (Admin Only)
Automatically assigns all days of the month evenly across registered families based on headcount and fairness algorithms.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal' \
--header 'Content-Type: application/json' \
--data '{
  "action": "auto_generate",
  "month": "2026-09"
}'
```

---

### 2.3 Assign Single Thal Turn (Breakfast or Dinner)
Manually assigns or overrides a Thal turn for a specific family.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal' \
--header 'Content-Type: application/json' \
--data '{
  "date": "2026-09-10",
  "mealType": "Breakfast (Morning Thal)",
  "assignedFamilyName": "Patel Household (Rameshbhai)",
  "assignedPhone": "9825056789",
  "headcount": 50
}'
```

---

### 2.4 Confirm Thal Turn RSVP Status
Used by Family Captains to confirm attendance and headcount for their assigned turn.

```bash
curl --location --request PUT 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal' \
--header 'Content-Type: application/json' \
--data '{
  "id": "THAL-101",
  "status": "Confirmed"
}'
```

---

## 🔄 3. Seva Swap Management

### 3.1 Submit Thal Swap Request (Family to Family or Open Waitlist)
Submits a swap request when a family cannot perform their assigned turn.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap' \
--header 'Content-Type: application/json' \
--data '{
  "thalScheduleId": "THAL-101",
  "originalDate": "2026-09-12",
  "mealType": "Dinner (Evening Thal)",
  "requestingFamilyName": "Patel Household (Rameshbhai)",
  "swapType": "admin_open_swap",
  "reason": "Family out of town for medical checkup"
}'
```

---

### 3.2 Get Pending Swap Requests Queue
Retrieves all open or pending swap requests requiring Admin or target Family approval.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap'
```

---

### 3.3 Admin Approve & Reassign Swap Request
Approves a pending swap and reassigns the turn to a replacement family.

```bash
curl --location --request PUT 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal/swap' \
--header 'Content-Type: application/json' \
--data '{
  "swapId": "SWAP-501",
  "action": "approve",
  "coordinatorNotes": "Approved and reassigned to Shah Family",
  "replacementFamilyName": "Shah Family (Mukeshbhai)"
}'
```

---

## 🔔 4. Notifications & Mobile Push Alerts

### 4.1 Check 1-Day Prior Thal Turn Alerts
Fetches active 1-day prior alerts for upcoming turns.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/thal/notifications'
```

---

### 4.2 Register Mobile Device FCM / APNs Token
Registers iOS/Android device push tokens for instant mobile notifications when swaps are requested or approved.

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/notifications/register-device' \
--header 'Content-Type: application/json' \
--data '{
  "userId": "USER-101",
  "deviceToken": "fcm_token_sample_device_abc123",
  "platform": "ios",
  "deviceModel": "iPhone 17 Pro Max"
}'
```

---

## 🗄️ 5. Database Health & Seeding

### 5.1 MongoDB Atlas Cluster Seed & Health Check

```bash
curl --location 'https://hari-sumiran-admin-dashboard.vercel.app/api/seed'
```

---

## 💻 Localhost Environment Equivalents

Replace `https://hari-sumiran-admin-dashboard.vercel.app` with `http://localhost:3000` when testing locally:

```bash
# Admin Auth (Local)
curl --location 'http://localhost:3000/api/auth' \
--header 'Content-Type: application/json' \
--data '{"action": "login", "email": "harisumiran369@gmail.com", "password": "Atmiyata@3690"}'

# Get Thal Rotation (Local)
curl --location 'http://localhost:3000/api/thal?month=2026-09'

# Auto-Generate September Plan (Local)
curl --location 'http://localhost:3000/api/thal' \
--header 'Content-Type: application/json' \
--data '{"action": "auto_generate", "month": "2026-09"}'
```
