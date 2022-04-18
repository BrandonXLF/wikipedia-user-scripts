/*** Autoref ***/

// Insert auto-filled references in the 2010 Wikitext editor like you can in VE
// Documentation at [[en:w:User:BrandonXLF/Autoref]]
// By [[en:w:User:BrandonXLF]]

/* global getCitoidRef */

$.when(mw.loader.using('ext.wikiEditor'), mw.loader.getScript(
	'https://en.wikipedia.org/w/index.php?title=User:BrandonXLF/Citoid.js&action=raw&ctype=text/javascript'
), $.ready).then(function() {
	$('#wikiEditor-section-main [rel="reference"] > a').unbind().click(function() {
		var pos = {
			start: $('#wpTextbox1').textSelection('getCaretPosition'),
			end: $('#wpTextbox1').textSelection('getCaretPosition') + $('#wpTextbox1').textSelection('getSelection').length
		};

		OO.ui.prompt($('<span>Enter a <abbr title="URL, DOI, ISBN, PMID, PMCID, or QID">source</abbr>:</span>'), {
			textInput: {
				placeholder: 'Leave blank for none'
			}
		}).done(function(source) {
			$('#wpTextbox1').textSelection('setSelection', pos);

			if (source === null) return;

			if (source === '') {
				$('#wpTextbox1').textSelection('encapsulateSelection', {pre: '<ref>', post: '</ref>'});
				return;
			}

			getCitoidRef(source).then(function(ref) {
				$('#wpTextbox1').textSelection('replaceSelection', '<ref>' + ref + '</ref>');
			}, function(err) {
				mw.notify(err, {type: 'error'});
			});
		});
	});
});