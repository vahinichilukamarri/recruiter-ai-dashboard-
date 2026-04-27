// src/pages/Analytics.jsx
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Clock, Award, Menu, Download,
  Calendar, Filter, ChevronDown, Star, CheckCircle, BarChart3,
} from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import { api } from "../services/api";

// ─── Date helpers ────────────────────────────────────────────────────────────
function getDateRange(label) {
  const now = new Date();
  const y = now.getFullYear();
  const q = Math.floor(now.getMonth() / 3);
  switch (label) {
    case "This Quarter":
      return [new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 0, 23, 59, 59)];
    case "Last Quarter": {
      const pq = q === 0 ? 3 : q - 1;
      const py = q === 0 ? y - 1 : y;
      return [new Date(py, pq * 3, 1), new Date(py, pq * 3 + 3, 0, 23, 59, 59)];
    }
    case "This Year":
      return [new Date(y, 0, 1), new Date(y, 11, 31, 23, 59, 59)];
    case "Last Year":
      return [new Date(y - 1, 0, 1), new Date(y - 1, 11, 31, 23, 59, 59)];
    default:
      return [new Date(0), new Date()];
  }
}

function getPrevRange(start, end) {
  const ms = end - start;
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - ms);
  return [prevStart, prevEnd];
}

function computeMetrics(candidates, interviews, decisions, assessments, start, end) {
  const filtC = candidates.filter(c => {
    const d = new Date(c.created_at);
    return d >= start && d <= end;
  });
  const ids = new Set(filtC.map(c => c.id));
  const filtI = interviews.filter(iv => ids.has(iv.candidate_id));
  const filtD = decisions.filter(d => ids.has(d.candidate_id));
  const filtA = assessments.filter(a => ids.has(a.candidate_id));

  const applicants = filtC.length;
  const screened = filtA.length;
  const interviewed = filtI.length;
  const escalated = filtI.filter(iv => iv.status === "Escalated").length;
  const selected = filtD.filter(d => d.final_decision === "Selected").length;
  const completed = filtI.filter(iv => ["Completed", "Escalated"].includes(iv.status)).length;
  const completionRate = interviewed > 0 ? Math.round((completed / interviewed) * 100) : 0;

  const scores = filtI.map(iv => iv.ai_score).filter(s => s != null && s > 0);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const uniqueRoles = new Set(filtC.map(c => c.role_applied).filter(Boolean)).size;
  const applicantsPerRole = uniqueRoles > 0 ? Math.round(applicants / uniqueRoles) : applicants;

  // Time-to-fill: days from candidate created_at to interview created_at
  const ttfNums = filtI
    .filter(iv => ["Completed", "Escalated"].includes(iv.status))
    .map(iv => {
      const c = filtC.find(fc => fc.id === iv.candidate_id);
      if (!c?.created_at || !iv.created_at) return null;
      return Math.max(1, Math.round((new Date(iv.created_at) - new Date(c.created_at)) / 86400000));
    })
    .filter(Boolean);
  const avgTtf = ttfNums.length
    ? Math.round(ttfNums.reduce((a, b) => a + b, 0) / ttfNums.length)
    : 0;

  // Department breakdown grouped by role_applied
  const deptMap = {};
  filtC.forEach(c => {
    const key = c.role_applied || "Unassigned";
    if (!deptMap[key]) deptMap[key] = { dept: key, open: 0, interviews: 0, offers: 0, hired: 0, ttfNums: [] };
    deptMap[key].open++;
  });
  filtI.forEach(iv => {
    const c = filtC.find(fc => fc.id === iv.candidate_id);
    if (!c) return;
    const key = c.role_applied || "Unassigned";
    if (deptMap[key]) {
      deptMap[key].interviews++;
      const ttf = ttfNums.find((_, idx) => filtI.filter(i => ["Completed", "Escalated"].includes(i.status))[idx]?.candidate_id === iv.candidate_id);
      if (ttf) deptMap[key].ttfNums.push(ttf);
    }
  });
  filtD.forEach(d => {
    const c = filtC.find(fc => fc.id === d.candidate_id);
    if (!c) return;
    const key = c.role_applied || "Unassigned";
    if (deptMap[key] && d.final_decision === "Selected") {
      deptMap[key].hired++;
      deptMap[key].offers++;
    }
  });
  const deptRows = Object.values(deptMap).map(d => ({
    dept: d.dept,
    open: d.open,
    interviews: d.interviews,
    offers: d.offers,
    hired: d.hired,
    ttf: d.ttfNums.length
      ? `${Math.round(d.ttfNums.reduce((a, b) => a + b, 0) / d.ttfNums.length)}d`
      : avgTtf ? `${avgTtf}d` : "—",
  }));

  return { applicants, screened, interviewed, escalated, selected, completed, completionRate, avgScore, applicantsPerRole, avgTtf, uniqueRoles, deptRows };
}

function pctChange(curr, prev) {
  if (!prev && !curr) return "0";
  if (!prev) return curr > 0 ? "+100" : "0";
  const d = Math.round(((curr - prev) / prev) * 100);
  return d >= 0 ? `+${d}` : `${d}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, padding: "18px 20px", flex: 1, minWidth: 180, boxShadow: "0 1px 2px rgba(0,0,0,.05)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.navy4, textTransform: "uppercase", letterSpacing: ".03em" }}>{title}</span>
      <Icon size={20} color={color || T.primary} />
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, color: T.navy0, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 12, color: changeType === "up" ? T.success : T.error, display: "flex", alignItems: "center", gap: 4 }}>
      {changeType === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {change}% vs prev period
    </div>
  </div>
);

const FunnelStep = ({ label, value, percentage, color }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy2 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value.toLocaleString()}</span>
    </div>
    <div style={{ height: 8, background: T.navy8, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(100, percentage))}%`, height: "100%", background: color, borderRadius: 4, transition: "width .4s ease" }} />
    </div>
    <div style={{ fontSize: 11, color: T.navy4, marginTop: 4 }}>{percentage}% of previous stage</div>
  </div>
);

const SourceRow = ({ source, percentage, count, color }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy2 }}>{source}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{percentage}%</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 8, background: T.navy8, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, color: T.navy4, minWidth: 60 }}>{count} hires</span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [collapsed, setCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState("This Quarter");
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const [candidates, interviews, decisions, assessments] = await Promise.all([
          api.getCandidates(),
          api.getInterviews(),
          api.getFinalDecisions(),
          api.getAssessments(),
        ]);
        if (!alive) return;
        setRawData({ candidates, interviews, decisions, assessments });
        setApiError(false);
      } catch {
        if (!alive) return;
        setApiError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const analytics = useMemo(() => {
    if (!rawData) return null;
    const { candidates, interviews, decisions, assessments } = rawData;
    const [start, end] = getDateRange(timeRange);
    const [ps, pe] = getPrevRange(start, end);

    const curr = computeMetrics(candidates, interviews, decisions, assessments, start, end);
    const prev = computeMetrics(candidates, interviews, decisions, assessments, ps, pe);

    const funnelData = [
      { label: "Applications Received", value: curr.applicants, percentage: 100, color: T.primary },
      { label: "AI Screened (Passed)", value: curr.screened, percentage: curr.applicants ? Math.round(curr.screened / curr.applicants * 100) : 0, color: T.cyan },
      { label: "Avatar Interviewed", value: curr.interviewed, percentage: curr.screened ? Math.round(curr.interviewed / curr.screened * 100) : 0, color: T.pink },
      { label: "Escalated to Final", value: curr.escalated, percentage: curr.interviewed ? Math.round(curr.escalated / curr.interviewed * 100) : 0, color: "#F59E0B" },
      { label: "Selected / Hired", value: curr.selected, percentage: curr.escalated ? Math.round(curr.selected / curr.escalated * 100) : 0, color: T.success },
    ];

    return {
      curr, prev, funnelData,
      kpis: {
        ttf:            { value: curr.avgTtf ? `${curr.avgTtf}` : "—",   change: pctChange(curr.avgTtf, prev.avgTtf),               changeType: curr.avgTtf <= prev.avgTtf || !prev.avgTtf ? "up" : "down", unit: "days" },
        completion:     { value: `${curr.completionRate}`,               change: pctChange(curr.completionRate, prev.completionRate), changeType: curr.completionRate >= prev.completionRate ? "up" : "down",  unit: "%" },
        perRole:        { value: `${curr.applicantsPerRole || "—"}`,     change: pctChange(curr.applicantsPerRole, prev.applicantsPerRole), changeType: "up",                                                unit: "" },
        avgScore:       { value: curr.avgScore ? `${curr.avgScore}` : "—", change: pctChange(curr.avgScore, prev.avgScore),          changeType: curr.avgScore >= prev.avgScore ? "up" : "down",            unit: "" },
      },
    };
  }, [rawData, timeRange]);

  // Static source data (not in DB – illustrative)
  const sourceData = [
    { source: "LinkedIn",          percentage: 42, count: 56, color: T.primary },
    { source: "Referrals",         percentage: 28, count: 38, color: T.cyan },
    { source: "Naukri",            percentage: 18, count: 24, color: T.pink },
    { source: "Internal Database", percentage: 12, count: 16, color: "#10B981" },
  ];

  const funnelData    = analytics?.funnelData    ?? [];
  const departmentData = analytics?.curr.deptRows ?? [];
  const kpis          = analytics?.kpis;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="analytics" />
      <div style={{ marginLeft: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED, flex: 1, height: "100vh", overflowY: "auto", transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" }}>

        {/* Sticky Header */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: T.white, borderBottom: `1px solid ${T.navy7}`, padding: "13px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <button onClick={() => setCollapsed(v => !v)} style={{ background: T.navy8, border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer" }}>
              <Menu size={16} color={T.navy3} />
            </button>
            {/* Time range selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.navy8, padding: "6px 14px", borderRadius: 8 }}>
              <Calendar size={14} color={T.navy4} />
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                style={{ background: "transparent", border: "none", fontSize: 12, fontWeight: 600, color: T.navy2, outline: "none", cursor: "pointer", fontFamily: FONT }}
              >
                <option>This Quarter</option>
                <option>Last Quarter</option>
                <option>This Year</option>
                <option>Last Year</option>
              </select>
              <ChevronDown size={12} color={T.navy4} />
            </div>
            {loading && (
              <span style={{ fontSize: 11, color: T.navy4, fontWeight: 500 }}>Loading…</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: T.navy2, cursor: "pointer" }}>
              <Download size={14} /> Export
            </button>
            <NotificationBell />
            <div style={{ width: 1, height: 26, background: T.navy7 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${T.primary},${T.pink})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>A</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy0 }}>Alex Morgan</div>
                <div style={{ fontSize: 11, color: T.navy4 }}>Senior Recruiter</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: "28px 30px 40px" }}>

          {/* Page Title */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 4, height: 28, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
              <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0 }}>Recruiting Analytics</h1>
            </div>
            <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
              Strategic KPIs and hiring effectiveness — <b>{timeRange}</b>
            </p>
          </div>

          {apiError && (
            <div style={{ marginBottom: 20, padding: "10px 16px", borderRadius: 10, background: "#FEF3C7", color: "#92400E", fontSize: 12, fontWeight: 600 }}>
              Backend is not reachable. Showing empty data — start the backend to see live analytics.
            </div>
          )}

          {/* KPI Stats Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <StatCard title="Avg Time-to-Fill"    value={kpis ? `${kpis.ttf.value} ${kpis.ttf.unit}`             : "—"} change={kpis?.ttf.change         ?? "0"} changeType={kpis?.ttf.changeType         ?? "up"} icon={Clock}     color={T.primary} />
            <StatCard title="Completion Rate"     value={kpis ? `${kpis.completion.value}${kpis.completion.unit}` : "—"} change={kpis?.completion.change  ?? "0"} changeType={kpis?.completion.changeType  ?? "up"} icon={Award}     color={T.success} />
            <StatCard title="Applicants / Role"   value={kpis?.perRole.value  ?? "—"}                                    change={kpis?.perRole.change     ?? "0"} changeType={kpis?.perRole.changeType     ?? "up"} icon={Users}     color={T.cyan}    />
            <StatCard title="Avg AI Score"        value={kpis?.avgScore.value ?? "—"}                                    change={kpis?.avgScore.change    ?? "0"} changeType={kpis?.avgScore.changeType    ?? "up"} icon={Star}      color={T.pink}    />
          </div>

          {/* Two-column: Funnel + Sources */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>

            {/* Hiring Funnel */}
            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>Hiring Funnel</h2>
                <p style={{ fontSize: 12, color: T.navy4 }}>Conversion at each stage for {timeRange.toLowerCase()}</p>
              </div>
              {funnelData.length === 0 && !loading ? (
                <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: T.navy4 }}>No data for this period</div>
              ) : funnelData.map((step, i) => (
                <FunnelStep key={i} label={step.label} value={step.value} percentage={step.percentage} color={step.color} />
              ))}
            </div>

            {/* Source Effectiveness (static/illustrative) */}
            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>Source Effectiveness</h2>
                <p style={{ fontSize: 12, color: T.navy4 }}>Hire yield by sourcing channel (illustrative)</p>
              </div>
              {sourceData.map((s, i) => (
                <SourceRow key={i} source={s.source} percentage={s.percentage} count={s.count} color={s.color} />
              ))}
            </div>
          </div>

          {/* Department Breakdown */}
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.navy7}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>Role / Department Breakdown</h2>
                  <p style={{ fontSize: 12, color: T.navy4 }}>Open roles, interviews, and offers for {timeRange.toLowerCase()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: T.navy4, fontWeight: 500 }}>
                    {departmentData.length} role{departmentData.length !== 1 ? "s" : ""}
                  </span>
                  <div style={{ padding: "5px 10px", borderRadius: 8, background: T.primaryLight, fontSize: 11, fontWeight: 600, color: T.primary }}>
                    {analytics?.curr.applicants ?? 0} total applicants
                  </div>
                </div>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
                    {["Role / Department", "Applicants", "Active Interviews", "Offers (QTD)", "Hired", "Time-to-Fill"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departmentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, color: T.navy4 }}>
                        {loading ? "Loading…" : "No data for this period"}
                      </td>
                    </tr>
                  ) : departmentData.map((dept, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.navy7}`, background: i % 2 === 0 ? T.white : T.navy8 }}>
                      <td style={{ padding: "14px 20px", fontWeight: 600, color: T.navy0 }}>{dept.dept}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.open}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.interviews}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.offers}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, background: T.successLight, color: T.success, fontSize: 11, fontWeight: 600 }}>
                          <CheckCircle size={10} /> {dept.hired}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.ttf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.navy7}`, background: T.navy8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: T.navy4 }}>Showing {departmentData.length} role{departmentData.length !== 1 ? "s" : ""}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.primary }}>
                Total Open: {departmentData.reduce((acc, d) => acc + d.open, 0)}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
