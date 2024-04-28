'use strict'

class MediaUpload extends HTMLElement {
	static define(tag = 'media-upload') {
		customElements.define(tag, this)
	}

	static get observedAttributes() {
		return ['types', 'value', 'addable', 'removable']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`Attribute ${name} has changed from ${typeof oldValue === 'string' && oldValue.length > 32 ? oldValue.substring(0, 32) + '...' : oldValue} to ${typeof newValue === 'string' && newValue.length > 32 ? newValue.substring(0, 32) + '...' : newValue}.`)
		if (oldValue !== newValue) {
			switch (name) {
				case 'addable':
					this.#updateAddable()
					break
				case 'removable':
					this.#updateRemovable()
					break
				case 'value':
					this.#updateValue(true)
					break
				case 'types':
					this.#updateTypes()
					break
			}
		}
	}

	get addable() {
		return this.hasAttribute('addable')
	}

	set addable(value) {
		this.toggleAttribute('addable', value)
	}

	get removable() {
		return this.hasAttribute('removable')
	}

	set removable(value) {
		this.toggleAttribute('removable', value)
	}

	get value() {
		return this.getAttribute('value')
	}

	set value(value) {
		this.setAttribute('value', value)
	}

	get types() {
		return this.getAttribute('types')
	}

	set types(value) {
		this.setAttribute('types', value)
	}

	#connected = false
	#mediaImage = ['image/jpeg', 'image/png', 'image/webp']
	#mediaVideo = ['video/mp4', 'video/webm']
	#mediaAccepted = this.#mediaImage.concat(this.#mediaVideo)
	#mediaInput = undefined
	#mediaTypes = undefined
	#mediaImagePreview = undefined
	#mediaVideoPreview = undefined
	#mediaActions = undefined
	#onClick
	#onDragEnter
	#onDragOver
	#onDragLeave
	#onDrop
	#onChange
	#onClear
	#onZoom
	#onRemove
	#onAdd
	#onKeyDown
	#mediaUploadAdd = new CustomEvent('add')
	#mediaUploadChange = new CustomEvent('change')
	#mediaUploadRemove = new CustomEvent('remove')

	#updateAddable() {
		if (this.#connected) {
			this.#updateActions()
		}
	}

	#updateRemovable() {
		if (this.#connected) {
			this.#updateActions()
		}
	}

	#updateValue(dispatch = false) {
		if (this.#connected) {
			this.#updateSource()
			if (dispatch) {
				this.dispatchEvent(this.#mediaUploadChange)
			}
		}
	}

	#updateTypes() {
		if (this.#connected) {
			this.#updateMediaTypes()
		}
	}

	#previewMedia(dt) {
		this.classList.add('media-upload-wait')
		const reader = new FileReader()
		reader.readAsDataURL(dt.files[0])
		reader.onloadend = () => {
			this.setAttribute('value', reader.result)
			this.classList.remove('media-upload-wait')
		}
	}

	#zoomMedia() {
		const overlay = document.createElement('div')
		overlay.id = 'media-upload-zoom'
		overlay.setAttribute('style', 'position: fixed; width: 100vw; height: 100vh; inset: 0; background: black; z-index: 9999;')
		overlay.addEventListener('click', () => {
			document.getElementById('media-upload-zoom').remove()
		})
		if (!this.#mediaImagePreview.classList.contains('hidden')) {
			const img = document.createElement('img')
			img.setAttribute('src', this.value)
			img.setAttribute('style', 'width: 100vw; height: 100vh; object-fit: contain;')
			overlay.appendChild(img)
		} else if (!this.#mediaVideoPreview.classList.contains('hidden')) {
			const video = document.createElement('video')
			video.setAttribute('controls', '')
			video.setAttribute('style', 'width: 100vw; height: 100vh; object-fit: contain;')
			video.innerHTML = this.#mediaVideoPreview.innerHTML
			video.load()
			overlay.appendChild(video)
		} else {
			console.error('No media to zoom')
		}
		const close = document.createElement('div')
		close.setAttribute('style', 'position: absolute; top: 16px; right: 16px; width: 48px; height: 48px; border-radius: 50%; background-color: #777; cursor: pointer;')
		close.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" color="white"><path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
		overlay.appendChild(close)
		document.body.appendChild(overlay)
	}

	#updateActions() {
		// console.log(`${this.id} updateActions() addable=${this.addable} removable=${this.removable}`)
		const mediaClear = this.shadowRoot.getElementById('media-clear')
		const mediaZoom = this.shadowRoot.getElementById('media-zoom')
		const mediaAdd = this.shadowRoot.getElementById('media-add')
		const mediaRemove = this.shadowRoot.getElementById('media-remove')
		// console.log(this.id, this.addable, this.removable, this.value)
		if (this.value) {
			mediaClear.classList.remove('hidden')
			// mediaEdit.classList.remove('hidden')
			mediaZoom.classList.remove('hidden')
		} else {
			mediaClear.classList.add('hidden')
			// mediaEdit.classList.add('hidden')
			mediaZoom.classList.add('hidden')
		}
		if (this.addable) {
			mediaAdd.classList.remove('hidden')
		} else {
			mediaAdd.classList.add('hidden')
		}
		if (this.removable) {
			mediaRemove.classList.remove('hidden')
		} else {
			mediaRemove.classList.add('hidden')
		}
		if (this.value || this.addable || this.removable) {
			this.#mediaActions.classList.remove('hidden')
		} else {
			this.#mediaActions.classList.add('hidden')
		}
	}

	#updateMediaTypes() {
		// console.log(`${this.id} updateMediaTypes()`)
		if (!this.types) {
			this.setAttribute('types', this.#mediaAccepted.join(' '))
		} else {
			const mediaTypes = this.types.split(' ')
			this.#mediaInput.setAttribute('accept', mediaTypes.join(', '))
			let image = false
			let video = false
			for (const mediaType of mediaTypes) {
				switch (mediaType) {
					case 'image/jpeg':
						image = true
						break
					case 'image/png':
						image = true
						break
					case 'image/webp':
						image = true
						break
					case 'video/mp4':
						video = true
						break
					case 'video/webm':
						video = true
						break
				}
			}
			let mediaTypeImages = ''
			if (image) {
				mediaTypeImages += '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 16L10 13L21 18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8C18 9.10457 17.1046 10 16 10Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
			}
			if (video) {
				mediaTypeImages += '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.89768 8.51296C9.49769 8.28439 9 8.57321 9 9.03391V14.9661C9 15.4268 9.49769 15.7156 9.89768 15.487L15.0883 12.5209C15.4914 12.2906 15.4914 11.7094 15.0883 11.4791L9.89768 8.51296Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
			}
			this.#mediaTypes.innerHTML = mediaTypeImages
		}
	}

	#updateSource() {
		let sourceType, imageSource, videoSource
		// console.log(this.id, this.value)
		if (this.value) {
			if (this.value.length > 4 && this.value.substring(0, 5) === 'data:') {
				if (this.value.substring(0, 5) === 'data:') {
					const dataUri = this.value.split(';')
					const dataSource = dataUri[0].split(':')
					// console.log(dataUri[0], dataSource[1])
					if (this.#mediaImage.includes(dataSource[1])) {
						imageSource = this.value
					} else if (this.#mediaVideo.includes(dataSource[1])) {
						videoSource = this.value
						sourceType = dataSource[1]
					} else {
						console.error('Inavid Data URI')
					}
				}
			} else {
				sourceType = this.value.substring(this.value.lastIndexOf('.') + 1)
				switch (sourceType) {
					case 'mp4':
					case 'webm':
						videoSource = this.value
						sourceType = `video/${sourceType}`
						break
					default:
						imageSource = this.value
				}
			}
		}
		if (imageSource) {
			this.#mediaImagePreview.src = imageSource
			this.#mediaImagePreview.classList.remove('hidden')
		} else {
			this.#mediaImagePreview.removeAttribute('src')
			this.#mediaImagePreview.classList.add('hidden')
		}
		if (videoSource) {
			this.#mediaVideoPreview.innerHTML = `<source src="${videoSource}" type="${sourceType}">`
			this.#mediaVideoPreview.load()
			this.#mediaVideoPreview.oncanplaythrough = () => {
				this.#mediaVideoPreview.classList.remove('hidden')
			}
		} else {
			this.#mediaVideoPreview.innerHTML = ''
			this.#mediaVideoPreview.classList.add('hidden')
		}
		if (imageSource || videoSource) {
			this.#mediaTypes.classList.add('hidden')
		} else {
			this.#mediaTypes.classList.remove('hidden')
		}
		this.#updateActions()
	}

	#setElements() {
		this.#mediaInput = this.shadowRoot.getElementById('media-input')
		this.#mediaTypes = this.shadowRoot.querySelector('.media-types')
		this.#mediaImagePreview = this.shadowRoot.querySelector('img')
		this.#mediaVideoPreview = this.shadowRoot.querySelector('video')
		this.#mediaActions = this.shadowRoot.querySelector('.media-actions')
	}

	constructor() {
		super()
		const shadowroot = this.attachShadow({ mode: 'open' })
		shadowroot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: inline-flex;
					position: relative;
					width: inherit;
					height: inherit;
					aspect-ratio: inherit;
					border: 4px dashed lightblue;
					place-content: center;
					overflow: hidden;
					cursor: pointer;
				}
				input {
					display: none;
				}
				.media-types {
					display: flex;
					width: 100%;
					height: 100%;
					align-items: center;
					justify-content: center;
					gap: 8px;
				}
				.media-types svg {
					width: 32px;
					height: 32px;
					stroke: lightblue;
					fill: none;
				}
				.media-preview {
					width: 100%;
					aspect-ratio: inherit;
					object-fit: contain;
				}
				.media-actions {
					position: absolute;
					top: 8px;
					right: 8px;
					display: flex;
					flex-direction: column;
					gap: 4px;
				}
				.media-actions button {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #777;
					border: none;
					border-radius: 50%;
					cursor: pointer;
				}
				.media-actions button svg {
					width: 20px;
					height: 20px;
					stroke: white;
					fill: none;
				}
				.media-actions button:hover {
					background-color: white;
				}
				.media-actions button:hover svg {
					stroke: #777;
				}
				:host(.media-upload-hover) {
					border-color: lightgreen;
				}
				:host(.media-upload-wait) {
					cursor: wait;
				}
				.media-actions button.hidden,
				.hidden {
					display: none;
				}
			</style>
			<input id="media-input" type="file">
			<div class="media-types"></div>
			<img class="media-preview hidden" alt="Image Preview">
			<video controls class="media-preview hidden"></video>
			<div class="media-actions hidden">
				<button id="media-clear" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
				<button id="media-zoom" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M8 11H11M14 11H11M11 11V8M11 11V14" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 17L21 21" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
				<button id="media-add" class="hidden" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
				<button id="media-remove" class="hidden" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6 12H18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
			</div>`
	}

	connectedCallback() {
		// console.log('Component connected')
		if (!this.hasAttribute('types')) {
			this.setAttribute('types', this.#mediaAccepted.join(' '))
		}
		if (!this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0')
		}
		this.#connected = true
		this.#setElements()
		this.#updateMediaTypes()
		this.#updateSource()
		this.addEventListener('click', this.#onClick = () => {
			this.#mediaInput.click()
		})
		this.addEventListener('dragenter', this.#onDragEnter = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.classList.add('media-upload-hover')
		})
		this.addEventListener('dragover', this.#onDragOver = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.classList.add('media-upload-hover')
		})
		this.addEventListener('dragleave', this.#onDragLeave = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.classList.remove('media-upload-hover')
		})
		this.addEventListener('drop', this.#onDrop = (event) => {
			event.preventDefault()
			event.stopPropagation()
			// console.log('upload drop')
			const dt = event.dataTransfer
			if (dt.files.length !== 1) {
				console.error(dt.files.length > 1 ? 'More than one file dropped' : 'Invalid drop')
			} else {
				// console.log(dt.files)
				if (this.types.split(' ').includes(dt.files[0].type)) {
					this.#previewMedia(dt)
				} else {
					console.error('Invalid media type')
				}
			}
			this.classList.remove('media-upload-hover')
			this.focus()
		})
		this.#mediaInput.addEventListener('change', this.#onChange = () => {
			// console.log(this.#mediaInput.files)
			if (this.#mediaInput.value.length !== 0) {
				this.#previewMedia(this.#mediaInput)
			}
		})
		this.shadowRoot.getElementById('media-clear').addEventListener('click', this.#onClear = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.removeAttribute('value')
		})
		this.shadowRoot.getElementById('media-zoom').addEventListener('click', this.#onZoom = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.#zoomMedia()
		})
		this.shadowRoot.getElementById('media-remove').addEventListener('click', this.#onRemove = (event) => {
			event.preventDefault()
			event.stopPropagation()
			// console.log('Requested remove')
			this.dispatchEvent(this.#mediaUploadRemove)
		})
		this.shadowRoot.getElementById('media-add').addEventListener('click', this.#onAdd = (event) => {
			event.preventDefault()
			event.stopPropagation()
			// console.log('Requested add')
			this.dispatchEvent(this.#mediaUploadAdd)
		})
		this.addEventListener('keydown', this.#onKeyDown = (event) => {
			// console.log(`${this.id} key ${event.key} code ${event.code}`)
			switch (event.key) {
				case ' ':
					this.#mediaInput.click()
					break
				case 'Escape':
					if (document.getElementById('media-upload-zoom')) {
						document.getElementById('media-upload-zoom').remove()
					} else if (this.value) {
						this.removeAttribute('value')
					}
					break
				case 'z':
				case 'Z':
					if (this.value) {
						this.#zoomMedia()
					}
					break
				case '-':
					if (this.removable !== null) {
						this.dispatchEvent(this.#mediaUploadRemove)
					}
					break
				case '+':
					if (this.addable !== null) {
						this.dispatchEvent(this.#mediaUploadAdd)
					}
					break
			}
		})
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.#onClick)
		this.removeEventListener('dragenter', this.#onDragEnter)
		this.removeEventListener('dragover', this.#onDragOver)
		this.removeEventListener('dragleave', this.#onDragLeave)
		this.removeEventListener('drop', this.#onDrop)
		this.#mediaInput.removeEventListener('change', this.#onChange)
		this.shadowRoot.getElementById('media-clear').removeEventListener('click', this.#onClear)
		this.shadowRoot.getElementById('media-zoom').removeEventListener('click', this.#onZoom)
		this.shadowRoot.getElementById('media-remove').removeEventListener('click', this.#onRemove)
		this.shadowRoot.getElementById('media-add').removeEventListener('click', this.#onAdd)
		this.removeEventListener('keydown', this.#onKeyDown)
	}
}

MediaUpload.define()
