import { initMusicVideos } from './renderer-music-videos.js'
import { showMusicVideo } from './renderer-music-video.js'

/**
 * Extended info for `musicVideo` entries.
 *
 * @typedef {Object} musicVideoField
 * @property {string} label - Label to display in front of value.
 * @property {string} field - Key in `musicvideos` to derive value.
 * @property {string} display - Format when displaying the value.
 * @property {string} edit - Format when editing the value.
 * @property {boolean} multiple - Whether multiple values are permitted.
 * @property {boolean} includeInVideos - Whether or not to display on the `videos` panel.
 * @property {boolean} includeInVideo - Whether or not to display on the `video` panel.
 * @property {string} includeInSave - How to process the field during save operation.
 */
/** @type {musicVideoField[]} */
export const musicVideoFields = [
	{ label: 'File Name', field: 'fileName', display: 'text', edit: 'text', multiple: false, includeInVideos: false, includeInVideo: true, includeInSave: 'fileName' },
	{ label: 'File Type', field: 'fileType', display: 'text', edit: 'text', multiple: false, includeInVideos: false, includeInVideo: false, includeInSave: '' },
	{ label: 'NFO', field: 'nfo', display: 'boolean', edit: 'none', multiple: false, includeInVideos: true, includeInVideo: false, includeInSave: '' },
	{ label: 'Artist', field: 'artists', display: 'text', edit: 'text', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Title', field: 'title', display: 'text', edit: 'text', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Album', field: 'album', display: 'text', edit: 'text', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Premiered', field: 'premiered', display: 'text', edit: 'text', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Director', field: 'directors', display: 'text', edit: 'text', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Studio', field: 'studios', display: 'text', edit: 'text', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Genre', field: 'genres', display: 'text', edit: 'text', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Tag', field: 'tags', display: 'text', edit: 'text', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Actor', field: 'actors', display: 'actors', edit: 'actors', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Runtime', field: 'runtime', display: 'text', edit: 'text', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'User Rating', field: 'userrating', display: 'stars', edit: 'text', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Plot', field: 'plot', display: 'text', edit: 'textarea', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' },
	{ label: 'Thumbnail', field: 'thumb', display: 'boolean', edit: 'media', multiple: false, includeInVideos: false, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Disc Art', field: 'discart', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Clear Logo', field: 'clearlogo', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Clear Art', field: 'clearart', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Poster', field: 'poster', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Banner', field: 'banner', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Landscape', field: 'landscape', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Key Art', field: 'keyart', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Fan Art', field: 'fanart', display: 'fanart', edit: 'fanart', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'fanart' }
]

/**
 * Collection of Kodi Music Videos with Javascript file details and `musicvideo` XML file information.
 *
 * @typedef {Object} musicVideo
 * @property {string} fileName - File name without extension.
 * @property {string} fileType - File extension.
 * @property {boolean} nfo - Is NFO file available based on `${fileName}.nfo` pattern.
 * @property {string|Array} artists - Artist of the song as string or array for multiple artists.
 * @property {string} title - Title of the song.
 * @property {string} album - Album the song appeared on.
 * @property {string} premiered - Date the video premiered in `yyyy-mm-dd` format, partial information accepted.
 * @property {string|Array} directors - Director of the video as string or array for multiple directors.
 * @property {string|Array} studios - Studio that produced the song as string or array for multiple studios.
 * @property {string|Array} genres - Genre of the song as string or array for multiple genres.
 * @property {string|Array} tags - User tag for the song as string or array for multiple tags.
 * @property {string|Array} actors - Actor that appeared in the video as string or array for multiple actors.
 * @property {string} runtime - Length of the video in `m:ss` format.
 * @property {integer} userrating - User rating for the video as a number between 1 and 5.
 * @property {string} plot - Description of the action seen in the video.
 * @property {boolean} thumb - Is thumbnail image available based on `${fileName}-thumb.${extension}` pattern.
 * @property {boolean} discart - Is disc art image available based on `${fileName}-discart.${extension}` pattern.
 * @property {boolean} clearlogo - Is clear logo image available based on `${fileName}-clearlogo.${extension}` pattern.
 * @property {boolean} clearart - Is clear art image available based on `${fileName}-clearart.${extension}` pattern.
 * @property {boolean} poster - Is poster image available based on `${fileName}-poster.${extension}` pattern.
 * @property {boolean} banner - Is banner image available based on `${fileName}-banner.${extension}` pattern.
 * @property {boolean} landscape - Is landscape image available based on `${fileName}-landscape.${extension}` pattern.
 * @property {boolean} keyart - Is key art image available based on `${fileName}-keyart.${extension}` pattern.
 * @property {Array} fanart - Is one or more fan art images available based on `${fileName}-fanart${'' || number}.${extension}` pattern.
 */
/** @type {musicVideo[]} */
export let musicVideos = []

export let currentMusicVideo = 0

const panels = ['home', 'videos', 'video', 'scan', 'settings', 'about']
const panelHistory = []

export let currentPanel = ''

let currentVideosScroll = 0

/**
 * Retrieves an array of `musicVideo` from the main process.
 */
export async function getMusicVideos() {
	musicVideos = await window.electronAPI.getMusicVideos()
	console.log(musicVideos)
	const musicVideosStats = [{ label: 'Total Videos', value: musicVideos.length }]
	let stats
	stats = musicVideos.filter((item) => item.nfo === true)
	musicVideosStats.push({ label: 'NFO Files', value: stats.length })
	stats = musicVideos.filter((item) => item.thumb !== undefined)
	musicVideosStats.push({ label: 'Thumbnails', value: stats.length })
	stats = musicVideos.filter((item) => item.discart !== undefined)
	musicVideosStats.push({ label: 'Disc Art', value: stats.length })
	stats = musicVideos.filter((item) => item.clearlogo !== undefined)
	musicVideosStats.push({ label: 'Clear Logo', value: stats.length })
	stats = musicVideos.filter((item) => item.clearart !== undefined)
	musicVideosStats.push({ label: 'Clear Art', value: stats.length })
	stats = musicVideos.filter((item) => item.fanart.length !== 0)
	let fanartCount = 0
	for (const fanart of stats) {
		fanartCount += fanart.fanart.length
	}
	musicVideosStats.push({ label: 'Fan Art', value: fanartCount })
	stats = musicVideosStats.map((item) => `<span>${item.label}: ${item.value}</span>`)
	document.querySelector('.panel-home-stats').innerHTML = stats.join('')
	initMusicVideos()
}

/**
 * Shows or hides the `video` panel navigation bar and enables or disables the Previous (`nav-prev`) and
 * Next (`nav-next`) video navigation buttons based on the position within the `musicVideos` array
 * defined by `currentMusicVideo`
 */
export function updateMusicVideoNavigation() {
	// console.log(currentMusicVideo, musicVideos.length)
	const navigation = document.getElementById('video-navigation')
	const navigationPrevious = document.getElementById('nav-prev')
	const navigationNext = document.getElementById('nav-next')
	if (currentPanel === 'video') {
		navigation.classList.remove('hidden')
		if (currentMusicVideo === 0) {
			navigationPrevious.classList.add('disabled')
		} else {
			navigationPrevious.classList.remove('disabled')
		}
		if (currentMusicVideo === musicVideos.length - 1) {
			navigationNext.classList.add('disabled')
		} else {
			navigationNext.classList.remove('disabled')
		}
	} else {
		navigation.classList.add('hidden')
	}
}

/**
 * Switches to the last panel in the `panelHistory` array.
 */
export function popCurrentPanel() {
	if (panelHistory.length > 0) {
		setCurrentPanel(panelHistory.pop(), false)
	}
}

/**
 * Switches to a new panel if different from the current one being displayed and adds to the panel
 * navigation history unless `addToHistory` is set to false. Only the `currentPanel` is displayed.
 *
 * @param {string} newPanel - Panel to display.
 * @param {boolean} [addToHistory=true] - Whether to add the Panel to the `panelHistory` object.
 */
export function setCurrentPanel(newPanel, addToHistory = true) {
	if (currentPanel === 'videos') {
		currentVideosScroll = document.querySelector('main').scrollTop
	}
	if (newPanel !== currentPanel) {
		if (addToHistory && currentPanel !== '') {
			panelHistory.push(currentPanel)
		}
		// console.log(panelHistory)
		currentPanel = newPanel
		for (const panel of panels) {
			document.getElementById(`panel-${panel}`).classList.add('hidden')
		}
		document.getElementById(`panel-${currentPanel}`).classList.remove('hidden')
		const historyNavigation = document.getElementById('nav-back')
		if (panelHistory.length > 0) {
			historyNavigation.removeAttribute('disabled')
		} else {
			historyNavigation.setAttribute('disabled', '')
		}
		updateMusicVideoNavigation()
		document.querySelector('main').scrollTop = currentPanel === 'videos' ? currentVideosScroll : 0
	}
}

export function navigateMusicVideos(value) {
	currentMusicVideo += value
	showMusicVideo()
}
