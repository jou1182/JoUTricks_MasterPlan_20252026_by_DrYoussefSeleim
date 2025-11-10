/* === JoUTricks Dashboard Script — Final v1.1 ===
 * يعمل مع VS Code Live Server أو أي خادم محلي/استضافة ثابتة.
 * وظائف أساسية:
 *  - تحميل progress_data.json وتحديث الحالة والأشرطة.
 *  - عد تنازلي للحلقة القادمة.
 *  - تبديل الوضع (داكن/فاتح) مع حفظ الاختيار.
 *  - صوت نقر للأزرار والبطاقات.
 *  - أزرار: Refresh / Add New Episode / Update Dashboard / Export JSON.
 */

// =============== الصوتيات ===============
const clickSound = document.getElementById('clickSound');
function playClick(){ try{ if(localStorage.getItem('sound')!=='off') clickSound.play(); }catch(e){} }

// =============== عناصر DOM ===============
const barsWrap   = document.getElementById('bars');
const epTitleEl  = document.getElementById('epTitle');
const epStatusEl = document.getElementById('epStatus');
const epFolderEl = document.getElementById('epFolder');
const countdownEl= document.getElementById('countdown');
const themeBtn   = document.getElementById('themeToggle');
const nextDateInp= document.getElementById('nextDate');

// =============== حالة الواجهة ===============
let progressData = null;

// =============== تحميل بيانات التقدم ===============
async function loadProgressData(){
  try{
    const res = await fetch('progress_data.json', {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    progressData = await res.json();

    // Project Status bars
    barsWrap.innerHTML = '';
    (progressData.seasons || []).forEach(s=>{
      // صف مستقل لكل موسم: عنوان + شريط
      const row   = document.createElement('div'); row.className='progress-row';
      const label = document.createElement('div'); label.className='progress-label';
      label.textContent = `${s.name} — ${s.progress}%`;
      const bar   = document.createElement('div'); bar.className='progress-bar';
      // نحدّث بعد إضافة العناصر حتى يظهر الانتقال
      requestAnimationFrame(()=>{ bar.style.width = (Number(s.progress)||0) + '%'; });
      row.appendChild(label); row.appendChild(bar);
      barsWrap.appendChild(row);
    });

    // Next Episode details
    const next = progressData.nextEpisode || {};
    epTitleEl.textContent  = next.title || '—';
    epStatusEl.textContent = next.status || 'Pending';
    epFolderEl.href        = next.folderURL || '#';
    // تاريخ العدّاد
    if(next.date) localStorage.setItem('nextEpisodeDate', next.date);
    if(nextDateInp) nextDateInp.value = (next.date || '').slice(0,10);

    updateCountdown(); // بعد تحميل التاريخ
  }catch(err){
    console.error('Error loading progress_data.json:', err);
    alert('⚠️ لم يتم العثور على ملف progress_data.json أو به خطأ في الصيغة.');
  }
}

// =============== العدّاد الزمني ===============
function updateCountdown(){
  const target = new Date(localStorage.getItem('nextEpisodeDate') || '2025-11-10');
  const now    = new Date();
  const diff   = target - now;

  if(isNaN(target.getTime())){
    countdownEl.textContent = '⏰ التاريخ غير مضبوط.';
    countdownEl.style.color = '';
    return;
  }

  if(diff<=0){
    countdownEl.textContent = '🎉 It’s Episode Day!';
    countdownEl.style.color = '#28A745';
    return;
  }
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff/3600000)%24;
  const m = Math.floor(diff/60000)%60;
  countdownEl.textContent = `⏰ ${d}d ${h}h ${m}m remaining`;
  countdownEl.style.color = '';
}
setInterval(updateCountdown, 60000);

// =============== تبديل المظهر ===============
themeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light')?'light':'dark');
  playClick();
});
if(localStorage.getItem('theme')==='light'){ document.body.classList.add('light'); }

// =============== مزامنة تاريخ الحلقة القادمة ===============
if(nextDateInp){
  nextDateInp.addEventListener('change', e=>{
    const val = e.target.value;
    if(val){ localStorage.setItem('nextEpisodeDate', val); updateCountdown(); playClick(); }
  });
}

// =============== وظائف الأزرار الرئيسية ===============

// Refresh Progress — إعادة تحميل الصفحة كاملة (يقرأ JSON من جديد)
document.getElementById('refresh').addEventListener('click', ()=>{
  playClick(); location.reload();
});

// Add New Episode — نموذج بسيط (تجميعي) لإضافة عنوان فقط (قابل للتطوير)
document.getElementById('addEp').addEventListener('click', ()=>{
  playClick();
  const ep = prompt('🆕 أدخل اسم الحلقة الجديدة:');
  if(ep){ alert(`✅ تم تسجيل الحلقة: ${ep}\n(أضفها لاحقًا في ملف Excel/Sheets.)`); }
});

// Update Dashboard — افتح Google Sheets (ضع الرابط الحقيقي لاحقًا)
document.getElementById('updDash').addEventListener('click', ()=>{
  playClick();
  window.open('https://docs.google.com/spreadsheets/', '_blank');
});

// Export Progress JSON — يصدر نسخة محدثة من البيانات المعروضة
document.getElementById('expJSON').addEventListener('click', ()=>{
  playClick();

  // إن لم تُحمّل البيانات (لا قدر الله)، نحاول بناءها من DOM
  let seasonsOut = [];
  if(progressData && Array.isArray(progressData.seasons)){
    seasonsOut = progressData.seasons.map(s=>({name:s.name, progress:Number(s.progress)||0}));
  }else{
    // fallback: اقرأ من DOM
    seasonsOut = Array.from(document.querySelectorAll('.progress-row .progress-label'))
      .map(lbl=>{
        const txt = lbl.textContent; // "Season X — 40%"
        const [name,pct] = txt.split('—');
        return { name: (name||'').trim(), progress: Number((pct||'0').replace(/\D/g,''))||0 };
      });
  }

  const jsonData = {
    seasons: seasonsOut,
    nextEpisode: {
      title:  epTitleEl.textContent.trim(),
      status: epStatusEl.textContent.trim(),
      folderURL: epFolderEl.getAttribute('href') || '',
      date: localStorage.getItem('nextEpisodeDate') || ''
    }
  };

  const blob = new Blob([JSON.stringify(jsonData,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'progress_data_updated.json';
  document.body.appendChild(a); a.click(); a.remove();
  alert('📤 تم تصدير progress_data_updated.json بنجاح.');
});

// =============== تفعيل صوت على كل الأزرار والبطاقات ===============
document.querySelectorAll('button,.card').forEach(el=>{
  el.addEventListener('click', playClick);
});

// =============== تفعيل بطاقات التنقل ===============
document.querySelectorAll('.card[data-link]').forEach(card=>{
  card.addEventListener('click', ()=>{
    const link = card.getAttribute('data-link');
    if(link) window.open(link,'_blank');
  });
});

// =============== بدء التشغيل ===============
window.addEventListener('load', ()=>{
  loadProgressData();
  updateCountdown();
});
