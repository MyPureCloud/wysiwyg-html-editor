"use strict";

const Quill = require("quill");
const EventEmitter = require("eventemitter3");

/**
 *  Constructs an Editor (a thin wrapper around QuillJS)
 *  Should use the Builder to construct one of these
 *  @constructor
 *  @param {HTMLElement} targetEl - the DOM node that will be converted into the WYSIWYG editor
 *  @param {Object} options - the options provided to QuillJS
 */

function Editor(targetEl, options) {
    const quill = new Quill(targetEl, options);
    const emitter = new EventEmitter();

    this.targetEl = targetEl;
    this._quill = quill;
    this._emitter = emitter;

    /**
     * Text change event, fired whenever the contents of the editor have changed
     * @event Editor#text-change
     */

    quill.on("text-change", function () {
        emitter.emit("text-change");
    });

    // Override the default link tooltip logic to prepend `https://`
    const Link = Quill.import('formats/link');
    Link.sanitize = function(url) {
        // modify url if desired
        const urlStartsWithHttp = url.indexOf("http") === 0;
        if(!urlStartsWithHttp) {
            url = `https://${url}`;
        }
        return url;
    };
}

/**
 * Returns the contents of the editor as html
 * @returns {String}
 *
 */
Editor.prototype.getHTML = function() {
    const editorContentDiv = this.targetEl.querySelector(".ql-editor");
    if(!editorContentDiv) {
        throw new Error("Couldn't find editor contents");
    }

    //Set the margin and padding on each paragraph tag to be zero.  The Quill CSS makes its paragraphs
    // look like this inside the editor; adding it as explicit style will make the output HTML
    // visually match the editor better.
    const tmpDiv = document.createElement("div");
    tmpDiv.innerHTML = editorContentDiv.innerHTML;
    for (const paragraph of tmpDiv.querySelectorAll("p")) {
        paragraph.style.margin = 0;
        paragraph.style.padding = 0;
    }
    return tmpDiv.innerHTML;
};

/**
 * Replaces the contents of the editor with specified html
 * @param {String} html
 */
Editor.prototype.setHTML = function(html) {
    html = html || ""; //Cooerce undefined or null to empty string to prevent error from pasteHTML
    this._quill.pasteHTML(html);
};

/**
 * Removes formatting from a beginning at an index
 */
Editor.prototype.removeFormat = function (index, length) {
    this._quill.removeFormat(index, length);
};

/**
 * Inserts html into the editor
 * @param {String} html
 * @param {number} index - the index (based on text content) to insert the html;
                           defaults to appending html to the end, after the trailing newline
 * @example
 * //Inserted before existing contents
 * editor.insertHTML("HODOR", 0);
 * //Inserted after last line of existing contents
 * editor.insertHTML("HODOR");
 * //Inserted at the end of the last line of existing contents (before trailing newline)
 * editor.insertHTML("HODOR", editor.getLength() - 1);
 */
Editor.prototype.insertHTML = function (html, index) {
    if (!index && index !== 0) {
        index = this.getLength();
    }
    this._quill.pasteHTML(index, html);
};

/**
 * Inserts text with an optional formatting parameter into the Editor.  This is useful when creating spans or other blots
 * that have a specific purpose and formatting
 *
 ```
 editor.insertText("COMPANY_NAME", "placeholder", editor.getSelection(true).index);
 ```
 * This will wrap the string in inputString in the tag and style/attribute specified in the placeholder blot
 * see: http://quilljs.com/docs/api/#content
 *
 * @param text The String to be wrapped by the custom wrapper
 * @param name The name of the blot or object with formats to use for wrapping the text in the first parameter.
 * @param index the point at which the formatting wrapped text should be inserted.
 */
Editor.prototype.insertText = function (text, name, index) {
    if (!index && index !== 0) {
        index = this.getLength();
    }

    this._quill.insertText(index, text, name, true);
};

/**
 * Deletes text from the editor based on the passed in index and length
 * @param index start index
 * @param length length of deletion
 */
Editor.prototype.deleteText = function (index, length) {
    this._quill.deleteText(index, length);
};

/**
 * Get the contents of the editor with the html stripped out
 * @returns {String}
 */
Editor.prototype.getText = function () {
    return this._quill.getText();
};

/**
 * Get the length of the Editor text content
 * @returns {number}
 */

Editor.prototype.getLength = function () {
    return this._quill.getLength();
};

/**
 * Returns true if the editor is empty
 * @returns {Boolean}
 */
Editor.prototype.isBlank = function () {
    return this._quill.editor.isBlank();
};

/**
 * Returns an object representing the selection state if the editor is focused, otherwise `null`
 * @param forceFocus if true, the editor will be focused, otherwise it might return `null`
 * @returns {null | Object} Returned object (if any) has two properties, `index` and `length` indicating the start and length of the selection
 */
Editor.prototype.getSelection = function (forceFocus) {
    return this._quill.getSelection(forceFocus);
};

/**
 * Set the selection to the index and through the length specified
 * @param index the beginning index of the selection
 * @param length the length of the selection range
 * @returns {*}
 */
Editor.prototype.setSelection = function (index, length) {
    return this._quill.setSelection(index, length);
};

/**
 * See [EventEmitter.on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener)
 */

Editor.prototype.on = function() {
    this._emitter.on.apply(this._emitter, arguments);
};

/**
 * See [EventEmitter.removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener)
 */

Editor.prototype.off = function() {
    this._emitter.off.apply(this._emitter, arguments);
};

/**
 * See [EventEmitter.once](https://nodejs.org/api/events.html#events_emitter_once_eventname_listener)
 */

Editor.prototype.once = function() {
    this._emitter.once.apply(this._emitter, arguments);
};

module.exports = Editor;
