import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WindowFrame.css";

const TITLEBAR_H = 36;
const MIN_W = 640;
const MIN_H = 420;

function getDefaultWin() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(1340, vw - 80);
  const h = Math.min(860, vh - 60);
  return { x: Math.round((vw - w) / 2), y: Math.round((vh - h) / 3), w, h };
}

export default function WindowFrame({ children }) {
  const navigate = useNavigate();
  const [isMaximized, setIsMaximized] = useState(true);
  const [win, setWin] = useState(getDefaultWin);
  const restoreRef = useRef(getDefaultWin());

  /* body background when windowed */
  useEffect(() => {
    if (!isMaximized) {
      document.body.style.background =
        "linear-gradient(135deg,#0f1117 0%,#1a1d2e 50%,#0d1424 100%)";
    } else {
      document.body.style.background = "";
    }
    return () => { document.body.style.background = ""; };
  }, [isMaximized]);

  const handleClose = () => navigate("/");
  const handleMinimize = () => navigate("/");

  const handleMaximize = () => {
    if (!isMaximized) {
      restoreRef.current = win;
      setIsMaximized(true);
    } else {
      setWin(restoreRef.current);
      setIsMaximized(false);
    }
  };

  /* ── Title bar drag ── */
  const onTitleBarMouseDown = (e) => {
    if (isMaximized) return;
    if (e.target.closest(".wf-btn")) return;
    e.preventDefault();
    const ox = e.clientX - win.x;
    const oy = e.clientY - win.y;
    const onMove = (ev) => {
      setWin((w) => ({ ...w, x: ev.clientX - ox, y: Math.max(0, ev.clientY - oy) }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  /* ── Resize ── */
  const startResize = (e, dir) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY;
    const { x: ox, y: oy, w: ow, h: oh } = win;
    const onMove = (ev) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      let nx = ox, ny = oy, nw = ow, nh = oh;
      if (dir.includes("e")) nw = Math.max(MIN_W, ow + dx);
      if (dir.includes("s")) nh = Math.max(MIN_H, oh + dy);
      if (dir.includes("w")) { nw = Math.max(MIN_W, ow - dx); nx = ox + (ow - nw); }
      if (dir.includes("n")) { nh = Math.max(MIN_H, oh - dy); ny = Math.max(0, oy + (oh - nh)); }
      setWin({ x: nx, y: ny, w: nw, h: nh });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const shellStyle = isMaximized
    ? { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: 0, boxShadow: "none" }
    : { top: win.y, left: win.x, width: win.w, height: win.h, borderRadius: 10,
        boxShadow: "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08)" };

  return (
    <div className="wf-shell" style={shellStyle}>

      {/* ── Resize handles (windowed only) ── */}
      {!isMaximized && (
        <>
          <div className="wf-resize wf-r-n"  onMouseDown={(e) => startResize(e, "n")} />
          <div className="wf-resize wf-r-s"  onMouseDown={(e) => startResize(e, "s")} />
          <div className="wf-resize wf-r-e"  onMouseDown={(e) => startResize(e, "e")} />
          <div className="wf-resize wf-r-w"  onMouseDown={(e) => startResize(e, "w")} />
          <div className="wf-resize wf-r-ne" onMouseDown={(e) => startResize(e, "ne")} />
          <div className="wf-resize wf-r-nw" onMouseDown={(e) => startResize(e, "nw")} />
          <div className="wf-resize wf-r-se" onMouseDown={(e) => startResize(e, "se")} />
          <div className="wf-resize wf-r-sw" onMouseDown={(e) => startResize(e, "sw")} />
        </>
      )}

      {/* ── Title Bar ── */}
      <div
        className="wf-titlebar"
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={handleMaximize}
        style={{ cursor: isMaximized ? "default" : "grab" }}
      >
        <div className="wf-titlebar-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="wf-app-icon">
            <path d="M12 2C12 2 6.5 6.5 6.5 13h11C17.5 6.5 12 2 12 2z" fill="#a78bfa"/>
            <rect x="9" y="13" width="6" height="4" rx="1" fill="rgba(167,139,250,0.7)"/>
            <path d="M9.5 17l-2 3.5h9l-2-3.5" fill="rgba(167,139,250,0.4)"/>
            <circle cx="12" cy="9" r="1.8" fill="#818cf8"/>
          </svg>
          <span className="wf-title">Ananya AEGIS — Recruiter Dashboard</span>
        </div>

        <div className="wf-controls">
          <button id="windowframe-btn-minimize" data-testid="windowframe-btn-minimize" className="wf-btn wf-btn-minimize" onClick={handleMinimize} title="Minimize">
            <svg width="10" height="2" viewBox="0 0 10 1.5">
              <rect width="10" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>

          <button id="windowframe-btn-maximize" data-testid="windowframe-btn-maximize" className="wf-btn wf-btn-maximize" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="3" y="0" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="0" y="3" width="8" height="8" rx="1" fill="#1a1d2e" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="0.6" y="0.6" width="8.8" height="8.8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            )}
          </button>

          <button id="windowframe-btn-close" data-testid="windowframe-btn-close" className="wf-btn wf-btn-close" onClick={handleClose} title="Close">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="wf-content">
        {children}
      </div>
    </div>
  );
}
