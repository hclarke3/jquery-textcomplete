// NOTE: TextComplete plugin has contenteditable support but it does not work
//       fine especially on old IEs.
//       Any pull requests are REALLY welcome.

+function ($) {
  'use strict';

  // ContentEditable adapter
  // =======================
  //
  // Adapter for contenteditable elements.
  function ContentEditable (element, completer, option) {
    this.initialize(element, completer, option);
  }

  $.extend(ContentEditable.prototype, $.fn.textcomplete.Adapter.prototype, {
    // Public methods
    // --------------

    // Update the content with the given value and strategy.
    // When an dropdown item is selected, it is executed.
    select: function (value, strategy, e) {
      var pre = this.getTextFromHeadToCaret();
      var sel = window.getSelection()
      var range = sel.getRangeAt(0);
      var selection = range.cloneRange();
      selection.selectNodeContents(range.startContainer);
      var content = selection.toString();
      var post = content.substring(range.startOffset);
      var newSubstr = strategy.replace(value, e);
      if ($.isArray(newSubstr)) {
        post = newSubstr[1] + post;
        newSubstr = newSubstr[0];
      }
      pre = pre.replace(strategy.match, newSubstr);

      // allow insertion of html elements
      if (this.el.isContentEditable) {
        range.selectNodeContents(range.startContainer);
        range.deleteContents();

        var dummy = document.createElement('span');
        dummy.innerHTML = '&nbsp;';
        range.insertNode(dummy);

        var fullText = pre + post;
        var elIdx = fullText.indexOf(newSubstr);

        // insertNode places nodes at the beginning of the range,
        // so insert everything after the new node first
        var postElTextNode = document.createTextNode(fullText.substr(elIdx + fullText.length + 1));
        range.insertNode(postElTextNode);

        // insert the new node
        var node = range.createContextualFragment(newSubstr);
        range.insertNode(node);

        // insert everything before the new node
        var preElTextNode = document.createTextNode(fullText.substr(0, elIdx));
        range.insertNode(preElTextNode);

        range.setStartAfter(dummy);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
      } else {
          this.$el.val(pre + post);
          this.el.selectionStart = this.el.selectionEnd = pre.length;
      }
    },

    // Private methods
    // ---------------

    // Returns the caret's relative position from the contenteditable's
    // left top corner.
    //
    // Examples
    //
    //   this._getCaretRelativePosition()
    //   //=> { top: 18, left: 200, lineHeight: 16 }
    //
    // Dropdown's position will be decided using the result.
    _getCaretRelativePosition: function () {
      var range = window.getSelection().getRangeAt(0).cloneRange();
      var node = document.createElement('span');
      range.insertNode(node);
      range.selectNodeContents(node);
      range.deleteContents();
      var $node = $(node);
      var position = $node.offset();
      position.left -= this.$el.offset().left;
      position.top += $node.height() - this.$el.offset().top;
      position.lineHeight = $node.height();
      $node.remove();
      var dir = this.$el.attr('dir') || this.$el.css('direction');
      if (dir === 'rtl') { position.left -= this.listView.$el.width(); }
      return position;
    },

    // Returns the string between the first character and the caret.
    // Completer will be triggered with the result for start autocompleting.
    //
    // Example
    //
    //   // Suppose the html is '<b>hello</b> wor|ld' and | is the caret.
    //   this.getTextFromHeadToCaret()
    //   // => ' wor'  // not '<b>hello</b> wor'
    getTextFromHeadToCaret: function () {
      var range = window.getSelection().getRangeAt(0);
      var selection = range.cloneRange();
      selection.selectNodeContents(range.startContainer);
      return selection.toString().substring(0, range.startOffset);
    }
  });

  $.fn.textcomplete.ContentEditable = ContentEditable;
}(jQuery);
