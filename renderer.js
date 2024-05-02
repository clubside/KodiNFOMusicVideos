import { currentPanel, popCurrentPanel, setCurrentPanel, navigateMusicVideos } from './modules/renderer/renderer-globals.js'
import { getSettings } from './modules/renderer/renderer-settings.js'

/**
 * Convert all `a` link elements to open in the user's default browser.
 */
function captureLinks() {
	const links = document.getElementsByTagName('a')
	for (const link of links) {
		link.addEventListener('click', (event) => {
			event.preventDefault()
			window.electronAPI.openLink(event.target.href)
		})
	}
}

/**
 * Initializes the app by creating the media upload elements of the `video` panel and then
 * displaying the initial panel view based on whether or not a `appSettings.homeFolder` has been saved in
 * the app configuration file. Also captures all links so they open in the default browser.
 */
async function startup() {
	await getSettings()
}

captureLinks()

// Home Screen Buttons
document.getElementById('action-list').addEventListener('click', () => {
	setCurrentPanel('videos')
})

document.getElementById('action-settings').addEventListener('click', () => {
	setCurrentPanel('settings')
})

document.getElementById('action-about').addEventListener('click', () => {
	setCurrentPanel('about')
})

// Footer Buttons
document.getElementById('nav-about').addEventListener('click', () => {
	if (currentPanel === 'about') {
		popCurrentPanel()
	} else {
		setCurrentPanel('about')
	}
})

document.getElementById('nav-settings').addEventListener('click', () => {
	if (currentPanel === 'settings') {
		popCurrentPanel()
	} else {
		setCurrentPanel('settings')
	}
})

document.getElementById('nav-back').addEventListener('click', () => {
	popCurrentPanel()
})

document.getElementById('nav-prev').addEventListener('click', () => {
	if (!document.getElementById('nav-prev').classList.contains('disabled')) {
		navigateMusicVideos(-1)
	}
})

document.getElementById('nav-next').addEventListener('click', () => {
	if (!document.getElementById('nav-next').classList.contains('disabled')) {
		navigateMusicVideos(1)
	}
})

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded')
	startup()
})
