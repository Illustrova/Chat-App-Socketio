module.exports = class Sidebar {
	constructor(el, buttons) {
		this.el = el;
		this.buttons = buttons;
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
    
    // Keep open if focused
    this.el.addEventListener("focusin", () => this.open());
    this.el.addEventListener("focusout", () => this.close())
	}

	/** Show sidebar */
	open() {
    if (this.isOpen) return;
		this.controller.closeAllSidebars();
    this.el.classList.add("sidebar--open");
    this.el.setAttribute("aria-hidden", "false");
		if (this.btnToggle) this.btnToggle.classList.add("is-active");
		this.isOpen = true;
	}

	/** Hide sidebar */
	close() {
    this.el.classList.remove("sidebar--open");
    this.el.setAttribute("aria-hidden", "true"); // since sidebar is not hidden with display: none, it requires aria-hidden attribute
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
