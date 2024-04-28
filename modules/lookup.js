'use strict'

const { lookupTheAudioDb } = require('./providers/theaudiodb.js')
const { lookupMusicBrainz } = require('./providers/musicbrainz.js')
const { lookupFanartTv } = require('./providers/fanarttv.js')
const { lookupImvDb } = require('./providers/imvdb.js')
const { lookupImDb } = require('./providers/imdb.js')
const { lookupWikipedia } = require('./providers/wikipedia.js')

exports.lookup = async (artists, title) => {
	const lookup = {}
	try {
		lookup.theAudioDb = await lookupTheAudioDb(artists, title)
	} catch (error) {
		console.log(error)
		lookup.theAudioDb = { lookupError: error.message }
	}
	try {
		lookup.musicBrainz = await lookupMusicBrainz(artists, title)
		if (Object.keys(lookup.musicBrainz).length > 0 && !lookup.musicBrainz.fetchError) {
			try {
				lookup.fanartTv = await lookupFanartTv(lookup.musicBrainz.artists, lookup.musicBrainz.releaseGroup)
			} catch (error) {
				console.log(error)
				lookup.fanartTv = { lookupError: error.message }
			}
		}
	} catch (error) {
		console.log(error)
		lookup.musicBrainz = { lookupError: error.message }
	}
	try {
		lookup.imvDb = await lookupImvDb(artists, title)
	} catch (error) {
		console.log(error)
		lookup.imvDb = { lookupError: error.message }
	}
	try {
		lookup.imDb = await lookupImDb(artists, title)
	} catch (error) {
		console.log(error)
		lookup.imDb = { lookupError: error.message }
	}
	try {
		lookup.wikipedia = await lookupWikipedia(artists, title)
	} catch (error) {
		console.log(error)
		lookup.wikipedia = { lookupError: error.message }
	}
	return lookup
}
