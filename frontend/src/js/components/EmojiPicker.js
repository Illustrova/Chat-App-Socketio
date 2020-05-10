const utils = require("../utils");

module.exports = class EmojiPicker {
	constructor(el, input) {
		this.el = el;
		this.input = input;
	}

	setup() {
		// Elements
		this.btn = this.el.querySelector(".emoji-picker__btn");
		this.popover = this.el.querySelector(".emoji-picker__popover");
		this.tabs = this.el.querySelectorAll(".emoji-picker__navitem");
		this.emojiGroups = this.el.querySelectorAll(".emoji-picker__group");
		this.activeTab = this.el.querySelector(".emoji-picker__navitem");
		this.activeGroup = this.el.querySelector(".emoji-picker__group");

		// Open/close popover on click
		this.btn.addEventListener("click", () => this.togglePicker());
		// Resolve click on container (switch tab/write emoji)
		this.popover.addEventListener("click", (e) => {
			if (e.target.nodeName === "IMG") {
				const emoji = e.target.parentElement.dataset.unicode;
				this.write(emoji);
			} else if (e.target.nodeName === "A") {
				this.toggleTabs(e.target);
			}
		});

		// Close on click outside of popover
		this.popover.addEventListener("blur", (e) => {
			if (e.relatedTarget !== this.btn) this.hidePicker();
		});
		// Close on escape key pressed
		this.popover.addEventListener("keydown", (e) => {
			if (e.key === "Escape") this.hidePicker();
		});
	}

	/** Open/close popover */
	togglePicker() {
		this.popover.classList.toggle("emoji-picker__popover--open");
		this.popover.focus();
	}

	/** Close popover */
	hidePicker() {
		this.popover.classList.remove("emoji-picker__popover--open");
	}

	/**
	 * Add emoji to inputarea
	 * @param {String} emoji
	 */
	write(emoji) {
		this.input.focus();
		if (!this.input) {
			return;
		}
		let val;
		let offset;
		if (this.input.nodeName === "INPUT" || this.input.nodeName === "TEXTAREA") {
			val = this.input.value;
			offset = this.input.selectionStart;
			let newVal = val.substring(0, offset) + emoji + val.substring(offset);
			this.input.value = newVal;
			utils.setSelectionRange(offset + emoji.length, offset + emoji.length);
		} else {
			val = this.input.textContent;
			offset = utils.getCaretCharacterOffsetWithin(this.input);
			let newVal = val.substring(0, offset) + emoji + val.substring(offset);
			this.input.textContent = newVal;
			utils.setSelectionRange(
				this.input,
				offset + emoji.length,
				offset + emoji.length
			);
		}
	}

	/**
	 * Toggle tabs with emoji categories
	 * @param {HTMLElement} newTab
	 */
	toggleTabs(newTab) {
		if (newTab !== this.activeTab) {
			let groupNum = newTab.dataset.targetgroup;

			// Activate tab
			this.activeTab.classList.remove("emoji-picker__navitem--active");
			newTab.classList.add("emoji-picker__navitem--active");
			this.activeTab = newTab;

			// Display group
			let newGroup = Array.from(this.emojiGroups).find(
				(gr) => gr.dataset.group === groupNum
			);
			this.activeGroup.classList.remove("emoji-picker__group--active");
			newGroup.classList.add("emoji-picker__group--active");
			this.activeGroup = newGroup;
		}
	}
};
