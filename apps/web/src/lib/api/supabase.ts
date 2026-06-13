import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error("Supabase not configured");
  }

  supabaseInstance = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: "public" },
  });

  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    return getSupabase()[prop];
  },
});

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").select("id", { count: "exact", head: true });
    if (error && error.code !== "42P01") throw error;
    return true;
  } catch {
    return false;
  }
}

export async function ensureBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.find((b) => b.name === "learnverse-assets");
    if (!exists) {
      await supabase.storage.createBucket("learnverse-assets", {
        public: true,
        fileSizeLimit: 10485760,
      });
    }
  } catch (err) {
    console.warn("Storage bucket check skipped:", (err as Error).message);
  }
}
