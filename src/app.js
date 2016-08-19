function setup() {
  const audioPath = 'assets/audio/mridangam/mr1/';
  const audioFiles = {
    default: { normal: 'ta.mp3', stress: 'nam.mp3' },
    chap: { normal: 'chap.mp3' },
    chpu: { normal: 'chapu.mp3' },
    deem: { normal: 'deem1.mp3' },
    dom: { normal: 'dom.mp3' },
    gum: { normal: 'gumsl.mp3' },
    ka: { normal: 'ka.mp3' },
    ke: { normal: 'ke.mp3' },
    ki: { normal: 'ki.mp3' },
    kum: { normal: 'kum.mp3' },
    na: { normal: 'na.mp3' },
    nam: { normal: 'nam.mp3' },
    ta: { normal: 'ta.mp3' },
    tom: { normal: 'tom.mp3' }
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

  Promise.all(soundFilePromises).then(() => {
    konnakol.addSoundLibraryFromLookup('default', soundLibraryLookup);
    console.log('ready!');
  });
}

function play (input, when=0.2, soundLibraryKey='default') {
  const result = konnakol.grammar.match(input);
  if (result.failed()) {
    throw Error(`Parsing failed, bad input!\n${result.message}`);
  }

  const node = konnakol.semantics(result);
  const phrase = node.interpret();
  const soundLibrary = konnakol.soundLibraries[soundLibraryKey];
  phrase.play(when, soundLibrary);
  return phrase;
}

setup();
