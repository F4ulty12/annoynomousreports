
function generateID(){
return "RPT-" + Date.now();
}

function generatePass(){
return Math.random().toString(36).substring(2,8);
}

function submitReport(){
let reports = JSON.parse(localStorage.getItem("reports")||"[]");

let report = {
id: generateID(),
pass: generatePass(),
category: document.getElementById("category").value,
desc: document.getElementById("desc").value,
date: document.getElementById("date").value,
evidence: [
document.getElementById("e1").value,
document.getElementById("e2").value,
document.getElementById("e3").value
],
status: "Submitted",
history: []
};

reports.push(report);
localStorage.setItem("reports", JSON.stringify(reports));

alert("Report Submitted! ID: " + report.id + " PASS: " + report.pass);
window.location.href="index.html";
}
