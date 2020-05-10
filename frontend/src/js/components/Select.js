require("dropkickjs/dist/dropkick.js");

/** Search component for lists sidebar */
// eslint-disable-next-line no-undef
module.exports = class Select extends Dropkick {
	constructor(select, options) {
		super(select, options);
		this.announceChanges = false;
	}
	setup() {
		if (this.announceChanges) {
			this.sel.addEventListener("change", () => {
				this.controller.updateUserData("status", this.value);
			});
		}
	}
};
