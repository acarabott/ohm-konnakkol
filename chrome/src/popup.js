const clicky = document.getElementById('clicky');

clicky.addEventListener('click', event => {
  chrome.runtime.sendMessage({greeting: 'hello'}, response => {
    console.log('sendMessage');
    console.log("response:", response);
  });
});