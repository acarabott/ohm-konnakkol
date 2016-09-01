// requires ohm and audio global "modules"

const konnakol = {};
konnakol.grammar = ohm.grammarFromScriptElement();
konnakol.semantics = konnakol.grammar.createSemantics();
konnakol.soundLibraries = {};

konnakol.createSoundLibrary = (lookup) => {
  if (!lookup.hasOwnProperty('default')) {
    throw Error('sound library needs to have default sounds set');
  }

  ['normal', 'stress'].forEach(type => {
    if (!lookup.default.hasOwnProperty(type)) {
      throw Error(`sound library default needs a sound for '${type}'`);
    }
  });

  return {
    get: (syllable, type) => {
      const haveSyllable = lookup.hasOwnProperty(syllable);
      const haveSound = haveSyllable && lookup[syllable].hasOwnProperty(type);

      function warning (useSyllable, useType) {
        console.log(`warning: no sound for [${syllable}][${type}] using [${useSyllable}][${useType}]`);
      }

      if (haveSound) {
        return lookup[syllable][type];
      }

      if (haveSyllable) {
        const fallbackKey = Object.keys(lookup[syllable])[0];
        // warning(syllable, fallbackKey);
        return lookup[syllable][fallbackKey];
      }

      const defaultHasType = lookup.default.hasOwnProperty(type);
      if (defaultHasType) {
        // warning('default', type);
        return lookup.default[type];
      }

      // warning('default', 'normal');
      return lookup.default['normal'];
    },
    set: (syllable, type, buffer) => lookup[syllable][type] = buffer
  };
};

konnakol.addSoundLibrary = (name, soundLibrary) => {
  konnakol.soundLibraries[name] = soundLibrary;
};

konnakol.addSoundLibraryFromLookup = (name, lookup) => {
  konnakol.addSoundLibrary(name, konnakol.createSoundLibrary(lookup));
};

konnakol.GenericChunk = class GenericChunk {
  constructor(chunks, speed=1) {
    this.subchunks = chunks;
    this.speed = speed;
  }

  getDuration(speed=1) {
    const sum = this.subchunks.reduce((prev, cur) => {
      return prev + cur.getDuration(speed);
    }, 0);

    return sum / this.speed;
  }

  play(when=0, speed, soundLibrary, playTala) {
    let subchunkWhen = when;
    this.subchunks.forEach(subchunk => {
      const isContainer = subchunk instanceof konnakol.ContainerChunk;
      const firstArg = isContainer ? soundLibrary : speed * this.speed;
      const secondArg = isContainer ? playTala : soundLibrary;

      subchunk.play(subchunkWhen, firstArg, secondArg);
      subchunkWhen += subchunk.getDuration(this.speed) / speed;
    });
  }

  toString() {
    return this.subchunks.map(subchunk => subchunk.toString()).join(' ');
  }
};

konnakol.ContainerChunk = class ContainerChunk extends konnakol.GenericChunk {
  play(when=0, soundLibrary, playTala=false) {
    super.play(when, 1, soundLibrary, playTala);
  }
};

konnakol.Composition = class Composition extends konnakol.ContainerChunk {
  constructor(tempoChunks, tala) {
    super(tempoChunks);
    this.tala = tala;
  }

  play(when=0, soundLibrary, playTala) {
    playTala = this.tala !== undefined; // TODO temp! for when tala implemented
    super.play(when, soundLibrary, playTala);
  }
};

konnakol.TempoChunk = class TempoChunk extends konnakol.ContainerChunk {
  constructor(tempo=60, chunks) {
    const speed = tempo / 60;
    super(chunks, speed);
    this.tempo = tempo;
    this.speed = speed;
  }

  play(when=0, soundLibrary, playTala=false) {
    super.play(when, soundLibrary);

    if (playTala) {
      const numBeats = Math.ceil(this.getDuration() * this.speed);
      const beatDur = 1 / this.speed;
      const buffer = soundLibrary.get('clap');
      for (let i = 0; i < numBeats; i++) {
        const talaWhen = when + (i * beatDur);
        audio.playSample(buffer, talaWhen, 0.5);
      }
    }
  }
};

konnakol.Chunk = class Chunk extends konnakol.GenericChunk {
  constructor(chunks, speed, gati=4) {
    super(chunks, speed);
    this.setGati(gati);
  }

  setGati(gati) {
    this.gati = gati;
    this.subchunks.forEach(sub => sub.setGati(gati));
  }
};

konnakol.Word = class Word extends konnakol.Chunk {
  constructor(syllables, speed, gati) {
    super(syllables, speed, gati);
  }
};

konnakol.Syllable = class Syllable {
  constructor(syllable, type, gati=4) {
    this.type = type;
    this.syllable = syllable;
    this.gati = gati;
  }

  setGati(gati) {
    this.gati = gati;
  }

  getDuration(speed) {
    return (1 / this.gati) / speed;
  }

  play(when=0, speedCount, soundLibrary=konnakol.soundLibraries.default) {
    const buffer = soundLibrary.get(this.syllable.toLowerCase(), this.type);
    audio.playSample(buffer, when);
  }

  toString() {
    return `${this.gati}${this.syllable}`;
  }
};

konnakol.Silence = class Silence extends konnakol.Syllable {
  constructor(symbol, type) {
    super(symbol, type);
  }

  play(when=0, speedCount, soundLibrary) {
    // do nothing!
    return;
  }
};

konnakol.repeatChunksExp = (chunksExp, repeatExp) => {
  const originalSubchunks = chunksExp.interpret();
  let numRepeats = repeatExp.interpret()[0];
  numRepeats = numRepeats === undefined ? 1 : numRepeats;
  const numSubchunks = numRepeats * originalSubchunks.length;
  return Array.from(Array(numSubchunks)).map((x, i) => {
    return originalSubchunks[i % originalSubchunks.length];
  });
};

konnakol.semantics.addOperation('interpret', {
  Composition (talaExp, tempoChunksExp) {
    const tala = talaExp.interpret()[0];
    return new konnakol.Composition(tempoChunksExp.interpret(), tala);
  },
  Tala (nameExp, talaExp) {
    // TODO this should create a real Tala object! with proper playback!
    return true;
  },
  TempoChunk (tempoExp, chunksExp) {
    const tempo = tempoExp.interpret()[0];
    const subchunks = chunksExp.interpret();
    return new konnakol.TempoChunk(tempo, subchunks);
  },
  Tempo (prefixExp, tempoExp) {
    return parseInt(tempoExp.sourceString, 10);
  },
  Gati (prefixExp, gatiExp) {
    return parseInt(gatiExp.sourceString, 10);
  },
  Repeat (operatorExp, mulExp) {
    return parseInt(mulExp.sourceString, 10);
  },
  Chunk_normal (gatiExp, chunksExp, repeatExp) {
    const subchunks = konnakol.repeatChunksExp(chunksExp, repeatExp);
    const gati = gatiExp.interpret()[0];
    return new konnakol.Chunk(subchunks, 1, gati);
  },
  Chunk_paren (gatiExp, openExp, chunksExp, closeExp, repeatExp) {
    const subchunks = konnakol.repeatChunksExp(chunksExp, repeatExp);
    const gati = gatiExp.interpret()[0];
    return new konnakol.Chunk(subchunks, 1, gati);
  },
  ChunkDouble_recur (startExp, chunkExp, endExp) {
    return new konnakol.Chunk([chunkExp.interpret()], 2);
  },
  ChunkDouble_base (startExp, chunksExp, endExp) {
    return new konnakol.Chunk(chunksExp.interpret(), 2);
  },
  ChunkHalf_recur (startExp, chunkExp, endExp) {
    return new konnakol.Chunk([chunkExp.interpret()], 0.5);
  },
  ChunkHalf_base (startExp, chunksExp, endExp) {
    return new konnakol.Chunk(chunksExp.interpret(), 0.5);
  },
  word (syllablesExp) {
    return new konnakol.Word(syllablesExp.interpret(), 1);
  },
  syllable_normal (consonantExp, vowelExp) {
    const syllable = consonantExp.sourceString + vowelExp.sourceString;
    return new konnakol.Syllable(syllable, 'normal');
  },
  syllable_stressed (consonantExp, vowelExp) {
    const syllable = consonantExp.sourceString + vowelExp.sourceString;
    return new konnakol.Syllable(syllable, 'stress');
  },
  silence_extension (exp) {
    return new konnakol.Silence(exp.sourceString, 'extension');
  },
  silence_rest (exp) {
    return new konnakol.Silence(exp.sourceString, 'rest');
  }
});

konnakol.play = function(input, when=0.2, soundLibraryKey='default') {
  const result = konnakol.grammar.match(input);
  if (result.failed()) {
    throw Error(`Parsing failed, bad input!\n${result.message}`);
  }

  const node = konnakol.semantics(result);
  const composition = node.interpret();
  const soundLibrary = konnakol.soundLibraries[soundLibraryKey];
  const playTala = true;
  composition.play(when, soundLibrary, playTala);
  return composition;
};
