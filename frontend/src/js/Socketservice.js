const SIGNAL = require("../../../config.yaml").variables.socketio;

module.exports = class SocketService {
	constructor(socket, appController) {
		this.socket = socket;
		this.controller = appController;
		this.init();
	}

	init() {
		this.socket.on("connect", () => this.controller.onConnected());
		this.socket.on("disconnect", () => this.controller.onDisconnected());

		this.socket.on(SIGNAL.APP.LOADED, () => this.controller.onAppLoaded());

		this.socket.on(SIGNAL.CHANNELS.UPDATE.ANNOUNCE, () =>
			this.socket.emit(SIGNAL.CHANNELS.UPDATE.REQUEST)
		);

		this.socket.on(SIGNAL.CHANNELS.UPDATE.HTML, (html) =>
			this.controller.onChannelsUpdated(html)
		);

		this.socket.on(SIGNAL.USERS.UPDATE.ANNOUNCE, () =>
			this.socket.emit(SIGNAL.USERS.UPDATE.REQUEST)
		);

		this.socket.on(SIGNAL.USERS.UPDATE.HTML, (html) =>
			this.controller.onUsersUpdated(html)
		);

		this.socket.on(SIGNAL.CHAT.HTML, (data) =>
			this.controller.onChatLoaded(data.chat, data.html)
		);

		this.socket.on(SIGNAL.PROFILE.HTML, (html) =>
			this.controller.onProfileLoaded(html)
		);

		this.socket.on(SIGNAL.MESSAGE.RECEIVED, (data) =>
			this.controller.onMessageReceived(data.chat, data.message)
		);

		this.socket.on(SIGNAL.USERDATA.STATUS.UPDATED, (data) =>
			this.controller.onStatusChange(data.username, data.status)
		);
	}

	/**
	 * Send request with channel name to server and await feedback
	 * @param {String} channel
	 * @returns {Promise}
	 */
	createChannel(channel) {
		return new Promise((resolve) => {
			this.socket.once(SIGNAL.CHANNELS.CREATE.ERROR, (msg) => {
				this.socket.off(SIGNAL.CHANNELS.CREATE.SUCCESS);
				return resolve({ success: false, errorMessage: msg });
			});
			this.socket.once(SIGNAL.CHANNELS.CREATE.SUCCESS, (channel) => {
				this.socket.off(SIGNAL.CHANNELS.CREATE.ERROR);

				return resolve({ success: true, channel: channel });
			});
			this.socket.emit(SIGNAL.CHANNELS.CREATE.NEW, channel);
		});
	}

	/**
	 * Track the name of chat user currently viewing
	 * @param {String} chatname
	 */
	updateCurrentChat(chatname) {
		this.socket.emit(SIGNAL.CURRENT_CHAT.UPDATED, chatname);
	}

	/**
	 * Join channel
	 * @param {String} channel
	 */
	joinChannel(channel) {
		this.socket.emit(SIGNAL.CHANNELS.JOIN, channel);
	}

	/**
	 * Load chat (request hml of previos messages from server)
	 * @param {String} chatname
	 */
	loadChat(chatname) {
		this.socket.emit(SIGNAL.CHAT.LOAD, chatname);
	}

	/**
	 * Request profile HTML
	 * @param {String} name user/channel name
	 * @param {Boolean} self
	 */
	getProfile(name, self) {
		this.socket.emit(SIGNAL.PROFILE.LOAD, name, self);
	}

	/**
	 * Update user dataat backend
	 * @param {String} key
	 * @param {String} value
	 */
	updateUserData(key, value) {
		this.socket.emit(SIGNAL.USERDATA.UPDATE, key, value);
	}

	/**
	 * @param {String} chat name of chat
	 * @param {String} message
	 * @param {String} timestamp
	 */
	sendMessage(chat, message, timestamp) {
		this.socket.emit(SIGNAL.MESSAGE.SEND, chat, message, timestamp);
	}
};
