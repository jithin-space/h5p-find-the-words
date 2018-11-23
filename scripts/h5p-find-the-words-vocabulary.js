(function (FindTheWords, EventDispatcher, $) {

  FindTheWords.Vocabulary = function (params,showVocabulary) {

    this.words = params;
    this.showVocabulary = showVocabulary;
    this.wordsFound = [];
    this.wordsNotFound = [];
    this.wordsSolved = [];

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

    const reverse = word.split("").reverse().join("");
    const originalWord = ($.inArray(word,this.words) != -1)? word: ( $.inArray(reverse,this.words) != -1)? reverse:null;

    if (originalWord) {
      if ($.inArray(originalWord,this.wordsFound) === -1) {
        this.wordsFound.push(originalWord);
        if (this.showVocabulary) {
          const idName = originalWord.replace(/ /g, '');
          this.$container.find('#' + idName).addClass('word-found');
        }
        return true;
      }
      return false;
    }

    return false;

  };

  FindTheWords.Vocabulary.prototype.reset = function () {
    this.wordsFound = [];
    this.wordsNotFound = this.words;
    if (this.showVocabulary) {
      this.$container.find('.word').each(function () {
        $(this).removeClass('word-found').removeClass('word-solved');
      });
    }
  };

  FindTheWords.Vocabulary.prototype.solveWords = function () {
    const that = this;
    that.wordsSolved = that.wordsNotFound;
    if (that.showVocabulary) {
      that.wordsNotFound.forEach(function (word) {
        const idName = word.replace(/ /g, '');
        that.$container.find('#' + idName).addClass('word-solved');
      });
    }
  }

  FindTheWords.Vocabulary.prototype.getNotFound = function () {
    const that = this;

    this.wordsNotFound = this.words.filter(function (word) {
      return ($.inArray(word, that.wordsFound) === -1);
    });
    return this.wordsNotFound;

  };

  FindTheWords.Vocabulary.prototype.getFound = function () {
    const that = this;
    return this.words.filter(function (word) {
      return ($.inArray(word, that.wordsFound) !== -1);
    });
  };

  FindTheWords.Vocabulary.prototype.getSolved = function () {
    const that = this;
    return this.words.filter(function (word) {
      return ($.inArray(word, that.wordsSolved) !== -1);
    });
  };

  return FindTheWords.Vocabulary;

}) (H5P.FindTheWords, H5P.EventDispatcher, H5P.jQuery);
