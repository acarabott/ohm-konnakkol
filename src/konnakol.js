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

class Chunk {
  constructor(chunks, speed) {
    this.subchunks = chunks;
    this.speed = speed;
  }

  getDuration(speed) {
    const sum = this.subchunks.reduce((prev, cur) => {
      return prev + cur.getDuration(speed);
    }, 0);

    return sum / this.speed;
  }

  play(soundLibrary, when=0, speed) {
    let subchunkWhen = when;
    this.subchunks.forEach(subchunk => {
      subchunk.play(soundLibrary, subchunkWhen, speed * this.speed);
      subchunkWhen += subchunk.getDuration(this.speed) / speed;
    });
  }
}

class Phrase extends Chunk {
  constructor(chunks) {
    super(chunks, 1);
  }

  getDuration() {
    return super.getDuration(1);
  }

  play(soundLibrary, when) {
    super.play(soundLibrary, when, 1);
  }
}

class Syllable {
  constructor(syllable, extension, type) {
    this.type = type;
    this.syllable = syllable;
    this.extension = extension;
    this.aksharas = 1 + extension.length;
  }

  getDuration(speed) {
    return this.aksharas / speed;
  }

  play (soundLibrary, when=0, speedCount) {
    const buffer = soundLibrary.get(this.syllable, this.type);
    playSample(buffer, when);
  }

  toString() {
    return this.syllable + this.extension;
  }
}

semantics.addOperation('interpret', {
  Phrase (chunksExp) {
    return new Phrase(chunksExp.interpret());
  },
  ChunkDouble_recur (startExp, chunkExp, endExp) {
    return new Chunk([chunkExp.interpret()], 2);
  },
  ChunkDouble_base (startExp, chunksExp, endExp) {
    return new Chunk(chunksExp.interpret(), 2);
  },
  ChunkHalf_recur (startExp, chunkExp, endExp) {
    return new Chunk([chunkExp.interpret()], 0.5);
  },
  ChunkHalf_base (startExp, chunksExp, endExp) {
    return new Chunk(chunksExp.interpret(), 0.5);
  },
  word (syllablesExp) {
    return new Chunk(syllablesExp.interpret(), 1);
  },
  syllable_normal (consonantExp, vowelExp, extensionExp) {
    const syllable = consonantExp.sourceString + vowelExp.sourceString;
    const extension = extensionExp.interpret();
    return new Syllable(syllable, extension, 'normal');
  },
  syllable_stressed (consonantExp, vowelExp, extensionExp) {
    const syllable = consonantExp.sourceString + vowelExp.sourceString;
    const extension = extensionExp.interpret();
    return new Syllable(consonant, vowel, extension, 'stress');
  },
  extension_extend (exp) {
    return exp.sourceString;
  },
  extension_rest (exp) {
    return exp.sourceString;
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
  });
}

function play (input, soundLibrary=defaultSoundLibrary, when=0) {
  const result = grammar.match(input);
  if (result.failed()) {
    throw Error('Parsing failed, bad input!');
    return;
  }

  const node = semantics(result);
  const phrase = node.interpret();
  phrase.play(soundLibrary, when);
  return phrase;
}

setup();
