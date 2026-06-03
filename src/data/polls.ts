export interface PollOption {
  id: string;
  label: string;
  icon: string;
}

export interface Poll {
  id: string;
  segment: "sellers" | "buyers" | "renters" | "investors";
  question: string;
  options: PollOption[];
}

// ============================================================
// EDIT YOUR POLLS HERE
// One active poll per segment (sellers, buyers, renters).
// The MarketPoll component shows the right poll based on segment.
// ============================================================

export const polls: Poll[] = [
  // --- SELLERS ---
  {
    id: "sellers-june-2026",
    segment: "sellers",
    question: "Gas above $4. Inflation jumping. AI changing how homes get priced. NJ homeowners — what's your gut telling you?",
    options: [
      { id: "sell-now", label: "My home's worth more — selling soon", icon: "📈" },
      { id: "hold", label: "It's leveling off — holding for now", icon: "➡️" },
      { id: "dip-coming", label: "A dip is coming — I'll wait", icon: "📉" },
      { id: "no-idea", label: "Honestly, no idea anymore", icon: "🤷" },
    ],
  },

  // --- BUYERS ---
  {
    id: "buyers-june-2026",
    segment: "buyers",
    question: "Rates won't budge. Gas is eating your savings. Everybody says \"wait for the crash.\" What's your move? 🏠",
    options: [
      { id: "buy-now", label: "Buying now before it gets worse", icon: "🔑" },
      { id: "waiting", label: "Waiting — prices have to drop", icon: "⏳" },
      { id: "cant-afford", label: "Crunching numbers, can't make it work", icon: "🧮" },
      { id: "leaving-nj", label: "Giving up on NJ, looking elsewhere", icon: "🚪" },
    ],
  },

  // --- RENTERS ---
  {
    id: "renters-june-2026",
    segment: "renters",
    question: "Rent went up. Gas went up. Groceries went up. Buying still feels impossible. Where do you see this going? 😤",
    options: [
      { id: "rents-up", label: "Rents will keep rising — it never stops", icon: "📈" },
      { id: "level-off", label: "They'll level off eventually", icon: "➡️" },
      { id: "trying-buy", label: "I'm seriously trying to buy now", icon: "🔑" },
      { id: "leaving", label: "Planning to leave NJ altogether", icon: "🏃" },
    ],
  },

  // --- INVESTORS ---
  {
    id: "investors-june-2026",
    segment: "investors",
    question: "The dollar's shaky. Inflation's back. AI is rewriting valuations overnight. NJ rental property owners — what's your play? 💰",
    options: [
      { id: "buying-more", label: "Buying more — rents will keep climbing", icon: "🟢" },
      { id: "holding", label: "Holding steady — too much uncertainty", icon: "✋" },
      { id: "selling", label: "Selling some — locking in gains", icon: "🔴" },
      { id: "pivoting", label: "Shifting to other assets entirely", icon: "🔄" },
    ],
  },
];
