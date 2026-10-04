# F08 — Mobile Match Scorecard

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F08 |
| **Section** | Match Scorekeeping |
| **Severity** | MAJOR |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad scorecard has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after deciding supported sports and offline scope]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (score data/API), F02 (sign-in), F06 (events); F07 may provide the player list |
| **Unblocks** | F09 (group standings), F10 (player statistics) |

## 1. Problem

Players need a simple way to record the result of a match. A scorecard that works well on a phone makes it easier to enter scores while playing and gives the app information for standings and player history.

## 2. Goals

- Let an authorized player create and update a scorecard for an event.
- Support the score format needed by each sport included in the first release.
- Make score entry easy to use on a phone.
- Save completed results so standings and player statistics can use them.
- **[CHOOSE: include real-time updates and offline entry in the first release, or add them later?]**

## 3. Not Included

- Creating the event itself (F06).
- Calculating leaderboards (F09) or player charts (F10).
- Advanced tournament brackets or league scheduling.
- Automatic referee decisions or dispute resolution.
- Offline/PWA support unless selected below.

## 4. People Who Use This

- **Player/scorekeeper:** I want to enter the score quickly during or after a match.
- **Other players:** I want to see the saved score for my match.
- **Organizer:** I want score entry limited to players or officials allowed to record that event.

## 5. What the System Must Do

- **FR-1.** An authorized signed-in player must be able to start a scorecard for an event.
- **FR-2.** A scorecard must be linked to its event and participating players.
- **FR-3.** The scorecard must have `IN_PROGRESS` or `COMPLETED` status.
- **FR-4.** Score data must support the selected sports without requiring a database redesign for every sport. F01 provides a flexible `score_data` field.
- **FR-5.** The system must validate score entries according to the selected sport's rules.
- **FR-6.** An authorized player must be able to save score changes.
- **FR-7.** The system must prevent an unauthorized user from changing a scorecard.
- **FR-8.** A completed scorecard must be available to F09 and F10.
- **FR-9.** If offline saving is included, each offline submission must have a unique ID so reconnecting does not save it twice.
- **FR-10.** If live updates are included, connected viewers should see changes without refreshing the page.

## 6. Basic Quality and Safety Needs

- The scorekeeper screen must be designed for phones and outdoor/court use.
- Important score controls must be large enough to tap; use at least 44×44 CSS pixels as recommended in AGENTS.md.
- Show clearly whether the score is saved, still saving, or not connected.
- Do not silently discard unsaved scores.
- Keep a clear distinction between `IN_PROGRESS` and `COMPLETED`.
- Validate score updates on the server; do not trust browser-submitted values.
- Use F01's API error format and document the chosen score shape for every supported sport.

## 7. How We Know It Works

- **AC-1.** Given an event and authorized player, when a scorecard is started, then it is linked to that event and its players.
- **AC-2.** Given a valid score update, when it is saved, then reopening the scorecard shows the new score.
- **AC-3.** Given an invalid score for the selected sport, when it is submitted, then the server rejects it with a clear error.
- **AC-4.** Given a player without score-edit permission, when they try to change a score, then the server refuses.
- **AC-5.** Given a completed scorecard, when F09 or F10 requests match results, then the saved score is available.
- **AC-6.** Given repeated delivery of the same offline submission, when it is processed, then it does not create duplicate scores. **[Only if offline is included.]**
- **AC-7.** Given a phone screen, when a player uses the score controls, then the controls are readable and easy to tap.
- **AC-8.** Given an unsaved or failed update, when the player views the screen, then it clearly says the score was not saved and offers a retry.

## 8. Information to Store

Use F01's `match_scores` collection.

| Information | Storage |
|---|---|
| Event | `event_id` reference |
| Players | `players` array of user IDs |
| Scores | `score_data` object; exact shape depends on selected sports |
| Status | `IN_PROGRESS` or `COMPLETED` |
| Offline request ID | `offline_sync_id`, unique and sparse if offline sync is included |

**[CHOOSE: define a simple score-data example for every sport included in the first version.]** Store dates using F01's timestamps. Do not put large histories of every score change inside the score object unless that is separately designed.

## 9. API Routes

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `GET /api/v1/events/:id/scorecard` | Event participant or authorized organizer **[CHOOSE]** | Get the event scorecard |
| `POST /api/v1/matches` | Authorized player/organizer | Create a scorecard |
| `PUT /api/v1/matches/:id` | Authorized scorekeeper | Save score or status changes |

The API documentation must define score shapes, who may edit, and how duplicate offline submissions are handled.

## 10. Screens and User Experience

- Mobile-first scorekeeper screen with match/event and player names.
- Large score controls with clear current values.
- Save state: saving, saved, failed, or offline.
- Confirmation before completing a scorecard; explain whether completed scores can be edited later.
- **[CHOOSE: which sports have working score entry at launch.]**
- **[CHOOSE: whether real-time updates and offline mode are MVP or later.]**

## 11. AI / ML

Not applicable.

## 12. Things This Feature Connects To

- **F01:** Match score model and flexible score data.
- **F02:** Signed-in player and role.
- **F06:** Event information.
- **F07:** RSVP list may determine players on the scorecard.
- **F09:** Uses completed scores for group standings.
- **F10:** Uses completed scores for player history and statistics.
- **Socket.io / PWA storage:** Needed only if live updates or offline use are selected.

## 13. Work Order

1. Finish F01, F02, and F06; agree with F07 on player eligibility.
2. Decide supported sports, score rules, and who may edit.
3. Agree on each sport's score-data shape.
4. Build the mobile score entry and save operations.
5. Add real-time/offline features only if selected.
6. Test permissions, score validation, save failures, and any sync behavior.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| Different sports use different rules | Start with chosen sports and document each score format and validation rule. |
| A player changes a score without permission | Check scorekeeper permissions on the server. |
| Unsaved scores are lost | Show save status and keep retry behavior clear. |
| Offline retries duplicate scores | Use F01's unique `offline_sync_id` if offline support is included. |
| Live/offline features delay the basic scorecard | Decide whether those are MVP; deliver basic online scoring first if unsure. |

## 15. Releasing the Feature

- Release after the event and score data foundation is ready.
- Start with the agreed sports and online save behavior.
- **[CHOOSE: feature flag or no flag for the first release.]**
- If score entry is disabled, preserve existing scorecards and allow read-only viewing if safe.

## 16. Tests

- Test scorecard creation, update, and completion.
- Test valid/invalid score values for each selected sport.
- Test who can read and edit scorecards.
- Test that completed scores can be read by F09 and F10.
- If offline is included, test reconnect, retry, duplicate submission, and conflicting updates.
- If live updates are included, test two clients seeing the same saved change.
- Test phone controls, save/error states, and keyboard accessibility.

## 17. Documentation

- Provide short instructions for entering and completing a scorecard.
- Document the score rules and API score shape for each included sport.
- If offline/live modes are included, explain their connection and sync indicators.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Which sports have scorecards in the first release?
3. What score rules and score-data shape apply to each sport?
4. Who can create, edit, and complete a scorecard?
5. Can a completed scorecard be edited? Who can correct it?
6. Do all event players need to confirm a final score?
7. Is offline saving needed in the MVP, or later?
8. Are live updates required, or is refresh/save enough?
9. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - mobile-first score entry and flexible score data.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - match score model and offline ID.
- [F02 - User Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) - sign-in.
- [F06 - Event Scheduling & Capacity Tracking](./F06-Event_Scheduling_%26_Capacity_Tracking.md) - events.
- [F07 - Event RSVP & Substitute Request System](./F07-Event_RSVP_%26_Substitute_Request_System.md) - event players.
- [F09 - Group Leaderboard & Standings Engine](./F09-Group_Leaderboard_%26_Standings_Engine.md) - standings.
- [F10 - Player Analytics & Match History Dashboard](./F10-Player_Analytics_%26_Match_History_Dashboard.md) - player statistics.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
