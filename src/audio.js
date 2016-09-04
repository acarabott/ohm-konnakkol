const audio = {};

audio.webkitFallback = window.AudioContext === undefined;
window.AudioContext = audio.webkitFallback ?
  window.webkitAudioContext :
  window.AudioContext;

audio.ctx = new AudioContext();

audio.loadResource = (url, responseType="") => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = responseType;
    request.onload = () => {
      if (request.status === 200) {
        resolve(request.response);
      } else {
        reject(Error(request.statusText));
      }
    };
    request.onerror = () => {
      reject(Error("Network error"));
    };
    request.send();
  });
};

audio.loadAudioWebkitFallback = (url) => {
  return audio.loadResource(url, 'arraybuffer').then(buffer => {
    return new Promise((resolve, reject) => {
      audio.ctx.decodeAudioData(buffer,
        decodedBuffer => {
          resolve(decodedBuffer);
        },
        error => reject(error)
      );
    });
  });
};

audio.loadAudio = (url) => {
  if (audio.webkitFallback) {
    return audio.loadAudioWebkitFallback(url);
  }

  return audio.loadResource(url, 'arraybuffer').then(buffer => {
    return audio.ctx.decodeAudioData(buffer,
      decodedBuffer => decodedBuffer,
      error => error
    );
  });
};

audio.createSample = (buffer, mul=1, onended) => {
  const source = audio.ctx.createBufferSource();
  source.buffer = buffer;

  const gain = audio.ctx.createGain();
  gain.gain.value = mul;

  source.connect(gain);
  gain.connect(audio.ctx.destination);

  source.onended = onended;

  return source;
};


audio.playSample = (buffer, when=0, mul=1, onended) => {
  const source = audio.createSample(buffer, mul, onended);
  source.start(audio.ctx.currentTime + when);
  return source;
};
