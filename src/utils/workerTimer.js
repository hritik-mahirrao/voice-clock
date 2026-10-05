let intervalId = null;

self.onmessage = function(e) {
  if (e.data.command === 'start') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage('tick');
    }, e.data.ms || 100);
  } else if (e.data.command === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
