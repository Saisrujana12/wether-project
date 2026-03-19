/* ═══════════════════════════════════════
   SKYCAST v2  ·  app.js
   10 Advanced Features:
   1. Animated weather backgrounds
   2. Live weather map (Windy)
   3. Saved cities (localStorage)
   4. Moon phase
   5. Humidity & wind charts
   6. Weather alerts
   7. PWA (manifest + SW)
   8. Multi-language (EN/HI/TE)
   9. Theme switcher (dark/light/auto)
   10. Browser notifications
═══════════════════════════════════════ */
'use strict';

/* ────────────────────────────────────
   TRANSLATIONS  (Feature 8)
──────────────────────────────────── */
const i18n = {
  en: {
    humidity:'Humidity', wind:'Wind', visibility:'Visibility', pressure:'Pressure',
    airQuality:'Air Quality', sunMoon:'Sun & Moon', sunrise:'Sunrise', sunset:'Sunset',
    moonPhase:'Moon Phase', hourlyForecast:'24-Hour Forecast', conditions:'Conditions',
    windDir:'Wind Direction', dewPoint:'Dew Point', cloudCover:'Cloud Cover',
    precipitation:'Precipitation', sevenDay:'7-Day Forecast',
    tempTrend:'Temperature Trend (24h)', humidityTrend:'Humidity Trend (24h)',
    windTrend:'Wind Speed Trend (24h)', liveMap:'🗺 Live Weather Map',
    feelsLike:'Feels like', today:'Today', now:'Now',
  },
  hi: {
    humidity:'आर्द्रता', wind:'हवा', visibility:'दृश्यता', pressure:'दबाव',
    airQuality:'वायु गुणवत्ता', sunMoon:'सूर्य और चंद्रमा', sunrise:'सूर्योदय', sunset:'सूर्यास्त',
    moonPhase:'चंद्र चरण', hourlyForecast:'24 घंटे का पूर्वानुमान', conditions:'मौसम स्थितियां',
    windDir:'हवा की दिशा', dewPoint:'ओस बिंदु', cloudCover:'बादल', precipitation:'वर्षा',
    sevenDay:'7 दिन का पूर्वानुमान', tempTrend:'तापमान (24 घंटे)',
    humidityTrend:'आर्द्रता (24 घंटे)', windTrend:'हवा गति (24 घंटे)',
    liveMap:'🗺 लाइव मौसम मानचित्र', feelsLike:'महसूस होता है', today:'आज', now:'अभी',
  },
  te: {
    humidity:'తేమ', wind:'గాలి', visibility:'దృశ్యమానత', pressure:'పీడనం',
    airQuality:'వాయు నాణ్యత', sunMoon:'సూర్యుడు & చంద్రుడు', sunrise:'సూర్యోదయం', sunset:'సూర్యాస్తమయం',
    moonPhase:'చంద్ర దశ', hourlyForecast:'24 గంటల అంచనా', conditions:'వాతావరణ స్థితులు',
    windDir:'గాలి దిశ', dewPoint:'మంచు బిందువు', cloudCover:'మేఘావృతం', precipitation:'వర్షపాతం',
    sevenDay:'7 రోజుల అంచనా', tempTrend:'ఉష్ణోగ్రత (24గంటలు)',
    humidityTrend:'తేమ (24గంటలు)', windTrend:'గాలి వేగం (24గంటలు)',
    liveMap:'🗺 లైవ్ వాతావరణ మ్యాప్', feelsLike:'అనిపిస్తుంది', today:'నేడు', now:'ఇప్పుడు',
  },
};
let lang = localStorage.getItem('sc_lang') || 'en';

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });
}

/* ────────────────────────────────────
   THEME  (Feature 9)
──────────────────────────────────── */
let theme = localStorage.getItem('sc_theme') || 'dark';
function applyTheme(t) {
  theme = t;
  if (t === 'auto') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  } else {
    document.documentElement.dataset.theme = t;
  }
  $('themeBtn').textContent = t === 'light' ? '☀️' : t === 'auto' ? '🌓' : '🌙';
  localStorage.setItem('sc_theme', t);
}

/* ────────────────────────────────────
   STATE
──────────────────────────────────── */
const state = {
  lat:null, lon:null, unit:'celsius',
  weather:null, aqi:null,
  cityName:'', timezone:'',
  prevCode: null,
};

/* ────────────────────────────────────
   DOM REFS
──────────────────────────────────── */
const $ = id => document.getElementById(id);
const el = {
  cityName:$('cityName'), cityMeta:$('cityMeta'), mainIcon:$('mainIcon'),
  tempMain:$('tempMain'), feelsLike:$('feelsLike'), weatherDesc:$('weatherDesc'),
  humidity:$('humidity'), wind:$('wind'), visibility:$('visibility'), pressure:$('pressure'),
  sunrise:$('sunrise'), sunset:$('sunset'), sunDot:$('sunDot'), uvBar:$('uvBar'), uvIndex:$('uvIndex'),
  moonIcon:$('moonIcon'), moonName:$('moonName'),
  hourlyRow:$('hourlyRow'), weeklyList:$('weeklyList'),
  windDir:$('windDir'), dewPoint:$('dewPoint'), cloudCover:$('cloudCover'), precip:$('precip'),
  aqiValue:$('aqiValue'), aqiLabel:$('aqiLabel'), gaugeFill:$('gaugeFill'),
  pm25:$('pm25'), pm10:$('pm10'), o3:$('o3'), co:$('co'),
  liveClock:$('liveClock'), cityInput:$('cityInput'), searchBtn:$('searchBtn'),
  unitToggle:$('unitToggle'), themeBtn:$('themeBtn'), langSelect:$('langSelect'),
  alertBanner:$('alertBanner'), alertText:$('alertText'), alertClose:$('alertClose'),
  pwaBanner:$('pwaBanner'), pwaInstallBtn:$('pwaInstallBtn'), pwaDismiss:$('pwaDismiss'),
  notifBtn:$('notifBtn'),
  savedCitiesBtn:$('savedCitiesBtn'), savedDropdown:$('savedDropdown'),
  saveCurrentBtn:$('saveCurrentBtn'), savedList:$('savedList'), savedEmpty:$('savedEmpty'),
  windyFrame:$('windyFrame'), toast:$('toast'),
  tempChart:$('tempChart'), humidityChart:$('humidityChart'), windChart:$('windChart'),
};

/* ────────────────────────────────────
   WMO MAPS
──────────────────────────────────── */
const WMO_ICON = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',85:'🌨️',86:'❄️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WMO_DESC = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm w/ hail',99:'Heavy thunderstorm'};
const AQI_LEVELS=[{max:50,label:'Good',color:'#4ade80'},{max:100,label:'Moderate',color:'#facc15'},{max:150,label:'Unhealthy*',color:'#f97316'},{max:200,label:'Unhealthy',color:'#ef4444'},{max:300,label:'Very Unheal',color:'#a855f7'},{max:500,label:'Hazardous',color:'#7f1d1d'}];
const DIR=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const degToDir = deg => DIR[Math.round(deg/22.5)%16];

/* ────────────────────────────────────
   UTILITIES
──────────────────────────────────── */
const fmt = (v,d=1) => v!=null ? (+v).toFixed(d) : '--';
function tempStr(c) { return state.unit==='fahrenheit' ? `${fmt(c*9/5+32,0)}°F` : `${fmt(c,0)}°C`; }
function fmtTime(iso) { return new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }
function fmtDay(iso)  { return new Date(iso).toLocaleDateString([],{weekday:'short'}); }

function toast(msg,color='#6366f1') {
  el.toast.textContent = msg;
  el.toast.style.background = `${color}dd`;
  el.toast.classList.add('show');
  setTimeout(()=>el.toast.classList.remove('show'), 3500);
}

/* ────────────────────────────────────
   MOON PHASE  (Feature 4)
──────────────────────────────────── */
function getMoonPhase(date=new Date()) {
  const knownNew = new Date('2000-01-06T18:14:00Z');
  const cycle = 29.53058867;
  const diff = (date - knownNew) / (1000*60*60*24);
  const age = ((diff % cycle) + cycle) % cycle;
  const phases = [
    {max:1.85,  icon:'🌑', name:'New Moon'},
    {max:7.38,  icon:'🌒', name:'Waxing Crescent'},
    {max:9.22,  icon:'🌓', name:'First Quarter'},
    {max:14.77, icon:'🌔', name:'Waxing Gibbous'},
    {max:16.61, icon:'🌕', name:'Full Moon'},
    {max:22.15, icon:'🌖', name:'Waning Gibbous'},
    {max:24.0,  icon:'🌗', name:'Last Quarter'},
    {max:29.53, icon:'🌘', name:'Waning Crescent'},
  ];
  return phases.find(p => age < p.max) || phases[0];
}

/* ────────────────────────────────────
   WEATHER ALERTS  (Feature 6)
──────────────────────────────────── */
const alertCodes = {
  95:'⛈ Thunderstorm Warning!', 96:'⛈ Thunderstorm with Heavy Hail!', 99:'🌪 Severe Thunderstorm Alert!',
  65:'🌊 Heavy Rain Alert!', 82:'🌊 Heavy Rain Showers Warning!',
  75:'❄ Heavy Snowfall Alert!', 86:'❄ Heavy Snow Showers Warning!',
};
function checkAlerts(code, maxTemp) {
  let msg = alertCodes[code] || '';
  if (!msg && maxTemp > 42) msg = '🔥 Extreme Heat Warning! Stay indoors and hydrate.';
  if (msg) {
    el.alertText.textContent = msg;
    el.alertBanner.style.display = 'flex';
    sendNotification('SkyCast Alert', msg);
  } else {
    el.alertBanner.style.display = 'none';
  }
}

/* ────────────────────────────────────
   NOTIFICATIONS  (Feature 10)
──────────────────────────────────── */
let notifEnabled = false;
async function requestNotifPermission() {
  if (!('Notification' in window)) { toast('Notifications not supported'); return; }
  const perm = await Notification.requestPermission();
  notifEnabled = perm === 'granted';
  el.notifBtn.classList.toggle('active', notifEnabled);
  toast(notifEnabled ? '🔔 Notifications enabled!' : '🔕 Notifications denied', notifEnabled ? '#4ade80' : '#ef4444');
}
function sendNotification(title, body) {
  if (notifEnabled && Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'icons/icon-192.png' });
  }
}

/* ────────────────────────────────────
   WEATHER ANIMATION  (Feature 1)
──────────────────────────────────── */
(function WeatherAnim() {
  const canvas = $('weatherCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animType = 'clear', raf;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  class Drop {
    constructor(type) {
      this.type = type;
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H - H;
      if (this.type === 'rain') {
        this.len = Math.random() * 18 + 8;
        this.speed = Math.random() * 8 + 6;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.windDrift = 2;
      } else if (this.type === 'snow') {
        this.r = Math.random() * 4 + 1;
        this.speed = Math.random() * 1.5 + 0.4;
        this.drift = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.wobble = Math.random() * Math.PI * 2;
      } else if (this.type === 'sunray') {
        this.angle = Math.random() * Math.PI / 6 - Math.PI / 12;
        this.len = Math.random() * 200 + 100;
        this.x = W * 0.75 + Math.random() * 60 - 30;
        this.y = -20;
        this.opacity = Math.random() * 0.08 + 0.02;
        this.speed = Math.random() * 0.3 + 0.1;
      }
    }
    update() {
      if (this.type === 'rain') {
        this.x += this.windDrift; this.y += this.speed;
        if (this.y > H + 20) this.reset();
      } else if (this.type === 'snow') {
        this.wobble += 0.02;
        this.x += Math.sin(this.wobble) * 0.8 + this.drift;
        this.y += this.speed;
        if (this.y > H + 10) this.reset();
      } else if (this.type === 'sunray') {
        this.opacity += (Math.random() - 0.5) * 0.003;
        this.opacity = Math.max(0.01, Math.min(0.12, this.opacity));
      }
    }
    draw() {
      ctx.save();
      if (this.type === 'rain') {
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#a8d8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.windDrift, this.y + this.len);
        ctx.stroke();
      } else if (this.type === 'snow') {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#e8f4ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fill();
      } else if (this.type === 'sunray') {
        ctx.globalAlpha = this.opacity;
        const grad = ctx.createLinearGradient(this.x, this.y, this.x + Math.sin(this.angle)*this.len, this.y + this.len);
        grad.addColorStop(0, 'rgba(255,220,80,0.8)');
        grad.addColorStop(1, 'rgba(255,180,40,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.x - 10, this.y);
        ctx.lineTo(this.x + 10, this.y);
        ctx.lineTo(this.x + 10 + Math.sin(this.angle)*this.len, this.y + this.len);
        ctx.lineTo(this.x - 10 + Math.sin(this.angle)*this.len, this.y + this.len);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function setAnim(type) {
    animType = type;
    const count = type==='rain' ? 180 : type==='snow' ? 120 : type==='sunray' ? 12 : 0;
    particles = type==='clear' ? [] : Array.from({length:count}, ()=>new Drop(type));
  }

  function loop() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }
  loop();

  window.setWeatherAnim = function(code) {
    if (code >= 51 && code <= 82) setAnim('rain');
    else if (code >= 71 && code <= 77) setAnim('snow');
    else if (code === 0 || code === 1) setAnim('sunray');
    else setAnim('clear');
  };
})();

/* ────────────────────────────────────
   PARTICLE CANVAS
──────────────────────────────────── */
(function initParticles() {
  const canvas = $('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles=[];
  function resize() { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  class P {
    constructor() { this.reset(); }
    reset() { this.x=Math.random()*W; this.y=Math.random()*H; this.r=Math.random()*1.4+0.3; this.speed=Math.random()*0.25+0.05; this.opacity=Math.random()*0.35+0.05; this.drift=(Math.random()-.5)*.15; }
    update() { this.y-=this.speed; this.x+=this.drift; if(this.y<-5){this.y=H+5;this.x=Math.random()*W;} }
    draw() { ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`rgba(148,163,184,${this.opacity})`;ctx.fill(); }
  }
  resize(); window.addEventListener('resize',resize);
  particles=Array.from({length:70},()=>new P());
  (function loop(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw()});requestAnimationFrame(loop)})();
})();

/* ────────────────────────────────────
   CLOCK
──────────────────────────────────── */
function startClock() {
  const tick=()=>{ el.liveClock.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}); };
  tick(); setInterval(tick,1000);
}

/* ────────────────────────────────────
   GEOCODING + IP
──────────────────────────────────── */
async function geocode(city) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  const data = await res.json();
  if (!data.results?.length) throw new Error('City not found');
  const r = data.results[0];
  return { lat:r.latitude, lon:r.longitude, name:r.name, country:r.country_code, admin:r.admin1||'', timezone:r.timezone };
}
async function ipGeolocate() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    return { lat:d.latitude, lon:d.longitude, name:d.city, country:d.country_code, admin:d.region, timezone:d.timezone };
  } catch { return { lat:28.6139, lon:77.209, name:'New Delhi', country:'IN', admin:'Delhi', timezone:'Asia/Kolkata' }; }
}

/* ────────────────────────────────────
   WEATHER / AQI FETCH
──────────────────────────────────── */
async function fetchWeather(lat,lon) {
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    +`&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,visibility`
    +`&hourly=temperature_2m,weather_code,precipitation_probability,dew_point_2m,relative_humidity_2m,wind_speed_10m`
    +`&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum`
    +`&timezone=auto&forecast_days=7`;
  return (await fetch(url)).json();
}
async function fetchAQI(lat,lon) {
  try {
    const url=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,ozone,european_aqi`;
    return (await fetch(url)).json();
  } catch { return null; }
}

/* ────────────────────────────────────
   RENDER HERO
──────────────────────────────────── */
function renderHero(w) {
  const c=w.current, code=c.weather_code;
  el.mainIcon.textContent = WMO_ICON[code]||'🌡️';
  el.tempMain.textContent = tempStr(c.temperature_2m);
  el.feelsLike.textContent = `${i18n[lang].feelsLike} ${tempStr(c.apparent_temperature)}`;
  el.weatherDesc.textContent = WMO_DESC[code]||'Unknown';
  el.humidity.textContent = `${c.relative_humidity_2m}%`;
  el.wind.textContent = `${fmt(c.wind_speed_10m,0)} km/h`;
  el.visibility.textContent = `${fmt((c.visibility||10000)/1000,1)} km`;
  el.pressure.textContent = `${fmt(c.surface_pressure,0)} hPa`;
  el.windDir.textContent = degToDir(c.wind_direction_10m);
  el.cloudCover.textContent = `${c.cloud_cover}%`;
  el.precip.textContent = `${fmt(w.daily.precipitation_sum[0],1)} mm`;
  const nowHour = new Date().getHours();
  el.dewPoint.textContent = tempStr(w.hourly.dew_point_2m[nowHour]??w.hourly.dew_point_2m[0]);
  // background
  const isRain=code>=51&&code<=82, isSnow=code>=71&&code<=77, isDark=[45,48,3].includes(code)||code>=61;
  $('heroCard').style.background = isRain
    ? 'linear-gradient(135deg,rgba(56,131,248,.22),rgba(30,80,160,.15))'
    : isSnow ? 'linear-gradient(135deg,rgba(148,197,255,.2),rgba(200,230,255,.1))'
    : isDark  ? 'linear-gradient(135deg,rgba(80,80,110,.22),rgba(30,30,60,.15))'
    : 'linear-gradient(135deg,rgba(99,102,241,.18),rgba(56,189,248,.1))';
  // weather anim
  if (code !== state.prevCode) { window.setWeatherAnim(code); state.prevCode=code; }
  // alerts
  checkAlerts(code, w.daily.temperature_2m_max[0]);
  // notification on city change with big weather
  if ([95,96,99,65,82,75].includes(code)) {
    sendNotification(`Weather Alert — ${state.cityName}`, WMO_DESC[code]||'Severe weather');
  }
}

/* ────────────────────────────────────
   RENDER SUN + MOON  (Feature 4)
──────────────────────────────────── */
function renderSun(w) {
  el.sunrise.textContent = fmtTime(w.daily.sunrise[0]);
  el.sunset.textContent  = fmtTime(w.daily.sunset[0]);
  const sr=new Date(w.daily.sunrise[0]), ss=new Date(w.daily.sunset[0]);
  const prog=Math.max(0,Math.min(1,(Date.now()-sr)/(ss-sr)));
  const angle = Math.PI*(1-prog);
  el.sunDot.setAttribute('cx', 100-90*Math.cos(angle));
  el.sunDot.setAttribute('cy', 100-90*Math.sin(angle));
  const uv=w.daily.uv_index_max[0]??0;
  el.uvIndex.textContent=fmt(uv,0);
  el.uvBar.style.width=`${100-Math.min(uv/11*100,100)}%`;
  // Moon
  const moon=getMoonPhase();
  el.moonIcon.textContent=moon.icon;
  el.moonName.textContent=moon.name;
}

/* ────────────────────────────────────
   RENDER HOURLY
──────────────────────────────────── */
function renderHourly(w) {
  el.hourlyRow.innerHTML='';
  const nowIdx=w.hourly.time.findIndex(t=>new Date(t)>=new Date());
  const start=Math.max(0,nowIdx);
  for(let i=start;i<Math.min(start+24,w.hourly.time.length);i++){
    const d=document.createElement('div');
    d.className='hourly-item'+(i===start?' active':'');
    d.innerHTML=`<span class="hourly-time">${i===start?i18n[lang].now:fmtTime(w.hourly.time[i])}</span>
      <span class="hourly-icon">${WMO_ICON[w.hourly.weather_code[i]]||'🌡️'}</span>
      <span class="hourly-temp">${tempStr(w.hourly.temperature_2m[i])}</span>
      <span class="hourly-rain">💧${w.hourly.precipitation_probability[i]}%</span>`;
    el.hourlyRow.appendChild(d);
  }
}

/* ────────────────────────────────────
   RENDER WEEKLY
──────────────────────────────────── */
function renderWeekly(w) {
  el.weeklyList.innerHTML='';
  const allMax=Math.max(...w.daily.temperature_2m_max), allMin=Math.min(...w.daily.temperature_2m_min), range=allMax-allMin||1;
  w.daily.time.forEach((day,i)=>{
    const d=document.createElement('div'); d.className='weekly-item';
    const barW=Math.round(((w.daily.temperature_2m_max[i]-allMin)/range)*100);
    d.innerHTML=`<span class="weekly-day">${i===0?i18n[lang].today:fmtDay(day)}</span>
      <span class="weekly-icon">${WMO_ICON[w.daily.weather_code[i]]||'🌡️'}</span>
      <span class="weekly-desc">${WMO_DESC[w.daily.weather_code[i]]||''}</span>
      <div class="weekly-bar-wrap"><div class="weekly-bar" style="width:${barW}%"></div></div>
      <div class="weekly-range"><span class="weekly-low">${tempStr(w.daily.temperature_2m_min[i])}</span><span>&nbsp;/&nbsp;</span><span>${tempStr(w.daily.temperature_2m_max[i])}</span></div>`;
    el.weeklyList.appendChild(d);
  });
}

/* ────────────────────────────────────
   RENDER AQI
──────────────────────────────────── */
function renderAQI(aqi) {
  if(!aqi?.current){el.aqiValue.textContent='N/A';el.aqiLabel.textContent='No data';return;}
  const c=aqi.current, val=Math.round(c.european_aqi??0);
  el.aqiValue.textContent=val;
  el.pm25.textContent=fmt(c.pm2_5,1); el.pm10.textContent=fmt(c.pm10,1);
  el.o3.textContent=fmt(c.ozone,0); el.co.textContent=fmt((c.carbon_monoxide||0)/1000,2);
  const level=AQI_LEVELS.find(l=>val<=l.max)||AQI_LEVELS[AQI_LEVELS.length-1];
  el.aqiLabel.textContent=level.label; el.aqiValue.style.color=level.color;
  el.gaugeFill.style.strokeDashoffset=173-(173*Math.min(val/300,1));
}

/* ────────────────────────────────────
   RENDER CHARTS  (Features 5 + temp)
──────────────────────────────────── */
function drawLineChart(canvas, dataArr, colorTop, colorBot, unit='', label='') {
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth||500, H=180;
  canvas.width=W; canvas.height=H;
  const pad={top:22,right:18,bottom:36,left:42};
  const gw=W-pad.left-pad.right, gh=H-pad.top-pad.bottom;
  const data=dataArr.map(v=>state.unit==='fahrenheit'&&unit==='°'?+(v*9/5+32).toFixed(1):+v.toFixed(1));
  const minV=Math.min(...data)-2, maxV=Math.max(...data)+2;
  const xS=i=>pad.left+(i/(data.length-1))*gw;
  const yS=v=>pad.top+gh-((v-minV)/(maxV-minV))*gh;
  ctx.clearRect(0,0,W,H);
  // gradient fill
  const grad=ctx.createLinearGradient(0,pad.top,0,H-pad.bottom);
  grad.addColorStop(0,colorTop); grad.addColorStop(1,colorBot);
  ctx.beginPath(); ctx.moveTo(xS(0),yS(data[0]));
  data.forEach((v,i)=>{ if(!i)return; const px=xS(i-1),py=yS(data[i-1]),nx=xS(i),ny=yS(v),cpx=(px+nx)/2; ctx.bezierCurveTo(cpx,py,cpx,ny,nx,ny); });
  ctx.lineTo(xS(data.length-1),H-pad.bottom); ctx.lineTo(xS(0),H-pad.bottom); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  // line
  ctx.beginPath(); ctx.strokeStyle=colorTop.replace(/,[\d.]+\)$/,',1)'); ctx.lineWidth=2.5; ctx.lineJoin='round';
  ctx.moveTo(xS(0),yS(data[0]));
  data.forEach((v,i)=>{ if(!i)return; const px=xS(i-1),py=yS(data[i-1]),nx=xS(i),ny=yS(v),cpx=(px+nx)/2; ctx.bezierCurveTo(cpx,py,cpx,ny,nx,ny); });
  ctx.stroke();
  // dots + labels
  const step=Math.max(1,Math.floor(data.length/7));
  data.forEach((v,i)=>{
    if(i%step!==0&&i!==data.length-1)return;
    const x=xS(i),y=yS(v);
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle=colorTop.replace(/,[\d.]+\)$/,',1)'); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='rgba(241,245,249,.85)'; ctx.font='11px Inter,sans-serif'; ctx.textAlign='center';
    ctx.fillText(`${Math.round(v)}${unit}`,x,y-10);
  });
  // gridlines
  for(let t=0;t<=4;t++){
    const v=minV+((maxV-minV)/4)*t, y=yS(v);
    ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(241,245,249,.3)'; ctx.font='10px Inter,sans-serif'; ctx.textAlign='right';
    ctx.fillText(`${Math.round(v)}${unit}`,pad.left-4,y+4);
  }
}

function renderCharts(w) {
  const nowIdx=w.hourly.time.findIndex(t=>new Date(t)>=new Date());
  const s=Math.max(0,nowIdx);
  const temps=w.hourly.temperature_2m.slice(s,s+24);
  const humids=w.hourly.relative_humidity_2m.slice(s,s+24);
  const winds=w.hourly.wind_speed_10m.slice(s,s+24);
  drawLineChart(el.tempChart,    temps,  'rgba(99,102,241,0.6)',  'rgba(99,102,241,0)',  '°');
  drawLineChart(el.humidityChart,humids, 'rgba(56,189,248,0.6)',  'rgba(56,189,248,0)',  '%');
  drawLineChart(el.windChart,    winds,  'rgba(245,158,11,0.6)',  'rgba(245,158,11,0)',  '');
}

/* ────────────────────────────────────
   WINDY MAP  (Feature 2)
──────────────────────────────────── */
const WINDY_LAYERS = { wind:'wind', rain:'rain', temp:'temp', clouds:'clouds' };
let currentLayer='wind';
function updateMap() {
  if(!state.lat) return;
  const src=`https://embed.windy.com/embed2.html?lat=${state.lat}&lon=${state.lon}&detailLat=${state.lat}&detailLon=${state.lon}&width=650&height=450&zoom=7&level=surface&overlay=${WINDY_LAYERS[currentLayer]}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  el.windyFrame.src=src;
}
document.querySelectorAll('.map-tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.map-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentLayer=btn.dataset.layer;
    updateMap();
  });
});

/* ────────────────────────────────────
   SAVED CITIES  (Feature 3)
──────────────────────────────────── */
function getSaved() { return JSON.parse(localStorage.getItem('sc_cities')||'[]'); }
function saveCities(arr) { localStorage.setItem('sc_cities',JSON.stringify(arr)); }
function renderSavedList() {
  const cities=getSaved();
  el.savedList.innerHTML='';
  el.savedEmpty.style.display=cities.length?'none':'block';
  cities.forEach(c=>{
    const li=document.createElement('li'); li.className='saved-item';
    li.innerHTML=`<span>${c.name}, ${c.country}</span>
      <button class="remove-city" data-name="${c.name}" title="Remove">✕</button>`;
    li.querySelector('span').addEventListener('click',()=>{ loadWeather(c); el.savedDropdown.classList.remove('open'); });
    li.querySelector('.remove-city').addEventListener('click',e=>{ e.stopPropagation(); removeSaved(c.name); });
    el.savedList.appendChild(li);
  });
}
function saveCurrentCity() {
  if(!state.lat)return;
  const cities=getSaved();
  if(cities.find(c=>c.name===state.cityName)){toast('Already saved ⭐');return;}
  cities.push({name:state.cityName,lat:state.lat,lon:state.lon,country:'',admin:''});
  saveCities(cities); renderSavedList(); toast(`⭐ ${state.cityName} saved!`,'#4ade80');
}
function removeSaved(name) {
  saveCities(getSaved().filter(c=>c.name!==name)); renderSavedList();
}
el.savedCitiesBtn.addEventListener('click',()=>{ el.savedDropdown.classList.toggle('open'); renderSavedList(); });
el.saveCurrentBtn.addEventListener('click', saveCurrentCity);
document.addEventListener('click',e=>{ if(!e.target.closest('.saved-cities-wrap'))el.savedDropdown.classList.remove('open'); });

/* ────────────────────────────────────
   LOAD WEATHER
──────────────────────────────────── */
async function loadWeather(locInfo) {
  state.lat=locInfo.lat; state.lon=locInfo.lon; state.cityName=locInfo.name;
  el.cityName.textContent=locInfo.name;
  el.cityMeta.textContent=`${locInfo.admin?locInfo.admin+', ':''}${locInfo.country||''} · ${locInfo.timezone||''}`;
  el.tempMain.textContent='…'; el.weatherDesc.textContent='Fetching…';
  try {
    const [weather,aqi]=await Promise.all([fetchWeather(locInfo.lat,locInfo.lon),fetchAQI(locInfo.lat,locInfo.lon)]);
    state.weather=weather; state.aqi=aqi;
    renderHero(weather); renderSun(weather); renderHourly(weather);
    renderWeekly(weather); renderAQI(aqi); renderCharts(weather);
    updateMap();
  } catch(e) { toast('⚠️ Could not load weather','#ef4444'); console.error(e); }
}

/* ────────────────────────────────────
   SEARCH
──────────────────────────────────── */
async function handleSearch() {
  const q=el.cityInput.value.trim(); if(!q)return;
  el.searchBtn.textContent='…'; el.searchBtn.disabled=true;
  try { await loadWeather(await geocode(q)); el.cityInput.value=''; }
  catch { toast(`❌ "${q}" not found`,'#ef4444'); }
  finally { el.searchBtn.textContent='Search'; el.searchBtn.disabled=false; }
}
el.searchBtn.addEventListener('click',handleSearch);
el.cityInput.addEventListener('keydown',e=>{ if(e.key==='Enter')handleSearch(); });

/* ────────────────────────────────────
   UNIT TOGGLE
──────────────────────────────────── */
el.unitToggle.addEventListener('click',()=>{
  state.unit=state.unit==='celsius'?'fahrenheit':'celsius';
  el.unitToggle.textContent=state.unit==='celsius'?'°C | °F':'°F | °C';
  if(state.weather){ renderHero(state.weather); renderWeekly(state.weather); renderHourly(state.weather); renderCharts(state.weather); }
});

/* ────────────────────────────────────
   THEME TOGGLE  (Feature 9)
──────────────────────────────────── */
const themes=['dark','light','auto'];
el.themeBtn.addEventListener('click',()=>{
  const idx=(themes.indexOf(theme)+1)%themes.length;
  applyTheme(themes[idx]);
});

/* ────────────────────────────────────
   LANGUAGE  (Feature 8)
──────────────────────────────────── */
el.langSelect.value=lang;
el.langSelect.addEventListener('change',()=>{ lang=el.langSelect.value; localStorage.setItem('sc_lang',lang); applyLang(); if(state.weather){renderHourly(state.weather);renderWeekly(state.weather);} });

/* ────────────────────────────────────
   NOTIFICATIONS BUTTON  (Feature 10)
──────────────────────────────────── */
el.notifBtn.addEventListener('click', requestNotifPermission);
if(Notification.permission==='granted') { notifEnabled=true; el.notifBtn.classList.add('active'); }

/* ────────────────────────────────────
   PWA  (Feature 7)
──────────────────────────────────── */
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; el.pwaBanner.style.display='flex'; });
el.pwaInstallBtn.addEventListener('click',async()=>{ if(!deferredPrompt)return; deferredPrompt.prompt(); const{outcome}=await deferredPrompt.userChoice; if(outcome==='accepted'){el.pwaBanner.style.display='none';} deferredPrompt=null; });
el.pwaDismiss.addEventListener('click',()=>{ el.pwaBanner.style.display='none'; });
if('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(()=>{}); }

/* ────────────────────────────────────
   ALERT CLOSE
──────────────────────────────────── */
el.alertClose.addEventListener('click',()=>{ el.alertBanner.style.display='none'; });

/* ────────────────────────────────────
   BOOT
──────────────────────────────────── */
(async function boot() {
  applyTheme(theme);
  applyLang();
  startClock();
  const loc=await ipGeolocate();
  await loadWeather(loc);
})();
