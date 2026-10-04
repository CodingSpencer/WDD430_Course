# F06 — Event Scheduling & Capacity

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F06 |
| **Section** | Group Events |
| **Severity** | BLOCKER |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad event scheduling has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after confirming scheduling rules]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (database/API), F02 (sign-in), F04 (groups) |
| **Unblocks** | F05 (event discovery), F07 (RSVPs/substitutes), F08 (scorecards) |

## 1. Problem

Groups need a shared way to announce when and where they are playing. Without scheduled events, players cannot see upcoming games or know whether there is space. This feature lets organizers create and manage events with a start time, location, and player limit.

## 2. Goals

- Let an organizer schedule an event for a group.
- Show event details and available capacity.
- Let the organizer update or cancel an event.
- Provide event information to discovery and RSVP features.

## 3. Not Included

- Creating or editing the group itself (F04).
- RSVP and substitute requests (F07).
- Automatic recurring event generation unless chosen.
- Payments, brackets, or detailed tournament management.
- **[CHOOSE: whether recurring schedules or calendar export belong in the MVP.]**

## 4. People Who Use This

- **Organizer:** I want to schedule a game and set a player limit.
- **Player:** I want to see when and where a group is playing before I RSVP.
- **Free agent:** I want to find an upcoming event with open spaces.

## 5. What the System Must Do

- **FR-1.** An authorized organizer must be able to create an event for a group they manage.
- **FR-2.** An event must include a title, event type, start time, group, venue/address, and player limit where required.
- **FR-3.** Event type must use F01's supported values: `PICKUP`, `LEAGUE_MATCH`, or `TOURNAMENT`.
- **FR-4.** The organizer must be able to update or cancel their event.
- **FR-5.** The server must check the organizer's permission for every event change.
- **FR-6.** The system must reject an event with an invalid time, capacity, or group.
- **FR-7.** Events must be linked to their group and remain available to related RSVP and scorecard features.
- **FR-8.** The system must show upcoming event details and capacity information.
- **FR-9.** Time values must be stored consistently and shown in the viewer's local time.
- **FR-10.** **[CHOOSE: what happens to existing RSVPs when an event is changed or cancelled.]**

## 6. Basic Quality and Safety Needs

- Only an authorized organizer or admin may create, change, or cancel an event.
- Store event times in UTC; show a clear local date, time, and time zone to users.
- Prevent events from being created with a negative or zero player limit.
- Tell affected players when an event is cancelled **[CHOOSE: in-app message/email/SMS, or no notification in MVP]**.
- Use F01's error format, validation, and API documentation.
- Event forms and details should work on mobile and with a keyboard.

## 7. How We Know It Works

- **AC-1.** Given an organizer and a group they manage, when they create an event with valid details, then it is saved under that group.
- **AC-2.** Given an organizer who does not manage a group, when they try to add an event to it, then the server refuses.
- **AC-3.** Given an invalid capacity or start time, when an event is submitted, then the server reports a clear validation error.
- **AC-4.** Given an event in storage, when it is shown in a different time zone, then it represents the same moment in time.
- **AC-5.** Given an event owner, when they update or cancel the event, then the event's new status/details are shown.
- **AC-6.** Given a cancelled event, when a player views upcoming events, then it is clearly marked or no longer listed according to the chosen rule.
- **AC-7.** Given an event with RSVPs, when it is cancelled, then RSVP records are handled according to the documented decision and are not silently lost.

## 8. Information to Store

Use F01's `events` collection.

| Information | Storage |
|---|---|
| Group | `group_id` reference to F04 group |
| Title | Event title |
| Type | `PICKUP`, `LEAGUE_MATCH`, or `TOURNAMENT` |
| Start time | UTC date/time |
| Capacity | `max_players`; integer of at least one |
| Venue | `venue_address` |
| Status | **[CHOOSE: add scheduled/cancelled/completed status if F01 does not define one.]** |
| End time / recurrence | **[CHOOSE whether needed; not in current F01 event model.]** |

Add any extra fields through F01's migration process.

## 9. API Routes

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `POST /api/v1/groups/:groupId/events` | Organizer of the group or admin | Create event |
| `GET /api/v1/groups/:groupId/events` | **[CHOOSE public or signed-in]** | List a group's events |
| `GET /api/v1/events/:id` | **[CHOOSE public or signed-in]** | View event details |
| `PUT /api/v1/events/:id` | Organizer of the group or admin | Update event |
| `DELETE /api/v1/events/:id` | Organizer of the group or admin | Cancel/archive event |

Document request fields, time format, capacity rules, and cancellation response.

## 10. Screens and User Experience

- Organizer form to create or edit an event.
- Event details page showing group, time, place, event type, and capacity.
- Clear cancelled-event state.
- Show date/time with time zone where confusion is possible.
- **[CHOOSE: support one-time events only, or recurring events too?]**
- Show saving, validation, and retry messages.

## 11. AI / ML

Not applicable.

## 12. Things This Feature Connects To

- **F01:** Events collection and API foundation.
- **F02:** Sign-in and account roles.
- **F04:** Group owner/organizer and group details.
- **F05:** Upcoming event discovery.
- **F07:** RSVP count and capacity.
- **F08:** Match scorecards for completed/scheduled events.
- **Notifications:** **[CHOOSE if cancellation or schedule-change messages are needed.]**

## 13. Work Order

1. Finish F01, F02, and F04.
2. Decide event status, time zone display, and cancellation behavior.
3. Agree on event API fields and routes.
4. Build event creation, viewing, update, and cancellation.
5. Test permissions, dates, capacity, and related RSVP handling.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| An unauthorized player changes an event | Check group ownership/role on the server. |
| Players misunderstand the event time | Store UTC and show local time with a time-zone label. |
| Capacity conflicts with RSVP behavior | Define the capacity rule together with F07. |
| Cancelling loses RSVP or score history | Keep event records and choose explicit cancellation behavior. |
| Recurring events add complexity | Start with one-time events unless recurrence is required. |

## 15. Releasing the Feature

- Release after F01, F02, and F04.
- Create event fields/indexes through F01's migration process.
- **[CHOOSE: feature flag or no flag for the first release.]**
- If scheduling must be paused, disable event creation but preserve event history.

## 16. Tests

- Test event create/read/update/cancel.
- Test organizer permission and invalid group IDs.
- Test capacity validation and time-zone conversion.
- Test event listings exclude cancelled/past events according to the chosen rules.
- Test how cancellation affects RSVP and score records.
- Check forms on mobile and using a keyboard.

## 17. Documentation

- Explain how to schedule, change, and cancel an event.
- Document event time and capacity rules.
- Document API routes and status values.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Can every group owner schedule events, or only certain organizers?
3. Are events public or visible only to group members?
4. Are recurring events needed in the first version?
5. Is event end time needed?
6. What are the event statuses and how are past events handled?
7. What happens to RSVPs when an event's time/capacity changes or it is cancelled?
8. How should players be notified of changes?
9. Can an event's venue differ from its group's usual location?
10. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - roles and time/data conventions.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - event model/API.
- [F02 - User Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) - sign-in.
- [F04 - Community Group Creation & Management](./F04-Community_Group_Creation_%26_Management.md) - groups.
- [F07 - Event RSVP & Substitute Request System](./F07-Event_RSVP_%26_Substitute_Request_System.md) - attendance.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
