const port = chrome.runtime.connect();
const key = '/konnakol';
const konnakols = Array.from(document.body.querySelectorAll('*'))
  .filter(node => (node.tagName.toUpperCase() !== 'SCRIPT') &&
                   node.children.length === 0)
  .map(node => {
    let konnakol;
    if (node.value !== undefined && node.value.includes(key)) {
      konnakol = node.value;
    }
    else if (node.textContent.includes(key)) {
      konnakol = node.textContent;
    }
    return konnakol;
  })
  .filter(node => node !== undefined);

port.postMessage(konnakols);
