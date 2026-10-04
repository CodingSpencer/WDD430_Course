# F09 — Group Leaderboard & Standings

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [AGENTS.md](../AGENTS.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F09 |
| **Section** | Group Standings |
| **Severity** | MAJOR |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad leaderboard has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after deciding ranking rules]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (data/API), F04 (groups), F06 (events), F08 (completed scores) |
| **Unblocks** | Players comparing results within a group; F10 may reuse standings data |

## 1. Problem

Players and organizers want to see how players are doing in a group. A leaderboard turns completed match results into an easy-to-understand order or standings table. The rules must be clear because sports use different ways to decide who wins.

## 2. Goals

- Show standings for a group based on saved completed match results.
- Explain the values used to order players.
- Use the correct scoring approach for each supported sport.
- Exclude incomplete or invalid scorecards.

## 3. Not Included

- Entering scores (F08).
- Scheduling matches (F06).
- Player analytics charts or full personal history (F10).
- Global rankings across every RecSquad user.
- Predictions, awards, or advanced statistics.

## 4. People Who Use This

- **Player:** I want to see my group's standings and compare completed results.
- **Organizer:** I want players to understand how the group standings are calculated.
- **New player:** I want to see the group's competitive activity before joining.

## 5. What the System Must Do

- **FR-1.** Show standings for a selected group.
- **FR-2.** Use completed scorecards only unless another rule is explicitly chosen.
- **FR-3.** Calculate each player's results using the agreed rules for that sport.
- **FR-4.** Show the values used for ranking, such as wins/losses or score.
- **FR-5.** Handle ties using a documented rule.
- **FR-6.** Do not count the same match more than once.
- **FR-7.** Do not include players or scores from a different group.
- **FR-8.** Explain when there are no completed matches yet.
- **FR-9.** Allow users to view a group's standings subject to the group's visibility rules.

## 6. Basic Quality and Safety Needs

- Show when standings were last updated if calculations are cached.
- Make the ranking rules visible in plain language.
- Avoid presenting a stat as a ranking if the product has not defined how to calculate it.
- Protect private group results using F04's visibility rules.
- Use F01's API error format and documentation conventions.
- Make the table usable on small screens; provide a non-table alternative if needed for accessibility.

## 7. How We Know It Works

- **AC-1.** Given completed matches in a group, when standings are requested, then only those matches affect the results.
- **AC-2.** Given an in-progress match, when standings are calculated, then it is not counted.
- **AC-3.** Given two players with different results, when standings are shown, then their order follows the documented rule.
- **AC-4.** Given players tied under the ranking rule, when standings are shown, then the documented tie behavior is used.
- **AC-5.** Given a match from a different group, when standings are calculated, then it is not included.
- **AC-6.** Given a group with no completed scores, when the page opens, then a clear empty message appears.
- **AC-7.** Given a user without permission to view a private group, when they request standings, then the server refuses.
- **AC-8.** Given a leaderboard on a phone or with a screen reader, when it is used, then player names and ranking values can be understood.

## 8. Information to Store

Standings should be calculated from F01's `match_scores`, linked events, groups, and players. Do not manually edit leaderboard totals.

- **[CHOOSE: calculate standings on each request or store/cache them for faster display.]**
- If standings are cached, define when they are refreshed and how to rebuild them from completed scores.
- Exact ranking fields depend on sport. Do not add generic fields until the rules are chosen.

## 9. API Route

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `GET /api/v1/groups/:id/leaderboard` | Public or group members **[CHOOSE]** | Get group standings |

Possible filters include season or date range only if selected. Document ranking fields and tie rules in the response and API docs.

## 10. Screens and User Experience

- Group page includes a standings list or table.
- Show rank, player name, and only the stats needed to explain the ranking.
- Show a helpful empty state when no completed matches exist.
- Clearly label season/date range if standings are limited to one.
- **[CHOOSE: which standings and stats should be shown for each sport.]**
- Make the view usable on a phone and accessible with keyboard/screen reader.

## 11. AI / ML

Not applicable. Standings use published rules, not an AI ranking.

## 12. Things This Feature Connects To

- **F01:** Match score and event data.
- **F04:** Group identity and visibility.
- **F06:** Event/group relationship.
- **F08:** Completed scores and participating players.
- **F10:** May use group performance values in player analytics.

## 13. Work Order

1. Finish F01, F04, F06, and F08.
2. Agree on one clear ranking rule per sport included.
3. Define how ties, seasons, and incomplete scores work.
4. Build leaderboard API and group page.
5. Test example match sets by hand and in automated tests.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| Ranking math is unclear or unfair | Write examples and get organizer/player agreement before implementation. |
| Different sports use different scoring rules | Define sport-specific calculations and do not force one formula on all sports. |
| Corrections make totals stale | Recalculate from completed scorecards or refresh the cache after score changes. |
| In-progress results appear as final | Include completed matches only. |
| Private group results are exposed | Apply group visibility rules on the server. |

## 15. Releasing the Feature

- Release after F08 can save completed scores for the chosen sports.
- Initially calculate from saved match data; add caching only if performance requires it.
- **[CHOOSE: feature flag or no flag for the first release.]**
- If calculation is wrong, hide the leaderboard while preserving source scorecards.

## 16. Tests

- Test each sport's ranking math with small example score sets.
- Test ties, no scores, and in-progress scores.
- Test that scores from other groups are excluded.
- Test corrections to completed scores update standings.
- Test visibility and mobile/accessibility behavior.
- Compare sample calculations manually with the expected order before release.

## 17. Documentation

- Explain how standings are calculated for each sport.
- Document tie rules and season/date filters.
- Document the leaderboard API response.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Which sports need a leaderboard in the first release?
3. How is a win/loss/tie determined for each sport?
4. What should the leaderboard rank: wins, points, average score, or another measure?
5. How should ties be displayed or broken?
6. Are standings for all time, a season, or a date range?
7. Who can see standings for public/private groups?
8. Calculate on each request or cache results?
9. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - match score and group context.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - score model.
- [F04 - Community Group Creation & Management](./F04-Community_Group_Creation_%26_Management.md) - groups.
- [F06 - Event Scheduling & Capacity Tracking](./F06-Event_Scheduling_%26_Capacity_Tracking.md) - events.
- [F08 - Mobile Match Scorecard Entry](./F08-Mobile_Match_Scorecard_Entry.md) - results.
- [F10 - Player Analytics & Match History Dashboard](./F10-Player_Analytics_%26_Match_History_Dashboard.md) - player statistics.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
