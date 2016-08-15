var s = g.createSemantics();

function createSyllable (consonant, vowel, extensions, stress) {
  return {
    syllable: consonant.sourceString + vowel.sourceString,
    duration: 1 + extensions.length(),
    stress: stress
  };
}

s.addOperation('interpret', {
  Phrase: function(words) {
    return words;
  },
  word: function(syllables) {
    return syllables;
  },
  syllable_simple: function(consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, false);
  },
  syllable_stressed: function(consonant, vowel, extensions) {
    return createSyllable(consonant, vowel, extensions, true);
  },
  extension_extend: function(e) {
    return e.interpret();
  },
  extension_rest: function(e) {
    return e.interpret();
  }
});