'use strict'

class ProgressBar extends HTMLElement {
	static define(tag = 'progress-bar') {
		customElements.define(tag, this)
	}

	static get observedAttributes() {
		return ['value', 'max', 'gradient', 'nostripes']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			switch (name) {
				case 'value':
					this.#updateValue()
					break
				case 'max':
					this.#updateValue()
					break
				case 'gradient':
					this.#updateGradient()
					break
				case 'nostripes':
					this.#updateStripes()
					break
			}
		}
	}

	get value() {
		return Number(this.getAttribute('value'))
	}

	set value(value) {
		this.setAttribute('value', Number(value) < this.max ? value : this.max)
	}

	get max() {
		return Number(this.getAttribute('max'))
	}

	set max(value) {
		this.setAttribute('max', Number(value))
	}

	get gradient() {
		return (this.getAttribute('gradient'))
	}

	set gradient(value) {
		this.setAttribute('gradient', value)
	}

	get nostripes() {
		return this.hasAttribute('nostripes')
	}

	set nostripes(value) {
		this.toggleAttribute('nostripes', value)
	}

	#updateValue() {
		this.shadowRoot.querySelector('span').style.width = `${(this.value * 100) / this.max}%`
		if (this.value === this.max) {
			this.shadowRoot.querySelector('span').classList.add('finished')
		} else {
			this.shadowRoot.querySelector('span').classList.remove('finished')
		}
	}

	#updateGradient() {
		if (this.gradient !== '') {
			this.shadowRoot.querySelector('span').style.backgroundImage = this.gradient
		}
	}

	#updateStripes() {
		if (this.nostripes) {
			this.shadowRoot.querySelector('span').classList.add('nostripes')
		} else {
			this.shadowRoot.querySelector('span').classList.remove('nostripes')
		}
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
					display: block;
					height: 1em;
					position: relative;
					background-color: inherit;
					border-radius: 1.5625em;
					padding: 0.15em;
					box-shadow: inset 0 -1px 1px rgb(255 255 255 / 30%);
				}
				:host span {
					display: block;
					height: 100%;
					border-radius: 1.25em 0.5em 0.5em 1.25em;
					background-color: rgb(43, 194, 83);
					background-image: linear-gradient(rgb(43 194 83) 37%, rgb(84 240 84) 69%);
					box-shadow: inset 0 2px 9px rgb(255 255 255 / 30%), inset 0 -2px 6px rgb(0 0 0 / 40%);
					position: relative;
					overflow: hidden;
				}
				:host span:after {
					content: "";
					position: absolute;
					top: 0;
					left: 0;
					bottom: 0;
					right: 0;
					background-image: linear-gradient(-45deg, rgb(255 255 255 / 20%) 25%, transparent 25%, transparent 50%, rgb(255 255 255 / 20%) 50%, rgba(255 255 255 / 20%) 75%, transparent 75%, transparent);
					z-index: 1;
					background-size: 2em 2em;
					animation: move 2s linear infinite;
					border-radius: 1.25em 0.5em 0.5em 1.25em;
					overflow: hidden;
				}
				:host span.finished {
					border-radius: 1.25em;
				}
				:host span.finished:after {
					border-radius: 1.25em;
				}
				:host span.nostripes:after {
					background-image: none;
				}
				@keyframes move {
					0% { background-position: 0 0; }
					100% { background-position: 2em 2em; }
				}
			</style>
			<span></span>`
	}

	connectedCallback() {
		if (!this.hasAttribute('max')) {
			this.setAttribute('max', '100')
		}
		if (!this.hasAttribute('value')) {
			this.setAttribute('value', '0')
		}
	}
}

ProgressBar.define()
