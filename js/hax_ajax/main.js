// Empty old cache on each page reload
window.json_cache = window.json_cache || {};

// Trimming trailing slashes and splitting into array if string is passed.
function prep(s) {
  try {s = new URL(s).pathname}catch(err){} // Some assets are loaded using full URL
  return (Array.isArray(s) ? s : s.replace(/^\/|\/$/g, "").split('/'));
}

// Parsing URL into tree structure recursively to save data in nice object
function saveData(url, data=false, parent=window.json_cache) {
  url = prep(url);
  if (url.length > 1) {
    path = url.shift();
    if (!(path in parent)) parent[path] = {};
    saveData(url, data, parent[path]);
  } else {
    parent[url[0]] = data;
  }
}

// Loading data from cache object
function loadData(url, parent=window.json_cache) {
  url = prep(url);
  data = 0
  if (url.length > 1) {
    path = url.shift();
    if (!(path in parent)) return data;
    loadData(url, parent[path]);
  } else {
    data = (parent[url[0]] ? parent[url[0]] : 0);
  }
  return data
}

// Inject custom XHR definition into page
var s = document.createElement('script');
s.src = chrome.extension.getURL('/js/hax_ajax/hack.js');
s.onload = function() {
   this.remove();
};
(document.head || document.documentElement).appendChild(s);

// Listen to our injection callbacks
window.addEventListener("message", function(event) {
  if (event.data.type == "ajaxStart") {
    saveData(event.data.url);
  } else if (event.data.type == "ajaxEnd") {
    saveData(event.data.url, event.data.payload)
  }
  return true;
});
