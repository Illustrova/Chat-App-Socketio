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

/** Components Library */
module.exports = {
	chat: () => new Chat(document.querySelector(".chat")),
	emojiPicker: () =>
		new EmojiPicker(
			document.querySelector(".emoji-picker"),
			document.querySelector("#chatInput")
		),
	promptModal: () => new PromptModal(document.querySelector(".modal__prompt")),
	loader: () => new Loader(document.querySelector(".loader")),
	search: () =>
		new Search(
			document.querySelector(".search__input"),
			[
				...document.querySelectorAll(".channel__list .list__item"),
				...document.querySelectorAll(".users__list .list__item"),
			],
		),
	channelList: () =>
		new List(document.querySelector(".channel__list"), "channel"),
	usersList: () =>
		new List(document.querySelector(".users__list"), "user"),
	profileSidebar: () =>
		new ProfileSidebar(
			document.querySelector(".profile"),
			{ btnOpen: document.querySelector(".link__profile--self") },
		),
	listsSidebar: () =>
		new Sidebar(
			document.querySelector(".sidebar"),
			{ btnToggle: document.querySelector(".navbar__burger") },
		),
	loginModal: () =>
		new Login(document.querySelector(".modal__login")),
	statusSelect: () => new Select("#user_status"),
	navbar: () => new Navbar(document.querySelector(".navbar")),
	alert: () => new Alert(document.querySelector(".alert")),
};
