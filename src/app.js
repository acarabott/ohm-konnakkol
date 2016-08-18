let defaultSoundLibrary;
function setup() {
  const audioPath = 'assets/audio/';
  const audioFiles = {'normal': 'normal.mp3', 'stress': 'stress.mp3'};
  const soundLibraryLookup = { default: {} };
  const soundFilePromises = Object.keys(audioFiles).map(key => {
    return audio.loadAudio(`${audioPath}${audioFiles[key]}`).then(buffer => {
      soundLibraryLookup.default[key] = buffer;
    });
  });

  Promise.all(soundFilePromises).then(() => {
    defaultSoundLibrary = konnakol.createSoundLibrary(soundLibraryLookup);
    console.log('ready!');
  });
}

function play (input, soundLibrary=defaultSoundLibrary, when=0) {
  const result = konnakol.grammar.match(input);
  if (result.failed()) {
    throw Error('Parsing failed, bad input!');
    return;
  }

  const node = konnakol.semantics(result);
  const phrase = node.interpret();
  phrase.play(soundLibrary, when);
  return phrase;
}

setup();
