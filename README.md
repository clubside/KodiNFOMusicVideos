# KodiNFOMusicVideos

Create and Edit Kodi NFO files for Music Videos collection.

This is a complete rewrite of my previous two attempts and is now an [Electron](https://electronjs.org/) app. Currently you have to clone this repository and use `npm start` to launch the application. The first item in the Roadmap below is to use [electron-builder](https://www.electron.build/index.html) to generate executable for Windows and Linux, I don't own a Mac so I won't be able to generate for that platform but the app should run.

## Main Features

- Scans your music video media folder for video files and associated `.nfo` and artwork.
- Displays a list of the music videos with a summary of the available metadata and artwork.
- List can be filtered by metadata and artwork as well as searches with file names, artists and title.
- Individual videos can have their metadata and artwork edited.
- Parse artists and title from file name including automatic stripping of extraneous information like '(Official Music Video)'.
- Inline video player for `.mp4` and `.webm` files. Both `.mkv` and `.avi` extensions are supported but will only display if using codecs supported by browsers.
- Lookup panel feature scans various information providers with links to the asscoiated page:
  - IMDb.com for title, premiere date and actors. If no exact match is found a list of potentials is presented.
  - IMVDb.com for artists, title, premiere date, directors, actors and fan art. If no exact match is found a list of potentials is presented.
  - MusicBrainz.org for artists, title, premiere date, album, genres, studios and thumbnail.
  - TheAudioDB.com for artists, title, album, genres, directors, studios, plot, thumbnail, CD art, clear logo, clear art, artist thumbnail, banner, landscape and fan art.
  - Wikipedia.org for artists, title, premiere date, album, genres, studios, plot, thumbnail and fan art.
  - Fanart.tv will be included if a MusicBrainz match is found. Artwork can include thumbnail, CD art, clear logo, clear art, artist thumbnail and fan art.
- Add artwork by browsing the local file system, drag-and-drop from local file system, drag-and-drop from web page and drag-and-drop from lookup panel or any web page.
- Unlimited fan art with add and remove buttons.
- Remove existing artwork.
- Context menu on video can save current frame to artwork including auto-creating new fan art slots.
- Zoom any piece of artwork to the full window.
- Rename music video file and the associated `.nfo` and artwork.
- Light and dark interfaces.

## How to use

After launching the application you will be presented with a folder selection interface. Enter or browse for your music videos folder.

Once your folder is set a list of your music videos will display. A 'View' tab at the bottom of the list will reveal the filter options. The action bar at the bottom of the app has a back button, light/dark toggle, settings and about page.

Click any of the music videos to enter the editor which features a 'Lookup' tab at the bottom of the editor. The video will display at the top with the file name below and a button to the right of that to automatically fill the artists and title field based on the file name. Once a title is set the 'Lookup' button will be enabled and once pressed will search the information providers. Override fields for artists and title are available for tricky/alternate variations. Once the data is retrieved you can click on the labels to populate the relevant field and drag-and-drop artwork. The action bar adds buttons to navigate through your music videos list as a save button.

## Roadmap

- [ ] Create binaries and first GitHub release
- [ ] Auto-scan entire library
- [ ] Settings for auto-scan
- [ ] Artwork viewer with zoom and panning
- [ ] Artwork editor with cropping

## Notes

This file will be edited shortly to link a fresh topic on the [Kodi forums](https://forum.kodi.tv/).

Any feedback and suggestions will be greatly appreciated.
