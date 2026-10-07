import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { LocalNotifications } from '@capacitor/local-notifications';

let currentRoutines = [];
let engineInterval = null;
let isSpeaking = false;
let nextRunTimes = {}; // maps routine.id -> next run timestamp (ms)

export const initEngine = (routines) => {
  currentRoutines = routines;
};

export const startEngine = async () => {
  if (engineInterval) clearInterval(engineInterval);
  
  // Request local notification permissions if not granted
  try {
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  } catch (e) {
    console.log("LocalNotifications not available");
  }

  // The interval runs every 5 seconds to check if any routine should fire
  engineInterval = setInterval(checkAndRunRoutines, 5000);
};

export const stopEngine = () => {
  if (engineInterval) clearInterval(engineInterval);
};

export const getNextRunTime = (routineId) => {
  return nextRunTimes[routineId];
};

const checkAndRunRoutines = async () => {
  if (isSpeaking) return;

  const now = new Date();
  const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeTotalMins = currentHours * 60 + currentMinutes;
  const nowMs = Date.now();

  for (const routine of currentRoutines) {
    if (!routine.active) continue;

    // Check Days
    if (routine.days && routine.days.length > 0 && !routine.days.includes(currentDay)) {
      continue;
    }

    // Check Time Window
    let insideWindow = true;
    if (routine.startTime && routine.endTime) {
      const startParts = routine.startTime.split(':').map(Number);
      const endParts = routine.endTime.split(':').map(Number);
      const startMins = startParts[0] * 60 + startParts[1];
      const endMins = endParts[0] * 60 + endParts[1];

      if (startMins <= endMins) {
        insideWindow = currentTimeTotalMins >= startMins && currentTimeTotalMins <= endMins;
      } else {
        // Crosses midnight
        insideWindow = currentTimeTotalMins >= startMins || currentTimeTotalMins <= endMins;
      }
    }
    
    if (!insideWindow) continue;

    // Check Interval
    const nextRun = nextRunTimes[routine.id] || 0;
    
    if (nowMs >= nextRun) {
      // Fire routine
      await executeSpeech(routine.message, routine.speechRate, routine.speechPitch);
      
      // Calculate next run
      const intervalMs = (parseFloat(routine.intervalMinutes) || 5) * 60 * 1000;
      nextRunTimes[routine.id] = Date.now() + intervalMs;
    }
  }
};

export const executeSpeech = async (text, rate = 1.0, pitch = 1.0) => {
  if (isSpeaking) return;
  isSpeaking = true;
  try {
    // Notify via LocalNotification to let user know it ran in background
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "MindfulTTS Routine",
            body: "Playing routine: " + text.substring(0, 30) + "...",
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: null
          }
        ]
      });
    } catch (e) { }

    await TextToSpeech.speak({
      text: text,
      lang: 'en-US',
      rate: parseFloat(rate) || 1.0,
      pitch: parseFloat(pitch) || 1.0,
      category: 'ambient'
    });
  } catch (error) {
    console.error('TTS Error:', error);
  } finally {
    isSpeaking = false;
  }
};
