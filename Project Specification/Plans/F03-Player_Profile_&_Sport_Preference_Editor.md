# F03 — Player Profile & Sport Preferences

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F03 |
| **Section** | Player Profiles |
| **Severity** | MAJOR |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad profile feature has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after confirming scope]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (database/API), F02 (accounts and sign-in) |
| **Unblocks** | F05 can use sports preferences to help discovery; F10 can show player statistics on the profile |

## 1. Problem

Players need a place to say who they are and which sports they enjoy. Without a profile, the app cannot show useful player information or help personalize group discovery. This feature lets a signed-in player view and update their basic profile and preferred sports.

## 2. Goals

- Show a player's basic profile information.
- Let a player update their own name and sport preferences.
- Make profile information available to other RecSquad features when needed.
- Keep private account information, such as passwords, out of profile responses.

## 3. Not Included

- Creating or signing in to an account (F02).
- Match statistics and charts (F10).
- Direct messages, friend lists, or social feeds.
- Editing another player's profile.
- **[CHOOSE: whether profile photos, location, or contact information belong in this version.]**

## 4. People Who Use This

- **Player:** I want to choose my sports so I can find groups and events that interest me.
- **Other player:** I want to see the profile details the player has chosen to share.
- **Organizer:** I want to recognize players who join my group or event.

## 5. What the System Must Do

- **FR-1.** A signed-in player must be able to view their own profile.
- **FR-2.** A signed-in player must be able to update their own profile, not another player's.
- **FR-3.** The profile must use F01's account record; it must not create a separate player account.
- **FR-4.** Preferred sports must use the sports list defined in F01: Disc Golf, Ping Pong, Pickleball, Spikeball, and Other.
- **FR-5.** The system must reject unknown sports and invalid field values with a clear error.
- **FR-6.** Profile responses must never include a password or password hash.
- **FR-7.** The system must make clear which profile fields other users can see. **[CHOOSE visibility for each field.]**
- **FR-8.** The profile page should show match statistics when F10 provides them; F03 must not calculate separate copies of those statistics.

## 6. Basic Quality and Safety Needs

- Only the signed-in player may edit their profile.
- Validate profile data on the server, even if the form checks it too.
- Do not show a player's private location, email, or contact details to other users unless the player and product requirements allow it.
- Profile pages and forms should work on phones and with a keyboard.
- Store locations using the F01 GeoJSON format only if location is included.
- Use F01's shared API error format and API documentation conventions.

## 7. How We Know It Works

- **AC-1.** Given a signed-in player, when they open their profile, then they see their current profile values.
- **AC-2.** Given valid edits, when the player saves, then the changes appear when the profile is opened again.
- **AC-3.** Given a player who tries to edit another account, when the request reaches the server, then it is refused.
- **AC-4.** Given an unsupported sport value, when it is submitted, then the server rejects it and explains the invalid field.
- **AC-5.** Given a profile response, when it is inspected, then it contains no password or password hash.
- **AC-6.** Given a profile field marked private, when another player views the profile, then that private field is not returned.
- **AC-7.** Given the profile form, when it is used on a phone and with a keyboard, then its fields and save action remain usable.

## 8. Information to Store

Use F01's `users` collection.

| Information | Storage |
|---|---|
| Name | `users.name` |
| Email | `users.email`; private account field |
| Preferred sports | `users.preferred_sports` |
| Location | Optional `users.location`; include only if approved |
| Bio/contact/profile photo | **[CHOOSE whether these are needed; F01 does not currently define them.]** |

Add fields through F01's database migration process. Do not copy match statistics into the user record; calculate or retrieve them from F10.

## 9. API Routes

Use F01's `/api/v1` prefix and require sign-in for editing.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `GET /api/v1/users/me/profile` | Signed-in player | Get the current player's profile |
| `PUT /api/v1/users/me/profile` | Signed-in player | Update the current player's profile |
| `GET /api/v1/users/:id/profile` | Public or signed-in users **[CHOOSE]** | View another player's shareable profile |

Document exact request fields and field visibility in the API documentation. Never accept an account ID or role from the client as authority to edit another account.

## 10. Screens and User Experience

- A profile page showing the player's shareable information and preferred sports.
- An edit form for fields the player is allowed to change.
- Show a success message after saving and field-specific messages if something is invalid.
- Show a helpful empty state if the player has not chosen any sports.
- **[CHOOSE: should users be able to open profiles to everyone, signed-in users only, or nobody except themselves?]**
- Make the form mobile-friendly, keyboard accessible, and clearly labeled.

## 11. AI / ML

Not applicable.

## 12. Things This Feature Connects To

- **F01:** User data, API server, validation, and shared error responses.
- **F02:** Sign-in and the rule that a player can only edit their own information.
- **F05:** May use preferred sports to help filter group discovery.
- **F10:** Supplies player statistics for display; F10 owns how those statistics are calculated.

## 13. Work Order

1. Finish F01 and F02.
2. Decide which profile fields are stored and which are visible.
3. Agree on the profile API request and response.
4. Build the profile view and edit form.
5. Test field validation, permissions, and privacy.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| A player changes someone else's information | Use the signed-in account ID on the server and test this restriction. |
| Private email or location is shown publicly | Decide field visibility and test the returned data. |
| Profile and statistics disagree | Keep match-stat calculations in F10 and read them there. |
| Profile fields become too large in scope | Start with name and preferred sports; add optional fields only after a decision. |

## 15. Releasing the Feature

- Release after F01 and F02 work.
- No profile data migration is expected for the first version.
- **[CHOOSE: use a feature flag if the project already has one, or release without one.]**
- If profile editing causes a problem, disable editing while keeping account sign-in available.

## 16. Tests

- Test reading and updating the signed-in player's profile.
- Test that one player cannot update another player's profile.
- Test valid and invalid sport choices.
- Check API responses for password hashes and private fields.
- Check the form on a phone and using only a keyboard.
- Check the empty profile state and server-error messages.

## 17. Documentation

- Explain how to edit a profile and choose preferred sports.
- Document profile routes and which fields are public/private.
- Tell developers how to add a field without exposing private account data.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Are profile pages public, limited to signed-in users, or private to the owner?
3. Which fields are included beyond name and preferred sports: bio, contact details, photo, location?
4. If location is included, how precise should it be and who can see it?
5. Are preferred sports optional, and may a player select more than one?
6. Should this feature have a feature flag?

## 19. References

- [AGENTS.md](../AGENTS.md) - roles, sports, and technology choices.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - user data and API foundation.
- [F02 - User Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) - accounts and sign-in.
- [F10 - Player Analytics & Match History Dashboard](./F10-Player_Analytics_%26_Match_History_Dashboard.md) - player statistics.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
