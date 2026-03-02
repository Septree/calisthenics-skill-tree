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
    position: { left: 150, top: 360 }
  },
  {
    id: 2,
    name: "Knee Push-ups",
    icon: "/icons/knee-pushup.png",
    category: "push",
    difficulty: "Beginner",
    summary: "Modified push-up with knees on ground. Perfect for building strength.",
    prerequisites: [3],
    position: { left: 150, top: 510 }
  },
  {
    id: 3,
    name: "Incline Push-ups",
    icon: "/icons/incline-pushup.png",
    category: "push",
    difficulty: "Beginner",
    summary: "Push-ups with hands elevated. Great starting point for beginners.",
    prerequisites: [],
    position: { left: 150, top: 660 }
  },
  {
    id: 4,
    name: "Pull-ups",
    icon: "/icons/pullup.png",
    category: "pull",
    difficulty: "Beginner",
    summary: "Essential back and arm exercise. Builds pulling strength.",
    prerequisites: [5],
    position: { left: 400, top: 480 }
  },
  {
    id: 5,
    name: "Dead Hang",
    icon: "/icons/dead-hang.png",
    category: "pull",
    difficulty: "Beginner",
    summary: "Grip and shoulder stability foundation.",
    prerequisites: [],
    position: { left: 400, top: 660 }
  },
  {
    id: 6,
    name: "Muscle-up",
    icon: "/icons/muscle-up.png",
    category: "compound",
    difficulty: "Advanced",
    summary: "Explosive pull-to-dip transition. Requires both pushing and pulling strength.",
    prerequisites: [1, 4, 7],
    position: { left: 275, top: 200 }
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