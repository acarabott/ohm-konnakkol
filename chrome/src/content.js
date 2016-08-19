const all = document.body.querySelectorAll('*');
const port = chrome.runtime.connect();
const konnakols = [];

const key = '/konnakol';

for (let node of all) {
  if (node.children.length !== 0) {
    continue;
  }

  if (node.value !== undefined && node.value.includes(key)) {
    konnakols.push(node.value);
    continue;
  }

  if (node.textContent.includes(key)) {
    konnakols.push(node.textContent);
    continue;
  }
}

port.postMessage(konnakols);
