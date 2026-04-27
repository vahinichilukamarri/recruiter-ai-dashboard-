// src/pages/Interviews.jsx
import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Filter, Search, Bell, Menu, ChevronRight, UserCheck, Briefcase } from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import { api, formatDate, mapByCandidateId } from "../services/api";

// Reusable Stat Card Component
const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <div style={{ 
    background: T.white, 
    borderRadius: 16, 
    border: `1px solid ${T.navy7}`, 
    padding: "18px 20px", 
    flex: 1, 
    minWidth: 160, 
    boxShadow: "0 1px 2px rgba(0,0,0,.05)" 
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.navy4, textTransform: "uppercase", letterSpacing: ".03em" }}>{title}</span>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: T.navy0, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 12, color: trend >= 0 ? T.success : T.error }}>
      {trend >= 0 ? "+" : ""}{trend}% from last week
    </div>
  </div>
);

const STATUS_PILL = {
  Scheduled: { bg: T.primaryLight, color: T.primary, icon: Calendar },
  "In Progress": { bg: "#FEF3C7", color: "#D97706", icon: Clock },
  Completed: { bg: T.successLight, color: T.success, icon: CheckCircle },
  Escalated: { bg: "#FFE4F7", color: T.pink, icon: AlertCircle },
};

// Sample data for interviews
const dummyInterviews = [
  { id: "SES-4421", candidate: "Priya Sharma", role: "ML Engineer", date: "2026-04-20", status: "Escalated" },
  { id: "SES-4422", candidate: "Marcus Lee", role: "Product Manager", date: "2026-04-21", status: "Completed" },
  { id: "SES-4423", candidate: "Anjali Reddy", role: "UX Designer", date: "2026-04-19", status: "Escalated" },
  { id: "SES-4424", candidate: "David Okafor", role: "Data Analyst", date: "2026-04-18", status: "Completed" },
  { id: "SES-4425", candidate: "Sofia Hernandez", role: "Frontend Engineer", date: "2026-04-22", status: "Escalated" },
  { id: "SES-4426", candidate: "James Whitfield", role: "Data Analyst", date: "2026-04-22", status: "Completed" },
  { id: "SES-4427", candidate: "Ayesha Khan", role: "ML Engineer", date: "2026-04-26", status: "Scheduled" },
  { id: "SES-4428", candidate: "Tom Nguyen", role: "DevOps Engineer", date: "2026-04-25", status: "In Progress" },
  { id: "SES-4429", candidate: "Sarah Johnson", role: "Frontend Engineer", date: "2026-04-27", status: "Scheduled" },
  { id: "SES-4430", candidate: "Michael Brown", role: "Backend Engineer", date: "2026-04-28", status: "Scheduled" },
];

// Sample data for upcoming interviews with applicant counts
const upcomingInterviewsData = [
  { 
    id: "SES-4427", 
    role: "ML Engineer", 
    date: "2026-04-26", 
    time: "10:00 AM", 
    candidates: [
      { id: "CND-001", name: "Ayesha Khan", time: "10:00 AM" },
      { id: "CND-002", name: "Rajesh Kumar", time: "11:30 AM" },
      { id: "CND-003", name: "Priya Singh", time: "02:00 PM" },
    ]
  },
  { 
    id: "SES-4428", 
    role: "DevOps Engineer", 
    date: "2026-04-25", 
    time: "02:30 PM", 
    candidates: [
      { id: "CND-004", name: "Tom Nguyen", time: "02:30 PM" },
      { id: "CND-005", name: "Lisa Chen", time: "04:00 PM" },
    ]
  },
  { 
    id: "SES-4429", 
    role: "Frontend Engineer", 
    date: "2026-04-27", 
    time: "11:00 AM", 
    candidates: [
      { id: "CND-006", name: "Sarah Johnson", time: "11:00 AM" },
      { id: "CND-007", name: "Mike Wilson", time: "01:00 PM" },
      { id: "CND-008", name: "Emma Davis", time: "03:30 PM" },
      { id: "CND-009", name: "Chris Evans", time: "05:00 PM" },
    ]
  },
  { 
    id: "SES-4430", 
    role: "Backend Engineer", 
    date: "2026-04-28", 
    time: "03:00 PM", 
    candidates: [
      { id: "CND-010", name: "Michael Brown", time: "03:00 PM" },
      { id: "CND-011", name: "Sophia Martinez", time: "04:30 PM" },
    ]
  },
  { 
    id: "SES-4431", 
    role: "Data Scientist", 
    date: "2026-04-29", 
    time: "09:30 AM", 
    candidates: [
      { id: "CND-012", name: "Emily Davis", time: "09:30 AM" },
      { id: "CND-013", name: "David Kim", time: "11:00 AM" },
      { id: "CND-014", name: "Rachel Green", time: "01:30 PM" },
      { id: "CND-015", name: "Monica Geller", time: "03:00 PM" },
    ]
  },
];

// Aggregate upcoming interviews by role and date
const aggregateUpcomingInterviews = (rows = upcomingInterviewsData) => {
  const aggregated = {};
  
  rows.forEach(interview => {
    const key = `${interview.role}_${interview.date}`;
    if (!aggregated[key]) {
      aggregated[key] = {
        role: interview.role,
        date: interview.date,
        candidates: []
      };
    }
    aggregated[key].candidates.push(...interview.candidates);
  });
  
  return Object.values(aggregated).map(item => ({
    role: item.role,
    date: item.date,
    totalApplicants: item.candidates.length,
    candidates: item.candidates
  }));
};

export default function Interviews() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedRole, setExpandedRole] = useState(null);
  const [interviews, setInterviews] = useState(dummyInterviews);
  const [upcomingRows, setUpcomingRows] = useState(upcomingInterviewsData);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadInterviews() {
      try {
        const [candidateRows, interviewRows] = await Promise.all([
          api.getCandidates(),
          api.getInterviews(),
        ]);
        if (!alive) return;

        const candidates = mapByCandidateId(candidateRows.map(candidate => ({ ...candidate, candidate_id: candidate.id })));
        const mapped = interviewRows.map((interview) => {
          const candidate = candidates[interview.candidate_id] || {};
          return {
            id: `SES-${String(interview.id).padStart(4, "0")}`,
            candidateId: interview.candidate_id,
            candidate: candidate.full_name || `Candidate ${interview.candidate_id}`,
            role: candidate.role_applied || "Unassigned",
            scheduledDate: interview.scheduled_date || null,
            date: formatDate(interview.scheduled_date || interview.created_at),
            time: interview.scheduled_time || "TBD",
            status: interview.status || "Scheduled",
          };
        });

        setInterviews(mapped);
        setUpcomingRows(mapped
          .filter(iv => iv.status === "Scheduled" && iv.scheduledDate)
          .map(iv => ({
            id: iv.id,
            role: iv.role,
            date: iv.scheduledDate,
            candidates: [{ id: `CND-${iv.candidateId}`, name: iv.candidate, time: iv.time }],
          })));
        setApiError("");
      } catch (error) {
        setApiError("Backend is not reachable yet. Showing sample interviews until it starts.");
      }
    }
    loadInterviews();
    return () => { alive = false; };
  }, []);

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         interview.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get aggregated upcoming interviews
  const upcomingInterviews = useMemo(() => aggregateUpcomingInterviews(upcomingRows), [upcomingRows]);
  
  // Filter upcoming interviews by date
  const filteredUpcomingInterviews = dateFilter 
    ? upcomingInterviews.filter(item => item.date === dateFilter)
    : upcomingInterviews;

  const stats = {
    total: interviews.length,
    completed: interviews.filter(i => i.status === "Completed").length,
    escalated: interviews.filter(i => i.status === "Escalated").length,
    scheduled: interviews.filter(i => i.status === "Scheduled").length,
    inProgress: interviews.filter(i => i.status === "In Progress").length,
  };

  // Get unique dates for filter
  const uniqueDates = [...new Set(upcomingInterviews.map(item => item.date))].sort();

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="interviews" />
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
            <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
              <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                placeholder="Search interviews by candidate or ID..." 
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

        {/* Main Content Area with Two Columns */}
        <div style={{ display: "flex", gap: 24, padding: "28px 30px" }}>
          
          {/* Left Column - Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {/* Page Title */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 4, height: 28, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
                <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0 }}>Interview Sessions</h1>
              </div>
              <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
                Monitor avatar-conducted technical interviews and track completion status
              </p>
            </div>
            {apiError && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#FEF3C7", color: "#92400E", fontSize: 12, fontWeight: 600 }}>{apiError}</div>}

            {/* Stats Row */}
            <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              <StatCard title="Total Interviews" value={stats.total} trend={12} icon={Users} color={T.primary} />
              <StatCard title="Completed" value={stats.completed} trend={8} icon={CheckCircle} color={T.success} />
              <StatCard title="Escalated to Final" value={stats.escalated} trend={-2} icon={AlertCircle} color={T.pink} />
              <StatCard title="Scheduled" value={stats.scheduled} trend={15} icon={Calendar} color={T.cyan} />
            </div>

            {/* Filter Bar */}
            <div style={{ 
              background: T.white, 
              borderRadius: 12, 
              border: `1px solid ${T.navy7}`, 
              padding: "12px 20px", 
              marginBottom: 20, 
              display: "flex", 
              alignItems: "center", 
              gap: 16, 
              flexWrap: "wrap" 
            }}>
              <Filter size={14} color={T.navy4} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.navy4 }}>Status:</span>
              {["All", "Scheduled", "In Progress", "Completed", "Escalated"].map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusFilter(status)} 
                  style={{ 
                    padding: "4px 12px", 
                    borderRadius: 20, 
                    border: "none", 
                    background: statusFilter === status ? T.primary : T.navy8, 
                    color: statusFilter === status ? "#fff" : T.navy3, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: "pointer" 
                  }}
                >
                  {status}
                </button>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 12, color: T.navy5 }}>
                {filteredInterviews.length} sessions
              </div>
            </div>

            {/* Interviews Table */}
            <div style={{ 
              background: T.white, 
              borderRadius: 16, 
              border: `1px solid ${T.navy7}`, 
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              marginBottom: 24
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead style={{ background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
                    <tr>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>SESSION ID</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>CANDIDATE</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>ROLE</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>DATE</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterviews.map((interview, index) => {
                      const Status = STATUS_PILL[interview.status] || STATUS_PILL.Scheduled;
                      return (
                        <tr 
                          key={interview.id} 
                          style={{ 
                            borderBottom: `1px solid ${T.navy7}`,
                            background: index % 2 === 0 ? T.white : T.navy8
                          }}
                        >
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: T.navy3 }}>{interview.id}</td>
                          <td style={{ padding: "14px 20px", fontWeight: 600, color: T.navy0 }}>{interview.candidate}</td>
                          <td style={{ padding: "14px 20px", color: T.navy3 }}>{interview.role}</td>
                          <td style={{ padding: "14px 20px", color: T.navy3 }}>{interview.date}</td>
                          <td style={{ padding: "14px 20px" }}>
                            {Status && (
                              <span style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: 6, 
                                padding: "4px 10px", 
                                borderRadius: 20, 
                                fontSize: 11, 
                                fontWeight: 600, 
                                background: Status.bg, 
                                color: Status.color 
                              }}>
                                <Status.icon size={12} /> {interview.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Empty State */}
              {filteredInterviews.length === 0 && (
                <div style={{ padding: "60px 40px", textAlign: "center" }}>
                  <Calendar size={48} color={T.navy5} style={{ marginBottom: 16 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: T.navy0, marginBottom: 4 }}>No interviews found</div>
                  <div style={{ fontSize: 12, color: T.navy4 }}>Try adjusting your search or filter criteria</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Upcoming Interviews Sidebar */}
          <div style={{ width: 360, flexShrink: 0, position: "sticky", top: 88, alignSelf: "flex-start" }}>
            <div style={{ 
              background: T.white, 
              borderRadius: 16, 
              border: `1px solid ${T.navy7}`, 
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              maxHeight: "calc(100vh - 132px)",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Sidebar Header */}
              <div style={{ 
                padding: "20px 20px 16px", 
                borderBottom: `1px solid ${T.navy7}`,
                background: T.white
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Calendar size={18} color={T.primary} />
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0 }}>Upcoming Interviews</h2>
                </div>
                <p style={{ fontSize: 12, color: T.navy4, marginLeft: 28 }}>
                  Scheduled avatar interviews with applicant counts
                </p>
              </div>

              {/* Date Filter */}
              <div style={{ 
                padding: "16px 20px", 
                borderBottom: `1px solid ${T.navy7}`,
                background: T.navy8
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Calendar size={14} color={T.primary} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.navy2 }}>Filter by Date:</span>
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${T.navy6}`,
                      background: T.white,
                      fontSize: 12,
                      fontFamily: FONT,
                      color: T.navy2,
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="">All Dates</option>
                    {uniqueDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `1px solid ${T.navy6}`,
                        background: T.white,
                        fontSize: 11,
                        cursor: "pointer",
                        color: T.error
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Upcoming Interviews List */}
              <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
                {filteredUpcomingInterviews.length > 0 ? (
                  filteredUpcomingInterviews.map((item, index) => (
                    <div key={`${item.role}_${item.date}`}>
                      <div 
                        style={{ 
                          padding: "16px 20px",
                          borderBottom: `1px solid ${T.navy7}`,
                          cursor: "pointer",
                          transition: "background .15s ease"
                        }}
                        onClick={() => setExpandedRole(expandedRole === `${item.role}_${item.date}` ? null : `${item.role}_${item.date}`)}
                        onMouseEnter={(e) => e.currentTarget.style.background = T.navy8}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <Briefcase size={14} color={T.primary} />
                              <span style={{ fontSize: 14, fontWeight: 700, color: T.navy0 }}>{item.role}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                color: T.navy4
                              }}>
                                <Calendar size={11} />
                                <span>{formatDate(item.date)}</span>
                              </div>
                              <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 6,
                                padding: "2px 8px",
                                borderRadius: 12,
                                background: T.primaryLight
                              }}>
                                <Users size={11} color={T.primary} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>
                                  {item.totalApplicants} applicant{item.totalApplicants !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight 
                            size={16} 
                            color={T.navy4} 
                            style={{ 
                              transform: expandedRole === `${item.role}_${item.date}` ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform .2s ease"
                            }} 
                          />
                        </div>
                      </div>
                      
                      {/* Expanded Candidate List */}
                      {expandedRole === `${item.role}_${item.date}` && (
                        <div style={{ 
                          padding: "12px 20px 16px 48px", 
                          background: T.navy8,
                          borderBottom: `1px solid ${T.navy7}`
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: T.navy4, marginBottom: 10 }}>
                            Candidate List
                          </div>
                          {item.candidates.map((candidate, idx) => (
                            <div 
                              key={candidate.id}
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                padding: "8px 0",
                                borderBottom: idx < item.candidates.length - 1 ? `1px solid ${T.navy7}` : "none"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <UserCheck size={12} color={T.success} />
                                <span style={{ fontSize: 12, color: T.navy2 }}>{candidate.name}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: T.navy4 }}>
                                <Clock size={10} />
                                <span>{candidate.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <Calendar size={32} color={T.navy5} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 13, color: T.navy4 }}>No upcoming interviews</div>
                    <div style={{ fontSize: 11, color: T.navy5, marginTop: 4 }}>for the selected date</div>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div style={{ 
                padding: "14px 20px", 
                borderTop: `1px solid ${T.navy7}`, 
                background: T.navy8,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 11, color: T.navy4 }}>
                  Total Applicants: {filteredUpcomingInterviews.reduce((sum, item) => sum + item.totalApplicants, 0)}
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div style={{ 
              background: `linear-gradient(135deg, ${T.primary}, ${T.pink})`,
              borderRadius: 16, 
              padding: "20px",
              marginTop: 20,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(89,41,208,.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <CheckCircle size={24} />
                <div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Completion Rate</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>87%</div>
                </div>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.2)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ width: "87%", height: "100%", background: "#fff", borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                +12% improvement from last quarter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
