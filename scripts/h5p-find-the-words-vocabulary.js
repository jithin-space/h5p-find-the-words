(function (FindTheWords, EventDispatcher, $) {

  FindTheWords.Vocabulary = function (params) {

    this.params = params;

  };

  FindTheWords.Vocabulary.prototype = Object.create(EventDispatcher.prototype);
  FindTheWords.Vocabulary.prototype.constructor = FindTheWords.Vocabulary;

  return FindTheWords.Vocabulary;

}) (H5P.FindTheWords, H5P.EventDispatcher, H5P.jQuery);
