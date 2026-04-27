import "../styles/DesktopIcon.css";

export default function DesktopIcon({ icon, label, onClick }) {
  return (
    <div className="desktop-icon" onClick={onClick}>
      <div className="icon-box">{icon}</div>
      <span>{label}</span>
    </div>
  );
}