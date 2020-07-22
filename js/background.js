chrome.alarms.onAlarm.addListener(function(alarm) {
  show_alarm(alarm.name)
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "notificationSet") {
    chrome.alarms.create(JSON.stringify({'title': request.title, 'url': request.url}), {delayInMinutes: request.delay})
  }
  return true;
});

function show_alarm(id) {
  data = JSON.parse(id)
  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "alarm.png",
    requireInteraction: true,
    title: data.title,
    message: "Закройте уведомление для сброса таймера",
    buttons: [
      {"title": "Открыть"}, {"title": "Отложить на 5 минут"},
    ]
  })
}

chrome.notifications.onButtonClicked.addListener(function(id, btn) {
  if (btn) {
    chrome.alarms.create(id, {delayInMinutes: 5})
  } else {
    window.open(JSON.parse(id).url)
  }
  chrome.notifications.clear(id)
})
