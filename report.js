// requires config.js (WEBHOOK_URL, WEBHOOK_IS_FORUM_CHANNEL) to be loaded first

function generateID() {
  // Time-based prefix keeps IDs sortable, random suffix avoids collisions/guessing
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return "RPT-" + Date.now().toString(36).toUpperCase() + "-" + rand.toUpperCase();
}

function generatePass() {
  // Cryptographically secure 10-character password (gates access to the report)
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, b => b.toString(36)).join("").slice(0, 10);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function setStatusMsg(msg, isError) {
  let el = document.getElementById("formStatus");
  if (!el) {
    el = document.createElement("div");
    el.id = "formStatus";
    document.querySelector(".container").appendChild(el);
  }
  el.textContent = msg;
  el.style.color = isError ? "#ff6b6b" : "#9fd89f";
  el.style.marginTop = "10px";
}

function validateReport(report) {
  if (!report.category) return "Please choose a category.";
  if (!report.desc || report.desc.trim().length < 10) {
    return "Please describe what happened in at least 10 characters.";
  }
  if (report.desc.length > 4000) return "Description is too long (max 4000 characters).";
  for (const url of report.evidence) {
    if (url && !/^https?:\/\//i.test(url)) {
      return "Evidence links must start with http:// or https://";
    }
  }
  return null;
}

function buildEmbed(report) {
  const fields = [
    { name: "Report ID", value: report.id, inline: true },
    { name: "Status", value: report.status, inline: true },
    { name: "Category", value: report.category, inline: true },
  ];
  if (report.date) fields.push({ name: "Date", value: report.date, inline: true });

  const evidenceLines = report.evidence.filter(Boolean);
  if (evidenceLines.length) {
    fields.push({
      name: "Evidence",
      value: evidenceLines.map((u, i) => `[Link ${i + 1}](${u})`).join("\n").slice(0, 1024),
    });
  }

  return {
    title: "New Anonymous Report",
    description: report.desc.slice(0, 4000),
    color: 0x4caf50,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "Anonymous Reporting Portal" },
  };
}

async function sendToDiscord(report) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("your-webhook-id")) {
    console.warn("Webhook not configured — skipping Discord notification.");
    return { ok: false, reason: "not_configured" };
  }

  const payload = {
    username: "Reporting Portal",
    embeds: [buildEmbed(report)],
  };

  // Forum/media channels: this is the only way a plain webhook (no bot token)
  // can start a thread automatically — each report becomes its own thread,
  // named after the report ID, with the embed as the opening post.
  // Regular text channels do not support this via webhooks; creating a thread
  // there requires a bot with a server-side token (see README).
  if (typeof WEBHOOK_IS_FORUM_CHANNEL !== "undefined" && WEBHOOK_IS_FORUM_CHANNEL) {
    payload.thread_name = report.id;
  }

  try {
    const res = await fetch(WEBHOOK_URL + "?wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Discord webhook failed:", res.status, text);
      return { ok: false, reason: "http_" + res.status };
    }
    return { ok: true, message: await res.json().catch(() => null) };
  } catch (err) {
    console.error("Discord webhook error:", err);
    return { ok: false, reason: "network" };
  }
}

async function submitReport() {
  const btn = document.querySelector("button");
  const report = {
    id: generateID(),
    pass: generatePass(),
    category: document.getElementById("category").value,
    desc: document.getElementById("desc").value.trim(),
    date: document.getElementById("date").value,
    evidence: [
      document.getElementById("e1").value.trim(),
      document.getElementById("e2").value.trim(),
      document.getElementById("e3").value.trim(),
    ],
    status: "Submitted",
    history: [{ status: "Submitted", at: new Date().toISOString() }],
  };

  const error = validateReport(report);
  if (error) {
    setStatusMsg(error, true);
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = "Submitting..."; }
  setStatusMsg("Submitting your report...", false);

  // Persist locally first so the report is never lost even if the webhook fails
  let reports = [];
  try {
    reports = JSON.parse(localStorage.getItem("reports") || "[]");
  } catch (e) {
    console.error("Corrupted local report data, resetting.", e);
    reports = [];
  }
  reports.push(report);
  localStorage.setItem("reports", JSON.stringify(reports));

  const result = await sendToDiscord(report);

  if (btn) { btn.disabled = false; btn.textContent = "Submit"; }

  if (!result.ok && result.reason !== "not_configured") {
    setStatusMsg(
      "Your report was saved, but we couldn't notify staff automatically. " +
      "Please save your Report ID and password below in case you need to contact support.",
      true
    );
  }

  alert(
    "Report submitted!\n\nReport ID: " + report.id +
    "\nPassword: " + report.pass +
    "\n\nSave both — you'll need them to check your report's status."
  );
  window.location.href = "index.html";
}
