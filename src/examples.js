function makeExample(id, content, title, instructionHTML='') {
  const container = document.createElement('div');
  container.id = id;

  if (title.length > 0) {
    const header = document.createElement('h2');
    header.textContent = title;
    container.appendChild(header);
  }

  if (instructionHTML.length > 0) {
    const instructions = document.createElement('div');
    instructions.innerHTML = instructionHTML;
    instructions.classList.add('instructions');
    container.appendChild(instructions);
  }

  const editor = new konnakkol.Editor(`${id}-editor`);
  editor.setContent(content);
  container.appendChild(editor.getHTML());

  return { container, editor };
}

function addExample (id, content, title, instructionHTML) {
  const example = makeExample(id, content, title, instructionHTML);
  document.getElementById('container').appendChild(example.container);
  return example;
}

function addExamples() {
  addExample(
    'basic-play',
    'nakathadhimathadhimi',
    'Play button',
    'Syllables and phrases can be written and played with the play button'
  );

  const keyCommand = addExample(
    'key-command',
    'nakathadhimathadhimi',
    'Keyboard shortcut',
    `You can also use a keyboard shortcut:
    <ol>
      <li>Click on the textbox</li>
      <li>Press
        <ul>
          <li>Mac: <span class="code">cmd return</span></li>
          <li>Windows / Linux: <span class="code">ctrl return</span></li>
          <li>Universal: <span class="code">ctrl space</span></li>
        </ul>
      </li>
    </ol>`);
  keyCommand.editor.playButton.remove();

  const selectionExample = `dhadhikinathom dhadhikinathom`;
  const selection = addExample(
    'selection',
    selectionExample,
    'Selection playback',
    'You can play just a part of the text by selecting it'
  );

  selection.editor.selectionStart = selectionExample.indexOf(' ') + 1;
  selection.editor.selectionEnd = selectionExample.length;

  addExample(
    'spaces',
    `taka dimi taka janu
  takita takita taka`,
    'Whitespace',
    'Spaces and new lines are ignored, so you can format as you like'
  );

  addExample(
    'syllables',
    `ma la da ta
  khe khu khi kki
  tam tom tham thom
  tha lang - gu tom`,
    'Syllables',
    `You can make up your own syllables!
     <ul>
       <li>They must start with a consonant</li>
       <li>There must be one vowel</li>
       <li>You can have multiple vowels or consonants, e.g. tha or taa</li>
       <li>Consonants at the end are also ok, as long as there is no vowel after them</li>
     </ul>`
  );

  addExample(
    'tala',
    `tala
  thadhimi thadhimi
  thadhimi thadhimi
  tom`,
    'Tala',
    `If you want to hear the pulse clapped, just type <span class="code">tala</span>
     at the start of the example`
  );

  addExample(
    'rests',
    `tala
  dha---dhi---ki---na---thom---
  dha--dhi--ki--na--thom--
  dha-dhi-ki-na-thom-
  dhadhikinathom tom ,
  dhadhikinathom tom ,
  dhadhikinathom tom`,
    'Rests/extensions',
    `You can extend a syllable by one akshara with <span class="code">-</span>
    or <span class="code">,</span>`
  );

  addExample('rests-2',
    `takadimi takajanu
  takadimi takajanu
  - dhadhikinathom dhadhikinathom dhadhikinathom
  tom`,
  '',
  'Rests can also go at the start of a phrase'
  );

  addExample('stresses',
    `Ta ka ta ki Ta
  ta ka ta Ki ta
  ta ka Ta ki ta
  ta Ka ta ki ta
  Tham`,
    'Stresses',
    'Stresses can be added by capitalising the consonant of a syllable'
  );

  addExample('doubles',
    `Takadimi {Takadimi Takajanu} Tham`,
    'Double speed',
    `Use <span class="code">{</span> and <span class="code">}</span> around your
    konnakkol to double the speed`
  );

  addExample('multi-double',
    `Takadimi {takadimi} {{takadimi takadimi}} Tham`,
    '',
    'You can double as many times as you like'
  );

  addExample('nested-double',
    `{ Dhadiki{naka}thom Dhadiki{naka}thom Dhadiki{naka}thom} Tham`,
    '',
    'Or have nested doubling (doubles inside doubles)'
  );

  addExample('half-speed',
    `Takadimi [Takadimi]
  [Takadimi [Taka]] Tham
    `,
    'Half speed',
    `For half speed use <span class="code">[</span> and
    <span class="code">]</span>, it works just like doubling`
  );

  addExample('mixed',
    `[Ta , ka , Ta ki ta]
  [Ta ka] Takita [Ta ka] Takita
  {[Ta ka] Takita [Ta ka] Takita} Tham`,
    'Mixed speed',
    'You can even mix double and half speed'
  );

  addExample('gati',
    `Takadimi Takajanu
  g3 Takita Takita
  g5 Dhadhikinathom Dhadhikinathom
  g4 Kitathaka Kitathaka
  g3 Kitathaka Kitathaka Kitathaka
  Tom`,
    'Gati',
    `The gati can be changed with <span class="code">gN</span> where
    <span class="code">N</span> is the number of aksharas per beat <br>
    By default the gati is chatusra (4)`
  );

  addExample('tempo',
    `tempo 120 takadimi takadimi takadimi takadimi
  kala 90 takadimi takadimi takadimi takadimi`,
    'Tempo / Kala',
    `Set the tempo with either <span class="code">tempo N</span> or
    <span class="code">kala N</span>`
  );

  addExample('repeats',
    `takadimi x 2`,
    'Repeats',
    `Phrases can be repeated by using <span class="code">x N</span> (spaces
    don't matter, <span class="code">x3</span> and <span class="code">x 3</span>
    are both ok`
  );

  addExample('repeats-parens',
    `(taka x2 takita) x2`,
    'Brackets',
    `Round brackets can be used to disambiguate repeats`
  );

  addExample('repeats-parens-without',
    `taka x2 takita x2`,
    '',
    `without the brackets this would be: <span class="code">(taka x2) (takita x2)</span>`
  );

  addExample('homework',
    `((Takadimi x 7) TakaTakita) x 3
  ((Takadimi x 6) TakaTakita) Tom`,
    '',
    `This makes it easy to write out exercises like this classic`
  );

  const free = addExample('free',
    ``,
    'Go wild!',
    `<p>Write your own! All of the examples on this page are editable, so feel
    free to edit and play with them too.</p>

    <table>
      <tbody>
        <tr>
          <td>Syllables</td>
          <td>
            start with a consonant, must have a vowel
            <span class="code">ta tha tham</span>
          </td>
        </tr>
        <tr>
          <td>Rest/extension</td>
          <td><span class="code">-</span> or <span class="code">,</span></td>
        </tr>
        <tr>
          <td>Stresses</td>
          <td>Upper case <span class="code">TakaTakita</span></td>
        </tr>
        <tr>
          <td>Double Speed</td>
          <td><span class="code">{ takadimi } {{takadimi}}</span></td>
        </tr>
        <tr>
          <td>Half Speed</td>
          <td><span class="code">[ takadimi ] [[ takadimi ]]</span></td>
        </tr>
        <tr>
          <td>Gati</td>
          <td><span class="code">g3 g4 g5</span> etc...</td>
        </tr>
        <tr>
          <td>Repeats</td>
          <td><span class="code">takadimi x2</span> use brackets if necessary
            <span class="code">(takadimi x 2)</span>
          </td>
        </tr>
      </tbody>
    </table>
    `
  );

  free.editor.textarea.rows = 8;
}


function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(addExamples);