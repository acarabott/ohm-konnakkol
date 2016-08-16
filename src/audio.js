const audio = new AudioContext();

function loadResource (url, responseType="") {
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
}

function loadAudio(url) {
  return loadResource(url, 'arraybuffer').then(buffer => {
    return audio.decodeAudioData(buffer,
      decodedBuffer => decodedBuffer,
      error => error
    )
  });
}

function playSample (buffer, when=0) {
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start(audio.currentTime + when);
}
