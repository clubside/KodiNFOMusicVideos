import { musicVideos, musicVideoFields, currentMusicVideo, navigateMusicVideos, setCurrentPanel, updateMusicVideoNavigation } from './renderer-globals.js'
import { appSettings } from './renderer-settings.js'
import { filterMusicVideos } from './renderer-music-videos.js'
import { doLookup } from './renderer-lookup.js'

function toggleLookupPanel() {
	const content = document.querySelector('.panel-lookup-content')
	const contentHeight = content.style.maxHeight
	// console.log(contentHeight)
	content.style.maxHeight = contentHeight === '8px' ? '100vh' : '8px'
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
			const runtime = document.querySelector('#panel-video video').duration
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
			data[currentFieldName] = musicVideo[musicVideoField.field] ? `file://${appSettings.homeFolder}/${musicVideo.fileName}-${musicVideoField.field}.${musicVideo[musicVideoField.field]}` : undefined
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
		navigateMusicVideos(musicVideos.findIndex((item) => item.fileName === updatedMusicVideo.data.fileName))
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
			musicVideoElement.value = musicVideo[musicVideoField.field] ? `file://${appSettings.homeFolder}/${musicVideo.fileName}-${musicVideoField.field}.${musicVideo[musicVideoField.field]}` : ''
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
					// console.log(fanart, `musicvideo-${fanart.name}`, `file://${appSettings.homeFolder}/${musicVideo.fileName}-${fanart.name}.${fanart.type}`)
					const extrafanart = document.getElementById(`musicvideo-${fanart.name}`)
					extrafanart.value = `file://${appSettings.homeFolder}/${musicVideo.fileName}-${fanart.name}.${fanart.type}`
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
export function showMusicVideo(element) {
	if (element) {
		let parent = element
		while (parent.className !== 'video-item') {
			parent = parent.parentNode
		}
		console.log(parent.dataset.fileName)
		navigateMusicVideos(musicVideos.findIndex(({ fileName }) => fileName === parent.dataset.fileName))
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
	musicVideoElement.innerHTML = `<source src="${appSettings.homeFolder}/${musicVideo.fileName}.${musicVideo.fileType}" type="video/${musicVideoType}">`
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

document.querySelector('#panel-video video').addEventListener('error', () => {
	console.error('Error loading video')
	// possible check if mkv isn't really video/webm switch to video/x-matroska
})

document.getElementById('musicvideo-fanart').addEventListener('add', addFanart)

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
