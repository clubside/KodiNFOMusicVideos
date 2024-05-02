import { musicVideos, musicVideoFields } from './renderer-globals.js'
import { appSettings } from './renderer-settings.js'
import { showMusicVideo } from './renderer-music-video.js'

let filteredMusicVideos = []

function toggleViewPanel() {
	const content = document.querySelector('.panel-view-content')
	const contentHeight = content.style.maxHeight
	console.log(contentHeight)
	content.style.maxHeight = contentHeight === '8px' ? '100vh' : '8px'
}

/**
 * Convert all `.view-filter` elements to filter the list of music videos.
 */
function captureFilters() {
	const filterElements = document.querySelectorAll('.view-filter')
	for (const filterElement of filterElements) {
		filterElement.addEventListener('input', filterMusicVideos)
	}
}

export function filterMusicVideos() {
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

export function initMusicVideos() {
	filteredMusicVideos = musicVideos
	showMusicVideos()
}

/**
 * Populates the `videos` panel with the current filtered list of music videos.
 */
export async function showMusicVideos() {
	const videosPanel = document.querySelector('.panel-videos-items')
	videosPanel.innerHTML = ''
	for (const musicVideo of filteredMusicVideos) {
		const holder = document.createElement('div')
		holder.className = 'video-item'
		holder.dataset.fileName = musicVideo.fileName
		const imageDiv = document.createElement('div')
		const imageDivImg = document.createElement('img')
		imageDivImg.src = musicVideo.thumb ? `file://${appSettings.homeFolder}/${musicVideo.fileName}-thumb.${musicVideo.thumb}` : 'img/no-thumbnail.jpg'
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
				if (!appSettings.videosExtended) {
					if (['artists', 'title'].includes(musicVideoField.field)) {
						renderMusicVideosDetail(detailsInfo, musicVideoField.label, musicVideo[musicVideoField.field], musicVideoField.display)
					}
				} else {
					renderMusicVideosDetail(detailsInfo, musicVideoField.label, musicVideo[musicVideoField.field], musicVideoField.display)
				}
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

captureFilters()

document.getElementById('tab-view').addEventListener('click', toggleViewPanel)
