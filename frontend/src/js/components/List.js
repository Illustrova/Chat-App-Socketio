/** Base list component */
module.exports = class List {
	constructor(el, controller, itemName) {
		this.el = el;
		this.controller = controller;
		this.itemName = itemName;
	}

	/** Setup event listeners and set starting chat */
	setup() {
		// Elements
		this.itemsContainer = this.el.querySelector(".list__items");
		this.btnAdd = this.el.querySelector(".list__add");
		this.isActive = this.itemsContainer.querySelector(".list__item--active");
		//"Add new item" button
		this.btnAdd
			? this.btnAdd.addEventListener("click", () => this.createItem())
			: "";
		// Handle clicks on the list items
		this.itemsContainer.addEventListener("click", (e) => {
			e.stopPropagation();
			this.controller.resolveListItemClick(e.target);
		});
	}

	/**
	 * Update list contents
	 * @param {String} html
	 */
	update(html) {
		this.itemsContainer.innerHTML = html;
		this.setActive(this.itemsContainer.querySelector(".list__item--active"));
	}

	/**
	 * Create new item
	 */
	createItem() {
		this.controller.createItem(this.itemName);
	}

	/**
	 * Find item in current list by it'sname
	 * @param {String} name
	 * @returns {HTMLElement}
	 */
	findItem(name) {
		return this.itemsContainer.querySelector(
			`[data-${this.itemName}="${name}"]`
		);
	}

	/**
	 * Set currently active item
	 * @param {String} name
	 */
	setActiveItem(name) {
		let el = this.itemsContainer.querySelector(
			`[data-${this.itemName}="${name}"]`
		);
		this.resetActiveItem();
		this.setActive(el);
	}

	/**
	 * Remove/reset all active items
	 */
	resetActiveItem() {
		if (this.isActive) {
			this.isActive.classList.remove("list__item--active");
		}
		this.isActive = null;
	}

	/**
	 * Add active class to the element representing currently ative item
	 * @param {HTMLElement} el
	 */
	setActive(el) {
		if (el) {
			el.classList.add("list__item--active");
			this.isActive = el;
		}
	}

	/**
	 * Increment update counter when new message received
	 * @param {String} name
	 */
	incrementUpdates(name) {
		let item = this.findItem(name);
		item.dataset.updates = parseInt(item.dataset.updates) + 1;
	}

	/**
	 * Increment update counter when new message received
	 * @param {String} name
	 */
	resetUpdates(name) {
		this.findItem(name) && (this.findItem(name).dataset.updates = 0);
	}
};
