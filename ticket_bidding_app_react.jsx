import { useMemo, useState } from "react";
import {
  Ticket as TicketIcon,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Flame,
  Gavel,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const events = [
  {
    id: 1,
    name: "2026 AI Summit",
    subtitle: "The Future of Intelligence",
    venue: "Moscone Center, San Francisco",
    date: "Mar 14, 2026",
    time: "9:00 AM",
    image: "🤖",
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    accentColor: "#6366f1",
    tickets: [
      { id: "t1", section: "Keynote Floor", row: "A", seat: "12", highBid: 480, minBid: 200, dealScore: 82 },
      { id: "t2", section: "VIP Lounge", row: "VIP", seat: "—", highBid: 1200, minBid: 800, dealScore: 41 },
      { id: "t3", section: "General Admission", row: "—", seat: "—", highBid: 95, minBid: 40, dealScore: 91 },
    ],
  },
  {
    id: 2,
    name: "The Vibe Tour",
    subtitle: "An Immersive Sound Experience",
    venue: "Madison Square Garden, New York",
    date: "Apr 22, 2026",
    time: "8:00 PM",
    image: "🎵",
    gradient: "from-rose-900 via-pink-900 to-slate-900",
    accentColor: "#f43f5e",
    tickets: [
      { id: "t4", section: "Pit", row: "—", seat: "—", highBid: 650, minBid: 300, dealScore: 68 },
      { id: "t5", section: "Floor Right", row: "C", seat: "7", highBid: 340, minBid: 150, dealScore: 77 },
      { id: "t6", section: "Section 101", row: "12", seat: "22", highBid: 180, minBid: 80, dealScore: 88 },
    ],
  },
  {
    id: 3,
    name: "Neon Horizons Festival",
    subtitle: "3 Days. 40 Artists. One Stage.",
    venue: "Coachella Valley, California",
    date: "May 8–10, 2026",
    time: "12:00 PM",
    image: "🌅",
    gradient: "from-amber-900 via-orange-900 to-slate-900",
    accentColor: "#f59e0b",
    tickets: [
      { id: "t7", section: "Weekend Pass", row: "—", seat: "—", highBid: 890, minBid: 400, dealScore: 55 },
      { id: "t8", section: "VIP Weekend", row: "—", seat: "—", highBid: 2400, minBid: 1500, dealScore: 28 },
      { id: "t9", section: "Single Day", row: "—", seat: "—", highBid: 220, minBid: 100, dealScore: 93 },
    ],
  },
  {
    id: 4,
    name: "CodeConf 2026",
    subtitle: "Ship. Scale. Disrupt.",
    venue: "The Venetian, Las Vegas",
    date: "Jun 3, 2026",
    time: "10:00 AM",
    image: "💻",
    gradient: "from-emerald-900 via-teal-900 to-slate-900",
    accentColor: "#10b981",
    tickets: [
      { id: "t10", section: "Speaker Hall", row: "B", seat: "4", highBid: 320, minBid: 140, dealScore: 74 },
      { id: "t11", section: "Workshop Pass", row: "—", seat: "—", highBid: 560, minBid: 250, dealScore: 61 },
      { id: "t12", section: "All-Access", row: "—", seat: "—", highBid: 1100, minBid: 600, dealScore: 36 },
    ],
  },
];

function getDealColor(score) {
  if (score >= 80) return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40", label: "Hot Deal" };
  if (score >= 60) return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40", label: "Fair Deal" };
  return { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/40", label: "Pricey" };
}

// ── Bid classification ───────────────────────────────────────────────────────

function classifyBid(bidAmount, currentHighBid, minBid) {
  if (bidAmount < minBid) return "toolow";
  if (bidAmount <= currentHighBid) return "tooslow";
  const margin = (bidAmount - currentHighBid) / currentHighBid;
  if (margin > 0.30) return "crushing";
  if (margin < 0.05) return "barelywin";
  return "winning";
}

// ── Rico Commentary Engine ─────────────────────────────────────────────────
// Best practice: never call Anthropic directly from the browser.
// This canvas defaults to a high quality local mock so Rico works without keys.
// If you later add a backend, switch mode to "api" and implement POST /api/rico.

const RICO_MODE = "mock"; // "mock" | "api"

function ricoLocalMock({ bidAmount, highBid, minBid, section, eventName, dealScore, bidStatus }) {
  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  const dealLine =
    dealScore >= 80
      ? `Deal score ${dealScore} is spicy. This is value.`
      : dealScore >= 60
        ? `Deal score ${dealScore} is fine. Not a steal, not a robbery.`
        : `Deal score ${dealScore} is rough. You're paying for vibes.`;

  const base = {
    toolow: `You tried ${fmt(bidAmount)} on a ${fmt(minBid)} minimum. That's not a bid, that's a suggestion.`,
    tooslow: `Current high is ${fmt(highBid)} and you tossed in ${fmt(bidAmount)}. Rico respects optimism, not math errors.`,
    barelywin: `You slid in at ${fmt(bidAmount)} over ${fmt(highBid)}. Technically winning. Spiritually trembling.`,
    winning: `Nice. ${fmt(bidAmount)} clears ${fmt(highBid)} and puts you in the lead in ${section}.`,
    crushing: `Absolute power move. ${fmt(bidAmount)} over ${fmt(highBid)} is you saying "end the conversation".`,
  };

  const extra =
    bidStatus === "crushing"
      ? "Just remember: overpaying is a lifestyle choice."
      : bidStatus === "toolow" || bidStatus === "tooslow"
        ? "Try again with a number that lives on Earth."
        : "Hold your nerve. Markets get weird.";

  return `${base[bidStatus] || `Bid registered at ${fmt(bidAmount)}.`} ${dealLine} ${eventName ? `Event is ${eventName}.` : ""} ${extra}`
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchRicoCommentary(payload) {
  if (RICO_MODE === "api") {
    const res = await fetch("/api/rico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Rico API error");
    const data = await res.json();
    if (typeof data?.text === "string") return data.text.trim();
    throw new Error("Rico API invalid response");
  }

  await new Promise((r) => setTimeout(r, 450));
  return ricoLocalMock(payload);
}

// ── Components ───────────────────────────────────────────────────────────────

function DealBadge({ score }) {
  const c = getDealColor(score);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400"} animate-pulse`}
      />
      {score} · {c.label}
    </span>
  );
}

function RicoThinkingDots() {
  return (
    <span className="flex items-center gap-1 mt-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

function RicoBubble({ text, isLoading, bidStatus }) {
  const isNeg = ["toolow", "tooslow"].includes(bidStatus);
  const isCrush = bidStatus === "crushing";

  const accent = isNeg
    ? {
        border: "border-rose-500/25",
        bg: "rgba(244,63,94,0.06)",
        glow: "rgba(244,63,94,0.15)",
        Icon: AlertTriangle,
        nameColor: "text-rose-400",
      }
    : isCrush
      ? {
          border: "border-amber-400/30",
          bg: "rgba(245,158,11,0.07)",
          glow: "rgba(245,158,11,0.2)",
          Icon: Flame,
          nameColor: "text-amber-400",
        }
      : {
          border: "border-indigo-400/25",
          bg: "rgba(99,102,241,0.07)",
          glow: "rgba(99,102,241,0.15)",
          Icon: Sparkles,
          nameColor: "text-indigo-400",
        };

  return (
    <div
      className={`mt-4 rounded-2xl border ${accent.border} p-4`}
      style={{ background: accent.bg, backdropFilter: "blur(12px)", animation: "fadeInUp 0.35s ease forwards" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-lg"
          style={{ background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)` }}
        >
          <accent.Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${accent.nameColor}`}>Rico · BidTicket Analyst</p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs italic">Thinking</span>
              <RicoThinkingDots />
            </div>
          ) : (
            <p className="text-white/80 text-sm leading-relaxed">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessFlash({ show }) {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none z-10"
      style={{ background: "rgba(16,185,129,0.08)", animation: "successFlash 0.7s ease forwards" }}
    />
  );
}

function TicketRow({ ticket, eventName, currentHighBid, isWinning, onUpdateHighBid, onLogBid }) {
  const [bidValue, setBidValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [showFlash, setShowFlash] = useState(false);

  const [ricoVisible, setRicoVisible] = useState(false);
  const [ricoLoading, setRicoLoading] = useState(false);
  const [ricoText, setRicoText] = useState("");
  const [ricoBidStatus, setRicoBidStatus] = useState("winning");

  const callRico = async (amount, status, highBidAtTime) => {
    setRicoVisible(true);
    setRicoLoading(true);
    setRicoText("");
    setRicoBidStatus(status);
    try {
      const text = await fetchRicoCommentary({
        bidAmount: amount,
        highBid: highBidAtTime,
        minBid: ticket.minBid,
        section: ticket.section,
        eventName,
        dealScore: ticket.dealScore,
        bidStatus: status,
      });
      setRicoText(text);
    } catch {
      setRicoText("Even I'm speechless right now. (API hiccup — try again.)");
    } finally {
      setRicoLoading(false);
    }
  };

  const handleBid = () => {
    const val = parseFloat(bidValue);
    if (!bidValue || Number.isNaN(val) || val <= 0) {
      setInputError("Enter a valid amount");
      return;
    }

    const status = classifyBid(val, currentHighBid, ticket.minBid);

    onLogBid?.({
      ticketId: ticket.id,
      section: ticket.section,
      amount: val,
      status,
      at: new Date().toISOString(),
    });

    // Always call Rico — even on failed bids
    void callRico(val, status, currentHighBid);

    if (status === "toolow") {
      setInputError(`Minimum bid is $${ticket.minBid}`);
      return;
    }
    if (status === "tooslow") {
      setInputError(`Must exceed current high of $${currentHighBid}`);
      return;
    }

    // Valid — update state
    setInputError("");
    onUpdateHighBid(val);
    setBidValue("");
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 800);
  };

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 overflow-hidden">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(ellipse at top left, rgba(255,255,255,0.03) 0%, transparent 60%)" }}
      />
      <SuccessFlash show={showFlash} />

      <div className="relative p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm tracking-tight">{ticket.section}</p>
            <p className="text-white/40 text-xs mt-0.5">
              {ticket.row !== "—" && ticket.seat !== "—" ? `Row ${ticket.row} · Seat ${ticket.seat}` : "Open Access"}
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <DealBadge score={ticket.dealScore} />
              {isWinning && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Leading
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <div className="text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">High Bid</p>
              <p className="text-white font-bold text-xl mt-1 tabular-nums">${currentHighBid.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Min Bid</p>
              <p className="text-white/60 font-semibold text-sm mt-1">${ticket.minBid}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-52">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">$</span>
              <input
                type="number"
                value={bidValue}
                onChange={(e) => {
                  setBidValue(e.target.value);
                  setInputError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleBid()}
                placeholder={`${currentHighBid + 10}+`}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl pl-7 pr-4 py-2.5 text-white placeholder-white/25 text-sm outline-none transition-all focus:bg-white/[0.08]"
              />
            </div>
            {inputError && <p className="text-rose-400 text-[11px] px-1">{inputError}</p>}
            <button
              onClick={handleBid}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)")}
            >
              Place Bid →
            </button>
          </div>
        </div>

        {ricoVisible && <RicoBubble text={ricoText} isLoading={ricoLoading} bidStatus={ricoBidStatus} />}
      </div>
    </div>
  );
}

function EventCard({ event, onClick }) {
  const maxDeal = Math.max(...event.tickets.map((t) => t.dealScore));
  const lowestBid = Math.min(...event.tickets.map((t) => t.highBid));
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} opacity-90`} />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)" }}
      />
      <div className="relative p-6 flex flex-col gap-4" style={{ minHeight: 220 }}>
        <div className="flex justify-between items-start">
          <div className="text-4xl leading-none">{event.image}</div>
          <DealBadge score={maxDeal} />
        </div>
        <div className="flex-1">
          <h3
            className="text-white font-black text-xl tracking-tight leading-tight"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            {event.name}
          </h3>
          <p className="text-white/60 text-xs mt-1 font-medium">{event.subtitle}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {event.venue.split(",")[0]}
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {event.date} · {event.time}
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Bids from</p>
            <p className="text-white font-black text-xl">${lowestBid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BidHistoryPanel({ selectedEvent, bidLog }) {
  const items = useMemo(() => {
    return bidLog.filter((b) => b.eventId === selectedEvent.id).slice(0, 8);
  }, [bidLog, selectedEvent.id]);

  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-white/70" />
          <p className="text-white font-bold text-sm">Bid History</p>
        </div>
        <p className="text-white/35 text-xs">Latest bids for this event</p>
      </div>
      <div className="border-t border-white/10" />
      <div className="p-5">
        {items.length === 0 ? (
          <div className="text-white/40 text-sm">No bids yet. Rico is bored.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((b) => {
              const ok = !["toolow", "tooslow"].includes(b.status);
              const Icon = ok ? CheckCircle2 : XCircle;
              const tone = ok ? "text-emerald-300" : "text-rose-300";
              const badge =
                b.status === "crushing"
                  ? "Crushing"
                  : b.status === "barelywin"
                    ? "Barely"
                    : b.status === "winning"
                      ? "Winning"
                      : b.status === "tooslow"
                        ? "Too low"
                        : "Below min";

              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${tone}`} />
                      <p className="text-white/85 text-sm font-semibold truncate">
                        {b.section} · ${Number(b.amount).toLocaleString()} · {badge}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-white/35 text-xs">
                      <Clock className="w-3 h-3" />
                      {new Date(b.at).toLocaleString()}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest ${tone}`}>
                    {ok ? "Valid" : "Rejected"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function BidTicket() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Music", "Tech", "Festival"];

  const initialBidBook = useMemo(() => {
    const book = {};
    for (const e of events) {
      for (const t of e.tickets) {
        book[t.id] = { highBid: t.highBid, isWinning: false };
      }
    }
    return book;
  }, []);

  const [bidBook, setBidBook] = useState(() => initialBidBook);
  const [bidLog, setBidLog] = useState([]);

  const filteredEvents = useMemo(() => {
    if (filter === "All") return events;
    const map = {
      Tech: [1, 4],
      Music: [2],
      Festival: [3],
    };
    const ids = new Set(map[filter] || []);
    return events.filter((e) => ids.has(e.id));
  }, [filter]);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 40%, #0a0a14 100%)",
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes successFlash { 0% { opacity: 1; } 100% { opacity: 0; } }
        .card-enter { animation: fadeInUp 0.4s ease forwards; }
        .stagger-1 { animation-delay: 0.05s; opacity: 0; }
        .stagger-2 { animation-delay: 0.10s; opacity: 0; }
        .stagger-3 { animation-delay: 0.15s; opacity: 0; }
        .stagger-4 { animation-delay: 0.20s; opacity: 0; }
      `}</style>

      <div
        className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        <header className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(99,102,241,0.1))",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <TicketIcon className="w-5 h-5 text-indigo-200" />
              </div>
              <span className="text-xl font-black tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                BidTicket
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10">
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span className="text-indigo-300 text-xs font-semibold">Rico is watching your bids</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/40 text-xs font-medium">Live Market</span>
              </div>
            </div>
          </div>

          {!selectedEvent && (
            <div className="mt-12 max-w-2xl">
              <p className="text-white/30 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Premium Ticket Exchange</p>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Bid Smart.
                <br />
                <span
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundImage: "linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%)",
                  }}
                >
                  Win Big.
                </span>
              </h1>
              <p className="text-white/40 mt-4 text-base leading-relaxed max-w-lg">
                Real-time bidding on the hottest events — with Rico, your AI analyst, calling every bid exactly as he sees it.
              </p>
            </div>
          )}
        </header>

        {selectedEvent ? (
          <div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              All Events
            </button>

            <div
              className={`relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br ${selectedEvent.gradient}`}
              style={{ padding: "40px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="relative">
                <div className="text-6xl mb-4">{selectedEvent.image}</div>
                <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {selectedEvent.name}
                </h2>
                <p className="text-white/60 mt-1">{selectedEvent.subtitle}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/50">
                  <span>📍 {selectedEvent.venue}</span>
                  <span>📅 {selectedEvent.date} · {selectedEvent.time}</span>
                </div>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border border-indigo-400/15" style={{ background: "rgba(99,102,241,0.06)" }}>
              <span className="text-2xl">😎</span>
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Rico · BidTicket Analyst</p>
                <p className="text-white/50 text-xs mt-0.5">Place any bid — good or bad — and I'll give you my unfiltered take.</p>
              </div>
            </div>

            <BidHistoryPanel selectedEvent={selectedEvent} bidLog={bidLog} />

            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Available Tickets</h3>
                <span className="text-white/30 text-sm">{selectedEvent.tickets.length} listings</span>
              </div>
              <div className="flex flex-col gap-3">
                {selectedEvent.tickets.map((ticket, i) => (
                  <div key={ticket.id} className={`card-enter stagger-${i + 1}`}>
                    <TicketRow
                      ticket={ticket}
                      eventName={selectedEvent.name}
                      currentHighBid={bidBook[ticket.id]?.highBid ?? ticket.highBid}
                      isWinning={!!bidBook[ticket.id]?.isWinning}
                      onUpdateHighBid={(val) => {
                        setBidBook((prev) => ({
                          ...prev,
                          [ticket.id]: { highBid: val, isWinning: true },
                        }));
                      }}
                      onLogBid={(entry) => {
                        setBidLog((prev) => [
                          {
                            id: `${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`,
                            eventId: selectedEvent.id,
                            eventName: selectedEvent.name,
                            ...entry,
                          },
                          ...prev,
                        ]);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: "Live Events", value: "4", icon: "🔴" },
                { label: "Active Bids", value: "1,284", icon: "⚡" },
                { label: "Avg Deal Score", value: "66/100", icon: "📊" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                  <p className="text-white/30 text-xs font-medium uppercase tracking-widest">
                    {stat.icon} {stat.label}
                  </p>
                  <p className="text-white font-black text-2xl mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Upcoming Events</h2>
              <div className="flex gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === cat ? "bg-white/15 text-white" : "text-white/35 hover:text-white/60"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredEvents.map((event, i) => (
                <div key={event.id} className={`card-enter stagger-${Math.min(i + 1, 4)}`}> 
                  <EventCard event={event} onClick={() => setSelectedEvent(event)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
