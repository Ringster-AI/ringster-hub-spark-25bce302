import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY")!;

Deno.test("encrypt integration credentials", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/encrypt-integration-credentials`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
        "apikey": ANON_KEY,
      },
      body: JSON.stringify({ migration_key: TOKEN_ENCRYPTION_KEY }),
    }
  );
  const body = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", body);
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${body}`);
  }
});
