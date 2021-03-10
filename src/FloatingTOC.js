/*** Floating TOC ***/

// Adds a floating TOC to the page
// Documentation at [[User:BrandonXLF/FloatingTOC]]
// By [[User:BrandonXLF]]

$(function() {
	var data = JSON.parse(mw.user.options.get('userjs-floatingtoc') || '{}'),
		toc2 = $('<div>').css({
			zIndex: 5
		}).addClass('mw-body-content').append((data.remove ? $('#toc') : $('#toc').clone().attr('id', 'toc2')).addClass('floatingtoc').css({
			position: 'fixed',
			left: data.left ? 10 : undefined,
			right: data.left ? undefined : 10,
			bottom: 10,
			maxHeight: '70vh',
			maxWidth: '30em',
			overflow: 'auto',
			display: 'block'
		})).prependTo('body');

	toc2.find('#toctogglecheckbox').attr('id', 'toctogglecheckbox2').prop('checked', !data.expand);
	!data.remove && $('#toc').find('#toctogglecheckbox').prop('checked', !!data.hide);
	toc2.find('[for="toctogglecheckbox"]').attr('for', 'toctogglecheckbox2');
	toc2.find('h2').before('[', $('<a href="#">edit</a>').click(function(e) {
		var expand = new OO.ui.CheckboxInputWidget().setSelected(data.expand),
			hide = new OO.ui.CheckboxInputWidget().setSelected(data.hide),
			remove = new OO.ui.CheckboxInputWidget().setSelected(data.remove),
			left = new OO.ui.CheckboxInputWidget().setSelected(data.left);

		e.preventDefault();
		function ProcessDialog(config) {
			ProcessDialog.super.call(this, config);
		}

		OO.inheritClass(ProcessDialog, OO.ui.ProcessDialog);

		ProcessDialog.static.name = 'floatingtoc-settings';
		ProcessDialog.static.title = 'Floating TOC Settings';
		ProcessDialog.static.actions = [
			{
				action: 'save',
				label: 'Save',
				flags: ['primary', 'progressive']
			},
			{
				label: 'Cancel',
				flags: 'safe'
			}
		];
		ProcessDialog.prototype.initialize = function() {
			ProcessDialog.super.prototype.initialize.apply(this, arguments);
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			this.content.$element.append(
				(new OO.ui.FieldLayout(expand, {
					align: 'inline',
					label: 'Expand the floating TOC by default'
				})).$element
			);
			this.content.$element.append(
				(new OO.ui.FieldLayout(hide, {
					align: 'inline',
					label: 'Hide the inline TOC by default'
				})).$element
			);
			this.content.$element.append(
				(new OO.ui.FieldLayout(remove, {
					align: 'inline',
					label: 'Remove the inline TOC'
				})).$element
			);
			this.content.$element.append(
				(new OO.ui.FieldLayout(left, {
					align: 'inline',
					label: 'Move the floating TOC of the left'
				})).$element
			);
			this.$body.append(this.content.$element);
		};

		ProcessDialog.prototype.getActionProcess = function(action) {
			var dialog = this;
			if (action) {
				return new OO.ui.Process(function() {
					var saveDeferred = $.Deferred(),
						api = new mw.Api();
					data = {
						remove: remove.isSelected(),
						expand: expand.isSelected(),
						hide: hide.isSelected(),
						left: left.isSelected()
					};
					api.saveOption('userjs-floatingtoc', JSON.stringify(data)).then(function() {
						saveDeferred.resolve();
						mw.user.options.set('userjs-floatingtoc', JSON.stringify(data));
						dialog.close();
					}, function(_, data) {
						saveDeferred.reject([new OO.ui.Error(api.getErrorMessage(data), {recoverable: false})]);
					});
					return saveDeferred.promise();
				});
			}
			return new OO.ui.Process(function() {
				dialog.close();
			});
		};

		ProcessDialog.prototype.getBodyHeight = function() {
			return this.content.$element.outerHeight(true);
		};

		var windowManager = new OO.ui.WindowManager(),
			processDialog = new ProcessDialog({
				size: 'large'
			});

		$(document.body).append(windowManager.$element);

		windowManager.addWindows([processDialog]);
		windowManager.openWindow(processDialog);
	}), '] ');

	if (!$('.toctogglelabel').length) {
		mw.loader.load('mediawiki.toc.styles');
		toc2.find('.toctitle').before('<input type="checkbox" role="button" id="addedtoccheck" class="toctogglecheckbox" style="display:none">');
		toc2.find('.toctitle h2').before($('<span class="toctogglespan">').append('<label class="toctogglelabel" for="addedtoccheck"></label>'));
	}
});