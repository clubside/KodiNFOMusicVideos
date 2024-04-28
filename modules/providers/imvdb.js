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

function getImvDbArtists(artists) {
	const artistData = []
	for (const artist of artists) {
		artistData.push({ name: artist.name })
	}
	return artistData
}

function parseImvDbArtists(artists) {
	let artistString = ''
	let artistCount = 1
	for (const artist of artists) {
		artistString += `${artist.name}${artistCount < artists.length ? '; ' : ''}`
		artistCount++
	}
	return artistString
}

async function searchImvDbVideos(artists, title) {
	const artistsCheck = paramsClear(artists)
	const titleCheck = paramsClear(title)
	const artistLookup = artistsCheck.replace(/[^a-zA-Z\d\s]/mg, '').replace(/  /mg, ' ').replace(/ /mg, '+')
	const titleLookup = titleCheck.replace(/[^a-zA-Z\d\s]/mg, '').replace(/  /mg, ' ').replace(/ /mg, '+')
	const lookupUrl = `https://imvdb.com/api/v1/search/videos?q=${artistLookup}+${titleLookup}`
	const response = await fetch(lookupUrl)
	const lookups = []
	if (response.ok) {
		const resultsData = await response.json()
		if (resultsData.results && resultsData.results.length > 0) {
			const results = resultsData.results
			let items = results
			// eslint-disable-next-line camelcase
			const potentials = results.filter(({ song_title }) => String(song_title).toLowerCase() === titleCheck || titleCheck.includes(String(song_title).toLowerCase()))
			const matches = []
			const picks = []
			if (potentials.length > 0) {
				items = potentials
				for (const potential of potentials) {
					const videoArtists = parseImvDbArtists(potential.artists)
					// console.log(artists)
					if (videoArtists.toLowerCase().includes(artistsCheck)) {
						matches.push(potential)
					}
				}
				// console.log(matches)
				if (matches.length > 0) {
					items = matches
					if (matches.length > 1) {
						for (const match of matches) {
							if (match.year) {
								picks.push(match)
							}
						}
						if (picks.length > 0) {
							items = picks
						}
					}
				}
			}
			for (const item of items) {
				// console.log(item)
				const lookup = {
					id: item.id,
					artists: item.artists,
					title: item.song_title,
					premiered: item.year,
					url: item.url
				}
				if (item.version_name) {
					lookup.version = item.version_name
				}
				if (item.image && item.image.o) {
					lookup.thumb = item.image.o
				}
				lookups.push(lookup)
			}
		}
	}
	return lookups
}

async function getImvDbVideo(artists, title) {
	const lookupData = {}
	const video = await searchImvDbVideos(artists, title)
	if (video.length > 0) {
		if (video.length > 1) {
			lookupData.matches = video
		} else {
			const videoMatch = video[0]
			lookupData.page = videoMatch.url
			lookupData.artists = getImvDbArtists(videoMatch.artists)
			lookupData.title = videoMatch.title
			lookupData.premiered = String(videoMatch.premiered)
			const response = await fetch(`https://imvdb.com/api/v1/video/${videoMatch.id}?include=credits,featured`)
			if (!response.ok) {
				lookupData.fetchError = { source: 'IMVDb', status: response.status }
			} else {
				const videoData = await response.json()
				// console.log(videoData)
				if (videoData.directors && videoData.directors.length > 0) {
					let directors = ''
					let directorCount = 1
					for (const director of videoData.directors) {
						directors += `${director.entity_name}${directorCount < videoData.directors.length ? '; ' : ''}`
						directorCount++
					}
					lookupData.directors = directors
				}
				if (videoData.credits) {
					if (videoData.credits.crew && videoData.credits.crew.length > 0) {
						for (const crew of videoData.credits.crew) {
							if (crew.position_name === 'Production Company') {
								lookupData.studios = crew.entity_name
							}
						}
					}
					if (videoData.credits.cast && videoData.credits.cast.length > 0) {
						const actors = []
						for (const cast of videoData.credits.cast) {
							const actor = { name: cast.entity_name, role: '' }
							if (cast.cast_roles && cast.cast_roles.length > 0) {
								let roles = ''
								let roleCount = 1
								for (const role of cast.cast_roles) {
									roles += `${role}${roleCount < cast.cast_roles.length ? ', ' : ''}`
									roleCount++
								}
								actor.role = roles
							}
							actors.push(actor)
						}
						lookupData.actors = actors
					}
				}
				if (videoData.image) {
					if (videoData.image.o) {
						lookupData.fanart = [videoData.image.o]
					}
				}
			}
		}
	}
	return lookupData
}

exports.lookupImvDb = async (artists, title) => {
	return await getImvDbVideo(artists, title)
}
