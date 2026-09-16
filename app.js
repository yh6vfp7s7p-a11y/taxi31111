let selectedVehicle="standard", prebook=false, rides=JSON.parse(localStorage.getItem("taxi31111rides")||"[]");
const services=[
["✈️","Flughafentransfer","Bequemer Transfer zum und vom Flughafen Klagenfurt."],
["🚆","Bahntransfer","Abholung und Fahrt zum Klagenfurter Hauptbahnhof."],
["🚐","Großraumtaxi","Fahrzeuge für Gruppen und viel Gepäck."],
["📦","Botendienst","Kurier- und Botendienste nach Anfrage."],
["🔭","Sightseeing","Individuelle Ausflugs- und Sightseeing-Fahrten."],
["♿","Mobilität","Fahrten mit besonderen Mobilitätsanforderungen."]
];
function showScreen(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.querySelectorAll(".tabbar button").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));
 if(id==="rides")renderRides();
 if(id==="services")renderServices();
 window.scrollTo(0,0);
}
function openBooking(pb){prebook=pb;document.getElementById("bookingTitle").textContent=pb?"Taxi vorbestellen":"Taxi bestellen";document.getElementById("prebookFields").classList.toggle("hidden",!pb);showScreen("booking")}
function setDest(v){document.getElementById("destination").value=v}
function selectVehicle(v){selectedVehicle=v;document.querySelectorAll(".vehicle").forEach(x=>x.classList.toggle("selected",x.dataset.type===v))}
function useLocation(){
 if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(()=>{document.getElementById("pickup").value="Mein aktueller Standort";toast("Standort übernommen")},()=>toast("Standort nicht verfügbar – bitte Adresse eingeben"));
 }else toast("Standort wird von diesem Browser nicht unterstützt");
}
function submitBooking(){
 const destination=document.getElementById("destination").value.trim();
 if(!destination){toast("Bitte zuerst ein Ziel eingeben");return}
 const ride={id:"31111-"+Date.now().toString().slice(-6),pickup:document.getElementById("pickup").value,destination,vehicle:selectedVehicle==="large"?"Großraumtaxi":"Standard-Taxi",status:"NEW",createdAt:new Date().toISOString(),scheduledAt:prebook?document.getElementById("dateTime").value:null};
 rides.unshift(ride);localStorage.setItem("taxi31111rides",JSON.stringify(rides));
 showActive(ride);showScreen("home");simulateRide(ride.id);
}
function showActive(ride){
 const c=document.getElementById("activeCard");c.classList.remove("hidden");
 c.innerHTML=`<b>🚕 ${ride.status==="NEW"?"Bestellung übermittelt":"Aktuelle Fahrt"}</b><p>${ride.pickup}<br>→ ${ride.destination}</p><strong id="activeStatus">Taxi wird gesucht</strong>`;
}
function simulateRide(id){
 const statuses=["SEARCHING","ASSIGNED","DRIVER_EN_ROUTE","ARRIVED","RIDE_STARTED","COMPLETED"];
 const labels=["Taxi wird gesucht","Taxi gefunden · Taxi 31101","Taxi ist unterwegs · ca. 4 Min.","Taxi ist angekommen","Fahrt läuft","Fahrt abgeschlossen"];
 let i=0;
 const timer=setInterval(()=>{
  const r=rides.find(x=>x.id===id); if(!r){clearInterval(timer);return}
  r.status=statuses[i]; localStorage.setItem("taxi31111rides",JSON.stringify(rides));
  const el=document.getElementById("activeStatus"); if(el)el.textContent=labels[i];
  if(i===statuses.length-1){clearInterval(timer);toast("Fahrt abgeschlossen");}
  else toast(labels[i]);
  i++;
 },1800);
}
function renderRides(){
 const box=document.getElementById("rideList");
 if(!rides.length){box.innerHTML="<div>Noch keine Fahrten.</div>";return}
 box.innerHTML=rides.map(r=>`<div><b>${r.vehicle||"Taxi"}</b><br>${r.pickup} → ${r.destination}<br><small>${new Date(r.createdAt).toLocaleString("de-AT")} · ${r.status}</small></div>`).join("");
}
function renderServices(){document.getElementById("serviceList").innerHTML=services.map(s=>`<div><div style="font-size:28px">${s[0]}</div><div><b>${s[1]}</b><p>${s[2]}</p><button class="smallLink" onclick="toast('Service-Anfrage vorbereitet')">Service anfragen</button></div></div>`).join("")}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
document.getElementById("locBtn").onclick=useLocation;
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
renderServices();
showScreen("home");
