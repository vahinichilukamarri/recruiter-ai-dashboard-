import { useEffect, useMemo, useState } from "react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import { api, decisionForApi, formatDate, initials, mapByCandidateId, normalizeRecommendation } from "../services/api";
import {
  Search, Filter, Plus, Download, ChevronDown,
  Clock, CheckCircle2, AlertCircle, XCircle,
  ArrowUpRight, Eye, Mail, MoreHorizontal, Bell, Menu,
  ThumbsUp, MinusCircle, ThumbsDown, FileText, X
} from "lucide-react";

const STATUSES = ["All", "Scheduled", "In Progress", "Completed", "Escalated", "Rejected"];

const THRESHOLD_FIELDS = [
  { key: "score",             label: "Overall Score",       color: "#5929D0" },
  { key: "mcqScore",          label: "MCQ Score",           color: "#0891B2" },
  { key: "communicationScore",label: "Communication Score", color: "#D97706" },
  { key: "resumeMatch",       label: "Resume Match",        color: "#16A34A" },
];

const AVATAR_COLORS = ["#5929D0", "#CF008B", "#22D3EE", "#F59E0B", "#10B981", "#6366F1", "#EC4899", "#0EA5E9", "#F97316", "#14B8A6"];

const CANDIDATES = [
  { id: "C-001", name: "Priya Sharma",    role: "ML Engineer",       score: 91, status: "Escalated",  rec: "Proceed",   scheduled: "Apr 20, 2026", completed: "Apr 20, 2026", ini: "PS", color: "#5929D0", sessionId: "SES-4421" },
  { id: "C-002", name: "Marcus Lee",      role: "Product Manager",   score: 78, status: "Completed",  rec: "On Hold",   scheduled: "Apr 21, 2026", completed: "Apr 21, 2026", ini: "ML", color: "#CF008B", sessionId: "SES-4422" },
  { id: "C-003", name: "Anjali Reddy",    role: "UX Designer",       score: 87, status: "Escalated",  rec: "Proceed",   scheduled: "Apr 19, 2026", completed: "Apr 19, 2026", ini: "AR", color: "#22D3EE", sessionId: "SES-4423" },
  { id: "C-004", name: "David Okafor",    role: "Data Analyst",      score: 62, status: "Completed",  rec: "Reject",    scheduled: "Apr 18, 2026", completed: "Apr 18, 2026", ini: "DO", color: "#F59E0B", sessionId: "SES-4424" },
  { id: "C-005", name: "Sofia Hernandez", role: "Frontend Engineer", score: 94, status: "Escalated",  rec: "Proceed",   scheduled: "Apr 22, 2026", completed: "Apr 22, 2026", ini: "SH", color: "#10B981", sessionId: "SES-4425" },
  { id: "C-006", name: "James Whitfield", role: "Data Analyst",      score: 70, status: "Completed",  rec: "On Hold",   scheduled: "Apr 22, 2026", completed: "Apr 22, 2026", ini: "JW", color: "#6366F1", sessionId: "SES-4426" },
  { id: "C-007", name: "Ayesha Khan",     role: "ML Engineer",       score: null,status: "Scheduled", rec: null,        scheduled: "Apr 26, 2026", completed: null,           ini: "AK", color: "#EC4899", sessionId: "SES-4427" },
  { id: "C-008", name: "Tom Nguyen",      role: "DevOps Engineer",   score: null,status: "In Progress",rec: null,       scheduled: "Apr 25, 2026", completed: null,           ini: "TN", color: "#0EA5E9", sessionId: "SES-4428" },
  { id: "C-009", name: "Shreya Patel",    role: "Frontend Engineer", score: 55, status: "Completed",  rec: "Reject",    scheduled: "Apr 17, 2026", completed: "Apr 17, 2026", ini: "SP", color: "#F97316", sessionId: "SES-4429" },
  { id: "C-010", name: "Carlos Mendez",   role: "ML Engineer",       score: 82, status: "Completed",  rec: "Proceed",   scheduled: "Apr 16, 2026", completed: "Apr 16, 2026", ini: "CM", color: "#14B8A6", sessionId: "SES-4430" },
];

const STATUS_CONFIG = {
  "Scheduled":   { bg: "#E8E5FF", color: "#5929D0", icon: Clock,         label: "Scheduled"    },
  "In Progress": { bg: "#FEF3C7", color: "#D97706", icon: AlertCircle,   label: "In Progress"  },
  "Completed":   { bg: "#DCFCE7", color: "#16A34A", icon: CheckCircle2,  label: "Completed"    },
  "Escalated":   { bg: "#CFFAFE", color: "#0891B2", icon: ArrowUpRight,  label: "Escalated"    },
  "Rejected":    { bg: "#FEE2E2", color: "#DC2626", icon: XCircle,       label: "Rejected"     },
};

const REC_CONFIG = {
  "Proceed":  { bg: "#DCFCE7", color: "#16A34A" },
  "On Hold":  { bg: "#FEF3C7", color: "#D97706" },
  "Reject":   { bg: "#FEE2E2", color: "#DC2626" },
};

const DECISION_LABEL = {
  Selected: "Accept",
  Hold: "On Hold",
  Rejected: "Reject",
  Escalated: "Escalated",
};

const ACTION_CONFIG = {
  Accept: {
    api: "Selected",
    icon: ThumbsUp,
    bg: "#DCFCE7",
    activeBg: "#16A34A",
    color: "#16A34A",
  },
  "On Hold": {
    api: "Hold",
    icon: MinusCircle,
    bg: "#FEF3C7",
    activeBg: "#D97706",
    color: "#D97706",
  },
  Reject: {
    api: "Rejected",
    icon: ThumbsDown,
    bg: "#FEE2E2",
    activeBg: "#DC2626",
    color: "#DC2626",
  },
};

// Report Detail Modal Component
const ReportDetailModal = ({ candidate, onClose, onExport }) => {
  if (!candidate) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      overflowY: "auto"
    }} onClick={onClose}>
      <div className="modal-animate" style={{
        background: T.white,
        borderRadius: 24,
        maxWidth: 900,
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        position: "relative",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
      }} onClick={(e) => e.stopPropagation()}>
        
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: T.navy8,
            border: "none",
            borderRadius: 10,
            width: 34,
            height: 34,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <X size={18} color={T.navy3} />
        </button>

        <div style={{ padding: "28px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 11, color: T.navy4, marginBottom: 6, letterSpacing: ".06em", textTransform: "uppercase" }}>
            Evaluation Report – {candidate.name}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: T.navy4, marginBottom: 4 }}>
                Interview date: {candidate.scheduled} · {candidate.role} · {candidate.id}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: T.navy4, marginBottom: 4 }}>OVERALL</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: candidate.score >= 85 ? T.success : candidate.score >= 70 ? "#D97706" : T.error }}>
                  {candidate.score || "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: T.navy3, marginBottom: 2 }}>{candidate.name}</div>
                <div style={{ fontSize: 12, color: T.navy4, marginBottom: 2 }}>{candidate.email || `${candidate.name.toLowerCase().replace(" ", ".")}@example.com`} · {candidate.id}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: 4, 
                    padding: "2px 8px", 
                    borderRadius: 12, 
                    fontSize: 10, 
                    fontWeight: 600, 
                    background: candidate.rec === "Proceed" ? T.successLight : candidate.rec === "On Hold" ? "#FEF3C7" : T.errorLight,
                    color: candidate.rec === "Proceed" ? T.success : candidate.rec === "On Hold" ? "#D97706" : T.error
                  }}>
                    <CheckCircle2 size={10} /> {candidate.rec || "Pending"}
                  </span>
                  <span style={{ fontSize: 11, color: T.navy4 }}>{candidate.role}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center", padding: "8px 16px", background: T.primaryLight, borderRadius: 12, minWidth: 100 }}>
                <ThumbsUp size={16} color={T.primary} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: T.navy4 }}>AI Recommendation</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{candidate.rec || "Pending"}</div>
              </div>
              <div style={{ textAlign: "center", padding: "8px 16px", background: T.navy8, borderRadius: 12, minWidth: 100 }}>
                <AlertCircle size={16} color={T.navy4} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: T.navy4 }}>Recruiter Decision</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy2 }}>{DECISION_LABEL[candidate.finalDecision] || "Pending Review"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy0, marginBottom: 12 }}>STRENGTHS</div>
          <ul style={{ marginLeft: 20, color: T.navy3, fontSize: 13, lineHeight: 1.8 }}>
            {(candidate.strengths ? candidate.strengths.split(/[.;]\s*/).filter(Boolean).slice(0, 3) : [
              "Strong algorithmic reasoning and complexity analysis",
              "Clear, well-structured code with good naming",
              "Considered edge cases and trade-offs proactively",
            ]).map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy0, marginBottom: 12 }}>AREAS TO PROBE IN FINAL ROUND</div>
          <ul style={{ marginLeft: 20, color: T.navy3, fontSize: 13, lineHeight: 1.8 }}>
            {(candidate.concerns ? candidate.concerns.split(/[.;]\s*/).filter(Boolean).slice(0, 3) : [
              "Could go deeper on system-design scalability trade-offs",
            ]).map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <div style={{ padding: "24px 32px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy0, marginBottom: 12 }}>AI RECOMMENDATION SUMMARY</div>
          <div style={{ 
            background: T.primaryLight, 
            padding: 16, 
            borderRadius: 12, 
            fontSize: 13, 
            color: T.navy2, 
            lineHeight: 1.6,
            marginBottom: 20
          }}>
            {candidate.summary || (candidate.rec === "Proceed" 
              ? "Proceed — Candidate demonstrates strong technical fundamentals, clear problem-solving, and correct complexity analysis. Recommended focus areas for final round: system design trade-offs and leadership scenarios."
              : candidate.rec === "On Hold"
              ? "Hold — Candidate shows potential but needs improvement in key areas. Consider for a different role or after upskilling."
              : "Reject — Candidate does not meet the required technical bar for this position.")}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              onClick={() => onExport(candidate)}
              style={{ 
                padding: "10px 20px",
                background: T.white,
                border: `1px solid ${T.navy7}`,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: T.navy2,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Download size={14} /> Export PDF
            </button>
            <button 
              onClick={onClose}
              style={{ 
                padding: "10px 24px",
                background: T.primary,
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Header({ onToggle }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.white, borderBottom: `1px solid ${T.navy7}`, padding: "13px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <button onClick={onToggle} style={{ background: T.navy8, border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Menu size={16} color={T.navy3} />
        </button>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input placeholder="Search candidates by name, role, ID..." style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: `1px solid ${T.navy7}`, borderRadius: 10, fontSize: 13, fontFamily: FONT, color: T.navy2, background: T.navy8, outline: "none" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={20} color={T.navy3} />
          <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: T.error, border: "2px solid #fff" }} />
        </div>
        <div style={{ width: 1, height: 26, background: T.navy7 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#5929D0,#CF008B)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.navy0, lineHeight: 1.25 }}>Alex Morgan</div>
            <div style={{ fontSize: 11, color: T.navy4 }}>Senior Recruiter</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ label, count, color, bg }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14, padding: "14px 20px", display: "flex", flexDirection: "column", gap: 4, flex: "1 1 100px", minWidth: 100, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || T.navy0 }}>{count}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.navy4 }}>{label}</div>
      <div style={{ height: 3, borderRadius: 99, background: bg || T.primaryLight, marginTop: 2 }} />
    </div>
  );
}

export default function CandidatesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeRole, setActiveRole] = useState("All Roles");
  const [hRow, setHRow] = useState(null);
  const [showReportModal, setShowReportModal] = useState(null);
  const [decisionMade, setDecisionMade] = useState({});
  const [savingDecision, setSavingDecision] = useState({});
  const [candidates, setCandidates] = useState(CANDIDATES);
  const [apiError, setApiError] = useState("");
  const [showThreshold, setShowThreshold] = useState(false);
  const [thresholds, setThresholds] = useState({ score: 0, mcqScore: 0, communicationScore: 0, resumeMatch: 0 });
  const SW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  const activeThresholdCount = Object.values(thresholds).filter(v => v > 0).length;

  useEffect(() => {
    let alive = true;
    async function loadCandidates() {
      try {
        const [candidateRows, assessmentRows, interviewRows, agentRows, decisionRows] = await Promise.all([
          api.getCandidates(),
          api.getAssessments(),
          api.getInterviews(),
          api.getAgentOutputs(),
          api.getFinalDecisions(),
        ]);
        if (!alive) return;

        const assessments = mapByCandidateId(assessmentRows);
        const agents = mapByCandidateId(agentRows);
        const decisions = mapByCandidateId(decisionRows);
        const latestInterview = interviewRows.reduce((acc, interview) => {
          const current = acc[interview.candidate_id];
          if (!current || new Date(interview.created_at) > new Date(current.created_at)) {
            acc[interview.candidate_id] = interview;
          }
          return acc;
        }, {});

        const mapped = candidateRows.map((candidate, index) => {
          const interview = latestInterview[candidate.id];
          const assessment = assessments[candidate.id];
          const agent = agents[candidate.id];
          const decision = decisions[candidate.id];
          const rejected = decision?.final_decision === "Rejected";
          const status = rejected ? "Rejected" : interview?.status || "Scheduled";
          return {
            id: `C-${String(candidate.id).padStart(3, "0")}`,
            candidateId: candidate.id,
            name: candidate.full_name,
            email: candidate.email,
            role: candidate.role_applied || "Unassigned",
            score: Math.round(interview?.ai_score ?? assessment?.mcq_score_percent ?? 0) || null,
            mcqScore: assessment?.mcq_score_percent != null ? Math.round(assessment.mcq_score_percent) : null,
            communicationScore: interview?.communication_score != null ? Math.round(interview.communication_score) : null,
            resumeMatch: assessment?.resume_match_percent != null ? Math.round(assessment.resume_match_percent) : null,
            status,
            rec: normalizeRecommendation(agent?.recommendation),
            finalDecision: decision?.final_decision || null,
            scheduled: formatDate(interview?.scheduled_date),
            completed: interview?.status === "Completed" ? formatDate(interview?.created_at) : null,
            ini: initials(candidate.full_name),
            color: AVATAR_COLORS[index % AVATAR_COLORS.length],
            sessionId: interview ? `SES-${String(interview.id).padStart(4, "0")}` : "Not scheduled",
            strengths: agent?.strengths,
            concerns: agent?.concerns,
            summary: agent?.summary,
          };
        });

        setCandidates(mapped);
        setDecisionMade(mapped.reduce((acc, candidate) => {
          if (candidate.finalDecision) {
            acc[candidate.id] = DECISION_LABEL[candidate.finalDecision] || candidate.finalDecision;
          }
          return acc;
        }, {}));
        setApiError("");
      } catch (error) {
        setApiError("Backend is not reachable yet. Showing sample data until it starts.");
      }
    }
    loadCandidates();
    return () => { alive = false; };
  }, []);

  const roles = useMemo(() => ["All Roles", ...new Set(candidates.map(c => c.role).filter(Boolean))], [candidates]);

  const filtered = candidates.filter(c => {
    if (activeStatus !== "All" && c.status !== activeStatus) return false;
    if (activeRole !== "All Roles" && c.role !== activeRole) return false;
    for (const { key } of THRESHOLD_FIELDS) {
      const min = thresholds[key];
      if (min > 0 && (c[key] == null || c[key] < min)) return false;
    }
    return true;
  });

  const counts = {
    Scheduled:   candidates.filter(c => c.status === "Scheduled").length,
    "In Progress": candidates.filter(c => c.status === "In Progress").length,
    Completed:   candidates.filter(c => c.status === "Completed").length,
    Escalated:   candidates.filter(c => c.status === "Escalated").length,
    Rejected:    candidates.filter(c => c.status === "Rejected").length,
  };

  const handleViewReport = (candidate) => {
    setShowReportModal(candidate);
  };

  const handleExportReport = (candidate) => {
    alert(`Exporting report for ${candidate.name}...`);
  };

  const handleDecision = async (candidate, decision) => {
    const candidateId = candidate.candidateId || Number(String(candidate.id).replace("C-", ""));
    const finalDecision = ACTION_CONFIG[decision]?.api || decisionForApi(decision);
    setSavingDecision(prev => ({ ...prev, [candidate.id]: true }));
    setApiError("");

    try {
      const saved = await api.updateFinalDecision(candidateId, {
        final_decision: finalDecision,
        decision_notes: `Recruiter marked ${decision} from the candidates dashboard.`,
      });
      const savedDecision = saved.final_decision || finalDecision;

      setDecisionMade(prev => ({
        ...prev,
        [candidate.id]: DECISION_LABEL[savedDecision] || decision,
      }));
      setCandidates(prev => prev.map(row => {
        if (row.id !== candidate.id) return row;
        return {
          ...row,
          finalDecision: savedDecision,
          status: savedDecision === "Rejected" ? "Rejected" : row.status === "Rejected" ? "Completed" : row.status,
        };
      }));
      setShowReportModal(current => {
        if (!current || current.id !== candidate.id) return current;
        return {
          ...current,
          finalDecision: savedDecision,
          status: savedDecision === "Rejected" ? "Rejected" : current.status === "Rejected" ? "Completed" : current.status,
        };
      });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingDecision(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  return (
    <>
      <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="candidates" />
        <div style={{ marginLeft: SW, flex: 1, height: "100vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" }}>
          <Header onToggle={() => setCollapsed(v => !v)} />

          <main style={{ padding: "28px 30px 40px", flex: 1 }}>

            {/* Page Title */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 28, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0 }}>Candidates</h1>
                </div>
                <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>ATS Interview Status Panel — all candidates across active roles</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 7, background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: T.navy2, cursor: "pointer", fontFamily: FONT }}>
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {/* Stat Pills */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              <StatPill label="Scheduled"   count={counts.Scheduled}     color={T.primary}  bg={T.primaryLight} />
              <StatPill label="In Progress" count={counts["In Progress"]} color="#D97706"    bg="#FEF3C7" />
              <StatPill label="Completed"   count={counts.Completed}     color={T.success}  bg={T.successLight} />
              <StatPill label="Escalated"   count={counts.Escalated}     color="#0891B2"    bg="#CFFAFE" />
              <StatPill label="Rejected"    count={counts.Rejected}      color={T.error}    bg={T.errorLight} />
              <StatPill label="Total"       count={candidates.length}    color={T.navy0}    bg={T.navy7} />
            </div>
            {apiError && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#FEF3C7", color: "#92400E", fontSize: 12, fontWeight: 600 }}>{apiError}</div>}

            {/* Filters */}
            <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Filter size={14} color={T.navy4} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.navy4 }}>Filters:</span>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setActiveStatus(s)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: FONT,
                    fontSize: 12, fontWeight: 600,
                    background: activeStatus === s ? T.primary : T.navy8,
                    color: activeStatus === s ? "#fff" : T.navy3,
                    transition: "all .15s",
                  }}>{s}</button>
                ))}
              </div>

              <div style={{ width: 1, height: 24, background: T.navy7 }} />

              <div style={{ position: "relative" }}>
                <select value={activeRole} onChange={e => setActiveRole(e.target.value)} style={{
                  appearance: "none", background: T.navy8, border: `1px solid ${T.navy7}`,
                  borderRadius: 8, padding: "7px 32px 7px 12px", fontSize: 12.5, fontWeight: 600,
                  color: T.navy2, fontFamily: FONT, cursor: "pointer", outline: "none",
                }}>
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown size={13} color={T.navy4} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setShowThreshold(v => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontFamily: FONT,
                    fontSize: 12, fontWeight: 600,
                    background: showThreshold || activeThresholdCount > 0 ? T.primary : T.navy8,
                    color: showThreshold || activeThresholdCount > 0 ? "#fff" : T.navy3,
                    border: "none", transition: "all .15s",
                  }}
                >
                  <Filter size={13} />
                  Score Threshold
                  {activeThresholdCount > 0 && (
                    <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: 99, padding: "1px 6px", fontSize: 11 }}>
                      {activeThresholdCount}
                    </span>
                  )}
                </button>
                {activeThresholdCount > 0 && (
                  <button
                    onClick={() => setThresholds({ score: 0, mcqScore: 0, communicationScore: 0, resumeMatch: 0 })}
                    style={{ fontSize: 11, color: T.error, background: T.errorLight, border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: FONT }}
                  >
                    Clear
                  </button>
                )}
                <span style={{ fontSize: 12, color: T.navy5, fontWeight: 500 }}>{filtered.length} of {candidates.length}</span>
              </div>
            </div>

            {/* Threshold Panel */}
            {showThreshold && (
              <div style={{
                background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14,
                padding: "20px 24px", marginBottom: 20,
                boxShadow: "0 4px 16px rgba(89,41,208,0.08)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.navy0 }}>Score Thresholds</span>
                    <span style={{ fontSize: 11, color: T.navy4, fontWeight: 500 }}>— only show candidates scoring at or above each minimum</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                  {THRESHOLD_FIELDS.map(({ key, label, color }) => {
                    const val = thresholds[key];
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.navy2 }}>{label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 800, color: val > 0 ? color : T.navy4,
                              minWidth: 36, textAlign: "right",
                            }}>{val > 0 ? `≥ ${val}` : "Off"}</span>
                          </div>
                        </div>
                        <input
                          type="range" min={0} max={100} step={1} value={val}
                          onChange={e => setThresholds(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          style={{ width: "100%", accentColor: color, cursor: "pointer", height: 4 }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: T.navy5 }}>0</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[60, 70, 80, 90].map(preset => (
                              <button
                                key={preset}
                                onClick={() => setThresholds(prev => ({ ...prev, [key]: preset }))}
                                style={{
                                  fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                                  border: `1px solid ${val === preset ? color : T.navy7}`,
                                  background: val === preset ? color + "18" : "transparent",
                                  color: val === preset ? color : T.navy4,
                                  cursor: "pointer", fontFamily: FONT,
                                }}
                              >{preset}</button>
                            ))}
                          </div>
                          <span style={{ fontSize: 10, color: T.navy5 }}>100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table */}
            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                  <thead>
                    <tr style={{ background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
                      {["Candidate", "Role", "Session ID", "Scheduled", "Score", "Recommendation", "Status", "Report", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => {
                      const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.Scheduled;
                      const StatusIcon = sc.icon;
                      const hasDecisionMade = decisionMade[c.id];
                      const isSavingDecision = savingDecision[c.id];
                      
                      return (
                        <tr key={c.id}
                          style={{ borderBottom: `1px solid ${T.navy7}`, background: hRow === i ? T.navy8 : T.white, transition: "background .12s", cursor: "default" }}
                          onMouseEnter={() => setHRow(i)} onMouseLeave={() => setHRow(null)}>

                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.ini}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy0 }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: T.navy5 }}>{c.id}</div>
                              </div>
                            </div>
                           </td>

                          <td style={{ padding: "13px 18px", fontSize: 13, color: T.navy3 }}>{c.role}</td>
                          <td style={{ padding: "13px 18px", fontSize: 12, fontFamily: "monospace", color: T.navy4 }}>{c.sessionId}</td>
                          <td style={{ padding: "13px 18px", fontSize: 12.5, color: T.navy3, whiteSpace: "nowrap" }}>{c.scheduled}</td>

                          <td style={{ padding: "13px 18px" }}>
                            {c.score !== null ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <div style={{ width: 44, height: 6, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${c.score}%`, borderRadius: 999, background: c.score >= 85 ? T.success : c.score >= 70 ? T.warning : T.error }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: T.navy0 }}>{c.score}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: T.navy5 }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: "13px 18px" }}>
                            {c.rec ? (
                              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, ...REC_CONFIG[c.rec] }}>{c.rec}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: T.navy5 }}>Pending</span>
                            )}
                          </td>

                          <td style={{ padding: "13px 18px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: sc.bg, color: sc.color }}>
                              <StatusIcon size={12} />
                              {c.status}
                            </span>
                          </td>

                          {/* Report Button */}
                          <td style={{ padding: "13px 18px" }}>
                            <button 
                              onClick={() => handleViewReport(c)}
                              style={{ 
                                background: T.primaryLight, 
                                border: "none", 
                                borderRadius: 6, 
                                padding: "6px 12px", 
                                cursor: "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 5,
                                fontSize: 11,
                                fontWeight: 600,
                                color: T.primary,
                                fontFamily: FONT
                              }}
                              title="View Report"
                            >
                              <FileText size={13} /> Report
                            </button>
                          </td>

                          {/* Actions - Accept, Hold, Reject */}
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {Object.entries(ACTION_CONFIG).map(([label, config]) => {
                                const Icon = config.icon;
                                const active = hasDecisionMade === label;
                                return (
                                  <button
                                    key={label}
                                    onClick={() => handleDecision(c, label)}
                                    disabled={isSavingDecision}
                                    style={{
                                      background: active ? config.activeBg : config.bg,
                                      border: active ? `1px solid ${config.activeBg}` : "1px solid transparent",
                                      borderRadius: 6,
                                      padding: "5px 10px",
                                      cursor: isSavingDecision ? "not-allowed" : "pointer",
                                      opacity: isSavingDecision ? 0.55 : 1,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 5,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: active ? "#fff" : config.color,
                                      fontFamily: FONT,
                                      boxShadow: active ? `0 0 0 2px ${config.bg}` : "none",
                                    }}
                                    title={`${label} Candidate`}
                                  >
                                    <Icon size={13} /> {label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.navy5 }}>Showing {filtered.length} results</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1,2,3].map(p => (
                    <button key={p} style={{ width: 30, height: 30, borderRadius: 7, border: p === 1 ? "none" : `1px solid ${T.navy7}`, background: p === 1 ? T.primary : T.white, color: p === 1 ? "#fff" : T.navy3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <ReportDetailModal 
            candidate={showReportModal}
            onClose={() => setShowReportModal(null)}
            onExport={handleExportReport}
          />
        )}
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-animate { animation: modalSlideIn 0.25s ease forwards; }
      `}</style>
    </>
  );
}
