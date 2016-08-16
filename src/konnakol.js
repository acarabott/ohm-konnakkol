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

function createPhrase (words) {
  return {
    words,
    play (soundLibrary, when=0) {
      words.forEach(word => word.play(soundLibrary, when));
    }
  }
}

function createWord (syllables) {
  return {
    syllables,
    play (soundLibrary, when=0) {
      let syllableWhen = when;
      syllables.forEach((syllable, i) => {
        syllable.play(soundLibrary, syllableWhen);
        syllableWhen += syllable.duration;
      });
    }
  }
}

function createSyllable (consonant, vowel, extensions, type) {
  const that = {
    type,
    syllable: consonant.sourceString + vowel.sourceString,
    duration: 1 + extensions.interpret().length,
    play (soundLibrary, when=0) {
      const buffer = soundLibrary.get(that.syllable, that.type);
      playSample(buffer, when);
    }
  };

  return that;
}

semantics.addOperation('interpret', {
  Phrase (words) {
    return createPhrase(words.interpret());
  },
  word (syllables) {
    return createWord(syllables.interpret());
  },
  syllable_normal (consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, 'normal');
  },
  syllable_stressed (consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, 'stress');
  },
  extension_extend (exp) {
    return exp.interpret();
  },
  extension_rest (exp) {
    return exp.interpret();
  }
});

const examples = [
  'ta', 'taka', 'takadimi', 'dadiginadom', 'Takadimi', 'da,di,gi,nakadom,'
];

// examples.forEach(example => {
//   console.log(example, grammar.match(example).succeeded());
// });

function main (soundLibrary) {
  const result = grammar.match('takadimi takajuna');
  const node = semantics(result);
  const phrase = node.interpret();

  phrase.play(soundLibrary);
}

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
    main(createSoundLibrary(soundLibraryLookup));
  });
}

setup();