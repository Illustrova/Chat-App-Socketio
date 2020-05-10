/** Base modal component */
module.exports = class Modal {
	constructor(el) {
		this.el = el;
	}

	setup() {
		this.modalAlertEl = this.el.querySelector(".modal__alert");
		this.closeBtn = this.el.querySelector(".modal__close");
		this.submitBtn = this.el.querySelector(".modal__submit");
		this.formel = this.el.querySelector("form");
		this.closeBtn
			? this.closeBtn.addEventListener("click", () => {
					this.close();
			  })
			: "";
	}

	/** Show modal */
	open() {
		if (!document.body.classList.contains("is-blurred")) {
			document.body.classList.add("is-blurred");
		}

		if (!this.el.classList.contains("modal--open")) {
			this.el.classList.add("modal--open");
		}
	}

	/** Hide modal */
	close() {
		if (document.body.classList.contains("is-blurred")) {
			document.body.classList.remove("is-blurred");
		}

		if (this.el.classList.contains("modal--open")) {
			this.el.classList.remove("modal--open");
		}
	}

	/** Display error message */
	displayError(msg) {
		this.modalAlertEl.textContent = msg;
	}

	/** Hide error message */
	clearError() {
		this.modalAlertEl.textContent = "";
	}
};
