/** Loader component */
module.exports = class Loader {
	constructor(el, controller) {
		this.el = el;
		this.controller = controller;
	}

	setup() {}

	open() {
		if (!document.body.classList.contains("is-blurred")) {
			document.body.classList.add("is-blurred");
		}

		if (!this.el.classList.contains("loader--open")) {
			this.el.classList.add("loader--open");
		}
	}

	close() {
		if (document.body.classList.contains("is-blurred")) {
			document.body.classList.remove("is-blurred");
		}

		if (this.el.classList.contains("loader--open")) {
			this.el.classList.add("fade-out");
			this.el.addEventListener(
				"transitionend",
				() => this.el.classList.remove("fade-out", "loader--open"),
				{ once: true }
			);
		}
	}
};
