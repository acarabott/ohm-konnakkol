 konnakkol.Editor = class Editor {
  constructor(id) {
    this.key = '/konnakkol';

    this.composition;

    this.container = document.createElement('div');
    this.container.id = id;
    this.container.classList.add('konnakkol-editor');
    // text area
    this.selectionStart = 0;
    this.selectionEnd = 0;

    this.textarea = document.createElement('textarea');
    this.textarea.rows = 2;
    this.textarea.cols = 80;
    this.textarea.spellcheck = false;

    this.textarea.addEventListener('focusin', event => {
      event.target.selectionStart = this.selectionStart;
      event.target.selectionEnd = this.selectionEnd;
    });

    this.textarea.addEventListener('focusout', event => {
      this.updateSelection();
    });

    this.textarea.addEventListener('keydown', event => {
      const goodMod = ['metaKey', 'ctrlKey'].some(k => event[k]);
      const goodKey = event.key === 'Enter' || event.code === 'Space';
      if (goodMod && goodKey) {
        this.play();
      }
    });

    this.textarea.addEventListener('input', event => {
      this.updateNumberOfRows();
    });

    this.container.appendChild(this.textarea);

    // controls
    this.controls = document.createElement('div');
    this.container.appendChild(this.controls);

    this.playing = false;
    this.playButton = document.createElement('input');
    this.playButton.type = 'button';
    this.playButton.value = 'Play';
    this.playButton.classList.add('button');
    this.playButton.addEventListener('click', event => {
      this.playing ? this.stop() : this.play();
      this.updateButton();
    });

    this.controls.appendChild(this.playButton);
  }

  updateSelection() {
    this.selectionStart = this.textarea.selectionStart;
    this.selectionEnd = this.textarea.selectionEnd;
  }

  updateNumberOfRows() {
    const contentRows = this.textarea.value
                            .split('')
                            .filter(c => c === '\n').length + 1;
    this.textarea.rows = Math.max(Math.max(contentRows, this.textarea.rows), 2);
  }

  getContent() {
    this.updateSelection();
    const content =  this.selectionEnd - this.selectionStart > 0 ?
      this.textarea.value.slice(this.selectionStart, this.selectionEnd) :
      this.textarea.value;

    return content.replace(this.key, '');
  }

  setContent(content) {
    this.textarea.value = content;
    this.updateNumberOfRows();
  }

  play() {
    this.playing = true;
    this.composition = konnakkol.play(this.getContent(), 0.2, () => {
      this.playing = false;
      this.updateButton();
    });
  }

  stop() {
    this.playing = false;
    this.composition.stop();
  }

  updateButton() {
    this.playButton.value = this.playing ? 'Stop' : 'Play';
    this.playButton.classList[this.playing ? 'add' : 'remove']('playing');
  }

  getHTML() {
    return this.container;
  }
};
