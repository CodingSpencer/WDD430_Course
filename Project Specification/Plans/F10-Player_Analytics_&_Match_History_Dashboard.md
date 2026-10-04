# F10 — Player Analytics & Match History

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F10 |
| **Section** | Player Statistics & Match History |
| **Severity** | MINOR |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad statistics dashboard has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after deciding statistics and charts]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (data/API), F02 (accounts), F08 (completed scores); F09 if standings are reused |
| **Unblocks** | Players understanding their activity and progress over time |

## 1. Problem

Players need a way to look back at games and understand how they have been doing. A match history and a few clear statistics can show activity across sports without requiring players to calculate results themselves.

## 2. Goals

- Show a player's completed match history.
- Show a small set of useful statistics based on completed scorecards.
- Let a player see statistics by sport.
- Clearly explain what each statistic means.

## 3. Not Included

- Entering match scores (F08).
- Group standings (F09).
- Predicting future performance or giving coaching advice.
- Sharing statistics publicly unless selected.
- Complex analytics or custom report building.

## 4. People Who Use This

- **Player:** I want to review my recent matches and results.
- **Player:** I want to compare my activity across sports I play.
- **Profile visitor:** I want to see only the statistics the player has chosen to share.

## 5. What the System Must Do

- **FR-1.** A signed-in player must be able to view their own completed match history.
- **FR-2.** Match history must show useful basics such as date, sport, group/event, opponents or teammates where available, and result.
- **FR-3.** The system must show only completed matches in final statistics unless a statistic explicitly says otherwise.
- **FR-4.** Statistics must be calculated from saved match data and not manually copied into a profile.
- **FR-5.** The system must make the meaning of each statistic clear.
- **FR-6.** Players must not see private match data they are not allowed to access.
- **FR-7.** A player must not be able to request another player's private analytics by changing an ID.
- **FR-8.** If there is not enough match data, the dashboard must explain that instead of showing misleading values.
- **FR-9.** **[CHOOSE: whether players can make any statistics public on their profile.]**

## 6. Basic Quality and Safety Needs

- Statistics must be correct and traceable to completed match data.
- Do not compare statistics across sports if they measure different things.
- Clearly state when a percentage or average has no data to calculate from.
- Keep chart labels readable on a phone and accessible without relying on color alone.
- Use F01's API errors and documentation style.
- Avoid storing duplicate statistics unless there is a demonstrated performance need.

## 7. How We Know It Works

- **AC-1.** Given a player with completed matches, when they open their dashboard, then those matches appear in history.
- **AC-2.** Given an in-progress match, when statistics are calculated, then it is not counted in final results.
- **AC-3.** Given match results and a defined statistic, when it is calculated, then it matches the expected result in a test example.
- **AC-4.** Given no matches, when the dashboard opens, then it shows an empty message rather than an incorrect average or percentage.
- **AC-5.** Given another player requests private analytics, when the server checks permission, then it refuses or returns only approved public values.
- **AC-6.** Given a score is corrected, when analytics are opened again, then the displayed statistic reflects the corrected score.
- **AC-7.** Given the dashboard on a phone or with a screen reader, when it is used, then charts have readable labels or a text alternative.

## 8. Information to Store

Read from F01's `match_scores`, events, groups, and users.

- Match history should be queried from source match records.
- Calculate statistics from completed matches. Avoid saving duplicate totals in the user record at first.
- If performance later requires caching, document how cached values are refreshed when scores change.
- **[CHOOSE: define the exact statistics for each sport; proposal examples include matches played, win/loss ratio, average score below par, and recent head-to-head history.]**

## 9. API Routes

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `GET /api/v1/users/me/matches` | Signed-in player | List the current player's match history |
| `GET /api/v1/users/me/stats` | Signed-in player | Get the current player's statistics |
| `GET /api/v1/users/:id/stats` | Public or signed-in users **[CHOOSE]** | Get shareable statistics for a profile |

Support paging for match history. Document each statistic, its meaning, and the matches included in its calculation.

## 10. Screens and User Experience

- Player dashboard with a short summary and recent match list.
- Optional charts grouped by sport.
- Filters for sport and date range only if useful for the MVP.
- Explain empty states and what a statistic measures.
- Do not use color alone to show wins/losses.
- **[CHOOSE: which statistics and charts are needed for the first version.]**
- **[CHOOSE: are stats private, visible to signed-in users, or public?]**

## 11. AI / ML

Not applicable. The dashboard reports past results; it does not use AI predictions.

## 12. Things This Feature Connects To

- **F01:** Match data and API.
- **F02:** Identifies the player viewing their own information.
- **F03:** May display selected statistics on a player profile.
- **F08:** Source of completed scorecards.
- **F09:** May reuse group standings, but player analytics should not duplicate leaderboard rules.
- **Charts:** The proposal suggests Chart.js or Recharts; choose a library only if charts are needed.

## 13. Work Order

1. Finish F01, F02, and F08; agree with F09 on shared calculations.
2. Choose the initial statistics and write example calculations.
3. Agree on privacy rules and API response.
4. Build match history and summary screen.
5. Add charts only if they make the results clearer.
6. Test calculations and privacy.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| Statistics are calculated incorrectly | Define each measure and test with hand-worked examples. |
| Different sports are compared unfairly | Show sport-specific statistics separately. |
| Corrected scores leave stale statistics | Calculate from source records or refresh any cache after changes. |
| Private match details become public | Decide visibility and enforce it in the API. |
| Too many charts make the page hard to understand | Start with a few useful numbers and a recent match list. |

## 15. Releasing the Feature

- Release after scorecards have been saved for the sports included.
- Begin with match history and a few agreed statistics.
- **[CHOOSE: feature flag or no flag for the first release.]**
- If a statistic is wrong, hide that statistic while keeping the match history available.

## 16. Tests

- Test every statistic with small known match sets.
- Test empty history, one match, ties, and corrected scores.
- Test sport filters and match-history paging.
- Test that a player cannot read private analytics for another account.
- Check charts on a phone and with keyboard/screen reader; provide text alternatives.
- Compare sample results manually before release.

## 17. Documentation

- Explain each statistic in player-friendly language.
- Document which completed matches are included.
- Document privacy settings and API routes.
- Tell developers how score corrections affect displayed statistics.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Which statistics should be included in the first version?
3. Which sports and score types are supported?
4. How do the statistics work for ties, missing scores, or corrected matches?
5. Are match history and statistics private, shared with signed-in users, or public?
6. Should players be able to filter by sport, group, or date?
7. Start with a list/numbers, or include charts?
8. If charts are included, choose Chart.js or Recharts.
9. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - roles and score data.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - match score data.
- [F02 - User Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) - sign-in.
- [F03 - Player Profile & Sport Preference Editor](./F03-Player_Profile_%26_Sport_Preference_Editor.md) - profile display.
- [F08 - Mobile Match Scorecard Entry](./F08-Mobile_Match_Scorecard_Entry.md) - source match results.
- [F09 - Group Leaderboard & Standings Engine](./F09-Group_Leaderboard_%26_Standings_Engine.md) - group standings.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
