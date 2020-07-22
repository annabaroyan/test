document.addEventListener("DOMContentLoaded", function() {
	chrome.storage.sync.get('user', function(arr) {
		if ([2, 153].includes(arr.user['group'])) {
			document.body.innerHTML = `<center>
			<a href="https://fttb.bee.vimpelcom.ru/" target="_blank">Hlpdesk</a>
			<a href="http://ums.corbina.net/" target="_blank">UMS</a><br>
			<a href="http://post.ru" target="_blank">Post.ru</a>
			<hr>
			<a href="http://b2cts.beeline.ru/wiki3/B2C_Technical_Support" target="_blank">КБ (wiki)</a>
			<a href="http://help.internet.beeline.ru/" target="_blank">help/</a>
			<a href="routers.html">Роутеры</a>
			<hr>
			<a href="fttb.html">FTTB</a>
			<a href="vpn.html">VPN</a>
			<a href="iptv.html">IPTV</a>
			<a href="macos.html">Mac OS</a>
			<hr>
			<a href="http://seapig.corbina.net/index2.php" target="_blank">Seapig</a><br>
			<a href="instruments.html">Instruments</a><br>
			<hr>
			<a href="http://b2cts.beeline.ru/wiki3/Tools:%D0%9A%D0%BE%D0%BD%D1%82%D0%B0%D0%BA%D1%82%D1%8B" target="_blank">Телефоны</a><br>
			<a href="http://hd.bee.vimpelcom.ru/sheminfo/IC/Navi_office_shpd/navigator/index.html" target="_blank">Офисы</a><br>
			</center>`;
		} else {
			document.body.innerHTML = `<center>Привет! Тут могут быть ссылки на ресурсы, которые могут быть полезны тебе и твоим коллегам.</center>`;
		}
		document.body.innerHTML += `<center><hr>
		<a href="mailto:ochernikov@beeline.ru?subject=`+encodeURI("[BUG/IDEA] TP-Support ("+chrome.runtime.getManifest().version+")")+`" target=_blank>Предложения по доработке</a>
		<a href="/options/index.html">Настройки плагина</a>
		</center>`;
	});
});
