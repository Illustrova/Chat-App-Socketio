const Modal = require("./Modal.js");
const utils = require("../utils");

/** Prompt modal component, receives and processes user input */
module.exports = class PromptModal extends Modal {
	constructor(el, content) {
		super(el);
		this.content = content;
		this.customListeners = [];
	}
	setup() {
		super.setup();
		this.modalAlertEl = this.el.querySelector(".modal__alert");

		this.formel.addEventListener("submit", (e) => {
			e.preventDefault();
			let replyEvent = new CustomEvent("reply", {
				detail: this.createReply(),
			});
			this.el.dispatchEvent(replyEvent);
		});
	}

	/**
	 * Creates a data object from form data
	 * @returns {Object}
	 */
	createReply() {
		let fd = new FormData(this.formel);
		let data = {};
		for (let [key, prop] of fd) {
			data[key] = prop;
		}
		return data;
	}

	/**
	 * Set modal text/contents
	 * @param {object} content object, each key represents a class selector of a section without prefix ("modal__")
	 */
	setContent(content) {
		this.content = content;
		Object.keys(this.content).forEach((item) => {
			let value = this.content[item];
			let targetEl = this.el.querySelector(`.modal__${item}`);

			if (Array.isArray(value)) {
				if (value.length === 1) {
					value = value[0];
				}
				if (item === "input-group") {
					let input = targetEl.querySelector("input");
					input.setAttribute("name", value.name);
					input.setAttribute("type", value.type || "text");
					let labelText = document.createTextNode(value.label);
					targetEl.querySelector("label").prepend(labelText);
				}
			}
			if (typeof value === "string" || value instanceof String) {
				targetEl.textContent = value;
			}
		});
	}

	/** Reset modal contents */
	clearContent() {
		Object.keys(this.content).forEach((item) => {
			let targetEl = this.el.querySelector(`.modal__${item}`);

			if (item === "input-group") {
				let input = targetEl.querySelector("input");
				input.setAttribute("name", "");
				input.setAttribute("type", "text");
				input.value = "";
				utils.removeTextChildren(targetEl.querySelector("label"));
			} else if (typeof item === "string" || item instanceof String) {
				targetEl.textContent = "";
			}
		});
		this.clearError();
	}

	/** Close modal and reset content and listeners */
	close() {
		super.close();
		this.clearContent();
		this.removeAllCustomListeners(this.customListeners);
	}

	/**
	 * Open modal, set content and attach listeners
	 * @param {Object} content
	 * @returns {Promise}
	 */
	prompt(content) {
		if (content) this.setContent(content);
		this.open();
		this.el.querySelector("input").focus();
		return new Promise((resolve, reject) => {
			const onReply = (e) => resolve(e.detail);
			const onClose = () => reject("Modal closed");

			this.attachListener(this.el, onReply, "reply");
			this.attachListener(this.el, onClose, "close");
		});
	}

	/**
	 * addEventListener wrapper, tracks al listeners for component
	 * @param {HTMLElement} el
	 * @param {Function} cb
	 * @param {String} event
	 */
	attachListener(el, cb, event) {
		el.addEventListener(event, cb);
		this.customListeners.push({ el: el, cb: cb, event: event });
	}

	/**
	 * Remove particular listener
	 * @param {HTMLElement} el
	 * @param {Function} cb
	 * @param {String} event
	 */
	removeListener(el, cb, event) {
		el.removeEventListener(event, cb, { once: true });
	}

	/** Remove all custom listeners */
	removeAllCustomListeners() {
		for (let l of this.customListeners) {
			this.removeListener(l.el, l.cb, l.event);
		}
		this.customListeners = [];
	}

	/**
	 * Set error message
	 * @param {String} message
	 */
	displayError(message) {
		this.modalAlertEl.textContent = message;
	}

	/** Clear error message */
	clearError() {
		this.modalAlertEl.textContent = "";
	}
};
