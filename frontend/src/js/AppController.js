const compLib = require("./components/_components.js");
const SocketService = require("./Socketservice.js");
const utils = require("./utils.js");

const BLANK_PIXEL = require("../../../config.yaml").assets.BLANK_PIXEL;
const promptContentChannel = require("../../../config.yaml").content.modal
	.prompt.channel;

// Define components used per each page (route)
const pageComponents = {
	"/": [
		"chat",
		"emojiPicker",
		"promptModal",
		"search",
		"channelList",
		"usersList",
		"listsSidebar",
		"profileSidebar",
		"loader",
		"navbar",
		"alert",
	],
	"/login": ["loginModal", "statusSelect"],
};

module.exports = class App {
	constructor() {
		this.components = {};
		this.socketService = new SocketService(
			// eslint-disable-next-line no-undef
			io(location.protocol + "//" + document.domain + ":" + location.port, {
				transports: ["websocket"],
			}),
			this
		);
		this.connected = false;
		this.init();
	}

	init() {
		pageComponents[window.location.pathname].forEach((c) => {
			this.components[c] = compLib[c]();
			this.components[c].controller = this;
			this.components[c].setup();
		});
		if (window.location.pathname === "/") {
			this.socketService.socket;
			this.saveAvatars();
		}
	}

	/** CALLBACKS FOR SOCKETIO SIGNALS FROM SERVER **/

	onConnected() {
		this.connected = true;
		this.components.alert && this.components.alert.hideAlert();
	}

	onDisconnected() {
		this.connected = false;
		this.components.alert && this.components.alert.showAlert();
	}

	/** Connect socket and redirect to the main page */
	onLoginSuccess() {
		this.socketService.socket.connect();
		window.location.href = "/";
	}

	/**
	 * Update list of channels
	 * @param {String} html
	 */
	onChannelsUpdated(html) {
		this.components.channelList.update(html);
		this.components.search.filterItems(this.components.search.el.value);
	}

	/**
	 * Update list of users
	 * @param {String} html
	 */
	onUsersUpdated(html) {
		this.components.usersList.update(html);
		this.saveAvatars();
	}

	/**
	 * Format dates and load chat contents into the DOM
	 * @param {String} chatname
	 * @param {String} html
	 */
	onChatLoaded(chatname, html) {
		let formattedHtml = utils.replaceISODates(html);
		this.components.chat.loadChat(chatname, formattedHtml);
		this.components.chat.viewChat(chatname);
	}

	/**
	 * Load and display user profile HTML
	 * @param {String} html
	 */
	onProfileLoaded(html) {
		this.components.profileSidebar.setContent(html);
	}

	/**
	 * @param {String} username
	 * @param {String} status
	 */
	onStatusChange(username, status) {
		let userItem = this.components.usersList.findItem(username);
		if (userItem) userItem.dataset.status = status;
		if (this.components.chat.getChatName() == "user:" + username) {
			this.components.chat.setChatStatus(status);
		}
	}

	/**
	 * @param {String} chatname
	 * @param {Object} data
	 */
	onMessageReceived(chatname, data) {
		this.components.chat.addMessage(
			chatname,
			data.message,
			utils.convertDate(data.timestamp),
			data.sender
		);
		chatname.startsWith("user:")
			? this.components.usersList.incrementUpdates(data.sender)
			: this.components.channelList.incrementUpdates(chatname);

		this.components.listsSidebar.displayUpdates();
		if (chatname === this.components.chat.isActive.dataset.chat) {
			setTimeout(() => {
				this.components.usersList.resetUpdates(chatname.substring(5));
				this.components.channelList.resetUpdates(chatname);
			}, 2000);
		}
	}
	/**
	 * Close loader when app is ready
	 */
	onAppLoaded() {
    // quick fix for problem of cnverting dates in static template loaded from server. Definitely not a good solution.
    // It's important not to modify chatBody properties itself, because we need to store a valid reference to chatBody
    [...this.components.chat.chatBody.children].forEach(child => child.innerHTML = utils.replaceISODates(child.innerHTML)); 
		this.components.loader.close();
	}

	/** END OF CALLBACKS FOR SOCKETIO SIGNALS FROM SERVER **/

	/**
	 * Get user data on client side (from localStorage)
	 * @returns {Object} userdata
	 */
	getUserData() {
		return {
			username: localStorage.getItem("user_name"),
			user_avatar: localStorage.getItem("user_avatar")
				? localStorage.getItem("user_avatar")
				: BLANK_PIXEL,
			user_location: localStorage.getItem("user_location") || "Unknown",
			user_status: localStorage.getItem("user_status"),
		};
	}

	/**
	 * Save updated data locally and send to backend
	 * @param {String} key
	 * @param {String} value
	 */
	updateUserData(key, value) {
		localStorage.setItem(key, value); //update locally
		this.socketService.updateUserData("user_" + key, value);
		if (key === "user_avatar") {
			this.components.chat.setUserAvatar();
			this.components.navbar.setUserAvatar();
		}
		if (key === "status") {
			if (value === "offline") {
				this.socketService.socket.disconnect();
			} else {
				this.socketService.socket.connect();
			}
		}
	}

	/** Store avatar src attributes in App props */
	saveAvatars() {
		let users = this.components.usersList.el.getElementsByTagName("li");
		let avatars = {};
		[...users].map((user) => {
			avatars[user.dataset.user] = user.querySelector("img").src;
		});
		this.avatars = avatars;
	}

	/**
	 * Close all sidebars
	 */
	closeAllSidebars() {
		this.components.profileSidebar.close();
		this.components.listsSidebar.close();
	}

	/**
	 * Send message and timestamp to the server and add it to the chat on the client side
	 * @param {String} chat
	 * @param {String} message
	 */
	sendMessage(chat, message) {
		if (this.connected) {
			let timestamp = new Date(Date.now()).toISOString();
			this.socketService.sendMessage(chat, message, timestamp);
			this.components.chat.addMessage(
				chat,
				message,
				utils.convertDate(timestamp)
			);
		}
	}

	/**
	 * Resolve to a suitable method for creating new item in list
	 * This method is needed to keep List component abstract
	 * @param {String} item
	 * @returns {Function}
	 */
	createItem(item) {
		return item == "channel" ? this.createChannel() : "";
	}

	/**
	 * Async method, contains 2 async stages:
	 * - Prompts for channel name and wait until user provide it
	 * - Sends it to erver and awaits feeedback
	 */
	async createChannel() {
		if (this.connected) {
			let promptContent = promptContentChannel;
			this.components.promptModal
				.prompt(promptContent)
				.then((data) => {
					return this.socketService.createChannel(data.channel_name);
				})
				.then((response) => {
					if (response.success) {
						this.components.promptModal.close();
					} else {
						this.components.promptModal.displayError(response.errorMessage);
						this.components.promptModal.removeAllCustomListeners();
						return this.createChannel();
					}
				})
				// eslint-disable-next-line no-console
				.catch((err) => console.log("Error creating channel: ", err));
		}
	}

	/**
	 * Handle list item clicks, depending on the type of item
	 * @param {HTMLElement} target
	 */
	resolveListItemClick(target) {
		if (target.matches(".list__link[data-chat]")) {
			let chat = target.dataset.chat;
			let status = target.parentNode.dataset.status;
			this.viewChat(chat, status);
		} else if (target.classList.contains("channel__btn-join")) {
			let item = target.closest(".list__link").dataset.chat;
			this.joinChannel(item);
		}
	}

	/**
	 * Announce to server that user joined channel
	 * @param {String} channel
	 */
	joinChannel(channel) {
		if (this.connected) {
			this.socketService.joinChannel(channel);
		}
	}

	/**
	 * Check if the chat contents is already loaded and display it
	 * @param {String} chatname
	 */
	viewChat(chatname, status) {
		if (this.components.chat.loaded.has(chatname)) {
			this.socketService.updateCurrentChat(chatname);
			this.components.chat.viewChat(chatname);
		} else {
			this.loadChat(chatname);
		}
		//Set active item in the active list
		if (chatname.startsWith("user:")) {
			this.components.usersList.setActiveItem(chatname.substring(5));
			this.components.channelList.resetActiveItem();
			this.components.usersList.resetUpdates(chatname.substring(5));
		} else {
			this.components.channelList.setActiveItem(chatname);
			this.components.usersList.resetActiveItem();
			this.components.channelList.resetUpdates(chatname);
		}
		this.components.listsSidebar.resetUpdates();
		if (status) {
			this.components.chat.setChatStatus(status);
		} else {
			this.components.chat.setChatStatus("");
		}
		this.closeAllSidebars();
	}

	/**
	 * Request chat contents from server
	 * @param {String} chatname
	 */
	loadChat(chatname) {
		if (this.connected) {
			this.socketService.loadChat(chatname);
		}
	}

	/**
	 * Display profile, if it's user's own profile; otherwise request data from server
	 * @param {String} username
	 * @param {Boolean} [self=false]
	 */
	viewProfile(username, self = false) {
		if (self) {
			username = this.getUserData().username;
		}
		if (this.connected) {
			this.socketService.getProfile(username, self);
		}
	}
};
