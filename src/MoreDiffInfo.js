/*** More Diff Info ***/

// Adds more information to diff pages such as revision ID, size, and ORES score
// Documentation at [[User:BrandonXLF/MoreDiffInfo]]
// By [[User:BrandonXLF]]

/* global moment */

$.when(mw.loader.getScript('https://momentjs.com/downloads/moment.min.js'), $.ready).then(function() {
	var ids = mw.config.get(['wgDiffOldId', 'wgDiffNewId']),
		DA_IMG = '<img style="height:1em;vertical-align:text-top;" title="Damaging" alt="Damaging" src="' +
			'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Rating-Christgau-dud.svg/64px-Rating-Christgau-dud.svg.png' +
			'">',
		GF_IMG = '<img style="height:1em;vertical-align:text-top;" title="Good faith" alt="Good faith" src="' +
			'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Ic_thumb_up_48px.svg/32px-Ic_thumb_up_48px.svg.png' +
			'">';

	if (!ids.wgDiffOldId || !ids.wgDiffNewId) return;

	$.get(mw.config.get('wgScriptPath') + '/api.php', {
		action: 'query',
		format: 'json',
		prop: 'revisions',
		revids: ids.wgDiffOldId + '|' + ids.wgDiffNewId,
		rvprop: 'ids|size|oresscores|timestamp',
		rvslots: 'main'
	}).then(function(result) {
		var info = [];

		for (var page in result.query.pages) {
			for (var rev in result.query.pages[page].revisions) {
				info[result.query.pages[page].revisions[rev].revid == ids.wgDiffOldId ? 0 : 1] = result.query.pages[page].revisions[rev];
			}
		}

		if (!info[0] || !info[1]) return;

		var id = '<a href="' +
				mw.util.getUrl('User:BrandonXLF/MoreDiffInfo#ID') +
				'">ID</a>: <a href="' +
				mw.config.get('wgScript') +
				'?oldid=' +
				info[0].revid +
				'">' +
				info[0].revid +
				'</a>',
			size = ' | <a href="' + mw.util.getUrl('User:BrandonXLF/MoreDiffInfo#SIZE') + '">SIZE</a>: ' + info[0].size,
			ores = '';

		if (info[0].oresscores && info[0].oresscores.damaging) {
			ores += Math.round(info[0].oresscores.damaging.true * 100) + '% ' + DA_IMG + ' ';
		}

		if (info[0].oresscores && info[0].oresscores.goodfaith) {
			ores +=  Math.round(info[0].oresscores.goodfaith.true * 100) + '% ' + GF_IMG;
		}

		if (ores) {
			ores = ' | <a href="' + mw.util.getUrl('User:BrandonXLF/MoreDiffInfo#ORES') + '">ORES</a>: ' + ores;
		}

		$('#mw-diff-otitle2').after($('<div></div>').append(id + size + ores));

		var sizediff = info[1].size - info[0].size,
			timediff = ' | ' + moment(new Date(info[0].timestamp)).from(new Date(info[1].timestamp)).replace(/ ago$/, ' later');

		id = '<a href="' +
			mw.util.getUrl('User:BrandonXLF/MoreDiffInfo#ID') +
			'">ID</a>: <a href="' + mw.config.get('wgScript') +
			'?oldid=' +
			info[1].revid + '">' + info[1].revid + '</a>';

		size = ' | <a href="' +
			mw.util.getUrl('User:BrandonXLF/MoreDiffInfo#SIZE') +
			'">SIZE</a>: ' + info[1].size + ' (<span style="color:' +
			(sizediff < 0 ? 'red' : sizediff > 0 ? 'green' : '') + '">' +
			(sizediff > 0 ? '+' : '') +
			sizediff +
			'</span>)';

		ores = '';

		if (info[1].oresscores && info[1].oresscores.damaging) {
			ores += Math.round(info[1].oresscores.damaging.true * 100) + '% ' + DA_IMG + ' ';
		}

		if (info[1].oresscores && info[1].oresscores.goodfaith) {
			ores +=  Math.round(info[1].oresscores.goodfaith.true * 100) + '% ' + GF_IMG;
		}

		if (ores) {
			ores = ' | <a href="' + mw.util.getUrl('User:BrandonXLF/MoreDiffInfo#ORES') + '">ORES</a>: ' + ores;
		}

		$('#mw-diff-ntitle2').after($('<div></div>').append(id + size + ores + timediff));
	});
});