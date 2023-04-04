const nfoFields = {
  Artist: 'text',
  Title: 'text',
  UserRating: 'number',
  Top250: 'number',
  Track: 'number',
  Album: 'text',
  Outline: 'text',
  Plot: 'textarea',
  TagLine: 'text',
  RunTime: 'text',
  MPAA: 'text',
  ID: 'text',
  Genre: 'text',
  Tag: 'text',
  Director: 'text',
  Year: 'text',
  Status: 'text',
  Code: 'text',
  Aired: 'text',
  Studio: 'text'
}
let musicVideos = []
let theAudioDBSearch = {}
let imvdbSearch = {}
let imvdbVideo = {}
let musicBrainzReleases = {}
let musicBrainzRelease = {}
let itemActive = null
let itemOverlay = null

document.getElementById('formSource').addEventListener('submit', handleFormSubmission)
document.getElementById('actionTheAudioDB').addEventListener('click', handleTheAudioDB)
document.getElementById('actionIMVDb').addEventListener('click', handleIMVDb)
document.getElementById('listItems').addEventListener('click', handleListItemClick)
document.getElementById('checkAll').addEventListener('click', handleCheckAllClick)

async function handleFormSubmission (event) {
  event.preventDefault()
  overlayStart('info', 'Reading Folder&hellip;')
  document.getElementById('changeFolder').setAttribute('disabled', 'disabled')
  musicVideos = await getFolderItems(document.getElementById('workingFolder').value)
  console.log(musicVideos)
  if (musicVideos.length > 0) {
    const listItems = document.getElementById('listItems')
    let itemCount = 0
    musicVideos.forEach(element => {
      const itemDiv = document.createElement('div')
      itemDiv.dataset.index = itemCount
      const itemCheck = document.createElement('input')
      itemCheck.setAttribute('id', `itemCheck${itemCount}`)
      itemCheck.setAttribute('type', 'checkbox')
      itemDiv.appendChild(itemCheck)
      const itemName = document.createElement('span')
      itemName.textContent = element.full
      itemDiv.appendChild(itemName)
      listItems.appendChild(itemDiv)
      itemCount++
    })
    itemUpdate(0)
  }
  document.getElementById('changeFolder').removeAttribute('disabled')
  overlayCleanup()
}

async function getFolderItems (folder) {
  const url = `/api/current/?folder=${folder}`
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data
    })
    .catch((fsErr) => {
      return { status: 'error', errNumber: -1, errDesc: fsErr.message }
    })
}

function handleCheckAllClick () {
  let checkAll = false
  if (document.getElementById('checkAll').checked) {
    checkAll = true
  }
  for (let index = 0; index < musicVideos.length; index++) {
    document.getElementById(`itemCheck${index}`).checked = checkAll
  }
  checkboxStatus()
}

function checkboxStatus () {
  let checkStatus = false
  for (let index = 0; index < musicVideos.length; index++) {
    if (document.getElementById(`itemCheck${index}`).checked) {
      checkStatus = true
    }
  }
  if (checkStatus) {
    document.getElementById('actionBatchProcess').removeAttribute('disabled')
  } else {
    document.getElementById('actionBatchProcess').setAttribute('disabled', 'disabled')
  }
}

function handleListItemClick (event) {
  console.log('hanleListItemClick', event.target)
  if (event.target.tagName.toLowerCase() === 'input') {
    checkboxStatus()
    return
  }
  let itemIndex = null
  if (event.target.tagName.toLowerCase() === 'span') {
    itemIndex = Number(event.target.parentNode.dataset.index)
  } else if (event.target.tagName.toLowerCase() === 'div') {
    itemIndex = Number(event.target.dataset.index)
  }
  console.log('itemIndex', itemIndex)
  if (itemIndex) {
    itemUpdate(itemIndex)
  }
}

function fieldsUpdate (fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      if (key === 'itemPlot') {
        document.getElementById(key).textContent = value
      } else {
        document.getElementById(key).value = value
      }
    }
  }
}

function itemSetActive (itemIndex) {
  if (itemActive !== null) {
    document.querySelectorAll(`[data-index="${itemActive}"]`)[0].removeAttribute('class')
  }
  itemActive = itemIndex
  document.querySelectorAll(`[data-index="${itemActive}"]`)[0].classList.add('itemActive')
}

function itemUpdate (itemIndex) {
  document.getElementById('rowInfo').innerHTML = `<span>Video ${itemIndex + 1} of ${musicVideos.length}</span>`
  itemSetActive(itemIndex)

  for (const [key, value] of Object.entries(nfoFields)) {
    const element = `item${key}`
    const itemName = key.toLowerCase()
    if (value === 'textarea') {
      document.getElementById(element).textContent = typeof musicVideos[itemIndex][itemName] === 'undefined' ? '' : musicVideos[itemIndex][itemName]
    } else {
      document.getElementById(element).value = typeof musicVideos[itemIndex][itemName] === 'undefined' ? '' : musicVideos[itemIndex][itemName]
    }
  }
  document.getElementById('actionTheAudioDB').removeAttribute('disabled')
  document.getElementById('actionIMVDb').removeAttribute('disabled')
  document.getElementById('actionSave').removeAttribute('disabled')
  document.getElementById('actionSaveAll').removeAttribute('disabled')
}

function handleTheAudioDB (event) {
  event.preventDefault()
  overlayStart('info', 'Contacting TheAudioDB&hellip;')
  document.getElementById('actionTheAudioDB').setAttribute('disabled', 'disabled')
  document.getElementById('actionIMVDb').setAttribute('disabled', 'disabled')
  document.getElementById('actionSave').setAttribute('disabled', 'disabled')
  document.getElementById('actionSaveAll').setAttribute('disabled', 'disabled')
  const artist = document.getElementById('itemArtist').value
  const title = document.getElementById('itemTitle').value
  let fields = {}
  const searchURL = `https://theaudiodb.com/api/v1/json/1/searchtrack.php?s=${artist.replace(/&/mg, '%26').replace(/ /mg, '%20')}&t=${title.replace(/&/mg, '%26').replace(/ /mg, '%20')}`
  console.log('handleTheAudioDB search', searchURL)
  fetch(searchURL)
    .then((response) => response.json())
    .then((data) => {
      theAudioDBSearch = data
      console.log('search data', theAudioDBSearch)
    })
    .then(function () {
      if (theAudioDBSearch.track) {
        if (theAudioDBSearch.track.length > 0) {
          const trackInfo = theAudioDBSearch.track[0]
          fields = {
            itemTrack: trackInfo.intTrackNumber,
            itemAlbum: trackInfo.strAlbum,
            itemGenre: trackInfo.strGenre,
            itemPlot: trackInfo.strDescriptionEN,
            itemDirector: trackInfo.strMusicVidDirector
          }
          console.log('trackInfo fields', fields)
          const releasesURL = `https://musicbrainz.org/ws/2/release-group/${trackInfo.strMusicBrainzAlbumID}?inc=releases&fmt=json`
          console.log('handleTheAudioDB releases', releasesURL)
          fetch(releasesURL)
            .then((response) => response.json())
            .then((data) => {
              musicBrainzReleases = data.releases
              console.log('releases data', musicBrainzReleases)
            })
            .then(function () {
              const releasesUS = musicBrainzReleases.filter(element => element.country === 'US')
              const releasesXE = musicBrainzReleases.filter(element => element.country === 'XE')
              console.log('releases us xe', releasesUS, releasesXE)
              if (releasesUS.length > 0 || releasesXE.length > 0) {
                let releaseURL = null
                if (releasesUS.length > 0) {
                  releaseURL = `https://musicbrainz.org/ws/2/release/${releasesUS[0].id}?inc=labels&fmt=json`
                  console.log('handleTheAudioDB first US release', releaseURL)
                } else {
                  releaseURL = `https://musicbrainz.org/ws/2/release/${releasesXE[0].id}?inc=labels&fmt=json`
                  console.log('handleTheAudioDB first European release', releaseURL)
                }
                fetch(releaseURL)
                  .then((response) => response.json())
                  .then((data) => {
                    musicBrainzRelease = data
                    console.log('release data', musicBrainzRelease)
                  })
                  .then(function () {
                    fields.itemYear = new Date(musicBrainzRelease.date).getFullYear()
                    if (musicBrainzRelease['label-info'].length > 0) {
                      fields.itemStudio = musicBrainzRelease['label-info'][0].label.name
                    } else {
                      console.log('No label info on this release update code to interate releases')
                    }
                    console.log('final fields', fields)
                    fieldsUpdate(fields)
                  })
                  .catch((releaseErr) => {
                    console.log('release error', releaseErr)
                  })
                  .finally(function () {
                    document.getElementById('actionTheAudioDB').removeAttribute('disabled')
                    document.getElementById('actionIMVDb').removeAttribute('disabled')
                    document.getElementById('actionSave').removeAttribute('disabled')
                    document.getElementById('actionSaveAll').removeAttribute('disabled')
                    overlayCleanup()
                  })
              }
            })
            .catch((releasesErr) => {
              console.log('releases error', releasesErr)
            })
        }
      } else {
        overlayCleanup()
        overlayStart('theaudiodb')
      }
    })
    .catch((searchErr) => {
      console.log('search error', searchErr)
    })
}

function handleIMVDb (event) {
  event.preventDefault()
  overlayStart('info', 'Contacting IMVDb&hellip;')
  document.getElementById('actionTheAudioDB').setAttribute('disabled', 'disabled')
  document.getElementById('actionIMVDb').setAttribute('disabled', 'disabled')
  document.getElementById('actionSave').setAttribute('disabled', 'disabled')
  const artist = document.getElementById('itemArtist').value
  const searchArtist = artist.replace(/[^a-zA-Z\d\s]/mg, '').replace(/  /mg, ' ').replace(/ /mg, '+') // eslint-disable-line
  const title = document.getElementById('itemTitle').value
  const searchTitle = title.replace(/[^a-zA-Z\d\s]/mg, '').replace(/  /mg, ' ').replace(/ /mg, '+') // eslint-disable-line
  const searchURL = encodeURI(`https://imvdb.com/api/v1/search/videos?q=${searchArtist}+${searchTitle}`)
  console.log('handleIMVDb search', searchURL)
  fetch(searchURL)
    .then((response) => response.json())
    .then((data) => {
      imvdbSearch = data
      console.log('search data', imvdbSearch)
      if (imvdbSearch) {
        if (imvdbSearch.results) {
          if (imvdbSearch.results.length > 0) {
            const imvdbSearchResults = imvdbSearch.results
            const imvdbSearchPicks = []
            for (let index = 0; index < imvdbSearchResults.length; index++) {
              const imvdbResult = imvdbSearchResults[index]
              let imvdbArtists = ''
              if (imvdbResult.artists.length > 0) {
                for (let artist = 0; artist < imvdbResult.artists.length; artist++) {
                  if (artist > 0) {
                    imvdbArtists += ' and '
                  }
                  imvdbArtists += imvdbResult.artists[artist].name
                }
              }
              imvdbSearchPicks.push({ artist: imvdbArtists, title: imvdbResult['song_title'] }) // eslint-disable-line
            }
            console.log('picks', imvdbSearchPicks)
            if (imvdbSearchPicks[0].artist.toLowerCase() === artist.toLowerCase() && imvdbSearchPicks[0].title.toLowerCase() === title.toLowerCase()) {
              getIMVDbVideo(imvdbSearch.results[0].id)
            } else {
              overlayCleanup()
              const overlayListBox = document.getElementById('overlayList')
              overlayListBox.innerHTML = ''
              for (let index = 0; index < imvdbSearchPicks.length; index++) {
                const listOption = document.createElement('option')
                listOption.setAttribute('value', index)
                listOption.textContent = `${imvdbSearchPicks[index].artist}: ${imvdbSearchPicks[index].title}`
                overlayListBox.appendChild(listOption)
              }
              overlayStart('imvdb')
            }
          }
        }
      }
    })
    .catch((searchErr) => {
      console.log('search error', searchErr)
    })
    .finally(function () {
      document.getElementById('actionTheAudioDB').removeAttribute('disabled')
      document.getElementById('actionIMVDb').removeAttribute('disabled')
      document.getElementById('actionSave').removeAttribute('disabled')
    })
}

function getIMVDbVideo (id) {
  let fields = {}
  const videoURL = `https://imvdb.com/api/v1/video/${id}`
  console.log('handleIMVDb video', videoURL)
  fetch(videoURL)
    .then((response) => response.json())
    .then((data) => {
      imvdbVideo = data
      console.log('video data', imvdbVideo)
      fields = {
        itemID: id,
        itemYear: imvdbVideo.year,
        itemStatus: imvdbVideo['production_status'] // eslint-disable-line
      }
      if (imvdbVideo.directors.length > 0) {
        fields.itemDirector = imvdbVideo.directors[0]['entity_name'] // eslint-disable-line
      }
      console.log('final fields', fields)
      fieldsUpdate(fields)
    })
    .catch((videoErr) => {
      console.log('video error', videoErr)
    })
    .finally(function () {
      overlayCleanup()
    })
}

function overlayInfo (status) {
  if (status) {
    document.getElementById('overlayDialog').style.alignItems = 'center'
    document.getElementById('overlayDialog').style.justifyContent = 'center'
    document.getElementById('overlayDialog').style.display = 'flex'
  } else {
    document.getElementById('overlayDialog').style.alignItems = ''
    document.getElementById('overlayDialog').style.justifyContent = ''
    document.getElementById('overlayDialog').style.display = 'grid'
  }
}

function overlayStart (source, info) {
  itemOverlay = source
  switch (itemOverlay) {
    case 'info':
      document.getElementById('overlayList').style.display = 'none'
      document.getElementById('overlayButtons').style.display = 'none'
      document.getElementById('overlayHeader').innerHTML = info
      overlayInfo(true)
      break
    case 'theaudiodb':
      document.getElementById('overlayHeader').textContent = 'No Exact TheAudioDB Match'
      document.getElementById('overlayList').style.display = 'none'
      document.getElementById('overlayButtons').style.display = 'grid'
      document.getElementById('overlayOK').setAttribute('disabled', 'disabled')
      document.getElementById('overlayDialog').style.display = 'grid'
      document.getElementById('overlayCancel').addEventListener('click', overlayCancel)
      break
    case 'imvdb':
      document.getElementById('overlayHeader').textContent = 'No Exact IMVDb Match'
      document.getElementById('overlayList').style.display = 'block'
      document.getElementById('overlayButtons').style.display = 'grid'
      document.getElementById('overlayOK').setAttribute('disabled', 'disabled')
      document.getElementById('overlayDialog').style.display = 'grid'
      document.getElementById('overlayList').addEventListener('click', overlayListClick)
      document.getElementById('overlayOK').addEventListener('click', overlayOk)
      document.getElementById('overlayCancel').addEventListener('click', overlayCancel)
      break
  }
  document.getElementById('overlayHolder').style.display = 'flex'
}

function overlayListClick () {
  if (document.getElementById('overlayList').value === '') {
    document.getElementById('overlayOK').setAttribute('disabled', 'disabled')
  } else {
    document.getElementById('overlayOK').removeAttribute('disabled')
  }
}

function overlayOk () {
  switch (itemOverlay) {
    case 'imvdb':
      getIMVDbVideo(imvdbSearch.results[Number(document.getElementById('overlayList').value)].id)
      break
  }
  overlayCleanup()
}

function overlayCancel () {
  overlayCleanup()
}

function overlayCleanup () {
  if (document.getElementById('overlayHolder').style.display !== 'none') {
    document.getElementById('overlayHolder').style.display = 'none'
    switch (itemOverlay) {
      case 'info':
        overlayInfo(false)
        break
      case 'imvdb':
        document.getElementById('overlayList').removeEventListener('click', overlayListClick)
        document.getElementById('overlayOK').removeEventListener('click', overlayOk)
        document.getElementById('overlayCancel').removeEventListener('click', overlayCancel)
        break
    }
  }
  itemOverlay = null
}
