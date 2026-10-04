# Security Specifications for AsKep 3S (Firestore ABAC)

## 1. Data Invariants
1. **User Isolation**: A user can only access, create, update, or delete their own user profile and their own patient records (`ownerId == request.auth.uid`).
2. **Patient Ownership**: A Patient document must always carry an immutable `ownerId` matching `request.auth.uid`.
3. **CarePlan Integrity**: A CarePlan document must reference a valid `patientId` and have `ownerId == request.auth.uid`.
4. **No Cross-User Access**: Perawat A cannot list, view, edit, or delete Perawat B's patients or care plans.
5. **No Spoofing**: Users cannot spoof `ownerId` or elevate permissions.

## 2. The "Dirty Dozen" Payloads (Designed to test boundaries)
1. **Unauthenticated Read on /patients**: Attempt to read without auth token -> DENIED.
2. **Unauthenticated Write on /patients**: Attempt to inject record without auth -> DENIED.
3. **Alien Patient Read**: User A tries to `get` `/patients/patient_of_user_b` -> DENIED.
4. **Alien Patient List**: User A queries `/patients` where `ownerId == user_b` -> DENIED.
5. **Owner ID Spoofing on Create**: User A creates patient with `ownerId: "user_b"` -> DENIED.
6. **Owner ID Tampering on Update**: User A attempts to mutate `ownerId` of their patient -> DENIED.
7. **Junk ID Poisoning**: Create patient with ID containing malicious characters `../../exploit` -> DENIED by `isValidId`.
8. **Denial of Wallet Huge String**: Patient record with 2MB initials string -> DENIED by size guard.
9. **Alien CarePlan Injection**: User A creates a CarePlan pointing to User B's patient -> DENIED.
10. **Blanket Query Attempt**: User A queries `collection('patients')` without filtering by `ownerId == request.auth.uid` -> DENIED by Query Enforcer.
11. **User Profile Tampering**: User A attempts to update User B's `/users/{userB}` profile -> DENIED.
12. **Anonymous Write (if not verified)**: Unverified caller attempts write -> DENIED.

## 3. Rules Strategy
- Default deny: `match /{document=**} { allow read, write: if false; }`
- Reusable helper functions: `isSignedIn()`, `isValidId(id)`, `isOwner(userId)`.
- Explicit `allow list` checking `resource.data.ownerId == request.auth.uid`.
- Strict validation helpers for User, Patient, and CarePlan.
