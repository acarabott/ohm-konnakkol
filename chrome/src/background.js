function executeParse (tabId) {
  chrome.tabs.executeScript(tabId, {
    file: "scripts/content.js",
    allFrames: true
  }, results => {
    results.forEach(result => {
      if (result !== null) {
        console.log("result:", result);
      }
    });
  });
}

chrome.browserAction.onClicked.addListener(tab => {
  executeParse(tab.id);
});

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((message, sender, sendResponse) => {
    konnakol.play(message);
  });
});

chrome.contextMenus.removeAll();

const menuOptions = [
  {
    args: {
      id: 'play',
      title: 'Konnakol: Play Selection',
      contexts: ['selection']
    },
    action: (info, tab) => {
      konnakol.play(info.selectionText);
    }
  },
  {
    args: {
      id: 'parse',
      title: 'Konnakol - add play buttons',
      contexts: ['page']
    },
    action: (info, tab) => {
      executeParse(tab.id);
    }
  }
];

menuOptions.forEach(options => {
  chrome.contextMenus.create(options.args);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  menuOptions.find(opts => opts.args.id === info.menuItemId).action(info, tab);
});