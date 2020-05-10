module.exports = class Sidebar {
	constructor(el, buttons, controller) {
		this.el = el;
		this.buttons = buttons;
		this.controller = controller;
	}
	setup() {
		// Elements
		this.contentContainer = this.el.querySelector(".sidebar__content");
		// Assign elements for buttons if selectors were provided, or default selectors used
		if (this.buttons) {
			this.btnClose =
				this.buttons.btnClose || this.el.querySelector(".sidebar__btn--close");
			this.btnOpen =
				this.buttons.btnOpen || this.el.querySelector(".sidebar__btn--open");
			this.btnToggle =
				this.buttons.btnToggle ||
				this.el.querySelector(".sidebar__btn--toggle");
		}

		// Setup button listeners
		this.btnClose
			? this.btnClose.addEventListener("click", () => this.close())
			: "";
		this.btnOpen
			? this.btnOpen.addEventListener("click", () => this.open())
			: "";
		this.btnToggle
			? this.btnToggle.addEventListener("click", () => this.toggle())
			: "";
		// Set initial state
		this.isOpen = this.el.classList.contains("sidebar--open") ? true : false;
	}

	/** Show sidebar */
	open() {
		this.controller.closeAllSidebars();
		this.el.classList.add("sidebar--open");
		if (this.btnToggle) this.btnToggle.classList.add("is-active");
		this.isOpen = true;
	}

	/** Hide sidebar */
	close() {
		this.el.classList.remove("sidebar--open");
		if (this.btnToggle) this.btnToggle.classList.remove("is-active");
		this.isOpen = false;
	}

	/** Toggle sidebar */
	toggle() {
		this.isOpen ? this.close() : this.open();
	}

	/**
	 * Set sidebar content inside the container element
	 * @param {String} html
	 */
	setContent(html) {
		this.contentContainer.innerHTML = html;
		if (!this.isOpen) this.open();
	}

	/**
	 * Display state of toggle button with updates
	 */
	displayUpdates() {
		this.btnToggle.classList.add("has-updates");
	}
	/**
	 * Reset state of toggle button
	 */
	resetUpdates() {
		this.btnToggle.classList.remove("has-updates");
	}
};
