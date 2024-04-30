const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector)
		if (element) element.innerText = text
	}

	for (const dependency of ['chrome', 'node', 'electron']) {
		replaceText(`${dependency}-version`, process.versions[dependency])
	}
})

contextBridge.exposeInMainWorld('electronAPI', {
	openLink: (url) => ipcRenderer.invoke('action:openUrl', url),
	chooseFolder: () => ipcRenderer.invoke('dialog:videoFolder'),
	getSettings: () => ipcRenderer.invoke('settings:getSettings'),
	setFolder: (folder) => ipcRenderer.invoke('settings:setFolder', folder),
	setColorMode: (mode) => ipcRenderer.invoke('settings:setColorMode', mode),
	setVideosCompact: (checked) => ipcRenderer.invoke('settings:setVideosCompact', checked),
	setVideosExtended: (checked) => ipcRenderer.invoke('settings:setVideosExtended', checked),
	getMusicVideos: () => ipcRenderer.invoke('data:getMusicVideos'),
	saveMusicVideo: (musicVideo) => ipcRenderer.invoke('data:saveMusicVideo', musicVideo),
	getLookup: (artists, title) => ipcRenderer.invoke('data:getLookup', artists, title),
	captureVideoFrameAsMedia: (callback) => ipcRenderer.on('capture-frame', (_event, value) => callback(value))
})
