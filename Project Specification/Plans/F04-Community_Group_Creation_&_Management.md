# F04 — Community Group Creation & Management

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F04 |
| **Section** | Community Groups |
| **Severity** | BLOCKER |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad group feature has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after confirming scope]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (database/API), F02 (accounts and sign-in) |
| **Unblocks** | F05 (group discovery), F06 (events), F07 (RSVPs), F09 (group standings) |

## 1. Problem

Players need a way to create and manage local groups for their sports. Without groups, organizers cannot bring players together or schedule activities under one community. This feature lets a signed-in player create a group and manage it as its organizer.

## 2. Goals

- Let a signed-in player create a sports group.
- Let the group owner update or archive the group.
- Store the group's sport and meeting location.
- Make group information available to discovery and event features.

## 3. Not Included

- Searching or browsing groups (F05).
- Creating scheduled events (F06).
- RSVP and substitute handling (F07).
- Payments, group chat, or member messaging.
- **[CHOOSE: membership invitations, approvals, and private groups are not defined yet.]**

## 4. People Who Use This

- **Organizer:** I want to create a group so local players can find and join activities I host.
- **Player:** I want to see a group's sport, description, and location before deciding whether it interests me.
- **Administrator:** I want group ownership and organizer permissions checked by the server.

## 5. What the System Must Do

- **FR-1.** A signed-in player must be able to create a group with a name, sport, description, and location.
- **FR-2.** The system must set the creating player as the group owner.
- **FR-3.** The group creator must receive the `ORGANIZER` role according to F01's role rule; a user must not be able to grant themselves `ADMIN`.
- **FR-4.** The group owner must be able to view and update the group's information.
- **FR-5.** The group owner must be able to archive a group. Archiving hides it from discovery but keeps its records for related events and scores.
- **FR-6.** Only the owner or an authorized administrator may update or archive a group.
- **FR-7.** Group sports must use the values defined in F01.
- **FR-8.** Coordinates must follow F01's GeoJSON format, with longitude first.
- **FR-9.** The system must validate required fields and return understandable errors.
- **FR-10.** Group details must provide a stable group ID for events, search, and navigation.

## 6. Basic Quality and Safety Needs

- Require sign-in to create or change a group.
- Check ownership on the server for every update/archive request.
- Keep archived groups out of public search, but do not delete linked events or scores.
- Do not show an organizer's private account location or email as the group location.
- Use F01's API error format and document all routes.
- Keep group forms usable on phones and with a keyboard.
- Store only the location information needed to describe the group.

## 7. How We Know It Works

- **AC-1.** Given a signed-in player and valid group details, when they create a group, then it is saved with that player as owner.
- **AC-2.** Given a group owner, when they update the group's description, then the new description is shown.
- **AC-3.** Given a player who does not own a group, when they try to update or archive it, then the server refuses the request.
- **AC-4.** Given an invalid sport or location, when it is submitted, then the server rejects it.
- **AC-5.** Given an archived group, when F05 searches public groups, then the archived group is not returned.
- **AC-6.** Given a group with events or scores, when it is archived, then those records remain available to the related features.
- **AC-7.** Given group creation/edit forms, when used on a phone and with a keyboard, then the forms remain usable.

## 8. Information to Store

Use F01's `community_groups` collection.

| Information | Storage |
|---|---|
| Group ID | MongoDB ObjectId |
| Name | Required group name |
| Sport | One F01 sport value |
| Description | Group overview and guidelines |
| Location name | Park, court, or venue name |
| Coordinates | Optional GeoJSON Point `[longitude, latitude]` |
| Owner | `owner_id` referencing the user |
| Status | **[CHOOSE: add an active/archived status if F01 does not already define it.]** |
| Visibility | **[CHOOSE: public/private; F01 does not currently define group visibility.]** |

The proposal does not define group membership storage. If groups have members beyond the owner, add a membership model before implementing roster or private-group features.

## 9. API Routes

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `POST /api/v1/groups` | Signed-in player | Create a group |
| `GET /api/v1/groups/:id` | **[CHOOSE: public or signed-in users]** | View group details |
| `PUT /api/v1/groups/:id` | Owner or admin | Update group details |
| `DELETE /api/v1/groups/:id` | Owner or admin | Archive the group; do not permanently delete it |

Request fields: name, sport, description, location name, and optional coordinates. The server sets owner and role; never trust a client-supplied owner ID.

## 10. Screens and User Experience

- Create-group form with name, sport selector, description, and location fields.
- Group detail page with group information and links to upcoming events.
- Owner controls for editing and archiving the group.
- Show saving, success, and validation-error messages.
- **[CHOOSE: are groups public by default, and how does a player join a group?]**
- Confirm before archiving and explain that the group will no longer appear in discovery.

## 11. AI / ML

Not applicable.

## 12. Things This Feature Connects To

- **F01:** Group data, database, API server, and ownership/role checks.
- **F02:** Identifies the signed-in group creator.
- **F05:** Searches and displays active public groups.
- **F06:** Attaches scheduled events to a group.
- **F07:** May use group participation when handling RSVPs.
- **F09:** Shows group standings.

## 13. Work Order

1. Finish F01 and F02.
2. Decide group visibility, membership, and archive behavior.
3. Agree on group API fields.
4. Build group create, detail, edit, and archive operations.
5. Test ownership and location validation.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| A player changes another organizer's group | Check ownership on the server and test unauthorized requests. |
| Archiving deletes useful history | Archive instead of permanently deleting groups. |
| Location coordinates are reversed | Follow F01's longitude-first rule and test it. |
| Group membership is assumed but not stored | Decide the membership model before building member-only features. |
| Private group details leak | Choose visibility rules and enforce them in database queries and API responses. |

## 15. Releasing the Feature

- Release after F01 and F02.
- Create the group collection and indexes through F01's migration process.
- **[CHOOSE: use a feature flag if one exists, or release without one.]**
- If there is a problem, temporarily disable creating/editing groups; preserve existing group and event records.

## 16. Tests

- Test creating, viewing, editing, and archiving a group.
- Test that only the owner/admin can edit or archive.
- Test invalid sport and coordinate values.
- Test archived groups are excluded from discovery.
- Test archive does not remove related events.
- Check forms on a phone and with a keyboard.

## 17. Documentation

- Explain how to create, edit, and archive a group.
- Document group fields and API routes.
- Explain who can manage a group and how ownership works.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Are groups public, private, or can organizers choose?
3. How does a player join a group: open join, request approval, or no membership in the MVP?
4. What does the `ORGANIZER` role mean if a player owns multiple groups?
5. Can ownership be transferred to another player?
6. Should a group be archived or permanently deleted, and can it be restored?
7. Are group coordinates required, optional, or replaced by a written location?
8. What extra fields are needed, such as a group image or meeting schedule?
9. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - roles, GeoJSON, and platform choices.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - group data and API.
- [F02 - User Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) - sign-in.
- [F05 - Feed-Based Group Discovery & Search](./F05-Feed_Based_Group_Discovery_%26_Search.md) - group discovery.
- [F06 - Event Scheduling & Capacity Tracking](./F06-Event_Scheduling_%26_Capacity_Tracking.md) - group events.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
