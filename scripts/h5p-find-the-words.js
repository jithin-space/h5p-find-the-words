H5P.FindTheWords = (function ($, UI) {

  function FindTheWords(options, id, extras) {
    this.id = id;
    this.extras = extras;

    this.numFound = 0;

    // TODO : fill default parameters
    this.options = $.extend(true,{},options);

    H5P.EventDispatcher.call(this);


    this.registerDOMElements();




  }

  FindTheWords.prototype = Object.create(H5P.EventDispatcher.prototype);
  FindTheWords.prototype.constructor = FindTheWords;


  //private and all prototype function goes there

  FindTheWords.prototype.registerDOMElements = function () {

    this.wordGrid = new FindTheWords.WordGrid(this.options);
    //TODO : separate vocabulary as a separate class
    this.vocabulary = new FindTheWords.Vocabulary(this.options);


    this.$timer = $('<div/>',{
      class: 'time-status',
      html: '<span role="term" ><i class="fa fa-clock-o" aria-hidden="true"></i>'
       + this.options.l10n.timeSpent + '</span >'+
        '<span role="definition"  class="h5p-time-spent" >0:00</span>'
    });

    //TODO need to replace it with proper initial value
    // TODO l10n.found rename
    this.$counter= $('<div/>', {
      class: 'counter-status',
      html: '<div role="term" ><span class="h5p-counter">0</span>of <span>total</span> found</div>'
    });

    this.timer = new FindTheWords.Timer(this.$timer.find('.h5p-time-spent'));
    this.counter = new FindTheWords.Counter(this.$counter.find('.h5p-counter'));

    // TODO : new elements handle DOM accordingly

    this.$feedback = $('<div/>',{
      classs: 'feedback-element',
      tabindex: '0'
    });

    this.$progressBar = UI.createScoreBar(this.vocabulary.length, 'scoreBarLabel');

    // TODO: $checkPuzzleButton rename & callback handling
    this.$submitButton = this.createButton('submit', 'check', this.params.l10n.checkAnswer, this.gameSubmitted);
    if (this.options.behaviour.enableSolution) {
      this.$showSolutionButton = this.createButton('solution', 'eye', this.params.l10n.showSolution, this.showSolutions);
    }
    if (this.params.behaviour.enableRetry) {
      this.$retryButton = this.createButton('retry', 'undo', this.params.l10n.tryAgain, this.resetTask);
    }




    this.$footerContainer = $('<div class="footer-container" />');
    this.$statusContainer = $('<div class="game-status"/>');
    this.$feedbackContainer = $('<div class="sequencing-feedback"/>');
    this.$buttonContainer = $('<div class="sequencing-feedback-show" />');
  };




  FindTheWords.prototype.createButton = function (name, icon, param, callback) {
    return UI.createButton({
      title: name,
      click: callback,
      html: '<span><i class="fa fa-'+icon+'" aria-hidden="true"></i></span>&nbsp;' +
              param
    });
  };



  FindTheWords.prototype.attach = function ($container) {

    this.$container = $container.addClass('h5p-find-the-words');

    if (this.options.taskDescription) {
      this.$container.html('<div class="h5p-task-description" >' + this.options.taskDescription + '</div>');
    }

    this.$gameContainer = $('<div/>',{
      class: 'game-container'
    });

    if (this.wordGrid) {
      this.wordGrid.appendTo(this.$gameContainer);
    }
    if (this.options.behaviour.showVocabulary) {
      this.vocabulary.appendTo(this.$gameContainer);
    }

    this.$timer.appendTo(this.$statusContainer);
    this.$counter.appendTo(this.$statusContainer);

    this.$feedback.appendTo(this.$feedbackContainer);
    this.$progressBar.appendTo(this.$feedbackContainer);

    this.$submitButton.appendTo(this.$buttonContainer);


    //append status and feedback and button containers to footer
    this.$statusContainer.appendTo(this.$footerContainer);
    this.$feedbackContainer.appendTo(this.$footerContainer);
    this.$buttonContainer.appendTo(this.$footerContainer);

    //append description , cards and footer to main container.
    this.$taskDescription.appendTo(this.$container);
    this.$gameContainer.appendTo(this.$container);
    this.$gameContainer.appendTo(this.$container);

  }




  return FindTheWords;

}) (H5P.jQuery, H5P.JoubelUI);
