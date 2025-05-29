
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

let timerData = {
  running: false,
  startTime: null,
  elapsed: 0,
  sectionIndex: 0,
  sections: [
    { name: 'Warm-Up', duration: 3 * 60 },
    { name: 'Spiral Review', duration: 10 * 60 },
    { name: 'Main Lesson', duration: 25 * 60 },
    { name: 'Wrap-Up', duration: 5 * 60 }
  ]
};

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('timer-update', timerData);

  socket.on('start-timer', () => {
    if (!timerData.running) {
      timerData.running = true;
      timerData.startTime = Date.now() - timerData.elapsed * 1000;
      io.emit('timer-update', timerData);
    }
  });

  socket.on('pause-timer', () => {
    if (timerData.running) {
      timerData.running = false;
      timerData.elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
      io.emit('timer-update', timerData);
    }
  });

  socket.on('reset-timer', () => {
    timerData.running = false;
    timerData.elapsed = 0;
    timerData.sectionIndex = 0;
    timerData.startTime = null;
    io.emit('timer-update', timerData);
  });

  socket.on('jump-to', (minute) => {
    let total = 0;
    for (let i = 0; i < timerData.sections.length; i++) {
      total += timerData.sections[i].duration;
      if (minute * 60 < total) {
        timerData.sectionIndex = i;
        timerData.elapsed = minute * 60;
        timerData.startTime = Date.now() - timerData.elapsed * 1000;
        break;
      }
    }
    io.emit('timer-update', timerData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

setInterval(() => {
  if (timerData.running) {
    timerData.elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
    let totalTime = 0;
    for (let i = 0; i < timerData.sections.length; i++) {
      totalTime += timerData.sections[i].duration;
      if (timerData.elapsed < totalTime) {
        timerData.sectionIndex = i;
        break;
      }
    }
    io.emit('timer-update', timerData);
  }
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
