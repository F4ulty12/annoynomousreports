
function login(){
let id=document.getElementById("rid").value;
let pass=document.getElementById("pass").value;

let reports=JSON.parse(localStorage.getItem("reports")||"[]");

let r=reports.find(x=>x.id===id && x.pass===pass);

let out=document.getElementById("result");

if(!r){
out.innerHTML="Invalid credentials";
return;
}

out.innerHTML=`
<h3>${r.id}</h3>
<p>Category: ${r.category}</p>
<p>Status: ${r.status}</p>
<p>Description: ${r.desc}</p>
`;
}
