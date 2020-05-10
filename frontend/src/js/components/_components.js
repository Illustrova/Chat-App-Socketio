const EmojiPicker = require("./EmojiPicker.js");
const Login = require("./LoginModal.js");
const ProfileSidebar = require("./ProfileSidebar.js");
const Sidebar = require("./Sidebar.js");
const List = require("./List.js");
const Chat = require("./Chat.js");
const PromptModal = require("./PromptModal.js");
const Loader = require("./Loader.js");
const Search = require("./Search.js");
const Select = require("./Select.js");
const Navbar = require("./Navbar.js");
const Alert = require("./Alert.js");
const controller = require("./../AppController.js");

/** Components Library */
module.exports = {
	chat: () => new Chat(document.querySelector(".chat"), controller),
	emojiPicker: () =>
		new EmojiPicker(
			document.querySelector(".emoji-picker"),
			document.querySelector("#chatInput")
		),
	promptModal: () => new PromptModal(document.querySelector(".modal__prompt")),
	loader: () => new Loader(document.querySelector(".loader"), controller),
	search: () =>
		new Search(
			document.querySelector(".search__input"),
			[
				...document.querySelectorAll(".channel__list .list__item"),
				...document.querySelectorAll(".users__list .list__item"),
			],
			controller
		),
	channelList: () =>
		new List(document.querySelector(".channel__list"), controller, "channel"),
	usersList: () =>
		new List(document.querySelector(".users__list"), controller, "user"),
	profileSidebar: () =>
		new ProfileSidebar(
			document.querySelector(".profile"),
			{ btnOpen: document.querySelector(".link__profile--self") },
			controller
		),
	listsSidebar: () =>
		new Sidebar(
			document.querySelector(".sidebar"),
			{ btnToggle: document.querySelector(".navbar__burger") },
			controller
		),
	loginModal: () =>
		new Login(document.querySelector(".modal__login"), controller),
	statusSelect: () => new Select("#user_status"),
	navbar: () => new Navbar(document.querySelector(".navbar")),
	alert: () => new Alert(document.querySelector(".alert")),
};
