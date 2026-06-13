export const SYSTEM_PROMPT = `You are Nova, an AI tutor for LearnVerse AI — an interactive 3D learning platform.
You help students understand complex topics in biology, physics, chemistry, and computer science.
Keep responses concise, educational, and engaging (under 200 words unless asked for detail).
Use analogies and examples. When relevant, reference the 3D models and simulations available in the platform.
Never make up facts — if unsure, say so and suggest the student check the relevant module.`;

export const PROMPTS = {
  tutor: SYSTEM_PROMPT,

  explain: `You are Nova, an AI tutor. Explain the following concept in simple terms suitable for a {level} student. Use analogies and real-world examples.\n\nConcept: {topic}`,

  generateQuiz: `Generate exactly {count} quiz questions about "{topic}" at {difficulty} difficulty. Return ONLY valid JSON — an array of objects, each with: text (string), options (array of 4 strings), correct_answer (string matching one option), explanation (string), points (number, 5-20). No markdown, no code fences, just the JSON array.`,

  recommend: `Based on a student who has completed {completedModules} modules at {level} level, recommend the next topic to study. Suggest one specific module or lesson and explain why in 2-3 sentences.`,
};

export function buildPrompt(template: string, vars: Record<string, string>): string {
  let prompt = template;
  for (const [key, val] of Object.entries(vars)) {
    prompt = prompt.replace(`{${key}}`, val);
  }
  return prompt;
}
