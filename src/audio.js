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

function loadAudioResource (url) {
  return loadResource(url, 'arraybuffer').then(buffer => {
    return audio.decodeAudioData(buffer).then(decodedBuffer => decodedBuffer);
  })
  .then(decodedBuffer => decodedBuffer);
}

function playSample (buffer, when=0) {
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start(when);
}

const audioPath = 'assets/audio/';
const audioFiles = ['stress.mp3', 'simple.mp3'];

Promise.all(audioFiles.map(name => loadAudioResource(`${audioPath}${name}`)))
  .then(buffers => {
    buffers.forEach((buffer, i) => playSample(buffer, audio.currentTime + (i * 0.25)));
  }, error => {
    console.log("couldn't load all audio");
    console.log(error);
  });