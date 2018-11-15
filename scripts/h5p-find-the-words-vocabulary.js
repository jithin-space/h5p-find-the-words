(function (FindTheWords, EventDispatcher, $) {

  FindTheWords.Vocabulary = function (params) {

    this.words = params;

  };

  FindTheWords.Vocabulary.prototype = Object.create(EventDispatcher.prototype);
  FindTheWords.Vocabulary.prototype.constructor = FindTheWords.Vocabulary;

  FindTheWords.Vocabulary.prototype.appendTo = function ($container,vocMode) {

    // $container = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
    //self.game.drawWords(self.$vocabularyContainer);

    let output = '<div class="vocHeading"><i class="fa fa-book fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;Find the words</div><ul>';

    this.words.forEach(function (element) {
      let identifierName= element.replace(/ /g, '');
      output+= '<li><div id="'+ identifierName +'"class="word"><i class="fa fa-check" aria-hidden="true"></i>&nbsp;' + element + '</div></li>';
    });

    output += '</ul>';

    $container.html(output);
    $container.addClass('vocabulary-container');
    this.$container = $container;
    this.setMode(vocMode);

  };

  FindTheWords.Vocabulary.prototype.setMode = function (mode) {
    if (mode === 'inline') {
      this.$container.removeClass('vocabulary-block-container').addClass('vocabulary-inline-container');
    }
    else {
      this.$container.removeClass('vocabulary-inline-container').addClass('vocabulary-block-container');
    }
  }

  FindTheWords.Vocabulary.prototype.checkWord = function (word) {

    if ($.inArray(word,this.words) != -1) {
      const idName = word.replace(/ /g, '');
      this.$container.find('#' + idName).addClass('word-found');
      return true;
    }

    return false;

  };

  FindTheWords.Vocabulary.prototype.reset = function () {
    this.$container.find('.word').each(function () {
      $(this).removeClass('word-found').removeClass('word-solved');
    });
  };

  FindTheWords.Vocabulary.prototype.getNotFound = function () {
    return this.$container.find('.word').filter(function () {
      return !$(this).hasClass('word-found');
    }).map(function () {
      $(this).addClass('word-solved');
      return $(this).attr('id');
    }).get();
  };

  FindTheWords.Vocabulary.prototype.getFound = function () {
    return this.$container.find('.word').filter(function () {
      return $(this).hasClass('word-found') ;
    }).map(function () {
      return $(this).attr('id');
    }).get();
  };

  FindTheWords.Vocabulary.prototype.getSolved = function () {
    return this.$container.find('.word').filter(function () {
      return $(this).hasClass('word-solved') ;
    }).map(function () {
      return $(this).attr('id');
    }).get();
  };

  return FindTheWords.Vocabulary;

}) (H5P.FindTheWords, H5P.EventDispatcher, H5P.jQuery);
