/*** Parameter spacing ***/

// Utility to easily manager parameter spacing around the equal sign
// Documentation at [[User:BrandonXLF/ParameterSpacing]]
// By [[User:BrandonXLF]]

$.when(mw.loader.using('oojs-ui'),$.ready).then(function(){
	$(mw.util.addPortletLink('p-tb', '#', 'Parameter spacing')).click(function(e){
		e.preventDefault();
		var extra = new OO.ui.CheckboxInputWidget({
			selected: true
		});
		var pre = new OO.ui.NumberInputWidget({
			input: {
				value: 1
			},
			
		});
		var post = new OO.ui.NumberInputWidget({
			input: {
				value: 1,
				min: 0
			},
			
		});
		var expand = new OO.ui.MultilineTextInputWidget({ 
			multiline: true,
			autosize: true,
			rows: 10,
			maxRows: 30
		});
		expand.$element.css({fontFamily:'monospace, monospace'});
		function ProcessDialog( config ) {
			ProcessDialog.super.call( this, config );
		}
		OO.inheritClass( ProcessDialog, OO.ui.ProcessDialog );
		ProcessDialog.static.name = 'paramspacing';
		ProcessDialog.static.title = 'Parameter spacing';
		ProcessDialog.static.actions = [
			{
				action: 'run',
				label: 'Run',
				flags: [ 'primary', 'progressive' ]
			},
			{
				label: 'Cancel',
				flags: 'safe'
			}
		];
		ProcessDialog.prototype.getBodyHeight = function () {
			return this.panel.$element.outerHeight( true );
		};
		ProcessDialog.prototype.initialize = function () {
			ProcessDialog.super.prototype.initialize.apply( this, arguments );
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			this.content.$element.append(
				(new OO.ui.FieldLayout( extra, { label: 'Equalize equal signs', align: 'left' } )).$element,
				(new OO.ui.FieldLayout( pre, { label: 'Spaces before equal sign', align: 'left' } )).$element,
				(new OO.ui.FieldLayout( post, { label: 'Spaces after equal sign', align: 'left' } )).$element,
				(new OO.ui.FieldLayout( expand, { align: 'top' })).$element
			);
			this.$body.append( this.content.$element );
		};
		ProcessDialog.prototype.getActionProcess = function ( action ) {
			var dialog = this;
			if ( action ) {
				return new OO.ui.Process( function () {
					var val = expand.getValue();
					var max = 0; 
					val.replace(/(.*?\|.*?)( *)(=.*)( *)/g,function(m,m1,m2,m3,m4){
						if (m1.length > max)
							max = m1.length;
						return m;
					});
					val = val.replace(/(.*?\|.*?)( *)=( *)(.*)/g,function(m,m1,m2,m3,m4){
						return m1 + ' '.repeat(Math.max(0,(extra.isSelected() ? max - m1.length : 0) + pre.getNumericValue())) + '=' + ' '.repeat(Math.max(0, post.getNumericValue())) + m4;
					});
					expand.setValue(val);
					return true;
				});
			}
			return new OO.ui.Process(function () {
				dialog.close();
			});
		}; 
		ProcessDialog.prototype.getBodyHeight = function () {
			this.content.resetScroll();
			return this.content.$element.outerHeight( true );
		};
		var windowManager = new OO.ui.WindowManager();
		var processDialog = new ProcessDialog({
			size: 'large'
		});
		$( document.body ).append( windowManager.$element );
		windowManager.addWindows( [ processDialog ] );
		windowManager.openWindow( processDialog );
		expand.on('change',function(){
			processDialog.updateSize();
		});
	});
});