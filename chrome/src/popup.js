const clicky = document.getElementById('clicky');

clicky.addEventListener('click', event => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.executeScript(tabs[0].id, {
      code: 'window.getSelection().toString();',
      allFrames: true,
      runAt: 'document_end'
    }, results => {
      results.forEach(result => {
        if (result.length > 0) {
          chrome.runtime.sendMessage({selection: result}, response => {
            console.log("response:", response);
          });
        }
      });
    });
  });
});