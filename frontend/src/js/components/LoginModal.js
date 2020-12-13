const Modal = require("./Modal.js");
const Dropzone = require("dropzone/dist/dropzone.js");
const avatarDropzoneOptions = require("./dropzoneOptions.js");
const BLANK_PIXEL = require("../../../../config.yaml").assets.BLANK_PIXEL;
const locator = require("../Locationservice");
const UPLOADS_PATH = "";

Dropzone.autoDiscover = false;

/** Extended modal component, displayed on login */
module.exports = class Login extends Modal {
	constructor(el) {
		super(el);
		this.el = el;
	}

	setup() {
		// Elements
		this.formel = this.el.querySelector("form");
		this.nameInput = this.el.querySelector(".login__name");
		this.locationInput = this.el.querySelector(".login__location");
		this.locationSource = this.el.querySelector(".login__location-source");
		this.locationEdit = this.el.querySelector(".login__location-edit");
		this.locateBtn = this.el.querySelector(".login__locate-btn");
		this.submitBtn = this.el.querySelector(".login__submit");
		super.setup();
		this.prefillData();
		localStorage.getItem("user_location") ? "" : this.getLocation();

		/**
		 * Action on form submit.
		 * NOTE: Form submit invoked by dropzone component, and form data attached automatically
		 */
		this.formel.addEventListener("submit", (e) => {
			e.preventDefault();
			this.clearError(); //clear error message, if any
			this.sendLoginData();
		});

		// On click enable location input, so user can edit it manually
		this.locationEdit.addEventListener("click", (e) => {
			e.preventDefault();
			this.locationInput.disabled = false;
			this.locationInput.focus();
		});
		// On click attempts to detect user location using HTML5 Geolocation API
		this.locateBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.getLocationByGeo();
		});
		// Init Dropzone component which stores and processes avatar image
		this.dropzone = new Dropzone("#loginForm", avatarDropzoneOptions);
		this.initDropzone();
	}

	initDropzone() {
		this.dropzone.on("success", () => {
			this.controller.onLoginSuccess();
			this.close();
		});
		this.dropzone.on("error", (file, message, xhr) => {
			if (xhr) {
				// Handle case when file was attempted to send to server and server responded with error
				switch (xhr.status) {
					case 409:
					case 422:
						this.displayError(message);
						break;
					default:
						this.displayError("Server error, please reload page and try again");
				}
			}
		});
	}

	/**
	 * Get form data and saves it to localStorage as well as send to server
	 */
	sendLoginData() {
		let username;
		// Enable location input in order to include it in formdata
		this.locationInput.disabled = false;

		let fd = new FormData(this.formel);
		localStorage.clear();
		// Save form data in LocalStorage
		for (let e of fd.entries()) {
			localStorage.setItem(e[0], e[1]);
			if (e[0] === "user_name") username = e[1];
		}
		// If user provided an image file
		if (this.dropzone.getQueuedFiles().length > 0) {
			//Rename file before upload. Can't use built-in dropzone method, because it's called on files added, when username is not set yet.
			let file = this.dropzone.files[0];
			this.dropzone.files[0].upload.filename = `avatar_${username}_${new Date().getTime()}${file.name.substring(
				file.name.lastIndexOf(".")
			)}`;

			this.dropzone.processQueue();
			let avatarPath = this.dropzone.getAcceptedFiles()[0]
				? UPLOADS_PATH + this.dropzone.getAcceptedFiles()[0].upload.filename
				: BLANK_PIXEL;

			localStorage.setItem("user_avatar", avatarPath);
		} else {
			// Needs to upload a mockfile in order to get formdata submitted
			// Solution source: https://stackoverflow.com/a/48264036
			var blob = new Blob();
			blob.upload = { chunked: this.dropzone.defaultOptions.chunking };
			blob.upload.filename = "mockfile";
			this.dropzone.uploadFile(blob);
		}
	}

	/** Check if user data saved in local storage and prefill form */
	prefillData() {
		let userData = this.controller.getUserData();
		userData.username ? (this.nameInput.value = userData.username) : "";
		userData.user_location
			? (this.locationInput.value = userData.user_location)
			: "";
	}

	/** Asynchronously attempt to detect user location by IP address */
	getLocation() {
		locator
			.getByIP()
			.then((locationData) => this.displayLocation(locationData, "ip"))
			.catch((err) => {
				throw Error(err);
			});
	}

	/** Asynchronously attempt to detect user location by IP address */
	getLocationByGeo() {
		locator
			.getByGeo()
			.then((locationData) => this.displayLocation(locationData, "geo"))
			.catch((err) => {
				throw Error(err);
			});
	}

	/**
	 * Fill location input and display the data source
	 * @param {String} location
	 * @param {String} locSource
	 */
	displayLocation(location, locSource) {
		this.locationInput.value = location.city;
		location.region ? (this.locationInput.value += `, ${location.region}`) : "";
		location.country
			? (this.locationInput.value += `, ${location.country}`)
			: "";
		this.displayLocationSource(locSource);
	}

	/**
	 * Display location source message depnding on the method location data was obtained
	 * @param {String} locSource
	 */
	displayLocationSource(locSource) {
		let locationSourceText;
		switch (locSource) {
			case "ip":
				locationSourceText =
					"Autodetected based on your IP" + String.fromCharCode(160); //&nbsp
				break;
			case "geo":
				locationSourceText =
					"Autodetected based on your geolocation" + String.fromCharCode(160);
				break;
			default:
				locationSourceText = "";
		}
		this.locationSource.textContent = locationSourceText;
	}
};
