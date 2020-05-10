/** Search component for lists sidebar */
module.exports = class Search {
	constructor(el, items, controller) {
		this.el = el;
		this.items = items;
		this.controller = controller;
	}
	setup() {
		// Evaluate on key press
		this.el.addEventListener("keyup", () => this.filterItems(this.el.value));
	}

	/**
	 * Displays only items matching search string
	 * @param {String} value
	 */
	filterItems(value) {
		this.resetFilter();
		this.items.forEach((i) => {
			if (
				!i
					.querySelector(".list__link")
					.dataset.chat.toLowerCase()
					.includes(value.toLowerCase())
			) {
				i.classList.add("list__item--hidden");
			}
		});
	}

	/** Resets all filters */
	resetFilter() {
		this.items.forEach((i) => i.classList.remove("list__item--hidden"));
	}
};
