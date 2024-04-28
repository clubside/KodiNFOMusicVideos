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

function parseTheAudioDbArtists(text) {
	const artistData = []
	if (text !== '') {
		const artists = text.split(', ')
		for (const artist of artists) {
			artistData.push({ name: artist })
		}
	}
	return artistData
}

async function getTheAudioDbAlbum(id, data) {
	const newData = data
	const lookupUrl = `https://www.theaudiodb.com/api/v1/json/18626d636d76696473706d/album.php?m=${id}`
	// console.log(lookupUrl)
	const response = await fetch(lookupUrl)
	if (response.ok) {
		const albumData = await response.json()
		// console.log(albumData)
		if (albumData.album) {
			const album = albumData.album[0]
			if (album.strAlbumThumbHQ) {
				if (data.thumb) {
					newData.thumb.push(album.strAlbumThumbHQ)
				} else {
					newData.thumb = [album.strAlbumThumbHQ]
				}
			} else if (album.strAlbumThumb) {
				if (newData.thumb) {
					newData.thumb.push(album.strAlbumThumb)
				} else {
					newData.thumb = [album.strAlbumThumb]
				}
			}
			if (album.strAlbumCDart) {
				newData.cdart = album.strAlbumCDart
			}
		}
	}
	// console.log(newData)
	return newData
}

async function getTheAudioDbArtist(id, data) {
	const newData = data
	const lookupUrl = `https://www.theaudiodb.com/api/v1/json/18626d636d76696473706d/artist.php?i=${id}`
	// console.log(lookupUrl)
	const response = await fetch(lookupUrl)
	if (response.ok) {
		const artistData = await response.json()
		// console.log(artistData)
		if (artistData.artists) {
			const artist = artistData.artists[0]
			if (artist.strArtistLogo) {
				newData.clearlogo = artist.strArtistLogo
			}
			const clearart = []
			if (artist.strArtistClearart) {
				clearart.push([artist.strArtistClearart])
			}
			if (artist.strArtistCutout) {
				clearart.push([artist.strArtistCutout])
			}
			if (clearart.length > 0) {
				newData.clearart = clearart
			}
			if (artist.strArtistThumb) {
				newData.artistthumb = artist.strArtistThumb
			}
			if (artist.strArtistBanner) {
				newData.banner = artist.strArtistBanner
			}
			if (artist.strArtistWideThumb) {
				newData.landscape = artist.strArtistWideThumb
			}
			const fanart = newData.fanart || []
			if (artist.strArtistFanart) {
				fanart.push(artist.strArtistFanart)
				for (let i = 2; i < 5; i++) {
					if (artist[`strArtistFanart${i}`]) {
						fanart.push(artist[`strArtistFanart${i}`])
					}
				}
			}
			if (fanart.length > 0) {
				newData.fanart = fanart
			}
		}
	}
	// console.log(newData)
	return newData
}

async function lookupTheAudioDbVariation(artists, title, artistAnd, titleAnd) {
	const artistsCheck = paramsClear(artists)
	const titleCheck = paramsClear(title)
	const artistLookup = artistsCheck.replace(/&/mg, `${artistAnd ? 'and' : '%26'}`).replace(/\+/mg, '%2B').replace(/ /mg, '%20')
	const titleLookup = titleCheck.replace(/&/mg, `${titleAnd ? 'and' : '%26'}`).replace(/\+/mg, '%2B').replace(/ /mg, '%20')
	const lookupUrl = `https://www.theaudiodb.com/api/v1/json/18626d636d76696473706d/searchtrack.php?s=${artistLookup}&t=${titleLookup}`
	// console.log(lookupUrl)
	const response = await fetch(lookupUrl)
	if (!response.ok) {
		return { error: true, status: response.status }
	} else {
		const tracks = await response.json()
		// console.log(tracks)
		if (tracks.track && tracks.track.length > 0) {
			return { error: false, track: tracks.track[0] }
		} else {
			return { error: true, status: 'no tracks' }
		}
	}
}

async function setTheAudioDb(track) {
	// console.log(track)
	let match = {
		page: `https://www.theaudiodb.com/track/${track.idTrack}`,
		artists: parseTheAudioDbArtists(track.strArtist),
		title: track.strTrack,
		album: track.strAlbum
	}
	if (track.strGenre) {
		match.genres = track.strGenre
	}
	if (track.strMusicVidDirector) {
		match.directors = track.strMusicVidDirector
	}
	if (track.strMusicVidCompany) {
		match.studios = track.strMusicVidCompany
	}
	if (track.strDescriptionEN) {
		match.plot = track.strDescriptionEN
	}
	if (track.strTrackThumb) {
		match.thumb = [track.strTrackThumb]
	}
	const fanart = []
	for (let i = 1; i < 4; i++) {
		if (track[`strMusicVidScreen${i}`]) {
			fanart.push(track[`strMusicVidScreen${i}`])
		}
	}
	if (fanart.length > 0) {
		match.fanart = fanart
	}
	if (track.idAlbum) {
		match = await getTheAudioDbAlbum(track.idAlbum, match)
	}
	if (track.idArtist) {
		match = await getTheAudioDbArtist(track.idArtist, match)
	}
	return match
}

async function getTheAudioDb(artists, title) {
	// need to test more examples of replacing `&` with `and` instead of `%26`
	let lookupAttempt
	lookupAttempt = await lookupTheAudioDbVariation(artists, title, false, false)
	if (lookupAttempt.error) {
		if (lookupAttempt.status !== 'no tracks') {
			return { fetchError: { source: 'TheAudioDB', status: lookupAttempt.status } }
		}
	} else {
		return await setTheAudioDb(lookupAttempt.track)
	}
	lookupAttempt = await lookupTheAudioDbVariation(artists, title, true, true)
	if (lookupAttempt.error) {
		if (lookupAttempt.status !== 'no tracks') {
			return { fetchError: { source: 'TheAudioDB', status: lookupAttempt.status } }
		}
	} else {
		return await setTheAudioDb(lookupAttempt.track)
	}
	lookupAttempt = await lookupTheAudioDbVariation(artists, title, true, false)
	if (lookupAttempt.error) {
		if (lookupAttempt.status !== 'no tracks') {
			return { fetchError: { source: 'TheAudioDB', status: lookupAttempt.status } }
		}
	} else {
		return await setTheAudioDb(lookupAttempt.track)
	}
	lookupAttempt = await lookupTheAudioDbVariation(artists, title, false, true)
	if (lookupAttempt.error) {
		if (lookupAttempt.status !== 'no tracks') {
			return { fetchError: { source: 'TheAudioDB', status: lookupAttempt.status } }
		}
	} else {
		return await setTheAudioDb(lookupAttempt.track)
	}
	return {}
}

exports.lookupTheAudioDb = async (artists, title) => {
	return await getTheAudioDb(artists, title)
}
