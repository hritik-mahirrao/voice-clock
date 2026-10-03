export const speak = (text) => {
  const synth = window.speechSynthesis;
  if (synth.speaking) {
      synth.cancel();
  }
  const utterThis = new SpeechSynthesisUtterance(text);
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
