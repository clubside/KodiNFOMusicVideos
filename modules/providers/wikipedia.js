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

function formatDatePart(number) {
	return String(number).padStart(2, '0')
}

function stripWikipediaLinks(text) {
	return text.replace(/(\[\[.*?\]\])/img, (match) => {
		const stripped = match.replace(/(\[\[|\]\])/img, '')
		const split = stripped.split('|')
		if (split.length > 1) {
			return split[1]
		} else {
			return split[0]
		}
	})
}

function stripWikipediaReferences(text) {
	return text.replace(/(<ref.*?(<\/ref>|\/>))/img, '')
}

function stripWikipediaFormatting(text) {
	let strippedText = text
	strippedText = strippedText.replace(/<small>|<\/small>/img, '')
	strippedText = strippedText.replace(/\{\{.*?\}\}/img, (match) => {
		const stripped = match.replace(/\{\{|\}\}/img, '')
		const split = stripped.split('|')
		if (split.length > 1) {
			return split[1]
		} else {
			return split[0]
		}
	})
	strippedText = strippedText.replace(/\[http.*?\]/img, (match) => {
		const stripped = match.substring(1, match.length - 1)
		const split = stripped.indexOf(' ')
		return stripped.substring(split + 1)
	})
	strippedText = strippedText.replace(/('''.*?''')/img, (match) => {
		return `[B]${match.substring(2, match.length - 2)}[/B]`
	})
	strippedText = strippedText.replace(/(''.*?'')/img, (match) => {
		return `[I]${match.substring(2, match.length - 2)}[/I]`
	})
	return strippedText
}

function stripWikipediaText(text, includeFormatting = true) {
	let strippedText = text
	strippedText = stripWikipediaReferences(strippedText)
	strippedText = stripWikipediaLinks(strippedText)
	if (includeFormatting) {
		strippedText = stripWikipediaFormatting(strippedText)
	}
	return strippedText
}

function stripWikipediaHeading(text) {
	let headingLevel = 1
	while (text.charAt(headingLevel) === '=') {
		headingLevel++
	}
	if (headingLevel > 2) {
		return `[B]${text.substring(headingLevel + 1, text.length - headingLevel + -1).toUpperCase()}[/B]`
	} else {
		return ''
	}
}

function parseWikipediaArtists(artists) {
	const artistData = []
	if (artists && artists.length > 0) {
		for (const artist of artists) {
			artistData.push({ name: artist })
		}
	}
	return artistData
}

function parseWikipediaDate(text, dateFormat) {
	let returnDate = ''
	if (text.substring(0, 13).toLowerCase() === '{{start date|') {
		const template = text.substring(13, text.indexOf('}}'))
		let dateParts = template.split('|')
		dateParts = dateParts.filter((part) => part.substring(0, 2) !== 'df')
		// console.log(dateParts)
		if (dateParts.length > 1) {
			returnDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
		} else if (dateParts.length > 0) {
			returnDate = `${dateParts[0]}-${dateParts[1]}`
		} else {
			returnDate = dateParts[0]
		}
	} else {
		let dateText = text
		if (dateText.indexOf(' (') > -1) {
			dateText = dateText.substring(0, dateText.indexOf(' ('))
		}
		const dateParts = dateText.split(' ')
		switch (dateFormat) {
			case 'mdy':
				switch (dateParts.length) {
					case 3: {
						const date = new Date(`${dateParts[0]} ${dateParts[1]} ${dateParts[2]}`)
						returnDate = `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}-${formatDatePart(date.getDate())}`
						break
					}
					case 2: {
						const date = new Date(`${dateParts[0]} ${dateParts[1]}`)
						returnDate = `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}`
						break
					}
					default:
						returnDate = dateParts[0]
				}
				break
			case 'dmy':
				switch (dateParts.length) {
					case 3: {
						const date = new Date(`${dateParts[1]} ${dateParts[0]} ${dateParts[2]}`)
						returnDate = `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}-${formatDatePart(date.getDate())}`
						break
					}
					case 2: {
						const date = new Date(`${dateParts[0]} ${dateParts[1]}`)
						returnDate = `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}`
						break
					}
					default:
						returnDate = dateParts[0]
				}
				break
			default: {
				const date = new Date(text)
				returnDate = date.getFullYear()
				if (dateParts.length > 1) {
					returnDate += `-${formatDatePart(date.getMonth() + 1)}`
				}
				if (dateParts.length > 2) {
					returnDate += `-${formatDatePart(date.getDate())}`
				}
			}
		}
	}
	return returnDate
}

function parseWikipediaInfobox(text) {
	// console.log(text)
	let inside = false
	let inList = false
	let listParam = ''
	let listValue = []
	let inMultiline = false
	let multilineParam = ''
	let multiLineValue = []
	const songInfo = { dateFormat: '' }
	for (const line of text) {
		if (line.substring(0, 6) === '{{Use ') {
			const use = line.substring(6, line.length - 2)
			const useParts = use.split('|')
			switch (useParts[0]) {
				case 'dmy dates':
					songInfo.dateFormat = 'dmy'
					break
				case 'mdy dates':
					songInfo.dateFormat = 'mdy'
					break
			}
		} else if (line.substring(0, 9) === '{{Infobox') {
			inside = true
		} else if (inside && inList) {
			// console.log({ position: 'testing', listParam, listValue, line })
			if (line === '}}' || line.substring(line.length - 2) === '}}') {
				if (line !== '}}') {
					if (listParam === 'released' || listParam === 'recorded') {
						listValue.push(line.substring(1, line.length - 2).trim())
					} else {
						listValue.push(stripWikipediaText(line.substring(1, line.length - 2).trim()))
					}
				}
				// console.log({ position: 'end of list', listParam, listValue })
				songInfo[listParam] = listValue
				inList = false
				listParam = ''
				listValue = []
			} else {
				if (listParam === 'released' || listParam === 'recorded') {
					listValue.push(line.substring(1).trim())
				} else {
					listValue.push(stripWikipediaText(line.substring(1).trim()))
				}
				// listValue += parseWikipediaValue(listParam, line.substring(1).trim()) + '; '
				// console.log({ position: 'inside list', listParam, listValue })
			}
		} else if (inside) {
			if (line.substring(0, 1) === '*' && inMultiline) {
				multiLineValue.push(stripWikipediaText(line.substring(1).trim()))
			} else if (line.substring(0, 1) === '|') {
				if (inMultiline) {
					if (multiLineValue.length !== 0) {
						songInfo[multilineParam] = multiLineValue
					}
					inMultiline = false
					multilineParam = ''
					multiLineValue = []
				}
				const split = line.indexOf('=')
				const param = line.substring(1, split).trim()
				const value = line.substring(split + 1).trim()
				if (value === '{{flatlist|' || value === '{{plainlist|') {
					inList = true
					listParam = param
				} else if (value.substring(0, 8) === '{{hlist|') {
					const hlist = stripWikipediaText(value.substring(8, value.length - 2))
					songInfo[param] = hlist.split('|')
				} else if (value === '') {
					inMultiline = true
					multilineParam = param
				} else if (value.substring(0, 1) === '*') {
					inMultiline = true
					multilineParam = param
					multiLineValue.push(stripWikipediaText(value.substring(1).trim()))
				} else {
					const stripped = stripWikipediaText(value)
					if (stripped.indexOf(', ') > -1 && param !== 'released' && param !== 'recorded') {
						songInfo[param] = stripped.split(', ')
					} else if (/<br\/?>/img.test(value)) {
						const values = []
						let position = 0
						const matches = value.matchAll(/<br\/?>/img)
						for (const match of matches) {
							// console.log(`Found ${match[0]} start=${match.index} end=${match.index + match[0].length}.`)
							let matchValue = value.substring(position, match.index).trim()
							matchValue = param === 'released' || param === 'recorded' ? stripWikipediaText(matchValue, false) : stripWikipediaText(matchValue)
							// console.log(matchValue)
							values.push(matchValue)
							position = match.index + match[0].length
						}
						if (position < value.length) {
							let matchValue = value.substring(position, value.length).trim()
							matchValue = param === 'released' || param === 'recorded' ? stripWikipediaText(matchValue, false) : stripWikipediaText(matchValue)
							// console.log(matchValue)
							values.push(matchValue)
						}
						songInfo[param] = values
					} else {
						if (param === 'released' || param === 'recorded') {
							songInfo[param] = [stripWikipediaText(value, false)]
						} else {
							songInfo[param] = [stripped]
						}
					}
				}
			}
		}
	}
	// console.log(songInfo)
	return songInfo
}

function parseWikipediaText(text) {
	const wikipediaText = { lines: [], fanart: [] }
	let strippedText
	for (const line of text) {
		if (line.substring(0, 2) !== '<!') {
			if (line.substring(0, 2) === '==') {
				strippedText = stripWikipediaHeading(line)
				if (strippedText !== '') {
					wikipediaText.lines.push(strippedText)
				}
			} else if (line.substring(0, 7) === '[[File:' || line.substring(0, 8) === '[[Image:') {
				strippedText = line.substring(0, 7) === '[[File:' ? line.substring(7, line.length - 2) : line.substring(8, line.length - 2)
				const textParts = strippedText.split('|')
				wikipediaText.fanart.push(textParts[0])
			} else {
				wikipediaText.lines.push(stripWikipediaText(line))
			}
		}
	}
	return wikipediaText
}

async function parseWikipedia(artists, wikipedia) {
	const artistsNormalized = artists.replace(/&/img, 'and')
	const musicvideo = {
		page: `https://en.wikipedia.org/wiki/${wikipedia.title.replace(/ /img, '_')}`,
		artists: '',
		title: '',
		premiered: '',
		album: '',
		genres: '',
		studios: '',
		plot: '',
		thumb: '',
		fanart: []
	}
	if (wikipedia.infobox) {
		// console.log(wikipedia)
		let infoboxData = parseWikipediaInfobox(wikipedia.infobox)
		// console.log(infoboxData)
		if (infoboxData.artist) {
			if (!infoboxData.artist[0].toLowerCase().includes(artistsNormalized.toLowerCase())) {
				const otherArtist = wikipedia.sections.find(({ name }) => name.toLowerCase().includes(artistsNormalized.toLowerCase()))
				if (otherArtist) {
					const otherArtistSection = await getWikipediaPageSection(wikipedia.pageId, otherArtist.section)
					const otherInfobox = parseWikipediaInfobox(otherArtistSection)
					infoboxData = otherInfobox
				}
			}
		}
		if (infoboxData.artist) {
			musicvideo.artists = parseWikipediaArtists(infoboxData.artist)
		}
		if (infoboxData.name) {
			musicvideo.title = infoboxData.name.join('; ')
		}
		if (infoboxData.released) {
			musicvideo.premiered = String(parseWikipediaDate(infoboxData.released[0], infoboxData.dateFormat))
		}
		if (infoboxData.album) {
			musicvideo.album = infoboxData.album.join('; ')
		}
		if (infoboxData.genre) {
			musicvideo.genres = infoboxData.genre.join('; ')
		}
		if (infoboxData.label) {
			musicvideo.studios = infoboxData.label.join('; ')
		}
		if (infoboxData.cover) {
			const thumbLookup = wikipedia.images.find(({ title }) => {
				const titlePlain = title.toLowerCase()
				const titleEscaped = titlePlain.replace(/ /img, '_')
				const coverPlain = infoboxData.cover[0].toLowerCase()
				const coverEscaped = coverPlain.replace(/ /img, '_')
				return titlePlain === coverPlain || titleEscaped === coverEscaped || titlePlain === coverEscaped || titleEscaped === coverPlain
			})
			if (thumbLookup) {
				musicvideo.thumb = thumbLookup.url
			}
		}
		// musicvideo.infobox = infoboxData
	}
	if (wikipedia.musicvideo) {
		const musicvideoData = parseWikipediaText(wikipedia.musicvideo)
		if (musicvideoData.lines.length > 0) {
			musicvideo.plot = musicvideoData.lines.join('\n')
		}
		if (musicvideoData.fanart.length > 0) {
			for (const fanart of musicvideoData.fanart) {
				const fanartLookup = wikipedia.images.find(({ title }) => title.toLowerCase() === fanart.toLowerCase())
				if (fanartLookup) {
					musicvideo.fanart.push(fanartLookup.url)
				}
			}
		}
	}
	return musicvideo
}

function getWikipediaPage(data) {
	const pagesData = data.query.pages
	const pages = []
	for (const page in pagesData) {
		// console.log(page, pagesData[page])
		pages.push({
			title: pagesData[page].title,
			pageId: pagesData[page].pageid,
			index: pagesData[page].index
		})
	}
	pages.sort((a, b) => a.index - b.index)
	if (pages.length === 1) {
		return { title: pages[0].title, pageId: pages[0].pageId }
	} else {
		return pages
	}
}

async function getWikipediaPageImages(title) {
	const response = await fetch(`https://en.wikipedia.org/w/rest.php/v1/page/${title}/links/media`)
	if (response.ok) {
		const imageData = await response.json()
		if (imageData.files && imageData.files.length > 0) {
			const files = imageData.files
			// console.log(sections)
			const returnFiles = []
			for (const file of files) {
				returnFiles.push({
					title: file.title,
					url: `https:${file.original.url}`
				})
			}
			return returnFiles
		} else {
			return []
		}
	} else {
		return []
	}
}

async function getWikipediaPageSections(pageId) {
	const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=sections&disabletoc=1&pageid=${pageId}`)
	if (response.ok) {
		const sectionData = await response.json()
		// console.log(pageId, sectionData)
		if (sectionData.parse.sections && sectionData.parse.sections.length > 0) {
			const sections = sectionData.parse.sections
			// console.log(sections)
			const returnSections = []
			for (const section of sections) {
				returnSections.push({
					section: section.index,
					name: section.line
				})
			}
			return returnSections
		} else {
			return []
		}
	} else {
		return []
	}
}

async function getWikipediaPageSection(pageId, section) {
	const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=${section}&format=json&pageids=${pageId}`)
	if (response.ok) {
		const responseData = await response.json()
		// console.log(infoboxData.query.pages[pageId])
		if (responseData.query.pages[pageId]) {
			const wikitext = responseData.query.pages[pageId].revisions[0]['*']
			const wikilines = wikitext.split(/\r?\n/).filter(Boolean)
			// fs.writeFileSync(`util/${title}-infobox.json`, JSON.stringify(infobox, null, '\t'))
			// console.log(wikilines)
			return wikilines
		}
	} else {
		return []
	}
}

async function searchWikipediaExtended(artists, title) {
	const titleCheck = paramsClear(title)
	const artistsLookup = artists.replace(/&/mg, '%26').replace(/\+/mg, '%2B').replace(/ /mg, '%20').toLowerCase()
	const titleLookup = titleCheck.replace(/&/mg, '%26').replace(/\+/mg, '%2B').replace(/ /mg, '%20').toLowerCase()
	const pageData = {}
	const lookupUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=10&gsrsearch=${artistsLookup}%20${titleLookup}`
	// console.log(lookupUrl)
	const response = await fetch(lookupUrl)
	if (response.ok) {
		const data = await response.json()
		const pages = getWikipediaPage(data)
		// console.log(pages)
		for (const page of pages) {
			// console.log(page)
			if (page.title.toLowerCase().includes(title.toLowerCase())) {
				pageData.title = page.title
				pageData.pageId = page.pageId
				break
			}
		}
	}
	return pageData
}

async function searchWikipedia(artists, title) {
	const artistsCheck = paramsClear(artists)
	const titleCheck = paramsClear(title)
	const artistsLookup = artistsCheck.replace(/&/mg, '%26').replace(/\+/mg, '%2B').replace(/ /mg, '%20').toLowerCase()
	const titleLookup = titleCheck.replace(/&/mg, '%26').replace(/\+/mg, '%2B').replace(/ /mg, '%20').toLowerCase()
	let lookupData = {}
	const lookupUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=1&gsrsearch=${artistsLookup}%20${titleLookup}`
	// console.log(lookupUrl)
	const response = await fetch(lookupUrl)
	if (!response.ok) {
		lookupData.fetchError = { source: 'Wikipedia', status: response.status }
	} else {
		const data = await response.json()
		let page = getWikipediaPage(data)
		if (!page.title.toLowerCase().includes(titleCheck.toLowerCase())) {
			const pageExtended = await searchWikipediaExtended(artists, title)
			if (pageExtended.title) {
				page = pageExtended
			}
		}
		page.sections = await getWikipediaPageSections(page.pageId)
		page.images = await getWikipediaPageImages(page.title)
		page.infobox = await getWikipediaPageSection(page.pageId, 0)
		const musicvideo = page.sections.find(({ name }) => name.toLowerCase().includes('music video'))
		if (musicvideo) {
			page.musicvideo = await getWikipediaPageSection(page.pageId, musicvideo.section)
		}
		lookupData = await parseWikipedia(artists, page)
	}
	return lookupData
}

exports.lookupWikipedia = async (artists, title) => {
	return searchWikipedia(artists, title)
}
