/* === JoUTricks Dashboard Script — Final v1.2 === */

// ===== صوت النقر =====
const clickSound = document.getElementById('clickSound');
function playClick() {
  try { if (localStorage.getItem('sound') !== 'off') clickSound.play(); } catch (e) {}
}

// ===== عناصر الواجهة =====
const barsWrap = document.getElementById('bars');
const epTitleEl = document.getElementById('epTitle');
const epStatusEl = document.getElementById('epStatus');
const epFolderEl = document.getElementById('epFolder');
const countdownEl = document.getElementById('countdown');
const themeBtn = document.getElementById('themeToggle');
const nextDateInp = document.getElementById('nextDate');
let progressData = null;

// ===== تحميل progress_data.json =====
async function loadProgressData() {
  try {
    const res = await fetch('./progress_data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    progressData = await res.json();

    // Project Status
    barsWrap.innerHTML = '';
    (progressData.seasons || []).forEach(s => {
      const row = document.createElement('div');
      row.className = 'progress-row';
      const label = document.createElement('div');
      label.className = 'progress-label';
      label.textContent = `${s.name} — ${s.progress}%`;
      const bar = document.createElement('div');
      bar.className = 'progress-bar';
      requestAnimationFrame(() => { bar.style.width = (Number(s.progress) || 0) + '%'; });
      row.appendChild(label); row.appendChild(bar);
      barsWrap.appendChild(row);
    });

    // Next Episode
    const next = progressData.nextEpisode || {};
    epTitleEl.textContent = next.title || '—';
    epStatusEl.textContent = next.status || 'Pending';
    epFolderEl.href = next.folderURL || '#';
    if (next.date) localStorage.setItem('nextEpisodeDate', next.date);
    if (nextDateInp) nextDateInp.value = (next.date || '').slice(0, 10);
    updateCountdown();
  } catch (err) {
    console.error('Error loading progress_data.json:', err);
    alert('⚠️ لم يتم العثور على ملف progress_data.json أو به خطأ.');
  }
}

// ===== العدّاد الزمني =====
function updateCountdown() {
  const target = new Date(localStorage.getItem('nextEpisodeDate') || '2025-11-10');
  const now = new Date();
  const diff = target - now;
  if (isNaN(target.getTime())) {
    countdownEl.textContent = '⏰ التاريخ غير مضبوط.'; return;
  }
  if (diff <= 0) {
    countdownEl.textContent = '🎉 It’s Episode Day!';
    countdownEl.style.color = '#28A745'; return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  countdownEl.textContent = `⏰ ${d}d ${h}h ${m}m remaining`;
}
setInterval(updateCountdown, 60000);

// ===== تبديل الوضع =====
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  playClick();
});
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');

// ===== تحديث التاريخ =====
if (nextDateInp) {
  nextDateInp.addEventListener('change', e => {
    const val = e.target.value;
    if (val) { localStorage.setItem('nextEpisodeDate', val); updateCountdown(); playClick(); }
  });
}

// ===== الأزرار الرئيسية =====
document.getElementById('refresh').addEventListener('click', () => { playClick(); location.reload(); });
document.getElementById('addEp').addEventListener('click', () => {
  playClick(); const ep = prompt('🆕 أدخل اسم الحلقة الجديدة:');
  if (ep) alert(`✅ تم تسجيل الحلقة: ${ep}`);
});
document.getElementById('updDash').addEventListener('click', () => {
  playClick(); window.open('https://docs.google.com/spreadsheets/', '_blank');
});
document.getElementById('expJSON').addEventListener('click', () => {
  playClick();
  const jsonData = progressData;
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'progress_data_updated.json'; a.click();
  alert('📤 تم تصدير progress_data_updated.json بنجاح.');
});

// ===== فتح مكتبة الحلقات =====
document.getElementById('openEpisodes').addEventListener('click', () => {
  playClick();
  window.open('episodes.html', '_blank');
});

// ===== تفعيل الصوت =====
document.querySelectorAll('button, .card').forEach(el => el.addEventListener('click', playClick));
document.querySelectorAll('.card[data-link]').forEach(card => card.addEventListener('click', () => {
  const link = card.getAttribute('data-link'); if (link) window.open(link, '_blank');
}));

// ===== بدء التشغيل =====
window.addEventListener('load', () => { loadProgressData(); updateCountdown(); });
