// src/pages/Desktop.jsx
// Updated: Desktop icons (left column) + both widgets moved to right side

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Desktop.css";

export default function Desktop() {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const rootRef = useRef(null);
  useEffect(() => { rootRef.current?.setAttribute('data-page-ready', 'true'); }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");

  const formatWidgetDate = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // ── Taskbar items ─────────────────────────────────────────────
  const taskbarItems = [
    { id: "win",       label: "Start"                                              },
    { id: "search",    label: "Search"                                             },
    { id: "paint",     label: "Paint"                                              },
    { id: "folder",    label: "File Explorer"                                      },
    { id: "store",     label: "Store"                                              },
    { id: "vscode",    label: "VS Code"                                            },
    { id: "slack",     label: "Slack"                                              },
    { id: "teams",     label: "Microsoft Teams"                                    },
    { id: "mail",      label: "Mail"                                               },
    { id: "recruiter", label: "Recruiter Dashboard", action: () => navigate("/dashboard"), active: true },
  ];

  // ── Desktop icon list ─────────────────────────────────────────
  const desktopIcons = [
    { id: "pc",        label: "This PC"    },
    { id: "recycle",   label: "Recycle Bin"},
    { id: "documents", label: "Documents"  },
    { id: "downloads", label: "Downloads"  },
    { id: "adobe",     label: "Adobe"      },
    { id: "photoshop", label: "Photoshop"  },
    { id: "network",   label: "Network"    },
  ];

  // ── Desktop Icon SVGs ─────────────────────────────────────────
  const DesktopIconSvg = ({ id }) => {
    switch (id) {

      case "pc":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="pcScreen" x1="7" y1="9" x2="37" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e40af" stopOpacity=".92"/>
                <stop offset="100%" stopColor="#0f172a" stopOpacity=".96"/>
              </linearGradient>
            </defs>
            {/* Monitor body */}
            <rect x="4" y="6" width="36" height="24" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2"/>
            {/* Screen */}
            <rect x="7" y="9" width="30" height="18" rx="1.5" fill="url(#pcScreen)"/>
            {/* Windows logo on screen */}
            <rect x="17" y="13" width="4" height="4" rx=".5" fill="#f25022" opacity=".9"/>
            <rect x="22" y="13" width="4" height="4" rx=".5" fill="#7fba00" opacity=".9"/>
            <rect x="17" y="18" width="4" height="4" rx=".5" fill="#00a4ef" opacity=".9"/>
            <rect x="22" y="18" width="4" height="4" rx=".5" fill="#ffb900" opacity=".9"/>
            {/* Stand */}
            <rect x="18" y="30" width="8" height="3" rx="1" fill="#94a3b8"/>
            <rect x="13" y="33" width="18" height="2.5" rx="1.2" fill="#cbd5e1"/>
          </svg>
        );

      case "recycle":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="binGrad" x1="10" y1="10" x2="34" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#93c5fd"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            {/* Bin body */}
            <path d="M11 17h22l-2.5 20a2 2 0 01-2 1.8H15.5a2 2 0 01-2-1.8L11 17z"
              fill="url(#binGrad)" stroke="#60a5fa" strokeWidth=".8"/>
            {/* Lid */}
            <rect x="9" y="13.5" width="26" height="4" rx="2" fill="#60a5fa" stroke="#93c5fd" strokeWidth=".8"/>
            {/* Handle */}
            <path d="M18 13.5v-2a2 2 0 014 0v2" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            {/* Lines */}
            <line x1="18" y1="20" x2="17" y2="34" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="22" y1="20" x2="22" y2="34" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="26" y1="20" x2="27" y2="34" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        );

      case "documents":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* Folder back */}
            <path d="M6 14a3 3 0 013-3h9l3 3h13a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V14z"
              fill="#fbbf24"/>
            {/* Folder body */}
            <path d="M6 18h32v12a3 3 0 01-3 3H9a3 3 0 01-3-3V18z"
              fill="#fcd34d"/>
            {/* Doc lines */}
            <rect x="14" y="22" width="16" height="1.5" rx=".75" fill="rgba(146,64,14,.4)"/>
            <rect x="14" y="25" width="12" height="1.5" rx=".75" fill="rgba(146,64,14,.4)"/>
            <rect x="14" y="28" width="14" height="1.5" rx=".75" fill="rgba(146,64,14,.4)"/>
          </svg>
        );

      case "downloads":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M6 14a3 3 0 013-3h9l3 3h13a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V14z"
              fill="#34d399"/>
            <path d="M6 18h32v12a3 3 0 01-3 3H9a3 3 0 01-3-3V18z"
              fill="#6ee7b7"/>
            {/* Down arrow */}
            <path d="M22 20v9M18 26l4 4 4-4"
              stroke="rgba(6,78,59,.65)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );

      case "adobe":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="adobeGrad" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF2020"/>
                <stop offset="100%" stopColor="#B30000"/>
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="36" height="36" rx="8" fill="url(#adobeGrad)"/>
            {/* Adobe "A" */}
            <path d="M22 10l9.5 23h-5.2l-2-5.5h-4.8L17.5 33h-5.2L22 10z" fill="white"/>
            <path d="M20.6 24h2.8l-1.4-4.5L20.6 24z" fill="#CC0000"/>
          </svg>
        );

      case "photoshop":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="4" y="4" width="36" height="36" rx="8" fill="#001E36"/>
            <text
              x="9" y="30"
              fontFamily="'Arial Black', Arial, sans-serif"
              fontWeight="900"
              fontSize="19"
              fill="#31A8FF"
            >Ps</text>
          </svg>
        );

      case "network":
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="4" y="4" width="36" height="36" rx="8" fill="#1e293b" stroke="rgba(255,255,255,.1)" strokeWidth=".8"/>
            {/* Globe */}
            <circle cx="22" cy="22" r="13" stroke="#38bdf8" strokeWidth="1.5" fill="none"/>
            <ellipse cx="22" cy="22" rx="6" ry="13" stroke="#38bdf8" strokeWidth="1.2" fill="none"/>
            <line x1="9" y1="22" x2="35" y2="22" stroke="#38bdf8" strokeWidth="1.2"/>
            <line x1="12" y1="15" x2="32" y2="15" stroke="#38bdf8" strokeWidth="1" opacity=".6"/>
            <line x1="12" y1="29" x2="32" y2="29" stroke="#38bdf8" strokeWidth="1" opacity=".6"/>
          </svg>
        );

      default: return null;
    }
  };

  // ── Taskbar SVG Icons ──────────────────────────────────────────
  const WinIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="2"    y="2"    width="9.5" height="9.5" fill="#f25022"/>
      <rect x="12.5" y="2"    width="9.5" height="9.5" fill="#7fba00"/>
      <rect x="2"    y="12.5" width="9.5" height="9.5" fill="#00a4ef"/>
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#ffb900"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.88)" strokeWidth="2"/>
      <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="rgba(255,255,255,0.88)" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );

  const PaintIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#22C55E"/>
      <path d="M7 17l3-7 3 7M8.5 14h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="7" r="2" fill="white" opacity="0.9"/>
    </svg>
  );

  const FolderIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="#ffb900"/>
      <path d="M2 10h20v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7z" fill="#ffd040"/>
    </svg>
  );

  const StoreIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#22C55E"/>
      <path d="M7 8h10l-1.5 8H8.5L7 8z" fill="white" opacity="0.9"/>
      <path d="M5 8h14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9.5" cy="18.5" r="1" fill="#22C55E"/>
      <circle cx="14.5" cy="18.5" r="1" fill="#22C55E"/>
    </svg>
  );

  const VSCodeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2979ff"/>
          <stop offset="100%" stopColor="#0d47a1"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="16" fill="url(#vg)"/>
      <path d="M70 15L42 47l-14-11L15 44l18 15L15 74l13 8 14-11 28 32 17-8V23L70 15z" fill="white" opacity="0.95"/>
    </svg>
  );

  const SlackIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5.5"  y="2"    width="3" height="8"  rx="1.5" fill="#e01e5a"/>
      <rect x="5.5"  y="11"   width="3" height="3"  rx="1.5" fill="#e01e5a"/>
      <rect x="2"    y="5.5"  width="8" height="3"  rx="1.5" fill="#36c5f0"/>
      <rect x="11"   y="5.5"  width="3" height="3"  rx="1.5" fill="#36c5f0"/>
      <rect x="15.5" y="14"   width="3" height="8"  rx="1.5" fill="#2eb67d"/>
      <rect x="15.5" y="11"   width="3" height="3"  rx="1.5" fill="#2eb67d"/>
      <rect x="14"   y="15.5" width="8" height="3"  rx="1.5" fill="#ecb22e"/>
      <rect x="11"   y="15.5" width="3" height="3"  rx="1.5" fill="#ecb22e"/>
    </svg>
  );

  const TeamsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="11" y="2" width="11" height="11" rx="2.5" fill="#5059C9"/>
      <path d="M13.5 5h6M16.5 5v5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="2" y="10" width="13" height="12" rx="3" fill="#4B53BC"/>
      <circle cx="8.5" cy="7.5" r="2.8" fill="#4B53BC"/>
      <path d="M5 14.5h7M8.5 14.5v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const MailIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0078D4"/>
      <rect x="4" y="7" width="16" height="11" rx="1.5" fill="white" opacity="0.15"/>
      <path d="M4 8l8 6 8-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <rect x="4" y="8" width="16" height="10" rx="1.5" stroke="white" strokeWidth="1.5" fill="none"/>
    </svg>
  );

  const RecruiterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 6.5 6.5 6.5 13h11C17.5 6.5 12 2 12 2z" fill="white"/>
      <rect x="9" y="13" width="6" height="4" rx="1" fill="rgba(255,255,255,0.75)"/>
      <path d="M9.5 17l-2 3.5h9l-2-3.5" fill="rgba(255,255,255,0.45)"/>
      <circle cx="12" cy="9" r="1.8" fill="#818cf8"/>
    </svg>
  );

  const WifiIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55a11 11 0 0114.08 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M1.42 9a16 16 0 0121.16 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M8.53 16.11a6 6 0 016.95 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="20" r="1" fill="white"/>
    </svg>
  );

  const VolumeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white"/>
      <path d="M15.54 8.46a5 5 0 010 7.07" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M19.07 4.93a10 10 0 010 14.14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );

  const BatteryIcon = () => (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
      <rect x="0.5" y="1.5" width="18" height="11" rx="2" stroke="white" strokeWidth="1.3"/>
      <rect x="19" y="4.5" width="2.5" height="5" rx="1" fill="white" opacity="0.5"/>
      <rect x="2" y="3" width="13" height="8" rx="1" fill="white"/>
    </svg>
  );

  const getTaskbarIcon = (id) => {
    switch (id) {
      case "win":       return <WinIcon />;
      case "search":    return <SearchIcon />;
      case "paint":     return <PaintIcon />;
      case "folder":    return <FolderIcon />;
      case "store":     return <StoreIcon />;
      case "vscode":    return <VSCodeIcon />;
      case "slack":     return <SlackIcon />;
      case "teams":     return <TeamsIcon />;
      case "mail":      return <MailIcon />;
      case "recruiter": return <RecruiterIcon />;
      default:          return null;
    }
  };

  // ── Widget data ────────────────────────────────────────────────
  const tasks = [
    { label: "Review 12 applications",           done: true,  priority: "high"   },
    { label: "Schedule interviews for shortlist", done: false, priority: "high"   },
    { label: "Send offer letter to Candidate #4", done: false, priority: "high"   },
    { label: "Update JD for Backend role",        done: false, priority: "medium" },
    { label: "Sync with team lead on headcount",  done: false, priority: "medium" },
    { label: "Export hiring report (Q2)",         done: false, priority: "low"    },
  ];

  const meetings = [
    { time: "09:00 AM", label: "Resume Screening",     color: "#60a5fa" },
    { time: "10:30 AM", label: "Candidate Interview",  color: "#4ade80" },
    { time: "12:00 PM", label: "Hiring Sync",          color: "#fbbf24" },
    { time: "02:30 PM", label: "Tech Panel Review",    color: "#c084fc" },
    { time: "05:00 PM", label: "Final Round Decision", color: "#fb7185" },
  ];

  const completed = tasks.filter(t => t.done).length;
  const pct       = (completed / tasks.length) * 100;

  const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  const priorityBg    = { high: "rgba(239,68,68,0.18)", medium: "rgba(245,158,11,0.18)", low: "rgba(34,197,94,0.18)" };

  return (
    <div ref={rootRef} className="desktop">

      {/* ── Wallpaper ── */}
      <div className="desktop-wallpaper">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90"
          alt="Wallpaper"
          className="desktop-wallpaper-img"
        />
        <div className="desktop-vignette" />
      </div>

      {/* ── Desktop Surface ── */}
      <div className="desktop-surface">

        {/* Left column — Desktop icons */}
        <div className="desktop-icons-grid">
          {desktopIcons.map((icon) => (
            <div
              key={icon.id}
              id={`desktop-icon-${icon.id}`}
              data-testid={`desktop-icon-${icon.id}`}
              className="d-icon"
              onMouseEnter={() => setHoveredIcon(icon.id)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <DesktopIconSvg id={icon.id} />
              <span className="d-icon-label">{icon.label}</span>
            </div>
          ))}
        </div>

        {/* Right column — Widgets stacked */}
        <div className="desktop-widgets-right">

          {/* Today's Schedule */}
          <div className="dw-card">
            <div className="dw-card-accent dw-accent-blue" />
            <div className="dw-head">
              <div className="dw-icon-box dw-icon-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8"/>
                  <line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth="1.8"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="7" y="13" width="3" height="3" rx="0.5" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="dw-title">Today's Schedule</div>
                <div className="dw-sub">{formatWidgetDate(currentTime)}</div>
              </div>
            </div>
            <div className="dw-divider" />
            {meetings.map((m, i) => (
              <div
                key={i}
                className="dw-row"
                style={{ borderBottom: i < meetings.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
              >
                <div
                  className="dw-time-pill"
                  style={{ background: m.color + "1a", border: `1px solid ${m.color}44` }}
                >
                  <span className="dw-dot" style={{ background: m.color }} />
                  <span className="dw-time" style={{ color: m.color }}>{m.time}</span>
                </div>
                <span className="dw-meeting-label">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Task Tracker */}
          <div className="dw-card">
            <div className="dw-card-accent dw-accent-green" />
            <div className="dw-head">
              <div className="dw-icon-box dw-icon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8"/>
                </svg>
              </div>
              <div>
                <div className="dw-title">Task Tracker</div>
                <div className="dw-sub">{completed}/{tasks.length} completed today</div>
              </div>
            </div>
            <div className="dw-divider" />
            <div className="dw-progress-row">
              <div className="dw-progress-bg">
                <div className="dw-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="dw-pct">{Math.round(pct)}%</span>
            </div>
            <div style={{ height: 6 }} />
            {tasks.map((t, i) => (
              <div
                key={i}
                className="dw-task-row"
                style={{
                  opacity: t.done ? 0.52 : 1,
                  borderBottom: i < tasks.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  className="dw-check"
                  style={{
                    borderColor: t.done ? "#4ade80" : "rgba(255,255,255,0.28)",
                    background:  t.done ? "rgba(74,222,128,0.22)" : "transparent",
                  }}
                >
                  {t.done && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span
                  className="dw-task-label"
                  style={{ textDecoration: t.done ? "line-through" : "none" }}
                >
                  {t.label}
                </span>
                <span
                  className="dw-badge"
                  style={{ color: priorityColor[t.priority], background: priorityBg[t.priority] }}
                >
                  {t.priority.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Taskbar ── */}
      <div className="desktop-taskbar">
        <div className="taskbar-dock">
          {taskbarItems.map((item) => (
            <div
              key={item.id}
              id={`desktop-taskbar-${item.id}`}
              data-testid={`desktop-taskbar-${item.id}`}
              {...(item.id === "recruiter" ? { "data-el-id": "EL-001" } : {})}
              className={`taskbar-btn${item.active ? " taskbar-btn-active" : ""}${hoveredIcon === item.id ? " taskbar-btn-hovered" : ""}`}
              onMouseEnter={() => setHoveredIcon(item.id)}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={item.action || undefined}
              title={item.label}
            >
              {getTaskbarIcon(item.id)}
              {hoveredIcon === item.id && (
                <div className="taskbar-tooltip">{item.label}</div>
              )}
            </div>
          ))}
        </div>

        <div className="taskbar-tray">
          <div className="tray-icons">
            <WifiIcon />
            <VolumeIcon />
            <BatteryIcon />
          </div>
          <div className="tray-clock">
            <div className="tray-time">{formatTime(currentTime)}</div>
            <div className="tray-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

    </div>
  );
}