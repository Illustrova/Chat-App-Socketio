module.exports = {
	autoProcessQueue: false,
	autoDiscover: false,
	clickable: ".dropzone__avatar",
	url: "/login",
	maxFilesize: 0.5, // MB
	maxFiles: 1,
	uploadMultiple: false,
	acceptedFiles: "image/*",
	resizeWidth: 150,
	resizeHeight: 150,
	resizeMethod: "crop",
	previewsContainer: ".dropzone__avatar",
	previewTemplate: `<div class="dropzone__preview">
			<img class="dropzone__thumbnail" data-dz-thumbnail>
			<button class="btn btn--remove avatar__btn btn--iconsmall" data-dz-remove>
				<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" version="1" viewBox="0 0 299 299">
					<path d="M299 30L268 0 149 119 30 0 0 30l119 119L0 268l30 31 119-119 119 119 31-31-119-119z"/>
				</svg>
			</button>`,
	dictFileTooBig: "File is too big (limit: 500 KB)",
	dictInvalidFileType: "Only images, please",
	dictResponseError: "Error {{statusCode }}",

	init: function () {
		/** Display error message and reject file	 */
		this.on("error", function (file, responseText, xhr) {
			if (!xhr) {
				// Silent this error and replace the file
				if (responseText == this.options.dictMaxFilesExceeded) {
					return;
				}
				this.removeFile(file);
				this.element.querySelector(
					".dropzone__message--error"
				).textContent = responseText;
			} else {
				responseText = null;
			}
		});
		/** Replace file */
		this.on("maxfilesexceeded", function (file) {
			this.removeAllFiles();
			this.addFile(file);
		});
		/**	 Reset error message when new files dropped */
		this.on("addedfile", function () {
			if (this.files.length > 0) {
				this.element.querySelector(".dropzone__message--error").textContent =
					"";
			}
		});
		this.on("reset", function () {
			this.element.querySelector(".dropzone__message--error").textContent = "";
		});
	},
};
