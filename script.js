// === JoUTricks Dashboard Script (Final v1.0) ===

// =============== إعداد الصوتيات ===============
const clickSound = document.getElementById('clickSound');
function playClick() {
  if (localStorage.getItem('sound') !== 'off') clickSound.play();
}

// =============== تحميل بيانات التقدم ===============
function loadProgressData() {
  fetch('progress_data.json')
    .then(res => res.json())
    .then(data => {
      // تحديث أشرطة المواسم
      const bars = document.getElementById('bars');
      bars.innerHTML = '';
      data.seasons.forEach(s => {
        const bar = document.createElement('div');
        bar.style.width = s.progress + '%';
        bar.textContent = `${s.name} — ${s.progress}%`;
        bar.style.background =
          'linear-gradient(90deg, #CD980E, #FFD56B)';
        bars.appendChild(bar);
      });

      // تحديث بيانات الحلقة القادمة
      document.getElementById('epTitle').textContent =
        data.nextEpisode.title;
      document.getElementById('epStatus').textContent =
        data.nextEpisode.status;
      document.getElementById('epFolder').href =
        data.nextEpisode.folderURL;
      localStorage.setItem('nextEpisodeDate', data.nextEpisode.date);

      // تحديث العد التنازلي
      updateCountdown();
    })
    .catch(err => {
      console.error('❌ Error loading progress_data.json:', err);
      alert('⚠️ لم يتم العثور على ملف progress_data.json أو به خطأ.');
    });
}

// =============== العدّاد الزمني ===============
function updateCountdown() {
  const countdown = document.getElementById('countdown');
  const nextDate = new Date(
    localStorage.getItem('nextEpisodeDate') || '2025-11-10'
  );
  const now = new Date();
  const diff = nextDate - now;

  if (diff <= 0) {
    countdown.textContent = '🎉 It’s Episode Day!';
    countdown.style.color = '#28A745';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  countdown.textContent = `⏰ ${days}d ${hours}h ${mins}m remaining`;
}
setInterval(updateCountdown, 60000);

// =============== تبديل المظهر الليلي / الفاتح ===============
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const current = document.body.classList.contains('light')
    ? 'light'
    : 'dark';
  localStorage.setItem('theme', current);
  playClick();
});
if (localStorage.getItem('theme') === 'light')
  document.body.classList.add('light');

// =============== الأزرار الرئيسية ===============

// 🔄 تحديث الصفحة
document.getElementById('refresh').addEventListener('click', () => {
  playClick();
  location.reload();
});

// 🆕 إضافة حلقة جديدة
document.getElementById('addEp').addEventListener('click', () => {
  playClick();
  const epName = prompt('🆕 أدخل اسم الحلقة الجديدة:');
  if (epName) {
    alert(`✅ تم تسجيل الحلقة الجديدة: ${epName}\n(يُرجى إضافتها لاحقًا في Excel).`);
  }
});

// 📈 تحديث Dashboard (فتح Google Sheets)
document.getElementById('updDash').addEventListener('click', () => {
  playClick();
  window.open(
    'https://docs.google.com/spreadsheets/',
    '_blank'
  );
});

// 📤 تصدير ملف progress_data.json محدث
document.getElementById('expJSON').addEventListener('click', () => {
  playClick();

  const bars = document.querySelectorAll('#bars div');
  const seasons = [];
  bars.forEach(b => {
    const [name, pct] = b.textContent.split(' — ');
    seasons.push({ name: name.trim(), progress: parseInt(pct) });
  });

  const jsonData = {
    seasons: seasons,
    nextEpisode: {
      title: document.getElementById('epTitle').textContent,
      status: document.getElementById('epStatus').textContent,
      folderURL: document.getElementById('epFolder').href,
      date: localStorage.getItem('nextEpisodeDate')
    }
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'progress_data_updated.json';
  link.click();

  alert('📤 تم تصدير ملف progress_data_updated.json بنجاح!');
});

// =============== الصوت / الحالة ===============
document.querySelectorAll('button, .card').forEach(el => {
  el.addEventListener('click', playClick);
});

// =============== بدء التشغيل ===============
window.onload = () => {
  loadProgressData();
  updateCountdown();
};
