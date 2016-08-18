chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript(tab.id, {
      code: 'window.getSelection().toString();',
      allFrames: true,
      runAt: 'document_end'
    }, results => {
      results.forEach(result => {
        play(result, 0.2);
        // if (result.length > 0) {
        //   chrome.runtime.sendMessage({selection: result}, response => {
        //     console.log("response:", response);
        //   });
        // }
      });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.selection);
})