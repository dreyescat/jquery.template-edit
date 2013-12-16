(function ($, undefined) {
  'use strict';

  var insertAtCaret = function (element, text) {
    if (element.selectionStart !== undefined) {
      var prefix = element.value.slice(0, element.selectionStart);
      var suffix = element.value.slice(element.selectionEnd);
      element.value = prefix + text + suffix;
      element.selectionStart += text.length;
      element.selectionEnd = element.selectionStart;
    } else if (document.selection) {
      element.focus();
      var sel = document.selection.createRange();
      sel.text = text;
    } else {
      element.value += text;
    }
    element.focus();
  };

  $.fn.templateEdit = function (options) {
    return this.each(function () {
      var $this = $(this);
      var $variables = $this.find('.template-variables li');
      var $source = $this.find('.template-source');
      var $output = $this.find('.template-output').contents().find('body');

      var output = function () {
        // NOTE: Mustache.render can throw Errors due to still 
        // incomplete templates. Ignore or try/catch them?
        $output.html(Mustache.render($source.val(), opts.variables));
      };

      // Extend/Override the default options with those provided either as
      // data attributes or function parameters.
      // Those provided as parameter prevail over the data ones.
      var opts = $.extend({}, $.fn.templateEdit.defaults, $this.data(), options);

      // HTML .template-variables variables override options and defaults ones.
      $variables.each(function () {
        var $variable = $(this);
        var name = $variable.text();
        var value = $variable.data('value');
        opts.variables[name] = value || '';
      });
      // Update source and output every time a new variable is introduced.
      $variables.on('click', function () {
        // Insert variable name at the cursor position surrounded by the delimiters.
        insertAtCaret($source[0], opts.delimiters.join($(this).text()));
        output();
        return false;
      });

      // Update output every time a key is pressed.
      // NOTE: Maybe should be refined to only those key presses that
      // generate a new text value.
      $source.on('keyup', function () {
        output();
      });
    });
  };

  // Plugin defaults.
  $.fn.templateEdit.defaults = {
    // Add data-auto-init=false to disable auto-init.
    autoSelector: '.template-edit[data-auto-init!=false]',
    delimiters: ['{{', '}}'],
    variables: {
        title: 'Mr',
        name: 'John',
        surname: 'Doe'
      }
  };

  $(function () {
    $($.fn.templateEdit.defaults.autoSelector).templateEdit();
  });
}(jQuery));
