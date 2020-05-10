const Sidebar = require("./Sidebar.js");
const Select = require("./Select.js");
const Dropzone = require("dropzone/dist/dropzone.js");
Dropzone.autoDiscover = false;
const avatarDropzoneOptions = require("./dropzoneOptions.js");
const BLANK_PIXEL = require("../../../../config.yaml").assets.BLANK_PIXEL;

/** Profile sidebar component, extending base sidebar */
module.exports = class ProfileSidebar extends Sidebar {
	constructor(el, buttons, controller) {
		super(el, buttons);
		this.controller = controller;
	}
	setup() {
		super.setup();
		// Elements
		this.editBtns = this.el.querySelectorAll(".profile__edit");
		this.statusDropdown = this.el.querySelector(".profile__status");

		// Listeners
		this.el.addEventListener("click", (e) => {
			e.preventDefault();
			if (e.target.classList.contains("profile__edit")) {
				let field = e.target.parentNode.querySelector("input");
				this.editField(e.target, field);
			}
		});
	}

	/** Setup dropzone element  */
	setupDropzone() {
		// Init Dropzone component which stores and processes avatar image
		if (this.el.querySelector("#profileAvatar")) {
			this.dropzone = new Dropzone("#profileAvatar", avatarDropzoneOptions);
			this.dropzone.options.autoProcessQueue = true;
			this.dropzone.options.url = "/upload";
			this.attachDropzoneListeners();
			this.setAvatarToDropzone(this.dropzone.previewsContainer.dataset.src);
		}
	}

	attachDropzoneListeners() {
		let username = this.profileName;
		this.dropzone.options.renameFile = (file) =>
			`avatar_${username}_${new Date().getTime()}${file.name.substring(
				file.name.lastIndexOf(".")
			)}`;
		this.dropzone.on("success", (file) => {
			this.controller.updateUserData("user_avatar", file.upload.filename);
		});
		this.dropzone.on("error", (file, message, xhr) => {
			if (xhr) {
				// Handle case when file was attempted to send to server and server responded with error
				switch (xhr.status) {
					case 409:
					case 422:
						this.el.querySelector(
							".dropzone__message--error"
						).textContent = message;
						break;
					default:
						this.el.querySelector(".dropzone__message--error").textContent =
							"Server error, please reload page and try again";
				}
			}
		});
	}

	/** Setup status select element  */
	setupSelect() {
		if (document.querySelector("#user_status")) {
			this.select = new Select("#user_status");
			this.select.announceChanges = true;
			this.select.controller = this.controller;
			this.select.setup();
		}
	}

	/**
	 * Set profile content
	 * @param {string} html
	 */
	setContent(html) {
		super.setContent(html);
		this.profileName = this.el.querySelector(".profile__name").value;

		this.setupSelect();
		this.setupDropzone();
	}

	/**
	 * Set avatar prevew to dropzone
	 * @param {string} src
	 */
	setAvatarToDropzone(src) {
		if (src !== BLANK_PIXEL) {
			// Add mockfile to dropzone to preserve max files limit
			let mockfile = {
				name: "mockfile",
				accepted: true,
			};
			this.dropzone.files.push(mockfile);
			// Solution: https://stackoverflow.com/questions/25687209/how-do-i-programmatically-add-a-thumbnail-to-dropzone
			this.dropzone.emit("addedfile", mockfile);
			this.dropzone.emit("thumbnail", mockfile, src);
		}
	}

	/**
	 * Make field editable
	 * @param {HTMLElement} btn - button element
	 * @param {HTMLElement} field - field element
	 */
	editField(btn, field) {
		field.disabled = false;
		field.focus();
		btn.style.display = "none";
		field.addEventListener("blur", () => this.lockField(btn, field), {
			once: true,
		});
	}

	/**
	 * Prevent field editing
	 * @param {HTMLElement} btn - button element
	 * @param {HTMLElement} field - field element
	 */
	lockField(btn, field) {
		field.disabled = true;
		btn.style.display = "block";
		this.sendData(field);
	}

	/**
	 * Send data to server
	 * @param {HTMLElement} field
	 */
	sendData(field) {
		let name = field.getAttribute("name");
		let value = field.value;
		localStorage.setItem(name, value);
		this.controller.updateUserData(name, value);
	}
};
