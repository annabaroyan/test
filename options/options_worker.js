default_user = {
  'group': 0,
  'username': '',
  'emp_number': 0,
  'avaya': 0
}

default_settings = {
  'resizeOpt': false,
  'modifyTitle': true,
  'nightMode': false,
  'showTicketTabs': true,
  'createInNewTab': false,
  'showLeftBlock': true,
  'showQuickTT': true,
  'defaultTab': 1
}

function getCookie(name) {
  var cookie = " " + document.cookie;
  var search = " " + name + "=";
  var setStr = null;
  var offset = end = 0;
  if (cookie.length > 0) {
    offset = cookie.indexOf(search);
    if (offset != -1) {
      offset += search.length;
      end = cookie.indexOf(";", offset)
      if (end == -1) {end = cookie.length};
      setStr = unescape(cookie.substring(offset, end));
    }
  }
  return(setStr);
}

// CHROME.STORAGE GET/SET FUNCTIONS
// Get parameter by key. Using 'all' as key returns all settings.
function get_parameter(key, callback) {
  chrome.storage.sync.get('settings', function(arr) {
    if (!arr.settings) {arr.settings = default_settings}; // Init if needed
    if (key == 'all') {
      for (var param in default_settings) {
        if (default_settings.hasOwnProperty(param)) {
          console.log(param);
          if (!param in arr.settings) {
            arr.settings[param] = default_settings[param];
            console.log('added '+param);
          }
        }
      }
      callback(arr.settings);
    } else {
      if (!key in arr.settings) {arr.settings[key] = default_settings[key]} // Check consistency
      callback(arr.settings[key]);
    }
    chrome.storage.sync.set({'settings': arr.settings})
  })
}

// Set parameters. Use {key: value} object.
function set_parameter(settings_object, callback=false) {
  chrome.storage.sync.get('settings', function(arr) {
    if (!arr.settings) {arr.settings = default_settings}; // Init if needed
    for (var key in settings_object) {
      if (settings_object.hasOwnProperty(key)) {
        arr.settings[key] = settings_object[key];
      }
    }
    chrome.storage.sync.set({'settings': arr.settings})
    if (callback) {callback(arr.settings)};
  })
}

// Get user info
function get_user(callback) {
  chrome.storage.sync.get('user', function(arr) {
    if (!arr.user) {arr.user = default_user}; // Init if needed
    if (arr.user['login'] != getCookie('corbina-helpdesk').split('-')[0]) { // Check consistency
      hd_query('/ptn/hd_auth/', 'POST', {'method': 'CHECK_AUTH'}).then(function(data) {
        Object.assign(arr.user, {
          'group': data['group_id'],
          'login': data['u_login'],
          'username': data['u_name'],
          'emp_number': data['u_employee_no'],
          'avaya': data['u_phone']
        });
        callback(arr.user);
        chrome.storage.sync.set({'user': arr.user})
      });
    } else {
      callback(arr.user);
      chrome.storage.sync.set({'user': arr.user})
    }
  })
}

function apply_body_zoom() {
  max_width = (window.self == window.top) ? 1760 : 1000;
  document.body.style.zoom = (window.innerWidth < max_width) ? window.innerWidth/max_width : ""
}

// Apply settings
if (getCookie('corbina-helpdesk')) {
  get_user(function(user) {
    localStorage.operatorGroup = user['group']
  });
  // Append darkmode CSS
  get_parameter('nightMode', function(val) { if (val) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', chrome.runtime.getURL("/css/darkmode.css"));
    document.getElementsByTagName('head')[0].appendChild(link);
  }})

  // Adaptive scaling
  get_parameter('resizeOpt', function(val) { if (val) {
    window.addEventListener('resize', apply_body_zoom, true);
    document.addEventListener('DOMContentLoaded', apply_body_zoom);
  }})
}
