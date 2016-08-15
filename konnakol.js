var grammar = ohm.grammarFromScriptElement();

var examples = [
  'ta', 'taka', 'takadimi', 'dadiginadom', 'Takadimi', 'da,di,gi,nakadom,'
];

examples.forEach(function(example) {
  console.log(example, grammar.match(example).succeeded());
});


var semantics = grammar.createSemantics();

function createSyllable (consonant, vowel, extensions, stress) {
  return {
    syllable: consonant.sourceString + vowel.sourceString,
    duration: 1 + extensions.interpret().length,
    stress: stress
  };
}

function createPhrase (words) {
  return {
    words: words,
    play: function() {
      console.log(words);
      return words;
    }
  }
}

semantics.addOperation('interpret', {
  Phrase: function(words) {
    return createPhrase(words.interpret());
  },
  word: function(syllables) {
    return syllables.interpret();
  },
  syllable_simple: function(consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, false);
  },
  syllable_stressed: function(consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, true);
  },
  extension_extend: function(exp) {
    return exp.interpret();
  },
  extension_rest: function(exp) {
    return exp.interpret();
  }
});

var result = grammar.match('ta');
var node = semantics(result);
var phrase = node.interpret();
console.log(phrase.play());