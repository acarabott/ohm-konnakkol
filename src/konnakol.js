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

  get duration() {
    const sum = this.subchunks.reduce((prev, cur) => prev + cur.duration, 0);
    return sum / this.speed;
  }

  play(soundLibrary, when=0, speedCount) {
    let subchunkWhen = when;
    this.subchunks.forEach(subchunk => {
      subchunk.play(soundLibrary, subchunkWhen, speedCount + 1)
      subchunkWhen += subchunk.duration;
    });
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
    return new Chunk(chunk.interpret(), 1);
  },
  ChunkDouble_recur (start, chunk, end) {
    return new Chunk([chunk.interpret()], 2);
  },
  ChunkDouble_base (start, chunks, end) {
    return new Chunk(chunks.interpret(), 2);
  },
  ChunkHalf_recur (start, chunk, end) {
    return new Chunk([chunk.interpret()], 0.5);
  },
  ChunkHalf_base (start, chunks, end) {
    return new Chunk(chunks.interpret(), 0.5);
  },
  word (syllables) {
    return new Chunk(syllables.interpret(), 1);
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
    [
      'takadimi',
      '[takadimi]',
      '[[takadimi]]',
      '[[[takadimi]]]',
      '[[[[takadimi]]]]',
      'takadimi',
      '(takadimi)',
      '((takadimi))',
      '(((takadimi)))',
      '((((takadimi))))'

    ].forEach(w => {
      console.log('----------------------');
      console.log(w);
      play(w);
    });
  });
}

function play (input, soundLibrary=defaultSoundLibrary) {
  const result = grammar.match(input);
  const node = semantics(result);
  const phrase = node.interpret();

  console.log("phrase:", phrase.duration);
  phrase.play(soundLibrary);
}

setup();
