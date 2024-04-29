/**
 * This file is required by the index.html file and will be executed in the renderer process for that window.
 * No Node.js APIs are available in this process because `nodeIntegration` is turned off. Use `preload.js` to
 * selectively enable features needed in the rendering process.
 */
const darkMode = `:root {
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

const panels = ['videos', 'video', 'settings', 'about']
const panelHistory = []
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
const musicVideoFields = [
	{ label: 'File Name', field: 'fileName', display: 'text', edit: 'text', multiple: false, includeInVideos: false, includeInVideo: true, includeInSave: 'fileName' },
	{ label: 'File Type', field: 'fileType', display: 'text', edit: 'text', multiple: false, includeInVideos: false, includeInVideo: false, includeInSave: '' },
	{ label: 'NFO', field: 'nfo', display: 'boolean', edit: 'none', multiple: false, includeInVideos: true, includeInVideo: false, includeInSave: '' },
	{ label: 'Thumbnail', field: 'thumb', display: 'boolean', edit: 'media', multiple: false, includeInVideos: false, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Disc Art', field: 'discart', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Clear Logo', field: 'clearlogo', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Clear Art', field: 'clearart', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Poster', field: 'poster', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Banner', field: 'banner', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Landscape', field: 'landscape', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Key Art', field: 'keyart', display: 'boolean', edit: 'media', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'media' },
	{ label: 'Fan Art', field: 'fanart', display: 'fanart', edit: 'fanart', multiple: true, includeInVideos: true, includeInVideo: true, includeInSave: 'fanart' },
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
	{ label: 'Plot', field: 'plot', display: 'text', edit: 'textarea', multiple: false, includeInVideos: true, includeInVideo: true, includeInSave: 'musicvideo' }
]

const lookupProviders = [
	{ title: 'TheAudioDB', data: 'theAudioDb' },
	{ title: 'MusicBrainz', data: 'musicBrainz' },
	{ title: 'IMVDb', data: 'imvDb' },
	{ title: 'IMDb', data: 'imDb' },
	{ title: 'Wikipedia', data: 'wikipedia' },
	{ title: 'Fanart.tv', data: 'fanartTv' }
]

const lookupFields = ['artists', 'title', 'album', 'premiered', 'genres', 'directors', 'studios', 'actors', 'plot', 'thumb', 'cdart', 'clearlogo', 'clearart', 'artistthumb', 'banner', 'landscape', 'fanart']

let homeFolder = ''
let currentPanel = ''

/**
 * Collection of Kodi Music Videos with Javascript file details and `musicvideo` XML file information.
 *
 * @typedef {Object} musicVideo
 * @property {string} fileName - File name without extension.
 * @property {string} fileType - File extension.
 * @property {boolean} nfo - Is NFO file available based on `${fileName}.nfo` pattern.
 * @property {boolean} thumb - Is thumbnail image available based on `${fileName}-thumb.${extension}` pattern.
 * @property {boolean} discart - Is disc art image available based on `${fileName}-discart.${extension}` pattern.
 * @property {boolean} clearlogo - Is clear logo image available based on `${fileName}-clearlogo.${extension}` pattern.
 * @property {boolean} clearart - Is clear art image available based on `${fileName}-clearart.${extension}` pattern.
 * @property {boolean} poster - Is poster image available based on `${fileName}-poster.${extension}` pattern.
 * @property {boolean} banner - Is banner image available based on `${fileName}-banner.${extension}` pattern.
 * @property {boolean} landscape - Is landscape image available based on `${fileName}-landscape.${extension}` pattern.
 * @property {boolean} keyart - Is key art image available based on `${fileName}-keyart.${extension}` pattern.
 * @property {Array} fanart - Is one or more fan art images available based on `${fileName}-fanart${'' || number}.${extension}` pattern.
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
 */
/** @type {musicVideo[]} */
let musicVideos = []
let filteredMusicVideos = []
let currentMusicVideo = 0
let currentVideosScroll = 0

/**
 * Convert all `.view-filter` elements to filter the list of music videos.
 */
function captureFilters() {
	const filterElements = document.querySelectorAll('.view-filter')
	for (const filterElement of filterElements) {
		filterElement.addEventListener('input', filterMusicVideos)
	}
}

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
 * Enables or disables the Set (`set-folder`) button on the `settings` panel based on the `homeFolder` value.
 */
function checkHomeFolder() {
	const setFolder = document.getElementById('set-folder')
	if (homeFolder === '') {
		setFolder.setAttribute('disabled', '')
	} else {
		setFolder.removeAttribute('disabled')
	}
}

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

function toggleViewPanel() {
	const content = document.querySelector('.panel-view-content')
	const contentHeight = content.style.maxHeight
	console.log(contentHeight)
	content.style.maxHeight = contentHeight === '8px' ? '100vh' : '8px'
}

function toggleLookupPanel() {
	const content = document.querySelector('.panel-lookup-content')
	const contentHeight = content.style.maxHeight
	// console.log(contentHeight)
	content.style.maxHeight = contentHeight === '8px' ? '100vh' : '8px'
}

function renderLookupProvider(title, data) {
	const results = document.querySelector('.panel-lookup-content-results')
	const heading = document.createElement('h2')
	if (data.page) {
		heading.innerHTML = `${title} <svg><use href="#icon-link"></use></svg>`
		heading.addEventListener('click', () => {
			window.electronAPI.openLink(data.page)
		})
	} else {
		heading.innerHTML = title
	}
	results.appendChild(heading)
	const holder = document.createElement('div')
	console.log(data)
	for (const field of lookupFields) {
		if (data[field]) {
			switch (field) {
				case 'thumb':
				case 'cdart':
				case 'clearlogo':
				case 'clearart':
				case 'artistthumb':
				case 'landscape':
				case 'banner':
				case 'fanart': {
					const images = data[field]
					let hasImages = ''
					if (Array.isArray(images)) {
						if (images.length > 0) {
							hasImages = 'array'
						}
					} else {
						if (images !== '') {
							hasImages = 'text'
						}
					}
					if (hasImages !== '') {
						const div = document.createElement('div')
						const header = document.createElement('p')
						header.innerHTML = field
						div.appendChild(header)
						if (hasImages === 'text') {
							const imageElement = document.createElement('img')
							imageElement.src = images
							div.appendChild(imageElement)
						} else {
							for (const image of images) {
								const imageElement = document.createElement('img')
								imageElement.src = image
								div.appendChild(imageElement)
							}
						}
						holder.appendChild(div)
					}
					break
				}
				case 'plot': {
					const div = document.createElement('div')
					const link = document.createElement('a')
					link.innerHTML = field
					link.addEventListener('click', () => {
						document.getElementById(`musicvideo-${field}`).value = data[field]
					})
					div.appendChild(link)
					const textarea = document.createElement('textarea')
					textarea.setAttribute('readonly', '')
					textarea.innerHTML = data[field]
					div.appendChild(textarea)
					holder.appendChild(div)
					break
				}
				case 'artists': {
					const artistsData = data[field]
					const artists = []
					for (const artist of artistsData) {
						artists.push(artist.name)
					}
					const artistsString = artists.join('; ')
					const link = document.createElement('a')
					link.innerHTML = field
					link.addEventListener('click', () => {
						document.getElementById(`musicvideo-${field}`).value = artistsString
					})
					holder.appendChild(link)
					const span = document.createElement('span')
					span.innerHTML = artistsString
					holder.appendChild(span)
					break
				}
				case 'actors': {
					const actorsData = data[field]
					const actors = []
					for (const actor of actorsData) {
						let actorString = actor.name
						if (actor.role) {
							actorString += ` (${actor.role})`
						}
						actors.push(actorString)
					}
					const actorsString = actors.join('; ')
					const link = document.createElement('a')
					link.innerHTML = field
					link.addEventListener('click', () => {
						document.getElementById(`musicvideo-${field}`).value = actorsString
					})
					holder.appendChild(link)
					const span = document.createElement('span')
					span.innerHTML = actorsString
					holder.appendChild(span)
					break
				}
				default: {
					const link = document.createElement('a')
					link.innerHTML = field
					link.addEventListener('click', () => {
						document.getElementById(`musicvideo-${field}`).value = data[field]
					})
					holder.appendChild(link)
					const span = document.createElement('span')
					span.innerHTML = data[field]
					holder.appendChild(span)
				}
			}
		}
	}
	if (data.matches) {
		console.log(data.matches)
		switch (title) {
			case 'IMVDb': {
				const div = document.createElement('div')
				for (const match of data.matches) {
					const artistsData = match.artists
					const artists = []
					for (const artist of artistsData) {
						artists.push(artist.name)
					}
					const artistsString = artists.join('; ')
					const link = document.createElement('a')
					link.innerHTML = `${artistsString} - ${match.title} (${match.premiered})${match.version ? ` [${match.version}]` : ''}`
					link.addEventListener('click', () => {
						window.electronAPI.openLink(match.url)
					})
					div.appendChild(link)
				}
				holder.appendChild(div)
				break
			}
			case 'IMDb': {
				const div = document.createElement('div')
				for (const match of data.matches) {
					const actorsData = match.actors
					const actors = []
					for (const actor of actorsData) {
						actors.push(actor.name)
					}
					const actorString = actors.join('; ')
					const link = document.createElement('a')
					link.innerHTML = `${match.title}${match.premiered ? ` (${match.premiered})` : ''} - ${actorString}`
					link.addEventListener('click', () => {
						window.electronAPI.openLink(`https://www.imdb.com/title/${match.id}/`)
					})
					div.appendChild(link)
				}
				holder.appendChild(div)
				break
			}
		}
	}
	results.appendChild(holder)
}

async function doLookup() {
	document.querySelector('body').classList.add('lookup')
	const musicvideoArtists = document.getElementById('musicvideo-artists').value
	const musicvideoTitle = document.getElementById('musicvideo-title').value
	const lookupArtists = document.getElementById('lookup-artists').value
	const lookupTitle = document.getElementById('lookup-title').value
	const results = document.querySelector('.panel-lookup-content-results')
	results.innerHTML = ''
	const lookupActionArtists = lookupArtists || musicvideoArtists
	const lookupActionTitle = lookupTitle || musicvideoTitle
	console.log(lookupActionArtists, lookupActionTitle)
	const lookup = await window.electronAPI.getLookup(lookupActionArtists, lookupActionTitle)
	console.log(lookup)
	if (!lookup.error) {
		for (const provider of lookupProviders) {
			if (lookup[provider.data]) {
				if (Object.keys(lookup[provider.data]).length > 0) {
					renderLookupProvider(provider.title, lookup[provider.data])
				}
			}
		}
	}
	document.querySelector('body').classList.remove('lookup')
}

function setLookupAction() {
	const musicvideoTitle = document.getElementById('musicvideo-title').value
	const lookupTitle = document.getElementById('lookup-title').value
	const lookupButton = document.getElementById('action-lookup')
	if (musicvideoTitle !== '' || lookupTitle !== '') {
		lookupButton.removeAttribute('disabled')
	} else {
		lookupButton.setAttribute('disabled', '')
	}
}

function autoArtistTitleRuntime() {
	const fileName = document.getElementById('musicvideo-filename').value
	if (fileName) {
		const separator = fileName.indexOf(' - ')
		if (separator) {
			const artist = fileName.substring(0, separator).trim()
			const title = fileName.substring(separator + 3).trim()
			const runtime = document.querySelector('video').duration
			// console.log(artist, title, runtime)
			let titleFormatted = title
			const titleStrip = title.match(/ (\(|\[)(official|video|restored)/i)
			if (titleStrip && titleStrip.length > 0) {
				// console.log(titleStrip)
				titleFormatted = title.substring(0, titleStrip.index)
			}
			const runtimeFormatted = `${Math.floor(runtime % 3600 / 60)}:${Math.floor(runtime % 60).toString().padStart(2, '0')}`
			console.log(artist, titleFormatted, runtimeFormatted)
			document.getElementById('musicvideo-artists').value = artist
			document.getElementById('musicvideo-title').value = titleFormatted
			document.getElementById('musicvideo-runtime').value = runtimeFormatted
		}
	}
	setLookupAction()
}

/**
 * Adds an additional instance of the `<media-upload>` element to handle additional Fan Art. Each instance
 * includes a query selector instance of class `.extrafanart` for iteration and an `id` that matches the
 * pattern of `musicvideo-fanart${current maximum fanart}`.
 */
function addFanart() {
	const panelImages = document.getElementById('panel-video-images')
	const fanarts = panelImages.querySelectorAll('.fanart')
	const fanartCount = fanarts.length + 1
	const label = document.createElement('label')
	label.className = 'fanart'
	const span = document.createElement('span')
	span.innerHTML = `Fan Art ${fanartCount}`
	label.appendChild(span)
	const extrafanart = document.createElement('media-upload')
	extrafanart.id = `musicvideo-fanart${fanartCount}`
	extrafanart.className = 'media-upload media-upload-16x9 extrafanart'
	extrafanart.setAttribute('types', 'image/jpeg image/png image/webp')
	extrafanart.setAttribute('removable', '')
	extrafanart.setAttribute('addable', '')
	extrafanart.addEventListener('add', addFanart)
	extrafanart.addEventListener('remove', removeFanart)
	label.appendChild(extrafanart)
	panelImages.appendChild(label)
}

function removeFanart(event) {
	event.target.parentNode.remove()
	const panelImages = document.getElementById('panel-video-images')
	const fanarts = panelImages.querySelectorAll('.fanart')
	let i = 1
	for (const fanart of fanarts) {
		fanart.firstChild.innerHTML = `Fanart ${i}`
		i++
	}
}

/**
 * Shows or hides the `video` panel navigation bar and enables or disables the Previous (`nav-prev`) and
 * Next (`nav-next`) video navigation buttons based on the position within the `musicVideos` array
 * defined by `currentMusicVideo`
 */
function updateMusicVideoNavigation() {
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
function popCurrentPanel() {
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
function setCurrentPanel(newPanel, addToHistory = true) {
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

/**
 * Populates a save object from the form fields and sends the data to the main process for saving the
 * NFO file if there is data as well as any updated images.
 */
async function saveMusicVideo() {
	document.querySelector('body').classList.add('lookup')
	const musicVideoForm = document.querySelector('.panel-video-fields')
	if (!musicVideoForm.reportValidity()) {
		return
	}
	const musicVideo = musicVideos[currentMusicVideo]
	const data = {
		currentFileName: musicVideo.fileName,
		fileName: '',
		fileType: musicVideo.fileType,
		nfo: musicVideo.nfo,
		musicvideo: {}
	}
	for (const musicVideoField of musicVideoFields) {
		if (musicVideoField.includeInSave === 'media') {
			const fieldName = musicVideoField.field
			const currentFieldName = `current${fieldName[0].toUpperCase() + fieldName.slice(1)}`
			data[currentFieldName] = musicVideo[musicVideoField.field] ? `file://${homeFolder}/${musicVideo.fileName}-${musicVideoField.field}.${musicVideo[musicVideoField.field]}` : undefined
			data[musicVideoField.field] = undefined
		} else if (musicVideoField.includeInSave === 'fanart') {
			data.currentFanart = musicVideo.fanart
		}
	}
	for (const musicVideoField of musicVideoFields) {
		if (musicVideoField.includeInSave) {
			const musicVideoElement = document.getElementById(`musicvideo-${musicVideoField.field.toLowerCase()}`)
			switch (musicVideoField.includeInSave) {
				case 'fileName':
					data.fileName = musicVideoElement.value
					break
				case 'media': {
					data[musicVideoField.field] = musicVideoElement.value || undefined
					break
				}
				case 'fanart': {
					const fanartFiles = []
					const media = musicVideoElement.value
					if (media) {
						fanartFiles.push(media)
					}
					const panelImages = document.getElementById('panel-video-images')
					const extrafanarts = panelImages.querySelectorAll('.extrafanart')
					for (const extrafanart of extrafanarts) {
						const fanart = extrafanart.value
						if (fanart) {
							fanartFiles.push(fanart)
						}
					}
					if (fanartFiles.length > 0) {
						data.fanart = fanartFiles
					} else {
						data.fanart = []
					}
					break
				}
				case 'musicvideo':
					// console.log(musicVideoField.field, musicVideoElementvalue)
					if (musicVideoElement.value) {
						if (musicVideoElement.value !== '') {
							if (musicVideoField.multiple) {
								const values = musicVideoElement.value.split(';')
								data.musicvideo[musicVideoField.field] = values.map((item) => item.trim())
							} else {
								data.musicvideo[musicVideoField.field] = musicVideoElement.value
							}
						}
					}
					break
			}
		}
	}
	console.log(data)
	const updatedMusicVideo = await window.electronAPI.saveMusicVideo(data)
	if (!updatedMusicVideo.error) {
		console.log(updatedMusicVideo.data)
		musicVideos.splice(currentMusicVideo, 1, updatedMusicVideo.data)
		musicVideos.sort((a, b) => a.fileName.localeCompare(b.fileName))
		currentMusicVideo = musicVideos.findIndex((item) => item.fileName === updatedMusicVideo.data.fileName)
		console.log(musicVideos[currentMusicVideo])
		showMusicVideo()
		filterMusicVideos()
	}
	document.querySelector('body').classList.remove('lookup')
}

/**
 * Populates a form field of the `video` panel.
 *
 * @param {string} item - Field name from `musicVideoFields`.
 * @param {string} value - Value to be displayed. If `value` is `undefined` an empty string is set.
 * @param {string} type - The type of input.
 */
function setMusicVideoValue(musicVideoField, musicVideo) {
	const value = musicVideo[musicVideoField.field]
	const musicVideoElement = document.getElementById(`musicvideo-${musicVideoField.field.toLowerCase()}`)
	switch (musicVideoField.edit) {
		case 'textarea':
			musicVideoElement.value = value || ''
			break
		case 'actors': {
			const actors = []
			if (value) {
				for (const actor of value) {
					let actorString = actor.name
					if (actor.role) {
						actorString += ` (${actor.role})`
					}
					actors.push(actorString)
				}
			}
			musicVideoElement.value = actors.join('; ')
			break
		}
		case 'media':
			musicVideoElement.value = musicVideo[musicVideoField.field] ? `file://${homeFolder}/${musicVideo.fileName}-${musicVideoField.field}.${musicVideo[musicVideoField.field]}` : ''
			break
		case 'fanart': {
			const panelImages = document.getElementById('panel-video-images')
			const extrafanarts = panelImages.querySelectorAll('.fanart')
			for (const extrafanart of extrafanarts) {
				extrafanart.remove()
			}
			if (musicVideo.fanart.length > 0) {
				if (musicVideo.fanart.length > 1) {
					for (let i = 1; i < musicVideo.fanart.length; i++) {
						const label = document.createElement('label')
						label.className = 'fanart'
						const span = document.createElement('span')
						span.innerHTML = `Fan Art ${i}`
						label.appendChild(span)
						const extrafanart = document.createElement('media-upload')
						extrafanart.id = `musicvideo-fanart${i}`
						extrafanart.className = 'media-upload media-upload-16x9 extrafanart'
						extrafanart.setAttribute('types', 'image/jpeg image/png image/webp')
						extrafanart.setAttribute('removable', '')
						extrafanart.setAttribute('addable', '')
						extrafanart.addEventListener('add', addFanart)
						extrafanart.addEventListener('remove', removeFanart)
						label.appendChild(extrafanart)
						panelImages.appendChild(label)
					}
				}
				for (const fanart of musicVideo.fanart) {
					// console.log(fanart, `musicvideo-${fanart.name}`, `file://${homeFolder}/${musicVideo.fileName}-${fanart.name}.${fanart.type}`)
					const extrafanart = document.getElementById(`musicvideo-${fanart.name}`)
					extrafanart.value = `file://${homeFolder}/${musicVideo.fileName}-${fanart.name}.${fanart.type}`
				}
			} else {
				musicVideoElement.removeAttribute('value')
			}
			break
		}
		default:
			if (musicVideoField.multiple) {
				if (value) {
					musicVideoElement.value = value.join('; ')
				} else {
					musicVideoElement.value = ''
				}
			} else {
				musicVideoElement.value = value || ''
			}
	}
}

/**
 * Populates the `video` panel with details based on the `musicVideos` entry discovered through walking
 * up the DOM to discover the parent with `fileName` data.
 *
 * @param {HTMLElement} element - DOM element that received the `click` event from the `videos` panel.
 */
function showMusicVideo(element) {
	if (element) {
		let parent = element
		while (parent.className !== 'video-item') {
			parent = parent.parentNode
		}
		console.log(parent.dataset.fileName)
		currentMusicVideo = musicVideos.findIndex(({ fileName }) => fileName === parent.dataset.fileName)
	}
	document.getElementById('lookup-artists').value = ''
	document.getElementById('lookup-title').value = ''
	document.querySelector('.panel-lookup-content-results').innerHTML = ''
	/** @type {musicVideo} */
	const musicVideo = musicVideos[currentMusicVideo]
	console.log(musicVideo)
	let musicVideoType
	switch (musicVideo.fileType) {
		case 'mov':
			musicVideoType = 'mp4'
			break
		case 'mkv':
			musicVideoType = 'webm'
			break
		default:
			musicVideoType = musicVideo.fileType
	}
	const musicVideoElement = document.querySelector('#panel-video video')
	musicVideoElement.innerHTML = `<source src="${homeFolder}/${musicVideo.fileName}.${musicVideo.fileType}" type="video/${musicVideoType}">`
	musicVideoElement.load()
	for (const musicVideoField of musicVideoFields) {
		if (musicVideoField.includeInVideo) {
			setMusicVideoValue(musicVideoField, musicVideo)
		}
	}
	updateMusicVideoNavigation()
	setLookupAction()
	setCurrentPanel('video')
}

/**
 * Retrieves an array of `musicVideo` from the main process.
 */
async function getMusicVideos() {
	musicVideos = await window.electronAPI.getMusicVideos()
	filteredMusicVideos = musicVideos
	console.log(musicVideos)
	showMusicVideos()
}

function filterMusicVideos() {
	const filterView = []
	const filters = document.querySelectorAll('.view-filter')
	let noFilter = true
	for (const filter of filters) {
		filterView.push({ field: filter.id.substring(7), value: filter.value })
		if (filter.value !== '' && filter.value !== '0') {
			noFilter = false
		}
	}
	console.log(filterView)
	if (noFilter) {
		filteredMusicVideos = musicVideos
		document.getElementById('tab-view').innerHTML = 'View'
	} else {
		filteredMusicVideos = []
		for (const musicVideo of musicVideos) {
			// console.log(musicVideo)
			let includeEntry = true
			for (const filter of filterView) {
				switch (filter.field) {
					case 'bar-filename':
						if (filter.value !== '' && !musicVideo.fileName.toLowerCase().includes(filter.value.toLowerCase())) {
							includeEntry = false
						}
						break
					case 'bar-artists':
						if (filter.value !== '') {
							if (!musicVideo.artists) {
								includeEntry = false
							} else if (Array.isArray(musicVideo.artists)) {
								for (const artist of musicVideo.artists) {
									if (!artist.toLowerCase().includes(filter.value.toLowerCase())) {
										includeEntry = false
										break
									}
								}
							} else {
								if (!musicVideo.artists.toLowerCase().includes(filter.value.toLowerCase())) {
									includeEntry = false
								}
							}
						}
						break
					case 'bar-title':
						if (filter.value !== '') {
							if (!musicVideo.title) {
								includeEntry = false
							} else if (!musicVideo.title.toLowerCase().includes(filter.value.toLowerCase())) {
								includeEntry = false
							}
						}
						break
					case 'nfo':
						if (filter.value === '1' && musicVideo.nfo === false) {
							includeEntry = false
						} else if (filter.value === '2' && musicVideo.nfo === true) {
							includeEntry = false
						}
						break
					case 'fanart':
						if (filter.value === '1' && musicVideo.fanart.length === 0) {
							includeEntry = false
						} else if (filter.value === '2' && musicVideo.fanart.length > 0) {
							includeEntry = false
						}
						break
					default:
						if (filter.value === '1' && (!musicVideo[filter.field] || musicVideo[filter.field] === undefined)) {
							includeEntry = false
						} else if (filter.value === '2' && (musicVideo[filter.field] || musicVideo[filter.field] !== undefined)) {
							includeEntry = false
						}
				}
			}
			if (includeEntry) {
				filteredMusicVideos.push(musicVideo)
			}
		}
		document.getElementById('tab-view').innerHTML = 'View (Filtered)'
	}
	showMusicVideos()
}

/**
 * Render a `musicVideo` value with a bold label. If `value` is an `Array` it is converted to a
 * string separated by semi-colons.
 *
 * @param {HTMLElement} element - The element to append the label/vale pair to.
 * @param {string} label - The label to display.
 * @param {string|integer|boolean|Array} value - The value to display.
 * @param {string} type - How to display the value.
 */
function renderMusicVideosDetail(element, label, value, type) {
	if (value !== undefined) {
		let renderedValue = ''
		let valueIsArray = Array.isArray(value)
		const div = document.createElement('div')
		switch (type) {
			case 'boolean':
				renderedValue = value ? 'Yes' : 'No'
				break
			case 'fanart':
				if (value.length === 0) {
					return
				} else {
					if (value.length === 1) {
						renderedValue = 'Yes'
					} else {
						renderedValue = `Yes (${value.length})`
					}
					valueIsArray = false
				}
				break
			case 'stars':
				renderedValue += '<span style="vertical-align: middle;">'
				for (let i = 1; i < value + 1; i++) {
					renderedValue += '<svg class="star-display star-selected"><use href="#icon-star"></use></svg>'
				}
				renderedValue += '</span>'
				break
			case 'actors': {
				const actors = []
				for (const actor of value) {
					let actorString = actor.name
					if (actor.role) {
						actorString += ` (${actor.role})`
					}
					actors.push(actorString)
				}
				renderedValue = actors.join('; ')
				break
			}
			default:
				if (valueIsArray) {
					renderedValue = value.join('; ')
				} else {
					renderedValue = value.length > 80 ? `${value.substring(0, 80)}...` : value
				}
		}
		// console.log(label, value, renderedValue)
		div.innerHTML = `<strong>${label}${valueIsArray ? 's' : ''}</strong>: ${renderedValue}`
		element.appendChild(div)
	}
}

/**
 * Populates the `videos` panel with the current filtered list of music videos.
 */
async function showMusicVideos() {
	const videosPanel = document.querySelector('.panel-videos-items')
	videosPanel.innerHTML = ''
	for (const musicVideo of filteredMusicVideos) {
		const holder = document.createElement('div')
		holder.className = 'video-item'
		holder.dataset.fileName = musicVideo.fileName
		const imageDiv = document.createElement('div')
		const imageDivImg = document.createElement('img')
		imageDivImg.src = musicVideo.thumb ? `file://${homeFolder}/${musicVideo.fileName}-thumb.${musicVideo.thumb}` : 'img/no-thumbnail.jpg'
		imageDiv.appendChild(imageDivImg)
		holder.appendChild(imageDiv)
		const detailsDiv = document.createElement('div')
		const detailsHeader = document.createElement('h4')
		detailsHeader.innerHTML = musicVideo.fileName
		detailsDiv.appendChild(detailsHeader)
		const detailsInfo = document.createElement('div')
		detailsInfo.className = 'video-item-details'
		for (const musicVideoField of musicVideoFields) {
			if (musicVideoField.includeInVideos) {
				renderMusicVideosDetail(detailsInfo, musicVideoField.label, musicVideo[musicVideoField.field], musicVideoField.display)
			}
		}
		detailsDiv.appendChild(detailsInfo)
		holder.appendChild(detailsDiv)
		holder.addEventListener('click', (event) => {
			showMusicVideo(event.target)
		})
		videosPanel.appendChild(holder)
	}
}

/**
 * Initializes the app by creating the media upload elements of the `video` panel and then
 * displaying the initial panel view based on whether or not a `homeFolder` has been saved in
 * the app configuration file. Also captures all links so they open in the default browser.
 */
async function startup() {
	captureFilters()
	captureLinks()
	document.getElementById('musicvideo-fanart').addEventListener('add', addFanart)
	homeFolder = await window.electronAPI.getFolder()
	console.log(homeFolder)
	toggleColorMode(await window.electronAPI.getColorMode())
	if (homeFolder !== '') {
		await getMusicVideos()
		setCurrentPanel('videos', false)
	} else {
		setCurrentPanel('settings', false)
	}
}

document.querySelector('#panel-video video').addEventListener('error', () => {
	console.error('Error loading video')
	// possible check if mkv isn't really video/webm switch to video/x-matroska
})

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

document.getElementById('nav-color-mode').addEventListener('click', toggleColorMode)

document.getElementById('browse-folder').addEventListener('click', async () => {
	const newFolder = await window.electronAPI.chooseFolder()
	if (newFolder !== '') {
		homeFolder = newFolder
		document.getElementById('home-folder').value = homeFolder
		checkHomeFolder()
	}
})

document.getElementById('home-folder').addEventListener('change', () => {
	homeFolder = document.getElementById('home-folder').value
	checkHomeFolder()
})

document.getElementById('set-folder').addEventListener('click', async () => {
	console.log(`setting music videos folder to ${homeFolder}`)
	homeFolder = await window.electronAPI.setFolder(homeFolder)
	console.log(`new music videos folder is ${homeFolder}`)
	if (homeFolder !== '') {
		await getMusicVideos()
		setCurrentPanel('videos', false)
	}
})

document.getElementById('nav-back').addEventListener('click', () => {
	popCurrentPanel()
})

document.getElementById('nav-prev').addEventListener('click', () => {
	if (!document.getElementById('nav-prev').classList.contains('disabled')) {
		currentMusicVideo--
		showMusicVideo()
	}
})

document.getElementById('nav-next').addEventListener('click', () => {
	if (!document.getElementById('nav-next').classList.contains('disabled')) {
		currentMusicVideo++
		showMusicVideo()
	}
})

document.getElementById('tab-view').addEventListener('click', toggleViewPanel)

document.getElementById('tab-lookup').addEventListener('click', toggleLookupPanel)

document.getElementById('action-lookup').addEventListener('click', doLookup)

document.getElementById('action-auto').addEventListener('click', autoArtistTitleRuntime)

document.getElementById('action-save').addEventListener('click', saveMusicVideo)

for (const input of ['musicvideo-artists', 'musicvideo-title', 'lookup-artists', 'lookup-title']) {
	const inputElement = document.getElementById(input)
	inputElement.addEventListener('input', setLookupAction)
}

window.electronAPI.captureVideoFrameAsMedia((value) => {
	console.log('Capture video frame...')
	const video = document.querySelector('#panel-video video')
	const canvas = document.createElement('canvas')
	canvas.width = video.videoWidth
	canvas.height = video.videoHeight
	const canvasContext = canvas.getContext('2d')
	canvasContext.drawImage(video, 0, 0)
	// console.log(canvas.toDataURL('image/png'))
	switch (value) {
		case 'fanart-new': {
			addFanart()
			const extrafanart = document.querySelectorAll('.extrafanart')
			document.getElementById(`musicvideo-fanart${extrafanart.length}`).value = canvas.toDataURL('image/png')
			break
		}
		default:
			document.getElementById(`musicvideo-${value}`).value = canvas.toDataURL('image/png')
	}
})

window.onload = () => {
	startup()
}
