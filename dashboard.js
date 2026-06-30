function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function load() {
  let reports = [];
  try {
    reports = JSON.parse(localStorage.getItem("reports") || "[]");
  } catch (e) {
    console.error("Corrupted report data", e);
    reports = [];
  }

  const div = document.getElementById("reports");

  if (!reports.length) {
    div.innerHTML = "<p>No reports yet.</p>";
    return;
  }

  // Newest first
  reports.sort((a, b) => (b.id > a.id ? 1 : -1));

  div.innerHTML = reports.map(r => {
    const evidence = (r.evidence || []).filter(Boolean)
      .map((u, i) => `<a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">Evidence ${i + 1}</a>`)
      .join(" | ");

    return `
      <div style="border:1px solid #444; margin:10px; padding:10px; border-radius:5px;">
        <b>${escapeHtml(r.id)}</b><br>
        <b>Category:</b> ${escapeHtml(r.category)}<br>
        <b>Status:</b> ${escapeHtml(r.status)}<br>
        ${r.date ? `<b>Date:</b> ${escapeHtml(r.date)}<br>` : ""}
        <b>Description:</b><br>
        <div style="white-space:pre-wrap; margin:6px 0;">${escapeHtml(r.desc || "")}</div>
        ${evidence ? `<div style="margin:6px 0;">${evidence}</div>` : ""}
        <button onclick="update('${r.id}','Under Review')">Mark Under Review</button>
        <button onclick="update('${r.id}','Closed')">Close</button>
      </div>
    `;
  }).join("");
}

function update(id, status) {
  let reports = [];
  try {
    reports = JSON.parse(localStorage.getItem("reports") || "[]");
  } catch (e) {
    reports = [];
  }
  reports = reports.map(r => {
    if (r.id === id) {
      r.status = status;
      r.history = r.history || [];
      r.history.push({ status, at: new Date().toISOString() });
    }
    return r;
  });
  localStorage.setItem("reports", JSON.stringify(reports));
  load();
}

load();
