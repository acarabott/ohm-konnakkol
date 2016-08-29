chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript(tab.id, {
    file: "scripts/content.js",
    allFrames: true
  }, results => {
    results.forEach(result => {
      if (result !== null) {
        console.log("result:", result);
      }
    });
  });
});

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((message, sender, sendResponse) => {
    konnakol.play(message);
  });
});
