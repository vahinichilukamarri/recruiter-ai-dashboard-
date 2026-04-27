import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { T } from "./Sidebar";
import { api } from "../services/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [candidates, interviews, decisions] = await Promise.all([
          api.getCandidates(),
          api.getInterviews(),
          api.getFinalDecisions(),
        ]);
        if (!alive) return;

        const nameMap = {};
        candidates.forEach(c => { nameMap[c.id] = c.full_name; });

        const decisionMap = {};
        decisions.forEach(d => { decisionMap[d.candidate_id] = d.final_decision; });

        const notifs = [];
        interviews.forEach(iv => {
          const name = nameMap[iv.candidate_id] || `Candidate ${iv.candidate_id}`;
          if (iv.status === "Escalated") {
            notifs.push({ message: `${name} escalated — final decision required`, urgent: true });
          } else if (iv.status === "Completed" && !decisionMap[iv.candidate_id]) {
            notifs.push({ message: `${name}'s evaluation complete — review pending`, urgent: false });
          }
        });

        setNotifications(notifs);
      } catch {
        // Backend not available, show empty
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(v => !v)} style={{ cursor: "pointer", position: "relative", display: "inline-flex" }}>
        <Bell size={20} color={T.navy3} />
        {notifications.length > 0 && (
          <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: T.error, border: "2px solid #fff" }} />
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", top: 34, right: -8, width: 300,
          background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14,
          boxShadow: "0 8px 30px rgba(0,0,0,.15)", zIndex: 200, overflow: "hidden"
        }}>
          {/* Header row */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.navy0 }}>
              Notifications{notifications.length > 0 ? ` (${notifications.length})` : ""}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: T.navy8, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={13} color={T.navy3} />
            </button>
          </div>

          {/* Items */}
          {notifications.length === 0 ? (
            <div style={{ padding: "24px 16px", fontSize: 12, color: T.navy4, textAlign: "center" }}>
              No new notifications
            </div>
          ) : (
            notifications.slice(0, 7).map((n, i) => (
              <div key={i} style={{
                padding: "10px 16px",
                borderBottom: i < Math.min(notifications.length, 7) - 1 ? `1px solid ${T.navy7}` : "none",
                fontSize: 12, color: T.navy2,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.urgent ? T.error : T.primary, flexShrink: 0, marginTop: 4 }} />
                <span style={{ lineHeight: 1.45 }}>{n.message}</span>
              </div>
            ))
          )}

          {/* Overflow indicator */}
          {notifications.length > 7 && (
            <div style={{ padding: "8px 16px", fontSize: 11, color: T.navy4, textAlign: "center", borderTop: `1px solid ${T.navy7}`, background: T.navy8 }}>
              +{notifications.length - 7} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
