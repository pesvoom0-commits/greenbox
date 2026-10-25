import { items as registeredItems } from './data.js';
import { filterItems, colorCodes, httpsUrl } from './model.js';
const items = [...registeredItems].sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
const $ = id => document.getElementById(id);
let index = 0, category = '', color = '', detailPushed = false;
const detail = $('detail'), search = $('search');
const imageUrl = value => value ? new URL(value, import.meta.url).href : '';
function paint() {
  const item = items[index];
  ['hero','caption','previous','next'].forEach(id => $(id).hidden = !item);
  $('empty').hidden = Boolean(item);
  if (!item) return;
  const hero = $('hero');
  const src = imageUrl(matchMedia('(max-width: 600px)').matches && item.mobileImage ? item.mobileImage : item.heroImage);
  hero.src = src;
  hero.alt = item.name;
  hero.style.objectPosition = item.imagePosition || '50% 50%';
  $('viewer').dataset.imageFit = item.imageFit === 'contain' ? 'contain' : 'cover';
  const backdrop = $('hero-backdrop');
  backdrop.src = src;
  backdrop.hidden = false;
  backdrop.style.objectPosition = item.imagePosition || '50% 50%';
  $('position').textContent = `${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
  $('name').textContent = item.name;
  $('subtitle').textContent = item.subtitle || item.category || '';
  $('previous').disabled = items.length < 2; $('next').disabled = items.length < 2;
  $('announcement').textContent = `${index+1} / ${items.length} ${item.name}`;
  for (const offset of [-1,1]) { const neighbor = items[(index+offset+items.length)%items.length]; const img = new Image(); img.src = imageUrl(neighbor.heroImage); }
}
function step(direction) { if (!items.length || detail.open || search.open) return; index = (index+direction+items.length)%items.length; paint(); }
function openDetail(push = true) {
  const item = items[index]; if (!item) return;
  $('detail-name').textContent = item.name;
  $('detail-subtitle').textContent = [item.subtitle, item.era, item.material].filter(Boolean).join(' · ');
  $('description').textContent = item.description || '';
  $('tags').replaceChildren(...(item.tags || []).map(tag => { const li = document.createElement('li'); li.textContent = tag; return li; }));
  const codes = colorCodes(item.colorHex); $('color').hidden = !codes;
  if (codes) { $('swatch').style.background = codes.hex; $('color-codes').replaceChildren(...['hex','rgb','cmyk'].flatMap(key => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = key.toUpperCase(); dd.textContent = codes[key]; return [dt,dd]; })); }
  for (const [section, anchor, value] of [['video','video-link',item.videoUrl],['source','source-link',item.sourceUrl]]) {
    const url = httpsUrl(value); $(section).hidden = !url;
    if (url) { $(anchor).href = url; $(anchor).textContent = section === 'source' ? new URL(url).hostname : '動画を見る ↗'; }
  }
  if (!detail.open) detail.showModal();
  detail.querySelector('.sheet-content').scrollTop = 0;
  if (push) { const url = new URL(location.href); url.hash = `item=${encodeURIComponent(item.slug || item.id)}`; history.pushState({greenBoxDetail:true},'',url); detailPushed = true; }
}
function closeDetail() { if (detailPushed) { detailPushed = false; history.back(); } else { detail.close(); const url = new URL(location.href); url.hash = ''; history.replaceState(null,'',url); } }
function syncUrl() {
  const slug = new URLSearchParams(location.hash.slice(1)).get('item');
  const found = items.findIndex(item => (item.slug || item.id) === slug);
  if (found >= 0) { index = found; paint(); openDetail(false); } else if (detail.open) detail.close();
}
function filterButtons() {
  $('categories').replaceChildren(...['',...new Set(items.map(item => item.category).filter(Boolean))].map(value => { const button = document.createElement('button'); button.textContent = value || 'すべて'; button.setAttribute('aria-pressed', String(category === value)); button.onclick = () => { category = value; filterButtons(); results(); }; return button; }));
  const groups = [...new Set(items.map(item => item.colorGroup).filter(Boolean))];
  $('colors').replaceChildren(...['',...groups].map(value => { const button = document.createElement('button'); button.className = `color-chip${value ? '' : ' all'}`; button.setAttribute('aria-label', value || '全色'); button.setAttribute('aria-pressed', String(color === value)); const swatch = document.createElement('span'); if (value) { const hex = items.find(item => item.colorGroup === value)?.colorHex; if (colorCodes(hex)) swatch.style.setProperty('--chip',hex); } button.append(swatch); button.onclick = () => { color = color === value ? '' : value; filterButtons(); results(); }; return button; }));
}
function results() {
  const filtered = filterItems(items,{query:$('query').value,category,color});
  $('results').replaceChildren(...filtered.map(item => { const button = document.createElement('button'); button.className = 'result'; const img = document.createElement('img'); img.alt = ''; img.loading = 'lazy'; img.src = imageUrl(item.thumbnailImage || item.heroImage); img.style.objectPosition = item.thumbnailPosition || item.imagePosition || '50% 50%'; const label = document.createElement('span'); label.textContent = item.name; button.append(img,label); button.onclick = () => { index = items.indexOf(item); search.close(); paint(); }; return button; }));
  $('search-empty').hidden = filtered.length > 0;
  $('search-empty').textContent = items.length ? '該当するアイテムはありません' : 'まだアイテムが登録されていません';
}
$('previous').onclick = () => step(-1); $('next').onclick = () => step(1);
$('open-detail').onclick = () => openDetail(); $('close-detail').onclick = closeDetail;
detail.addEventListener('cancel', e => { e.preventDefault(); closeDetail(); });
detail.addEventListener('click',e => { if (e.target === detail && e.clientY < detail.getBoundingClientRect().top) closeDetail(); });
$('open-search').onclick = () => { filterButtons(); results(); search.showModal(); };
$('close-search').onclick = () => search.close(); $('query').oninput = results;
document.addEventListener('keydown', e => { if (detail.open || search.open) return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
let touchStart;
$('viewer').addEventListener('touchstart', e => { if (e.touches.length === 1 && !e.target.closest('button,a')) touchStart = {x:e.touches[0].clientX,y:e.touches[0].clientY}; else touchStart = null; },{passive:true});
$('viewer').addEventListener('touchend', e => { if (!touchStart) return; const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y; touchStart=null; if (Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) step(dx<0?1:-1); },{passive:true});
$('viewer').addEventListener('touchcancel', () => touchStart=null,{passive:true});
window.addEventListener('popstate', () => { detailPushed = Boolean(history.state?.greenBoxDetail); syncUrl(); });
window.addEventListener('hashchange', syncUrl);
paint(); syncUrl();
