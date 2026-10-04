# F05 — Group Discovery & Search

> Sources: [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7 and [1.2 - Community Feed](./1.2-Community_Feed.md).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F05 |
| **Section** | Community Discovery |
| **Severity** | MAJOR |
| **Markets** | United States |
| **Status (today)** | MISSING - no RecSquad discovery feature has been implemented |
| **Estimated effort** | **[CHOOSE: XS / S / M / L / XL after confirming map and search scope]** |
| **Owner** | **[CHOOSE: person responsible for this feature]** |
| **Depends on** | F01 (database/API), F04 (groups); F06 (events) for event cards |
| **Unblocks** | Players finding groups and events to join |

## 1. Problem

Players may not know which local groups or games exist. Search and a browsable feed help them find activities by sport, day, and location rather than needing to know a group's name first.

## 2. Goals

- Show active public groups and upcoming public events.
- Let users filter results by sport and day.
- Support location-based results when location information is available.
- Link each result to its group or event details.

## 3. Not Included

- Creating or editing groups (F04).
- Scheduling events (F06).
- RSVP or joining a group (F07).
- Personalized recommendations using machine learning.
- Likes, comments, messaging, or paid event listings.
- **[CHOOSE: whether the map view is part of this feature or a later enhancement.]**

## 4. People Who Use This

- **Player:** I want to find nearby groups and events for sports I enjoy.
- **New visitor:** I want to browse public activities before deciding whether to create an account.
- **Organizer:** I want active public groups and events to be discoverable.

## 5. What the System Must Do

- **FR-1.** Show active public groups and upcoming public events.
- **FR-2.** Exclude archived, private, or deleted items in the server query, not just hide them in the browser.
- **FR-3.** Show each result's title, sport, location, schedule if available, and whether it is a group or event.
- **FR-4.** Let users filter results by sport and day of the week.
- **FR-5.** Let users clear all filters.
- **FR-6.** Let users open the related group or event details by selecting a result.
- **FR-7.** Support pages of results so a large search does not return everything at once. Start with up to 20 results per request.
- **FR-8.** If location is available, allow a distance filter and show nearer results first.
- **FR-9.** If there is no location, show results in a predictable order, such as the next event date.
- **FR-10.** Allow visitors to browse public results without signing in, unless the product chooses otherwise.

## 6. Basic Quality and Safety Needs

- Search should return within 500 ms for a normal page of results. **[Confirm with F01/API owner before load testing.]**
- Use F01's GeoJSON indexes for distance searches; coordinates are longitude first.
- Never include private group or personal location information in public results.
- Show a useful message when there are no results or the server cannot be reached.
- Search filters and result cards should work on mobile and with a keyboard.
- Use F01's shared API errors and document search parameters.

## 7. How We Know It Works

- **AC-1.** Given active public groups, when a visitor opens discovery, then those groups appear.
- **AC-2.** Given an archived or private group, when discovery is searched, then it is not returned.
- **AC-3.** Given a sport filter, when a user selects a sport, then only matching results appear.
- **AC-4.** Given a day filter, when a user selects a day, then only matching scheduled results appear.
- **AC-5.** Given a location and distance, when nearby search is used, then results within the requested distance are returned.
- **AC-6.** Given no location, when results are shown, then they use the documented fallback order.
- **AC-7.** Given more than one page of results, when the next page is requested, then no duplicate results appear.
- **AC-8.** Given a result card, when the user selects it, then the matching group/event details open.
- **AC-9.** Given no matching results or a server error, when the page loads, then a clear empty/error message appears.

## 8. Information to Store

F05 mainly reads group and event data from F01; it should not create duplicate records.

- Group name, sport, location, status, and visibility come from F04.
- Event title, sport through its group, and start time come from F06.
- Add indexes only if actual discovery queries need them; coordinate with F01.
- The user's location should not be stored just to search unless the product decides it is needed.

## 9. API Routes

Use F01's `/api/v1` prefix.

| Method and route | Who can use it? | What it does |
|---|---|---|
| `GET /api/v1/groups` | Public or signed-in user | Search groups |
| `GET /api/v1/events` | Public or signed-in user | Search upcoming events |
| `GET /api/v1/discovery` | Public or signed-in user | Optional combined group/event feed |

Possible query values: `sport`, `day`, `latitude`, `longitude`, `radius`, and page/cursor. **[CHOOSE: separate group/event search or one combined feed.]** Document valid ranges, defaults, and response fields.

## 10. Screens and User Experience

- Discovery page with a list of group/event cards.
- Filters for sport and day, plus location/distance if included.
- A map view is **[CHOOSE: in this release or later]**.
- Each card should show title, sport, place, schedule, and a clear link to details.
- Include loading, no-results, and retry states.
- Keep selected filters when returning from a detail page if practical.
- Provide a default sports image or placeholder when no image exists.

## 11. AI / ML

Not applicable. This feature uses simple filters and sorting, not recommendations from an AI model.

## 12. Things This Feature Connects To

- **F01:** Search API, MongoDB indexes, and GeoJSON location format.
- **F04:** Groups, visibility, and archive state.
- **F06:** Event schedules.
- **F02/F03:** Optional sign-in and preferred sports.
- **Maps provider:** **[CHOOSE whether to use Google Maps or launch with a list-only view.]**

## 13. Work Order

1. Finish F01 and F04; finish F06 before showing event results.
2. Decide list vs map and which filters are in the first version.
3. Agree on search parameters and result shape.
4. Build search routes and discovery screen.
5. Test privacy filters, location searches, and paging.

## 14. Main Risks

| Risk | How to reduce it |
|---|---|
| Private groups appear publicly | Filter visibility on the server and test it. |
| Coordinates are incorrect | Use F01's longitude-first format and test distance results. |
| Search is slow | Add indexes for measured search patterns and limit results per request. |
| Map provider adds cost or setup | Decide provider, API key restrictions, and budget before adding a map. |
| No results look like a broken page | Provide a helpful empty state and a way to clear filters. |

## 15. Releasing the Feature

- Release after group data exists; event search follows F06.
- Start with list search if the map choice is not settled.
- **[CHOOSE: feature flag or no flag for the first release.]**
- If map services fail, the list should remain usable.

## 16. Tests

- Test sport/day filters, location radius, sorting, and paging.
- Test archived/private groups never appear.
- Test empty results and API failure screens.
- Test result links open the correct details.
- Check mobile layout, keyboard use, and screen-reader labels.
- If a map is included, test unavailable map service and missing coordinates.

## 17. Documentation

- Explain discovery filters and location behavior.
- Document search routes and query parameters.
- Document map provider setup if a map is selected.

## 18. Choices to Make

1. Who owns the feature and what effort estimate fits?
2. Is the first version a list only, or does it include a map?
3. Should visitors browse without an account?
4. Should search show groups, events, or both in one feed?
5. Which filters are required at launch: sport, day, distance, date?
6. Which location should search use: user-entered coordinates, device location, or a chosen town/ZIP code?
7. If a map is included, use Google Maps or another provider, and what is the budget?
8. Should preferred sports from F03 automatically filter results?
9. What should results do when no location is provided?
10. Should a feature flag be used?

## 19. References

- [AGENTS.md](../AGENTS.md) - GeoJSON and maps context.
- [F01 - Database Schema & API Infrastructure Setup](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) - data and API.
- [F04 - Community Group Creation & Management](./F04-Community_Group_Creation_%26_Management.md) - group records.
- [F06 - Event Scheduling & Capacity Tracking](./F06-Event_Scheduling_%26_Capacity_Tracking.md) - events.
- [1.2 - Community Feed](./1.2-Community_Feed.md) - detailed feed idea.
- [RecSquad - Specifications Proposal](../ReqSquad%20-%20Specifications%20Proposal.docx) §§3, 5–7.
