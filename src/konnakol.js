const grammar = ohm.grammarFromScriptElement();
const semantics = grammar.createSemantics();

const createSoundLibrary = (_lookup) => {
  const lookup = _lookup;
  if (!lookup.hasOwnProperty('default')) {
    throw Error('sound library needs to have default sounds set');
  }

  ['normal', 'stress'].forEach(type => {
    if (!lookup.default.hasOwnProperty(type)) {
      throw Error(`sound library default needs a sound for ${type}`);
    }
  })

  return {
    get: (syllable, type) => {
      const haveSound = lookup.hasOwnProperty(syllable) &&
                        lookup[syllable].hasOwnProperty(type);

      if (haveSound) { return lookup[syllable][type]; }

      const defaultHasType = lookup.default.hasOwnProperty(type);
      if (defaultHasType) { return lookup.default[type]; }

      console.log(`warning: no sound for [${syllable}][${type}], using default`);
      return lookup.default['normal'];
    },
    set: (syllable, type, buffer) => lookup[syllable][type] = buffer
  }
};

class Phrase {
  constructor(chunks) {
    this.chunks = chunks;
  }

  play (soundLibrary, when=0) {
    let chunkWhen = when;
    this.chunks.forEach(chunk => {
      chunk.play(soundLibrary, chunkWhen, 0);
      chunkWhen += chunk.duration;
    });
  }
}

class Word {
  constructor(syllables) {
    this.syllables = syllables;
  }

  get duration() {
    return this.syllables.reduce((prev, cur) => prev + cur.duration, 0);
  }

  play (soundLibrary, when=0, speedCount) {
    let syllableWhen = when;
    this.syllables.forEach(syllable => {
      syllable.play(soundLibrary, syllableWhen);
      syllableWhen += syllable.duration;
    });

    console.log("speedCount:", speedCount);
  }
}

class Chunk {
  constructor(chunk) {
    this.subchunk = chunk;
    this.speed = 1;
  }

  get duration() {
    return this.subchunk.duration / this.speed;
  }

  play(soundLibrary, when=0, speedCount) {
    this.subchunk.play(soundLibrary, when, speedCount + 1);
  }
}

class Syllable {
  constructor(consonant, vowel, extensions, type) {
    this.type = type;
    this.syllable = consonant.sourceString + vowel.sourceString;
    this.duration = 1 + extensions.interpret().length;
  }

  play (soundLibrary, when=0) {
    const buffer = soundLibrary.get(this.syllable, this.type);
    playSample(buffer, when);
  }
}

semantics.addOperation('interpret', {
  Phrase (chunk) {
    return new Phrase(chunk.interpret());
  },
  ChunkDouble(word) {
    return new Chunk(word.interpret());
  },
  ChunkDouble_recur (start, phrase, end) {
    return phrase.interpret();
  },
  ChunkDouble_base (start, phrase, end) {
    return phrase.interpret();
  },
  ChunkHalf_recur (start, phrase, end) {
    return phrase.interpret();
  },
  ChunkHalf_base (start, phrase, end) {
    return phrase.interpret();
  },
  word (syllables) {
    return new Word(syllables.interpret());
  },
  syllable_normal (consonant, vowel, extensions) {
    return new Syllable(consonant, vowel, extensions, 'normal');
  },
  syllable_stressed (consonant, vowel, extensions) {
    return new Syllable(consonant, vowel, extensions, 'stress');
  },
  extension_extend (exp) {
    return exp.interpret();
  },
  extension_rest (exp) {
    return exp.interpret();
  }
});


let defaultSoundLibrary;
function setup() {
  const audioPath = 'assets/audio/';
  const audioFiles = {'normal': 'normal.mp3', 'stress': 'stress.mp3'};
  const soundLibraryLookup = { default: {} };
  const soundFilePromises = Object.keys(audioFiles).map(key => {
    return loadAudio(`${audioPath}${audioFiles[key]}`).then(buffer => {
      soundLibraryLookup.default[key] = buffer;
    });
  });

  Promise.all(soundFilePromises).then(() => {
    defaultSoundLibrary = createSoundLibrary(soundLibraryLookup);
    console.log('ready!');
    ['ta', '(ta)', '((ta))', '(((ta)))', '((((ta))))'].forEach(w => {
      console.log('----------------------');
      console.log(w);
      play(w);
    });
  });
}

function printChunks(obj) {
  console.log(obj);
  if (obj.hasOwnProperty('chunks')) {
    obj.chunks.forEach(chunk => printChunks(chunk));
  }
  if (obj.hasOwnProperty('chunk')) {
    printChunks(obj.chunk);
  }
}

function play (input, soundLibrary=defaultSoundLibrary) {
  const result = grammar.match(input);
  const node = semantics(result);
  const phrase = node.interpret();

  phrase.play(soundLibrary);
}

setup();
