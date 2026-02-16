// widget.js

function createWidget(container) {
    const FIXTURE_ID = container.getAttribute("data-fixture");
    const LEAGUE = container.getAttribute("data-league") || "eng.1";
    const API_URL = `https://streams.vicecaptain.totalsportslive.co.zw?league=${LEAGUE}&id=${FIXTURE_ID}`;
    const CACHE_KEY = `fixture_${LEAGUE}_${FIXTURE_ID}`;
    const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000;

    container.innerHTML = `
        <div class="fw-loading">Loading match data...</div>
        <div class="fw-content" style="display:none;">
            
            <div style="text-align:center;margin:20px 0;">
                <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-2485970459707316"
                 data-ad-slot="7957136821"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            </div>

            <div class="card">
                <div class="card-header form-header"><span>📈 Recent Form (Last 5 Matches)</span></div>
                <div class="card-content"><div class="fw-recent-form team-grid"></div></div>
            </div>

            <div class="card">
                <div class="card-header h2h-header"><span>📊 Head-to-Head Record</span></div>
                <div class="card-content">
                    <div class="fw-h2h-summary h2h-summary"></div>
                    <div class="fw-h2h-matches"></div>
                </div>
            </div>

            <div style="text-align:center;margin:20px 0;">
                <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-2485970459707316"
                 data-ad-slot="2737166010"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            </div>

            <div class="card">
                <div class="card-header stats-header"><span>📋 Team Statistics Comparison</span></div>
                <div class="card-content"><div class="fw-team-statistics stats-grid"></div></div>
            </div>

            <div class="card">
                <div class="card-header venue-header"><span>🏟️ Venue Information</span></div>
                <div class="card-content"><div class="fw-venue-info"></div></div>
            </div>

            <div style="text-align:center;margin:20px 0;">
                <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-2485970459707316"
                 data-ad-slot="3657034432"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            </div>
        </div>
    `;

    const LOGO_STYLE = `
      width:32px;
      height:32px;
      border-radius:50%;
      object-fit:contain;
      background:#fff;
      padding:2px;
      display:block;
      flex-shrink:0;
    `;

    const SMALL_LOGO_STYLE = `
      width:26px;
      height:26px;
      border-radius:50%;
      object-fit:contain;
      background:#fff;
      padding:2px;
      display:block;
      flex-shrink:0;
    `;

    const img32 = url =>
      `<img src="${url}" loading="lazy" decoding="async" width="32" height="32"
        style="${LOGO_STYLE}" onerror="this.style.display='none'">`;

    const img26 = url =>
      `<img src="${url}" loading="lazy" decoding="async" width="26" height="26"
        style="${SMALL_LOGO_STYLE}" onerror="this.style.display='none'">`;

    function renderRecentForm(form) {
        const el = container.querySelector('.fw-recent-form');
        el.innerHTML = form.map(t => `
            <div class="team-section">
                <div class="team-info">
                    ${img32(t.team.logo)}
                    <div>
                        <div class="team-name">${t.team.displayName}</div>
                        <div class="form-badges">
                            ${t.events.slice(0,5).map(e =>
                              `<span class="badge">${e.gameResult}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="match-list">
                    ${t.events.slice(0,5).map(e => `
                        <div class="match-item">
                            <div class="match-header">
                                <div class="opponent-info">
                                    ${img26(e.opponentLogo)}
                                    <div>
                                        <div>${e.opponent.displayName}</div>
                                        <div class="match-date">${new Date(e.gameDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div class="match-result">
                                    <div class="score">${e.gameResult} ${e.score}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderTeamStatistics(teams){
        const el = container.querySelector('.fw-team-statistics');
        el.innerHTML = teams.map(t => `
            <div>
                <div class="team-info">
                    ${img32(t.team.logo)}
                    <div class="team-name">${t.team.displayName}</div>
                </div>
                ${t.statistics.map(s=>`
                    <div class="stat-item">
                        <span>${s.label}</span>
                        <span>${s.displayValue}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    function renderVenueInfo(v){
        container.querySelector('.fw-venue-info').innerHTML = `
            <b>${v.fullName}</b><br>
            ${v.address.city}, ${v.address.country}
        `;
    }

    async function loadFixtureData(){
        let data=null;

        try{
            const r=await fetch(API_URL);
            if(r.ok){
                data=await r.json();
                localStorage.setItem(CACHE_KEY,JSON.stringify({data,time:Date.now()}));
            }
        }catch(e){}

        if(!data){
            const c=localStorage.getItem(CACHE_KEY);
            if(c){
                const j=JSON.parse(c);
                if(Date.now()-j.time<CACHE_EXPIRY) data=j.data;
            }
        }

        if(data){
            container.querySelector('.fw-loading').style.display='none';
            container.querySelector('.fw-content').style.display='block';

            if(data.boxscore?.form) renderRecentForm(data.boxscore.form);
            if(data.boxscore?.teams){
                renderTeamStatistics(data.boxscore.teams);
                if(data.gameInfo?.venue) renderVenueInfo(data.gameInfo.venue);
            }

            try{
                (adsbygoogle=window.adsbygoogle||[]).push({});
                (adsbygoogle=window.adsbygoogle||[]).push({});
            }catch(e){}
        }
    }

    loadFixtureData();
}

document.addEventListener("DOMContentLoaded",()=>{
    document.querySelectorAll(".football-widget").forEach(createWidget);
});
