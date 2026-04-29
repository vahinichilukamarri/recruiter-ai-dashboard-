// Sidebar.jsx
// Premium recruiter sidebar — responsive, smooth, audit-ready
// Drop-in compatible with Dashboard.jsx, FinalEvaluated.jsx, etc.

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardCheck,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
} from "lucide-react";

/* ─── EXPORTS REQUIRED BY Dashboard.jsx & FinalEvaluated.jsx ─── */
export const FONT = "'Poppins','Inter',sans-serif";

export const SIDEBAR_W_EXPANDED = 250;
export const SIDEBAR_W_COLLAPSED = 72;
export const MOBILE_BREAKPOINT = 900;

export const T = {
  bg:    "#F7F8FC",
  white: "#FFFFFF",

  navy0: "#111827",
  navy1: "#1F2937",
  navy2: "#374151",
  navy3: "#4B5563",
  navy4: "#6B7280",
  navy5: "#9CA3AF",
  navy6: "#D1D5DB",
  navy7: "#E5E7EB",
  navy8: "#F3F4F6",

  primary:       "#5929D0",
  primaryLight:  "#EDE9FE",
  primaryBorder: "#C4B5FD",

  pink:      "#CF008B",
  pinkLight: "#FCE7F3",
  cyan:      "#22D3EE",
  cyanLight: "#CFFAFE",

  success: "#16A34A",
  warning: "#D97706",
  error:   "#DC2626",
};

/* Hook: track viewport size for responsive width consumers */
export function useSidebarWidth(collapsed) {
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return SIDEBAR_W_EXPANDED;
    if (window.innerWidth < MOBILE_BREAKPOINT) return 0;
    return collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;
  });
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) setWidth(0);
      else setWidth(collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [collapsed]);
  return width;
}

/* ─── DUPLICATE-MOUNT GUARD ─── */
let __sidebarMountCount = 0;

/* ─── ONE-TIME STYLE INJECTION ─── */
function injectSidebarStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector('style[data-centific="sidebar"]')) return;
  const el = document.createElement("style");
  el.setAttribute("data-centific", "sidebar");
  el.textContent = `
    @keyframes sb-fadeSlide {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .sb-label { animation: sb-fadeSlide .22s ease forwards; }

    .sb-nav-item {
      position: relative;
      transition:
        background-color .18s ease,
        color .18s ease,
        transform .18s ease;
    }
    .sb-nav-item::before {
      content: "";
      position: absolute;
      left: 0; top: 8px; bottom: 8px;
      width: 3px; border-radius: 0 3px 3px 0;
      background: linear-gradient(180deg, ${T.primary}, ${T.pink});
      transform: scaleY(0);
      transform-origin: center;
      transition: transform .22s cubic-bezier(.4,0,.2,1);
    }
    .sb-nav-item.active::before { transform: scaleY(1); }
    .sb-nav-item:not(.active):hover {
      background: ${T.navy8};
      transform: translateX(2px);
    }
    .sb-nav-item:not(.active):hover .sb-icon {
      color: ${T.primary};
      transform: scale(1.08);
    }

    .sb-icon { transition: color .18s ease, transform .18s ease; }

    .sb-toggle {
      transition: background-color .18s ease, transform .18s ease;
    }
    .sb-toggle:hover { background: ${T.navy7} !important; transform: scale(1.06); }
    .sb-toggle:active { transform: scale(0.94); }

    .sb-overlay {
      position: fixed; inset: 0;
      background: rgba(17,24,39,.45);
      backdrop-filter: blur(2px);
      z-index: 90;
      animation: sb-fadeIn .2s ease forwards;
    }
    @keyframes sb-fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .sb-tooltip {
      position: absolute;
      left: 100%; top: 50%;
      transform: translate(8px, -50%) scale(0.95);
      background: ${T.navy0}; color: #fff;
      padding: 6px 10px; border-radius: 6px;
      font-size: 12px; font-weight: 600; white-space: nowrap;
      pointer-events: none; opacity: 0;
      transition: opacity .15s ease, transform .15s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      z-index: 200;
    }
    .sb-tooltip::before {
      content: "";
      position: absolute;
      left: -4px; top: 50%; transform: translateY(-50%) rotate(45deg);
      width: 8px; height: 8px;
      background: ${T.navy0};
    }
    .sb-nav-item:hover .sb-tooltip {
      opacity: 1;
      transform: translate(8px, -50%) scale(1);
    }

    .sb-mobile-fab {
      transition: background-color .18s ease, transform .15s ease, box-shadow .18s ease;
    }
    .sb-mobile-fab:hover {
      background: ${T.navy8} !important;
      transform: scale(1.05);
      box-shadow: 0 4px 14px rgba(0,0,0,.12);
    }
  `;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════
   SIDEBAR COMPONENT
═══════════════════════════════════════════ */
function Sidebar({ collapsed = false, onToggle = () => {}, activeKey = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const warned = useRef(false);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Duplicate-mount guard */
  useEffect(() => {
    __sidebarMountCount += 1;
    if (__sidebarMountCount > 1 && !warned.current) {
      warned.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        "%c⚠️ Centific Sidebar: multiple <Sidebar /> instances detected.\n" +
        "Render <Sidebar /> in only ONE place. Currently you have it in App.jsx AND inside a page.\n" +
        "Recommendation: keep it inside pages (Dashboard.jsx) and remove from App.jsx.",
        "background:#FEE2E2;color:#991B1B;font-weight:700;padding:6px 10px;border-radius:6px;"
      );
    }
    return () => { __sidebarMountCount = Math.max(0, __sidebarMountCount - 1); };
  }, []);

  useEffect(() => { injectSidebarStyles(); }, []);

  /* Responsive viewport tracking */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Auto-close mobile drawer on navigation */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* Close on Escape */
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, mobileOpen]);

  /* Lock body scroll when mobile drawer open */
  useEffect(() => {
    if (!isMobile) return;
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobile, mobileOpen]);

  const showCollapsed = isMobile ? false : collapsed;
  const width = showCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;
  const transform = isMobile && !mobileOpen
    ? `translateX(-${SIDEBAR_W_EXPANDED + 12}px)`
    : "translateX(0)";

  // Navigation items - removed Settings and Logout
  const primaryNav = [
    { label: "Dashboard",       path: "/dashboard",       icon: LayoutDashboard },
    { label: "Candidates",      path: "/candidates",      icon: Users },
    { label: "Interviews",      path: "/interviews",      icon: CalendarCheck },
    { label: "Final Evaluated", path: "/final-evaluated", icon: ClipboardCheck },
    { label: "Analytics",       path: "/analytics",       icon: BarChart3 },
    { label: "Reports",         path: "/reports",         icon: FileText },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile floating opener */}
      {isMobile && !mobileOpen && (
        <button
          id="sidebar-btn-mobile-open"
          data-testid="sidebar-btn-mobile-open"
          data-el-id="EL-017"
          className="sb-mobile-fab"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 80,
            width: 40, height: 40, borderRadius: 10,
            background: T.white, border: `1px solid ${T.navy7}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <ChevronRight size={18} color={T.navy2} />
        </button>
      )}

      <aside
        aria-label="Primary navigation"
        style={{
          width,
          height: "calc(100% - 36px)",
          background: T.white,
          borderRight: `1px solid ${T.navy7}`,
          position: "fixed",
          left: 0,
          top: 36,
          transition:
            "width .26s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1)",
          transform,
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT,
          zIndex: 100,
          overflow: "hidden",
          contain: "layout paint",
          boxShadow: isMobile && mobileOpen ? "4px 0 24px rgba(0,0,0,.12)" : "none",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            height: 70, flexShrink: 0,
            padding: showCollapsed ? "0 12px" : "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: showCollapsed ? "center" : "space-between",
            borderBottom: `1px solid ${T.navy7}`,
            transition: "padding .26s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {!showCollapsed && (
            <div className="sb-label" style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden", minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${T.primary}, ${T.pink})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
                boxShadow: `0 4px 12px ${T.primary}40`,
              }}>C</div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{
                  margin: 0, fontSize: 16, fontWeight: 800,
                  color: T.navy0, lineHeight: 1.1,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>Centific</h2>
                <p style={{
                  margin: 0, fontSize: 11, fontWeight: 500,
                  color: T.navy4, letterSpacing: ".02em",
                  whiteSpace: "nowrap",
                }}>Recruiter OS</p>
              </div>
            </div>
          )}

          {showCollapsed && (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.primary}, ${T.pink})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 14,
              boxShadow: `0 4px 12px ${T.primary}40`,
            }}>C</div>
          )}

          {!isMobile && !showCollapsed && (
            <button
              id="sidebar-btn-collapse"
              data-testid="sidebar-btn-collapse"
              className="sb-toggle"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              style={{
                border: "none", background: T.navy8,
                width: 30, height: 30, borderRadius: 8,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={16} color={T.navy2} />
            </button>
          )}

          {isMobile && (
            <button
              id="sidebar-btn-mobile-close"
              data-testid="sidebar-btn-mobile-close"
              className="sb-toggle"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              style={{
                border: "none", background: T.navy8,
                width: 30, height: 30, borderRadius: 8,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <X size={16} color={T.navy2} />
            </button>
          )}
        </div>

        {/* COLLAPSED EXPAND BUTTON (desktop only) */}
        {!isMobile && showCollapsed && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <button
              id="sidebar-btn-expand"
              data-testid="sidebar-btn-expand"
              className="sb-toggle"
              onClick={onToggle}
              aria-label="Expand sidebar"
              style={{
                border: "none", background: T.navy8,
                width: 30, height: 30, borderRadius: 8,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronRight size={16} color={T.navy2} />
            </button>
          </div>
        )}

        {/* NAVIGATION */}
        <nav data-el-id="EL-006" style={{ padding: "12px 10px", flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {!showCollapsed && (
            <div className="sb-label" style={{
              fontSize: 10.5, fontWeight: 700, color: T.navy5,
              textTransform: "uppercase", letterSpacing: ".08em",
              padding: "6px 10px 10px",
            }}>
              Workspace
            </div>
          )}

          {primaryNav.map((item) => (
            <NavRow key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={showCollapsed}
              navId={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => navigate(item.path)} />
          ))}
        </nav>

        {/* FOOTER */}
        {!showCollapsed ? (
          <div className="sb-label" style={{
            padding: "14px 16px",
            borderTop: `1px solid ${T.navy7}`,
            background: T.navy8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Shield size={13} color={T.success} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.navy1 }}>Recruiter Access</span>
            </div>
            <div style={{ fontSize: 10.5, color: T.navy4, lineHeight: 1.4 }}>
              Bias-aware · Audit-ready · Human-final
            </div>
          </div>
        ) : (
          <div style={{
            padding: "12px 0",
            borderTop: `1px solid ${T.navy7}`,
            background: T.navy8,
            display: "flex", justifyContent: "center",
          }}>
            <div title="Recruiter Access" style={{
              width: 32, height: 32, borderRadius: 8,
              background: T.white,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={15} color={T.success} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ─── NAV ROW ─── */
function NavRow({ item, active, collapsed, navId, onClick }) {
  const Icon = item.icon;

  return (
    <div
      id={navId}
      data-testid={navId}
      className={`sb-nav-item${active ? " active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: collapsed ? "11px 0" : "11px 12px",
        marginBottom: 4,
        borderRadius: 10,
        cursor: "pointer",
        background: active ? T.primaryLight : "transparent",
        color: active ? T.primary : T.navy2,
        fontWeight: active ? 700 : 500,
        fontSize: 13.5,
        justifyContent: collapsed ? "center" : "flex-start",
        outline: "none",
        overflow: "hidden",
      }}
    >
      <Icon
        className="sb-icon"
        size={18}
        style={{ color: active ? T.primary : T.navy2, flexShrink: 0 }}
      />
      {!collapsed && (
        <span className="sb-label" style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {item.label}
        </span>
      )}
      {collapsed && <span className="sb-tooltip">{item.label}</span>}
    </div>
  );
}

export default Sidebar;