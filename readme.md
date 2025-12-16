RunOS

A fast, minimalist, web-based tool for the self-coached athlete, built around the weekly review and planning workflow.

Frontend: Vite + React + TypeScript + Tailwind CSSBackend: Node.js + ExpressDatabase: PostgreSQL (Neon)Data Source: Strava API / Garmin API

Pages & Features
Your application will have three primary views, mirroring your self-coaching needs: Macro Strategy, Weekly Tactic, Historical Review, Hall Of Fame (Personal Records).

1. 🗓️ Year / Goals Page (Macro Strategy)

- Purpose: Define races and structure the preparation cycle.
- Key Features:
  - Race Definition: Form to add races (date, distance, target).
  - The Visual: A horizontal bar representing the whole year. The current week is highlighted with a vertical "Now" line. The Phases and races are represented on that timeline.
  - Phase CRUD: Forms to define the start_date and end_date for phases (Base, Build, Peak, Taper, Recovery), linked to a specific race.

2. ⚡ Dashboard / Weekly Tab (Tactical planning linked to year strategy)

- Purpose: Execute the Sunday Ritual: Review last week and plan the next.
- Key Features:
  - Current Phase Context: Header shows: "Currently in Week X of [Phase Name]" (pulled from training_phases).
  - Plan vs. Actual (Side-by-Side): Display a simple comparison table for the current week.
    - Planned: (from weekly_plans) vs. Actual: (from activities).
  - Week view: a sliders to switch from the current week to the next one or the past one. same view comparison table.
  - A button to "Generate Weekly Card" that creates a simple, clean PNG image / TXT file for notes of the 7-day plan, a button sync to get data from garmin/strava.

3. 📝 Log Page (Review & Analysis)

- Purpose: Fast access to historical data with powerful filtering. This replaces your physical log file.
- Key Features:
  - Data Grid: A high-contrast, clean table view of all activities.
    - Columns must include your personal fields: RPE and Tags.
  - Smart Filter Bar (Integrated Search): A simple filter component above the table.
    - Examples: [Date Range], [Distance > X], [Type = Trail], [Tag = #bonked].
  - The year and month must be a card - drop down/ accordion that displays the detail of weeks and days (Date, Name, Dist, Elev, Time, Pace, Avg HR, RPE (Input), Tags (Input))
  - The year/month card must display total of Distance, Time, Elevation and PR if any
  - the table must update in real-time based on the current filters:
    - Monthly/Yearly Summary (Distance, Time, Elevation).
    - Personal Records (PRs): Automatically highlight the fastest run within defined/filtered distance ranges (e.g., Fastest run between 7.8km and 8.2km).

4. 🎖️ Records (The Hall of Fame)

- Purpose: Showcase static and dynamic Personal Records (PRs), providing clear milestones and performance history outside the daily/weekly grind.
- Standard distances: 1k, 5k, 10k, HM, M
- Custom: can create a custom distance like my fav park 6.2km.
- Trail records : Highest Single Run Vertical Gain, Longest ascending segment, longest descending segment
- Performance Edge: Lowest Avg HR for Long Run (can set the long run distance / specific pace), Highest Average HR for any run

  5.💭AI Chat

- Contextual Advice: Allows you to ask questions a filter cannot, such as: "Based on my RPE and HR data, did I hit my goal of keeping Zone 2 pace during the Base phase?" or "What patterns can you find in my running leading up to the runs where I used the #bonked tag?"
