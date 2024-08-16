/*** More Diff Info ***/

// Adds more information to diff pages such as revision ID, size, and ORES score
// Documentation at [[en:w:User:BrandonXLF/MoreDiffInfo]]
// By [[en:w:User:BrandonXLF]]

$.when(mw.loader.using('moment'), $.ready).then(function(require) {
	var moment = require('moment'),
		DA_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Rating-Christgau-dud.svg/64px-Rating-Christgau-dud.svg.png',
		GF_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Ic_thumb_up_48px.svg/32px-Ic_thumb_up_48px.svg.png';

	function createImage(type, url) {
		return '<img class="morediffinto-icon" title="' + type + '" alt="' + type + '" src="' + url + '">';
	}

	function getInnerORES(scores) {
		var innerORES = [];

		if (scores.damaging) {
			innerORES.push(Math.round(scores.damaging.true * 100) + '% ' + createImage('Damaging', DA_IMG));
		}

		if (scores.goodfaith) {
			innerORES.push(Math.round(scores.goodfaith.true * 100) + '% ' + createImage('Good Faith', GF_IMG));
		}

		return innerORES.join(' ') || 'No ORES';
	}

	function generateInfo(revision, previousRevision) {
		var out = [
				revision.revid,
				revision.size.toLocaleString() +' bytes',
				getInnerORES(revision.oresscores),
			],
			help = '<a target="_blank" href="https://en.wikipedia.org/wiki/User:BrandonXLF/MoreDiffInfo#Guide">(?)</a>';

		if (previousRevision) {
			var diff = revision.size - previousRevision.size;

			out[1] += ' <span style="color:' + (diff < 0 ? '#8b0000' : diff > 0 ? '#006400' : '') + '">(' + (diff > 0 ? '+' : '') + diff + ')</span>';

			out.push(moment(revision.timestamp).from(previousRevision.timestamp, true) + ' later');
		}

		return out.join(' | ') + ' ' + help;
	}

	mw.hook('wikipage.diff').add(function() {
		var ids = mw.config.get(['wgDiffOldId', 'wgDiffNewId']);

		if (!ids.wgDiffOldId || !ids.wgDiffNewId) return;

		new mw.Api().get({
			action: 'query',
			prop: 'revisions',
			revids: [ids.wgDiffOldId, ids.wgDiffNewId],
			rvprop: ['ids', 'size', 'oresscores', 'timestamp'],
			rvslots: 'main',
			formatversion: 2
		}).then(function(res) {
			var revisions = res.query.pages[0].revisions,
				oldRevision,
				newRevision;

			for (var i = 0; i < revisions.length; i++) {
				if (revisions[i].revid == ids.wgDiffOldId) {
					oldRevision = revisions[i];
				} else if (revisions[i].revid == ids.wgDiffNewId) {
					newRevision = revisions[i];
				}
			}

			if (!oldRevision || !newRevision) return;

			$('#mw-diff-otitle2').after($('<div></div>').append(generateInfo(oldRevision)));
			$('#mw-diff-ntitle2').after($('<div></div>').append(generateInfo(newRevision, oldRevision)));
		});
	});
});

mw.loader.addStyleTag(
	'.morediffinto-icon { height: 1em; vertical-align: text-top; }' +
	'@media screen { .skin-theme-clientpref-night .morediffinto-icon { filter: invert(1); } }' +
	'@media screen and ( prefers-color-scheme: dark) { html.skin-theme-clientpref-os .morediffinto-icon { filter: invert(1); } }'
);