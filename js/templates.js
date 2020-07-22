function reset_leftBlock_iframes(contract) {
	fetch(chrome.runtime.getURL("/templates/leftBlock_iframes.hbs")).then(function(data) {
		return data.text()
	}).then(function(data) {
		compiledTemplate = Handlebars.compile(data);
		var leftBlock_iframes = addElement('div', 'leftBlock_iframes', {'z-index': '3'});
		leftBlock_iframes.innerHTML = compiledTemplate(contract);
		document.body.appendChild(leftBlock_iframes);
		return resetOnline_new();
	}).then(function(contract) {
		if (contract["contract"]["fvno"]) {return 0} // Don't need diag on GVNO
		// Generate POST body to send to baobab
		echelon = (contract.greentable.echelon <= 0 ? 0 : contract.greentable.echelon)
		post_body = {
			login: ('ipoe_data' in contract.session ? contract.session.ipoe_data.mac : contract.contract.alias),
			devices: {
				tkd: {'ip': contract.greentable.ip, 'echelon': echelon},
				agg: {'ip': contract.greentable.agg, 'echelon': echelon},
				bras: {'ip': contract.session.ip.bras, 'echelon': echelon}
			},
			address: contract.address,
			network: {
				'client_port': contract.greentable.port,
				'contype': contract.greentable.contype,
				'sesstype': (contract['session']['online'] ? contract.session.sesstype : 0)
			}
		}

		if (contract.greentable.gate) {
			post_body['devices']['gate'] = {'ip': contract.greentable.gate, 'echelon': echelon}
		}

		if (contract.session.ip.bras_no_policy) {
			post_body['devices']['bras_no_policy'] = {'ip': contract.session.ip.bras_no_policy, 'echelon': echelon}
		}

		if (contract.tickets.selected) {
			post_body["ticket"] = {
				'id': contract.tickets.selected,
				'number': contract.tickets[contract.tickets.selected].number,
				'type': contract.tickets[contract.tickets.selected].type.id,
			}
		}

		// Request to update cache.userdata
		fetch(window.location.protocol+'//baobab.vimpelcom.ru/cache/'+contract.contract.ctn, {
			method: 'POST',
			mode: 'no-cors',
			credentials: 'include',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(post_body)
		}).then(function() {
			frames.btnDiagFrame.src = frames.btnDiagFrame.src;
			// Request to start worker
			fetch(window.location.protocol+'//baobab.vimpelcom.ru/worker/'+contract.contract.ctn, {
				mode: 'no-cors',
				credentials: 'include'
			});
		})
	})
}

function reset_leftBlock(contract) {
	fetch(chrome.runtime.getURL("/templates/leftBlock.hbs")).then(function(data) {
		return data.text()
	}).then(function(data) {
		// Adding LeftBlock
		if (!!document.getElementById('leftBlock')) {document.getElementById('leftBlock').remove()};
    compiledTemplate = Handlebars.compile(data);
		var leftBlock = addElement('div', 'leftBlock', {
			'text-align': 'center',
			'width': '95px',
			'height': '100%',
			'position': 'fixed',
			'left': '0',
			'top': '0',
			'overflow': 'auto',
			'padding': '5px',
			'background': '#DBDEE9',
			'font-size': '1em',
			'line-height': '1.5em'
		});
  	document.body.style.width = "95%"; document.body.style.marginLeft = "5%"
		leftBlock.innerHTML = compiledTemplate(contract);
		document.body.appendChild(leftBlock);

		// Close opened popups (because we have no fa-times icon anymore and toggle_window breaks)
		document.querySelectorAll('.iframe-popup').forEach(function(e) {
			e.style.display = "none";
		})

		// Tooltips for buttons
		var showingTooltip;

    document.onmouseover = function(e) {
			var target = e.target;
      var tooltip = target.getAttribute('data-tooltip');
      if (!tooltip) return;

      var tooltipElem = document.createElement('div');
      tooltipElem.className = 'tooltip';
      tooltipElem.innerHTML = tooltip;
      document.body.appendChild(tooltipElem);

      var coords = target.getBoundingClientRect();
      var left = coords.left + target.offsetWidth + 5;
      var top = coords.top - 5;

      tooltipElem.style.left = left + 'px';
      tooltipElem.style.top = top + 'px';
      showingTooltip = tooltipElem;
    };

    document.onmouseout = function(e) {
      if (showingTooltip) {
        document.body.removeChild(showingTooltip);
        showingTooltip = null;
      }
    };

		if (contract.tickets.selected) {
			let btnReturn = document.getElementById('btnReturn')
			if (!btnReturn) {
				btnReturn = document.createElement("div")
				btnReturn.id = 'btnReturn'
				btnReturn.setAttribute('class', 'anchor-menu__item cur-pointer padding-4 mt-8 mb-8')
				btnReturn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>'
				document.querySelector("div.anchor-menu__wrapper").appendChild(btnReturn)
			}
			btnReturn.onclick = function() {
				scrollToElement(document.getElementById(contract.tickets.selected))
			}
		}

		// Nav buttons
		tickets_card = document.querySelector('div.mb-16.card')
		document.getElementById('btnConnectionTicket').onclick = function() {scrollToElement(
			contract.tickets.connectionRequest.id ? document.getElementById(contract.tickets.connectionRequest.id) :tickets_card
		)};
		// Notification button
		document.getElementById("btnReminder").onclick = function() {
			  chrome.runtime.sendMessage({
			    type: "notificationSet",
			    title: (contract.tickets.selected ? "Заявка "+contract.tickets[contract.tickets.selected].number : "Логин "+contract.contract.ctn),
			    url: window.location.href,
			    delay: parseInt(document.getElementById('alert_delay').value)
			  });
			  alert('Таймер установлен и сработает через '+document.getElementById('alert_delay').value+' минут')
		}

		// Iframe buttons
		document.getElementById('btnSearch').onclick = function() {toggle_window(document.getElementById('btnSearch'))}
		document.getElementById('btnLinks').onclick = function() {toggle_window(document.getElementById('btnLinks'))}
		document.getElementById('btnPorts').onclick = function() {toggle_window(document.getElementById('btnPorts'))}
		document.getElementById('btnEquipment').onclick = function() {toggle_window(document.getElementById('btnEquipment'))}
		document.getElementById('btnDiag').onclick = function() {toggle_window(document.getElementById('btnDiag'))}
		document.getElementById('btnTech').onclick = function() {toggle_window(document.getElementById('btnTech'))}
		if (localStorage.operatorGroup != 2) {
			document.getElementById('btnLastmile').onclick = function() {
				toggle_window(document.getElementById('btnLastmile'))
			}
		}


		// make btnTech visible if needed
		if (get_ticket_id()) {
			async_querySelector('a[href^="#/schedules/technician/"]').then(function(e) {
				document.getElementById('btnTech').style.display = (!!e ? "block" : "none");
			})
		}

		// Clock
		function clock_updater() {
			if (document.getElementById("timeLocal")) {
				var today = date_now(contract.time_shift);
				var h = today.getHours()
				let clock = document.getElementById('timeImg').classList
				if (h > 21 || h < 8) {
					color = "red";
					if (!clock.contains("red-color")) {clock.add("red-color")}
				} else {
					color = "black";
					if (clock.contains("red-color")) {clock.remove("red-color")}
				}
				document.getElementById("timeLocal").innerHTML = '<font size="3" color="'+color+'">'+lead0(h)+':'+lead0(today.getMinutes())+'</font>';
				setTimeout(clock_updater, 1000)
			}
		}
		clock_updater()

		// Add Ticketnumber to title
	  get_parameter('modifyTitle', function(val) { if (val) {
	    if (get_ticket_id()) {
	      document.title = contract.tickets[contract.tickets.selected].number+' | HelpDesk';
	    } else if (get_address_id()) {
	      document.title = contract.contract.ctn+' | HelpDesk';
	    }
	  }})
		return resetGT_new();
	}).then(function(contract) {
		btn = document.getElementById('btnLastmile')
		if (!!document.getElementById('btnLastmileFrame')) {
			document.getElementById('btnLastmileFrame').src = contract['lastmile']['href']
		} else {
			btn.onclick = function() {
				window.open(contract['lastmile']['href'])
			}
		}
		btn.firstChild.setAttribute("class", "fa fa-server fa-2x")
		btn.setAttribute("data-icon", "fa-server")
		document.getElementById("btnLastmileText").innerHTML = contract['lastmile']['name']
  })
}

function reset_ticketTabs(contract) {
	fetch(chrome.runtime.getURL("/templates/ticketTabs.hbs")).then(function(data) {
		return data.text()
	}).then(function(data) {
		compiledTemplate = Handlebars.compile(data);
		if (!!document.getElementById('tabs')) {document.getElementById('tabs').remove()};
		var tabs = addElement('div', 'tabs', {'display': 'flex'}, {'class': 'grid__box grid__box--size-4'})
		document.querySelectorAll('tr[ng-repeat-end] ul.dropdown-menu').forEach(function(e) {
			e.style.width = '600px';
		})
		tabs.innerHTML = compiledTemplate(contract);
		async_querySelector('div[edit-ticket-directive] > div.mb-16 > div.grid').then(function(e) {
			// Change rightmost element margin
			right_block = e.querySelector('div.grid__box--size-4');
			right_block.classList.add('grid__box--pull-left-8');
			right_block.style.marginTop = '-50px';
			e.prepend(tabs);
      reset_ticketTabs_js(contract);
			reset_onlineTable(contract);
		})
	});

	if (contract["contract"]["fvno"]) {return 0} // Don't need diag on GVNO
	contract['devices'] = {};
  hd_query('/ptn/proxy/login/'+contract.contract.alias).then(function(data) {
    contract['devices']['routers'] = data['data']['wifi_rent_stoppable_services'].concat(data['data']['wifi_rent_unstoppable_services']);
		contract['devices']['iptv'] = data['data']['iptv_rent_stoppable_services'].concat(data['data']['iptv_rent_unstoppable_services'], data['data']['iptv_services']);
    contract['devices']['tve'] = data['data']['tve_rent_services'];
    for (i=0; i<contract['devices']['tve'].length; i++) {
      if (!contract['devices']['tve'][i].mac.includes("-")) {
        contract['devices']['tve'][i].mac = contract['devices']['tve'][i].mac.match(/.{1,2}/g).join('-')
      }
    }
    return contract;
  }).then(function(contract) {
    if (contract['devices']['iptv'].length > 0) {
      hd_query('/api/fttb/iptv_consoles').then(function(iptv) {
        contract['devices']['iptv'] = []
        for (el in iptv['data']) {
          if (!iptv['data'][el]['mac'].includes("-")) {
            iptv['data'][el]['mac'] = iptv['data'][el]['mac'].match(/.{1,2}/g).join('-')
          }
          contract['devices']['iptv'].push(iptv['data'][el]);
        }
      });
    }
  })
}

function reset_ticketTabs_js(contract) {
  gt = contract['greentable'];
  get_parameter("defaultTab", function(tab_id) {
		document.querySelectorAll('#tabs_ctrl input').forEach(btn => {
	    btn.addEventListener('change', function() {
	        tab_id = this.id.split('-')[1];
					document.querySelectorAll("#tabs .tab").forEach(tab => {
						tab.style.display = (tab.id == tab_id ? 'block' : 'none');
					});
	    });
			if (btn.id.substr(-1) == tab_id) {
				btn.click()
			}
		})
	})

 	if (localStorage.operatorGroup == 2) {
		// Tabs - contract
		document.getElementById("authLogsBtn").value = document.getElementById("authLogs").value;
	  document.getElementById("authLogs").onchange = function() {
	    document.getElementById("authLogsBtn").value = document.getElementById("authLogs").value
	  }
	  // Tabs - templates
	  templates = {
	    "1": localStorage.lastComment,
			"2": `ТКД ${gt['ip']} порт ${gt['port']}:
Скорость по патчу: Мбит/c
Скорость по wifi: Мбит/c
Скорость напрямую: Мбит/c

На ТКД:
Режим клиентского порта 100M/Full
Ошибок на порту клиента - 0
CRC-ошибок на аплинках - 0
InMACRcvErr-ошибок на аплинках - 0
CPU - в норме
В логах проблем не обнаружено

Ping с Bras\BB до ТКД – потерь нет.
Ping c Bras\BB до внешнего ресурса - потерь нет.
Шейпер – по тарифу.
`,
			"3": `На ТКД ${gt['ip']} порт ${gt['port']} нет линка - тест кабеля   .
Перекоммутации на других портах не видно. Заблокированных портов нет.
под.    этаж    код    телефон
`,
			"4": `На ТКД ${gt['ip']} порт ${gt['port']} линк есть.
Перекоммутации не видно. Мака клиента нет. Актуальные ТКД/порт неизвестны. Заблокированных портов нет.
под.    этаж    код    телефон
`,
 	    "5": `Отключили:
IPv6, IPX, NetBIOS, Flow control;
Проверили:
Connectify.me, Торрент-клиент, Одноранговые сетевые чаты/файлообменники (Vypress Chat), Cерверные программы (Hamachi);
Клиент проверит:
Bonjour, Cетевые игрушки, Антивирусы, Вирусы.
`,
	    "6": `ТКД ${gt['ip']} порт ${gt['port']}
режим клиентского порта 100/Full, ошибок ни на порту, ни на аплинках ТКД нет;
ping до приставки без потерь большими пакетами;
в логах ТКД и узла 2-го уровня проблем не обнаружено, загрузка CPU и портов и там, и там в норме;
`,
			"7": `GUID проблемной приставки
Результат смена режима работы
Время снятия лога после перезагрузки
Время снятия лога после инверсии (если повторилась после смены режима)
Марка и модель телевизора
#инверсияtve`,
			"8": ` #dir815интерфейс `,
			"9": ` #заменаiptv `,
			"10": ` #заменаtve `,
			"11": ` #видеоподдержкаотказ `,
			"12": ` #видеоподдержка `,
			"13": ` #smartflash `,
	  }
	  comment_text = document.querySelector('textarea[name="comment"]')
	  document.getElementById('tmplSelect').onchange = function() {
			template_id = event.srcElement.value;
			if (parseInt(template_id) < 8) { // Well, that looks like the best way to do it.
				comment_text.value = templates[template_id];
			} else {
				comment_text.value += templates[template_id];
			}

	  }
	  document.getElementById('tmplClearBtn').onclick = function() {
	    comment_text.value = "";
	  }

	  // Tabs - statuses
	  document.getElementById('ttActionBtn').onclick = function() {
			this.setAttribute('disabled', 'disabled')
	    var e = document.getElementById('ttActionSelect');
	    dataset = e.options[e.selectedIndex].dataset;
	    tt = contract.tickets.selected
	    params = {
	      "newcomment": (comment_text.value == "" ? dataset.newcomment : comment_text.value),
	      "status": parseInt(dataset.status),
	      "t_operator": e.value || localStorage.operator,
	      "t_priority": loadData('/ptn/tickets/api/ticket/update/'+tt).ticket_data.t_priority,
	      "type": contract.tickets[tt].type.id,
				"validation": false
	    };

			if (dataset.sendsms) {
				document.getElementById('smsText').value = contract.sms_templates[dataset.sendsms]['s_desc'];
				document.getElementById('smsSend').click();
			}

	    if (params.status == 24) {
	      params['timer'] = datetostr(dataset['timer'] == "morning" ? date_morning(contract.time_shift) : date_shift(contract.time_shift, dataset['timer']), "tt");
	    }
	    if (params.status == 7) {
				params['t_operator'] = contract.tickets[tt]['operator']
				hd_query('/ptn/tickets/api/ticket/connect_reject/'+params['type']+'/2').then(function(res) {
					let other = 0
					for (let i=0; i<res['answers'].length; i++) {
						el = res['answers'][i]
						if (el['is_own_answer'] == 1) {other = el['id']};
						if (el['answer'] == dataset['answer']) {
							params['ticket_change_form_answers'] = {'change_status_poll': {'answer_id': el['id']}};
							break;
						}
					}
					if (!params['ticket_change_form_answers']) {
						params['ticket_change_form_answers'] = {'change_status_poll': {'answer_id': other, 'own_answer': dataset['answer']}}
					}
					updateTT(tt, params);
				})
	    } else {
				updateTT(tt, params);
			}

	  }

	  // Tabs - creatett
	  document.getElementById('createttBtn').onclick = function() {
			get_user(function(o) {
				var e = document.getElementById('createttSelect');
		    dataset = e.options[e.selectedIndex].dataset;
				var prefix = "По заявке "+contract.tickets[contract.tickets.selected].number;

		    createTT({
		      "t_address": contract.address.id,
		      "t_operator": e.value || localStorage.operator,
		      "type": parseInt(dataset.type),
		      "ticket_comment": prefix+". Комментарий: "+comment_text.value
		    })
			})
	  }
	}

  // SMS window
  document.getElementById('phoneNumber').value = contract.phones.sms;
  phonelinks = document.getElementsByName("smsphone");
  for (i in phonelinks) {
    if (!!phonelinks[i].dataset && (phonelinks[i].dataset.id == contract.phones.sms)) {
      phonelinks[i].innerHTML = "<b>"+phonelinks[i].innerHTML+"</b>";
    }
    phonelinks[i].onclick = function() {
      document.getElementById('phoneNumber').value = this.dataset.id;
    }
  }
  document.getElementById('smsSend').onclick = function() {
    if (!document.getElementById('phoneNumber').value || !document.getElementById('smsText').value) {
      alert('Ошибка! Введите номер телефона И текст сообщения');
      return 0;
    }
    payload = {
      "date": datetostr(document.getElementById("sendMorning").checked ? date_morning(contract.time_shift) : date_now(contract.time_shift), "sms"),
      "phone": document.getElementById('phoneNumber').value,
      "text": document.getElementById('smsText').value
    };
    hd_query_force('/ptn/main_page/send_sms/', "POST", payload).then(function(data) {
      alert('Сообщение помещено в очередь отправки');
      get_user(function(o) {
        fetch(window.location.protocol+'//seapig.corbina.net/admin/sms/smslogger.php?hd_username='+o['username']+'&avaya='+o['avaya']+'&text='+payload['text']+'&tt='+contract.tickets[contract.tickets.selected].number+'&phone='+payload['phone'], {"Content-Type": "text/html; charset=utf-8",})
      })
      document.getElementById('smsForm').reset();
    });
  }

	document.getElementById('extSmsSender').onclick = function() {
		window.open('http://ms-hdweb001.bee.vimpelcom.ru/cs/sms_sender/allsmssender.php?n=%D0%A8%D0%9F%D0%94&l=1-%D1%8F%20%D0%BB%D0%B8%D0%BD%D0%B8%D1%8F%20%D0%BE%D0%B1%D1%81%D0%BB%D1%83%D0%B6%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F', '_blank')
	}

  smsBtns = document.getElementsByClassName('smsTmplBtn');
	smsText = document.getElementById("smsText")

	for (var i = 0; i < smsBtns.length; i++) {
		smsBtns[i].onclick = function() {
			smsText.value = this.value;
			document.getElementById("smsTextCount").innerHTML = smsText.value.length+"/"+smsText.getAttribute('maxlength')
		}
	}


	smsText.onkeyup = function () {
		document.getElementById("smsTextCount").innerHTML = smsText.value.length+"/"+smsText.getAttribute('maxlength')
	}

  document.getElementById('smsTmplSelect').onchange = function() {
    smsText.value = event.srcElement.value;
		document.getElementById("smsTextCount").innerHTML = smsText.value.length+"/"+smsText.getAttribute('maxlength')
  }
}

function reset_quickTT() {
  fetch(chrome.runtime.getURL("/templates/quickTT.hbs")).then(function(data) {
  	return data.text()
  }).then(function(data) {
  	if (!!document.getElementById('quickTT')) {document.getElementById('quickTT').remove()};
  	compiledTemplate = Handlebars.compile(data);
  	var quickTT = addElement('div', 'quickTT', {'display': 'flex', 'padding-bottom': '10px'});
  	quickTT.innerHTML = compiledTemplate();
		document.querySelector('div.mb-16.card').after(quickTT);
  	document.querySelectorAll("#quickTT button").forEach(function(e){
  		e.onclick = function() {
  			createTT({
        	"t_address": get_address_id(),
        	"t_operator": e.value || localStorage.operator,
        	"type": parseInt(e.dataset.type),
        	"ticket_comment": e.dataset.comment || document.getElementById("textarea_comment").value
      	})
  		}
  	})
  })
}

function reset_onlineTable(contract) {
	fetch(chrome.runtime.getURL("/templates/onlineTable.hbs")).then(function(data) {
  	return data.text()
  }).then(function(data) {
		compiledTemplate = Handlebars.compile(data);
		document.querySelector('#greentable').innerHTML = compiledTemplate(contract);
		document.getElementById('refreshOnlineTable').onclick = function() {
			document.getElementById('refreshOnlineTable').innerHTML = '...';
			document.getElementById('refreshOnlineTable').setAttribute('disabled', 'disabled')
			resetOnline_new(true).then(function(contract) {
				document.querySelectorAll('div.tooltip').forEach(tooltip => {
					tooltip.parentNode.removeChild(tooltip);
				});

				reset_onlineTable(contract)
			})
		}
	})
}
