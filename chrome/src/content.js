const port = chrome.runtime.connect();
const key = '/konnakol';

function hasKonnakolKey (node) {
  return (node.value !== undefined && node.value.includes(key)) ||
          node.textContent.includes(key);
}

function getKonnakolContent (element) {
  return element.value === undefined ? element.textContent : element.value;
}

const konnakolNodes = Array.from(document.body.querySelectorAll('*'))
  .filter(node => {
    return node.tagName.toUpperCase() !== 'SCRIPT' && // no scripts
           node.children.length === 0 &&              // no parent nodes
           hasKonnakolKey(node);                      // has the key we want
  });

function addPlayButton (element) {
  const button = document.createElement('input');
  button.type = 'button';
  button.value = 'play';
  button.addEventListener('click', event => {
    port.postMessage([getKonnakolContent(element)]);
  });
  element.parentElement.insertBefore(button, element.nextSibling);
}

konnakolNodes.forEach(konnakol => addPlayButton(konnakol));
