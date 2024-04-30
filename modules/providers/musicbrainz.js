'use strict'

const luceneEscapes = [
	{ match: /\+/img, replace: '%5C%2B' },
	{ match: /&&/img, replace: '\\&&' },
	{ match: /&/img, replace: '%26' },
	{ match: /\|\|/img, replace: '\\||' },
	{ match: /!/img, replace: '%21' },
	{ match: /\(/img, replace: '%28' },
	{ match: /\)/img, replace: '%29' },
	{ match: /\{/img, replace: '\\{' },
	{ match: /\}/img, replace: '\\}' },
	{ match: /\[/img, replace: '\\[' },
	{ match: /\]/img, replace: '\\]' },
	{ match: /\^/img, replace: '\\^' },
	{ match: /'/img, replace: '%27' },
	{ match: /"/img, replace: '\\"' },
	{ match: /~/img, replace: '\\~' },
	{ match: /\*/img, replace: '\\*' },
	{ match: /\?/img, replace: '\\?' },
	{ match: /:/img, replace: '\\:' },
	{ match: /\\/img, replace: '\\\\' },
	{ match: /\//img, replace: '\\/' },
	{ match: / /img, replace: '+' }
]

function paramsClean(text) {
	let cleanText = text
	cleanText = cleanText.replace(/\[.*?\]/img, (match) => {
		return match.substring(1, match.length - 1)
	})
	cleanText = normalizeQuotes(cleanText)
	return cleanText.toLowerCase().trim()
}

function paramsClear(text) {
	let clearText = text
	clearText = clearText.replace(/\[.*?\]/img, '')
	clearText = clearText.replace(/  /img, ' ')
	clearText = normalizeQuotes(clearText)
	return clearText.toLowerCase().trim()
}

function escapeLucene(text) {
	let escapedText = text
	for (const luceneEscape of luceneEscapes) {
		escapedText = escapedText.replace(luceneEscape.match, luceneEscape.replace)
	}
	return escapedText
}

function normalizeQuotes(text) {
	let normalizedText = text.toLowerCase()
	normalizedText = normalizedText.replace(/‘|’/img, "'")
	normalizedText = normalizedText.replace(/“|”/img, '"')
	return normalizedText
}

async function getMusicBrainz(url) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'User-Agent': 'KodiNFOMusicVideos/1.0.0 ( https://github.com/clubside/KodiNFOMusicVideos )'
		}
	})
	if (!response.ok) {
		return { error: true, status: response.status }
	} else {
		const data = await response.json()
		return { error: false, data }
	}
}

async function getMusicBrainzCoverArt(id) {
	let imageUrl = ''
	const lookupUrl = `https://coverartarchive.org/release-group/${id}`
	// console.log(lookupUrl)
	const response = await getMusicBrainz(lookupUrl)
	if (!response.error) {
		// console.log(response.data)
		const responseData = response.data
		if (responseData.images && responseData.images.length > 0) {
			for (const image of responseData.images) {
				if (image.front || (!image.front && !image.back)) {
					imageUrl = image.image
					break
				}
			}
		}
	}
	return imageUrl
}

async function getMusicBrainzGenres(id) {
	const genres = []
	const lookupUrl = `https://musicbrainz.org/ws/2/recording/${id}?inc=genres&fmt=json`
	// console.log(lookupUrl)
	const response = await getMusicBrainz(lookupUrl)
	if (!response.error) {
		const data = response.data
		const genreData = data.genres
		if (genreData && genreData.length > 0) {
			for (const genre of genreData) {
				genres.push(genre.name)
			}
		}
	}
	return genres
}

async function getMusicBrainzLabels(id) {
	const labels = []
	const lookupUrl = `https://musicbrainz.org/ws/2/release/${id}?inc=labels&fmt=json`
	// console.log(lookupUrl)
	const response = await getMusicBrainz(lookupUrl)
	if (!response.error) {
		const data = response.data
		const labelData = data['label-info']
		if (labelData && labelData.length > 0) {
			for (const label of labelData) {
				if (label.label && label.label.name) {
					labels.push(label.label.name)
				}
			}
		}
	}
	return labels
}

function parseMusicBrainzRecordings(title, recordingsData) {
	const titleCheck = paramsClear(title)
	// console.log({ titleCheck })
	const recordings = []
	// console.log(recordingsData)
	for (const recording of recordingsData) {
		const titleNormalized = normalizeQuotes(recording.title)
		let firstReleaseDate = ''
		// console.log({ title: titleNormalized, premiered: recording['first-release-date'], id: recording.id })
		if (recording['first-release-date']) {
			let titleMatch = false
			const recordingTitles = [titleNormalized, titleNormalized.replace(/ and /img, ' & '), titleNormalized.replace(/ & /img, ' and ')]
			const searchTitles = [titleCheck, titleCheck.replace(/ and /img, ' & '), titleCheck.replace(/ & /img, ' and ')]
			// console.log({ recordingTitles, searchTitles })
			for (const recordingTitle of recordingTitles) {
				for (const searchTitle of searchTitles) {
					if (recordingTitle.includes(searchTitle)) {
						titleMatch = true
						break
					}
				}
			}
			if (titleMatch) {
				const releases = []
				for (const release of recording.releases) {
					// console.log(release)
					if (release.status === 'Official' && (release['release-group']['primary-type'] === 'Album' || release['release-group']['primary-type'] === 'EP') && release.date) {
						const secondaryTypes = release['release-group']['secondary-types']
						if (!secondaryTypes || secondaryTypes.includes('Soundtrack')) {
							if (firstReleaseDate === '') {
								firstReleaseDate = release.date
							} else {
								const firstReleaseParts = firstReleaseDate.split('-')
								const firstReleaseYear = Number(firstReleaseParts[0])
								const firstReleaseMonth = firstReleaseParts.length > 1 ? Number(firstReleaseParts[1]) : undefined
								const firstReleaseDay = firstReleaseParts.length > 2 ? Number(firstReleaseParts[2]) : undefined
								const releaseParts = release.date.split('-')
								const releaseYear = Number(releaseParts[0])
								const releaseMonth = releaseParts.length > 1 ? Number(releaseParts[1]) : undefined
								const releaseDay = releaseParts.length > 2 ? Number(releaseParts[2]) : undefined
								if (releaseYear < firstReleaseYear) {
									firstReleaseDate = release.date
								} else if (releaseYear === firstReleaseYear) {
									if (firstReleaseMonth && releaseMonth && releaseMonth < firstReleaseMonth) {
										firstReleaseDate = release.date
									} else if (firstReleaseMonth && releaseMonth && releaseMonth === firstReleaseMonth) {
										if (firstReleaseDay && releaseDay && releaseDay < firstReleaseDay) {
											firstReleaseDate = release.date
										} else if (!firstReleaseDay && releaseDay) {
											firstReleaseDate = release.date
										}
									} else if (!firstReleaseMonth && releaseMonth) {
										firstReleaseDate = release.date
									}
								}
							}
							// console.log(`- ${release.title} (${release.date}), ${release['release-group']['secondary-types']}`)
							releases.push(release)
						}
					}
				}
				if (releases.length > 0) {
					recordings.push({
						id: recording.id,
						artists: parseMusicBrainzArtists(recording['artist-credit']),
						title: recording.title,
						premiered: firstReleaseDate,
						releases
					})
				}
			}
		}
	}
	if (recordings.length === 0) {
		return []
	}
	const recordingsSort = recordings.sort((a, b) => a.premiered.localeCompare(b.premiered))
	// console.log(recordingsSort)
	const recordingsFiltered = recordingsSort.filter(({ premiered }) => premiered.includes(recordingsSort[0].premiered))
	const recordingYear = recordingsSort[0].premiered.substring(0, 4)
	const recordingsFinal = []
	// console.log(recordingsFiltered)
	for (const recording of recordingsFiltered) {
		const releases = []
		for (const release of recording.releases) {
			if (release.date && release.date.includes(recordingYear)) {
				releases.push(release)
			}
		}
		if (releases.length > 0) {
			recordingsFinal.push({
				id: recording.id,
				artists: recording.artists,
				title: recording.title,
				premiered: recording.premiered,
				releases: releases.sort((a, b) => a.date.localeCompare(b.date))
			})
		}
	}
	// console.log({ retrieved: recordingsData.length, matches: recordings.length, filtered: recordingsFiltered.length })
	return recordingsFinal
}

function parseMusicBrainzReleases(recordingsData) {
	let matchDate = ''
	let matchFormat = ''
	let matchRecording
	let matchRelease
	for (const recording of recordingsData) {
		// console.log({ artists: recording.artists, title: recording.title, premiered: recording.premiered })
		for (const releaseCountry of ['US', 'CA', 'XE', 'GB']) {
			const countryReleases = recording.releases.filter(({ country }) => country === releaseCountry)
			for (const countryRelease of countryReleases) {
				if (countryRelease.date !== matchDate || countryRelease.media.format !== matchFormat) {
					if ((countryRelease.date.length > matchDate.length) || (countryRelease.media.format === 'CD' && matchFormat !== 'CD') || (matchFormat === '')) {
						matchDate = countryRelease.date
						matchFormat = countryRelease.media.format
						matchRecording = recording
						matchRelease = countryRelease
					}
				}
				// console.log(countryRelease)
			}
			if (matchRelease) {
				// console.log({ country: releaseCountry, matchRelease })
				break
			}
		}
		if (matchRelease) {
			break
		}
	}
	if (matchRelease) {
		return { recording: matchRecording, release: matchRelease }
	} else {
		return { recording: undefined, release: undefined }
	}
}

function parseMusicBrainzArtists(data) {
	const artists = []
	if (data && data.length > 0) {
		for (const artist of data) {
			artists.push({
				name: artist.name,
				id: artist.artist.id
			})
		}
	}
	return artists
}

async function getMusicBrainzRecordings(url) {
	// console.log({ url })
	const response = await getMusicBrainz(url)
	if (response.error) {
		return { error: true, status: response.status }
	} else {
		const data = response.data
		if (data.recordings && data.recordings.length > 0) {
			const recordingsTotal = data.count
			let recordingsCount = data.recordings.length
			while (recordingsCount < recordingsTotal) {
				const offsetUrl = `${url}&offset=${recordingsCount}`
				// console.log({ recordingsTotal, recordingsCount, offsetUrl })
				const response = await getMusicBrainz(offsetUrl)
				if (response.error) {
					return { error: true, status: response.status }
				} else {
					const additionalData = response.data
					if (additionalData.recordings && additionalData.recordings.length > 0) {
						data.recordings = data.recordings.concat(additionalData.recordings)
						recordingsCount += additionalData.recordings.count
					} else {
						return { error: true, status: 'additional recordings failed' }
					}
				}
			}
			return { error: false, data }
		} else {
			return { error: true, status: 'no recordings' }
		}
	}
}

async function getMusicBrainzRecording(artists, title) {
	const lookupData = {}
	const artistsCheck = paramsClean(artists)
	const artistsLookup = escapeLucene(artistsCheck)
	const titleCheck = paramsClean(title)
	const titleLookup = escapeLucene(titleCheck)
	// console.log({ artists, artistCheck, artistLookup, title, titleCheck, titleLookup })
	const lookupUrl = `https://musicbrainz.org/ws/2/recording?query="${titleLookup}"+AND+artist%3A"${artistsLookup}"&fmt=json&limit=100`
	const returnData = await getMusicBrainzRecordings(lookupUrl)
	if (returnData.error) {
		lookupData.fetchError = { source: 'MusicBrainz', status: returnData.status }
	} else {
		const data = returnData.data
		// fs.writeFileSync('musicbrainz.json', JSON.stringify(data, null, '\t'))
		const recordings = parseMusicBrainzRecordings(title.toLowerCase(), data.recordings)
		// console.log(recordings)
		const match = parseMusicBrainzReleases(recordings)
		if (match.release) {
			// console.log(match.recording)
			// console.log(match.release)
			const releaseArtists = parseMusicBrainzArtists(match.release['artist-credit'])
			// console.log({ releaseArtists, recordingArtists: match.recording.artists })
			lookupData.page = `https://musicbrainz.org/release/${match.release.id}`
			lookupData.artists = releaseArtists.length > 0 ? releaseArtists[0].name === 'Various Artists' ? match.recording.artists : releaseArtists : match.recording.artists
			lookupData.title = match.recording.title
			lookupData.premiered = match.release.date
			lookupData.album = match.release.title
			lookupData.genres = await getMusicBrainzGenres(match.recording.id)
			lookupData.studios = await getMusicBrainzLabels(match.release.id)
			lookupData.thumb = await getMusicBrainzCoverArt(match.release['release-group'].id)
			lookupData.releaseGroup = match.release['release-group'].id
		}
	}
	return lookupData
}

exports.lookupMusicBrainz = async (artists, title) => {
	return await getMusicBrainzRecording(artists, title)
}
