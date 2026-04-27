import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Bell, Search, Menu, Download, FileText, Eye, Archive,
  RotateCcw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Filter, CheckCircle2, XCircle, Clock, Shield, TrendingUp,
  Award, Users, Calendar, Star, X, MoreVertical, Sparkles,
  Mail, User, Briefcase, ThumbsUp, AlertCircle, SlidersHorizontal
} from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import { api, formatDate, initials, mapByCandidateId, normalizeRecommendation } from "../services/api";
import NotificationBell from "../components/NotificationBell";

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-centific", "final-evaluated");
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
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: ${T.navy8}; }
      ::-webkit-scrollbar-thumb { background: ${T.navy6}; border-radius: 10px; }

      .fe-card-lift { transition: transform .18s ease, box-shadow .18s ease; }
      .fe-card-lift:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(89,41,208,.14) !important; }

      .fe-btn {
        display: inline-flex; align-items: center; gap: 6px;
        border: 1px solid ${T.navy7}; background: ${T.white}; color: ${T.navy2};
        border-radius: 8px; padding: 7px 13px; font-size: 12px; font-weight: 600;
        font-family: ${FONT}; cursor: pointer;
        transition: all .15s ease;
      }
      .fe-btn:hover { border-color: ${T.primaryBorder}; color: ${T.primary}; background: ${T.primaryLight}; }
      .fe-btn-primary {
        background: ${T.primary}; color: #fff; border-color: ${T.primary};
      }
      .fe-btn-primary:hover { background: #4318b0; border-color: #4318b0; color: #fff; }
      .fe-btn-ghost { background: transparent; border-color: transparent; }
      .fe-btn-ghost:hover { background: ${T.navy8}; border-color: ${T.navy7}; }

      .fe-input {
        width: 100%; padding: 9px 12px;
        border: 1px solid ${T.navy7}; border-radius: 9px;
        font-size: 13px; font-family: ${FONT}; color: ${T.navy1};
        background: ${T.white}; outline: none;
        transition: border-color .15s, box-shadow .15s;
      }
      .fe-input:focus { border-color: ${T.primary}; box-shadow: 0 0 0 3px rgba(89,41,208,.08); }

      .fe-row-hover:hover { background: ${T.navy8} !important; }

      @keyframes fe-fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fe-fade-up { animation: fe-fadeUp .45s ease forwards; }

      @keyframes fe-shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .fe-skel {
        background: linear-gradient(90deg, ${T.navy8} 25%, ${T.navy7} 50%, ${T.navy8} 75%);
        background-size: 800px 100%;
        animation: fe-shimmer 1.4s linear infinite;
        border-radius: 6px;
      }

      @keyframes fe-toastIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .fe-toast { animation: fe-toastIn .3s ease forwards; }

      .fe-checkbox {
        width: 16px; height: 16px;
        border: 1.5px solid ${T.navy6}; border-radius: 4px;
        cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
        background: ${T.white}; transition: all .15s;
      }
      .fe-checkbox.checked { background: ${T.primary}; border-color: ${T.primary}; }
      .fe-checkbox:hover { border-color: ${T.primary}; }

      @keyframes modalSlideIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .modal-animate { animation: modalSlideIn 0.25s ease forwards; }
    `;
    document.head.appendChild(el);
    return () => { if (document.head.contains(el)) document.head.removeChild(el); };
  }, []);
  return null;
}

// Report Detail Modal Component (without per-question scores)
const ReportDetailModal = ({ candidate, onClose, onExport }) => {
  if (!candidate) return null;
  const recruiterDecision = candidate.decision || "Pending Review";
  const aiRecommendation = candidate.aiRecommendation || "Pending";
  const decisionTone = recruiterDecision === "Selected" ? T.success : recruiterDecision === "Hold" ? "#D97706" : recruiterDecision === "Escalated" ? "#0891B2" : T.error;
  const decisionBg = recruiterDecision === "Selected" ? T.successLight : recruiterDecision === "Hold" ? "#FEF3C7" : recruiterDecision === "Escalated" ? "#CFFAFE" : T.errorLight;

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
                Interview date: {candidate.decisionDate} · {candidate.role} · {candidate.id}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: T.navy4, marginBottom: 4 }}>OVERALL</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: candidate.finalScore >= 85 ? T.success : candidate.finalScore >= 70 ? "#D97706" : T.error }}>
                  {candidate.finalScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: T.navy3, marginBottom: 2 }}>{candidate.name}</div>
                <div style={{ fontSize: 12, color: T.navy4, marginBottom: 2 }}>{candidate.name.toLowerCase().replace(" ", ".")}@example.com · {candidate.id}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: 4, 
                    padding: "2px 8px", 
                    borderRadius: 12, 
                    fontSize: 10, 
                    fontWeight: 600, 
                    background: decisionBg,
                    color: decisionTone
                  }}>
                    <CheckCircle2 size={10} /> {recruiterDecision}
                  </span>
                  <span style={{ fontSize: 11, color: T.navy4 }}>{candidate.role}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center", padding: "8px 16px", background: T.primaryLight, borderRadius: 12, minWidth: 100 }}>
                <ThumbsUp size={16} color={T.primary} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: T.navy4 }}>AI Recommendation</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{aiRecommendation}</div>
              </div>
              <div style={{ textAlign: "center", padding: "8px 16px", background: decisionBg, borderRadius: 12, minWidth: 100 }}>
                <AlertCircle size={16} color={decisionTone} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: T.navy4 }}>Recruiter Decision</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: decisionTone }}>{recruiterDecision}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy0, marginBottom: 12 }}>STRENGTHS</div>
          <ul style={{ marginLeft: 20, color: T.navy3, fontSize: 13, lineHeight: 1.8 }}>
            <li>Strong algorithmic reasoning and complexity analysis</li>
            <li>Clear, well-structured code with good naming</li>
            <li>Considered edge cases and trade-offs proactively</li>
          </ul>
        </div>

        <div style={{ padding: "24px 32px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy0, marginBottom: 12 }}>AREAS TO PROBE IN FINAL ROUND</div>
          <ul style={{ marginLeft: 20, color: T.navy3, fontSize: 13, lineHeight: 1.8 }}>
            <li>Could go deeper on system-design scalability trade-offs</li>
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
            {candidate.aiSummary || "Proceed — Candidate demonstrates strong technical fundamentals, clear problem-solving, and correct complexity analysis. Recommended focus areas for final round: system design trade-offs and leadership scenarios."}
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

// Toast Component
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fe-toast" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: T.navy0, color: "#fff",
      padding: "12px 18px", borderRadius: 10,
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 13, fontWeight: 600, fontFamily: FONT,
      boxShadow: "0 10px 30px rgba(0,0,0,.25)",
    }}>
      <CheckCircle2 size={16} color="#10B981" />
      {message}
    </div>
  );
}

// Skeleton Row
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${T.navy7}` }}>
      {Array.from({ length: 13 }).map((_, i) => (
        <td key={i} style={{ padding: "14px 18px" }}>
          <div className="fe-skel" style={{ height: 14, width: i === 1 ? 140 : 70 }} />
        </td>
      ))}
    </tr>
  );
}

// Confidence Meter
function ConfidenceMeter({ value }) {
  const color = value >= 90 ? T.primary : value >= 75 ? T.cyan : value >= 60 ? "#F59E0B" : T.error;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 80 }}>
      <div style={{ flex: 1, height: 5, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: T.navy1 }}>{value}%</span>
    </div>
  );
}

// RAW CANDIDATES DATA
const RAW_CANDIDATES = [
  {
    id: "CND-1042", name: "Priya Sharma", role: "ML Engineer", department: "AI",
    experience: 6, aiScore: 92, interviewScore: 89, finalScore: 91,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-18",
    confidence: 96, humanFinalDecision: true, ini: "PS", color: "#5929D0",
    skillMatch: 94, communication: 9.1, technical: 9.4, cultureFit: 8.8,
    interviewerNotes: "Strong systems thinking, excellent ML fundamentals, presented portfolio with clarity.",
    recruiterNotes: "Top-tier candidate. Aligned on compensation. Ready for offer.",
    aiSummary: "High alignment with role requirements. No bias indicators detected across panels.",
    decisionReason: "Outperformed peers on technical depth and culture interview.",
  },
  {
    id: "CND-1043", name: "Marcus Lee", role: "Product Manager", department: "Product",
    experience: 8, aiScore: 81, interviewScore: 76, finalScore: 78,
    biasSafe: true, decision: "Hold", decisionDate: "2025-04-17",
    confidence: 72, humanFinalDecision: true, ini: "ML", color: "#CF008B",
    skillMatch: 79, communication: 8.3, technical: 7.4, cultureFit: 8.0,
    interviewerNotes: "Solid PM craft, gaps on technical depth for AI-product domain.",
    recruiterNotes: "Hold for Q3 review when AI-PM role opens.",
    aiSummary: "Moderate fit. Recommend re-evaluation against future roles.",
    decisionReason: "Strong generalist but role mismatch on AI specialization.",
  },
  {
    id: "CND-1044", name: "Anjali Reddy", role: "UX Designer", department: "Design",
    experience: 5, aiScore: 88, interviewScore: 90, finalScore: 89,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-16",
    confidence: 92, humanFinalDecision: true, ini: "AR", color: "#22D3EE",
    skillMatch: 91, communication: 9.3, technical: 8.5, cultureFit: 9.4,
    interviewerNotes: "Outstanding portfolio, end-to-end product thinking, strong stakeholder skills.",
    recruiterNotes: "Hire. Offer extended.",
    aiSummary: "Excellent fit. Diverse panel scored consistently high.",
    decisionReason: "Best-in-class design thinking and team chemistry.",
  },
  {
    id: "CND-1045", name: "David Okafor", role: "Sales Lead", department: "Sales",
    experience: 9, aiScore: 64, interviewScore: 58, finalScore: 62,
    biasSafe: true, decision: "Rejected", decisionDate: "2025-04-15",
    confidence: 88, humanFinalDecision: true, ini: "DO", color: "#F59E0B",
    skillMatch: 60, communication: 7.0, technical: 5.8, cultureFit: 6.4,
    interviewerNotes: "Sales chops present but enterprise-AI experience lacking.",
    recruiterNotes: "Not a fit for current senior role. Polite decline sent.",
    aiSummary: "Below threshold for enterprise AI sales track.",
    decisionReason: "Did not meet bar on technical sales for AI products.",
  },
  {
    id: "CND-1046", name: "Sofia Hernandez", role: "Frontend Engineer", department: "Engineering",
    experience: 4, aiScore: 95, interviewScore: 93, finalScore: 94,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-19",
    confidence: 97, humanFinalDecision: true, ini: "SH", color: "#10B981",
    skillMatch: 96, communication: 9.0, technical: 9.6, cultureFit: 9.1,
    interviewerNotes: "Exceptional technical interview. Clean architecture instincts.",
    recruiterNotes: "Strong hire. Extended offer with sign-on bonus.",
    aiSummary: "Top decile candidate. All panels aligned.",
    decisionReason: "Highest technical score in cohort.",
  },
  {
    id: "CND-1047", name: "James Whitfield", role: "Data Analyst", department: "Data",
    experience: 3, aiScore: 71, interviewScore: 68, finalScore: 70,
    biasSafe: true, decision: "Hold", decisionDate: "2025-04-14",
    confidence: 65, humanFinalDecision: true, ini: "JW", color: "#6366F1",
    skillMatch: 68, communication: 7.5, technical: 7.2, cultureFit: 7.6,
    interviewerNotes: "Good SQL fundamentals, weaker on statistical reasoning.",
    recruiterNotes: "Considering for junior role with mentorship plan.",
    aiSummary: "Borderline fit. Promising trajectory.",
    decisionReason: "Awaiting hiring manager final review for adjusted role.",
  },
];

const DECISION_PILL = {
  Selected: { bg: "#DCFCE7", color: "#16A34A", dot: "#16A34A" },
  Rejected: { bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626" },
  Hold: { bg: "#FEF3C7", color: "#D97706", dot: "#D97706" },
  Escalated: { bg: "#CFFAFE", color: "#0891B2", dot: "#0891B2" },
};

export default function FinalEvaluated() {
  const [collapsed, setCollapsed] = useState(false);
  const SW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState(RAW_CANDIDATES);
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [sort, setSort] = useState({ key: "decisionDate", dir: "desc" });
  const [showReportModal, setShowReportModal] = useState(null);

  const initialFilters = {
    search: "", role: "", department: "", decision: "",
    minScore: 0, maxScore: 100, minExp: 0, maxExp: 20, minInterview: 0, minConfidence: 0,
    dateFrom: "", dateTo: "", biasSafeOnly: false,
  };
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    let alive = true;
    async function loadRecords() {
      try {
        const [candidateRows, assessmentRows, interviewRows, agentRows, decisionRows] = await Promise.all([
          api.getCandidates(),
          api.getAssessments(),
          api.getInterviews(),
          api.getAgentOutputs(),
          api.getFinalDecisions(),
        ]);
        if (!alive) return;

        const candidates = mapByCandidateId(candidateRows.map(candidate => ({ ...candidate, candidate_id: candidate.id })));
        const assessments = mapByCandidateId(assessmentRows);
        const agents = mapByCandidateId(agentRows);
        const latestInterview = interviewRows.reduce((acc, interview) => {
          const current = acc[interview.candidate_id];
          if (!current || new Date(interview.created_at) > new Date(current.created_at)) {
            acc[interview.candidate_id] = interview;
          }
          return acc;
        }, {});
        const colors = ["#5929D0", "#CF008B", "#22D3EE", "#F59E0B", "#10B981", "#6366F1", "#EC4899", "#0EA5E9"];

        const mapped = decisionRows.map((decision, index) => {
          const candidate = candidates[decision.candidate_id] || {};
          const assessment = assessments[decision.candidate_id] || {};
          const interview = latestInterview[decision.candidate_id] || {};
          const agent = agents[decision.candidate_id] || {};
          const aiScore = Math.round(agent.recommendation_confidence_score ?? assessment.mcq_score_percent ?? 0);
          const interviewScore = Math.round(interview.ai_score ?? assessment.coding_score_percent ?? aiScore);
          const finalScore = Math.round((aiScore + interviewScore + (assessment.resume_match_percent ?? aiScore)) / 3);

          return {
            id: `C-${String(decision.candidate_id).padStart(3, "0")}`,
            name: candidate.full_name || `Candidate ${decision.candidate_id}`,
            role: candidate.role_applied || "Unassigned",
            department: candidate.department || "General",
            experience: candidate.experience_years || 0,
            aiScore,
            interviewScore,
            finalScore,
            biasSafe: true,
            decision: decision.final_decision || "Hold",
            aiRecommendation: normalizeRecommendation(agent.recommendation) || "Pending",
            decisionDate: formatDate(decision.decided_at),
            confidence: Math.round(agent.recommendation_confidence_score ?? 80),
            humanFinalDecision: decision.human_final_decision,
            ini: initials(candidate.full_name),
            color: colors[index % colors.length],
            interviewerNotes: interview.transcript_summary || "No interviewer notes available.",
            recruiterNotes: decision.decision_notes || "No recruiter notes added.",
            aiSummary: agent.summary || "No AI summary available.",
          };
        });

        setRecords(mapped);
      } catch (error) {
        setRecords(RAW_CANDIDATES);
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadRecords();
    return () => { alive = false; };
  }, []);

  const finalised = useMemo(
    () => records.filter(c => c.humanFinalDecision === true && c.decision),
    [records]
  );

  const departments = useMemo(() => [...new Set(finalised.map(c => c.department))].sort(), [finalised]);
  const roles = useMemo(() => [...new Set(finalised.map(c => c.role))].sort(), [finalised]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return finalised.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
      if (filters.role && c.role !== filters.role) return false;
      if (filters.department && c.department !== filters.department) return false;
      if (filters.decision && c.decision !== filters.decision) return false;
      if (c.finalScore < filters.minScore) return false;
      if (c.finalScore > filters.maxScore) return false;
      if (c.experience < filters.minExp) return false;
      if (c.experience > filters.maxExp) return false;
      if (c.interviewScore < filters.minInterview) return false;
      if (c.confidence < filters.minConfidence) return false;
      if (filters.biasSafeOnly && !c.biasSafe) return false;
      if (filters.dateFrom && c.decisionDate < filters.dateFrom) return false;
      if (filters.dateTo && c.decisionDate > filters.dateTo) return false;
      return true;
    });
  }, [finalised, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  const toggleSort = (key) => {
    setSort(s => s.key === key
      ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "desc" });
  };

  const handleViewReport = (candidate) => {
    setShowReportModal(candidate);
  };

  const handleExportReport = (candidate) => {
    setToast(`Exporting report for ${candidate.name}...`);
  };

  const onResetFilters = () => { setFilters(initialFilters); setPage(1); };

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const selectStyle = {
    appearance: "none",
    background: T.white,
    border: `1px solid ${T.navy7}`,
    borderRadius: 9,
    padding: "8px 30px 8px 11px",
    fontSize: 12,
    fontWeight: 600,
    color: T.navy2,
    fontFamily: FONT,
    outline: "none",
    minWidth: 150,
  };

  const inputStyle = {
    border: `1px solid ${T.navy7}`,
    borderRadius: 9,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: T.navy2,
    fontFamily: FONT,
    outline: "none",
    background: T.white,
  };

  const FilterField = ({ label, children }) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 120 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
      {children}
    </label>
  );

  const SortTh = ({ label, k, width }) => {
    const active = sort.key === k;
    return (
      <th onClick={() => toggleSort(k)}
        style={{
          padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700,
          color: active ? T.primary : T.navy4, letterSpacing: ".06em", textTransform: "uppercase",
          cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", width,
        }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}
          {active && (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
        </span>
      </th>
    );
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", height: "100%", width: "100%", overflow: "hidden", fontFamily: FONT }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        <div style={{
          marginLeft: SW, flex: 1, height: "100vh",
          overflowY: "auto", overflowX: "hidden",
          display: "flex", flexDirection: "column",
          transition: "margin-left .25s cubic-bezier(.4,0,.2,1)",
          background: T.bg,
        }}>
          <header style={{
            position: "sticky", top: 0, zIndex: 50,
            background: T.white, borderBottom: `1px solid ${T.navy7}`,
            padding: "13px 30px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 18, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <button
                onClick={() => setCollapsed(v => !v)}
                style={{
                  background: T.navy8, border: "none", borderRadius: 8,
                  padding: "7px 8px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <Menu size={16} color={T.navy3} />
              </button>
              <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  placeholder="Quick search candidates..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  style={{
                    width: "100%", paddingLeft: 36, paddingRight: 14,
                    paddingTop: 9, paddingBottom: 9,
                    border: `1px solid ${T.navy7}`, borderRadius: 10,
                    fontSize: 13, fontFamily: FONT, color: T.navy2,
                    background: T.navy8, outline: "none",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
              <NotificationBell />
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

          <main style={{ padding: "26px 30px 40px", flex: 1 }}>
            <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 30, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0, lineHeight: 1 }}>Final Evaluated Candidates</h1>
                </div>
                <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
                  Human-approved final candidate decisions · <span style={{ color: T.primary, fontWeight: 600 }}>{finalised.length} records</span>
                </p>
              </div>
            </div>

            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.navy7}`, background: T.white }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <SlidersHorizontal size={16} color={T.primary} />
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.navy0 }}>Filters</div>
                  <button
                    onClick={onResetFilters}
                    className="fe-btn fe-btn-ghost"
                    style={{ marginLeft: "auto", padding: "6px 10px" }}
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                  <FilterField label="Name or ID">
                    <input
                      value={filters.search}
                      onChange={e => updateFilter("search", e.target.value)}
                      placeholder="Search name, ID"
                      style={inputStyle}
                    />
                  </FilterField>

                  <FilterField label="Role">
                    <div style={{ position: "relative" }}>
                      <select value={filters.role} onChange={e => updateFilter("role", e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                        <option value="">All roles</option>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <ChevronDown size={13} color={T.navy4} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </FilterField>

                  <FilterField label="Department">
                    <div style={{ position: "relative" }}>
                      <select value={filters.department} onChange={e => updateFilter("department", e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                        <option value="">All departments</option>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                      <ChevronDown size={13} color={T.navy4} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </FilterField>

                  <FilterField label="Decision">
                    <div style={{ position: "relative" }}>
                      <select value={filters.decision} onChange={e => updateFilter("decision", e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                        <option value="">All decisions</option>
                        {Object.keys(DECISION_PILL).map(decision => <option key={decision} value={decision}>{decision}</option>)}
                      </select>
                      <ChevronDown size={13} color={T.navy4} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </FilterField>

                  <FilterField label="Final Score">
                    <div style={{ display: "flex", gap: 6 }}>
                      <input type="number" min="0" max="100" value={filters.minScore} onChange={e => updateFilter("minScore", Number(e.target.value) || 0)} style={{ ...inputStyle, width: "50%" }} />
                      <input type="number" min="0" max="100" value={filters.maxScore} onChange={e => updateFilter("maxScore", Number(e.target.value) || 100)} style={{ ...inputStyle, width: "50%" }} />
                    </div>
                  </FilterField>

                  <FilterField label="Experience">
                    <div style={{ display: "flex", gap: 6 }}>
                      <input type="number" min="0" value={filters.minExp} onChange={e => updateFilter("minExp", Number(e.target.value) || 0)} style={{ ...inputStyle, width: "50%" }} />
                      <input type="number" min="0" value={filters.maxExp} onChange={e => updateFilter("maxExp", Number(e.target.value) || 20)} style={{ ...inputStyle, width: "50%" }} />
                    </div>
                  </FilterField>

                  <FilterField label="Interview Min">
                    <input type="number" min="0" max="100" value={filters.minInterview} onChange={e => updateFilter("minInterview", Number(e.target.value) || 0)} style={inputStyle} />
                  </FilterField>

                  <FilterField label="Confidence Min">
                    <input type="number" min="0" max="100" value={filters.minConfidence} onChange={e => updateFilter("minConfidence", Number(e.target.value) || 0)} style={inputStyle} />
                  </FilterField>

                  <FilterField label="Date From">
                    <input type="date" value={filters.dateFrom} onChange={e => updateFilter("dateFrom", e.target.value)} style={inputStyle} />
                  </FilterField>

                  <FilterField label="Date To">
                    <input type="date" value={filters.dateTo} onChange={e => updateFilter("dateTo", e.target.value)} style={inputStyle} />
                  </FilterField>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "end", minHeight: 36, fontSize: 12, fontWeight: 700, color: T.navy3 }}>
                    <input type="checkbox" checked={filters.biasSafeOnly} onChange={e => updateFilter("biasSafeOnly", e.target.checked)} />
                    Bias safe only
                  </label>
                </div>
              </div>

              <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy0 }}>Decision Records</div>
                  <div style={{ fontSize: 12, color: T.navy4, marginTop: 2 }}>
                    Showing {pageRows.length} of {sorted.length}
                  </div>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: T.navy8 }}>
                      <SortTh label="ID" k="id" />
                      <SortTh label="Candidate" k="name" />
                      <SortTh label="Role" k="role" />
                      <SortTh label="Dept" k="department" />
                      <SortTh label="Exp" k="experience" />
                      <SortTh label="AI" k="aiScore" />
                      <SortTh label="Interview" k="interviewScore" />
                      <SortTh label="Final" k="finalScore" />
                      <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4 }}>Bias</th>
                      <SortTh label="Decision" k="decision" />
                      <SortTh label="Date" k="decisionDate" />
                      <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4 }}>Confidence</th>
                      <th style={{ padding: "11px 18px", textAlign: "right", fontSize: 11, fontWeight: 700, color: T.navy4 }}>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                      : pageRows.length === 0
                        ? (
                          <tr>
                            <td colSpan={13} style={{ padding: "60px 20px", textAlign: "center" }}>
                              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy1, marginBottom: 4 }}>No candidates match these filters</div>
                              <button className="fe-btn fe-btn-primary" onClick={onResetFilters}>Reset filters</button>
                            </td>
                          </tr>
                        )
                        : pageRows.map((c, i) => {
                          const isExpanded = expanded === c.id;
                          const altBg = i % 2 === 0 ? T.white : "rgba(243,244,246,0.4)";
                          return (
                            <Fragment key={c.id}>
                              <tr className="fe-row-hover"
                                style={{
                                  borderBottom: `1px solid ${T.navy7}`,
                                  background: altBg,
                                }}>
                                <td style={{ padding: "12px 18px", fontSize: 12, color: T.navy3, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{c.id}</td>
                                <td style={{ padding: "12px 18px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{c.ini}</div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: T.navy0 }}>{c.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy3 }}>{c.role}</td>
                                <td style={{ padding: "12px 18px" }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#5929D0", background: "#EDE9FE", padding: "3px 10px", borderRadius: 999 }}>{c.department}</span>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy2, fontWeight: 600 }}>{c.experience}y</td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy2, fontWeight: 600 }}>{c.aiScore}</td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy2, fontWeight: 600 }}>{c.interviewScore}</td>
                                <td style={{ padding: "12px 18px" }}>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: c.finalScore >= 85 ? T.success : c.finalScore >= 70 ? T.warning : T.error }}>{c.finalScore}</span>
                                </td>
                                <td style={{ padding: "12px 18px" }}>
                                  {c.biasSafe
                                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: T.cyan, background: T.cyanLight, padding: "3px 10px", borderRadius: 999 }}><Shield size={11} /> Safe</span>
                                    : <span style={{ fontSize: 11, fontWeight: 700, color: T.error, background: "#FEE2E2", padding: "3px 10px", borderRadius: 999 }}>Flagged</span>}
                                </td>
                                <td style={{ padding: "12px 18px" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 999, background: DECISION_PILL[c.decision].bg, color: DECISION_PILL[c.decision].color }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: DECISION_PILL[c.decision].dot }} />
                                    {c.decision}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12, color: T.navy3 }}>{c.decisionDate}</td>
                                <td style={{ padding: "12px 18px" }}><ConfidenceMeter value={c.confidence} /></td>
                                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                                  <button className="fe-btn fe-btn-primary" onClick={() => handleViewReport(c)} style={{ padding: "6px 16px" }}>
                                    <FileText size={12} /> Report
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={13} style={{ padding: "20px 24px", background: T.navy8 }}>
                                    <div><strong>Interviewer Notes:</strong> {c.interviewerNotes}</div>
                                    <div style={{ marginTop: 8 }}><strong>Recruiter Notes:</strong> {c.recruiterNotes}</div>
                                    <div style={{ marginTop: 8 }}><strong>AI Summary:</strong> {c.aiSummary}</div>
                                   </td>
                                 </tr>
                              )}
                            </Fragment>
                          );
                        })}
                  </tbody>
                </table>
              </div>

              {!loading && sorted.length > 0 && (
                <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 12, color: T.navy4 }}>
                    Page <strong style={{ color: T.navy1 }}>{page}</strong> of <strong style={{ color: T.navy1 }}>{totalPages}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="fe-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft size={13} /> Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setPage(n)} className={n === page ? "fe-btn fe-btn-primary" : "fe-btn"} style={{ minWidth: 34, justifyContent: "center" }}>
                        {n}
                      </button>
                    ))}
                    <button className="fe-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          <footer style={{
            padding: "14px 30px", borderTop: `1px solid ${T.navy7}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0, background: T.white,
          }}>
            <span style={{ fontSize: 11, color: T.navy5 }}>© 2025 Centific AI · Recruiter OS · Audit-ready hiring data</span>
            <span style={{ fontSize: 11, color: T.navy5 }}>Bias-aware · Human-final · Transparent</span>
          </footer>
        </div>

        {showReportModal && (
          <ReportDetailModal 
            candidate={showReportModal}
            onClose={() => setShowReportModal(null)}
            onExport={handleExportReport}
          />
        )}

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}
