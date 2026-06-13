import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Modules
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        title: "Cell Explorer",
        slug: "cell-explorer",
        description: "Explore the microscopic world of cell biology in 3D",
        icon: "🔬",
        color: "#22c55e",
        difficulty: "beginner",
        order_index: 1,
        is_published: true,
      },
    }),
    prisma.module.create({
      data: {
        title: "Physics Lab",
        slug: "physics-lab",
        description: "Interactive physics simulations and experiments",
        icon: "⚛️",
        color: "#3b82f6",
        difficulty: "intermediate",
        order_index: 2,
        is_published: true,
      },
    }),
    prisma.module.create({
      data: {
        title: "Data Structures",
        slug: "data-structures",
        description: "Visualize and master computer science fundamentals",
        icon: "💻",
        color: "#a855f7",
        difficulty: "advanced",
        order_index: 3,
        is_published: true,
      },
    }),
    prisma.module.create({
      data: {
        title: "Chemistry Lab",
        slug: "chemistry-lab",
        description: "Molecular structures and chemical reactions in 3D",
        icon: "🧪",
        color: "#f59e0b",
        difficulty: "intermediate",
        order_index: 4,
        is_published: true,
      },
    }),
  ]);

  // Lessons for Chemistry Lab
  const chemModule = modules[3];
  await Promise.all([
    prisma.lesson.create({
      data: { module_id: chemModule.id, title: "Atomic Structure", slug: "atomic-structure", content: "# Atomic Structure\n\nAtoms are the basic units of matter...", duration_minutes: 12, order_index: 1, is_published: true },
    }),
    prisma.lesson.create({
      data: { module_id: chemModule.id, title: "Chemical Bonding", slug: "chemical-bonding", content: "# Chemical Bonding\n\nAtoms bond together to form molecules...", duration_minutes: 15, order_index: 2, is_published: true },
    }),
    prisma.lesson.create({
      data: { module_id: chemModule.id, title: "Reactions & Equations", slug: "reactions-equations", content: "# Reactions & Equations\n\nChemical reactions involve rearranging atoms...", duration_minutes: 10, order_index: 3, is_published: true },
    }),
  ]);

  // Lessons for Cell Explorer
  const cellModule = modules[0];
  const cellLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        module_id: cellModule.id,
        title: "Introduction to Cells",
        slug: "intro-to-cells",
        content: "# Introduction to Cells\n\nCells are the basic building blocks of all living organisms...",
        duration_minutes: 10,
        order_index: 1,
        is_published: true,
      },
    }),
    prisma.lesson.create({
      data: {
        module_id: cellModule.id,
        title: "Cell Membrane & Transport",
        slug: "cell-membrane",
        content: "# Cell Membrane & Transport\n\nThe cell membrane is a biological membrane that separates the interior...",
        duration_minutes: 15,
        order_index: 2,
        is_published: true,
      },
    }),
    prisma.lesson.create({
      data: {
        module_id: cellModule.id,
        title: "Nucleus & DNA",
        slug: "nucleus-dna",
        content: "# Nucleus & DNA\n\nThe nucleus contains the cell's genetic material...",
        duration_minutes: 12,
        order_index: 3,
        is_published: true,
      },
    }),
  ]);

  // Quiz for first lesson
  const quiz = await prisma.quiz.create({
    data: {
      lesson_id: cellLessons[0].id,
      title: "Cell Biology Basics",
      difficulty: "beginner",
      time_limit_seconds: 300,
      passing_score: 70,
      questions: {
        create: [
          {
            text: "What is the basic unit of life?",
            type: "multiple_choice",
            options: ["Atom", "Cell", "Tissue", "Organ"],
            correct_answer: "Cell",
            explanation: "Cells are the fundamental building blocks of all living organisms.",
            points: 10,
            order_index: 1,
          },
          {
            text: "Which organelle is known as the powerhouse of the cell?",
            type: "multiple_choice",
            options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
            correct_answer: "Mitochondria",
            explanation: "Mitochondria generate most of the cell's energy through ATP production.",
            points: 10,
            order_index: 2,
          },
          {
            text: "The cell membrane is selectively permeable.",
            type: "true_false",
            options: ["True", "False"],
            correct_answer: "True",
            explanation: "The cell membrane allows certain molecules to pass through while blocking others.",
            points: 5,
            order_index: 3,
          },
        ],
      },
    },
  });

  // Achievements
  await prisma.achievement.createMany({
    data: [
      { title: "First Steps", slug: "first-steps", description: "Complete your first lesson", icon: "⭐", xp_reward: 50, criteria: { type: "lesson_complete", count: 1 } },
      { title: "Quiz Master", slug: "quiz-master", description: "Score 100% on any quiz", icon: "🏆", xp_reward: 100, criteria: { type: "perfect_quiz", count: 1 } },
      { title: "Streak Starter", slug: "streak-starter", description: "Maintain a 3-day learning streak", icon: "🔥", xp_reward: 75, criteria: { type: "streak", count: 3 } },
      { title: "Knowledge Seeker", slug: "knowledge-seeker", description: "Complete 10 lessons", icon: "📚", xp_reward: 200, criteria: { type: "lesson_complete", count: 10 } },
    ],
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
