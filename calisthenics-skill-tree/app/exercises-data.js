// CENTRALIZED EXERCISE DATA
// All exercises defined here, imported everywhere else
// Since I will be using the exercise data in multiple places, itll be way easier to just have a file that encapsulates it


export const exercises = [
  {
    id: 1,
    name: "Push-ups",
    icon: "/icons/pushup.png",
    category: "push",
    difficulty: "Beginner",
    summary: "The fundamental upper body exercise. Builds chest, shoulders, and triceps.",
    prerequisites: [2],
    position: { left: 150, top: 360 },
    instructions: [
      "Start in a high plank: hands slightly wider than your shoulders, body in a straight line from head to heels.",
      "Brace your core and glutes and tuck your elbows to about 45 degrees from your torso.",
      "Lower under control until your chest is just above the floor.",
      "Press back up to full elbow extension without letting your hips sag.",
    ],
    mistakes: [
      "Flaring the elbows straight out to the sides.",
      "Letting the hips sag or pike up instead of holding a straight line.",
      "Doing half reps instead of a full range of motion.",
    ],
    tips: [
      "Squeeze your glutes and brace your abs like a moving plank.",
      "Lead with your chest, not your chin.",
    ],
  },
  {
    id: 2,
    name: "Knee Push-ups",
    icon: "/icons/knee-pushup.png",
    category: "push",
    difficulty: "Beginner",
    summary: "Modified push-up with knees on ground. Perfect for building strength.",
    prerequisites: [3],
    position: { left: 150, top: 510 },
    instructions: [
      "Kneel and place your hands slightly wider than shoulder-width.",
      "Keep a straight line from your head to your knees with hips tucked.",
      "Lower your chest toward the floor with elbows at about 45 degrees.",
      "Press back up to full extension.",
    ],
    mistakes: [
      "Letting the hips pike up so it becomes a kneeling shoulder press.",
      "Sitting weight back on the knees instead of leaning into the hands.",
    ],
    tips: [
      "Walk your knees further back to make it harder as you get stronger.",
      "Keep the same straight-body brace you'll need for full push-ups.",
    ],
  },
  {
    id: 3,
    name: "Incline Push-ups",
    icon: "/icons/incline-pushup.png",
    category: "push",
    difficulty: "Beginner",
    summary: "Push-ups with hands elevated. Great starting point for beginners.",
    prerequisites: [],
    position: { left: 150, top: 660 },
    instructions: [
      "Place your hands on a sturdy elevated surface — a bench, table, or wall.",
      "Step your feet back so your body forms a straight line.",
      "Lower your chest to the surface with elbows at about 45 degrees.",
      "Press back up to full extension.",
    ],
    mistakes: [
      "Choosing a surface so high it removes most of the challenge.",
      "Sagging hips or craning the neck forward.",
    ],
    tips: [
      "Lower the surface over time to progress toward floor push-ups.",
      "The higher your hands, the easier the movement.",
    ],
  },
  {
    id: 4,
    name: "Pull-ups",
    icon: "/icons/pullup.png",
    category: "pull",
    difficulty: "Beginner",
    summary: "Essential back and arm exercise. Builds pulling strength.",
    prerequisites: [5],
    position: { left: 400, top: 480 },
    instructions: [
      "Hang from a bar with an overhand grip, hands about shoulder-width apart.",
      "Set your shoulders down and back (depress and retract the scapula).",
      "Pull with your back and arms until your chin clears the bar.",
      "Lower under control to a full dead hang.",
    ],
    mistakes: [
      "Kipping or swinging to cheat the rep.",
      "Not reaching full extension at the bottom.",
      "Shrugging the shoulders up toward the ears at the start.",
    ],
    tips: [
      "Think about driving your elbows down and back.",
      "Use band assistance or slow negatives if you can't do a full rep yet.",
    ],
  },
  {
    id: 5,
    name: "Dead Hang",
    icon: "/icons/dead-hang.png",
    category: "pull",
    difficulty: "Beginner",
    summary: "Grip and shoulder stability foundation.",
    prerequisites: [],
    position: { left: 400, top: 660 },
    instructions: [
      "Grip a pull-up bar with an overhand grip, hands shoulder-width.",
      "Let your body hang with your arms straight.",
      "Keep your shoulders lightly engaged (not fully shrugged) and core gently braced.",
      "Hold for time, breathing steadily.",
    ],
    mistakes: [
      "Relaxing completely into the shoulders with zero engagement.",
      "Holding your breath.",
    ],
    tips: [
      "Build toward a 30–60 second hold to prepare for pull-ups.",
      "Chalk or a firmer grip helps if your hands slip.",
    ],
  },
  {
    id: 6,
    name: "Muscle-up",
    icon: "/icons/muscle-up.png",
    category: "compound",
    difficulty: "Advanced",
    summary: "Explosive pull-to-dip transition. Requires both pushing and pulling strength.",
    prerequisites: [1, 4],
    position: { left: 275, top: 200 },
    instructions: [
      "Start from a dead hang with a false grip (wrists over the top of the bar).",
      "Pull explosively, driving your chest high toward the bar.",
      "At the top of the pull, lean forward and roll your wrists over the bar.",
      "Transition into the dip position and press to a full lockout.",
    ],
    mistakes: [
      "Attempting it without a strong pull-up and dip base first.",
      "Pulling too low — your chest must reach near bar height before the transition.",
      "Chicken-winging one arm over instead of transitioning evenly.",
    ],
    tips: [
      "Drill explosive high pull-ups and straight-bar dips separately.",
      "Practice the transition with band assistance before going unassisted.",
    ],
  },
  /*{
    id: 7,
    name: "Diamond Push-ups",
    icon: "/icons/diamond-pushup.png",
    category: "push",
    difficulty: "Intermediate",
    summary: "Narrow grip push-up variation for triceps.",
    prerequisites: [1],
    position: { left: -10, top: 300 }
  }*/

  // ----- Legs category (high ids so they never clash with admin-added skills) -----
  {
    id: 101,
    name: "Bodyweight Squats",
    icon: "",
    category: "legs",
    difficulty: "Beginner",
    summary: "The foundation of lower-body strength. Builds quads, glutes, and mobility.",
    prerequisites: [],
    position: { left: 620, top: 660 },
    instructions: [
      "Stand with feet about shoulder-width, toes slightly turned out.",
      "Brace your core and push your hips back and down.",
      "Descend until your thighs are at least parallel, knees tracking over your toes.",
      "Drive through your whole foot to stand back up.",
    ],
    mistakes: [
      "Letting the knees cave inward.",
      "Heels lifting off the floor.",
      "Rounding the lower back at the bottom.",
    ],
    tips: [
      "Keep your chest up and weight balanced over your mid-foot.",
      "Go as deep as your mobility allows while keeping a neutral spine.",
    ],
  },
  {
    id: 102,
    name: "Lunges",
    icon: "",
    category: "legs",
    difficulty: "Beginner",
    summary: "Single-leg strength and balance. Bridges to harder unilateral work.",
    prerequisites: [101],
    position: { left: 620, top: 510 },
    instructions: [
      "Stand tall, then step forward into a long stride.",
      "Lower until both knees are about 90 degrees, back knee near the floor.",
      "Keep your front knee over your ankle and your torso upright.",
      "Push through the front foot to return to standing, then alternate legs.",
    ],
    mistakes: [
      "Letting the front knee collapse inward or shoot far past the toes.",
      "Leaning the torso too far forward.",
    ],
    tips: [
      "Take a long enough step to keep your front shin near vertical.",
      "Control the descent — don't crash the back knee down.",
    ],
  },
  {
    id: 103,
    name: "Bulgarian Split Squat",
    icon: "",
    category: "legs",
    difficulty: "Intermediate",
    summary: "Rear-foot-elevated split squat for serious single-leg strength.",
    prerequisites: [102],
    position: { left: 620, top: 360 },
    instructions: [
      "Place the top of your rear foot on a bench or low surface behind you.",
      "Hop your front foot far enough forward to load it.",
      "Lower straight down until your front thigh is about parallel.",
      "Drive through the front foot to stand; finish all reps, then switch legs.",
    ],
    mistakes: [
      "Front foot too close, turning it into a knee-grinding position.",
      "Pushing off the rear leg instead of loading the front.",
      "Letting the front knee cave inward.",
    ],
    tips: [
      "Keep most of your weight on the front leg throughout.",
      "A slight forward lean targets the glutes more.",
    ],
  },
  {
    id: 104,
    name: "Pistol Squat",
    icon: "",
    category: "legs",
    difficulty: "Advanced",
    summary: "A full single-leg squat. The benchmark of lower-body control and strength.",
    prerequisites: [103],
    position: { left: 620, top: 210 },
    instructions: [
      "Stand on one leg with the other extended straight in front of you.",
      "Brace your core and reach your arms forward for balance.",
      "Push your hips back and lower under control to the bottom.",
      "Drive through your foot to stand back up without touching the free leg down.",
    ],
    mistakes: [
      "Dropping into the bottom instead of controlling the descent.",
      "Heel lifting off the floor.",
      "Knee caving inward.",
    ],
    tips: [
      "Practice to a box or with a light counterweight held in front first.",
      "Ankle mobility and single-leg balance work make this far easier.",
    ],
  }
];

// Helper function to get exercise by ID
export const getExerciseById = (id) => {
  return exercises.find(ex => ex.id === parseInt(id));
};

// Helper function to get exercises by category
export const getExercisesByCategory = (category) => {
  return exercises.filter(ex => ex.category === category);
};

// Helper function to get all categories
export const getCategories = () => {
  const cats = [...new Set(exercises.map(ex => ex.category))];
  return cats;
};
