// Saves settings to chrome.storage, shows message.
function save_options(settings, message) {
  set_parameter(settings, function(arr) {
    var status = document.getElementById('status');
    status.textContent = message;
    setTimeout(function() {status.textContent = ''}, 1000);
  })
}

// Load settings from chrome.storage into page
function restore_options() {
  get_parameter('all', function(settings) {
    for (var key in settings) {
      if (settings.hasOwnProperty(key)) {
        if (key == 'defaultTab') {
          document.getElementById('defaultTab').value = settings[key]
        } else if (!!document.getElementById(key)) {
          document.getElementById(key).checked = settings[key]
        }
      }
    }
  })
}

window.addEventListener('pageshow', function(event) {
  restore_options()
});

document.getElementById('save').addEventListener('click', function (){
  save_options({
    'resizeOpt': document.getElementById('resizeOpt').checked,
    'modifyTitle': document.getElementById('modifyTitle').checked,
    'nightMode': document.getElementById('nightMode').checked,
    'showTicketTabs': document.getElementById('showTicketTabs').checked,
    'createInNewTab': document.getElementById('createInNewTab').checked,
    'showLeftBlock': document.getElementById('showLeftBlock').checked,
    'showQuickTT': document.getElementById('showQuickTT').checked,
    'defaultTab': document.getElementById('defaultTab').value,
  }, 'Настройки сохранены!')
});

document.getElementById('reset').addEventListener('click', function (){
  save_options(default_settings, 'Сброс настроек завершен!')
});
