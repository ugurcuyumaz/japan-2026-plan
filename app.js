const days = [
  ['23','Fri 23 Oct','In the air','IB281 Madrid → Narita · depart 12:30','Outbound'],
  ['24','Sat 24 Oct','Sapporo','Narita → Peach → New Chitose · Susukino','North line'],
  ['25','Sun 25 Oct','Sapporo','Nijo Market · ginkgo avenue · Mt Moiwa night view','North line'],
  ['26','Mon 26 Oct','Noboribetsu','Jigokudani · footbath · reserved private bath','Private bath'],
  ['27','Tue 27 Oct','Hakodate','Motomachi · Mt Hakodate sunset by summit bus','Key day'],
  ['28','Wed 28 Oct','Hakodate','Morning Market · Goryokaku · Lucky Pierrot · slow day','North line'],
  ['29','Thu 29 Oct','Sendai','Hayabusa south · arcades · gyutan + Bunka Yokocho','North line'],
  ['30','Fri 30 Oct','Sendai','Matsushima · cruise · Zuiganji · anago','Key day'],
  ['31','Sat 31 Oct','Tokyo','Asaichi breakfast · Ikebukuro cosplay · Halloween to 05:00','Halloween'],
  ['01','Sun 1 Nov','Tokyo','Recovery day — nothing scheduled','Recovery'],
  ['02','Mon 2 Nov','Nikko','Midday arrival · spa day · Kanmangafuchi','Private bath'],
  ['03','Tue 3 Nov','Tokyo','Toshogu at 09:00 opening · Taiyuinbyo · Tobu express','Key day'],
  ['04','Wed 4 Nov','Tokyo · Monzen-Nakacho','Deep Fukagawa · fire ritual · Edo museum · fukagawa-meshi','Tokyo'],
  ['05','Thu 5 Nov','Tokyo','Kamakura + Enoshima · Great Buddha · Enoden coast','Key day'],
  ['06','Fri 6 Nov','Tokyo','Kappabashi · Kuramae · Edo kiriko · Jimbocho','Tokyo'],
  ['07','Sat 7 Nov','Tokyo','Shimokitazawa · Map Camera · Kitasenju','Tokyo'],
  ['08','Sun 8 Nov','Tokyo','Akabane daytime drinking · soft day','Tokyo'],
  ['09','Mon 9 Nov','Tokyo','Indigo dyeing AM · teamLab Borderless PM','Tokyo'],
  ['10','Tue 10 Nov','Tokyo','Tsukiji outer market · depachika · pack · last evening','Tokyo'],
  ['11','Wed 11 Nov','Fly home','08:30 out · TYO-NRT bus · IB282 14:10','Outbound']
];
const locations = [{name:'Sapporo',short:'Sapporo',coords:[43.0618,141.3545],nights:'2 nights'}, {name:'Noboribetsu',short:'Noboribetsu',coords:[42.4525,141.179],nights:'1 night'}, {name:'Hakodate',short:'Hakodate',coords:[41.7687,140.7291],nights:'2 nights'}, {name:'Sendai',short:'Sendai',coords:[38.2682,140.8694],nights:'2 nights'}, {name:'Tokyo',short:'Tokyo',coords:[35.6762,139.6503],nights:'10 nights'}, {name:'Nikko',short:'Nikko',coords:[36.7199,139.6982],nights:'1 night'}];
const map = L.map('map-canvas',{zoomControl:false,scrollWheelZoom:false}).setView([38.8,139.8],5); L.control.zoom({position:'bottomright'}).addTo(map); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
const route = locations.map(x=>x.coords); L.polyline(route,{color:'#d7654d',weight:4,opacity:.85,dashArray:'7 9'}).addTo(map); locations.forEach((place,i)=>{const marker=L.circleMarker(place.coords,{radius:8,fillColor:'#d7654d',color:'#fbfaf6',weight:3,fillOpacity:1}).addTo(map); marker.bindPopup(`<b>${i+1}. ${place.name}</b><br>${place.nights}`);});
document.getElementById('route-strip').innerHTML = locations.map((x,i)=>`<div class="route-stop"><b>${String(i+1).padStart(2,'0')} · ${x.short}</b><span>${x.nights}</span></div>`).join('');
const list = document.getElementById('day-list'); const filter = document.getElementById('region-filter');
function render(){const value=filter.value; list.innerHTML=days.map((d,i)=>{const key=d[4].toLowerCase().includes('north')?'north':(d[4].toLowerCase().includes('tokyo')||d[2].includes('Tokyo'))?'tokyo':d[4].toLowerCase().includes('key')||d[4].toLowerCase().includes('halloween')?'flags':'other'; const show=value==='all'||value===key||(value==='flags'&&['Halloween','Key day','Private bath'].includes(d[4])); return show?`<article class="day-card ${['Halloween','Key day','Private bath'].includes(d[4])?'highlight':''}"><div><div class="day-number">${d[0]}</div><div class="day-date">${d[1].split(' ').slice(0,2).join(' ')}</div></div><div><div class="day-base">${d[2]}</div><div class="day-title">${d[3]}</div><span class="tag">${d[4]}</span></div></article>`:''}).join('')||'<p>No days match this view.</p>'}; filter.addEventListener('change',render); render();
