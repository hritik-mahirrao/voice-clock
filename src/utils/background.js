import { BackgroundMode } from '@anuradev/capacitor-background-mode';

let timerRunning = false;
let stopwatchRunning = false;
let currentTimerText = '';
let currentStopwatchText = '';

let updateTimeout = null;

async function executeUpdate() {
  const isRunning = timerRunning || stopwatchRunning;
  
  if (isRunning) {
    try {
      const perm = await BackgroundMode.checkNotificationsPermission();
      if (perm.notifications !== 'granted') {
        await BackgroundMode.requestNotificationsPermission();
      }
      
      let text = '';
      if (timerRunning && stopwatchRunning) {
        text = `Timer: ${currentTimerText} | Stopwatch: ${currentStopwatchText}`;
      } else if (timerRunning) {
        text = `Timer: ${currentTimerText}`;
      } else {
        text = `Stopwatch: ${currentStopwatchText}`;
      }
      
      const isEnabledObj = await BackgroundMode.isEnabled();
      if (!isEnabledObj.enabled) {
        await BackgroundMode.enable({
          title: 'Voice Clock Active',
          text: text,
          hidden: false,
          resume: true,
          color: '2563eb'
        });
      } else {
        await BackgroundMode.updateNotification({
          title: 'Voice Clock Active',
          text: text
        });
      }
    } catch (e) {
      console.error('BackgroundMode Error:', e);
    }
  } else {
    try {
      await BackgroundMode.disable();
    } catch(e) {}
  }
}

function scheduleUpdate() {
  // Throttle updates slightly so we don't spam the plugin API too hard
  if (updateTimeout) return;
  updateTimeout = setTimeout(() => {
    updateTimeout = null;
    executeUpdate();
  }, 100);
}

export function setTimerBackgroundState(running, text) {
  timerRunning = running;
  currentTimerText = text;
  scheduleUpdate();
}

export function setStopwatchBackgroundState(running, text) {
  stopwatchRunning = running;
  currentStopwatchText = text;
  scheduleUpdate();
}
