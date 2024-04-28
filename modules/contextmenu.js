const { Menu } = require('electron')

/**
 * Determines whether a context menu is applicable to the current select and if one is builds a list
 * of commands relevant to the element.
 *
 * @param {Electron.WebContents} webContents - The `webContents` object of the current BrowserWindow
 * @param {Object} params - Parameters passed by the `context-menu` event.
 */
exports.popupContextMenu = (webContents, params) => {
	console.log(params)
	const conextMenuTemplate = []
	if (params.mediaType === 'video') {
		conextMenuTemplate.push({
			label: 'Set as Thumbnail',
			click() {
				webContents.send('capture-frame', 'thumb')
			}
		})
		conextMenuTemplate.push({
			label: 'Set as Poster',
			click() {
				webContents.send('capture-frame', 'poster')
			}
		})
		conextMenuTemplate.push({
			label: 'Set as Key Art',
			click() {
				webContents.send('capture-frame', 'keyart')
			}
		})
		conextMenuTemplate.push({
			label: 'Set as Fan Art',
			click() {
				webContents.send('capture-frame', 'fanart')
			}
		})
		conextMenuTemplate.push({
			label: 'Set as new Fan Art',
			click() {
				webContents.send('capture-frame', 'fanart-new')
			}
		})
	} else if (params.isEditable) {
		if (params.misspelledWord) {
			if (params.dictionarySuggestions.length > 0) {
				for (const suggestion of params.dictionarySuggestions) {
					conextMenuTemplate.push({
						label: suggestion,
						click() {
							webContents.replaceMisspelling(suggestion)
						}
					})
				}
			} else {
				conextMenuTemplate.push({
					label: 'No suggestions',
					enabled: false
				})
			}
			conextMenuTemplate.push({
				type: 'separator'
			})
		}
		if (!params.selectionText) {
			conextMenuTemplate.push({
				role: 'undo',
				enabled: params.editFlags.canUndo,
				accelerator: 'CommandOrControl+Z'
			})
			conextMenuTemplate.push({
				role: 'redo',
				enabled: params.editFlags.canRedo,
				accelerator: 'CommandOrControl+Shift+Z'
			})
			conextMenuTemplate.push({
				type: 'separator'
			})
		}
		conextMenuTemplate.push({
			role: 'cut',
			enabled: params.editFlags.canCut,
			accelerator: 'CommandOrControl+X'
		})
		conextMenuTemplate.push({
			role: 'copy',
			enabled: params.editFlags.canCopy,
			accelerator: 'CommandOrControl+C'
		})
		conextMenuTemplate.push({
			role: 'paste',
			enabled: params.editFlags.canPaste,
			accelerator: 'CommandOrControl+V'
		})
		conextMenuTemplate.push({
			role: 'pasteAndMatchStyle',
			enabled: params.editFlags.canPaste,
			accelerator: 'CommandOrControl+Shift+V'
		})
		conextMenuTemplate.push({
			role: 'selectAll',
			enabled: params.editFlags.canSelectAll,
			accelerator: 'CommandOrControl+A'
		})
	}
	if (conextMenuTemplate.length > 0) {
		const contextMenu = Menu.buildFromTemplate(conextMenuTemplate)
		contextMenu.popup()
	}
}
