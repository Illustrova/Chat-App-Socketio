/** Alert component */

module.exports = class Navbar {
	constructor(el, controller) {
		this.el = el;
		this.controller = controller;
	}
	setup() {}

	/** Display alert */
	showAlert() {
		this.el.classList.add("alert--open");
	}

	/** Hide alert */
	hideAlert() {
		this.el.classList.remove("alert--open");
	}
};
