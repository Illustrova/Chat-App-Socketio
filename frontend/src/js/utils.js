const OPTIONS = require("../../../config.yaml").options;

//
/**
 * Get cursor position in input
 * Source: https://stackoverflow.com/a/4812022
 * @param {HTMLElement} element
 * @returns {Number}
 */
const getCaretCharacterOffsetWithin = function (element) {
	var caretOffset = 0;
	var doc = element.ownerDocument || element.document;
	var win = doc.defaultView || doc.parentWindow;
	var sel;
	if (typeof win.getSelection != "undefined") {
		sel = win.getSelection();
		if (sel.rangeCount > 0) {
			var range = win.getSelection().getRangeAt(0);
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}
	} else if ((sel = doc.selection) && sel.type != "Control") {
		var textRange = sel.createRange();
		var preCaretTextRange = doc.body.createTextRange();
		preCaretTextRange.moveToElementText(element);
		preCaretTextRange.setEndPoint("EndToEnd", textRange);
		caretOffset = preCaretTextRange.text.length;
	}
	return caretOffset;
};

/**
 * Helper functions to setup caret  in contenteditable nodes,
 * from https://stackoverflow.com/a/6242538
 * @param {HTMLElement} node
 * @returns {Array} - array of text nodes
 */
function getTextNodesIn(node) {
	var textNodes = [];
	if (node.nodeType == 3) {
		textNodes.push(node);
	} else {
		var children = node.childNodes;
		for (var i = 0, len = children.length; i < len; ++i) {
			textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
		}
	}
	return textNodes;
}

/**
 * set selection in input element
 *
 * @param {HTMLElement} el - target element
 * @param {Number} start - start of selection
 * @param {Number} end - end of selection
 */
const setSelectionRange = function (el, start, end) {
	if (document.createRange && window.getSelection) {
		var range = document.createRange();
		range.selectNodeContents(el);
		var textNodes = getTextNodesIn(el);
		var foundStart = false;
		var charCount = 0,
			endCharCount;

		for (var i = 0, textNode; (textNode = textNodes[i++]); ) {
			endCharCount = charCount + textNode.length;
			if (
				!foundStart &&
				start >= charCount &&
				(start < endCharCount ||
					(start == endCharCount && i <= textNodes.length))
			) {
				range.setStart(textNode, start - charCount);
				foundStart = true;
			}
			if (foundStart && end <= endCharCount) {
				range.setEnd(textNode, end - charCount);
				break;
			}
			charCount = endCharCount;
		}

		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else if (document.selection && document.body.createTextRange) {
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(el);
		textRange.collapse(true);
		textRange.moveEnd("character", end);
		textRange.moveStart("character", start);
		textRange.select();
	}
};

/**
 *
 * Reove children text nodes
 * @param {HTMLElement} el
 * @returns
 */
const removeTextChildren = function (el) {
	return Array.from(el.childNodes).forEach((node) => {
		// text nodes have type 3
		if (node.nodeType === 3) {
			node.parentNode.removeChild(node);
		}
	});
};

/**
 *
 * Replace ISO formaytted dates in given HTML string
 * Regex from: https://github.com/moment/moment/blob/8e6c9b9b56379385c5e99fe5d216f8f6559ec70d/src/lib/create/from-string.js#L10

 * @param {String} html
 * @returns String
 */
const replaceISODates = function (html) {
	// eslint-disable-next-line no-useless-escape
	const extendedIsoRegex = /\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/g;

	let parsedHtml = html;
	Array.from(html.matchAll(extendedIsoRegex), (m) => m[0]).forEach((m) => {
		parsedHtml = parsedHtml.replace(m, convertDate(m.trim()));
	});
	return parsedHtml;
};

/**
 *
 * Format date sting, uses global OPTIONS varibale
 * @param {String} date
 * @returns {Date}
 */
const convertDate = function (date) {
	var options = OPTIONS.dateformat;
	return new Date(date).toLocaleString(undefined, options);
};

exports.getCaretCharacterOffsetWithin = getCaretCharacterOffsetWithin;
exports.setSelectionRange = setSelectionRange;
exports.removeTextChildren = removeTextChildren;
exports.replaceISODates = replaceISODates;
exports.convertDate = convertDate;
