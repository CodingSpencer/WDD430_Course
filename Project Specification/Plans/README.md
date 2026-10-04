# RecSquad MVP Feature Plans

This folder contains the RecSquad MVP feature plans. The assignment refers to `docs/plans/`; in this repository the plans are stored in `Project Specification/Plans/`.

## MVP Feature Inventory

| Feature | MVP scope |
|---|---|
| [F01 — Database & API Foundation](./F01-Database_Schema_%26_API_Infrastructure_Setup.md) | Set up the shared database, API server, common error responses, and developer tools that the other features use. |
| [F02 — Registration & Authentication](./F02-User_Registration_%26_Authentication_System.md) | Create accounts, verify email, sign in/out, and protect account access. |
| [F03 — Player Profile](./F03-Player_Profile_%26_Sport_Preference_Editor.md) | Let players view and update their name and preferred sports. |
| [F04 — Community Groups](./F04-Community_Group_Creation_%26_Management.md) | Let organizers create, update, view, and archive sports groups. |
| [F05 — Group Discovery](./F05-Feed_Based_Group_Discovery_%26_Search.md) | Help players find public groups and events with search and filters. |
| [F06 — Event Scheduling](./F06-Event_Scheduling_%26_Capacity_Tracking.md) | Let organizers create and manage group events with a time, place, and player limit. |
| [F07 — RSVPs & Substitute Requests](./F07-Event_RSVP_%26_Substitute_Request_System.md) | Let players respond to events and ask organizers for a substitute. |
| [F08 — Match Scorecards](./F08-Mobile_Match_Scorecard_Entry.md) | Let authorized players record match scores using a mobile-friendly scorecard. |
| [F09 — Group Standings](./F09-Group_Leaderboard_%26_Standings_Engine.md) | Calculate group rankings from completed scorecards using agreed sport-specific rules. |
| [F10 — Player Analytics & Match History](./F10-Player_Analytics_%26_Match_History_Dashboard.md) | Show players their match history and selected statistics. |

`F00-Practice_Feature` this was completed earlier in the week as a practice with planning with AI.

## Recommended Implementation Order

Some work can happen in parallel after its dependencies are met. The order below shows recommended phases, not a requirement that only one feature be worked on at a time.

| Order | Feature | Depends on | Why this order |
|---:|---|---|---|
| 1 | F01 — Database & API Foundation | None | Establishes the shared user/group/event/score data, API conventions, and server before feature work begins. |
| 2 | F02 — Registration & Authentication | F01 | Adds the account identity and permissions required by protected features. |
| 3 | F03 — Player Profile | F01, F02 | Needs the account record and signed-in player; can proceed in parallel with F04. |
| 3 | F04 — Community Groups | F01, F02 | Needs the database, sign-in, and organizer permissions; creates the groups used by later features. |
| 4 | F06 — Event Scheduling | F01, F02, F04 | Events belong to groups and must be managed by authorized organizers. |
| 5 | F05 — Group Discovery | F01, F04, F06 | Can show groups after F04; depends on F06 only for event results in the discovery feed. |
| 5 | F07 — RSVPs & Substitute Requests | F01, F02, F04, F06 | Players need accounts and events to respond to; organizer views need group permissions. |
| 6 | F08 — Match Scorecards | F01, F02, F06; coordinate player list with F07 | A scorecard belongs to an event. RSVP data can help choose its players, but the scorecard contract can be prepared while F07 is in progress. |
| 7 | F09 — Group Standings | F01, F04, F06, F08 | Standings need completed match scores and each scorecard's group/event relationship. |
| 7 | F10 — Player Analytics & Match History | F01, F02, F08; F09 only if standings are reused | Player statistics need saved matches. It can be built in parallel with F09 if it calculates its own agreed statistics. |

### Dependency Map

```text
F01
└── F02
    ├── F03
    └── F04
        └── F06
            ├── F05 (event results; groups can be discovered after F04)
            ├── F07
            └── F08
                ├── F09
                └── F10
```

F05 also depends on F04. F08 should coordinate with F07 about which event players are eligible to appear on a scorecard; the dependency can be relaxed if the MVP uses a different player-selection rule.

## First Feature to Implement

Start with **F01 — Database & API Foundation**. Every other feature depends on shared user, group, event, or score data and API rules. Agreeing on these first reduces the chance that separate features use incompatible field names, permission rules, or response formats.

## Risks That Could Delay Several Features

- **Unsettled shared architecture:** F01's database choice, server/client folders, migration approach, API error format, and OpenAPI process affect every feature. Confirm those choices before parallel implementation.
- **Authentication and permissions:** F02 is a blocker for account-owned actions. F01, F02, F04, and downstream plans must agree on role and ownership checks.
- **Unclear group and event rules:** Public/private visibility, membership, archive behavior, cancellation, capacity, and RSVP rules affect F04–F07 and discovery.
- **Different sport rules:** Score formats affect F08, while ranking and statistics depend on them in F09/F10. Choose the first supported sports and write example scoring rules early.
- **Location and map setup:** GeoJSON order, location privacy, map-provider keys, and usage costs can affect F04/F05.
- **Email and age requirements:** F02 needs a verified Resend sender domain. Its US minimum-age policy also needs an appropriate review of age checks, consent, and data handling before launch.
- **Team coordination:** The API contracts between events, RSVPs, scorecards, standings, and analytics need agreement before those features are built in parallel.

## Short Reflection

Planning often is one of the most difficult aspects of being a new project. Using AI help draft the plan does assist in the process, but can help aid in the seperation of what software engineers now about why we use planning documentation the way we do. I have often been confused by this way of planning and have often found it ineffective personally when trying to use it. I often feel like I am spending too much effort on making the planning side of the project look good, and losing time to improve the actual code. Hopefully that will change with tim, but for now I've used AI to help me plan the basic and have left some choices to be decided on later.
