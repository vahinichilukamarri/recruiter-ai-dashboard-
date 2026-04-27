// src/pages/Reports.jsx
import { useEffect, useState } from "react";
import { 
  Bell, Menu, Download, Eye, Filter, Search, ChevronDown,
  FileText, CheckCircle, AlertCircle, Clock, Star, TrendingUp,
  Calendar, User, Briefcase, Award, X, MessageSquare, Send
} from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import { api, formatDate, mapByCandidateId } from "../services/api";

// Report Card Component
const ReportCard = ({ report, onViewReport, onExport }) => {
  const getScoreColor = (score) => {
    if (score >= 85) return T.success;
    if (score >= 70) return "#D97706";
    return T.error;
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case "Escalated":
        return { bg: "#FFE4F7", color: T.pink, icon: AlertCircle, label: "Escalated to Final" };
      case "Completed":
        return { bg: T.successLight, color: T.success, icon: CheckCircle, label: "Completed" };
      default:
        return { bg: T.navy8, color: T.navy4, icon: Clock, label: status };
    }
  };

  const statusConfig = getStatusConfig(report.status);

  return (
    <div style={{ 
      background: T.white, 
      borderRadius: 14, 
      border: `1px solid ${T.navy7}`, 
      padding: 20,
      transition: "all .2s ease",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: T.navy5, marginBottom: 4, fontFamily: "monospace" }}>{report.id}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>{report.candidate}</div>
          <div style={{ fontSize: 12, color: T.navy4, display: "flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={12} /> {report.role}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(report.score) }}>
            {report.score}
          </div>
          <div style={{ fontSize: 10, color: T.navy5 }}>Overall Score</div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.navy4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Key Skills Assessment
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {Object.entries(report.skills).map(([skill, score]) => (
            <div key={skill} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.navy3, marginBottom: 4 }}>
                {skill.toUpperCase()}
              </div>
              <div style={{ height: 6, background: T.navy8, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ 
                  width: `${score}%`, 
                  height: "100%", 
                  background: score >= 80 ? T.success : score >= 60 ? T.primary : T.warning, 
                  borderRadius: 3 
                }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: getScoreColor(score) }}>
                {score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.navy7}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 5, 
            padding: "3px 10px", 
            borderRadius: 20, 
            fontSize: 10, 
            fontWeight: 600, 
            background: statusConfig.bg, 
            color: statusConfig.color 
          }}>
            <statusConfig.icon size={10} /> {statusConfig.label}
          </span>
          <span style={{ fontSize: 10, color: T.navy5, display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} /> {report.date}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onExport(report); }}
            style={{ 
              background: T.navy8, 
              border: "none", 
              borderRadius: 6, 
              padding: "5px 10px", 
              fontSize: 11, 
              fontWeight: 600, 
              color: T.navy2, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
            <Download size={12} /> PDF
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onViewReport(report); }}
            style={{ 
              background: T.primaryLight, 
              border: "none", 
              borderRadius: 6, 
              padding: "5px 12px", 
              fontSize: 11, 
              fontWeight: 600, 
              color: T.primary, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
            <Eye size={12} /> View
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      padding: "6px 14px",
      borderRadius: 20,
      border: "none",
      background: active ? T.primary : T.navy8,
      color: active ? "#fff" : T.navy3,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all .15s"
    }}>
    {label}
  </button>
);

// Feedback Modal Component
const FeedbackModal = ({ onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (feedback.trim() && rating > 0) {
      onSubmit({ feedback, rating });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (submitted) {
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
      }} onClick={onClose}>
        <div style={{
          background: T.white,
          borderRadius: 24,
          maxWidth: 500,
          width: "100%",
          padding: "40px 32px",
          textAlign: "center",
          position: "relative"
        }} onClick={(e) => e.stopPropagation()}>
          <CheckCircle size={48} color={T.success} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: T.navy0, marginBottom: 8 }}>Thank You!</h3>
          <p style={{ fontSize: 14, color: T.navy4, marginBottom: 20 }}>Your feedback has been submitted successfully.</p>
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
    );
  }

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
    }} onClick={onClose}>
      <div className="modal-animate" style={{
        background: T.white,
        borderRadius: 24,
        maxWidth: 550,
        width: "100%",
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MessageSquare size={24} color={T.primary} />
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>We Value Your Feedback</h2>
              <p style={{ fontSize: 13, color: T.navy4 }}>Your insights help us improve the interview experience</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px" }}>
          {/* Rating Section */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.navy2, marginBottom: 8, display: "block" }}>
              How would you rate your experience?
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    transition: "transform .15s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Star 
                    size={32} 
                    fill={(hoveredRating || rating) >= star ? T.warning : "none"}
                    color={T.warning}
                    style={{ transition: "all .15s" }}
                  />
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.navy5, marginTop: 8 }}>
              {rating === 1 && "Very Poor"}
              {rating === 2 && "Poor"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </div>
          </div>

          {/* Feedback Text Area */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.navy2, marginBottom: 8, display: "block" }}>
              Share your feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you liked or what we can improve..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: `1px solid ${T.navy7}`,
                borderRadius: 10,
                fontSize: 13,
                fontFamily: FONT,
                color: T.navy2,
                resize: "vertical",
                outline: "none",
                transition: "border-color .15s"
              }}
              onFocus={(e) => e.target.style.borderColor = T.primary}
              onBlur={(e) => e.target.style.borderColor = T.navy7}
            />
          </div>

          {/* Feedback Value Message */}
          <div style={{ 
            background: T.primaryLight, 
            borderRadius: 10, 
            padding: "12px 16px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: `1px solid ${T.primaryBorder}`
          }}>
            <Award size={20} color={T.primary} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 2 }}>
                Your feedback is valuable!
              </div>
              <div style={{ fontSize: 11, color: T.navy4 }}>
                Every review helps us enhance the platform and deliver better experiences.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              onClick={onClose}
              style={{ 
                padding: "10px 20px",
                background: T.white,
                border: `1px solid ${T.navy7}`,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: T.navy2,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!feedback.trim() || rating === 0}
              style={{ 
                padding: "10px 24px",
                background: (!feedback.trim() || rating === 0) ? T.navy6 : T.primary,
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: (!feedback.trim() || rating === 0) ? T.navy4 : "#fff",
                cursor: (!feedback.trim() || rating === 0) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Send size={14} /> Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Reports() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [reportsData, setReportsData] = useState([]);

  // Mock reports data - in real app, this would come from API
  const fallbackReports = [
    { 
      id: "RPT-101", candidate: "Priya Sharma", role: "ML Engineer", 
      date: "2026-04-20", score: 91, status: "Escalated",
      skills: { python: 92, ml: 88, sql: 78, algorithms: 85 },
      aiSummary: "Exceptional ML fundamentals. Strong problem-solving approach. Recommended for final round.",
      interviewNotes: "Demonstrated deep understanding of transformer architectures. Code was clean and well-structured."
    },
    { 
      id: "RPT-102", candidate: "Marcus Lee", role: "Product Manager", 
      date: "2026-04-21", score: 78, status: "Completed",
      skills: { strategy: 85, roadmap: 72, analytics: 70, communication: 88 },
      aiSummary: "Strong product sense but needs technical depth for AI products.",
      interviewNotes: "Good at stakeholder management. Would benefit from technical upskilling."
    },
    { 
      id: "RPT-103", candidate: "Anjali Reddy", role: "UX Designer", 
      date: "2026-04-19", score: 87, status: "Escalated",
      skills: { figma: 94, research: 86, wireframing: 82, prototyping: 89 },
      aiSummary: "Excellent design thinking. Portfolio demonstrates end-to-end product thinking.",
      interviewNotes: "Strong candidate for lead design role."
    },
    { 
      id: "RPT-104", candidate: "David Okafor", role: "Data Analyst", 
      date: "2026-04-18", score: 62, status: "Completed",
      skills: { sql: 65, excel: 70, stats: 48, python: 55 },
      aiSummary: "Basic analytics skills. Needs improvement in statistical reasoning.",
      interviewNotes: "Not recommended for senior role. Consider for junior position."
    },
    { 
      id: "RPT-105", candidate: "Sofia Hernandez", role: "Frontend Engineer", 
      date: "2026-04-22", score: 94, status: "Escalated",
      skills: { react: 96, typescript: 92, css: 88, testing: 85 },
      aiSummary: "Top performer. Excellent code quality and architecture understanding.",
      interviewNotes: "Strong hire recommendation."
    },
    { 
      id: "RPT-106", candidate: "Ayesha Khan", role: "DevOps Engineer", 
      date: "2026-04-23", score: 86, status: "Completed",
      skills: { kubernetes: 88, ci_cd: 85, aws: 82, terraform: 79 },
      aiSummary: "Solid DevOps experience. Good understanding of cloud infrastructure.",
      interviewNotes: "Recommended for senior DevOps role."
    },
  ];

  useEffect(() => {
    let alive = true;
    async function loadReports() {
      try {
        const [candidateRows, assessmentRows, interviewRows, agentRows] = await Promise.all([
          api.getCandidates(),
          api.getAssessments(),
          api.getInterviews(),
          api.getAgentOutputs(),
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
        const mapped = candidateRows.slice(0, 80).map((candidate) => {
          const assessment = assessments[candidate.id] || {};
          const interview = latestInterview[candidate.id] || {};
          const agent = agents[candidate.id] || {};
          const score = Math.round(interview.ai_score ?? assessment.mcq_score_percent ?? 0);
          return {
            id: `RPT-${String(candidate.id).padStart(3, "0")}`,
            candidateId: candidate.id,
            candidate: candidate.full_name,
            role: candidate.role_applied || "Unassigned",
            date: formatDate(interview.scheduled_date || assessment.submitted_at || candidate.created_at),
            score,
            status: interview.status === "Escalated" ? "Escalated" : "Completed",
            skills: {
              mcq: Math.round(assessment.mcq_score_percent ?? score),
              coding: Math.round(assessment.coding_score_percent ?? score),
              logic: Math.round(assessment.logic_score_percent ?? score),
              resume: Math.round(assessment.resume_match_percent ?? score),
            },
            aiSummary: agent.summary || "No AI summary available yet.",
            interviewNotes: interview.transcript_summary || "No interview notes available yet.",
          };
        });
        setReportsData(mapped);
      } catch (error) {
        setReportsData(fallbackReports);
      }
    }
    loadReports();
    return () => { alive = false; };
  }, []);

  // Filter reports
  const filteredReports = reportsData.filter(report => {
    const matchesSearch = report.candidate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: reportsData.length,
    escalated: reportsData.filter(r => r.status === "Escalated").length,
    completed: reportsData.filter(r => r.status === "Completed").length,
    avgScore: reportsData.length ? Math.round(reportsData.reduce((acc, r) => acc + r.score, 0) / reportsData.length) : 0,
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  const handleExportReport = (report) => {
    alert(`Exporting report for ${report.candidate}...`);
  };

  const handleBulkExport = () => {
    alert(`Exporting all ${filteredReports.length} reports...`);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    const candidateId = selectedReport?.candidateId || reportsData[0]?.candidateId || 1;
    try {
      await api.createFeedback({
        candidate_id: candidateId,
        rating: feedbackData.rating,
        decision_alignment: true,
        useful_output: true,
        bias_flagged: false,
        feedback_comment: feedbackData.feedback,
      });
    } catch (error) {
      console.warn(error.message);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="reports" />
      <div style={{ 
        marginLeft: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED, 
        flex: 1, 
        height: "100vh", 
        overflowY: "auto", 
        transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" 
      }}>
        
        {/* Header */}
        <header style={{ 
          position: "sticky", 
          top: 0, 
          zIndex: 50, 
          background: T.white, 
          borderBottom: `1px solid ${T.navy7}`, 
          padding: "13px 30px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <button 
              onClick={() => setCollapsed(v => !v)} 
              style={{ background: T.navy8, border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer" }}
            >
              <Menu size={16} color={T.navy3} />
            </button>
            <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
              <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                placeholder="Search reports by candidate, ID, or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: "100%", 
                  paddingLeft: 36, 
                  paddingRight: 14, 
                  paddingTop: 9, 
                  paddingBottom: 9, 
                  border: `1px solid ${T.navy7}`, 
                  borderRadius: 10, 
                  fontSize: 13, 
                  fontFamily: FONT, 
                  background: T.navy8, 
                  outline: "none" 
                }} 
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* Feedback Button */}
            <button 
              onClick={() => setShowFeedbackModal(true)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6, 
                background: T.primaryLight, 
                border: `1px solid ${T.primaryBorder}`, 
                borderRadius: 8, 
                padding: "8px 14px", 
                fontSize: 12, 
                fontWeight: 600, 
                color: T.primary, 
                cursor: "pointer",
                transition: "all .15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.primary;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.primaryLight;
                e.currentTarget.style.color = T.primary;
              }}
            >
              <MessageSquare size={14} /> Feedback
            </button>
            
            <button 
              onClick={handleBulkExport}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6, 
                background: T.white, 
                border: `1px solid ${T.navy7}`, 
                borderRadius: 8, 
                padding: "8px 14px", 
                fontSize: 12, 
                fontWeight: 600, 
                color: T.navy2, 
                cursor: "pointer" 
              }}>
              <Download size={14} /> Export All
            </button>
            
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={20} color={T.navy3} />
              <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: T.error, border: "2px solid #fff" }} />
            </div>
            <div style={{ width: 1, height: 26, background: T.navy7 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: "50%", 
                background: `linear-gradient(135deg,${T.primary},${T.pink})`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#fff", 
                fontWeight: 700 
              }}>
                A
              </div>
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
              <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0 }}>Evaluation Reports</h1>
            </div>
            <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
              View, analyze, and export candidate evaluation reports generated by the AI interviewer
            </p>
          </div>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ 
              background: T.white, 
              borderRadius: 14, 
              border: `1px solid ${T.navy7}`, 
              padding: "16px 20px", 
              flex: 1, 
              minWidth: 140 
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.navy4, marginBottom: 6 }}>Total Reports</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.navy0 }}>{stats.total}</div>
            </div>
            <div style={{ 
              background: T.white, 
              borderRadius: 14, 
              border: `1px solid ${T.navy7}`, 
              padding: "16px 20px", 
              flex: 1, 
              minWidth: 140 
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.navy4, marginBottom: 6 }}>Escalated to Final</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.pink }}>{stats.escalated}</div>
            </div>
            <div style={{ 
              background: T.white, 
              borderRadius: 14, 
              border: `1px solid ${T.navy7}`, 
              padding: "16px 20px", 
              flex: 1, 
              minWidth: 140 
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.navy4, marginBottom: 6 }}>Completed</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.success }}>{stats.completed}</div>
            </div>
            <div style={{ 
              background: T.white, 
              borderRadius: 14, 
              border: `1px solid ${T.navy7}`, 
              padding: "16px 20px", 
              flex: 1, 
              minWidth: 140 
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.navy4, marginBottom: 6 }}>Average Score</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.primary }}>{stats.avgScore}</div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ 
            background: T.white, 
            borderRadius: 12, 
            border: `1px solid ${T.navy7}`, 
            padding: "14px 20px", 
            marginBottom: 24, 
            display: "flex", 
            alignItems: "center", 
            gap: 16, 
            flexWrap: "wrap" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={14} color={T.navy4} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.navy4 }}>Status:</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <FilterChip label="All" active={statusFilter === "All"} onClick={() => setStatusFilter("All")} />
              <FilterChip label="Escalated" active={statusFilter === "Escalated"} onClick={() => setStatusFilter("Escalated")} />
              <FilterChip label="Completed" active={statusFilter === "Completed"} onClick={() => setStatusFilter("Completed")} />
            </div>
            <div style={{ marginLeft: "auto", fontSize: 12, color: T.navy5 }}>
              Showing {filteredReports.length} of {reportsData.length} reports
            </div>
          </div>

          {/* Reports Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 20 }}>
            {filteredReports.map(report => (
              <ReportCard 
                key={report.id}
                report={report}
                onViewReport={handleViewReport}
                onExport={handleExportReport}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div style={{ 
              background: T.white, 
              borderRadius: 16, 
              border: `1px solid ${T.navy7}`, 
              padding: "60px 40px", 
              textAlign: "center" 
            }}>
              <FileText size={48} color={T.navy5} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 8 }}>No reports found</h3>
              <p style={{ fontSize: 13, color: T.navy4 }}>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </main>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }} onClick={handleCloseModal}>
          <div style={{
            background: T.white,
            borderRadius: 20,
            maxWidth: 700,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative"
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: "24px 28px",
              borderBottom: `1px solid ${T.navy7}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: T.white,
              zIndex: 10
            }}>
              <div>
                <div style={{ fontSize: 12, color: T.navy5, marginBottom: 4 }}>{selectedReport.id}</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: T.navy0 }}>{selectedReport.candidate}</h2>
                <div style={{ fontSize: 13, color: T.navy4 }}>{selectedReport.role}</div>
              </div>
              <button onClick={handleCloseModal} style={{
                background: T.navy8,
                border: "none",
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <X size={18} color={T.navy3} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px 28px" }}>
              {/* Overall Score */}
              <div style={{
                background: `linear-gradient(135deg, ${T.primaryLight}, ${T.white})`,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.navy4, marginBottom: 8 }}>Overall Assessment Score</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: selectedReport.score >= 85 ? T.success : selectedReport.score >= 70 ? "#D97706" : T.error }}>
                  {selectedReport.score}
                </div>
                <div style={{ fontSize: 11, color: T.navy4, marginTop: 8 }}>
                  {selectedReport.score >= 85 ? "Excellent - Strongly recommended" : 
                   selectedReport.score >= 70 ? "Good - Consider for next round" : 
                   "Needs improvement - Not recommended"}
                </div>
              </div>

              {/* AI Summary */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy4, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  AI Evaluation Summary
                </div>
                <div style={{
                  background: T.navy8,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 13,
                  color: T.navy2,
                  lineHeight: 1.6
                }}>
                  {selectedReport.aiSummary}
                </div>
              </div>

              {/* Skills Breakdown */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Skills Assessment
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(selectedReport.skills).map(([skill, score]) => (
                    <div key={skill}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.navy2 }}>{skill.toUpperCase()}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: score >= 80 ? T.success : score >= 60 ? T.primary : T.warning }}>
                          {score}%
                        </span>
                      </div>
                      <div style={{ height: 8, background: T.navy8, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${score}%`, height: "100%", background: score >= 80 ? T.success : score >= 60 ? T.primary : T.warning, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interviewer Notes */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy4, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Interviewer Notes
                </div>
                <div style={{
                  background: T.white,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 13,
                  color: T.navy2,
                  lineHeight: 1.6,
                  border: `1px solid ${T.navy7}`
                }}>
                  {selectedReport.interviewNotes}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: `1px solid ${T.navy7}` }}>
                <button 
                  onClick={() => handleExportReport(selectedReport)}
                  style={{ 
                    flex: 1,
                    background: T.primary, 
                    border: "none", 
                    borderRadius: 10, 
                    padding: "10px 20px", 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: "#fff", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}>
                  <Download size={14} /> Download PDF Report
                </button>
                <button 
                  onClick={handleCloseModal}
                  style={{ 
                    flex: 1,
                    background: T.navy8, 
                    border: "none", 
                    borderRadius: 10, 
                    padding: "10px 20px", 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: T.navy2, 
                    cursor: "pointer" 
                  }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-animate { animation: modalSlideIn 0.25s ease forwards; }
      `}</style>
    </div>
  );
}
