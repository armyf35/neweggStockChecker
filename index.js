const open = require('open');

const baseUrl = 'https://www.newegg.com/LandingPage/ItemInfo4ProductDetail2016.aspx?Item=';
const productBaseUrl = 'https://www.newegg.com/Product/Product.aspx?Item=';

let intervals = [];

function stopCheck(index) {
  if (intervals[index]) {
    clearInterval(intervals[index]);

    document.getElementById('output' + index).innerHTML = 'Stopped';
  }
}

function loadUrl(url) {
  return fetch(url)
    .then(res => res.text())
    .then(body => {
      const stockString = body.match(/"instock":(.*?),/g).pop();
      const instock = stockString.slice(0, stockString.length - 1).substr(10);

      return instock == 'true';
    });
}

function startCheck(index) {
  stopCheck();

  const displayName = document.getElementById('displayName' + index).value;
  const itemNum = document.getElementById('itemNum' + index).value;
  const itemId = itemNum.substr(-8);
  const itemUrl = `${baseUrl}${itemId.substr(0, 2)}-${itemId.substr(2, 3)}-${itemId.substr(5, 3)}`;
  const seconds = document.getElementById('time' + index).value || 60;
  let countdown = seconds;

  document.getElementById('output' + index).innerHTML = `Checking for ${displayName} - ${itemNum} in ${countdown} seconds`;

  intervals[index] = setInterval(() => {
    countdown--;
    document.getElementById('output' + index).innerHTML = `Checking for ${displayName} - ${itemNum} in ${countdown} seconds`;
    if (countdown <= 0) {
      countdown = seconds;
      loadUrl(itemUrl)
        .then((instock) => {
          if (instock) {
            stopCheck(index)
            open(productBaseUrl + itemNum);
            document.getElementById('output' + index).innerHTML = `<a href="${productBaseUrl}${itemNum}" target="_blank">${displayName} - ${itemNum} is in Stock!</a>`;
          }
        });
    }
  }, 1000);
}

function addCheck() {
  index = intervals.length;
  intervals[index] = null;

  const div = document.createElement('div');

  div.innerHTML = `<input type="text" name="displayName" id="displayName${index}">
    <input type="text" name="itemNum" id="itemNum${index}">
    <input type="number" name="time" id="time${index}">
    <button onclick="startCheck(${index})">Start Check</button>
    <button onclick="stopCheck(${index})">Stop</button>
    <button onclick="removeCheck(${index}, this)">Remove</button>
    <p id=output${index}></p>`;

  document.getElementById('checks').appendChild(div);
}

function removeCheck(index, input) {
  stopCheck(index);
  intervals[index] = null;
  document.getElementById('checks').removeChild(input.parentNode);
}
