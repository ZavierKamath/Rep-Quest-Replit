
# Rep Quest - App Specification for Replit (Flutter)

## Overview
Rep Quest is a dark pixel-art themed mobile application for iOS that allows users to track their resistance training workouts. The app focuses on intuitive UI, low user input, and seamless user experience. Data should be synced locally and backed up via Google Drive (no dedicated cloud database needed).

## Key Technologies
- **Frontend Framework**: Flutter
- **Backend Services**: Not sure
- **Data Sync**: Google Drive integration via Google APIs

---

## App Structure
### Tabs (Bottom Navigation Bar):
1. **Train** – Track the current day's split and exercises
2. **Splits** – Create, configure, and manage workout splits
3. **Progress** – Visualize workout progress with charts

---

## Feature Requirements

### UI/UX
- Theme: Dark background with neon + pixel-art UI elements
- Each lift should have a retro-style icon
- UI should prioritize ease of use and reduce number of inputs required

### Splits
- Allow user to create named splits (e.g. "Push Pull Legs")
- Assign a default split
- Each split defines a sequence of days (e.g. Push / Pull / Legs)
- For each day, allow user to specify default lifts (from a predefined list)
- Support substituting lifts on the fly

### Lifts & Sets
- Predefined list of lifts (see appendix below)
- Each lift has default number of sets and starting weight
- App should remember the last weight used for each lift and set that as default for next time
- User should be able to quickly increase/decrease weight (step amount varies by lift)
- User should be able to easily log the amount of reps that they have done for each exercise

### Workout Tracking
- Upon opening the app, show today's day in split with the relevant lifts
- Display yesterday’s and tomorrow’s day (faded) for context
- Tap lift to expand: enter sets, reps, and weight
- Automatically advance to next lift after entry

### Data Visualization
- Tab shows charts for selected lifts (e.g. weight over time)
- Highlight PRs or significant jumps
- Track number of workouts completed per week/month

### Google Drive Integration
- On login, request user permission to access their Google Drive
- Sync workout history and preferences as a single JSON file
- On app start, load local data and sync in background with Drive
- If no Drive data exists, create a new file

---

## Data Model (Local JSON or Firestore Schema)
```json
{
  "user": {
    "default_split": "PushPullLegs",
    "splits": {
      "PushPullLegs": {
        "days": [
          {
            "name": "Push",
            "lifts": ["bench_press", "shoulder_press", "tricep_pushdown"]
          },
          {
            "name": "Pull",
            "lifts": ["lat_pulldown", "cable_row", "bicep_curl"]
          },
          {
            "name": "Legs",
            "lifts": ["squat", "hamstring_curl", "calf_raise"]
          }
        ]
      }
    },
    "lift_history": {
      "bench_press": [
        {"date": "2025-05-01", "sets": ["135x10", "145x8", "155x6"]},
        {"date": "2025-05-03", "sets": ["140x10", "150x8", "160x6"]}
      ]
    }
  }
}
```

---

## Appendix: List of Available Lifts
- Shoulder press
- Chest press
- Bench press
- Incline bench press
- DB lateral raises
- Cable lateral raises
- Rear delt cable flies
- Rear delt machine flies
- Tricep extension lean out (and unilateral)
- Tricep extension overhead (and unilateral)
- Tricep bar pushdown
- Tricep rope pushdown
- Tricep triangle pushdown
- Preacher curl (regular and unilateral)
- Standing curl (regular and unilateral)
- Incline bench curl behind back (regular and unilateral)
- Hammer curl
- Leg extension
- Squat
- Leg press
- Hamstring curl
- RDL
- Deadlift
- Calf raise with DBs
- Calf raise (outstretched legs machine)
- Calf raise (seated machine)
- Calf raise (standing machine)
- Lat pulldown
- Cable row
- Machine row
- Machine lat pulldown
- Trap shrugs

---

## Summary of LLM Instructions
- Build a Flutter app for iOS only
- Integrate Google Drive for data backup
- Keep UI minimal, stylized, and focused on reducing user input
- Prioritize tracking consistency, default memory, and fast interactions
