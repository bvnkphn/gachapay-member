"use client";

import { useState } from "react";
import {
  Ticket, MessageSquare, BookOpen, History,
  Search, Filter, ChevronDown, Send, Paperclip,
  Plus, Trash2, Edit3, X, Check, Clock,
  AlertCircle, CheckCircle2, XCircle, RefreshCw,
  FileImage, Link2, User, Calendar
} from "lucide-react";

// ── Types & Mock Data ─────────────────────────────────────────────
type TicketStatus = "new" | "inprogress" | "resolved" | "closed";

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  new:        { label: "ใหม่",              color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)",  icon: AlertCircle   },
  inprogress: { label: "กำลังดำเนินการ",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  icon: RefreshCw     },
  resolved:   { label: "แก้ไขแล้ว",        color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  icon: CheckCircle2  },
  closed:     { label: "ปิดเคส",           color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.25)", icon: XCircle       },
};

const mockTickets = [
  { id: "TK-0041", subject: "เติมเกม Genshin ไม่ได้รับ Crystal", status: "new"        as TicketStatus, user: "somchai_k",   email: "somchai@mail.com", time: "5 นาทีที่แล้ว",   orders: 12 },
  { id: "TK-0040", subject: "ชำระเงินสำเร็จแต่ยังไม่ได้รับไอเทม", status: "inprogress" as TicketStatus, user: "pailin_w",    email: "pailin@mail.com",  time: "22 นาทีที่แล้ว",  orders: 7  },
  { id: "TK-0039", subject: "สอบถามวิธีเติม PUBG UC",             status: "resolved"   as TicketStatus, user: "nat_gamer",   email: "nat@mail.com",     time: "1 ชั่วโมงที่แล้ว", orders: 3  },
  { id: "TK-0038", subject: "ต้องการคืนเงินเนื่องจาก ID ผิด",     status: "inprogress" as TicketStatus, user: "arisa_p",    email: "arisa@mail.com",   time: "2 ชั่วโมงที่แล้ว", orders: 19 },
  { id: "TK-0037", subject: "ระบบ QR Code ไม่แสดงผล",            status: "resolved"   as TicketStatus, user: "bank_play",   email: "bank@mail.com",    time: "3 ชั่วโมงที่แล้ว", orders: 5  },
  { id: "TK-0036", subject: "อยากเปลี่ยนเบอร์โทรที่ผูกไว้",       status: "closed"     as TicketStatus, user: "ming_dev",    email: "ming@mail.com",    time: "เมื่อวาน",          orders: 8  },
  { id: "TK-0035", subject: "Free Fire Diamond หายหลัง Server Down",status: "closed"   as TicketStatus, user: "fah_game",    email: "fah@mail.com",     time: "เมื่อวาน",          orders: 21 },
];

const mockMessages = [
  { from: "user",  name: "somchai_k",  text: "สวัสดีครับ ผมเติม Genshin Impact ไป 960 Crystal เมื่อกี้ แต่ยังไม่ได้รับเลยครับ รบกวนช่วยตรวจสอบด้วยครับ", time: "10:32", hasImage: false },
  { from: "user",  name: "somchai_k",  text: "แนบสลิปการโอนมาให้แล้วครับ", time: "10:33", hasImage: true  },
  { from: "admin", name: "Support",    text: "สวัสดีครับคุณ somchai รับทราบครับ กำลังตรวจสอบรายการของท่านอยู่นะครับ รบกวนแจ้ง Game UID มาให้ด้วยครับ", time: "10:35", hasImage: false },
  { from: "user",  name: "somchai_k",  text: "UID: 812345678 ครับ", time: "10:36", hasImage: false },
  { from: "admin", name: "Support",    text: "ขอบคุณครับ กำลังดำเนินการติดต่อทีม Game API เพื่อตรวจสอบ จะแจ้งผลให้ทราบภายใน 15 นาทีครับ", time: "10:38", hasImage: false },
];

const mockHistory = [
  { id: "TK-0029", subject: "สอบถามแพ็กเกจ VIP",             status: "closed"    as TicketStatus, time: "15 ก.พ. 68" },
  { id: "TK-0018", subject: "เติม ROV เหรียญไม่เข้า",         status: "resolved"  as TicketStatus, time: "2 ม.ค. 68"  },
  { id: "TK-0007", subject: "ลืมรหัสผ่าน",                   status: "closed"    as TicketStatus, time: "10 ธ.ค. 67" },
];

const mockFAQs = [
  { id: 1, q: "วิธีเติมเกมทำอย่างไร?",                    a: "เลือกเกมที่ต้องการ → เลือกแพ็กเกจ → กรอก Game UID → ชำระผ่าน QR Code PromptPay",              video: "https://youtube.com/watch?v=xxx" },
  { id: 2, q: "เติมแล้วไม่ได้รับไอเทมต้องทำอย่างไร?",      a: "รอ 5-15 นาที หากยังไม่ได้รับให้แจ้ง Ticket พร้อมแนบสลิปและ Game UID",                        video: "" },
  { id: 3, q: "คืนเงินได้หรือไม่?",                        a: "หากกรอก UID ผิด สามารถแจ้ง Ticket ภายใน 1 ชั่วโมง ทีมงานจะพิจารณาเป็นรายกรณี",              video: "" },
  { id: 4, q: "รองรับเกมอะไรบ้าง?",                        a: "Genshin Impact, PUBG Mobile, Free Fire, Valorant, ROV, Honkai Star Rail, Mobile Legends",   video: "" },
];

type Tab = "tickets" | "faq";
const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CONFIG[status];
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <Icon size={11} />
      {c.label}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SupportDashboard() {
  const [tab, setTab] = useState<Tab>("tickets");
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0]);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [searchQ, setSearchQ] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [faqs, setFaqs] = useState(mockFAQs);
  const [editFaq, setEditFaq] = useState<null | typeof mockFAQs[0]>(null);
  const [newFaq, setNewFaq] = useState(false);
  const [draftFaq, setDraftFaq] = useState({ q: "", a: "", video: "" });

  const filteredTickets = mockTickets.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (searchQ && !t.subject.toLowerCase().includes(searchQ.toLowerCase()) && !t.user.includes(searchQ)) return false;
    return true;
  });

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, { from: "admin", name: "Support", text: msgInput, time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), hasImage: false }]);
    setMsgInput("");
  };

  const deleteFaq = (id: number) => setFaqs(prev => prev.filter(f => f.id !== id));
  const saveFaq = () => {
    if (editFaq) {
      setFaqs(prev => prev.map(f => f.id === editFaq.id ? { ...editFaq } : f));
      setEditFaq(null);
    } else {
      setFaqs(prev => [...prev, { id: Date.now(), ...draftFaq }]);
      setDraftFaq({ q: "", a: "", video: "" });
      setNewFaq(false);
    }
  };

  const counts = {
    all: mockTickets.length,
    new: mockTickets.filter(t => t.status === "new").length,
    inprogress: mockTickets.filter(t => t.status === "inprogress").length,
    resolved: mockTickets.filter(t => t.status === "resolved").length,
    closed: mockTickets.filter(t => t.status === "closed").length,
  };

  return (
    <div className="min-h-screen relative pt-20 pb-24 px-4" style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)" }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(88,50,210,0.18) 0%, transparent 100%)" }} />

      <div className="relative max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <p className="text-[11px] text-[#3a4a6a] tracking-widest uppercase font-mono mb-1">Super Admin · Support Center</p>
          <h1 className="text-3xl font-bold text-white">
            จัดการ{" "}
            <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Support Tickets
            </span>
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {([["tickets", Ticket, "Ticket Management"], ["faq", BookOpen, "FAQ & คู่มือ"]] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key as Tab)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === key
                ? { background: "rgba(88,50,210,0.28)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.4)" }
                : { background: "rgba(11,15,32,0.6)", color: "#64748b", border: "1px solid #1c2540" }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── TICKETS TAB ── */}
        {tab === "tickets" && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

            {/* Left: Ticket List */}
            <div className="xl:col-span-2 space-y-3">

              {/* Search + filter */}
              <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="ค้นหา ticket หรือ user..."
                    className="w-full rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1c2540", color: "white" }} />
                </div>
                {/* Status filter pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(["all","new","inprogress","resolved","closed"] as const).map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={filterStatus === s
                        ? s === "all" ? { background: "rgba(99,102,241,0.25)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.4)" }
                          : { background: STATUS_CONFIG[s as TicketStatus].bg, color: STATUS_CONFIG[s as TicketStatus].color, border: `1px solid ${STATUS_CONFIG[s as TicketStatus].border}` }
                        : { color: "#64748b", border: "1px solid #1c2540" }}>
                      {s === "all" ? `ทั้งหมด (${counts.all})` : `${STATUS_CONFIG[s as TicketStatus].label} (${counts[s]})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket rows */}
              <div className="space-y-2">
                {filteredTickets.map(t => (
                  <button key={t.id} onClick={() => setSelectedTicket(t)} className="w-full text-left rounded-2xl p-4 transition-all"
                    style={selectedTicket.id === t.id
                      ? { background: "rgba(88,50,210,0.18)", border: "1px solid rgba(129,140,248,0.4)" }
                      : { ...cardStyle }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono" style={{ color: "#67e8f9" }}>{t.id}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug mb-1">{t.subject}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#94a3b8" }}>{t.user}</span>
                      <span className="text-xs" style={{ color: "#64748b" }}>{t.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Chat + History */}
            <div className="xl:col-span-3 space-y-4">

              {/* Ticket detail header */}
              <div className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono" style={{ color: "#67e8f9" }}>{selectedTicket.id}</span>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <p className="text-base font-bold text-white">{selectedTicket.subject}</p>
                  </div>
                  {/* Change status */}
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map(s => (
                      <button key={s} className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                        style={selectedTicket.status === s
                          ? { background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color, border: `1px solid ${STATUS_CONFIG[s].border}` }
                          : { color: "#64748b", border: "1px solid #1c2540", background: "transparent" }}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat interface */}
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1c2540" }}>
                  <MessageSquare size={14} style={{ color: "#818cf8" }} />
                  <span className="text-sm font-semibold text-white">การสนทนา</span>
                  <span className="text-xs ml-auto" style={{ color: "#64748b" }}>{selectedTicket.user} · {selectedTicket.email}</span>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 320 }}>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
                      <div style={{ maxWidth: "75%" }}>
                        <p className="text-[10px] mb-1 px-1" style={{ color: "#64748b" }}>
                          {m.name} · {m.time}
                        </p>
                        <div className="rounded-2xl px-4 py-2.5 text-sm"
                          style={m.from === "admin"
                            ? { background: "rgba(99,102,241,0.25)", color: "#e0e7ff", borderBottomRightRadius: 4 }
                            : { background: "rgba(255,255,255,0.06)", color: "#cbd5e1", borderBottomLeftRadius: 4 }}>
                          {m.hasImage ? (
                            <div className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                              <FileImage size={13} /><span>slip_payment.jpg</span>
                            </div>
                          ) : m.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3" style={{ borderTop: "1px solid #1c2540" }}>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1c2540" }}>
                      <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMsg()}
                        placeholder="พิมพ์ข้อความตอบกลับ..."
                        className="flex-1 bg-transparent outline-none text-white text-sm placeholder-[#3a4a6a]" />
                      <button className="text-[#64748b] hover:text-[#94a3b8] transition"><Paperclip size={15} /></button>
                    </div>
                    <button onClick={sendMsg}
                      className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "white" }}>
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Support History */}
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1c2540" }}>
                  <History size={14} style={{ color: "#f472b6" }} />
                  <span className="text-sm font-semibold text-white">ประวัติ Ticket ของ {selectedTicket.user}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.3)" }}>
                    {selectedTicket.orders} คำสั่งซื้อ
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {mockHistory.map(h => (
                    <div key={h.id} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #141c30" }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono" style={{ color: "#67e8f9" }}>{h.id}</span>
                        <span className="text-sm text-white">{h.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={h.status} />
                        <span className="text-xs" style={{ color: "#64748b" }}>{h.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── FAQ TAB ── */}
        {tab === "faq" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "#94a3b8" }}>{faqs.length} รายการ</p>
              <button onClick={() => { setNewFaq(true); setEditFaq(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.28)", color: "#38bdf8" }}>
                <Plus size={15} /> เพิ่มคำถามใหม่
              </button>
            </div>

            {/* New FAQ form */}
            {newFaq && (
              <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(88,50,210,0.12)", border: "1px solid rgba(129,140,248,0.3)" }}>
                <p className="text-sm font-bold text-white">เพิ่มคำถามใหม่</p>
                <input value={draftFaq.q} onChange={e => setDraftFaq(p => ({ ...p, q: e.target.value }))}
                  placeholder="คำถาม..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
                <textarea value={draftFaq.a} onChange={e => setDraftFaq(p => ({ ...p, a: e.target.value }))}
                  placeholder="คำตอบ..." rows={3}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
                <div className="relative">
                  <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
                  <input value={draftFaq.video} onChange={e => setDraftFaq(p => ({ ...p, video: e.target.value }))}
                    placeholder="YouTube link (optional)..."
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveFaq}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                    <Check size={14} /> บันทึก
                  </button>
                  <button onClick={() => setNewFaq(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ color: "#94a3b8", border: "1px solid #1c2540" }}>
                    <X size={14} /> ยกเลิก
                  </button>
                </div>
              </div>
            )}

            {/* FAQ list */}
            {faqs.map((faq, idx) => (
              <div key={faq.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                {editFaq?.id === faq.id ? (
                  <div className="p-5 space-y-3">
                    <input value={editFaq.q} onChange={e => setEditFaq(p => p ? { ...p, q: e.target.value } : p)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none font-semibold"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
                    <textarea value={editFaq.a} onChange={e => setEditFaq(p => p ? { ...p, a: e.target.value } : p)}
                      rows={3} className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
                    <div className="relative">
                      <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
                      <input value={editFaq.video} onChange={e => setEditFaq(p => p ? { ...p, video: e.target.value } : p)}
                        className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveFaq}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                        <Check size={14} /> บันทึก
                      </button>
                      <button onClick={() => setEditFaq(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ color: "#94a3b8", border: "1px solid #1c2540" }}>
                        <X size={14} /> ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <span className="text-xs font-mono mt-0.5 shrink-0" style={{ color: "#818cf8" }}>Q{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white mb-1.5">{faq.q}</p>
                          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{faq.a}</p>
                          {faq.video && (
                            <a href={faq.video} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs"
                              style={{ color: "#38bdf8" }}>
                              <Link2 size={11} /> ดูวิดีโอประกอบ
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setEditFaq(faq)}
                          className="p-2 rounded-lg transition hover:bg-white/10"
                          style={{ color: "#94a3b8" }}><Edit3 size={14} /></button>
                        <button onClick={() => deleteFaq(faq.id)}
                          className="p-2 rounded-lg transition hover:bg-red-500/10"
                          style={{ color: "#f87171" }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
