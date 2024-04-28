const fs = require('node:fs')
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser')

const videoFormats = ['mp4', 'webm', 'mkv', 'avi', 'mov']
const artworkFormats = ['jpg', 'png', 'webp']

async function checkArtwork(fileLookup, artworkType) {
	for (const artworkFormat of artworkFormats) {
		// console.log(fileLookup, artworkType, artworkFormat)
		if (fs.existsSync(`${fileLookup}-${artworkType}.${artworkFormat}`)) {
			// console.log(`found ${artworkFormat}`)
			return artworkFormat
		}
	}
	return undefined
}

async function checkFanart(fileLookup) {
	const fanart = []
	let fanartType = await checkArtwork(fileLookup, 'fanart')
	// console.log(`returned ${fanartType}`)
	if (fanartType) {
		fanart.push({ name: 'fanart', type: fanartType })
		let fanartNumber = 1
		while (fanartType) {
			fanartType = await checkArtwork(fileLookup, `fanart${fanartNumber}`)
			// console.log(fileLookup, `fanart${fanartNumber}`, fanartType)
			if (fanartType) {
				fanart.push({ name: `fanart${fanartNumber}`, type: fanartType })
			}
			fanartNumber++
		}
	}
	return fanart
}

exports.getVideos = async (path) => {
	const musicVideos = []
	const folderFiles = fs.readdirSync(path, { withFileTypes: true })
	for (const folderFile of folderFiles) {
		if (folderFile.isFile()) {
			const fileEntry = folderFile.name
			const fileType = fileEntry.substring(fileEntry.lastIndexOf('.') + 1).toLowerCase()
			const fileName = fileEntry.substring(0, fileEntry.length - fileType.length - 1)
			const fileLookup = `${path}/${fileName}`
			if (videoFormats.includes(fileType)) {
				// console.log(fileEntry, fileType, fileName, fileLookup)
				const musicVideo = {
					fileName,
					fileType
				}
				// console.log(musicVideo)
				musicVideo.nfo = (fs.existsSync(`${fileLookup}.nfo`))
				if (musicVideo.nfo) {
					const fileNfoXml = fs.readFileSync(`${fileLookup}.nfo`)
					const fileNfoParser = new XMLParser()
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
				musicVideo.banner = await checkArtwork(fileLookup, 'banner')
				musicVideo.clearart = await checkArtwork(fileLookup, 'clearart')
				musicVideo.clearlogo = await checkArtwork(fileLookup, 'clearlogo')
				musicVideo.discart = await checkArtwork(fileLookup, 'discart')
				musicVideo.keyart = await checkArtwork(fileLookup, 'keyart')
				musicVideo.landscape = await checkArtwork(fileLookup, 'landscape')
				musicVideo.poster = await checkArtwork(fileLookup, 'poster')
				musicVideo.thumb = await checkArtwork(fileLookup, 'thumb')
				musicVideo.fanart = await checkFanart(fileLookup)
				if (!musicVideo.fileName) {
					throw new Error(`No filename: ${folderFile}`)
				}
				musicVideos.push(musicVideo)
			}
		}
	}
	musicVideos.sort((a, b) => a.fileName.localeCompare(b.fileName))
	return musicVideos
}
