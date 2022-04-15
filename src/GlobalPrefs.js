/*** Global Prefs ***/

// Adds link to Global Preferences
// Documentation at [[w:User:BrandonXLF/GlobalPrefs]]
// By [[w:User:BrandonXLF]]

$(function() {
	mw.util.addPortletLink(
		'p-personal',
		mw.config.get('wgArticlePath').replace('$1', 'Special:GlobalPreferences'),
		window.globalprefs || '(Global)',
		'globalpreferences',
		'Go to Special:GlobalPreferences',
		'',
		$('#pt-preferences').next()
	);
});