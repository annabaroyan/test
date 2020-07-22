function load_ticket_preview(btn) {
  if (btn.dataset.tooltip == 'Загрузка...') {
    ticket_id = btn.id.split('_')[2];
    hd_query_force('/ptn/comments_ticket_list/'+ticket_id+'/').then(function(comments_list) {
      btn.dataset.tooltip = "<div style='text-align: left'>";
      if (comments_list.length) {
        comments_list.forEach(row => {
          btn.dataset.tooltip += `<p><small>${row['c_date']}</small> <b>${row['operator']['full_name']}</b></p><p>${row['c_text']}</p><hr>`;
        })
      } else {
        btn.dataset.tooltip += 'Нет комментариев для отображения';
      }
      btn.dataset.tooltip += '</div>';
      if (document.querySelector('div.tooltip')) {
        document.querySelector('div.tooltip').innerHTML = btn.dataset.tooltip;
      }
    })
  }
}

// Plugin init
function init(h) {
  if (h['new']['a'] != 0) { // Address changed
    async_querySelector('div[address-tickets-directive], div[fvno-vk-address-tickets-directive]').then(function() {
      resetContract_new().then(function(contract) {
        // Add billing addon
        /* Commented till I get correct formula
        async_querySelector('div[billing-cycle-directive]').then(function() {
          days_left = dateDiff(Date.now(), strtodate(contract.contract.billing.cycle))['d'];
          fetch(chrome.runtime.getURL("/templates/billing_addon.hbs")).then(function(data) {
        		return data.text()
        	}).then(function(data) {
        		compiledTemplate = Handlebars.compile(data);
        		document.querySelector('div[billing-cycle-directive]').innerHTML += compiledTemplate({"days_left": days_left});
            document.getElementById('cost_input').oninput = function() {
              res = days_left/30*this.value;
              document.getElementById('compensation_result').innerHTML = res.toFixed(2);
            }
          })
        })
        */
        // Add leftBlock
        get_parameter("showLeftBlock", function(val) {if (val) {
          reset_leftBlock(contract);
          if (h['new']['a'] != h['old']['a']) {
            reset_leftBlock_iframes(contract);
          }
        }})
        // Add quickTT block
        get_parameter("showQuickTT", function(val) {if (val) {reset_quickTT()}})
        // Add comment previews
        if (document.querySelectorAll('i[id^="comments_for_"]').length == 0) {
          async_querySelector('span[ng-show="prototype.is_checked"]').then(function () {
            document.querySelectorAll('tr[ng-repeat-start]').forEach(ticket_row => {
          		let ticket_id = ticket_row.id;
              let icon = addElement('i', 'comments_for_'+ticket_id, {'text-align': 'left', 'cursor': 'pointer'}, {'class': 'fa fa-list grid__box grid__box--size-min ml-4', 'data-tooltip': 'Загрузка...'})
              icon.onmouseover = function() {load_ticket_preview(this)};
          		ticket_row.querySelector('div.grid__box:not(.mr-4)').parentNode.appendChild(icon)
          	})
          })
        }

        if (h['new']['t'] != 0) {
          // Wait until ticket is loaded
          async_querySelector('button[ng-click="prototype.update_ticket_data()"]').then(function(btn) {
            // Refresh plugin when new ticket was loaded
            btn.onclick = function() {
              async_querySelector('div[address-tickets-directive] tr[ng-if="prototypes._data.loading"], div[fvno-vk-address-tickets-directive] tr[ng-if="prototypes._data.loading"]').then(function(){init(h)});
            }
            // Refresh plugin when tickets tab was clicked
            document.querySelector('li[heading="Заявки по этому адресу"]').onclick = function() {
              async_querySelector('tr[id="'+h['new']['t']+'"]').then(function(){init(h)});
            }
            // Add ticketTabs and greentable
            resetOnline_new().then(function(contract) {
              if (h['new']['t'] != 0) {
                get_parameter("showTicketTabs", function(val) {if (val) {reset_ticketTabs(contract)}})
              }
            })
          })
        }
      })
    })
  } else {
    document.body.removeChild(document.getElementById('leftBlock'))
    document.querySelectorAll('div.iframe-popup').forEach(frame=>{
      frame.remove()
    })
    contract = {}
  }
}

if ( (window.location.hash.search('schedules/technician') !== -1) && (window.self !== window.top) ) {
  async_querySelector('button[ng-click="showCalendar()"]').then(function(e) {e.click()})
}

if (window.location.hash.search('abonent/address') !== -1) {
  h = {
    'new': {'a': get_address_id(), 't': get_ticket_id()},
    'old': {'a': 0, 't': 0}
  }
  init(h);
}

Mousetrap.prototype.stopCallback = function () {return false}

Mousetrap.bind('ctrl+space', function(e) {
  if (!!document.querySelector('textarea[name="comment"]')) {
    document.querySelector('textarea[name="comment"]').value = document.querySelector('textarea[name="comment"]').value.replace(/[\s^\n]{2,}/g, " ")
  }
});

Mousetrap.bind('alt+enter', function(e) {
  if (!!document.querySelector('textarea[name="comment"]')) {
    document.querySelector('textarea[name="comment"]').value = document.querySelector('textarea[name="comment"]').value.replace(/\n/g, "<br>\n").replace(/(<br>){2,}/g, "<br>");
  }
});

Mousetrap.bind('ctrl+enter', function(e) {
  if (!!document.querySelector('button[ng-click="prototype.update_ticket_data()"]')) {
    document.querySelector('button[ng-click="prototype.update_ticket_data()"]').click()
  }
});

// Clipboard initialization
init_clipboard();

// Check new URL, reload plugin if needed
window.addEventListener("hashchange", function(e) {
  if ( e.newURL.split("#")[1].length > 1 ) {
    h = {
  		'new': {'a': get_address_id(e.newURL), 't': get_ticket_id(e.newURL)},
  		'old': {'a': get_address_id(e.oldURL), 't': get_ticket_id(e.oldURL)}
  	}
    init(h);
  }
}, false);

// Saving comment to localStorage
window.addEventListener("beforeunload", function (event) {
	if (!!document.querySelector('textarea[name="comment"]')) {
		if (document.querySelector('textarea[name="comment"]').value != '') {
			localStorage.lastComment = document.querySelector('textarea[name="comment"]').value;
		}
	}
});
