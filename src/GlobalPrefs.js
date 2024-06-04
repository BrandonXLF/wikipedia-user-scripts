/*** Global Prefs ***/

// Adds link to Global Preferences
// Documentation at [[en:w:User:BrandonXLF/GlobalPrefs]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	['', '-sticky-header'].forEach(suffix => {
		mw.util.addPortletLink(
			'p-personal' + suffix,
			mw.config.get('wgArticlePath').replace('$1', 'Special:GlobalPreferences'),
			window.globalprefs || '(Global)',
			'globalpreferences',
			'Go to Special:GlobalPreferences',
			'',
			$('#pt-preferences' + suffix).next()
		);
	});
});