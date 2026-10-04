# F07 — Event RSVPs & Substitute Requests

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F07 |
| **Section** | Event Attendance |
| **Severity** | MAJOR |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad RSVP feature has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after confirming capacity and notification rules]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (database/API), F02 (sign-in), F04 (groups), F06 (events) |
| **Unblocks** | F08 (knows which players attend); event organizers tracking attendance |

## 1. Problem

Players need to tell organizers whether they will attend an event. Organizers also need a way to fill a spot when someone cannot attend. This feature records attendance and lets a player ask for a substitute.

## 2. Goals

- Let a signed-in player RSVP to an event.
- Let a player change or withdraw their RSVP.
- Let a player request a substitute when they cannot attend.
- Let organizers see the attendance list and substitute requests.
- Apply the event's capacity limit consistently.

## 3. Not Included

- Creating events (F06).
- Group discovery (F05).
- Payment collection or ticketing.
- Full waitlist system unless selected below.
- Automatic SMS unless selected below.

## 4. People Who Use This

- **Player:** I want to say whether I am attending.
- **Player needing a substitute:** I want to tell the organizer that my spot is available.
- **Organizer:** I want to see who is attending and whether a player needs a replacement.
- **Free agent:** I want to find out if a spot is open, if the product permits it.

## 5. What the System Must Do

- **FR-1.** A signed-in player must be able to set their RSVP to `ATTENDING`, `DECLINED`, or `SUB_REQUEST`.
- **FR-2.** There must be only one current RSVP for each player/event pair.
- **FR-3.** A player must be able to change their own RSVP.
- **FR-4.** An organizer must be able to see the RSVP list for their event.
- **FR-5.** The system must not allow the number attending to exceed the event's capacity. **[CHOOSE what happens when an event is full.]**
- **FR-6.** A substitute request must be visible to the event organizer and must not silently count as a confirmed replacement.
- **FR-7.** The system must reject RSVPs for cancelled or past events, according to the chosen event rules.
- **FR-8.** The system must check sign-in and event permissions on the server.
- **FR-9.** RSVP updates should be safe to retry so the same action does not create duplicate records.

## 6. Basic Quality and Safety Needs

- Use F01's unique database rule for one RSVP per event/player.
- Handle two players trying to take the last spot at the same time without exceeding capacity.
- Do not show private attendee details to people who are not allowed to see them.
- If notifications are added, do not send them before the RSVP change is saved.
- Use clear states and messages on mobile.
- Use F01's error format and document all RSVP statuses.

## 7. How We Know It Works

- **AC-1.** Given a signed-in player and an open event, when they RSVP attending, then one `ATTENDING` RSVP is saved.
- **AC-2.** Given an existing RSVP, when the player changes it, then the old status is updated rather than duplicated.
- **AC-3.** Given an event at capacity, when another player tries to attend, then the documented full-event rule is applied and capacity is not exceeded.
- **AC-4.** Given a player who requests a substitute, when the organizer opens the RSVP list, then the request is visible.
- **AC-5.** Given a player, when they try to change someone else's RSVP, then the server refuses.
- **AC-6.** Given a cancelled or past event, when a player tries to RSVP, then the server refuses according to the documented rule.
- **AC-7.** Given two players trying to take the last place at once, when both requests are processed, then no more than one is confirmed.
- **AC-8.** Given the RSVP screen, when used on a phone and with a keyboard, then attendance actions remain understandable and usable.

## 8. Information to Store

Use F01's `event_rsvps` collection.

| Information | Storage |
|---|---|
| Event | `event_id` reference |
| Player | `user_id` reference |
| RSVP status | `ATTENDING`, `DECLINED`, or `SUB_REQUEST` |
| Created/updated time | Managed timestamps |

F01 requires a unique `(event_id, user_id)` pair. If a waitlist or replacement approval is selected, agree on extra statuses/fields before implementation.

## 9. API Routes

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `POST /api/v1/events/:id/rsvp` | Signed-in player | Create or update the player's RSVP |
| `GET /api/v1/events/:id/rsvps` | Organizer; **[CHOOSE if attendees can also see it]** | View event attendance |
| `DELETE /api/v1/events/:id/rsvp` | Signed-in player | Withdraw RSVP, if separate from setting `DECLINED` |

Example request:

```json
{ "status": "ATTENDING" }
```

The player ID must come from the signed-in session, not from the request body.

## 10. Screens and User Experience

- Event details show an RSVP action and the player's current choice.
- Organizer view shows attendance counts and substitute requests.
- Explain when the event is full and what the player can do next.
- **[CHOOSE: should the player be offered a waitlist, or simply told the event is full?]**
- **[CHOOSE: should requesting a substitute notify the organizer by in-app message, email, or SMS?]**
- Show loading and retry states if the server is unavailable.

## 11. AI / ML

Not applicable.

## 12. Things This Feature Connects To

- **F01:** RSVP collection and unique event/player rule.
- **F02:** Sign-in and player identity.
- **F04:** Group owner/organizer permissions.
- **F06:** Event dates and capacity.
- **F08:** Event roster may determine eligible scorecard players.
- **Notifications:** **[CHOOSE whether email/SMS is needed; the proposal mentions Twilio for SMS, but this is optional.]**

## 13. Work Order

1. Finish F01, F02, F04, and F06.
2. Decide full-event, withdrawal, and substitute handling.
3. Agree on RSVP API and organizer roster access.
4. Build player RSVP and organizer attendance views.
5. Test capacity, permissions, and repeated requests.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| Event exceeds capacity | Enforce capacity on the server and test simultaneous requests. |
| Duplicate RSVP records | Use the unique event/player database rule. |
| Substitute request is mistaken for a confirmed replacement | Display request and confirmed attendance as different states. |
| Private attendee details are exposed | Decide roster visibility and enforce it in the API. |
| SMS/email costs or setup become a surprise | Keep notifications optional and decide provider/budget before implementation. |

## 15. Releasing the Feature

- Release after F01, F02, F04, and F06.
- Add the unique RSVP index through F01's migration process.
- **[CHOOSE: feature flag or no flag for the first release.]**
- If RSVP updates are paused, keep event details available and preserve saved RSVP records.

## 16. Tests

- Test all three RSVP statuses and updating an existing RSVP.
- Test withdrawing and trying to RSVP to a cancelled event.
- Test event capacity, including two requests for the final spot.
- Test player/organizer permissions and roster privacy.
- Test repeated requests do not create extra RSVP records.
- If notifications are included, test sent, failed, and retried notifications.

## 17. Documentation

- Explain RSVP, declining, and substitute requests to players.
- Explain attendance lists and capacity to organizers.
- Document status meanings and API routes.
- If notifications are included, document their delivery behavior.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. What should happen when the event reaches capacity: reject, waitlist, or allow organizer override?
3. Is `DECLINED` enough to withdraw, or is a separate cancel action needed?
4. Who can see the attendee list?
5. Does the organizer approve a substitute, or is the request just a notice?
6. Should substitutions keep the original player's RSVP history?
7. Send in-app, email, or SMS notifications? If SMS, choose provider and budget.
8. Should attendees be able to RSVP after an event begins?
9. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - roles and app rules.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - RSVP data.
- [F02 - User Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) - sign-in.
- [F04 - Community Group Creation & Management](./F04-Community_Group_Creation_%26_Management.md) - group owners.
- [F06 - Event Scheduling & Capacity Tracking](./F06-Event_Scheduling_%26_Capacity_Tracking.md) - events and capacity.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
