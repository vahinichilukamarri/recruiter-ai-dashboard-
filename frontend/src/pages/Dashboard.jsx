import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Search, TrendingUp, TrendingDown,
  Users, ClipboardList, Star, CheckCircle2,
} from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED, useSidebarWidth, MOBILE_BREAKPOINT } from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import { api, initials, mapByCandidateId, normalizeRecommendation } from "../services/api";

/* ─── GLOBAL STYLES ─── */
function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-centific", "dashboard");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { height: 100%; }
      body {
        height: 100%;
        font-family: ${FONT};
        background: ${T.bg};
        color: ${T.navy0};
        overflow: hidden;
      }
      #root { height: 100%; display: flex; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: ${T.navy8}; }
      ::-webkit-scrollbar-thumb { background: ${T.navy6}; border-radius: 10px; }
      .card-lift { transition: transform .18s ease, box-shadow .18s ease; }
      .card-lift:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(89,41,208,.14) !important; }
      .btn-review {
        display: inline-flex; align-items: center; gap: 5px;
        background: ${T.primary}; color: #fff; border: none; border-radius: 8px;
        padding: 6px 14px; font-size: 12px; font-weight: 600;
        font-family: ${FONT}; cursor: pointer;
        transition: background .15s, transform .12s;
      }
      .btn-review:hover { background: #4318b0; transform: translateY(-1px); }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp .45s ease forwards; }

      /* Responsive padding for the page body */
      @media (max-width: 700px) {
        .dash-header { padding: 12px 16px 12px 60px !important; }
        .dash-main { padding: 22px 16px 32px !important; }
        .dash-footer { padding: 12px 16px !important; }
        .dash-title { font-size: 22px !important; }
      }
    `;
    document.head.appendChild(el);
    return () => { if (document.head.contains(el)) document.head.removeChild(el); };
  }, []);
  return null;
}

/* ─── ANIMATED COUNTER ─── */
function useCounter(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start = null;
    const isFloat = !Number.isInteger(target);
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(isFloat ? +(eased * target).toFixed(1) : Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ─── STAT CARD ─── */
function StatCard({ title, value, trend, trendUp, icon: Icon, accent, accentLight, delay = 0 }) {
  const num = useCounter(typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value);
  const display = Number.isInteger(value) ? num.toLocaleString() : num.toFixed(1);

  return (
    <div className="card-lift fade-up" style={{
      animationDelay: `${delay}ms`,
      background: T.white, borderRadius: 18, border: `1px solid ${T.navy7}`,
      padding: "22px 24px", flex: "1 1 200px", minWidth: 190,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: 3,
        background: `linear-gradient(90deg,${accent},${accent}88)`,
        borderRadius: "18px 18px 0 0",
      }} />
      <div style={{
        position: "absolute", top: 18, right: 18, width: 40, height: 40,
        borderRadius: 12, background: accentLight,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={accent} />
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.navy4, marginBottom: 10, letterSpacing: ".03em", textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: T.navy0, lineHeight: 1, marginBottom: 10 }}>
        {display}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {trendUp ? <TrendingUp size={13} color={T.success} /> : <TrendingDown size={13} color={T.error} />}
        <span style={{ fontSize: 12, fontWeight: 700, color: trendUp ? T.success : T.error }}>{trend}</span>
        <span style={{ fontSize: 11, color: T.navy5 }}>vs last month</span>
      </div>
    </div>
  );
}

/* ─── HIRING FUNNEL ─── */
function FunnelChart() {
  const [funnel, setFunnel] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    api.getHiringFunnel().then(items => {
      if (!alive) return;
      setFunnel(items.map(item => ({ label: item.stage, value: item.count })));
      setTimeout(() => { if (alive) setReady(true); }, 100);
    }).catch(() => {
      if (!alive) return;
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  const max = funnel[0]?.value || 1;

  return (
    <div style={{
      background: T.white, borderRadius: 18, border: `1px solid ${T.navy7}`,
      padding: "24px 26px", flex: "1 1 280px", minWidth: 260,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.navy0 }}>Hiring Funnel</div>
        {funnel.length === 0 && <span style={{ fontSize: 11, color: T.navy5 }}>Loading…</span>}
      </div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 20 }}>Pipeline conversion overview</div>
      {funnel.length === 0 ? (
        [1,2,3,4,5].map(i => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ height: 14, background: T.navy8, borderRadius: 6, marginBottom: 5, width: `${85 - i * 10}%` }} />
            <div style={{ height: 10, background: T.navy8, borderRadius: 999 }} />
          </div>
        ))
      ) : funnel.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isH = hovered === i;
        return (
          <div key={d.label} style={{ marginBottom: 14 }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: isH ? T.primary : T.navy2, transition: "color .15s" }}>{d.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.primary }}>{d.value.toLocaleString()}</span>
            </div>
            <div style={{ height: 10, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: isH ? "linear-gradient(90deg,#7c3aed,#5929D0)" : "linear-gradient(90deg,#a78bfa,#5929D0)",
                width: ready ? `${pct}%` : "0%",
                transition: `width .9s cubic-bezier(.4,0,.2,1) ${i * 70}ms, background .18s`,
              }} />
            </div>
            {isH && <div style={{ fontSize: 11, color: T.navy4, marginTop: 3, textAlign: "right" }}>{pct.toFixed(1)}% of applicants</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── LINE CHART ─── */
const LINE_DATA = [48, 72, 55, 90, 63, 105];
const WEEKS = ["Wk 1","Wk 2","Wk 3","Wk 4","Wk 5","Wk 6"];

function LineChart() {
  const [tooltip, setTooltip] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 450); return () => clearTimeout(t); }, []);

  const VW = 420, VH = 175, pL = 34, pB = 26, pT = 14, pR = 14;
  const MIN = 0, MAX = 120;
  const pts = LINE_DATA.map((v, i) => ({
    x: pL + i * ((VW - pL - pR) / (LINE_DATA.length - 1)),
    y: pT + (VH - pB - pT) - ((v - MIN) / (MAX - MIN)) * (VH - pB - pT),
    v,
  }));

  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, "");
  const fillPath = `${linePath} L ${pts[pts.length-1].x} ${VH - pB} L ${pts[0].x} ${VH - pB} Z`;

  return (
    <div style={{
      background: T.white, borderRadius: 18, border: `1px solid ${T.navy7}`,
      padding: "24px 26px", flex: "1 1 320px", minWidth: 300,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: T.navy0, marginBottom: 3 }}>Weekly Interview Volume</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 18 }}>Scheduled interviews by week</div>
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.cyan} stopOpacity=".18" />
            <stop offset="100%" stopColor={T.cyan} stopOpacity="0" />
          </linearGradient>
          <clipPath id="lineReveal">
            <rect x={pL} y={0} height={VH}
              style={{ width: ready ? VW - pL - pR + 2 : 0, transition: "width 1.3s cubic-bezier(.4,0,.2,1) .2s" }} />
          </clipPath>
        </defs>
        {[0, 30, 60, 90, 120].map(v => {
          const y = pT + (VH - pB - pT) - ((v - MIN) / (MAX - MIN)) * (VH - pB - pT);
          return (
            <g key={v}>
              <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke={T.navy7} strokeWidth="1" />
              <text x={pL - 6} y={y + 4} fontSize="10" fill={T.navy5} textAnchor="end">{v}</text>
            </g>
          );
        })}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={VH} fontSize="10" fill={T.navy5} textAnchor="middle">{WEEKS[i]}</text>
        ))}
        <path d={fillPath} fill="url(#cyanFill)" clipPath="url(#lineReveal)" />
        <path d={linePath} fill="none" stroke={T.cyan} strokeWidth="2.5" strokeLinecap="round" clipPath="url(#lineReveal)" />
        {pts.map((p, i) => (
          <g key={i} style={{ cursor: "pointer" }}
            onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
            <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={tooltip === i ? 6 : 4.5}
              fill={T.white} stroke={T.cyan} strokeWidth="2.5"
              style={{ transition: "r .15s" }} />
            {tooltip === i && (
              <g>
                <rect x={p.x - 26} y={p.y - 34} width="52" height="22" rx="7" fill={T.navy1} />
                <text x={p.x} y={p.y - 18} fontSize="11.5" fill="#fff" textAnchor="middle" fontWeight="700">{p.v} intv.</text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── DONUT CHART ─── */
const PIE_DATA = [
  { label: "Engineering", pct: 35, color: T.primary },
  { label: "Product",     pct: 22, color: T.pink    },
  { label: "Design",      pct: 14, color: T.cyan    },
  { label: "Sales",       pct: 17, color: "#F59E0B" },
  { label: "Marketing",   pct: 12, color: "#10B981" },
];

function PieChart() {
  const [hovered, setHovered] = useState(null);
  const R = 68, cx = 88, cy = 88, SW = 26;
  const circ = 2 * Math.PI * R;
  let cum = 0;
  const slices = PIE_DATA.map((d) => {
    const offset = circ * (1 - cum / 100);
    const dash = (d.pct / 100) * circ;
    const gap  = circ - dash;
    cum += d.pct;
    return { ...d, offset, dash, gap };
  });

  return (
    <div style={{
      background: T.white, borderRadius: 18, border: `1px solid ${T.navy7}`,
      padding: "24px 26px", flex: "1 1 260px", minWidth: 240,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: T.navy0, marginBottom: 3 }}>Department Hiring Status</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 18 }}>Open roles by department</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <svg width="176" height="176" viewBox="0 0 176 176" style={{ flexShrink: 0 }}>
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color}
              strokeWidth={hovered === i ? SW + 6 : SW}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              style={{ transformOrigin: `${cx}px ${cy}px`, transform: "rotate(-90deg)", transition: "stroke-width .2s ease", cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          ))}
          {hovered !== null ? (
            <>
              <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill={PIE_DATA[hovered].color}>{PIE_DATA[hovered].pct}%</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={T.navy4}>{PIE_DATA[hovered].label}</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={T.navy0}>Depts</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={T.navy5}>5 active</text>
            </>
          )}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {PIE_DATA.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div style={{ width: 11, height: 11, borderRadius: 3, background: d.color, flexShrink: 0, transform: hovered === i ? "scale(1.35)" : "scale(1)", transition: "transform .15s" }} />
              <span style={{ fontSize: 12.5, fontWeight: hovered === i ? 700 : 500, color: hovered === i ? T.navy0 : T.navy3, transition: "all .15s" }}>{d.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: d.color, marginLeft: "auto", paddingLeft: 8 }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CANDIDATE TABLE ─── */
const CANDIDATES = [
  { name: "Priya Sharma",    role: "ML Engineer",       score: 91, rec: "Proceed",  status: "Active",    ini: "PS", color: "#5929D0" },
  { name: "Marcus Lee",      role: "Product Manager",   score: 78, rec: "On Hold",  status: "Review",    ini: "ML", color: "#CF008B" },
  { name: "Anjali Reddy",    role: "UX Designer",       score: 87, rec: "Proceed",  status: "Completed", ini: "AR", color: "#22D3EE" },
  { name: "David Okafor",    role: "Sales Lead",        score: 62, rec: "Reject",   status: "Completed", ini: "DO", color: "#F59E0B" },
  { name: "Sofia Hernandez", role: "Frontend Engineer", score: 94, rec: "Proceed",  status: "Active",    ini: "SH", color: "#10B981" },
  { name: "James Whitfield", role: "Data Analyst",      score: 70, rec: "On Hold",  status: "Review",    ini: "JW", color: "#6366F1" },
];

const REC_PILL = {
  Proceed:  { bg: "#DCFCE7", color: "#16A34A" },
  "On Hold":{ bg: "#FEF3C7", color: "#D97706" },
  Reject:   { bg: "#FEE2E2", color: "#DC2626" },
};
const STATUS_PILL = {
  Active:    { bg: "#E8E5FF", color: "#5929D0" },
  Completed: { bg: "#DCFCE7", color: "#16A34A" },
  Review:    { bg: "#FEF3C7", color: "#D97706" },
};

function ScoreBar({ score }) {
  const color = score >= 85 ? T.success : score >= 70 ? T.warning : T.error;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 52, height: 6, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, borderRadius: 999, background: color }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.navy0 }}>{score}</span>
    </div>
  );
}

function CandidateTable({ candidates = CANDIDATES }) {
  const [hRow, setHRow] = useState(null);
  const navigate = useNavigate();
  const COLS = ["Name", "Role", "Score", "Recommendation", "Status"];
  return (
    <div style={{ background: T.white, borderRadius: 18, border: `1px solid ${T.navy7}`, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
      <div style={{ padding: "20px 26px 16px", borderBottom: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.navy0 }}>Recent Candidates</div>
          <div style={{ fontSize: 12, color: T.navy4, marginTop: 2 }}>Latest evaluation results</div>
        </div>
        <button
          onClick={() => navigate("/candidates")}
          style={{ fontSize: 12.5, fontWeight: 600, color: T.primary, cursor: "pointer", background: "transparent", border: "none", fontFamily: FONT }}
        >
          View All →
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ background: T.navy8 }}>
              {COLS.map(c => (
                <th key={c} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr key={i}
                style={{ borderBottom: `1px solid ${T.navy7}`, background: hRow === i ? T.navy8 : T.white, transition: "background .12s" }}
                onMouseEnter={() => setHRow(i)} onMouseLeave={() => setHRow(null)}>
                <td style={{ padding: "13px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 35, height: 35, borderRadius: 10, background: c.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{c.ini}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.navy0 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 20px", fontSize: 13, color: T.navy3 }}>{c.role}</td>
                <td style={{ padding: "13px 20px" }}><ScoreBar score={c.score} /></td>
                <td style={{ padding: "13px 20px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 13px", borderRadius: 999, ...(REC_PILL[c.rec] || REC_PILL["On Hold"]) }}>{c.rec}</span>
                </td>
                <td style={{ padding: "13px 20px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 13px", borderRadius: 999, ...(STATUS_PILL[c.status] || STATUS_PILL.Review) }}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════ */
export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [summary, setSummary] = useState({
    total_candidates: 1284,
    interviews_completed: 342,
    avg_mcq_score: 84.5,
    total_selected: 89,
  });
  const [topCandidates, setTopCandidates] = useState(CANDIDATES);
  // Responsive sidebar width: returns 0 on mobile (sidebar becomes drawer)
  const SW = useSidebarWidth(collapsed);

  useEffect(() => {
    let alive = true;
    async function loadDashboard() {
      try {
        const [summaryData, candidateRows, assessmentRows, interviewRows, agentRows] = await Promise.all([
          api.getDashboardSummary(),
          api.getCandidates(),
          api.getAssessments(),
          api.getInterviews(),
          api.getAgentOutputs(),
        ]);
        if (!alive) return;

        const assessments = mapByCandidateId(assessmentRows);
        const agents = mapByCandidateId(agentRows);
        const latestInterview = interviewRows.reduce((acc, interview) => {
          const current = acc[interview.candidate_id];
          if (!current || new Date(interview.created_at) > new Date(current.created_at)) {
            acc[interview.candidate_id] = interview;
          }
          return acc;
        }, {});

        const colors = ["#5929D0", "#CF008B", "#22D3EE", "#F59E0B", "#10B981", "#6366F1"];
        const mappedCandidates = candidateRows.slice(0, 8).map((candidate, index) => {
          const interview = latestInterview[candidate.id];
          const assessment = assessments[candidate.id];
          const agent = agents[candidate.id];
          return {
            name: candidate.full_name,
            role: candidate.role_applied || "Unassigned",
            score: Math.round(interview?.ai_score ?? assessment?.mcq_score_percent ?? 0),
            rec: normalizeRecommendation(agent?.recommendation) || "On Hold",
            status: interview?.status === "Completed" ? "Completed" : interview?.status === "Scheduled" ? "Active" : "Review",
            ini: initials(candidate.full_name),
            color: colors[index % colors.length],
          };
        });

        setSummary(summaryData);
        setTopCandidates(mappedCandidates);
      } catch (error) {
        setSummary(current => current);
      }
    }
    loadDashboard();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <GlobalStyles />

      {/*
        ROOT SHELL
        - overflow: hidden on body prevents page-level scroll
        - The main-content div below is the ONLY scrollable container
        - height: 100vh + overflowY: auto = inner scroll column
      */}
      <div style={{ display: "flex", height: "100%", width: "100%", overflow: "hidden", fontFamily: FONT }}>

        {/* Fixed Sidebar */}
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

        {/* Main scrollable column */}
        <div style={{
          marginLeft: SW,
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left .25s cubic-bezier(.4,0,.2,1)",
          background: T.bg,
          minWidth: 0,
        }}>

          {/* Sticky Top Header */}
          <header className="dash-header" style={{
            position: "sticky", top: 0, zIndex: 50,
            background: T.white, borderBottom: `1px solid ${T.navy7}`,
            padding: "13px 30px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 18, flexShrink: 0,
          }}>
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 340, minWidth: 0 }}>
                <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  placeholder="Search candidates..."
                  style={{
                    width: "100%", paddingLeft: 36, paddingRight: 14,
                    paddingTop: 9, paddingBottom: 9,
                    border: `1px solid ${T.navy7}`, borderRadius: 10,
                    fontSize: 13, fontFamily: FONT, color: T.navy2,
                    background: T.navy8, outline: "none", transition: "border-color .15s, background .15s",
                  }}
                  onFocus={e => { e.target.style.borderColor = T.primaryBorder; e.target.style.background = "#fff"; }}
                  onBlur={e  => { e.target.style.borderColor = T.navy7;         e.target.style.background = T.navy8; }}
                />
              </div>
            </div>
            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
              <NotificationBell />
              <div style={{ width: 1, height: 26, background: T.navy7 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#5929D0,#CF008B)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>A</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy0, lineHeight: 1.25 }}>Alex Morgan</div>
                  <div style={{ fontSize: 11, color: T.navy4 }}>Senior Recruiter</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="dash-main" style={{ padding: "30px 30px 40px", flex: 1 }}>

            {/* Page title */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <div style={{ width: 4, height: 30, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})`, flexShrink: 0 }} />
                <h1 className="dash-title" style={{ fontSize: 26, fontWeight: 800, color: T.navy0, lineHeight: 1 }}>Recruiter Dashboard</h1>
              </div>
              <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
                Welcome back, Alex — here's your pipeline at a glance.&nbsp;
                <span style={{ color: T.primary, fontWeight: 600 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 26 }}>
              <StatCard title="Total Candidates"     value={summary.total_candidates} trend="+12.4%" trendUp   icon={Users}         accent={T.primary}  accentLight={T.primaryLight} delay={0}   />
              <StatCard title="Interviews Completed" value={summary.interviews_completed}  trend="+8.1%"  trendUp   icon={CheckCircle2}  accent={T.cyan}     accentLight={T.cyanLight}   delay={80}  />
              <StatCard title="Avg Candidate Score"  value={summary.avg_mcq_score} trend="+2.3pts" trendUp  icon={Star}          accent={T.pink}     accentLight={T.pinkLight}   delay={160} />
              <StatCard title="Shortlisted"          value={summary.total_selected}   trend="-3.2%"  trendUp={false} icon={ClipboardList} accent="#10B981" accentLight="#DCFCE7" delay={240} />
            </div>

            {/* Charts */}
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 26 }}>
              <FunnelChart />
              <LineChart />
              <PieChart />
            </div>

            {/* Table */}
            <CandidateTable candidates={topCandidates} />

          </main>

          {/* Footer */}
          <footer className="dash-footer" style={{
            padding: "14px 30px", borderTop: `1px solid ${T.navy7}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0, background: T.white,
            gap: 8, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 11, color: T.navy5 }}>© 2025 Centific AI · Recruiter OS v1.0</span>
            <span style={{ fontSize: 11, color: T.navy5 }}>Enterprise HR Analytics Platform</span>
          </footer>
        </div>
      </div>
    </>
  );
}
