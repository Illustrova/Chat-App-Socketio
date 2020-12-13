/** Navbar component */

module.exports = class Navbar {
	constructor(el) {
		this.el = el;
	}
	setup() {
		this.user = this.el.querySelector(".navbar__user");
		this.alert = this.el.querySelector(".navbar__alert");
	}

	/** Set user avatar in navbar */
	setUserAvatar() {
		let data = this.controller.getUserData();
		this.user.querySelector(".avatar img").letter = data["username"]
			.substring(0, 1)
			.toUpperCase();
		this.user.querySelector(".avatar img").src = data["user_avatar"];
	}
	/** Display alert */
	showAlert() {
		this.alert.classList.add("navbar__alert--open");
	}

	/** Hide alert */
	hideAlert() {
		this.alert.classList.remove("navbar__alert--open");
	}
};
