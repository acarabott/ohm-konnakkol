
konnakkol.editors = [];

konnakkol.Editor = class Editor {
  constructor(id) {
    konnakkol.editors.push(this);
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
        this.togglePlaybackUpdateButton();
      }

      this.errorBox.style.visibility = 'hidden';
    });

    this.textarea.addEventListener('input', event => {
      this.updateNumberOfRows();
    });

    this.container.appendChild(this.textarea);

    // controls
    this.controls = document.createElement('div');
    this.container.appendChild(this.controls);

    this.isPlaying = false;
    this.playButton = document.createElement('input');
    this.playButton.type = 'button';
    this.playButton.value = 'Play';
    this.playButton.classList.add('button');
    this.playButton.addEventListener('click', event => {
      this.togglePlaybackUpdateButton();
    });

    this.controls.appendChild(this.playButton);

    this.errorBox = document.createElement('span');
    this.errorBox.classList.add('errorBox');
    this.errorBox.textContent = "There's a mistake in your konnakol!";
    this.errorBox.style.visibility = 'hidden';
    this.controls.appendChild(this.errorBox);

    // TODO hardcoded default sound library
    if (!konnakkol.soundLibraries.hasOwnProperty('default')) { this.disable(); }
  }

  updateSelection() {
    this.selectionStart = this.textarea.selectionStart;
    this.selectionEnd = this.textarea.selectionEnd;
  }

  updateNumberOfRows() {
    const contentRows = this.textarea.value
                            .split('')
                            .filter(c => c === '\n').length + 1;
    this.textarea.rows = Math.max(contentRows, 2);
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
    if (!konnakkol.soundLibraries.hasOwnProperty('default')) { return; }

    try {
      this.composition = konnakkol.play(this.getContent(), 0.2, () => {
        this.isPlaying = false;
        this.updateButton();
      }, 'default'); // TODO hardcoded default sound library
      this.isPlaying = true;
    } catch (e) {
      console.log(e);
      // debugger;
      // throw e; //TODO remove in production
      this.errorBox.style.visibility = 'visible';
    }
  }

  stop() {
    this.isPlaying = false;
    this.composition.stop();
  }

  togglePlayback() {
    this.isPlaying ? this.stop() : this.play();
  }

  updateButton() {
    this.playButton.value = this.isPlaying ? 'Stop' : 'Play';
    this.playButton.classList[this.isPlaying ? 'add' : 'remove']('playing');
  }

  togglePlaybackUpdateButton() {
    if (this.isEnabled()) {
      this.togglePlayback();
      this.updateButton();
    }
  }

  enable() {
    this.container.classList.remove('disabled');
  }

  disable() {
    this.container.classList.add('disabled');
  }

  isEnabled() {
    return !this.container.classList.contains('disabled');
  }

  getHTML() {
    return this.container;
  }
};
