import { setCurrentPanel, getMusicVideos } from './renderer-globals.js'
import { showMusicVideos } from './renderer-music-videos.js'

const darkMode = `:root {
	color-scheme: dark;
	--body-foreground: #939293;
	--body-background: #19171a;
	--main-background: #211f22;
	--panel-foreground: #939293;
	--panel-background: #2c2a2e;
	--tab-foreground: #999799;
	--tab-background: #252326;
	--input-foreground: #ededeb;
	--input-background: #3f3e41;
	--input-border: #4a494d;
	--input-focus: #717072;
	--input-focus-shadow: hsl(270 1% 30% / 80%);
	--input-readonly-background: #262527;
	--input-disabled-background: #2e2d2f;
	--button-standard: #3f3e41;
	--button-active : #59575b;
	--button-focus: #5e5e5e;
	--button-disabled: #19171a;
	--item-hover: #171815;
	--panel-svg-link: #999799;
	--star-rating-stroke: #999799;
}`

export let appSettings = {}

function toggleColorMode(forced) {
	const colorModeButton = document.getElementById('nav-color-mode')
	const colorModeDark = document.getElementById('dark-mode')
	switch (forced) {
		case 'light':
			if (colorModeDark) {
				colorModeDark.remove()
				colorModeButton.innerHTML = '<svg><use href="#icon-dark"></use></svg>'
			}
			break
		case 'dark': {
			if (!colorModeDark) {
				const colorModeDarkStyles = document.createElement('style')
				colorModeDarkStyles.id = 'dark-mode'
				colorModeDarkStyles.innerHTML = darkMode
				document.querySelector('head').appendChild(colorModeDarkStyles)
				colorModeButton.innerHTML = '<svg><use href="#icon-light"></use></svg>'
			}
			break
		}
		default: {
			let colorMode = ''
			if (colorModeDark) {
				colorModeDark.remove()
				colorModeButton.innerHTML = '<svg><use href="#icon-dark"></use></svg>'
				colorMode = 'light'
			} else {
				const colorModeDarkStyles = document.createElement('style')
				colorModeDarkStyles.id = 'dark-mode'
				colorModeDarkStyles.innerHTML = darkMode
				document.querySelector('head').appendChild(colorModeDarkStyles)
				colorModeButton.innerHTML = '<svg><use href="#icon-light"></use></svg>'
				colorMode = 'dark'
			}
			window.electronAPI.setColorMode(colorMode)
		}
	}
}

/**
 * Enables or disables the Set (`set-folder`) button on the `settings` panel based on the `appSettings.homeFolder` value.
 */
function checkHomeFolder() {
	const setFolder = document.getElementById('set-folder')
	if (appSettings.homeFolder === '') {
		setFolder.setAttribute('disabled', '')
	} else {
		setFolder.removeAttribute('disabled')
	}
}

function toggleSettingsVideosCompact(event, value) {
	const settingsToggle = document.getElementById('videos-setting-compact')
	const videosItems = document.querySelector('.panel-videos-items')
	console.log({ checked: settingsToggle.checked, value })
	if (settingsToggle.checked) {
		videosItems.classList.add('panel-videos-items-compact')
	} else {
		videosItems.classList.remove('panel-videos-items-compact')
	}
	if (value) {
		settingsToggle.checked = value
	}
	appSettings.videosCompact = settingsToggle.checked
}

function toggleSettingsVideosExtended(event, value) {
	const settingsToggle = document.getElementById('videos-setting-extended')
	console.log({ checked: settingsToggle.checked, value })
	if (value) {
		settingsToggle.checked = value
	}
	appSettings.videosExtended = settingsToggle.checked
	showMusicVideos()
}

export async function getSettings() {
	appSettings = await window.electronAPI.getSettings()
	document.getElementById('home-folder').value = appSettings.homeFolder
	console.log(appSettings)
	toggleColorMode(appSettings.colorMode)
	toggleSettingsVideosCompact(null, appSettings.videosCompact)
	toggleSettingsVideosExtended(null, appSettings.videosExtended)
	if (appSettings.homeFolder !== '') {
		await getMusicVideos()
		setCurrentPanel('home', false)
	} else {
		setCurrentPanel('settings', false)
	}
}

document.getElementById('home-folder').addEventListener('change', () => {
	appSettings.homeFolder = document.getElementById('home-folder').value
	checkHomeFolder()
})

document.getElementById('browse-folder').addEventListener('click', async () => {
	const newFolder = await window.electronAPI.chooseFolder()
	if (newFolder !== '') {
		appSettings.homeFolder = newFolder
		document.getElementById('home-folder').value = appSettings.homeFolder
		checkHomeFolder()
	}
})

document.getElementById('set-folder').addEventListener('click', async () => {
	console.log(`setting music videos folder to ${appSettings.homeFolder}`)
	appSettings.homeFolder = await window.electronAPI.setFolder(appSettings.homeFolder)
	console.log(`new music videos folder is ${appSettings.homeFolder}`)
	if (appSettings.homeFolder !== '') {
		await getMusicVideos()
		setCurrentPanel('videos', false)
	}
})

document.getElementById('nav-color-mode').addEventListener('click', toggleColorMode)

document.getElementById('videos-setting-compact').addEventListener('change', toggleSettingsVideosCompact)

document.getElementById('videos-setting-extended').addEventListener('change', toggleSettingsVideosExtended)
