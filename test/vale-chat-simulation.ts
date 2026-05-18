/**
 * Vale Chat Simulation — tests the full conversation flow.
 * Starts a session, sends messages, validates responses.
 *
 * Run: npx tsx test/vale-chat-simulation.ts
 */

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface SimTest {
  id: string;
  message: string;
  expectInReply?: string[];  // reply should contain at least one of these
  expectTool?: string;       // reply should show evidence of tool use
}

const TESTS: SimTest[] = [
  {
    id: "CHAT-01", message: "3 bed in Hoboken under 500k",
    expectInReply: ["Hoboken", "$", "bed"],
  },
  {
    id: "CHAT-02", message: "CMA for 36 Clark Ave Bloomfield",
    expectInReply: ["Clark", "Bloomfield", "estimate", "value", "bedroom", "bath"],
  },
  {
    id: "CHAT-03", message: "do you have any open houses this weekend",
    expectInReply: ["open house", "no upcoming", "check back", "search", "listing"],
  },
  {
    id: "CHAT-04", message: "rentals in Jersey City under 3000",
    expectInReply: ["Jersey City", "rent", "$"],
  },
  {
    id: "CHAT-05", message: "what is my home worth at 8 Saturn Court Vernon NJ",
    expectInReply: ["Saturn", "Vernon", "value", "estimate", "worth", "record"],
  },
  {
    id: "CHAT-06", message: "busco casa de 3 dormitorios en Paramus",
    expectInReply: ["Paramus", "$"],
  },
  {
    id: "CHAT-07", message: "can I buy a house without a real estate agent?",
    expectInReply: ["agent", "buy", "help", "recommend"],
  },
  {
    id: "CHAT-08", message: "multifamily properties in Bergen County under 700k",
    expectInReply: ["Bergen", "multi", "$"],
  },
];

async function startSession(): Promise<string> {
  const res = await fetch(`${IDX_API}/api/idx/chat/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  return data.sessionId;
}

async function sendMessage(sessionId: string, message: string): Promise<string> {
  const res = await fetch(`${IDX_API}/api/idx/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.reply || "";
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Vale Chat Simulation");
  console.log("═══════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    try {
      const sessionId = await startSession();
      const reply = await sendMessage(sessionId, test.message);
      const replyLower = reply.toLowerCase();

      // Check if reply contains at least one expected term
      const found = test.expectInReply?.some(term =>
        replyLower.includes(term.toLowerCase())
      );

      if (found || !test.expectInReply) {
        const clean = reply.replace(/\[ID:[a-f0-9-]+\]/gi, "").slice(0, 120);
        console.log(`  ✅ ${test.id}: "${test.message}"`);
        console.log(`     → ${clean}...`);
        passed++;
      } else {
        console.log(`  ❌ ${test.id}: "${test.message}"`);
        console.log(`     Expected one of: ${test.expectInReply?.join(", ")}`);
        console.log(`     Got: ${reply.slice(0, 150)}`);
        failed++;
      }
    } catch (e: any) {
      console.log(`  💥 ${test.id}: "${test.message}"`);
      console.log(`     → ${e.message}`);
      failed++;
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed, ${TESTS.length} total`);
  console.log("═══════════════════════════════════════════════════════════");

  if (failed > 0) process.exit(1);
}

main();
