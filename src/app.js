function setup() {
  const audioPath = 'assets/audio/mridangam/mr1/';
  const audioFiles = {
    default: { normal: 'ta.mp3', stress: 'nam.mp3' },
    chap: { normal: 'chap.mp3' },
    chpu: { normal: 'chapu.mp3' },
    deem: { normal: 'deem1.mp3' },
    dom: { normal: 'dom.mp3', stress: 'dom1.mp3' },
    gum: { normal: 'gumsl.mp3' },
    ka: { normal: 'ka.mp3' },
    ke: { normal: 'ke.mp3' },
    ki: { normal: 'ki.mp3' },
    kum: { normal: 'kum.mp3', stress: 'kum2.mp3' },
    na: { normal: 'na.mp3', stress: 'nam.mp3' },
    nam: { normal: 'nam.mp3' },
    ta: { normal: 'ta.mp3', stress: 'ta2.mp3'},
    tom: { normal: 'toms.mp3', stress: 'tom.mp3' },
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
    konnakol.addSoundLibraryFromLookup('default', soundLibraryLookup);
  });
}

setup().then(success => {
  console.log('ready');
});