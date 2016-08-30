const port = chrome.runtime.connect();

// this should live in a konnakol parser module
const key = '/konnakol';
const buttonClass = 'konnakol-play-button';
const buttons = [];

function hasKonnakolKey(node) {
  return (typeof node.value === 'string' && node.value.includes(key)) ||
          node.textContent.includes(key);
}

function getNodeContent(node) {
  // input elements will use value, other elements will use textContent
  const content = node.value === undefined ? node.textContent : node.value;
  return content.replace(key, '');
}

function createPlayButtonFor(node, buttonAction) {
  const button = document.createElement('input');
  button.type = 'button';
  button.value = 'play';
  button.classList.add(buttonClass);

  let content = getNodeContent(node);
  button.addEventListener('click', event => {
    buttonAction(content, event);
  });
  node.parentElement.insertBefore(button, node.nextSibling);

  if (['textarea', 'input'].includes(node.tagName.toLowerCase())) {
    node.addEventListener('input', event => {
      content = getNodeContent(node);
    });
  }
}

function getKonnakolNodes(parent=document.body) {
  return Array.from(parent.querySelectorAll('*'))
    .filter(node => {
      return node.tagName.toUpperCase() !== 'SCRIPT' && // no scripts
             node.children.length === 0 &&              // no parent nodes
             hasKonnakolKey(node);                      // has the key we want
    });
}

function addPlayButtons (arrayOfNodes, buttonAction) {
  arrayOfNodes.forEach(node => createPlayButtonFor(node, buttonAction));
}

function removePlayButtons() {
  for (const node of document.getElementsByClassName(buttonClass)) {
    console.log('removing', node);
    node.remove();
  }
}

function parse(parent, buttonAction) {
  removePlayButtons();
  addPlayButtons(getKonnakolNodes(parent), buttonAction);
}

// end of konnakol parser module

// 'main'
const parent = document.body;
const buttonAction = (text, event) => port.postMessage(text);
parse(parent, buttonAction);
