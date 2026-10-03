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

export const speak = (text) => {
  const synth = window.speechSynthesis;
  if (synth.speaking) {
      synth.cancel();
  }
  const utterThis = new SpeechSynthesisUtterance(text);
  const settings = getSpeechSettings();
  utterThis.rate = settings.rate;
  utterThis.pitch = settings.pitch;
  
  const voices = synth.getVoices();
  if (voices.length > 0) {
    let selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
    if (!selectedVoice) {
      // Auto-select a realistic voice if possible
      selectedVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
    }
    utterThis.voice = selectedVoice;
  }

  synth.speak(utterThis);
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
