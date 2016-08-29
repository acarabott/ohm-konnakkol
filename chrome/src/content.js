const port = chrome.runtime.connect();

const konnakol = {};
konnakol.key = '/konnakol';

konnakol.parse = (parent=document.body, buttonAction) => {
  const hasKonnakolKey = node => {
    return (typeof node.value === 'string' && node.value.includes(konnakol.key)) ||
            node.textContent.includes(konnakol.key);
  };

  const getNodeContent = node => {
    // input elements will use value, other elements will use textContent
    const content = node.value === undefined ? node.textContent : node.value;
    return content.replace(konnakol.key, '');
  };

  const konnakolNodes = Array.from(parent.querySelectorAll('*'))
    .filter(node => {
      return node.tagName.toUpperCase() !== 'SCRIPT' && // no scripts
             node.children.length === 0 &&              // no parent nodes
             hasKonnakolKey(node);                      // has the key we want
    });

  konnakolNodes.forEach(node =>  {
    const button = document.createElement('input');
    button.type = 'button';
    button.value = 'play';
    button.addEventListener('click', event => {
      buttonAction(getNodeContent(node), event);
    });
    node.parentElement.insertBefore(button, node.nextSibling);
  });
};

konnakol.parse(document.body, (text, event) => {
  port.postMessage(text);
});
