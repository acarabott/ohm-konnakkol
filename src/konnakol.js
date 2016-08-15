const grammar = ohm.grammarFromScriptElement();

const examples = [
  'ta', 'taka', 'takadimi', 'dadiginadom', 'Takadimi', 'da,di,gi,nakadom,'
];

examples.forEach(example => {
  console.log(example, grammar.match(example).succeeded());
});


const semantics = grammar.createSemantics();

function createSyllable (consonant, vowel, extensions, stress) {
  return {
    stress,
    syllable: consonant.sourceString + vowel.sourceString,
    duration: 1 + extensions.interpret().length
  };
}

function createPhrase (words) {
  return {
    words,
    play () {
      console.log(words);
      return words;
    }
  }
}

semantics.addOperation('interpret', {
  Phrase (words) {
    return createPhrase(words.interpret());
  },
  word (syllables) {
    return syllables.interpret();
  },
  syllable_simple (consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, false);
  },
  syllable_stressed (consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, true);
  },
  extension_extend (exp) {
    return exp.interpret();
  },
  extension_rest (exp) {
    return exp.interpret();
  }
});

const result = grammar.match('ta');
const node = semantics(result);
const phrase = node.interpret();
console.log(phrase.play());