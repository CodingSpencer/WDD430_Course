# F02 — User Registration & Authentication

> Implementation plan. Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§6–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F02 |
| **Section** | Project Foundation - User Registration & Authentication |
| **Severity** | BLOCKER |
| **Markets** | Local recreational sports communities (specifically in the United States) |
| **Status (today)** | MISSING - no RecSquad authentication code has been implemented yet |
| **Estimated effort** | S (2–3 working days) |
| **Owner** | Backend & Full-Stack Leads (Team) |
| **Depends on** | F01 - database and API foundation |
| **Unblocks** | F03–F10 features that need to know which player is using the app |

---

## 1. Problem

RecSquad does not yet have accounts or sign-in. Without them, players cannot save information to their own accounts, and the app cannot check who is allowed to change something. This feature adds basic accounts and sign-in so the other features can build on them.

## 2. Goals

- Let a player create an account with an email address and password.
- Let a player sign in, stay signed in between pages, and sign out.
- Let the server identify the signed-in player and check their role.
- Provide simple, mobile-friendly sign-up and sign-in screens.
- Use a third-party email service to verify email addresses and reset passwords.

## 3. Not Included

- Sign-in with Google, Apple, or another service.
- Two-step sign-in, passkeys, or organization-wide sign-in.
- Editing a player's profile and sport preferences (F03).
- Creating groups, scheduling games, RSVPs, scorekeeping, or leaderboards (F04–F10).
- An admin screen for managing users.

## 4. People Who Use This

- **Player:** I want to make an account and sign in so my RecSquad activity is saved under my name.
- **Organizer:** I want the app to know that I am signed in so it can check whether I am allowed to manage my group.
- **Administrator:** I want regular sign-up to create player accounts only, so a new user cannot give themselves admin access.
- **Returning player:** I want to sign out, especially when I use a shared device.
- **Account owner:** I want to verify my email and reset a forgotten password using links sent to my email.

## 5. What the System Must Do

“Must” means required for this feature.

### Create an account

- **FR-1.** The system must let a player create an account using an email address, password, and name.
- **FR-2.** The system must trim extra spaces from an email and treat upper- and lower-case letters as the same address.
- **FR-3.** The system must prevent two accounts from using the same email address.
- **FR-4.** Every account created through public sign-up must have the `PLAYER` role. A user must not be able to sign themselves up as an `ORGANIZER` or `ADMIN`.
- **FR-5.** The system must store a password hash (a protected version of the password), never the actual password. Use the password hashing method agreed in F01.
- **FR-6.** Responses to the client must never contain a password or password hash.

### Sign in and sign out

- **FR-7.** The system must let a player sign in with their email and password.
- **FR-8.** The system must keep the player signed in using a secure browser cookie and a server-side session. A session is the server's record that the player has signed in.
- **FR-9.** The system must let a player sign out and end their current session.
- **FR-10.** The system must provide an endpoint for the client to check who is currently signed in.
- **FR-11.** The server must check sign-in for every protected action. Hiding a button in the browser does not replace this check.
- **FR-12.** Requests without a valid sign-in must be rejected. Signed-in players who do not have permission must also be rejected.
- **FR-13.** A failed sign-in must not tell an attacker whether an email address has an account.
- **FR-14.** Sign-up and sign-in must have limits to slow down repeated automated attempts.
- **FR-15.** Passwords must be 8–128 characters long and include at least one uppercase letter, one number, and one special character. Show these rules to users before they submit.

### Email verification and password reset

- **FR-16.** The system must send an email verification link after sign-up. The link must be signed, expire after 24 hours, and work only once. An unverified player may sign in to verify their email or sign out, but must not use other protected features.
- **FR-17.** The system must let a player request a password reset by email. Reset links must be signed, expire after 1 hour, and work only once. A reset request must not reveal whether the email has an account. Resetting a password must end the account's active sessions.
- **FR-18.** The system must block account registration for people under 13. The team must confirm age-screening, consent, privacy, and data-handling requirements before launch; the age limit alone does not establish legal compliance.

## 6. Basic Quality and Safety Needs

- **Speed:** Sign-up, sign-in, sign-out, and “who am I?” should normally finish within 500 ms, not counting email delivery. Test at about 10 requests per second and 100 signed-in users at once.
- **Password safety:** Use the password hashing method agreed in F01. Never log passwords, session IDs, or other sign-in secrets.
- **Cookie safety:** Use an HttpOnly cookie so browser scripts cannot read it. Use Secure in production and SameSite=Lax. Protect requests that change data against cross-site request forgery (CSRF)—a trick that makes a signed-in browser send an unwanted request.
- **Session length:** End a session after 7 days without activity. This is a sliding timeout: using the app resets the 7-day timer. Sign-out must end the session immediately.
- **Sign-in limits:** After 5 failed sign-in attempts for the same IP address/account combination within 15 minutes, block further attempts for that combination for 15 minutes and return `429 Too Many Requests`.
- **Role safety:** The server must decide what each role can do. Registration always creates a `PLAYER`.
- **Privacy:** The launch market is the United States and the minimum account age is 13. This age limit alone does not establish legal compliance; confirm age-screening, consent, privacy, and data-handling requirements before launch.
- **Errors:** Use the shared error format from F01. Do not send database details or internal error messages to the user.
- **Accessibility:** Sign-up and sign-in must work with a keyboard and screen reader. Forms need labels, visible focus, and clear error messages.
- **Logs:** Record whether sign-in worked or failed, but do not record passwords, cookie values, or full sign-in requests. Apply the sign-in limit to each IP address/account combination: 5 failed attempts in 15 minutes, followed by a 15-minute block and `429 Too Many Requests`.
- **Project conventions:** Follow F01's Node.js, Express, MongoDB, API path, and documentation decisions.

## 7. How We Know It Works

- **AC-1.** Given a new email and valid details, when a player signs up, then an account is created with the `PLAYER` role.
- **AC-2.** Given an email already in use, when someone tries to sign up with it using different letter case, then a second account is not created.
- **AC-3.** Given a sign-up request that asks for the `ADMIN` role, when the server handles it, then the account is not created as an admin.
- **AC-4.** Given a saved account, when its database record is checked, then it has a password hash and not the original password.
- **AC-5.** Given a verified account and correct email and password, when a player signs in, then they can use a protected feature.
- **AC-6.** Given a wrong password or an email with no account, when sign-in fails, then the response does not say which one was wrong.
- **AC-7.** Given a signed-in player, when they sign out, then the old session can no longer use protected features.
- **AC-8.** Given a valid session, when the client asks who is signed in, then it receives that player's safe account details. Without a valid session, it receives an unauthorized response.
- **AC-9.** Given a player who tries an organizer-only action, when the server checks the request, then it refuses the action.
- **AC-10.** Given too many sign-in attempts, when another attempt is made, then the server temporarily limits further attempts.
- **AC-11.** Given a sign-in request, when server logs are checked, then they do not contain the password or session cookie.
- **AC-12.** Given an unverified account, when its owner opens a valid verification link within 24 hours, then the email is verified and the link cannot be used again.
- **AC-13.** Given an expired or previously used verification link, when it is opened, then the email is not verified and the player sees an explanation.
- **AC-14.** Given a valid password-reset link within 1 hour, when the owner sets a new password, then the new password works, the old password does not work, and the link cannot be used again.
- **AC-15.** Given a password-reset request for either a known or unknown email, when the request is submitted, then the response does not reveal whether the account exists.
- **AC-16.** Given a password reset is completed, when an older session is used, then it is rejected.
- **AC-17.** Given an account registration request from someone under 13, when it is submitted, then the account is not created.
- **AC-18.** Given the sign-up and sign-in screens, when they are checked with a keyboard and accessibility tool, then users can complete the forms and understand errors.
- **AC-19.** Given the API documentation, when it is checked for errors, then it describes each sign-in route and its possible responses.

## 8. Information to Store

F01 defines the main `users` collection (the database list of accounts). F02 should use it, not make another account collection.

| Information | Where/how it is stored |
|---|---|
| Account ID | F01's user ID |
| Name | F01's `name` field; required and trimmed |
| Email | F01's `email` field; trimmed, lower-case, and unique |
| Password | F01's `password_hash` field; protected hash only |
| Role | F01's `role` field; defaults to `PLAYER` |
| Sign-in session | Server-side session record linked to the account, stored in MongoDB in a dedicated collection |
| Verification/reset tokens | Signed, single-use, time-limited links sent by email; record use/expiry so a link cannot be reused |

- Use `express-session` with `connect-mongo` to store sessions in a dedicated MongoDB collection. Refresh the seven-day expiry after authenticated activity.
- Verification links expire after 24 hours; password-reset links expire after 1 hour. Each link can be used once. Store only a hash or other safe representation of a token if token use is recorded in the database.
- F01's migration setup should create any new fields or session storage. There should be no existing accounts to update in this first version.

## 9. API Routes

All routes use F01's `/api/v1` prefix and shared error responses.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `POST /api/v1/auth/register` | Anyone | Create a player account |
| `POST /api/v1/auth/login` | Anyone | Sign in and start a session |
| `POST /api/v1/auth/logout` | Signed-in player | End the current session |
| `GET /api/v1/auth/me` | Signed-in player | Return the current player's safe account details |
| `POST /api/v1/auth/verify-email` | Anyone with a verification link | Verify an email address |
| `POST /api/v1/auth/password/forgot` | Anyone | Request a password-reset link |
| `POST /api/v1/auth/password/reset` | Anyone with a reset link | Set a new password |

### Example information sent to the server

```json
{
  "name": "Taylor Player",
  "email": "taylor@example.com",
  "password": "Example!Pass123"
}
```

The name field is required. The server must set the role; the client must not send it. A newly registered player must verify their email before using protected features.

- Do not return the password or password hash.
- Use the error response format agreed in F01 for bad input, duplicate emails, sign-in errors, and access denied.
- Add these routes and examples to the project's API documentation.
- No real-time or WebSocket features are needed for this plan.

## 10. Screens and User Experience

### Screens

- **Sign up:** full name, email, password, and a clear list of password rules.
- **Sign in:** email and password, with a link to sign up.
- **Email verification:** explain that a verification email was sent and show whether its link worked or expired.
- **Password reset:** let a player request a reset link and set a new password after opening it.
- **Age check:** ask the player to confirm they are at least 13 before creating an account.

### Basic flows

1. A new player opens sign-up, enters details, and sees a success message.
2. A returning player signs in and reaches the page they were trying to open using a `redirectTo` parameter, such as `/login?redirectTo=/groups`. If there is no redirect, send them to `/dashboard`. Only allow redirects to paths on the RecSquad site.
3. A signed-in player signs out and can no longer open protected pages.
4. When the page reloads, the app checks whether the player's session is still valid.
5. A player verifies their email or resets their password using a single-use link that expires after its set time.

### Screen behavior

- Make the screens usable on phones and computers.
- Show when a form is submitting and explain errors in plain language.
- Connect each error to the field it applies to and move focus to the error.
- Do not clear the email/name when a recoverable error occurs. Clear the password after successful sign-in or sign-up.
- Use clear labels and make every control usable by keyboard.

## 11. AI / ML

Not applicable. Sign-in information must not be sent to an AI service.

## 12. Things This Feature Connects To

- **F01:** User database, API server, role checks, error responses, and API documentation.
- **F03:** Player profile. The full name is collected during sign-up and can be shown on the player's profile.
- **F04–F10:** Other features use the signed-in player's ID and role when access needs to be checked.
- **Email service:** Use Resend for verification and password-reset email, with the sender name/address `RecSquad <noreply@recsquad.com>`. Confirm the sending domain is configured before launch.
- **Server files:** Use the Express API source layout, with routes in `src/routes/auth.js` and request-handling logic in `src/controllers/authController.js`.
- **Session storage:** Use `express-session` and `connect-mongo` with a dedicated MongoDB sessions collection.

## 13. Work Order

1. Finish F01's database and API foundation.
2. Configure the Resend sender domain and confirm the login route and local-only redirect behavior.
3. Agree on API routes and error messages.
4. Add sign-up, sign-in, sign-out, and current-user routes.
5. Add the sign-up and sign-in screens.
6. Add email verification and password reset using Resend.
7. Test permissions, password safety, forms, and sign-out.

Other features should use F02 for account identity and must not create their own sign-in system.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| Someone guesses or steals a password | Hash passwords, limit repeated sign-in attempts, and use secure cookies. |
| A new user gives themselves admin access | Always assign `PLAYER` on public sign-up and check roles on the server. |
| A signed-out session still works | Remove the server-side session on sign-out and test that the old session is rejected. |
| Account emails or passwords appear in logs | Avoid logging passwords, cookies, and full form submissions. |
| Email verification or reset is unreliable | Test Resend delivery, expired links, used links, and provider failures. |
| Rules for younger users are missed | Enforce the 13-year minimum and confirm applicable U.S. privacy and consent requirements before launch. |

## 15. Releasing the Feature

- **Feature flag:** None for the first release. Authentication is a required foundation for F03–F10.
- First release the database and server changes, then the website screens.
- Test sign-up, sign-in, email verification, and password reset with the team before opening registration.
- No existing account data should need to be moved.
- If a serious problem is found, temporarily disable sign-up and fix the problem. Do not delete accounts or session data without a recovery plan.

## 16. Tests

- **Small code tests:** email cleanup, password checks, default role, and safe account response.
- **Server tests:** sign-up, duplicate email, sign-in, sign-out, session expiry, and role restrictions.
- **Website tests:** complete the sign-up/sign-in/sign-out flow and test the error messages.
- **Security checks:** try an incorrect password, too many attempts, a fake session, and a request that tries to create an admin.
- **Accessibility checks:** use only a keyboard and run an automated accessibility check on the forms.
- **Manual checks:** try the forms on a phone and computer; refresh the page after signing in; check sign-out on a shared device.
- Test Resend email delivery, valid links, expired links, and links that have already been used.
- Test the 5-failure/15-minute limit and confirm the server returns `429` during the 15-minute block.
- Test that invalid or external `redirectTo` values fall back to `/dashboard`.

## 17. Documentation

- Tell players how to sign up, sign in, and sign out.
- Add the auth routes and example requests to the API documentation.
- Tell developers how to run the app and test sign-in locally.
- Document how to test Resend emails and help a player who cannot use a verification or reset link.
- Never ask support staff or developers to collect or view a player's password.

## 18. Choices Made

1. **Owner and effort:** Backend & Full-Stack Leads (Team); estimate is 2–3 working days (Small / S).
2. **Account features:** Include email verification and password reset in the first release. Both use signed, single-use, time-limited links sent by email. Verification links expire after 24 hours; reset links expire after 1 hour.
3. **Name:** Ask for the player's full name during sign-up.
4. **Session storage:** Use `express-session` with `connect-mongo` to store sessions in a dedicated MongoDB collection.
5. **Session timeout:** Use a sliding 7-day inactivity timeout. Each authenticated use of the app resets the timer.
6. **Email service:** Use Resend with the sender identity `RecSquad <noreply@recsquad.com>`. Configure and verify the sender domain before launch.
7. **Audience:** Launch in the United States with a minimum account age of 13. **This is the product's age limit, not a statement that the app is automatically COPPA-compliant. Confirm age-screening, consent, privacy, and data-handling requirements before launch.**
8. **Sign-in limit:** After 5 failed attempts for an IP address/account within a 15-minute window, block further attempts for that IP address/account for 15 minutes and return `429 Too Many Requests`.
9. **After sign-in:** Return the player to the page they originally tried to open using `redirectTo`, for example `/login?redirectTo=/groups`. If no redirect is provided or it is invalid, use `/dashboard`. Redirects must stay on the RecSquad site.
10. **Project setup:** Use `src/routes/auth.js` for auth routes and `src/controllers/authController.js` for request handling. No feature flag for the first release because authentication is required by F03–F10.

**Remaining setup checks:** Confirm that `noreply@recsquad.com` is an available sender identity and configure its DNS/email records with Resend before sending production email. Confirm the site's actual login route and ensure every `redirectTo` value is restricted to a local path.

## 19. References

- [AGENTS.md](../AGENTS.md) - project overview, technology choices, and account roles.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - user data, server, error responses, and role checks.
- [F03 - Player Profile & Sport Preference Editor](./F03-Player_Profile_%26_Sport_Preference_Editor.md) - related player information.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§6–7 - proposed user data and API.
- OWASP password and session security guidance; WCAG 2.1 AA accessibility guidance.
