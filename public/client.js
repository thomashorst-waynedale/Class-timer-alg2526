
const socket = io();
let state = null;

function updateTimer(data) {
  state = data;
  const bar = document.getElementById('bar-container');
  bar.innerHTML = '';
  const total = data.sections.reduce((sum, s) => sum + s.duration, 0);
  data.sections.forEach((section, i) => {
    const div = document.createElement('div');
    div.className = 'segment';
    div.style.flex = section.duration;
    div.style.backgroundColor = ['#4caf50','#2196f3','#ff9800','#9c27b0'][i % 4];
    div.innerText = section.name;
    bar.appendChild(div);
  });

  const elapsed = data.elapsed;
  let timeLeft = data.sections.reduce((sum, s, i) => i < data.sectionIndex ? sum + s.duration : sum, 0);
  const current = data.sections[data.sectionIndex];
  let t = current.duration - (elapsed - timeLeft);
  if (t < 0) t = 0;
  document.getElementById('timer-label').innerText =
    `Current: ${current.name} (${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')})`;
}

function jumpTo() {
  const min = parseInt(document.getElementById('jump').value, 10);
  if (!isNaN(min)) socket.emit('jump-to', min);
}

socket.on('timer-update', updateTimer);
