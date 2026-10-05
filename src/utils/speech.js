import { TextToSpeech } from '@capacitor-community/text-to-speech';

export const getSpeechSettings = () => {
  return {
    rate: parseFloat(localStorage.getItem('speechRate') || '1'),
    pitch: parseFloat(localStorage.getItem('speechPitch') || '1'),
    voiceURI: localStorage.getItem('speechVoiceURI') || ''
  };
};

export const setSpeechSettings = (rate, pitch, voiceURI) => {
  localStorage.setItem('speechRate', rate);
  localStorage.setItem('speechPitch', pitch);
  if (voiceURI) {
    localStorage.setItem('speechVoiceURI', voiceURI);
  }
};

export const speak = async (text) => {
  try {
    await TextToSpeech.stop();
    const settings = getSpeechSettings();
    
    // We only pass voiceURI if it's not empty, but capacitor plugin uses it directly if we want?
    // Wait, let's just let it play standard text to speech.
    let speakOptions = {
      text: text,
      rate: settings.rate,
      pitch: settings.pitch,
    };
    
    if (settings.voiceURI !== '') {
      speakOptions.voice = parseInt(settings.voiceURI, 10);
    }
    
    await TextToSpeech.speak(speakOptions);
  } catch (e) {
    console.error("Speech failed:", e);
  }
};

export const formatSpeechTime = (totalSeconds) => {
  if (totalSeconds <= 0) return "Time's up";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  let parts = [];
  if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
  if (s > 0 || (h===0 && m===0)) parts.push(`${s} second${s > 1 ? 's' : ''}`);
  return parts.join(' and ');
};

export const estimateSpeechTime = (text) => {
  if (!text || text.trim() === '') return 0;
  const settings = getSpeechSettings();
  const words = text.trim().split(/\s+/).length;
  // Average speaking rate: ~140 words per minute at 1.0x speed
  // which is ~2.33 words per second.
  // We divide by the current user's speech rate multiplier
  const wps = 2.33 * settings.rate;
  const seconds = words / wps;
  // Also add a small constant overhead for initialization
  return Math.max(0.5, seconds).toFixed(1);
};
