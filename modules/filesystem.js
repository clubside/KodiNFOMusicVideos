const fs = require('node:fs')
const { XMLParser, XMLBuilder } = require('fast-xml-parser')
const sharp = require('sharp')

const videoFormats = 'mp4|webm|mkv|avi|mov'
const artworkFormats = 'jpg|png|webp'

/**
 * Fields used to when passing a `musicVideo` object to save.
 *
 * @typedef {Object} musicVideoSaveObject
 * @property {string} currentFileName - Current File Name.
 * @property {string} fileName - New File Name.
 * @property {string} fileType - File extension of the video file.
 * @property {boolean} nfo - Whetther an NFO file exists for the video file following `${fileName}.nfo` pattern.
 * @property {Object} musicvideo - NFO file fields.
 * @property {string[]} musicvideo.artists - Artist(s) who performed the song.
 * @property {string} musicvideo.title - Title of the song.
 * @property {string} musicvideo.album - Album the song first appeared on.
 * @property {string} musicvideo.premiered - Date the video first aired in `yyy-mm-dd` format.
 * @property {string[]} musicvideo.directors - Director(s) of the music video.
 * @property {string[]} musicvideo.studios - Studio(s) that distributed the song/produced the music video.
 * @property {string[]} musicVideo.genres - Musical genre(s) of the song.
 * @property {string[]} musicvideo.tags - User tag(s) to classify the music video.
 * @property {string[]} musicvideo.actors - Actor(s) who appeared in the music video, can include performer/band.
 * @property {string} musicvideo.runtime - Duration of the music video.
 * @property {number} musicvideo.userrating - User rating as integer between 1 and 5.
 * @property {string} musicvideo.plot - Description of the music video contents and/or production.
 * @property {string} currentThumb - File Name of current thumbnail following `${fileName}-thumb.${extension}` pattern.
 * @property {string} thumb - Image information for new thumbnail as a file name or `dataURL`.
 * @property {string} currentDiscart - File Name of current disc art following `${fileName}-discart.${extension}` pattern.
 * @property {string} discart - Image information for new disc art as a file name or `dataURL`.
 * @property {string} currentClearlogo - File Name of current clear logo following `${fileName}-clearlogo.${extension}` pattern.
 * @property {string} clearlogo - Image information for new clear logo as a file name or `dataURL`.
 * @property {string} currentClearart - File Name of current clear art following `${fileName}-clearart.${extension}` pattern.
 * @property {string} clearart - Image information for new clear art as a file name or `dataURL`.
 * @property {string} currentPoster - File Name of current poster following `${fileName}-poster.${extension}` pattern.
 * @property {string} poster - Image information for new poster as a file name or `dataURL`.
 * @property {string} currentBanner - File Name of current banner following `${fileName}-banner.${extension}` pattern.
 * @property {string} banner - Image information for new banner as a file name or `dataURL`.
 * @property {string} currentLandscape - File Name of current landscape following `${fileName}-landscape.${extension}` pattern.
 * @property {string} landscape - Image information for new landscape as a file name or `dataURL`.
 * @property {string} currentKeyart - File Name of current key art following `${fileName}-keyart.${extension}` pattern.
 * @property {string} keyart - Image information for new key art as a file name or `dataURL`.
 * @property {string[]} currentFanart - File name(s) of current fan art following `${fileName}-fanart{?}.${extension}` pattern.
 * @property {string[]} fanart - Image information for new fan art as a file name or `dataURL`.
 */
/**
 * Fields used to when returning a `musicVideo` object.
 *
 * @typedef {Object} musicVideoReturnData
 * @property {string} fileName - New File Name.
 * @property {string} fileType - File extension of the video file.
 * @property {boolean} nfo - Whether an NFO file exists for the video file.
 * @property {string[]} artists - Artist(s) who performed the song.
 * @property {string} title - Title of the song.
 * @property {string} album - Album the song first appeared on.
 * @property {string} premiered - Date the video first aired in `yyy-mm-dd` format.
 * @property {string[]} directors - Director(s) of the music video.
 * @property {string[]} studios - Studio(s) that distributed the song/produced the music video.
 * @property {string[]} genres - Musical genre(s) of the song.
 * @property {string[]} tags - User tag(s) to classify the music video.
 * @property {string[]} actors - Actor(s) who appeared in the music video, can include performer/band.
 * @property {string} runtime - Duration of the music video.
 * @property {number} userrating - User rating as integer between 1 and 5.
 * @property {string} plot - Description of the music video contents and/or production.
 * @property {string} thumb - File extension of thumbnail if one exists.
 * @property {string} discart - File extension of disc art if one exists.
 * @property {string} clearlogo - File extension of clear logo if one exists.
 * @property {string} clearart - File extension of clear art if one exists.
 * @property {string} poster - File extension of poster if one exists.
 * @property {string} banner - File extension of banner if one exists.
 * @property {string} landscape - File extension of landscape if one exists.
 * @property {string} keyart - File extension of key art if one exists.
 * @property {string[]} fanart - Array of file names representing any current fan art.
 */
/**
 * Fields to return after saving a music video.
 *
 * @typedef {Object} musicVideoReturnObject
 * @property {boolean} error - Whether an error occured.
 * @property {musicVideoReturnData} data - `musicVideo` object to update in client array.
 */

/**
 * Fields used for creating Kodi music video `NFO` files.
 *
 * @typedef {Object} musicVideoField
 * @property {string} field - Key in `musicVideo` to derive value.
 * @property {boolean} multiple - Whether the value is an array.
 */
/** @type {musicVideoField[]} */
const musicVideoFields = [
	{ field: 'artists', multiple: true },
	{ field: 'title', multiple: false },
	{ field: 'album', multiple: false },
	{ field: 'premiered', multiple: false },
	{ field: 'directors', multiple: true },
	{ field: 'studios', multiple: true },
	{ field: 'genres', multiple: true },
	{ field: 'tags', multiple: true },
	{ field: 'actors', multiple: true },
	{ field: 'runtime', multiple: false },
	{ field: 'userrating', multiple: false },
	{ field: 'plot', multiple: false }
]

const musicVideoArtworks = ['thumb', 'discart', 'clearlogo', 'clearart', 'poster', 'banner', 'landscape', 'keyart']

let folderFiles

function checkArtwork(fileName, artworkType) {
	const regex = new RegExp(`^${fileName}-${artworkType}\\.(${artworkFormats})$`, 'im')
	const artwork = folderFiles.filter(({ name }) => name.match(regex))
	if (artwork.length > 0) {
		const fileEntry = artwork[0].name
		const fileType = fileEntry.substring(fileEntry.lastIndexOf('.') + 1)
		// console.log(fileEntry, fileType)
		return fileType
	} else {
		return undefined
	}
}

function checkFanart(fileName) {
	const regex = new RegExp(`^${fileName}-fanart\\d*\\.(${artworkFormats})$`, 'im')
	const fanarts = folderFiles.filter(({ name }) => name.match(regex))
	const fanartItems = []
	if (fanarts.length > 0) {
		fanarts.sort((a, b) => a.name.localeCompare(b.name))
		for (const fanart of fanarts) {
			const fileEntry = fanart.name
			const fileType = fileEntry.substring(fileEntry.lastIndexOf('.') + 1)
			const fileName = fileEntry.substring(0, fileEntry.length - fileType.length - 1)
			const fanartName = fileName.substring(fileEntry.lastIndexOf('-') + 1)
			// console.log(fileEntry, fanartName, fileType)
			fanartItems.push({ name: fanartName, type: fileType })
		}
	}
	return fanartItems
}

exports.getMusicVideosData = async (path) => {
	const musicVideos = []
	let regex
	folderFiles = fs.readdirSync(path, { withFileTypes: true })
	regex = new RegExp(`^(.*?)\\.(${videoFormats})$`, 'im')
	const musicVideoFiles = folderFiles.filter(({ name }) => name.match(regex))
	const xmlArrays = [
		'musicvideo.artist',
		'musicvideo.director',
		'musicvideo.studio',
		'musicvideo.genre',
		'musicvideo.tag',
		'musicvideo.actor'
	]
	const xmlOptions = {
		isArray: (name, jpath, isLeafNode, isAttribute) => {
			if (xmlArrays.indexOf(jpath) !== -1) return true
		}
	}
	for (const musicVideoFile of musicVideoFiles) {
		const fileEntry = musicVideoFile.name
		const fileType = fileEntry.substring(fileEntry.lastIndexOf('.') + 1)
		const fileName = fileEntry.substring(0, fileEntry.length - fileType.length - 1)
		const fileLookup = `${path}/${fileName}`
		const fileNameRegEx = fileName.replace(/\(/msg, '\\(')
									  .replace(/\)/msg, '\\)')
									  .replace(/\[/msg, '\\[')
									  .replace(/\]/msg, '\\]')
									  .replace(/\{/msg, '\\{')
									  .replace(/\}/msg, '\\}')
									  .replace(/\^/msg, '\\^')
									  .replace(/\$/msg, '\\$')
									  .replace(/\./msg, '\\.')
									  .replace(/\*/msg, '\\*')
									  .replace(/\+/msg, '\\+')
									  .replace(/\?/msg, '\\?')
									  .replace(/\|/msg, '\\|')
		/** @type {musicVideoReturnData} */
		const musicVideo = { fileName, fileType }
		regex = new RegExp(`^${fileNameRegEx}\\.nfo$`, 'im')
		const fileNfo = folderFiles.filter(({ name }) => name.match(regex))
		// console.log(fileNameRegEx, fileNfo)
		musicVideo.nfo = fileNfo.length > 0
		if (musicVideo.nfo) {
			const fileNfoXml = fs.readFileSync(`${fileLookup}.nfo`)
			const fileNfoParser = new XMLParser(xmlOptions)
			const fileNfo = fileNfoParser.parse(fileNfoXml)
			if (fileNfo.musicvideo) {
				const musicVideoNfo = fileNfo.musicvideo
				musicVideo.title = musicVideoNfo.title
				musicVideo.userrating = musicVideoNfo.userrating
				musicVideo.album = musicVideoNfo.album
				musicVideo.plot = musicVideoNfo.plot
				musicVideo.runtime = musicVideoNfo.runtime
				musicVideo.genres = musicVideoNfo.genre
				musicVideo.tags = musicVideoNfo.tag
				musicVideo.directors = musicVideoNfo.director
				musicVideo.premiered = musicVideoNfo.premiered
				musicVideo.studios = musicVideoNfo.studio
				musicVideo.actors = musicVideoNfo.actor
				musicVideo.artists = musicVideoNfo.artist
			}
		}
		musicVideo.banner = checkArtwork(fileNameRegEx, 'banner')
		musicVideo.clearart = checkArtwork(fileNameRegEx, 'clearart')
		musicVideo.clearlogo = checkArtwork(fileNameRegEx, 'clearlogo')
		musicVideo.discart = checkArtwork(fileNameRegEx, 'discart')
		musicVideo.keyart = checkArtwork(fileNameRegEx, 'keyart')
		musicVideo.landscape = checkArtwork(fileNameRegEx, 'landscape')
		musicVideo.poster = checkArtwork(fileNameRegEx, 'poster')
		musicVideo.thumb = checkArtwork(fileNameRegEx, 'thumb')
		musicVideo.fanart = checkFanart(fileNameRegEx)
		if (!musicVideo.fileName) {
			throw new Error(`No filename: ${musicVideoFile}`)
		}
		musicVideos.push(musicVideo)
	}
	musicVideos.sort((a, b) => a.fileName.localeCompare(b.fileName))
	return musicVideos
}

/**
 * Convert a `base64` encoded string to `.webp` format and save to disk.
 *
 * @param {string} filename - file name to use when saving to disk.
 * @param {string} data - image data in `base64` format.
 */
async function saveDataUri(filename, data) {
	const dataUri = data.match(/^data:.+\/(.+);base64,(.*)$/)
	const dataBuffer = Buffer.from(dataUri[2], 'base64')
	await sharp(dataBuffer).webp().toFile(filename)
}

/**
 * Saves all files related to a music video including renaming existing video and artwork
 * if the file name has changed. Writes a fresh `NFO` file and saves/deletes related artwork.
 *
 * @param {musicVideoSaveObject} musicVideo - data to use when creating/updating files.
 * @returns {musicVideoReturnObject}
 */
exports.saveMusicVideoData = async (path, musicVideo) => {
	console.log(musicVideo)
	/** @type {musicVideoReturnData} */
	const newMusicVideo = {
		fileName: musicVideo.fileName,
		fileType: musicVideo.fileType,
		nfo: true
	}
	let newFilename = false
	if (musicVideo.currentFileName !== musicVideo.fileName) {
		newFilename = true
		if (musicVideo.nfo) {
			fs.rmSync(`${path}/${musicVideo.currentFileName}.nfo`)
		}
	}

	// Create `.nfo` file
	const xmlData = { musicvideo: {} }
	const musicvideo = musicVideo.musicvideo
	for (const musicVideoField of musicVideoFields) {
		if (musicvideo[musicVideoField.field]) {
			let fieldName = musicVideoField.field
			if (musicVideoField.multiple) {
				fieldName = fieldName.substring(0, fieldName.length - 1)
			}
			if (musicVideoField.field === 'actors') {
				const actorsToReturn = []
				const actors = []
				let actorCount = 0
				for (const actor of musicvideo.actors) {
					const actorData = { name: '', role: '', order: actorCount, thumb: '' }
					const actorDataToReturn = { name: '' }
					if (actor.indexOf(' (') > -1) {
						const roleStart = actor.indexOf(' (')
						const roleEnd = actor.indexOf(')')
						if (roleEnd > roleStart) {
							actorData.name = actor.substring(0, roleStart).trim()
							actorData.role = actor.substring(roleStart + 2, roleEnd).trim()
							actorDataToReturn.name = actorData.name
							actorDataToReturn.role = actorData.role
						}
					} else {
						actorData.name = actor
						actorDataToReturn.name = actor
					}
					actors.push(actorData)
					actorsToReturn.push(actorDataToReturn)
					actorCount++
				}
				xmlData.musicvideo.actor = actors
				newMusicVideo.actors = actorsToReturn
			} else {
				xmlData.musicvideo[fieldName] = musicvideo[musicVideoField.field]
				newMusicVideo[musicVideoField.field] = musicvideo[musicVideoField.field]
			}
		} else {
			newMusicVideo[musicVideoField.field] = undefined
		}
	}
	console.log(xmlData)
	const xmlOptions = {
		format: true
	}
	const builder = new XMLBuilder(xmlOptions)
	const nfoFile = builder.build(xmlData)
	console.log(nfoFile)
	fs.writeFileSync(`${path}/${musicVideo.fileName}.nfo`, nfoFile)

	// process artwork except fanart
	for (const musicVideoArtwork of musicVideoArtworks) {
		const currentMusicVideoArtwork = `current${musicVideoArtwork[0].toUpperCase() + musicVideoArtwork.slice(1)}`
		if (musicVideo[currentMusicVideoArtwork] !== musicVideo[musicVideoArtwork]) {
			if (musicVideo[musicVideoArtwork]) {
				if (musicVideo[currentMusicVideoArtwork]) {
					console.log(`delete for replacement existing ${musicVideoArtwork} ${musicVideo[currentMusicVideoArtwork]}`)
					fs.rmSync(musicVideo[currentMusicVideoArtwork].substring(7))
				}
				if (musicVideo[musicVideoArtwork].substring(0, 5) === 'data:') {
					const newArtwork = musicVideo[musicVideoArtwork].substring(0, musicVideo[musicVideoArtwork].indexOf(';'))
					console.log(`New Artwork for ${musicVideoArtwork}: ${newArtwork}`)
					await saveDataUri(`${path}/${musicVideo.fileName}-${musicVideoArtwork}.webp`, musicVideo[musicVideoArtwork])
					newMusicVideo[musicVideoArtwork] = 'webp'
				} else {
					console.log(`New Artwork for ${musicVideoArtwork} not a dataURI`)
				}
			} else {
				console.log(`delete existing ${musicVideoArtwork} ${musicVideo[currentMusicVideoArtwork]}`)
				fs.rmSync(musicVideo[currentMusicVideoArtwork].substring(7))
				newMusicVideo[musicVideoArtwork] = undefined
			}
		} else {
			if (musicVideo[musicVideoArtwork]) {
				const fileType = musicVideo[musicVideoArtwork].substring(musicVideo[musicVideoArtwork].lastIndexOf('.') + 1)
				if (newFilename) {
					console.log(`renaming ${musicVideoArtwork} from ${musicVideo[musicVideoArtwork].substring(7)} to ${path}/${musicVideo.fileName}-${musicVideoArtwork}.${fileType}`)
					fs.renameSync(musicVideo[musicVideoArtwork].substring(7), `${path}/${musicVideo.fileName}-${musicVideoArtwork}.${fileType}`)
				}
				newMusicVideo[musicVideoArtwork] = fileType
			} else {
				newMusicVideo[musicVideoArtwork] = undefined
			}
		}
	}

	// process fanart
	if (musicVideo.currentFanart.length > 0 || musicVideo.fanart.length > 0) {
		const fanarts = musicVideo.fanart
		const currentFanarts = musicVideo.currentFanart.map((fanart) => `file://${path}/${musicVideo.currentFileName}-${fanart.name}.${fanart.type}`)
		const deleteFanarts = currentFanarts.filter((fanart) => !fanarts.includes(fanart))
		console.log({ currentFanarts, deleteFanarts })
		const newFanart = []
		let fanartCount = 0
		for (const fanart of fanarts) {
			if (currentFanarts.includes(fanart)) {
				const currentFanartIndex = currentFanarts.findIndex((item) => item === fanart)
				console.log(`fanart[${fanartCount}] ${fanart} exists in current fanart`)
				const fanartInstance = currentFanarts[currentFanartIndex].match(/-fanart\d*\./im)
				const fanartInstanceType = currentFanarts[currentFanartIndex].substring(fanart.lastIndexOf('.') + 1)
				newFanart.push({
					index: fanartCount,
					fanart,
					fanartType: fanart.substring(fanart.lastIndexOf('.') + 1),
					rename: fanart !== currentFanarts[fanartCount],
					fanartInstance: fanartInstance[0].substring(1, fanartInstance[0].length - 1),
					fanartInstanceType
				})
			} else {
				console.log(`fanart[${fanartCount}] ${fanart} is new`)
				newFanart.push({
					index: fanartCount,
					fanart,
					fanartType: 'webp',
					create: true
				})
			}
			fanartCount++
		}
		console.log(newFanart)
		for (const fanart of deleteFanarts) {
			fs.rmSync(fanart.substring(7))
		}
		newMusicVideo.fanart = []
		fanartCount = 0
		for (const fanart of newFanart) {
			const fanartInstance = `fanart${fanartCount === 0 ? '' : fanartCount}`
			if (fanart.rename || (newFilename && !fanart.create)) {
				fs.renameSync(`${path}/${musicVideo.currentFileName}-${fanart.fanartInstance}.${fanart.fanartInstanceType}`, `${path}/${musicVideo.fileName}-${fanartInstance}.${fanart.fanartInstanceType}`)
			} else if (fanart.create) {
				await saveDataUri(`${path}/${musicVideo.fileName}-${fanartInstance}.webp`, fanart.fanart)
			}
			newMusicVideo.fanart.push({ name: fanartInstance, type: fanart.fanartType })
			fanartCount++
		}
	}

	// rename video file if filename has changed
	if (newFilename) {
		fs.renameSync(`${path}/${musicVideo.currentFileName}.${musicVideo.fileType}`, `${path}/${musicVideo.fileName}.${musicVideo.fileType}`)
	}

	return { error: false, data: newMusicVideo }
}
