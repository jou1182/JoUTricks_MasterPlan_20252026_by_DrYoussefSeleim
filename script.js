const sound = document.getElementById('clickSound');
document.querySelectorAll('button, .card').forEach(el=>{
  el.addEventListener('click',()=> sound.play());
});

const countdown = document.getElementById('countdown');
function updateCountdown(){
  const nextDate = new Date(localStorage.getItem('nextEpisodeDate') || '2025-11-10');
  const now = new Date();
  const diff = nextDate - now;
  if(diff<=0){ countdown.textContent = "🎉 Episode Day!"; return; }
  const d=Math.floor(diff/86400000), h=Math.floor(diff/3600000)%24, m=Math.floor(diff/60000)%60;
  countdown.textContent = `⏰ ${d} days ${h}h ${m}m remaining`;
}
updateCountdown(); setInterval(updateCountdown,60000);

document.getElementById('nextDate').addEventListener('change',e=>{
  localStorage.setItem('nextEpisodeDate',e.target.value);
  updateCountdown();
});

document.getElementById('themeToggle').onclick=()=>{
  document.body.classList.toggle('light');
  localStorage.setItem('theme',document.body.classList.contains('light')?'light':'dark');
};
if(localStorage.getItem('theme')==='light') document.body.classList.add('light');
