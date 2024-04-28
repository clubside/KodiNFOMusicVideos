'use strict'

function paramsClear(text) {
	let clearText = text
	clearText = clearText.replace(/\[.*?\]/img, '')
	clearText = clearText.replace(/  /img, ' ')
	clearText = normalizeQuotes(clearText)
	return clearText.toLowerCase().trim()
}

function normalizeQuotes(text) {
	let normalizedText = text.toLowerCase()
	normalizedText = normalizedText.replace(/‘|’/img, "'")
	normalizedText = normalizedText.replace(/“|”/img, '"')
	return normalizedText
}

function parseImDbActots(text) {
	const actorsData = []
	const actors = text.split(', ')
	for (const actor of actors) {
		actorsData.push({ name: actor, role: '' })
	}
	return actorsData
}

function parseImDb(artists, title, musicVideos) {
	// console.log({ musicVideos })
	if (musicVideos.length === 1) {
		// console.log(musicVideos[0])
		return setImDb(musicVideos[0])
	}
	let titleMatches = musicVideos.filter(({ l }) => l.toLowerCase().includes(artists.toLowerCase()) && l.toLowerCase().includes(title.toLowerCase()))
	// console.log({ titleMatches })
	if (titleMatches.length === 0) {
		titleMatches = musicVideos.filter(({ l }) => {
			const matchTitle = l.replace(/&/img, 'and').toLowerCase()
			const lookupArtists = artists.replace(/&/img, 'and').toLowerCase()
			const lookupTitle = title.replace(/&/img, 'and').toLowerCase()
			return matchTitle.includes(lookupArtists) && matchTitle.includes(lookupTitle)
		})
	}
	if (titleMatches.length === 1) {
		// console.log(titleMatches[0])
		return setImDb(titleMatches[0])
	} else {
		const lookupData = { matches: [] }
		for (const musicVideo of musicVideos) {
			// console.log(musicVideo)
			const match = {}
			match.title = musicVideo.l
			if (musicVideo.y) {
				match.premiered = String(musicVideo.y)
			}
			if (musicVideo.s) {
				match.actors = parseImDbActots(musicVideo.s)
			}
			match.url = `https://www.imdb.com/title/${musicVideo.id}`
			lookupData.matches.push(match)
		}
		return lookupData
	}
}

function setImDb(data) {
	const lookupData = {}
	lookupData.page = `https://www.imdb.com/title/${data.id}`
	lookupData.title = data.l
	if (data.y) {
		lookupData.premiered = String(data.y)
	}
	if (data.s) {
		lookupData.actors = parseImDbActots(data.s)
	}
	return lookupData
}

async function getImDbVideo(artists, title) {
	const artistsCheck = paramsClear(artists)
	const titleCheck = paramsClear(title)
	const artistsLookup = artistsCheck.replace(/[^a-zA-Z\d\s]/mg, '').replace(/  /mg, ' ').replace(/ /mg, '+').toLowerCase()
	const titleLookup = titleCheck.replace(/[^a-zA-Z\d\s]/mg, '').replace(/  /mg, ' ').replace(/ /mg, '+').toLowerCase()
	let lookupData = {}
	const lookupUrl = `https://v2.sg.media-imdb.com/suggestion/h/${artistsLookup}+${titleLookup}.json`
	const response = await fetch(lookupUrl)
	if (!response.ok) {
		lookupData.fetchError = { source: 'IMDb', status: response.status }
	} else {
		const data = await response.json()
		if (data.d && data.d.length > 0) {
			const musicVideos = data.d.filter(({ qid }) => qid === 'musicVideo')
			if (musicVideos.length > 0) {
				lookupData = parseImDb(artistsCheck, titleCheck, musicVideos)
			}
		}
	}
	return lookupData
}

exports.lookupImDb = async (artists, title) => {
	return await getImDbVideo(artists, title)
}
