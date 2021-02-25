/*** Toggle Sidebar ***/

// Adds a button to show/hide the sidebar in the Vector skin
// Documentation at [[User:BrandonXLF/ToggleSidebar]]
// By [[User:BrandonXLF]]

// VAR: window.hidesidebar = true -- hide by default
// VAR: window.hidesidebar = false -- do not hide by default (default)
// VAR: window.hidesidebar = 'editing' -- hide when editing

// NOTE: Only supports the Vector skin

$.when(mw.loader.using(['oojs-ui-core','oojs-ui.styles.icons-layout']),$.ready).done(function(){
	if (mw.config.get('skin') === 'minerva') return;
	var opts = {
		editing: !!document.getElementById('editform') || !!document.getElementsByClassName('ve-init-target-source')[0],
		true: true,
		false: false,
		no: false,
		yes: true,
		always: true,
		never: false
	};
	var hidden = opts[window.hidesidebar];
	if (hidden === undefined) hidden = false;
	var style = $('<style>#mw-head:before, .ve-init-target.ve-init-mw-target > .ve-ui-toolbar > .oo-ui-toolbar-bar {left: 0 !important;}#content, .mw-body, #left-navigation, #footer {margin-left: 0 !important;}#mw-panel {display: none;}</style>');
	var showicon = new OO.ui.IconWidget({
		icon: 'menu'
	});
	showicon.$element.css({
		width: '20px',
		height: '20px',
		opacity: 0.51,
		cursor: 'pointer',
		marginBottom: 0
	});
	var showlabel = new OO.ui.LabelWidget({
		label: 'Show menu'
	});
	showlabel.$element.css({
		marginBottom: 0,
		cursor: 'pointer',
		color: '#222222'
	});
	var show = new OO.ui.HorizontalLayout({
		items: [showicon, showlabel]
	});
	show.$element.css({
		position: 'absolute',
		top: '0.33em',
		left: '8px'
	}).on('click',function(){
		show.$element.detach();
		style.remove();
	});
	var hideicon = new OO.ui.IconWidget({
		icon: 'menu'
	});
	hideicon.$element.css({
		width: '20px',
		height: '20px',
		opacity: 0.51,
		cursor: 'pointer',
		marginBottom: 0
	});
	var hidelabel = new OO.ui.LabelWidget({
		label: 'Hide menu'
	});
	hidelabel.$element.css({
		marginBottom: 0,
		cursor: 'pointer',
		color: '#222222'
	});
	var hide = new OO.ui.HorizontalLayout({
		items: [hideicon, hidelabel]
	});
	hide.$element.css({
		display: 'inline-block'
	}).on('click',function(){
		show.$element.prependTo('#mw-head');
		style.appendTo(document.body);
	});
	$('#p-navigation').css('margin-top','0.5em').prepend($('<div class="body" style="margin-bottom:0.5em">').append(hide.$element));
	if (hidden) {
		show.$element.prependTo('#mw-head');
		style.appendTo(document.body);
	}
});