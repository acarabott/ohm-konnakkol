 konnakol.Editor = class Editor {
  constructor(id) {
    this.key = '/konnakol';

    this.container = document.createElement('div');
    this.container.id = id;
    this.container.classList.add('konnakol-editor');

    // text area
    this.selectionStart = 0;
    this.selectionEnd = 0;

    this.textarea = document.createElement('textarea');
    this.textarea.rows = 2;
    this.textarea.cols = 80;
    this.textarea.classList.add('textarea');

    this.textarea.addEventListener('focusin', event => {
      event.target.selectionStart = this.selectionStart;
      event.target.selectionEnd = this.selectionEnd;
    });

    this.textarea.addEventListener('focusout', event => {
      this.updateSelection();
    });

    this.textarea.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.metaKey) {
        this.play();
      }
    });

    this.container.appendChild(this.textarea);

    // controls
    this.controls = document.createElement('div');
    this.container.appendChild(this.controls);

    this.playButton = document.createElement('input');
    this.playButton.type = 'button';
    this.playButton.value = 'Play';
    this.playButton.classList.add('button');

    this.playButton.addEventListener('click', event => {
      this.play();
    });
    this.controls.appendChild(this.playButton);
  }

  updateSelection() {
    this.selectionStart = this.textarea.selectionStart;
    this.selectionEnd = this.textarea.selectionEnd;
  }

  getContent() {
    this.updateSelection();
    return this.selectionEnd - this.selectionStart > 0 ?
      this.textarea.value.slice(this.selectionStart, this.selectionEnd) :
      this.textarea.value;
  }

  setContent(content) {
    this.textarea.value = content;
    this.textarea.rows = content.split('').filter(c => c === '\n').length + 1;
  }

  play() {
    konnakol.play(this.getContent().replace(this.key, ''));
  }
};
