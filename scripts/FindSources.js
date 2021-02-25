$.when(mw.loader.using('mediawiki.api'),$.ready).then(function(){
	if (mw.config.get('wgIsMainPage') || mw.config.get('wgNamespaceNumber') !== 0) return;
	(new mw.Api()).parse('{{Template:Find_sources_mainspace}}',{title:mw.config.get('wgPageName')}).done(function(e){
		$('#siteSub').after('<div style="font-size:92%;">' + $(e).find('p').first().html().replace(/<i>(.*?)<\/i>/g,'<span>$1</span>') + '</div>');
	});
});