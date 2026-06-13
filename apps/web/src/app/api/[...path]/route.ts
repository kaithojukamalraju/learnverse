import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/api/gemini";
import { supabase } from "@/lib/api/supabase";
import { buildPrompt, PROMPTS } from "@learnverse/ai";

type RouteHandler = (req: NextRequest, params: string[], matched: Record<string, string>) => Promise<NextResponse>;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function success(data: unknown, status = 200) {
  return json({ success: true, data }, status);
}

function error(message: string, status = 500) {
  return json({ success: false, error: message }, status);
}

interface RouteEntry {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

const routes: RouteEntry[] = [];

function on(method: string, pathTemplate: string, handler: RouteHandler) {
  const paramNames: string[] = [];
  const regexStr = pathTemplate.replace(/:([a-zA-Z_]+)/g, (_, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  const pattern = new RegExp(`^${regexStr}$`);
  routes.push({ method, pattern, paramNames, handler });
}

function matchRoute(method: string, path: string): { handler: RouteHandler; params: string[]; matched: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const m = path.match(route.pattern);
    if (m) {
      const params = m.slice(1);
      const matched: Record<string, string> = {};
      route.paramNames.forEach((name, i) => { matched[name] = params[i]; });
      return { handler: route.handler, params, matched };
    }
  }
  return null;
}

// Health
on("GET", "health", async () => {
  return success({ status: "ok", timestamp: new Date().toISOString(), version: "0.2.0" });
});

function getToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function authenticateRequest(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// Auth
on("POST", "auth/register", async (req) => {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return error("Name, email, and password required", 400);

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, full_name: name } },
  });

  if (signUpErr || !signUpData.user) {
    console.error("Supabase signUp error:", JSON.stringify(signUpErr), "data:", JSON.stringify(signUpData));
    return error(signUpErr?.message || "Registration failed", 500);
  }

  // Create profile in public.users table (if it exists), otherwise this is optional
  try {
    await supabase.from("users").insert({
      id: signUpData.user.id, name, email,
    }).select().maybeSingle();
  } catch (e) {
    // Optional profile creation failed
  }

  return success({
    user: {
      id: signUpData.user.id, name, email, role: "student",
      level: "beginner", xp: 0, streak: 0, avatar_url: null, created_at: signUpData.user.created_at,
    },
    token: signUpData.session?.access_token,
  }, 201);
});

on("POST", "auth/login", async (req) => {
  const { email, password } = await req.json();
  if (!email || !password) return error("Email and password required", 400);

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) return error("Invalid credentials", 401);

  const user = signInData.user;
  const meta = user.user_metadata || {};

  return success({
    user: {
      id: user.id, name: meta.name || meta.full_name || email.split("@")[0], email,
      role: "student", level: "beginner", xp: 0, streak: 0,
      avatar_url: user.identities?.[0]?.identity_data?.avatar_url || null,
      created_at: user.created_at,
    },
    token: signInData.session?.access_token,
  });
});

on("GET", "auth/me", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);

  const meta = supabaseUser.user_metadata || {};
  const name = meta.name || meta.full_name || supabaseUser.email?.split("@")[0] || "User";

  return success({
    id: supabaseUser.id, name, email: supabaseUser.email,
    role: "student", level: "beginner", xp: 0, streak: 0,
    avatar_url: supabaseUser.identities?.[0]?.identity_data?.avatar_url || null,
    created_at: supabaseUser.created_at,
  });
});

// Mock module data (used when database is empty)
const MOCK_MODULES = [
  { id: "mod-cell-1", title: "Cell Explorer", slug: "cell-explorer", description: "Explore the microscopic world of cell biology with interactive 3D models of organelles, cell structures, and their functions.", difficulty: "beginner", icon: "🔬", order_index: 1, is_published: true, category: "biology", xp_reward: 100 },
  { id: "mod-phy-1", title: "Physics Lab", slug: "physics-lab", description: "Master the laws of physics through interactive simulations — mechanics, waves, electromagnetism, and more.", difficulty: "intermediate", icon: "⚡", order_index: 2, is_published: true, category: "physics", xp_reward: 150 },
  { id: "mod-chem-1", title: "Chemistry Lab", slug: "chemistry-lab", description: "Mix elements, visualize molecules, and explore chemical reactions with 3D molecular models.", difficulty: "beginner", icon: "🧪", order_index: 3, is_published: true, category: "chemistry", xp_reward: 100 },
  { id: "mod-ds-1", title: "Data Structures", slug: "data-structures", description: "Learn arrays, linked lists, graphs, hash tables and more through interactive 3D visualizations.", difficulty: "advanced", icon: "📊", order_index: 4, is_published: true, category: "computer-science", xp_reward: 200 },
];

const MOCK_LESSONS: Record<string, any[]> = {
  "cell-explorer": [
    { id: "les-cell-1", module_id: "mod-cell-1", title: "Introduction to Cells", content: "Cells are the fundamental structural and functional units of all living organisms. Every living thing — from single-celled bacteria to complex multicellular humans — is made up of cells.\n\nThe Cell Theory has three main principles:\n1. All living organisms are composed of one or more cells\n2. The cell is the basic unit of structure and organization in organisms\n3. All cells arise from pre-existing cells\n\nCells are incredibly diverse in shape, size, and function. A human nerve cell can be over a meter long, while a red blood cell is only 8 micrometers in diameter. Despite this diversity, all cells share certain features: a cell membrane that separates the interior from the environment, cytoplasm that fills the cell, and genetic material (DNA) that directs cellular activities.\n\nThere are two main types of cells:\n• Prokaryotic cells (bacteria) — no nucleus, simpler structure\n• Eukaryotic cells (plants, animals, fungi) — have a nucleus and membrane-bound organelles\n\nIn this module, we'll focus on eukaryotic cells and their incredible internal structures called organelles, each specialized for specific functions.", duration_minutes: 10, order_index: 1, is_published: true },
    { id: "les-cell-2", module_id: "mod-cell-1", title: "The Nucleus & DNA", content: "The nucleus is often called the control center of the cell. It's the largest organelle and contains the cell's genetic material — DNA (deoxyribonucleic acid).\n\n**Structure of the Nucleus:**\n• Nuclear envelope — a double membrane that surrounds the nucleus, with pores that control what enters/exits\n• Nucleoplasm — the gel-like substance inside the nucleus\n• Nucleolus — a dense region where ribosomes are assembled\n• Chromatin — DNA wrapped around proteins called histones, organized into chromosomes during cell division\n\n**DNA and Genes:**\nDNA is a double helix molecule that stores all the genetic information needed to build and maintain an organism. Genes are specific segments of DNA that code for proteins. Humans have about 20,000-25,000 genes distributed across 46 chromosomes.\n\n**What the Nucleus Does:**\n• Stores genetic information securely\n• Controls gene expression — determines which proteins are made\n• Coordinates cell activities like growth, metabolism, and reproduction\n• Replicates DNA before cell division\n\nThe nucleus reads DNA and creates messenger RNA (mRNA) through transcription, which then leaves through nuclear pores to direct protein synthesis in the cytoplasm.", duration_minutes: 15, order_index: 2, is_published: true },
    { id: "les-cell-3", module_id: "mod-cell-1", title: "Mitochondria & Energy", content: "Mitochondria are known as the powerhouses of the cell. These remarkable organelles generate most of the cell's supply of ATP (adenosine triphosphate), which is the main energy currency for cellular work.\n\n**Structure:**\nMitochondria have a unique double-membrane structure:\n• Outer membrane — smooth, contains porins for molecule transport\n• Inner membrane — highly folded into cristae, increasing surface area\n• Matrix — the fluid-filled space inside the inner membrane\n• Own DNA and ribosomes — evidence of their evolutionary origin from ancient bacteria\n\n**Cellular Respiration:**\nMitochondria convert glucose and oxygen into ATP through three main stages:\n1. Glycolysis (occurs in cytoplasm) — glucose → pyruvate, produces 2 ATP\n2. Krebs Cycle (in matrix) — pyruvate → CO₂ + electron carriers, produces 2 ATP\n3. Electron Transport Chain (on inner membrane) — uses oxygen to generate ~34 ATP\n\nTotal: One glucose molecule can yield up to 36-38 ATP molecules!\n\n**Interesting Facts:**\n• A single liver cell can contain over 1,000 mitochondria\n• Muscle cells have more mitochondria than fat cells due to higher energy needs\n• Mitochondrial DNA is inherited exclusively from the mother\n• Mitochondria can change shape, divide, and fuse with each other", duration_minutes: 12, order_index: 3, is_published: true },
    { id: "les-cell-4", module_id: "mod-cell-1", title: "Cell Membrane & Transport", content: "The cell membrane (also called the plasma membrane) is a thin, flexible barrier that surrounds the cell, separating its interior from the external environment. It's selectively permeable — it controls what enters and exits the cell.\n\n**The Fluid Mosaic Model:**\nThe membrane consists of:\n• Phospholipid bilayer — two layers of phospholipids with hydrophilic heads facing outward and hydrophobic tails inward\n• Proteins — embedded throughout (integral) or on the surface (peripheral), serving as channels, carriers, receptors, and enzymes\n• Cholesterol — between phospholipids, provides stability and fluidity\n• Carbohydrates — on the outer surface, involved in cell recognition\n\n**Types of Transport:**\nPassive transport (no energy required):\n• Diffusion — molecules move from high to low concentration\n• Osmosis — diffusion of water across the membrane\n• Facilitated diffusion — uses protein channels/carriers\n\nActive transport (requires ATP energy):\n• Protein pumps — move substances against concentration gradient\n• Endocytosis — cell engulfs large particles (phagocytosis for solids, pinocytosis for liquids)\n• Exocytosis — vesicles fuse with membrane to release contents\n\nThe cell membrane is not just a barrier — it's a dynamic interface that enables communication, nutrient uptake, waste removal, and interaction with other cells.", duration_minutes: 14, order_index: 4, is_published: true },
    { id: "les-cell-5", module_id: "mod-cell-1", title: "Protein Synthesis", content: "Protein synthesis is the process by which cells build proteins. It's a two-step process: transcription (DNA → mRNA) and translation (mRNA → protein). This is known as the Central Dogma of Molecular Biology.\n\n**Step 1: Transcription (occurs in the nucleus)**\n1. RNA polymerase enzyme binds to a gene's promoter region on DNA\n2. It unwinds the DNA double helix and reads one strand\n3. It creates a complementary mRNA (messenger RNA) strand\n4. The mRNA is processed — introns removed, cap and tail added\n5. Mature mRNA exits the nucleus through nuclear pores\n\n**Step 2: Translation (occurs at ribosomes)**\n1. mRNA binds to a ribosome (rRNA + proteins)\n2. Ribosome reads mRNA in groups of 3 bases called codons\n3. Each codon specifies one amino acid (e.g., AUG = Methionine = START)\n4. tRNA (transfer RNA) molecules bring the correct amino acids\n5. The ribosome links amino acids together into a polypeptide chain\n6. Translation continues until a STOP codon (UAA, UAG, UGA) is reached\n7. The protein folds into its 3D shape, sometimes with help from chaperone proteins\n\n**Genetic Code:**\nThe genetic code is universal (nearly all organisms use the same codons), which is strong evidence for common ancestry. There are 64 possible codons coding for 20 amino acids, meaning the code is degenerate — multiple codons can code for the same amino acid.", duration_minutes: 20, order_index: 5, is_published: true },
  ],
  "physics-lab": [
    { id: "les-phy-1", module_id: "mod-phy-1", title: "Newton's Laws of Motion", content: "Newton's Laws of Motion are three fundamental principles that describe the relationship between a body and the forces acting upon it. They form the foundation of classical mechanics.\n\n**First Law — Law of Inertia:**\nAn object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external unbalanced force.\n\nThis means objects resist changes to their motion — this resistance is called inertia. The more mass an object has, the greater its inertia. A bowling ball is harder to push than a tennis ball because it has more mass and therefore more inertia.\n\nExample: When a car suddenly stops, passengers lurch forward because their bodies continue moving at the original speed (Newton's First Law in action). Seatbelts provide the external force to stop them.\n\n**Second Law — F = ma:**\nThe acceleration of an object is directly proportional to the net force applied and inversely proportional to its mass.\n\nFormula: F = ma (Force = mass × acceleration)\n• Force is measured in Newtons (N)\n• Mass in kilograms (kg)\n• Acceleration in meters per second squared (m/s²)\n\nExample: Applying the same force to a small car and a large truck — the smaller car will accelerate more because it has less mass.\n\n**Third Law — Action-Reaction:**\nFor every action force, there is an equal and opposite reaction force.\n\nForces always come in pairs. When you push on a wall, the wall pushes back with equal force. When a rocket expels gas downward, the gas pushes the rocket upward.\n\nExample: Walking — you push backward on the ground, and the ground pushes you forward with equal force.", duration_minutes: 15, order_index: 1, is_published: true },
    { id: "les-phy-2", module_id: "mod-phy-1", title: "Energy & Momentum", content: "Energy and momentum are two of the most important concepts in physics. They are both conserved quantities, meaning they cannot be created or destroyed, only transferred or transformed.\n\n**Forms of Energy:**\n• Kinetic Energy (KE) — energy of motion: KE = ½mv²\n• Potential Energy (PE) — stored energy: PE = mgh (gravitational)\n• Chemical energy — stored in chemical bonds\n• Thermal energy — heat\n• Electrical energy — flow of electrons\n• Nuclear energy — stored in atomic nuclei\n\n**Conservation of Energy:**\nThe total energy in an isolated system remains constant. Energy can transform from one form to another but cannot be created or destroyed.\n\nExample: A pendulum — at its highest point, it has maximum potential energy and zero kinetic energy. At its lowest point, it has maximum kinetic energy and minimum potential energy. Total energy remains constant (ignoring friction losses).\n\n**Momentum:**\nMomentum (p) = mass × velocity (p = mv)\nLike energy, momentum is conserved in isolated systems. This is crucial for understanding collisions.\n\n**Types of Collisions:**\n1. Elastic collisions — both momentum AND kinetic energy are conserved (billiard balls)\n2. Inelastic collisions — momentum is conserved but kinetic energy is not (a car crash — energy goes into deformation)\n3. Perfectly inelastic collisions — objects stick together after collision\n\n**Impulse:**\nImpulse = Force × time = change in momentum\nThis explains why airbags save lives — they increase the time over which the force is applied, reducing the peak force on the passenger.", duration_minutes: 18, order_index: 2, is_published: true },
    { id: "les-phy-3", module_id: "mod-phy-1", title: "Wave Mechanics", content: "Waves are disturbances that transfer energy through a medium or space without transferring matter. They are everywhere — sound, light, water waves, seismic waves, and even matter itself behaves like waves.\n\n**Types of Waves:**\n• Transverse waves — particles oscillate perpendicular to wave direction (light, water, string)\n• Longitudinal waves — particles oscillate parallel to wave direction (sound)\n• Electromagnetic waves — don't need a medium, can travel through vacuum (light, radio, X-rays)\n• Mechanical waves — require a medium (sound, water, seismic)\n\n**Key Properties:**\n• Wavelength (λ) — distance between consecutive peaks\n• Frequency (f) — number of waves per second, measured in Hertz (Hz)\n• Amplitude — height of the wave, determines energy carried\n• Speed (v) — how fast the wave travels: v = f × λ\n• Period (T) — time for one complete wave: T = 1/f\n\n**Wave Behavior:**\n• Reflection — waves bounce off surfaces (echoes, mirrors)\n• Refraction — waves change direction when entering a new medium (straw appearing bent in water)\n• Diffraction — waves spread out when passing through openings\n• Interference — waves combine: constructive (amplify) or destructive (cancel)\n\n**Standing Waves:**\nWhen two identical waves travel in opposite directions, they create standing waves with fixed points called nodes (no movement) and antinodes (maximum movement). This is how musical instruments produce specific notes — the fundamental frequency and its harmonics.", duration_minutes: 20, order_index: 3, is_published: true },
    { id: "les-phy-4", module_id: "mod-phy-1", title: "Electromagnetism", content: "Electromagnetism unifies electricity and magnetism into a single fundamental force. It describes how charged particles interact with each other and with magnetic fields.\n\n**Electric Charges and Fields:**\n• Like charges repel, opposite charges attract\n• Electric field (E) — a region around a charged object where other charges experience a force\n• Coulomb's Law: F = k(q₁q₂)/r² — force between two charges\n• Conductors allow electrons to flow (metals), insulators resist flow (rubber, plastic)\n\n**Current and Circuits:**\n• Electric current (I) — flow of charge, measured in Amperes\n• Voltage (V) — potential difference, drives the current\n• Resistance (R) — opposes current flow, measured in Ohms\n• Ohm's Law: V = IR\n• Series circuits — same current through all components\n• Parallel circuits — same voltage across all components\n\n**Magnetism:**\n• Moving charges create magnetic fields\n• Magnetic field lines go from North to South poles\n• Electromagnets — current through a coil creates a magnetic field\n• Applications: electric motors, generators, speakers, MRI machines\n\n**Electromagnetic Induction:**\nFaraday's Law: A changing magnetic field induces an electric current in a conductor. This is how generators produce electricity — mechanical energy rotates magnets near coils of wire.\n\n**Maxwell's Equations:**\nFour equations that unify electricity and magnetism:\n1. Gauss's Law for Electricity — electric charges create electric fields\n2. Gauss's Law for Magnetism — no magnetic monopoles exist\n3. Faraday's Law — changing magnetic fields create electric fields\n4. Ampere-Maxwell Law — changing electric fields create magnetic fields\n\n**The Electromagnetic Spectrum:**\nRadio → Microwaves → Infrared → Visible Light → UV → X-rays → Gamma Rays\nAll travel at the speed of light (3 × 10⁸ m/s) and differ only in wavelength and frequency.", duration_minutes: 22, order_index: 4, is_published: true },
  ],
  "chemistry-lab": [
    { id: "les-chem-1", module_id: "mod-chem-1", title: "Atomic Structure", content: "Atoms are the smallest units of matter that retain the properties of an element. Understanding atomic structure is fundamental to all of chemistry.\n\n**Subatomic Particles:**\n• Protons (+) — located in the nucleus, mass ≈ 1 amu, determine the element\n• Neutrons (neutral) — located in the nucleus, mass ≈ 1 amu, stabilize the nucleus\n• Electrons (−) — orbit the nucleus, negligible mass, determine chemical behavior\n\nThe number of protons defines the atomic number (Z). The sum of protons and neutrons gives the mass number (A).\n\n**Isotopes:**\nAtoms of the same element with different numbers of neutrons. Example:\n• Carbon-12: 6 protons + 6 neutrons (stable)\n• Carbon-13: 6 protons + 7 neutrons (stable)\n• Carbon-14: 6 protons + 8 neutrons (radioactive, used for dating)\n\n**The Bohr Model:**\nElectrons orbit the nucleus in specific energy levels (shells). Each shell can hold a maximum number of electrons:\n• Shell 1: 2 electrons\n• Shell 2: 8 electrons\n• Shell 3: 8 electrons (for first 18 elements)\n\n**Modern Quantum Model:**\nElectrons don't orbit in neat circles — they exist in orbitals, which are probability clouds describing where an electron is likely to be found. There are s, p, d, and f orbitals with different shapes.\n\n**The Periodic Table:**\nElements are arranged by increasing atomic number. Elements in the same column (group) have similar chemical properties because they have the same number of valence electrons. Rows (periods) correspond to the number of electron shells.\n\n• Group 1: Alkali metals (1 valence electron, highly reactive)\n• Group 18: Noble gases (8 valence electrons, stable, unreactive)\n• Transition metals: Groups 3-12, variable oxidation states", duration_minutes: 12, order_index: 1, is_published: true },
    { id: "les-chem-2", module_id: "mod-chem-1", title: "Chemical Bonding", content: "Chemical bonds are the forces that hold atoms together to form molecules and compounds. Understanding bonding explains why substances have particular properties.\n\n**Ionic Bonding:**\n• Involves complete transfer of electrons from one atom to another\n• Typically between metals (lose electrons → cations) and nonmetals (gain electrons → anions)\n• Results in strong electrostatic attraction between oppositely charged ions\n• Forms crystal lattices with high melting points\n• Conduct electricity when molten or dissolved\n• Example: NaCl — Sodium gives one electron to Chlorine, forming Na⁺ and Cl⁻\n\n**Covalent Bonding:**\n• Involves sharing of electrons between atoms\n• Typically between nonmetals\n• Can be single (1 pair), double (2 pairs), or triple bonds (3 pairs)\n• Forms molecules with lower melting points than ionic compounds\n• Examples: H₂O (polar covalent), CH₄ (nonpolar covalent), N₂ (triple bond)\n\n**Electronegativity and Bond Polarity:**\nElectronegativity is an atom's ability to attract shared electrons. The difference in electronegativity determines bond type:\n• Difference > 1.7: Ionic\n• Difference 0.4 - 1.7: Polar covalent\n• Difference < 0.4: Nonpolar covalent\n\n**Metallic Bonding:**\n• Metal atoms share their electrons in a 'sea of delocalized electrons'\n• Electron mobility explains why metals conduct electricity and heat well\n• Also explains malleability (can be hammered into sheets) and ductility (can be drawn into wires)\n\n**Intermolecular Forces:**\nWeaker forces between molecules:\n• Hydrogen bonds — strongest (DNA double helix, water's unique properties)\n• Dipole-dipole interactions\n• London dispersion forces — weakest, present in all molecules", duration_minutes: 15, order_index: 2, is_published: true },
    { id: "les-chem-3", module_id: "mod-chem-1", title: "Molecular Geometry", content: "Molecular geometry determines the 3D shape of molecules, which in turn determines their physical and chemical properties. VSEPR (Valence Shell Electron Pair Repulsion) theory is the key predictive tool.\n\n**VSEPR Theory:**\nElectron pairs around a central atom repel each other and arrange themselves to be as far apart as possible. Both bonding pairs AND lone pairs count as electron domains.\n\n**Common Molecular Shapes:**\n• Linear — 2 electron domains, 0 lone pairs, 180° (CO₂, BeCl₂)\n• Trigonal Planar — 3 domains, 0 lone pairs, 120° (BF₃, SO₃)\n• Bent — 3 domains, 1 lone pair, ~118° (SO₂); 4 domains, 2 lone pairs, 104.5° (H₂O)\n• Tetrahedral — 4 domains, 0 lone pairs, 109.5° (CH₄, NH₄⁺)\n• Trigonal Pyramidal — 4 domains, 1 lone pair, ~107° (NH₃)\n• Trigonal Bipyramidal — 5 domains, 0 lone pairs, 90°/120° (PCl₅)\n• Octahedral — 6 domains, 0 lone pairs, 90° (SF₆)\n\n**Why Shape Matters:**\n• Drug molecules fit into receptors like keys in locks — shape determines effectiveness\n• Water's bent shape gives it polarity, making it an excellent solvent\n• The linear shape of CO₂ makes it nonpolar and a greenhouse gas\n• Enzyme active sites have specific shapes to bind only target molecules\n\n**Polarity of Molecules:**\nA molecule is polar if:\n1. It has polar bonds (electronegativity difference)\n2. The shape is asymmetric (bond dipoles don't cancel)\n\nWater (H₂O) is polar because it's bent. Carbon dioxide (CO₂) is nonpolar because it's linear and the dipoles cancel.", duration_minutes: 18, order_index: 3, is_published: true },
    { id: "les-chem-4", module_id: "mod-chem-1", title: "Chemical Reactions", content: "Chemical reactions transform reactants into products by breaking and forming chemical bonds. They're described by chemical equations that must be balanced.\n\n**Key Principles:**\n• Law of Conservation of Mass — atoms are neither created nor destroyed in a chemical reaction\n• The same number of each type of atom must appear on both sides of the equation\n• Coefficients indicate the relative number of molecules/moles\n\n**Types of Chemical Reactions:**\n1. Synthesis (Combination): A + B → AB\n   Example: 2H₂ + O₂ → 2H₂O\n\n2. Decomposition: AB → A + B\n   Example: 2H₂O₂ → 2H₂O + O₂\n\n3. Single Displacement: A + BC → AC + B\n   Example: Zn + 2HCl → ZnCl₂ + H₂\n\n4. Double Displacement: AB + CD → AD + CB\n   Example: AgNO₃ + NaCl → AgCl + NaNO₃\n\n5. Combustion: Hydrocarbon + O₂ → CO₂ + H₂O\n   Example: CH₄ + 2O₂ → CO₂ + 2H₂O\n\n6. Redox (Oxidation-Reduction): electron transfer reactions\n   • Oxidation = loss of electrons\n   • Reduction = gain of electrons\n   • OIL RIG: Oxidation Is Loss, Reduction Is Gain\n\n**Stoichiometry:**\nUsing balanced equations to calculate quantities of reactants and products. The mole (6.022 × 10²³ particles) is the central unit.\n\n**Factors Affecting Reaction Rate:**\n• Temperature — higher temperature = faster reactions (kinetic energy increases)\n• Concentration — more particles = more collisions\n• Surface area — larger area = more contact\n• Catalysts — lower activation energy without being consumed\n\n**Activation Energy:**\nThe minimum energy required for a reaction to occur. Catalysts provide an alternative pathway with lower activation energy.", duration_minutes: 20, order_index: 4, is_published: true },
  ],
  "data-structures": [
    { id: "les-ds-1", module_id: "mod-ds-1", title: "Arrays & Strings", content: "Arrays are the most fundamental data structure — a contiguous block of memory storing elements of the same type, accessed by index.\n\n**Key Characteristics:**\n• Fixed size (in most languages) — determined at creation\n• Elements stored contiguously in memory\n• Zero-based indexing (usually) — first element at index 0\n• Random access — O(1) time to access any element by index\n\n**Time Complexities:**\n• Access: O(1) — instant, direct memory address calculation\n• Search: O(n) — linear scan; O(log n) if sorted (binary search)\n• Insertion: O(n) — elements must shift to make room\n• Deletion: O(n) — elements must shift to fill gap\n\n**Common Array Operations:**\n• Traversal — visiting each element (for loop)\n• Insertion at end — O(1) amortized (for dynamic arrays)\n• Reversal — two-pointer technique, O(n)\n• Rotation — left/right shift by k positions\n\n**Dynamic Arrays (ArrayList, Vector):**\nResizable arrays that double in size when full. Append is O(1) amortized — occasional O(n) resizing is spread across many operations.\n\n**Strings as Arrays:**\nStrings are essentially arrays of characters. Key operations:\n• Concatenation — O(n + m) to join two strings\n• Substring — O(k) to extract a portion\n• Palindrome check — two-pointer, O(n)\n\n**Practical Applications:**\n• Storing sequential data (scores, names)\n• Lookup tables (index-based)\n• Implementation of other structures (stacks, queues, heaps)\n• Image processing (pixel arrays)\n• Dynamic programming tables", duration_minutes: 15, order_index: 1, is_published: true },
    { id: "les-ds-2", module_id: "mod-ds-1", title: "Linked Lists", content: "A linked list is a linear data structure where elements (nodes) are connected via pointers. Unlike arrays, linked lists don't require contiguous memory.\n\n**Node Structure:**\nEach node contains:\n• Data — the actual value stored\n• Next pointer — reference to the next node (null for the last)\n\n**Types of Linked Lists:**\n• Singly linked — each node points only to the next node\n• Doubly linked — each node points to next AND previous\n• Circular linked — last node points back to first\n\n**Time Complexities:**\n• Access: O(n) — must traverse from head\n• Search: O(n) — sequential scan\n• Insertion at head: O(1)\n• Insertion at tail: O(1) with tail pointer; O(n) without\n• Deletion at head: O(1)\n• Deletion at arbitrary position: O(n) (must find the node first)\n\n**Key Advantage over Arrays:**\n• Dynamic size — no need to pre-allocate\n• Fast insertions/deletions at known positions — O(1) vs O(n) for arrays\n• No memory waste from pre-allocation\n\n**Key Disadvantage:**\n• No random access — must traverse from head\n• Extra memory for pointers (especially doubly linked)\n• Poor cache locality — nodes scattered in memory\n\n**Common Operations:**\n• Reverse a linked list — iterative (three pointers) or recursive\n• Detect cycle — Floyd's Tortoise and Hare algorithm\n• Find middle — slow and fast pointer technique\n• Merge two sorted lists\n\n**Real-World Uses:**\n• Undo/redo functionality in editors\n• Browser history (back/forward navigation)\n• Music playlist with next/previous\n• Hash table collision chains", duration_minutes: 18, order_index: 2, is_published: true },
    { id: "les-ds-3", module_id: "mod-ds-1", title: "Hash Tables", content: "A hash table (or hash map) is a data structure that maps keys to values using a hash function. It offers near-instant access time — O(1) average case.\n\n**How It Works:**\n1. A hash function converts the key into an array index\n2. The value is stored at that index\n3. To retrieve, hash the key again and go directly to that index\n\n**Hash Functions:**\nA good hash function:\n• Is deterministic — same key always produces the same hash\n• Distributes keys uniformly across the table\n• Is fast to compute\n\nCommon hash function: hashCode % array_size\n\n**Collision Handling:**\nWhen two different keys hash to the same index:\n1. Chaining — each bucket stores a linked list of key-value pairs\n2. Open Addressing — find the next available slot:\n   • Linear probing: try index+1, index+2, etc.\n   • Quadratic probing: try index+1², index+2², etc.\n   • Double hashing: use a second hash function for step size\n\n**Load Factor and Rehashing:**\nLoad factor = number of items / table size\nWhen load factor exceeds a threshold (typically 0.75), the table resizes (doubles) and all items are rehashed — this is O(n) but happens infrequently.\n\n**Time Complexities:**\n• Average case: O(1) for get, set, delete\n• Worst case: O(n) — all keys collide (rare with good hash)\n\n**Real-World Applications:**\n• Database indexing\n• Caching (memcached, Redis)\n• Symbol tables in compilers\n• Object/ dictionary implementations in languages\n• Password storage (with salted hashes)\n• Sets — when you need fast membership checking\n\n**Common Problems:**\n• Two Sum (find pair that adds to target)\n• First non-repeating character\n• Group anagrams\n• Subarray sum equals k\n\nA well-designed hash table is one of the most useful and efficient data structures in computer science.", duration_minutes: 20, order_index: 3, is_published: true },
    { id: "les-ds-4", module_id: "mod-ds-1", title: "Graphs & Trees", content: "Graphs are powerful data structures that model relationships between entities. Trees are a special type of graph — connected and acyclic.\n\n**Graph Basics:**\n• Vertices (nodes) — the entities\n• Edges — connections between vertices\n• Directed vs Undirected — edges have direction or not\n• Weighted vs Unweighted — edges have costs or not\n\n**Graph Representations:**\n• Adjacency Matrix — O(V²) space, O(1) edge check\n• Adjacency List — O(V+E) space, O(degree(v)) edge check\n\n**Tree Basics:**\nA tree is a connected, acyclic, undirected graph. Key terminology:\n• Root — top node (no parent)\n• Parent/Child — direct relationships\n• Leaf — node with no children\n• Height — longest path from root to leaf\n• Depth — distance from root\n\n**Binary Trees:**\nEach node has at most 2 children (left and right).\n• Full binary tree — every node has 0 or 2 children\n• Complete binary tree — all levels filled except possibly last\n• Perfect binary tree — all levels completely filled\n\n**Binary Search Tree (BST):**\nFor each node: left child < node < right child\n• Search: O(h) where h = height (O(log n) if balanced, O(n) if skewed)\n• Insert/Delete: O(h)\n\n**Tree Traversals:**\n• In-order (Left, Root, Right) — gives sorted order for BST\n• Pre-order (Root, Left, Right) — copy the tree\n• Post-order (Left, Right, Root) — delete the tree\n• Level-order (BFS) — breadth-first\n\n**Graph Traversal Algorithms:**\n• BFS (Breadth-First Search) — uses queue, finds shortest path in unweighted graphs, O(V+E)\n• DFS (Depth-First Search) — uses stack/recursion, finds if path exists, O(V+E)\n\n**Shortest Path Algorithms:**\n• Dijkstra's — O((V+E)log V) with heap, handles weighted graphs (no negative edges)\n• Bellman-Ford — O(VE), handles negative edges\n• Floyd-Warshall — O(V³), all-pairs shortest paths\n\n**Minimum Spanning Tree:**\n• Kruskal's — sort edges, add smallest that doesn't create cycle\n• Prim's — grow tree from start vertex\n\n**Real-World Applications:**\n• Social networks — friends, followers (graph)\n• File systems — directory structure (tree)\n• GPS navigation — shortest path (Dijkstra)\n• Web crawling — BFS/DFS through web pages\n• AI game search — decision trees", duration_minutes: 25, order_index: 4, is_published: true },
  ],
};

// Modules
on("GET", "modules", async () => {
  const { data: modules, error: err } = await supabase.from("modules").select("*").eq("is_published", true).order("order_index", { ascending: true });
  if (err || !modules || modules.length === 0) return success(MOCK_MODULES);
  return success(modules);
});

on("GET", "modules/:slug", async (req, _params, matched) => {
  const slug = matched.slug;
  const { data: mod, error: err } = await supabase.from("modules").select("*").eq("slug", slug).maybeSingle();
  if (!mod || err) {
    const mock = MOCK_MODULES.find((m) => m.slug === slug);
    if (!mock) return error("Module not found", 404);
    return success(mock);
  }
  return success(mod);
});

on("GET", "modules/:slug/lessons", async (req, _params, matched) => {
  const slug = matched.slug;
  const { data: mod, error: modErr } = await supabase.from("modules").select("id").eq("slug", slug).maybeSingle();
  if (!mod || modErr) {
    const mockLessons = MOCK_LESSONS[slug];
    if (!mockLessons) return error("Module not found", 404);
    return success(mockLessons);
  }

  const { data: lessons } = await supabase
    .from("lessons").select("*")
    .eq("module_id", mod.id).eq("is_published", true)
    .order("order_index", { ascending: true });

  return success(lessons || []);
});

// AI
on("POST", "ai/chat", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);
  const userId = supabaseUser.id;

  const { message, session_id } = await req.json();
  if (!message) return error("Message required", 400);

  const sessionId = session_id || crypto.randomUUID();

  try {
    await supabase.from("ai_chats").insert({
      user_id: userId, session_id: sessionId, role: "user", content: message,
    });
  } catch { /* optional */ }

  const fullPrompt = `${PROMPTS.tutor}\n\nStudent: ${message}\n\nNova:`;

  let responseText: string;
  try {
    responseText = await generateResponse(fullPrompt);
  } catch {
    responseText = `I understand you're asking about an interesting topic! To give you the best answer, I'd recommend checking the relevant module in LearnVerse AI — you'll find interactive 3D models and lessons there. Feel free to ask a more specific question!`;
  }

  try {
    await supabase.from("ai_chats").insert({
      user_id: userId, session_id: sessionId, role: "assistant",
      content: responseText, metadata: { model: "gemini-2.0-flash" },
    });
  } catch { /* optional */ }

  return success({ response: responseText, session_id: sessionId, model: "gemini-2.0-flash" });
});

on("POST", "ai/explain", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);

  const { topic, level = "beginner" } = await req.json();
  if (!topic) return error("Topic required", 400);

  const prompt = buildPrompt(PROMPTS.explain, { topic, level });
  const explanation = await generateResponse(prompt);
  return success({ explanation, topic, level });
});

on("POST", "ai/generate-quiz", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);

  const { topic, difficulty = "beginner", count = 5 } = await req.json();
  if (!topic) return error("Topic required", 400);

  const prompt = buildPrompt(PROMPTS.generateQuiz, { topic, difficulty, count: String(count) });
  const quizJson = await generateResponse(prompt);

  let questions;
  try {
    questions = JSON.parse(quizJson.replace(/```json|```/g, "").trim());
  } catch {
    questions = [{ text: "Could not generate quiz. Try again.", options: ["OK"], correct_answer: "OK", explanation: "Parsing error", points: 0 }];
  }

  return success({ questions });
});

on("POST", "ai/recommendations", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);
  const userId = supabaseUser.id;

  let completedModules = 0;

  try {
    const { data: progress } = await supabase.from("progress").select("status").eq("user_id", userId);
    completedModules = (progress as Array<{ status: string }>)?.filter((p) => p.status === "completed").length || 0;
  } catch { /* optional */ }

  const prompt = buildPrompt(PROMPTS.recommend, { completedModules: String(completedModules), level: "beginner" });
  const recommendation = await generateResponse(prompt);
  return success({ recommendation, completedModules });
});

// Quizzes
on("POST", "quizzes/start", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);
  const userId = supabaseUser.id;

  const { quiz_id } = await req.json();
  if (!quiz_id) return error("quiz_id required", 400);

  const { data: quiz, error: quizErr } = await supabase
    .from("quizzes").select("*, questions(*)").eq("id", quiz_id).order("questions(order_index)", { ascending: true }).single();

  if (quizErr || !quiz) return error("Quiz not found", 404);

  const maxScore = (quiz.questions || []).reduce((sum: number, q: any) => sum + (q.points || 0), 0);

  const { data: attempt, error: attemptErr } = await supabase.from("quiz_attempts").insert({
    user_id: userId, quiz_id, max_score: maxScore,
  }).select().single();

  if (attemptErr || !attempt) return error("Failed to start quiz", 500);

  return success({
    attempt_id: attempt.id,
    quiz: { id: quiz.id, title: quiz.title, time_limit_seconds: quiz.time_limit_seconds, difficulty: quiz.difficulty },
    questions: (quiz.questions || []).map((q: any) => ({
      id: q.id, text: q.text, type: q.type, options: q.options, points: q.points,
    })),
  });
});

on("POST", "quizzes/submit", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);
  const userId = supabaseUser.id;

  const { attempt_id, answers, time_taken_seconds } = await req.json();
  if (!attempt_id || !answers) return error("attempt_id and answers required", 400);

  const { data: attempt } = await supabase
    .from("quiz_attempts").select("*, quiz:quizzes(id, lesson_id, passing_score, questions(*))")
    .eq("id", attempt_id).single();

  if (!attempt || attempt.user_id !== userId) return error("Attempt not found", 404);

  const quiz = attempt.quiz as any;
  const questionsList = quiz?.questions || [];

  let score = 0;
  const graded = answers.map((a: { question_id: string; answer: string }) => {
    const question = questionsList.find((q: any) => q.id === a.question_id);
    const correct = question?.correct_answer === a.answer;
    if (correct) score += question?.points || 0;
    return { question_id: a.question_id, answer: a.answer, correct };
  });

  const passed = score >= (quiz?.passing_score || 0);

  await supabase.from("quiz_attempts").update({
    score, answers: graded, time_taken_seconds, passed, completed_at: new Date().toISOString(),
  }).eq("id", attempt_id);

  if (passed && quiz?.lesson_id) {
    await supabase.from("progress").upsert({
      user_id: userId, lesson_id: quiz.lesson_id,
      status: "completed", score, completed_at: new Date().toISOString(),
    }, { onConflict: "user_id_lesson_id", ignoreDuplicates: false });
  }

  return success({ score, max_score: attempt.max_score, passed, answers: graded });
});

on("GET", "quizzes/:id/result", async (req, _params, matched) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);
  const userId = supabaseUser.id;

  const attemptId = matched.id;

  const { data: attempt } = await supabase
    .from("quiz_attempts").select("*, quiz:quizzes(id, passing_score, questions(*))")
    .eq("id", attemptId).single();

  if (!attempt || attempt.user_id !== userId) return error("Attempt not found", 404);

  const quiz = attempt.quiz as any;

  return success({
    score: attempt.score, max_score: attempt.max_score, passed: attempt.passed,
    time_taken_seconds: attempt.time_taken_seconds, answers: attempt.answers,
    completed_at: attempt.completed_at,
    questions: (quiz?.questions || []).map((q: any) => ({
      id: q.id, text: q.text, correct_answer: q.correct_answer, explanation: q.explanation,
    })),
  });
});

// Progress
on("GET", "progress/:userId", async (req, _params, matched) => {
  const supabaseUser = await authenticateRequest(req);
  const userId = matched.userId || supabaseUser?.id;
  if (!userId) return error("Unauthorized", 401);

  const { data: progress } = await supabase
    .from("progress").select("*, lesson:lessons(*), module:modules(*)")
    .eq("user_id", userId).order("updated_at", { ascending: false });

  const { count: totalLessons } = await supabase
    .from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true);

  const completedLessons = (progress || []).filter((p: any) => p.status === "completed" && p.lesson_id).length;

  const { data: user } = await supabase
    .from("users").select("xp, streak, level").eq("id", userId).maybeSingle();

  return success({
    progress: progress || [],
    stats: {
      total_lessons: totalLessons || 0,
      completed_lessons: completedLessons,
      completion_percentage: totalLessons && totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      xp: user?.xp || 0, streak: user?.streak || 0, level: user?.level || "beginner",
    },
  });
});

on("POST", "progress/update", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Unauthorized", 401);
  const userId = supabaseUser.id;

  const { lesson_id, module_id, status, score, time_spent_minutes } = await req.json();
  if (!lesson_id && !module_id) return error("lesson_id or module_id required", 400);

  const data: Record<string, any> = { status, score, time_spent_minutes };
  if (status === "completed") data.completed_at = new Date().toISOString();

  const { data: record } = await supabase.from("progress").upsert({
    user_id: userId, lesson_id, module_id, ...data,
  }, { onConflict: lesson_id ? "user_id_lesson_id" : "user_id_module_id", ignoreDuplicates: false }).select().single();

  if (status === "completed") {
    try {
      await supabase.rpc("increment_xp", { user_id: userId, amount: 50 });
    } catch {
      try {
        await (supabase.from("users").update({ xp: 50 }) as any).gte("id", "0").eq("id", userId);
      } catch (e) {
        console.error("Backup XP update failed:", e);
      }
    }
  }

  return success(record || data);
});

// Voice
on("POST", "voice/stt", async (req) => {
  const body = await req.json();
  if (!body?.audio) return error("Audio data required", 400);
  return success({ transcript: "Voice transcription placeholder — connect Whisper API for production." });
});

on("POST", "voice/tts", async (req) => {
  const { text } = await req.json();
  if (!text) return error("Text required", 400);
  return success({ audio_url: null, message: "TTS placeholder — connect TTS API for production." });
});

// Email
on("POST", "email/verify", async (req) => {
  const { email } = await req.json();
  if (!email) return error("Email required", 400);
  return success({ message: "Verification email sent (placeholder)" });
});

on("GET", "email/verify/:token", async (req, _params, matched) => {
  if (!matched.token) return error("Token required", 400);
  return success({ message: "Email verified (placeholder)" });
});

// Admin
on("GET", "admin/users", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Admin only", 403);
  let role = null;
  try {
    const res = await (supabase.rpc("get_user_role", { user_id: supabaseUser.id }) as any);
    role = res?.data?.role || null;
  } catch (e) {
    console.error("Failed to query get_user_role RPC:", e);
  }
  if (role !== "admin") return error("Admin only", 403);

  const { data: users } = await supabase.from("users").select("*").order("xp", { ascending: false }).limit(50);
  return success(users || []);
});

on("GET", "admin/analytics", async (req) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Admin only", 403);

  const [usersRes, modulesRes, lessonsRes, attemptsRes] = await Promise.allSettled([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("modules").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("quiz_attempts").select("*", { count: "exact", head: true }),
  ]);

  return success({
    totalUsers: (usersRes as any).value?.count || 0,
    totalModules: (modulesRes as any).value?.count || 0,
    totalLessons: (lessonsRes as any).value?.count || 0,
    totalQuizAttempts: (attemptsRes as any).value?.count || 0,
  });
});

on("DELETE", "admin/users/:id", async (req, _params, matched) => {
  const supabaseUser = await authenticateRequest(req);
  if (!supabaseUser) return error("Admin only", 403);
  const { error: delErr } = await supabase.from("users").delete().eq("id", matched.id);
  if (delErr) return error("Failed to delete user", 500);
  return success({ message: "User deleted" });
});



// Catch-all
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path?.join("/") || "";
  const match = matchRoute("GET", path);
  if (match) return match.handler(req, match.params, match.matched);
  return error("Not found", 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path?.join("/") || "";
  const match = matchRoute("POST", path);
  if (match) return match.handler(req, match.params, match.matched);
  return error("Not found", 404);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path?.join("/") || "";
  const match = matchRoute("DELETE", path);
  if (match) return match.handler(req, match.params, match.matched);
  return error("Not found", 404);
}
