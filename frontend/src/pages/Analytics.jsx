// src/pages/Analytics.jsx
import { useState } from "react";
import { 
  TrendingUp, Users, Clock, Award, Bell, Menu, Download, 
  Calendar, Filter, ChevronDown, Star, Briefcase, 
  CheckCircle, UserCheck, BarChart3, Activity 
} from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";

// Stat Card Component (matches Interviews page style)
const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div style={{ 
    background: T.white, 
    borderRadius: 16, 
    border: `1px solid ${T.navy7}`, 
    padding: "18px 20px", 
    flex: 1, 
    minWidth: 180, 
    boxShadow: "0 1px 2px rgba(0,0,0,.05)" 
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.navy4, textTransform: "uppercase", letterSpacing: ".03em" }}>{title}</span>
      <Icon size={20} color={color || T.primary} />
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, color: T.navy0, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 12, color: changeType === "up" ? T.success : T.error, display: "flex", alignItems: "center", gap: 4 }}>
      <TrendingUp size={12} /> {change} vs last month
    </div>
  </div>
);

// Funnel Step Component
const FunnelStep = ({ label, value, percentage, color }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy2 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value.toLocaleString()}</span>
    </div>
    <div style={{ height: 8, background: T.navy8, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
    <div style={{ fontSize: 11, color: T.navy4, marginTop: 4 }}>{percentage}% conversion rate</div>
  </div>
);

// Source Effectiveness Row
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

export default function Analytics() {
  const [collapsed, setCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState("This Quarter");

  // Mock data - in real app, this would come from API
  const kpiData = {
    timeToHire: { value: "18", change: "-2", changeType: "up", unit: "days" },
    offerAcceptance: { value: "86", change: "+4", changeType: "up", unit: "%" },
    applicantsPerRole: { value: "142", change: "+28", changeType: "up", unit: "" },
    candidateNPS: { value: "68", change: "+12", changeType: "up", unit: "" },
  };

  const funnelData = [
    { label: "Applications Received", value: 2840, percentage: 100, color: T.primary },
    { label: "AI Screened (Passed)", value: 1890, percentage: 67, color: T.cyan },
    { label: "Avatar Interviewed", value: 845, percentage: 45, color: T.pink },
    { label: "Final Round", value: 248, percentage: 29, color: "#F59E0B" },
    { label: "Offers Extended", value: 156, percentage: 63, color: T.success },
    { label: "Hired", value: 134, percentage: 86, color: "#10B981" },
  ];

  const sourceData = [
    { source: "LinkedIn", percentage: 42, count: 56, color: T.primary },
    { source: "Referrals", percentage: 28, count: 38, color: T.cyan },
    { source: "Naukri", percentage: 18, count: 24, color: T.pink },
    { source: "Internal Database", percentage: 12, count: 16, color: "#10B981" },
  ];

  const departmentData = [
    { dept: "Engineering", open: 12, interviews: 48, offers: 18, hired: 14, ttf: "22d" },
    { dept: "Product", open: 4, interviews: 16, offers: 3, hired: 2, ttf: "28d" },
    { dept: "Data & AI", open: 8, interviews: 32, offers: 9, hired: 8, ttf: "19d" },
    { dept: "Sales", open: 10, interviews: 40, offers: 11, hired: 9, ttf: "15d" },
    { dept: "Design", open: 5, interviews: 20, offers: 6, hired: 5, ttf: "21d" },
    { dept: "HR", open: 3, interviews: 12, offers: 4, hired: 3, ttf: "18d" },
  ];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="analytics" />
      <div style={{ 
        marginLeft: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED, 
        flex: 1, 
        height: "100vh", 
        overflowY: "auto", 
        transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" 
      }}>
        
        {/* Sticky Header */}
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
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.navy8, padding: "6px 14px", borderRadius: 8 }}>
              <Calendar size={14} color={T.navy4} />
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)} 
                style={{ background: "transparent", border: "none", fontSize: 12, fontWeight: 600, color: T.navy2, outline: "none", cursor: "pointer" }}
              >
                <option>This Quarter</option>
                <option>Last Quarter</option>
                <option>This Year</option>
                <option>Last Year</option>
              </select>
              <ChevronDown size={12} color={T.navy4} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <button style={{ 
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
              <Download size={14} /> Export
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
              <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0 }}>Recruiting Analytics</h1>
            </div>
            <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
              Strategic KPIs, funnel performance, and hiring effectiveness metrics
            </p>
          </div>

          {/* KPI Stats Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <StatCard 
              title="Time to Hire" 
              value={`${kpiData.timeToHire.value} ${kpiData.timeToHire.unit}`} 
              change={kpiData.timeToHire.change} 
              changeType={kpiData.timeToHire.changeType} 
              icon={Clock} 
              color={T.primary} 
            />
            <StatCard 
              title="Offer Acceptance" 
              value={`${kpiData.offerAcceptance.value}${kpiData.offerAcceptance.unit}`} 
              change={kpiData.offerAcceptance.change} 
              changeType={kpiData.offerAcceptance.changeType} 
              icon={Award} 
              color={T.success} 
            />
            <StatCard 
              title="Applicants / Role" 
              value={kpiData.applicantsPerRole.value} 
              change={kpiData.applicantsPerRole.change} 
              changeType={kpiData.applicantsPerRole.changeType} 
              icon={Users} 
              color={T.cyan} 
            />
            <StatCard 
              title="Candidate NPS" 
              value={kpiData.candidateNPS.value} 
              change={kpiData.candidateNPS.change} 
              changeType={kpiData.candidateNPS.changeType} 
              icon={Star} 
              color={T.pink} 
            />
          </div>

          {/* Two Column Layout - Funnel & Sources */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
            
            {/* Left: Hiring Funnel */}
            <div style={{ 
              background: T.white, 
              borderRadius: 16, 
              border: `1px solid ${T.navy7}`, 
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,.05)"
            }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>Hiring Funnel</h2>
                <p style={{ fontSize: 12, color: T.navy4 }}>Conversion rates from application to hire</p>
              </div>
              {funnelData.map((step, index) => (
                <FunnelStep 
                  key={index}
                  label={step.label}
                  value={step.value}
                  percentage={step.percentage}
                  color={step.color}
                />
              ))}
            </div>

            {/* Right: Source Effectiveness */}
            <div style={{ 
              background: T.white, 
              borderRadius: 16, 
              border: `1px solid ${T.navy7}`, 
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,.05)"
            }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>Source Effectiveness</h2>
                <p style={{ fontSize: 12, color: T.navy4 }}>Hire yield by sourcing channel</p>
              </div>
              {sourceData.map((source, index) => (
                <SourceRow 
                  key={index}
                  source={source.source}
                  percentage={source.percentage}
                  count={source.count}
                  color={source.color}
                />
              ))}
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div style={{ 
            background: T.white, 
            borderRadius: 16, 
            border: `1px solid ${T.navy7}`, 
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.navy7}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy0, marginBottom: 4 }}>Department Hiring Breakdown</h2>
                  <p style={{ fontSize: 12, color: T.navy4 }}>Open roles, interviews, and offers by department</p>
                </div>
                <button style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 6, 
                  background: T.navy8, 
                  border: `1px solid ${T.navy7}`, 
                  borderRadius: 8, 
                  padding: "6px 12px", 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: T.navy2, 
                  cursor: "pointer" 
                }}>
                  <Filter size={12} /> Filter
                </button>
              </div>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>Department</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>Open Roles</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>Active Interviews</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>Offers (QTD)</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>Hired</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 700, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em" }}>Time-to-Fill</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr 
                      key={index} 
                      style={{ 
                        borderBottom: `1px solid ${T.navy7}`,
                        background: index % 2 === 0 ? T.white : T.navy8
                      }}
                    >
                      <td style={{ padding: "14px 20px", fontWeight: 600, color: T.navy0 }}>{dept.dept}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.open}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.interviews}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.offers}</td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>
                        <span style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 4, 
                          padding: "2px 8px", 
                          borderRadius: 20, 
                          background: T.successLight, 
                          color: T.success, 
                          fontSize: 11, 
                          fontWeight: 600 
                        }}>
                          <CheckCircle size={10} /> {dept.hired}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", color: T.navy3 }}>{dept.ttf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer with Summary */}
            <div style={{ 
              padding: "12px 20px", 
              borderTop: `1px solid ${T.navy7}`, 
              background: T.navy8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: 11, color: T.navy4 }}>Showing {departmentData.length} departments</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.primary }}>Total Open Roles: {departmentData.reduce((acc, d) => acc + d.open, 0)}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}