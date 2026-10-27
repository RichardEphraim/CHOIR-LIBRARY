# Implementation Plan: Church Room Codes, User Roles, Admin Approval & Universal Song Upload

## Summary of Goals
Implement an isolated church room system with unique uppercase room codes (e.g. `GC-8492`), role-based registration (`ADMIN` vs `MEMBER`), an Admin Approval workflow with access guarding (`PENDING` vs `APPROVED`), an Admin Member Management interface (`/admin/members`), and universal song upload permissions where uploaded songs are automatically tagged with the contributor's `@username`.

---

## 1. Schema & Data Model Updates
- **`ChurchTenant` (`src/types/choir.ts`)**:
  - Add `roomCode: string` (e.g. `GC-1042`, formatted as uppercase initials + 4 digits).
  - Add `createdAt: string`.
- **`UserProfile` & `AuthUser` (`src/types/choir.ts`, `src/types/auth.ts`)**:
  - Add `username: string` (unique per church room).
  - Update `role: 'ADMIN' | 'MEMBER'`.
  - Add `status: 'PENDING' | 'APPROVED' | 'REJECTED'`.
  - Add `createdAt: string`.
- **`Song` (`src/types/choir.ts`)**:
  - Add `uploadedByUserId: string`.
  - Add `broughtByName: string` (defaults to contributor's `username`, formatted with `@`).
- **Seed Data (`src/data/seedData.ts`)**:
  - Populate existing tenants with room codes:
    - Grace Cathedral: `GC-1042`
    - St. Jude Parish: `SJ-2045`
    - Trinity Evangelical: `TE-3098`
  - Include pre-seeded accounts:
    - Approved Admin & Choristers for testing immediate access.
    - Demo pending member requests (e.g., `@solomon_tenor` at Grace Cathedral, `@miriam_alto` at St. Jude) to allow immediate testing of the approval/rejection workflow in the Admin Dashboard.

---

## 2. Authentication & Room Code Backend Service (`src/services/authApi.ts`)
- **Room Code Generator Utility**:
  - Function `generateChurchRoomCode(churchName: string): string` generating uppercase initials + '-' + 4 random digits (e.g., "Grace Cathedral" -> `GC-8492`).
- **Admin Registration (`/signup` -> Admin)**:
  - Fields: Full Name, Unique Username, Email, Password, Church Name.
  - Generates new Church record with unique `roomCode`.
  - Sets user role to `ADMIN` and status to `APPROVED`.
  - Post-signup state presents the generated Church Room Code with a "Copy Code" button to share with choristers and a direct entry to the choir dashboard.
- **Member Registration (`/signup` -> Choir Member)**:
  - Fields: Full Name, Unique Username, Email, Password, Church Room Number / Access Code.
  - Real-time validation of entered room code against database.
  - If invalid: shows error *"Invalid Church Room Code. Please check with your choir admin."*
  - If valid: binds user to the target `churchId`, sets role to `MEMBER`, and status to `PENDING`.
  - Redirects user to `/pending-approval`.
- **Approval Actions**:
  - `approveMember(userId: string): Promise<void>` -> sets status to `APPROVED`.
  - `rejectMember(userId: string): Promise<void>` -> sets status to `REJECTED` or deletes record.
  - `getChurchMembers(churchId: string): Promise<UserProfile[]>` -> retrieves all members partitioned into pending and approved.

---

## 3. Access Guard & Pending Approval Screen
- **Access Guard Middleware (`src/App.tsx`)**:
  - Protects song library, audio player, favorites, and upload routes.
  - If logged-in user has `status === 'PENDING'`, intercept navigation and render the **Pending Approval Screen** (`/pending-approval`).
  - Only users with `status === 'APPROVED'` can enter the song library.
- **Pending Approval Screen Component (`src/components/auth/PendingApprovalPage.tsx`)**:
  - Displays church room badge and clear notice:
    *"Account created! Your join request for [Church Name] has been submitted. You will gain full access once your Choir Admin approves your account."*
  - Refresh button to re-check approval status immediately.
  - "Return to Sign In" / "Switch Account" action button.

---

## 4. Admin Member Management Screen (`src/components/admin/MemberManagementView.tsx`)
- Visible and accessible **only to Admin users** via a dedicated header nav link / pill with a live badge showing pending request counts.
- **Pending Requests Table**:
  - Displays: Full Name, `@username`, Email, Voice Part, Date Requested.
  - Actions:
    - **Approve Button** (crisp black button with checkmark icon) -> immediately approves user.
    - **Reject Button** (subtle outlined button) -> declines request.
- **Approved Roster Table**:
  - Displays all active approved members with their roles (`ADMIN` or `MEMBER`), `@username`, and voice parts.
  - Admin can copy the Church Room Code anytime from the header widget to invite more singers.

---

## 5. Universal Song Upload Permissions & Attribution
- Both **Admins and approved Members** have full access to add songs via the "Add Song" / "Upload Song" modal.
- Form automatically populates or locks the `Brought By` field to `@${currentUser.username}` (or allows adding original author credits while preserving `uploadedByUserId` and `broughtByName`).
- Song list and detail cards show the clean attribution tag: `Brought by @username`.

---

## 6. Minimalist Black & White UI / UX
- Clean, crisp monochromatic design with pure white backgrounds, subtle border separators (`border-neutral-200`), dark charcoal text (`text-neutral-900`), and pure black CTA buttons.
- Fully responsive across mobile (touch-friendly cards and action sheets) and desktop (tabular rosters and side-by-side forms).

---

## 7. Verification & Automated Tests
- Update unit tests in `src/services/authApi.test.ts` to test:
  - Admin registration generates valid room code.
  - Member registration fails with invalid room code and succeeds with valid room code.
  - Enforce unique usernames per church room.
  - Member approval changes status to `APPROVED` and grants library access.
- Run `compile_applet` and test suite to ensure clean build.
