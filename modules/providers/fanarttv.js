'use strict'

const fanartTvKey = '75a32b64b2d7e842f5c351448be76783'

async function getFanartTv(url) {
	const response = await fetch(`${url}?api_key=${fanartTvKey}`, {
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

async function getFanartTvImages(artists, releaseGroup) {
	const lookupData = {}
	for (const artist of artists) {
		const artistUrl = `http://private-anon-b93c9a5594-fanarttv.apiary-proxy.com/v3/music/${artist.id}`
		// console.log(artistUrl)
		const response = await getFanartTv(artistUrl)
		if (response.error) {
			lookupData.fetchError = { source: 'fanart.tv', status: response.status }
		} else {
			const data = response.data
			// console.log(data)
			if (data.albums) {
				const album = data.albums[releaseGroup]
				// console.log(album)
				if (album) {
					if (album.albumcover && album.albumcover.length > 0) {
						lookupData.thumb = []
						for (const albumcover of album.albumcover) {
							lookupData.thumb.push(albumcover.url)
						}
					}
					if (album.cdart && album.cdart.length > 0) {
						lookupData.cdart = []
						for (const cdart of album.cdart) {
							lookupData.cdart.push(cdart.url)
						}
					}
				}
			}
			let clearlogos = []
			if (data.hdmusiclogo) {
				clearlogos = data.hdmusiclogo
			} else if (data.musiclogo) {
				clearlogos = data.musiclogo
			}
			if (clearlogos.length > 0) {
				lookupData.clearlogo = []
				for (const clearlogo of clearlogos) {
					lookupData.clearlogo.push(clearlogo.url)
				}
			}
			if (data.artistthumb && data.artistthumb.length > 0) {
				lookupData.artistthumb = []
				for (const artistthumb of data.artistthumb) {
					lookupData.artistthumb.push(artistthumb.url)
				}
			}
			if (data.musicbanner && data.musicbanner.length > 0) {
				lookupData.banner = []
				for (const banner of data.musicbanner) {
					lookupData.banner.push(banner.url)
				}
			}
			if (data.artistbackground && data.artistbackground.length > 0) {
				lookupData.fanart = []
				for (const fanart of data.artistbackground) {
					lookupData.fanart.push(fanart.url)
				}
			}
		}
	}
	return lookupData
}

exports.lookupFanartTv = async (artists, releaseGroup) => {
	return await getFanartTvImages(artists, releaseGroup)
}
