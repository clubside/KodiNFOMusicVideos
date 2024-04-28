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
	getFolder: () => ipcRenderer.invoke('settings:getFolder'),
	setFolder: (folder) => ipcRenderer.invoke('settings:setFolder', folder),
	getMusicVideos: () => ipcRenderer.invoke('data:getMusicVideos'),
	saveMusicVideo: (musicVideo) => ipcRenderer.invoke('data:saveMusicVideo', musicVideo),
	getLookup: (artists, title) => ipcRenderer.invoke('data:getLookup', artists, title),
	captureVideoFrameAsMedia: (callback) => ipcRenderer.on('capture-frame', (_event, value) => callback(value))
})
