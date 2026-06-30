
function load(){
let reports=JSON.parse(localStorage.getItem("reports")||"[]");
let div=document.getElementById("reports");

div.innerHTML=reports.map(r=>`
<div style="border:1px solid #444; margin:10px; padding:10px;">
<b>${r.id}</b><br>
${r.category}<br>
${r.status}<br>
<button onclick="update('${r.id}','Under Review')">Review</button>
<button onclick="update('${r.id}','Closed')">Close</button>
</div>
`).join("");
}

function update(id,status){
let reports=JSON.parse(localStorage.getItem("reports")||"[]");
reports=reports.map(r=>{
if(r.id===id){r.status=status;}
return r;
});
localStorage.setItem("reports",JSON.stringify(reports));
load();
}

load();
