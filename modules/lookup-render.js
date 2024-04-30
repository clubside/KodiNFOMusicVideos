const lookupProviders = [
	{ title: 'TheAudioDB', data: 'theAudioDb' },
	{ title: 'MusicBrainz', data: 'musicBrainz' },
	{ title: 'IMVDb', data: 'imvDb' },
	{ title: 'IMDb', data: 'imDb' },
	{ title: 'Wikipedia', data: 'wikipedia' },
	{ title: 'Fanart.tv', data: 'fanartTv' }
]

const lookupFields = ['artists', 'title', 'album', 'premiered', 'genres', 'directors', 'studios', 'actors', 'plot', 'thumb', 'cdart', 'clearlogo', 'clearart', 'artistthumb', 'banner', 'landscape', 'fanart']

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
					console.log(data[field], Array.isArray(data[field]))
					let valueString = data[field]
					if (Array.isArray(data[field])) {
						valueString = data[field].join('; ')
					}
					const link = document.createElement('a')
					link.innerHTML = field
					link.addEventListener('click', () => {
						document.getElementById(`musicvideo-${field}`).value = valueString
					})
					holder.appendChild(link)
					const span = document.createElement('span')
					span.innerHTML = valueString
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

export async function doLookup() {
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
			if (lookup[provider.data] && !lookup[provider.data].fetchError) {
				console.log(lookup[provider.data])
				if (Object.keys(lookup[provider.data]).length > 0) {
					renderLookupProvider(provider.title, lookup[provider.data])
				}
			}
		}
	}
	document.querySelector('body').classList.remove('lookup')
}
