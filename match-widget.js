function createWidget(container){

const FIXTURE_ID = container.dataset.fixture;
const LEAGUE = container.dataset.league || "eng.1";
const API_URL = `https://streams.vicecaptain.totalsportslive.co.zw?league=${LEAGUE}&id=${FIXTURE_ID}`;

const CACHE_KEY = `fixture_${LEAGUE}_${FIXTURE_ID}`;
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000;

// ------------------
// Skeleton
// ------------------
container.innerHTML = `
<div style="padding:10px;font-size:14px">Loading match data...</div>

<div class="fw-content" style="display:none">

<!-- AD SLOT 1 -->
<div style="text-align:center;margin:16px 0">
<ins class="adsbygoogle"
 style="display:block"
 data-ad-client="ca-pub-2485970459707316"
 data-ad-slot="7957136821"
 data-ad-format="auto"
 data-full-width-responsive="true"></ins>
</div>

<!-- Recent Form -->
<div style="background:#fff;border-radius:8px;padding:12px;margin-bottom:14px">
<h3>📈 Recent Form</h3>
<div class="fw-recent-form"></div>
</div>

<!-- H2H -->
<div style="background:#fff;border-radius:8px;padding:12px;margin-bottom:14px">
<h3>📊 Head To Head</h3>
<div class="fw-h2h-matches"></div>
</div>

<!-- In-article Ad -->
<ins class="adsbygoogle"
 style="display:block; text-align:center;"
 data-ad-layout="in-article"
 data-ad-format="fluid"
 data-ad-client="ca-pub-2485970459707316"
 data-ad-slot="3657034432"></ins>

<!-- Stats -->
<div style="background:#fff;border-radius:8px;padding:12px;margin-bottom:14px">
<h3>📋 Team Stats</h3>
<div class="fw-team-statistics"></div>
</div>

<!-- AD SLOT 2 -->
<div style="text-align:center;margin:16px 0">
<ins class="adsbygoogle"
 style="display:block"
 data-ad-client="ca-pub-2485970459707316"
 data-ad-slot="2737166010"
 data-ad-format="auto"
 data-full-width-responsive="true"></ins>
</div>

<!-- Venue -->
<div style="background:#fff;border-radius:8px;padding:12px">
<h3>🏟 Venue</h3>
<div class="fw-venue-info"></div>
</div>

</div>
`;

// ------------------
// Helpers
// ------------------

function logo(url){
 return `<img src="${url}" loading="lazy"
 style="width:32px;height:32px;border-radius:50%;object-fit:contain;background:#fff;padding:2px">`;
}

function smallLogo(url){
 return `<img src="${url}" loading="lazy"
 style="width:26px;height:26px;border-radius:50%;object-fit:contain;background:#fff;padding:2px">`;
}

// ------------------
// Renderers
// ------------------

function renderRecentForm(form){
 const box = container.querySelector(".fw-recent-form");
 box.innerHTML = form.map(t=>`
  <div style="margin-bottom:10px">
   <div style="display:flex;align-items:center;gap:8px">
    ${logo(t.team.logo)}
    <b>${t.team.displayName}</b>
   </div>

   ${t.events.slice(0,5).map(e=>`
    <div style="display:flex;align-items:center;gap:6px">
     ${smallLogo(e.opponentLogo)}
     <span>${e.gameResult} ${e.score}</span>
    </div>
   `).join("")}
  </div>
 `).join("");
}

function renderH2H(games){
 const box = container.querySelector(".fw-h2h-matches");
 box.innerHTML = games.slice(0,5).map(g=>`
  <div style="padding:6px 0;border-bottom:1px solid #eee">
   ${g.events?.[0]?.score || ""}
  </div>
 `).join("");
}

function renderStats(teams){
 const box = container.querySelector(".fw-team-statistics");

 box.innerHTML = teams.map(t=>`
  <div style="margin-bottom:12px">
   <div style="display:flex;align-items:center;gap:8px">
    ${logo(t.team.logo)}
    <b>${t.team.displayName}</b>
   </div>

   ${t.statistics.map(s=>`
    <div style="display:flex;justify-content:space-between">
     <span>${s.label}</span>
     <b>${s.displayValue}</b>
    </div>
   `).join("")}
  </div>
 `).join("");
}

function renderVenue(v){
 container.querySelector(".fw-venue-info").innerHTML = `
  <b>${v.fullName}</b><br>
  ${v.address.city}, ${v.address.country}
 `;
}

// ------------------
// Load Data
// ------------------

async function load(){

 let data = null;

 try{
  const r = await fetch(API_URL);
  if(r.ok){
   data = await r.json();
   localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    time: Date.now()
   }));
  }
 }catch(e){}

 if(!data){
  const c = localStorage.getItem(CACHE_KEY);
  if(c){
   const j = JSON.parse(c);
   if(Date.now() - j.time < CACHE_EXPIRY) data = j.data;
  }
 }

 if(!data){
  container.innerHTML = "<p style='padding:12px'>Match data unavailable.</p>";
  return;
 }

 container.querySelector(".fw-content").style.display = "block";

 if(data.boxscore?.form) renderRecentForm(data.boxscore.form);
 if(data.headToHeadGames) renderH2H(data.headToHeadGames);
 if(data.boxscore?.teams){
  renderStats(data.boxscore.teams);
  if(data.gameInfo?.venue) renderVenue(data.gameInfo.venue);
 }

 // Lazy-load ads
 document.querySelectorAll(".adsbygoogle").forEach(ad=>{
  new IntersectionObserver(entries=>{
   if(entries[0].isIntersecting){
    (adsbygoogle = window.adsbygoogle || []).push({});
   }
  }).observe(ad);
 });

}

load();
}

// ------------------
// Init
// ------------------

document.addEventListener("DOMContentLoaded",()=>{
 document.querySelectorAll(".football-widget").forEach(createWidget);
});
