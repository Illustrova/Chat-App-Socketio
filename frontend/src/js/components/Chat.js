const Autolinker = require("autolinker");
const BLANK_PIXEL = require("../../../../config.yaml").assets.BLANK_PIXEL;
const SVG_CHANNEL = require("../../../../config.yaml").assets.SVG.CHANNEL;

/** Chat component */
module.exports = class Chat {
	constructor(el, controller) {
		this.el = el;
		this.controller = controller;
	}

	setup() {
		// Elements
		this.chatName = this.el.querySelector(".chat__name");
		this.chatMessages = this.el.querySelectorAll("ul.chat__messages");
		this.chatBody = this.el.querySelector(".chat__content");
		this.userAvatar = this.el.querySelector(".inputarea__avatar--self");
		this.chatAvatar = this.el.querySelector(".inputarea__avatar--chat");
		this.btnSend = this.el.querySelector(".inputarea__submit");
		this.messageInput = this.el.querySelector(".inputarea__input");
		this.messageTemplate = document.getElementById("template__message");
		this.isActive = this.el.querySelector(".chat__messages--active");
		this.profileLinks = this.el.querySelectorAll(".link--profile");
		// Keep track of loaded chats
		this.loaded = new Set([...this.chatMessages].map((el) => el.dataset.chat));
		// Scroll state
		this.scrolled = false;
		// Send message button
		this.btnSend
			? this.btnSend.addEventListener("click", (e) => {
					e.preventDefault();
					this.sendMessage();
			  })
			: "";
		// Open profile buttons
		[...this.profileLinks].forEach((link) =>
			link.addEventListener("click", (e) => {
				this.controller.viewProfile(
					this.getChatName(),
					e.target.classList.contains("link__profile--self")
				);
			})
		);

		// Handle scroll position
		this.chatBody.addEventListener("scroll", () => (this.scrolled = true));
		this.updateScroll();

		twemoji.parse(this.el); // eslint-disable-line no-undef
		this.isActive.innerHTML = Autolinker.link(this.isActive.innerHTML);
	}

	/** Set scroll position in message container to bottom, unless the user had scrolled it manually. */
	updateScroll() {
		if (!this.scrolled) {
			this.chatBody.scrollTop = this.chatBody.scrollHeight;
		}
	}

	/**
	 * Add chat html to the DOM
	 * @param {string} chatname
	 * @param {string} html
	 */
	loadChat(chatname, html) {
		this.chatBody.insertAdjacentHTML("afterbegin", Autolinker.link(html));
		this.loaded.add(chatname);
	}

	/**
	 * Set name in chat header
	 * @param {string} chatname
	 */
	setChatName(chatname) {
		if (chatname.startsWith("user:")) {
			chatname = chatname.substring(5);
		}
		this.chatName.textContent = chatname;
	}

	/**
	 * Set status data-attribute in chat header
	 * @param {string} chatname
	 */
	setChatStatus(status) {
		this.chatName.dataset.status = status;
	}

	/**
	 * Get name of active chat
	 * @param {string} name - chat name
	 * @return {string}
	 */
	getChatName() {
		if (this.isActive) {
			return this.isActive.dataset.chat;
		}
	}

	/** Set user avatar at input area */
	setUserAvatar() {
		let data = this.controller.getUserData();
		this.userAvatar.dataset.letter = data["username"]
			.substring(0, 1)
			.toUpperCase();
		this.userAvatar.getElementsByTagName("img")[0].src = data["user_avatar"];
	}

	/** Find and set chat avatar at input area */
	setChatAvatar() {
		const chatname = this.getChatName();

		let chatAvatarSrc;
		// If current chat is private chat with single user
		if (chatname.startsWith("user:")) {
			const username = chatname.substring(5);
			chatAvatarSrc = this.controller.avatars[username];
			// If user didn't provide avatar image, set data-letter attribute as first letter of user's name
			if (chatAvatarSrc == BLANK_PIXEL) {
				let letter = username.substring(0, 1).toUpperCase();
				this.chatAvatar.dataset.letter = letter;
			}
		}
		// If current chat is public channel
		else {
			chatAvatarSrc = SVG_CHANNEL;
			this.chatAvatar.dataset.letter = "";
		}
		this.chatAvatar.getElementsByTagName("img")[0].src = chatAvatarSrc;
	}

	/**
	 * Setup all elements, when active chat is changed
	 * @param {string} name - chat name
	 */
	viewChat(chatname) {
		this.setChatName(chatname);
		this.viewMessages(chatname);
		this.setUserAvatar();
		this.setChatAvatar();
		this.scrolled = false;
		this.updateScroll();
		this.messageInput.innerText = "";
	}

	/**
	 * View chat messages and set active chat
	 * @param {string} chatname
	 */
	viewMessages(chatname) {
		if (this.isActive) this.isActive.classList.remove("chat__messages--active");
		let el = this.chatBody.querySelector(`[data-chat="${chatname}"]`);
		el.classList.add("chat__messages--active");
		this.isActive = el;
	}

	/** Sending new message: get message from input area and pass to controller */
	sendMessage() {
		if (this.controller.connected) {
			let message = this.messageInput.innerText;
			if (this.messageInput.innerText.length > 0) {
				this.controller.sendMessage(this.getChatName(), message);
			}
			this.messageInput.innerText = "";
			this.scrolled = false;
		}
	}

	/**
	 * Receiving new message: receive message from the controller and append to the chat
	 * @param {string} chatname
	 * @param {string} message
	 * @param {string} timestamp
	 * @param {string} sender - optional; if absent, this is an outcoming message and the sender is the current user
	 */
	addMessage(chatname, message, timestamp, sender) {
		if (this.loaded.has(chatname)) {
			let newMessage = this.messageTemplate.cloneNode(true).content;

			// Select message template elements
			const messageTextNode = newMessage.querySelector(".contact__message");
			const datetimeNode = newMessage.querySelector(".contact__date");
			const senderNameNode = newMessage.querySelector(".contact__name");
			const senderAvatar = newMessage.querySelector(".contact__avatar");
			const senderAvatarImage = newMessage.querySelector(
				".contact__avatar img"
			);

			messageTextNode.innerHTML = Autolinker.link(message);
			datetimeNode.textContent = timestamp;

			// if sender not defined, assume it's outgoing message
			if (sender) {
				senderNameNode.textContent = sender;
				senderAvatar.dataset.letter = sender.substring(0, 1);
				senderAvatarImage.src = this.controller.avatars[sender];
			} else {
				let userData = this.controller.getUserData();
				senderNameNode.textContent = userData.username;
				senderAvatar.dataset.letter = userData.username.substring(0, 1);

				senderAvatarImage.src = userData.user_avatar;
				newMessage.querySelector(".message").classList.add("message--self");
			}
			let el = this.chatBody.querySelector(`[data-chat="${chatname}"]`);
			twemoji.parse(newMessage); // eslint-disable-line no-undef
			el.appendChild(newMessage);
			this.updateScroll();
		}
	}
};
