/**
 * Evidence dump for typing / attention / focus asks (both surfaces).
 *   cd apps/hipaa-training && npx tsx scripts/dump-ask-gaps-evidence.ts
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL;

const API = process.env.HIPAA_TRAINING_API_URL!;
const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "";
const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";

async function main() {
  const login = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json() as Promise<{ token?: string; user?: { role?: string } }>);
  if (!login.token) throw new Error("login failed");
  console.log("auth", email, login.user?.role || "unknown");

  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");
  const msgs = [
    "How is my typing speed",
    "What needs my attention today?",
    "What's my focus today?",
  ];
  for (const surface of ["default", "founder-coach"] as const) {
    for (const message of msgs) {
      const r = await runSiyaAssistantAsync(message, [], {
        authToken: login.token,
        surface,
      });
      console.log("\n===", surface, "|", JSON.stringify(message), "===");
      console.log(
        JSON.stringify({
          ruleFinal: r.ruleFinal,
          knowledgeGap: r.knowledgeGap,
          task: r.routing?.task,
          softStop: /right staff guide for that yet/i.test(r.message || ""),
        }),
      );
      console.log(r.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
