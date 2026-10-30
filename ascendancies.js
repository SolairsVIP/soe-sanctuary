const source = './data/ascendancies.json';
const list = document.getElementById('class-list');
const detail = document.getElementById('detail');
const search = document.getElementById('search');
const count = document.getElementById('count');
const empty = document.getElementById('empty');
const guide = document.getElementById('guide-cards');
let classes = [];
let selected = '';
const images = {
  'blood-mage':'portrait-1.webp', 'Chronomancer':'mage-1.webp',
  'Juggernaut':'portrait-5.webp', 'Hierophant':'paladin-2.webp',
  'Berserker':'portrait-3.webp', 'Elementalist':'elemental.webp',
  'Occultist':'sorceress-1.webp', 'Guardian':'portrait-4.webp',
  'Lich':'lich-1.webp', 'Pathfinder':'ranger-1.webp',
  'Spirit Walker':'druidwoman.webp', 'Deadeye':'archer.webp',
  'Chieftain':'portrait-7.webp', 'Saboteur':'portrait-6.webp'
};
function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
function imageFor(item, variant = "detail") { return `./assets/ascendancies/cropped/${variant}/${images[item.id] || "portrait-1.webp"}?v=20261030-5`; }
// Follow the reference site's attribute colors, with requested highlights.
function statColor(line) {
  if (/增强|伤害|攻击力|压碎|碾压|致命|技能触发频率/.test(line)) return 'stat-gold';
  if (/冰冷|寒|冻|冰霜/.test(line)) return 'stat-blue';
  if (/火焰|焰|烈/.test(line)) return 'stat-red';
  if (/闪电|电|震/.test(line)) return 'stat-purple';
  if (/毒/.test(line)) return 'stat-green';
  return '';
}
function parseTiers(lines) {
  const tiers=[]; let current;
  lines.forEach(line => { const match=line.match(/^([1-4])阶\s*[：:]/); if(match){current={number:match[1],lines:[]};tiers.push(current);} else if(current && line.trim()){current.lines.push(line.replace(/^\s*-\s*/,''));} });
  return tiers;
}
function showDetail(item, updateHash=true) {
  if (!item) return;
  selected=item.id;
  document.querySelectorAll('.class-tile').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.id===item.id)));
  const visual=element('div','detail-visual'); visual.style.backgroundImage=`url("${imageFor(item)}")`;
  visual.append(element('span','detail-visual-label','THE ASCENDANCIES  /  ✦'));
  const content=element('div','detail-content');
  const heading=element('div','detail-title'); const title=element('div');
  title.append(element('small','',item.title.toUpperCase()),element('h3','',item.titleZh));
  heading.append(title,element('span','','ASCENDANCY / '+String(classes.indexOf(item)+1).padStart(2,'0')));
  const tiers=element('div','tiers');
  parseTiers(item.textZh).forEach(tier=>{const box=element('section','tier');box.append(element('h4','','0'+tier.number+' / 第 '+tier.number+' 阶'));const ul=element('ul');tier.lines.forEach(line=>ul.append(element('li',statColor(line),line)));box.append(ul);tiers.append(box);});
  content.append(heading,tiers);detail.replaceChildren(visual,content);
  if(updateHash) history.replaceState(null,'','#'+encodeURIComponent(item.id));
}
function renderList() {
  const term=search.value.trim().toLocaleLowerCase();
  const filtered=classes.filter(item=>(item.title+' '+item.titleZh).toLocaleLowerCase().includes(term));
  list.replaceChildren();
  filtered.forEach(item=>{const button=element('button','class-tile');button.type='button';button.dataset.id=item.id;button.setAttribute('aria-pressed',String(item.id===selected));const visual=element('div','tile-image');visual.style.backgroundImage=`url("${imageFor(item,'card')}")`;const text=element('div','tile-text');text.append(element('strong','',item.titleZh),element('small','',item.title));button.append(visual,text);button.addEventListener('click',()=>{showDetail(item); if (window.matchMedia('(max-width: 720px)').matches) detail.scrollIntoView({behavior:'smooth',block:'start'});});list.append(button);});
  count.textContent=`${String(filtered.length).padStart(2,'0')} / ${classes.length}`;empty.hidden=filtered.length>0;
}
function renderGuide(items) { items.forEach((item,index)=>{const card=element('article','guide-card');card.append(element('span','number','0'+(index+1)+' / ASCENSION'),element('h3','',item.titleZh));let bullets; item.textZh.forEach(text=>{if(/^\s*-\s*/.test(text)){if(!bullets){bullets=element('ul');card.append(bullets);}bullets.append(element('li','',text.replace(/^\s*-\s*/,'')));}else{bullets=null;card.append(element('p','',text));}});guide.append(card);}); }
fetch(source).then(r=>{if(!r.ok) throw new Error('data unavailable');return r.json();}).then(data=>{
  classes=data.filter(item=>!['about','ascension','respec'].includes(item.id));
  renderGuide(data.filter(item=>['about','ascension','respec'].includes(item.id)));
  const hash=decodeURIComponent(location.hash.slice(1));selected=(classes.find(item=>item.id===hash)||classes[0]).id;
  renderList();showDetail(classes.find(item=>item.id===selected),false);
}).catch(()=>{count.textContent='资料载入失败';detail.replaceChildren(element('p','loading','资料暂时无法载入，请通过下方链接查看原始资料。'));});
search.addEventListener('input',renderList);
window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));const item=classes.find(entry=>entry.id===id);if(item) showDetail(item,false);});
