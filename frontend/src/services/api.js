const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getCandidates: () => request("/ananya-aegis/candidates?limit=500"),
  getAssessments: () => request("/ananya-aegis/assessments?limit=500"),
  getInterviews: () => request("/ananya-aegis/interviews?limit=500"),
  getAgentOutputs: () => request("/ananya-aegis/agent-output?limit=500"),
  getFinalDecisions: () => request("/ananya-aegis/final-decisions?limit=500"),
  getDashboardSummary: () => request("/ananya-aegis/dashboard/summary"),
  getDecisionPie: () => request("/ananya-aegis/charts/decision-pie"),
  getInterviewStatus: () => request("/ananya-aegis/charts/interview-status"),
  getDepartmentBar: () => request("/ananya-aegis/charts/department-bar"),
  getHiringFunnel: (dateFrom, dateTo) => {
    const p = new URLSearchParams();
    if (dateFrom) p.append("date_from", dateFrom);
    if (dateTo)   p.append("date_to",   dateTo);
    return request(`/ananya-aegis/charts/hiring-funnel?${p}`);
  },
  updateFinalDecision: (candidateId, payload) =>
    request(`/ananya-aegis/final-decisions/${candidateId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  createFeedback: (payload) =>
    request("/ananya-aegis/hr-feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export function mapByCandidateId(rows = []) {
  return rows.reduce((acc, row) => {
    const key = row.candidate_id ?? row.id;
    if (key !== undefined && key !== null) {
      acc[key] = row;
    }
    return acc;
  }, {});
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
}

export function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeRecommendation(value) {
  if (!value) return null;
  const text = String(value).toLowerCase();
  if (text.includes("reject")) return "Reject";
  if (text.includes("hold")) return "On Hold";
  return "Proceed";
}

export function decisionForApi(decision) {
  if (decision === "Accept") return "Selected";
  if (decision === "Reject") return "Rejected";
  return decision;
}
