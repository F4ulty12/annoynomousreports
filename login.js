function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function login() {
  const id = document.getElementById("rid").value.trim();
  const pass = document.getElementById("pass").value.trim();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!id || !pass) {
    result.textContent = "Please enter both the Report ID and password.";
    result.style.color = "#ff6b6b";
    return;
  }

  let reports = [];
  try {
    reports = JSON.parse(localStorage.getItem("reports") || "[]");
  } catch (e) {
    reports = [];
  }

  const report = reports.find(r => r.id === id && r.pass === pass);

  if (!report) {
    result.textContent = "No matching report found. Check your Report ID and password, " +
      "and make sure you're using the same browser/device you submitted from.";
    result.style.color = "#ff6b6b";
    return;
  }

  const history = (report.history || [])
    .map(h => `<li>${escapeHtml(h.status)} — ${new Date(h.at).toLocaleString()}</li>`)
    .join("");

  result.style.color = "white";
  result.innerHTML = `
    <div style="border:1px solid #444; margin-top:15px; padding:10px; border-radius:5px;">
      <b>${escapeHtml(report.id)}</b><br>
      Category: ${escapeHtml(report.category)}<br>
      Status: <b>${escapeHtml(report.status)}</b><br>
      ${history ? `<p>History:</p><ul>${history}</ul>` : ""}
    </div>
  `;
}
