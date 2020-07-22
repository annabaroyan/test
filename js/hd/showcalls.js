function printMonth(month) {
	month = parseInt(month);
	month++;
	return res = (month<10) ? "0"+month : month;
}

var e = document.querySelector('h2')
var datetext = e.innerHTML.split(' ').pop().split('-');

var goLeft = addElement('a', 'goLeft', {'text-decoration': 'none'});
goLeft.innerHTML = "<span style='font-size:16px; vertical-align: -2px;'>◀◀</span> ";
var goRight = addElement('a', 'goRight', {'text-decoration': 'none'});
goRight.innerHTML = " <span style='font-size:16px; vertical-align: -2px;'>▶▶</span>";

url = new URL(window.location.href);
login = url.searchParams.get("login");

if (datetext.length == 3) {
	var tomorrow = new Date(datetext[0], datetext[1]-1, datetext[2], 0, 0, 0, 0);
	var yesterday = new Date(datetext[0], datetext[1]-1, datetext[2], 0, 0, 0, 0);
	tomorrow.setDate(tomorrow.getDate() + 1);
	goRight.href = window.location.origin+"/showcalls.pl?login="+login+"&date="+tomorrow.getFullYear()+'-'+printMonth(tomorrow.getMonth())+'-'+lead0(tomorrow.getDate());
	yesterday.setDate(yesterday.getDate() - 1);
	goLeft.href = window.location.origin+"/showcalls.pl?login="+login+"&date="+yesterday.getFullYear()+'-'+printMonth(yesterday.getMonth())+'-'+lead0(yesterday.getDate());
	e.insertBefore(goLeft, e.firstChild);
	e.appendChild(goRight);
}
