import { Lift, Split, Workout, Set, LiftHistory } from "@/types";

// Default available lifts from the app spec
export const defaultLifts: Lift[] = [
  { id: "shoulder_press", name: "Shoulder press", defaultWeight: 45, weightIncrement: 5, icon: "ri-basketball-line" },
  { id: "chest_press", name: "Chest press", defaultWeight: 95, weightIncrement: 5, icon: "ri-boxing-line" },
  { id: "bench_press", name: "Bench press", defaultWeight: 135, weightIncrement: 5, icon: "ri-boxing-line" },
  { id: "incline_bench_press", name: "Incline bench press", defaultWeight: 95, weightIncrement: 5, icon: "ri-boxing-line" },
  { id: "db_lateral_raises", name: "DB lateral raises", defaultWeight: 15, weightIncrement: 2.5, icon: "ri-arrow-left-right-line" },
  { id: "cable_lateral_raises", name: "Cable lateral raises", defaultWeight: 10, weightIncrement: 2.5, icon: "ri-arrow-left-right-line" },
  { id: "rear_delt_cable_flies", name: "Rear delt cable flies", defaultWeight: 15, weightIncrement: 2.5, icon: "ri-refresh-line" },
  { id: "rear_delt_machine_flies", name: "Rear delt machine flies", defaultWeight: 70, weightIncrement: 5, icon: "ri-refresh-line" },
  { id: "tricep_extension_lean_out", name: "Tricep extension lean out", defaultWeight: 15, weightIncrement: 2.5, icon: "ri-hand-coin-line" },
  { id: "tricep_extension_overhead", name: "Tricep extension overhead", defaultWeight: 15, weightIncrement: 2.5, icon: "ri-hand-coin-line" },
  { id: "tricep_bar_pushdown", name: "Tricep bar pushdown", defaultWeight: 40, weightIncrement: 5, icon: "ri-arrow-down-line" },
  { id: "tricep_rope_pushdown", name: "Tricep rope pushdown", defaultWeight: 35, weightIncrement: 5, icon: "ri-arrow-down-line" },
  { id: "tricep_triangle_pushdown", name: "Tricep triangle pushdown", defaultWeight: 35, weightIncrement: 5, icon: "ri-arrow-down-line" },
  { id: "preacher_curl", name: "Preacher curl", defaultWeight: 45, weightIncrement: 5, icon: "ri-contrast-2-line" },
  { id: "standing_curl", name: "Standing curl", defaultWeight: 20, weightIncrement: 2.5, icon: "ri-contrast-2-line" },
  { id: "incline_bench_curl", name: "Incline bench curl", defaultWeight: 20, weightIncrement: 2.5, icon: "ri-contrast-2-line" },
  { id: "hammer_curl", name: "Hammer curl", defaultWeight: 20, weightIncrement: 2.5, icon: "ri-contrast-2-line" },
  { id: "leg_extension", name: "Leg extension", defaultWeight: 90, weightIncrement: 10, icon: "ri-walk-line" },
  { id: "squat", name: "Squat", defaultWeight: 135, weightIncrement: 10, icon: "ri-walk-line" },
  { id: "leg_press", name: "Leg press", defaultWeight: 180, weightIncrement: 10, icon: "ri-walk-line" },
  { id: "hamstring_curl", name: "Hamstring curl", defaultWeight: 70, weightIncrement: 5, icon: "ri-walk-line" },
  { id: "rdl", name: "RDL", defaultWeight: 135, weightIncrement: 10, icon: "ri-walk-line" },
  { id: "deadlift", name: "Deadlift", defaultWeight: 185, weightIncrement: 10, icon: "ri-walk-line" },
  { id: "calf_raise_dbs", name: "Calf raise with DBs", defaultWeight: 40, weightIncrement: 5, icon: "ri-footprint-line" },
  { id: "calf_raise_outstretched", name: "Calf raise (outstretched legs)", defaultWeight: 90, weightIncrement: 5, icon: "ri-footprint-line" },
  { id: "calf_raise_seated", name: "Calf raise (seated)", defaultWeight: 80, weightIncrement: 5, icon: "ri-footprint-line" },
  { id: "calf_raise_standing", name: "Calf raise (standing)", defaultWeight: 100, weightIncrement: 5, icon: "ri-footprint-line" },
  { id: "lat_pulldown", name: "Lat pulldown", defaultWeight: 100, weightIncrement: 10, icon: "ri-arrow-down-line" },
  { id: "cable_row", name: "Cable row", defaultWeight: 90, weightIncrement: 10, icon: "ri-arrow-right-line" },
  { id: "machine_row", name: "Machine row", defaultWeight: 90, weightIncrement: 10, icon: "ri-arrow-right-line" },
  { id: "machine_lat_pulldown", name: "Machine lat pulldown", defaultWeight: 90, weightIncrement: 10, icon: "ri-arrow-down-line" },
  { id: "trap_shrugs", name: "Trap shrugs", defaultWeight: 50, weightIncrement: 5, icon: "ri-arrow-up-line" }
];

// Default splits
export const defaultSplits: Split[] = [
  {
    id: "push_pull_legs",
    name: "Push Pull Legs",
    days: [
      {
        name: "Push",
        lifts: ["bench_press", "shoulder_press", "tricep_pushdown"]
      },
      {
        name: "Pull",
        lifts: ["lat_pulldown", "cable_row", "bicep_curl"]
      },
      {
        name: "Legs",
        lifts: ["squat", "hamstring_curl", "calf_raise_standing"]
      }
    ]
  },
  {
    id: "upper_lower",
    name: "Upper Lower",
    days: [
      {
        name: "Upper",
        lifts: ["bench_press", "lat_pulldown", "shoulder_press", "cable_row", "tricep_pushdown", "bicep_curl"]
      },
      {
        name: "Lower",
        lifts: ["squat", "rdl", "leg_extension", "hamstring_curl", "calf_raise_standing", "calf_raise_seated"]
      }
    ]
  },
  {
    id: "full_body",
    name: "Full Body",
    days: [
      {
        name: "Full Body",
        lifts: ["bench_press", "squat", "lat_pulldown", "leg_press", "shoulder_press", "bicep_curl", "tricep_pushdown", "calf_raise_standing"]
      }
    ]
  }
];

// Generate workouts from a split
export const generateWorkoutsFromSplit = (
  split: Split,
  dayIndex: number,
  lifts: Lift[]
): Workout[] => {
  const day = split.days[dayIndex];
  if (!day) return [];
  
  return day.lifts.map((liftId, index) => {
    const lift = lifts.find(l => l.id === liftId);
    if (!lift) return null;
    
    return {
      id: `${split.id}_${dayIndex}_${index}`,
      name: lift.name,
      liftId: lift.id,
      defaultWeight: lift.defaultWeight,
      defaultSets: 3,
      repRange: "8-12 reps",
      weightIncrement: lift.weightIncrement,
      order: index
    };
  }).filter(Boolean) as Workout[];
};

// Generate empty data
export const createEmptyLiftHistory = (): LiftHistory => {
  const liftHistory: LiftHistory = {};
  defaultLifts.forEach(lift => {
    liftHistory[lift.id] = [];
  });
  return liftHistory;
};
