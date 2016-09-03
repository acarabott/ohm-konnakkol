// requires ohm and audio global "modules"

const konnakkol = {};
konnakkol.grammar = ohm.grammarFromScriptElement();
konnakkol.semantics = konnakkol.grammar.createSemantics();
konnakkol.soundLibraries = {};
konnakkol.defaultGati = 4;

konnakkol.createSoundLibrary = (lookup) => {
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

konnakkol.addSoundLibrary = (name, soundLibrary) => {
  konnakkol.soundLibraries[name] = soundLibrary;
};

konnakkol.addSoundLibraryFromLookup = (name, lookup) => {
  konnakkol.addSoundLibrary(name, konnakkol.createSoundLibrary(lookup));
};

konnakkol.GenericChunk = class GenericChunk {
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

  play(when=0, speed, opts) {
    speed *= this.speed;

    let nextWhen = when;
    this.subchunks.forEach((sub, i) => {
      const subOpts = {};
      const isLast = i === this.subchunks.length - 1;
      // we only want to call onended on the final syllable
      // so we do recursively: the last subchunk of the last subchunk of the....
      Object.keys(opts).filter(k => k !== 'onended' || isLast).forEach(k => {
        subOpts[k] = opts[k];
      });
      sub.play(nextWhen, speed, subOpts);
      nextWhen += sub.getDuration(this.speed) / speed;
    });
  }

  stop() {
    this.subchunks.forEach(subchunk => subchunk.stop());
  }

  isPlaying() {
    return this.subchunks.some(subchunk => subchunk.isPlaying());
  }

  toString() {
    return this.subchunks.map(subchunk => subchunk.toString()).join(' ');
  }
};

konnakkol.Composition = class Composition extends konnakkol.GenericChunk {
  constructor(tempoChunks, thala) {
    super(tempoChunks);
    this.thala = thala;
    this.speed = 1;
  }

  play(when=0, opts) {
    opts.playTala = this.thala !== undefined; // TODO temp! for when thala implemented
    const speed = 1;
    super.play(when, speed, opts);
  }
};

konnakkol.TempoChunk = class TempoChunk extends konnakkol.GenericChunk {
  constructor(tempo=60, chunks) {
    const speed = tempo / 60;
    super(chunks, speed);
    this.tempo = tempo;
    this.speed = speed;
  }

  play(when=0, speed, opts={playTala:false}) {

    super.play(when, 1, opts);

    if (opts.playTala) {
      const numBeats = Math.ceil(this.getDuration() * this.speed);
      const beatDur = 1 / this.speed;
      const buffer = opts.soundLibrary.get('clap');
      for (let i = 0; i < numBeats; i++) {
        const thalaWhen = when + (i * beatDur);
        audio.playSample(buffer, thalaWhen, 0.5);
      }
    }
  }
};

konnakkol.Chunk = class Chunk extends konnakkol.GenericChunk {
  constructor(chunks, speed, gati=konnakkol.defaultGati) {
    super(chunks, speed);
    this.setGati(gati);
  }

  setGati(gati) {
    this.gati = gati;
    this.subchunks.forEach(sub => sub.setGati(gati));
  }
};

konnakkol.Syllable = class Syllable {
  constructor(syllable, type, gati=4) {
    this.type = type;
    this.syllable = syllable;
    this.gati = gati;
    this._isPlaying = false;
    this.audioNode;
  }

  setGati(gati) {
    this.gati = gati;
  }

  getDuration(speed=1) {
    return (1 / this.gati) / speed;
  }

  play(when=0, speed, opts={soundLibrary:konnakkol.soundLibraries.default}) {
    this._isPlaying = true;

    const buffer = opts.soundLibrary.get(this.syllable.toLowerCase(), this.type);
    const mul = this.type === 'stress' ? 1.0 : 0.4;

    this.audioNode = audio.playSample(buffer, when, mul, () => {
      this._isPlaying = false;
      if (opts.hasOwnProperty('onended')) {
        opts.onended();
      }
    });
  }

  stop() {
    if (this.isPlaying()) {
      this.audioNode.stop();
    }
  }

  isPlaying() {
    return this._isPlaying;
  }

  toString() {
    return `${this.gati}${this.syllable}`;
  }
};

konnakkol.Silence = class Silence extends konnakkol.Syllable {
  constructor(symbol, type) {
    super(symbol, type);
  }

  play() {
    // do nothing!
    return;
  }
};

konnakkol.repeatChunksExp = (chunksExp, repeatExp) => {
  let numRepeats = repeatExp.interpret()[0];
  numRepeats = numRepeats === undefined ? 1 : numRepeats;

  let repeatedChunks = [];
  for (let i = 0; i < numRepeats; i++) {
    repeatedChunks = repeatedChunks.concat(chunksExp.interpret());
  }
  return repeatedChunks;
};

konnakkol.semantics.addOperation('interpret', {
  Composition (thalaExp, tempoChunksExp) {
    const thala = thalaExp.interpret()[0];
    return new konnakkol.Composition(tempoChunksExp.interpret(), thala);
  },
  thala (nameExp, tExp, hExp, alaExp, mExp) {
    // TODO this should create a real thala object! with proper playback!
    return true;
  },
  TempoChunk (tempoExp, chunksExp) {
    const tempo = tempoExp.interpret()[0];
    const subchunks = chunksExp.interpret();
    return new konnakkol.TempoChunk(tempo, subchunks);
  },
  Tempo (prefixExp, tempoExp) {
    return parseInt(tempoExp.sourceString, 10);
  },
  Gati (prefixExp, gatiExp) {
    const gati = parseInt(gatiExp.sourceString, 10);
    konnakkol.defaultGati = gati;
    return gati;
  },
  Repeat (operatorExp, mulExp) {
    return parseInt(mulExp.sourceString, 10);
  },
  Chunk_normal (gatiExp, chunksExp, repeatExp) {
    const subchunks = konnakkol.repeatChunksExp(chunksExp, repeatExp);
    const gati = gatiExp.interpret()[0];
    return new konnakkol.Chunk(subchunks, 1, gati);
  },
  Chunk_paren (gatiExp, openExp, chunksExp, closeExp, repeatExp) {
    const subchunks = konnakkol.repeatChunksExp(chunksExp, repeatExp);
    const gati = gatiExp.interpret()[0];
    return new konnakkol.Chunk(subchunks, 1, gati);
  },
  ChunkDouble_recur (startExp, chunkExp, endExp) {
    return new konnakkol.Chunk([chunkExp.interpret()], 2);
  },
  ChunkDouble_base (startExp, chunksExp, endExp) {
    return new konnakkol.Chunk(chunksExp.interpret(), 2);
  },
  ChunkHalf_recur (startExp, chunkExp, endExp) {
    return new konnakkol.Chunk([chunkExp.interpret()], 0.5);
  },
  ChunkHalf_base (startExp, chunksExp, endExp) {
    return new konnakkol.Chunk(chunksExp.interpret(), 0.5);
  },
  word (syllablesExp) {
    return new konnakkol.Chunk(syllablesExp.interpret(), 1);
  },
  syllable_normal (consonantExp, vowelExp) {
    const syllable = consonantExp.sourceString + vowelExp.sourceString;
    return new konnakkol.Syllable(syllable, 'normal');
  },
  syllable_stressed (consonantExp, vowelExp) {
    const syllable = consonantExp.sourceString + vowelExp.sourceString;
    return new konnakkol.Syllable(syllable, 'stress');
  },
  silence_extension (exp) {
    return new konnakkol.Silence(exp.sourceString, 'extension');
  },
  silence_rest (exp) {
    return new konnakkol.Silence(exp.sourceString, 'rest');
  }
});

konnakkol.play = function(input, when=0.2, onended, soundLibraryKey='default') {
  const result = konnakkol.grammar.match(input);
  if (result.failed()) {
    throw Error(`Parsing failed, bad input!\n${result.message}`);
  }
  if (when < 0.2) {
    when = 0.2;
    console.log(`warning: 'when' has been set to 0.2 to ensure good sequencing`);
  }
  const node = konnakkol.semantics(result);
  const composition = node.interpret();
  const soundLibrary = konnakkol.soundLibraries[soundLibraryKey];
  const playTala = true;
  composition.play(when, {soundLibrary, playTala, onended});
  window.c = composition;
  return composition;
};
