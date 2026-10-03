// UI Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
    });
});

// Speech Synthesis Setup
const synth = window.speechSynthesis;
function speak(text) {
    if (synth.speaking) {
        synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance(text);
    synth.speak(utterThis);
}

// ---------------- Clock Logic ----------------
const clockDisplay = document.getElementById('clock-display');
const dateDisplay = document.getElementById('date-display');

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockDisplay.innerHTML = `${h}<span class="colon">:</span>${m}<span class="colon">:</span>${s}`;
    
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateDisplay.innerText = now.toLocaleDateString(undefined, options);
}
setInterval(updateClock, 1000);
updateClock();

// ---------------- Timer Logic ----------------
let timerSeconds = 0;
let timerInterval = null;
let isTimerRunning = false;

const timerH = document.getElementById('timer-h');
const timerM = document.getElementById('timer-m');
const timerS = document.getElementById('timer-s');
const timerPlayBtn = document.getElementById('timer-play-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');

function updateTimerDisplay() {
    const h = Math.floor(timerSeconds / 3600);
    const m = Math.floor((timerSeconds % 3600) / 60);
    const s = timerSeconds % 60;
    
    timerH.innerText = String(h).padStart(2, '0');
    timerM.innerText = String(m).padStart(2, '0');
    timerS.innerText = String(s).padStart(2, '0');
}

// Quick add buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isTimerRunning) {
            timerSeconds += parseInt(btn.dataset.add);
            updateTimerDisplay();
        }
    });
});

function formatSpeechTime(totalSeconds) {
    if (totalSeconds <= 0) return "Time's up";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    let parts = [];
    if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
    if (m > 0) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
    if (s > 0 || (h===0 && m===0)) parts.push(`${s} second${s > 1 ? 's' : ''}`);
    return parts.join(' and ');
}

function startTimer() {
    if (timerSeconds <= 0) return;
    isTimerRunning = true;
    timerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    // Check pre-countdown
    const preCount = parseInt(document.getElementById('timer-pre-countdown').value);
    
    // Interval settings
    const intervalSpeakEnabled = document.getElementById('timer-interval-speak').checked;
    const intervalVal = parseInt(document.getElementById('timer-interval-val').value);
    
    // Countdown settings
    const countdownSpeakEnabled = document.getElementById('timer-countdown-speak').checked;
    const countdownVal = parseInt(document.getElementById('timer-countdown-val').value);

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        // Interval speaking logic
        if (intervalSpeakEnabled && timerSeconds > 0 && timerSeconds % intervalVal === 0) {
            speak(formatSpeechTime(timerSeconds) + " left");
        }
        
        // Final countdown speaking logic
        if (countdownSpeakEnabled && timerSeconds > 0 && timerSeconds <= countdownVal) {
            speak(timerSeconds.toString());
        }

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            speak("Time is up!");
        }
    }, 1000);
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
}

timerPlayBtn.addEventListener('click', () => {
    if (isTimerRunning) pauseTimer();
    else startTimer();
});

timerResetBtn.addEventListener('click', () => {
    pauseTimer();
    timerSeconds = 0;
    updateTimerDisplay();
});

// ---------------- Stopwatch Logic ----------------
let swMs = 0;
let swInterval = null;
let isSwRunning = false;
let lapCount = 1;
let lastLapMs = 0;

const swH = document.getElementById('sw-h');
const swM = document.getElementById('sw-m');
const swS = document.getElementById('sw-s');
const swMsDisplay = document.getElementById('sw-ms');
const swPlayBtn = document.getElementById('sw-play-btn');
const swResetBtn = document.getElementById('sw-reset-btn');
const swLapBtn = document.getElementById('sw-lap-btn');
const lapsList = document.getElementById('laps-list');

function formatSwDisplay(totalMs) {
    const ms = Math.floor((totalMs % 1000) / 10);
    const s = Math.floor((totalMs / 1000) % 60);
    const m = Math.floor((totalMs / 60000) % 60);
    const h = Math.floor(totalMs / 3600000);
    return {h, m, s, ms};
}

function updateSwDisplay() {
    const {h, m, s, ms} = formatSwDisplay(swMs);
    swH.innerText = String(h).padStart(2, '0');
    swM.innerText = String(m).padStart(2, '0');
    swS.innerText = String(s).padStart(2, '0');
    swMsDisplay.innerText = String(ms).padStart(2, '0');
}

function formatLapSpeechTime(totalMs) {
    const s = Math.floor(totalMs / 1000);
    return formatSpeechTime(s);
}

function startStopwatch() {
    isSwRunning = true;
    swPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    const intervalSpeak = document.getElementById('sw-interval-speak').checked;
    const intervalVal = parseInt(document.getElementById('sw-interval-val').value) * 1000;
    let nextSpeakTarget = (Math.floor(swMs / intervalVal) + 1) * intervalVal;

    swInterval = setInterval(() => {
        swMs += 10;
        updateSwDisplay();
        
        if (intervalSpeak && swMs >= nextSpeakTarget) {
            speak(formatLapSpeechTime(swMs));
            nextSpeakTarget += intervalVal;
        }
    }, 10);
}

function pauseStopwatch() {
    isSwRunning = false;
    clearInterval(swInterval);
    swPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
}

swPlayBtn.addEventListener('click', () => {
    if (isSwRunning) pauseStopwatch();
    else startStopwatch();
});

swResetBtn.addEventListener('click', () => {
    pauseStopwatch();
    swMs = 0;
    lastLapMs = 0;
    lapCount = 1;
    updateSwDisplay();
    lapsList.innerHTML = '';
});

swLapBtn.addEventListener('click', () => {
    if (!isSwRunning) return;
    
    const currentLapMs = swMs - lastLapMs;
    const {h, m, s, ms} = formatSwDisplay(currentLapMs);
    const total = formatSwDisplay(swMs);
    
    const lapEl = document.createElement('div');
    lapEl.className = 'lap-item';
    lapEl.innerHTML = `
        <span>Lap ${lapCount}</span>
        <span>+${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}</span>
        <span>${String(total.h).padStart(2,'0')}:${String(total.m).padStart(2,'0')}:${String(total.s).padStart(2,'0')}.${String(total.ms).padStart(2,'0')}</span>
    `;
    lapsList.prepend(lapEl);
    
    const speakLapTime = document.getElementById('sw-lap-time-speak').checked;
    const speakTotal = document.getElementById('sw-lap-total-speak').checked;
    
    if (speakLapTime) {
        speak(`Lap ${lapCount}, ${formatLapSpeechTime(currentLapMs)}`);
    } else if (speakTotal) {
        speak(`Total time, ${formatLapSpeechTime(swMs)}`);
    }

    lastLapMs = swMs;
    lapCount++;
});
