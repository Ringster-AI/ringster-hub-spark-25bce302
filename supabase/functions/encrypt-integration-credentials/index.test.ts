import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.test("encrypt integration credentials", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/encrypt-integration-credentials`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({}),
    }
  );
  const body = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", body);
});
