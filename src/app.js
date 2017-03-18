function setup() {
  const audioPath = 'assets/audio/konnakkol-strokes/';
  const audioFiles = {
    default: { normal: 'ta-3.mp3', stress: 'nam-3.mp3' },
    chap: { normal: 'chaapu-2.mp3', stress: 'chaapu2-9.mp3' },
    chpu: { normal: 'chaapu-2.mp3', stress: 'chaapu2-9.mp3' },
    dhi: { normal: 'dhi2-2.mp3', stress: 'dhi2-4.mp3' },
    dhin: { normal: 'dhin-2.mp3', stress: 'dhin-3.mp3' },
    dhim: { normal: 'dhum2-3.mp3', stress: 'dhum2-4.mp3' },
    deem: { normal: 'dhum2-3.mp3', stress: 'dhum2-4.mp3' },
    dhum: { normal: 'dhum2-3.mp3', stress: 'dhum2-4.mp3' },
    gum: { normal: 'gumki2-4.mp3', stress: 'gumki-4.mp3' },
    ka: { normal: 'ka2-3.mp3', stress: 'ka-5.mp3' },
    ki: { normal: 'ki-1.mp3', stress: 'ki-3.mp3' },
    na: { normal: 'na-4.mp3', stress: 'na2-4.mp3' },
    nam: { normal: 'nam-2.mp3', stress: 'nam2-5.mp3' },
    ta: { normal: 'ta-2.mp3', stress: 'ta2-5.mp3' },
    tha: { normal: 'tha2-3.mp3', stress: 'tha-3.mp3' },
    thom: { normal: 'thom-2.mp3', stress: 'thom2-4.mp3' },
    clap: { normal: 'clap.mp3' }
  };
  const soundLibraryLookup = { default: {} };
  const soundFilePromises = Object.keys(audioFiles).map(strokeKey => {
    soundLibraryLookup[strokeKey] = {};
    Object.keys(audioFiles[strokeKey]).forEach(typeKey => {

      const path = `${audioPath}${audioFiles[strokeKey][typeKey]}`;
      const promise = audio.loadAudio(path).then(buffer => {
        soundLibraryLookup[strokeKey][typeKey] = buffer;
      });
      soundLibraryLookup[strokeKey][typeKey] = promise;

      return promise;
    });
  });

  return Promise.all(soundFilePromises).then(() => {
    konnakkol.addSoundLibraryFromLookup('default', soundLibraryLookup);
  });
}

setup().then(success => {
  console.log('ready');
  konnakkol.editors.forEach(e => e.enable());
});
