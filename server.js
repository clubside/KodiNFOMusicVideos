'use strict'

const fastify = require('fastify')({ logger: { level: 'trace' } })
const path = require('path')
const fs = require('fs')
const fsp = require('fs').promises
const txml = require('txml')

const videoExt = ['.mp4', '.mkv', '.avi', '.mov']

async function processFolder(folder) {
	try {
		const gridItems = []
		const files = await fsp.readdir(folder)
		for (const file of files) {
			const fileObj = {
				folder,
				fileRaw: file,
				fileName: (file.lastIndexOf('.') >= 0) ? file.substring(0, file.lastIndexOf('.')) : file,
				fileExt: (file.lastIndexOf('.') >= 0) ? file.substring(file.lastIndexOf('.')) : null
			}
			fileObj.fileXML = (files.findIndex(file => file === fileObj.fileName + '.nfo') >= 0) ? fileObj.fileName + '.nfo' : null
			const fileInfo = await processFile(fileObj)
			// console.log(file, fileInfo)
			if (fileInfo) {
				gridItems.push(fileInfo)
			}
		}
		// console.log('finished processing files')
		// console.log(gridItems)
		return gridItems
	} catch (err) {
		console.error('failed processing folder\n', err)
		return []
	}
}

async function processFile(fileObj) {
	try {
		if (videoExt.includes(fileObj.fileExt)) {
			const row = {
				name: fileObj.fileName,
				ext: fileObj.fileExt,
				full: fileObj.fileRaw
			}
			if (fileObj.fileXML) {
				const fileNFO = fileObj.folder + '\\' + fileObj.fileXML
				console.log(`reading file ${fileNFO}`)
				const nfo = await fsp.readFile(fileNFO, { encoding: 'utf8' })
				const mvJSON = txml.simplify(txml.parse(nfo))
				// console.log(mvJSON)
				row.title = mvJSON.musicvideo.title
				row.userrating = mvJSON.musicvideo.userrating
				row.top250 = mvJSON.musicvideo.top250
				row.track = mvJSON.musicvideo.track
				row.album = mvJSON.musicvideo.album
				row.outline = mvJSON.musicvideo.outline
				row.plot = mvJSON.musicvideo.plot
				row.tagline = mvJSON.musicvideo.tagline
				row.runtime = mvJSON.musicvideo.runtime
				row.mpaa = mvJSON.musicvideo.mpaa
				row.id = mvJSON.musicvideo.id
				row.genre = mvJSON.musicvideo.genre
				row.tag = mvJSON.musicvideo.tag
				row.director = mvJSON.musicvideo.director
				row.year = mvJSON.musicvideo.year
				row.status = mvJSON.musicvideo.status
				row.code = mvJSON.musicvideo.code
				row.aired = mvJSON.musicvideo.aired
				row.studio = mvJSON.musicvideo.studio
				row.artist = mvJSON.musicvideo.artist
				return row
			} else {
				// console.log('Adding Simple File', row)
				return row
			}
		} else {
			// console.log('Skipping File', fileObj.fileRaw)
			return undefined
		}
	} catch (err) {
		console.error(`failed processing file ${fileObj.fileRaw}\n`, err)
		return undefined
	}
}

fastify.register(require('@fastify/static'), {
	root: path.join(__dirname, '/public')
})

fastify.get('/api/current/', async function (request, reply) {
	const returnData = await processFolder(request.query.folder)
	reply.send(returnData)
})

fastify.listen({ port: 3000 }, (err, address) => {
	if (err) {
		throw err
		// fastify.log.error(err)
		// process.exit(1)
	} else {
		console.log(`Server is now listening on ${address}`)
	}
	// Server is now listening on ${address}
})
