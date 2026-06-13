import { GoogleGenerativeAI } from "@google/generative-ai";

const KNOWLEDGE: [RegExp, string][] = [
  [/what.*cell|cell.*struct|organelle|nucleus|mitochondria|ribosome|golgi|biology/i,
    "Cells are the basic structural units of life. Key organelles include:\n• **Nucleus** — Contains DNA, controls cell activities\n• **Mitochondria** — Powerhouse, generates ATP energy\n• **Ribosomes** — Protein synthesis factories\n• **Golgi Apparatus** — Packages proteins for transport\n• **ER** — Lipid synthesis and protein folding\n• **Cell Membrane** — Selective barrier regulating entry/exit"],
  [/what.*mitochondria|powerhouse.*cell|atp|energy.*cell/i,
    "Mitochondria are the 'powerhouses' of the cell. They convert glucose and oxygen into ATP (adenosine triphosphate) through cellular respiration. ATP is the main energy currency cells use for everything from muscle contraction to chemical synthesis. A single cell can contain hundreds to thousands of mitochondria depending on its energy needs."],
  [/what.*nucleus|dna|genetic.*material|chromosome/i,
    "The nucleus is the control center of the cell. It houses the cell's DNA organized into chromosomes. The nucleus regulates gene expression — determining which proteins are made and when. The nucleolus inside produces ribosomes. The nuclear envelope with pores controls what enters/exits."],
  [/photosynthesis|chloroplast|plant.*cell/i,
    "Photosynthesis occurs in chloroplasts. Plants use sunlight, CO₂, and water to produce glucose and oxygen: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. This process powers nearly all life on Earth."],
  [/protein.*synthesis|transcription|translation|dna.*rna/i,
    "Protein synthesis happens in two steps:\n1. **Transcription** — DNA is copied into mRNA in the nucleus\n2. **Translation** — Ribosomes read mRNA codons and assemble amino acids into proteins\n\nEach 3-letter codon on mRNA specifies one amino acid. tRNA molecules bring the correct amino acids to build the protein chain."],
  [/newton|force.*mass.*accel|f=ma|inertia|gravity/i,
    "Newton's Laws of Motion:\n1. **Inertia** — An object stays at rest or in motion unless acted on by a force\n2. **F=ma** — Force equals mass × acceleration\n3. **Action-Reaction** — Every action has an equal opposite reaction\n\nThese three laws form the foundation of classical mechanics."],
  [/energy|kinetic|potential|conservation.*energy/i,
    "Energy exists in two main forms:\n• **Kinetic Energy** (KE = ½mv²) — energy of motion\n• **Potential Energy** (PE = mgh) — stored energy\n\nThe Law of Conservation of Energy states energy cannot be created or destroyed, only transformed from one form to another."],
  [/wave|frequency|wavelength|amplitude|sound|electromagnetic/i,
    "Waves transfer energy without transferring matter. Key properties:\n• **Frequency** (f) — waves per second (Hz)\n• **Wavelength** (λ) — distance between wave peaks\n• **Amplitude** — wave height, determines energy\n• **Speed** v = f × λ\n\nElectromagnetic waves include radio, microwaves, infrared, visible light, UV, X-rays, gamma rays."],
  [/electromagnet|magnetic|electric.*field|faraday|maxwell/i,
    "Electromagnetism unifies electricity and magnetism. Key concepts:\n• Electric charges create electric fields\n• Moving charges create magnetic fields\n• Changing magnetic fields induce electric currents (electromagnetic induction)\n• Light is an electromagnetic wave\n\nMaxwell's equations describe all electromagnetic phenomena."],
  [/atom|proton|neutron|electron|atomic.*struct|periodic/i,
    "Atoms consist of:\n• **Protons** (+) — in nucleus, determine element\n• **Neutrons** (neutral) — in nucleus, stabilize\n• **Electrons** (−) — orbit nucleus, determine bonding\n\nThe number of protons defines the element. Isotopes have varying neutrons. Electrons occupy shells/orbitals with specific energy levels."],
  [/chem.*bond|ionic|covalent|hydrogen.*bond|molecule/i,
    "Chemical bonds hold atoms together:\n• **Ionic** — electron transfer (Na⁺Cl⁻), strong\n• **Covalent** — electron sharing (H₂O), very strong\n• **Hydrogen bonds** — weak attraction between H and O/N/F\n\nWater (H₂O) has polar covalent bonds with hydrogen bonding between molecules, giving it unique properties."],
  [/molecular.*geo|vsepr|shape.*molecule|bond.*angle/i,
    "VSEPR theory predicts molecular shapes based on electron pair repulsion:\n• **Linear** — CO₂, 180°\n• **Bent** — H₂O, 104.5°\n• **Trigonal planar** — BF₃, 120°\n• **Tetrahedral** — CH₄, 109.5°\nElectron pairs repel each other, determining the 3D shape."],
  [/chem.*reaction|stoichiometry|balance.*equation|reactant|product/i,
    "Chemical reactions rearrange atoms. Key concepts:\n• Reactants → Products\n• Mass is conserved (same atoms before/after)\n• Balancing ensures equal atoms on both sides\n• Types: synthesis, decomposition, single/double replacement, combustion\n• Catalysts speed reactions without being consumed"],
  [/array|index.*element|sort|search|travers/i,
    "Arrays are contiguous memory blocks storing elements of the same type. Key operations:\n• **Access** — O(1) by index\n• **Search** — O(n) linear, O(log n) if sorted (binary search)\n• **Insert/Delete** — O(n) at arbitrary position\n• Sorting: QuickSort O(n log n), MergeSort O(n log n), BubbleSort O(n²)"],
  [/linkend.?list|linked.?list|node.*pointer|singly|doubly|list.*travers|what.*link/i,
    "Linked lists store elements in nodes connected by pointers:\n• **Singly linked** — each node points to next\n• **Doubly linked** — each node points to next and prev\n• **Insert/Delete** — O(1) if you have the node reference\n• **Search/Access** — O(n) sequential only\n• No memory fragmentation like arrays"],
  [/hash.?table|hash.*map|dictionary|collision|bucket/i,
    "Hash tables map keys to values using a hash function. Key details:\n• **Average** — O(1) for get/set/delete\n• **Hash function** converts key to array index\n• **Collisions** handled by chaining (linked lists per bucket) or open addressing\n• **Load factor** = items/buckets — resize when too high\n• Used everywhere: caches, databases, language dictionaries"],
  [/graph|bfs|dfs|node.*edge|travers|shortest.*path|dijkstra|tree/i,
    "Graphs are networks of nodes connected by edges:\n• **BFS** — level-order, finds shortest path in unweighted graphs, O(V+E)\n• **DFS** — depth-first, uses stack/recursion, O(V+E)\n• **Dijkstra** — shortest path in weighted graphs, O((V+E)log V)\n• **Trees** — connected acyclic graphs (binary trees, BST, heaps)\n• Applications: social networks, maps, web crawling"],
  [/hello|hi\b|hey|good morning|good evening/i,
    "Hello! I'm Nova, your AI tutor. Ask me anything about biology, physics, chemistry, or computer science. I can help with concepts, answer questions, and guide your learning!"],
  [/who.*you|what.*you/i,
    "I'm Nova, the LearnVerse AI tutor! I'm here to help you understand science and computer science topics. Ask me about cell biology, physics laws, chemistry concepts, data structures, or anything you're learning!"],
  [/thank|thanks|appreciate/i,
    "You're welcome! Keep learning and exploring. If you have more questions, I'm here to help!"],
  [/help|what.*can.*you/i,
    "I can help with:\n• Cell biology (organelles, DNA, proteins)\n• Physics (Newton's laws, energy, waves, electromagnetism)\n• Chemistry (atoms, bonding, reactions, molecular shapes)\n• Computer Science (arrays, linked lists, hash tables, graphs)\n\nJust ask me anything about these topics!"],
];

let genAI: GoogleGenerativeAI | null = null;

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini API key not configured");
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

function localResponse(prompt: string): string {
  const msg = prompt.includes("Student:") ? prompt.split("Student:")[1].split("Nova:")[0].trim() : prompt;
  for (const [pattern, answer] of KNOWLEDGE) {
    if (pattern.test(msg)) return answer;
  }
  return (
    "Great question! Based on what you're learning in LearnVerse, here's what I can tell you:\n\n" +
    "I'm still expanding my knowledge on this specific topic. Try asking about:\n" +
    "• **Biology** — cells, organelles, photosynthesis, DNA\n" +
    "• **Physics** — Newton's laws, energy, waves, electromagnetism\n" +
    "• **Chemistry** — atoms, bonding, reactions, molecular shapes\n" +
    "• **Computer Science** — arrays, linked lists, hash tables, graphs\n\n" +
    "Or check the relevant module for interactive 3D models and detailed lessons!"
  );
}

export async function generateResponse(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return localResponse(prompt);

  try {
    const model = getModel();
    let lastErr: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err: any) {
        lastErr = err;
        const is429 = err?.status === 429 || (typeof err?.status === "string" && err.status === "429") || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("Too Many Requests");
        if (is429) {
          await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  } catch {
    return localResponse(prompt);
  }
}

export async function generateStreamResponse(prompt: string, onChunk: (text: string) => void): Promise<string> {
  const text = await generateResponse(prompt);
  onChunk(text);
  return text;
}
