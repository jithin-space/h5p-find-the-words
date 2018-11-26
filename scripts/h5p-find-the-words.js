H5P.FindTheWords = (function ($, UI) {

  const ELEMENT_MIN_SIZE = 32; // PX
  const ELEMENT_MAX_SIZE = 64; // PX
  const MARGIN = 8; //PX
  const VOCABULARY_INLINE_WIDTH = 200;//

  function FindTheWords(options, id, extras) {
    this.id = id;
    this.extras = extras;
    this.numFound = 0;


    // TODO : fill default parameters

    //only take the unique words
    const vocabulary = options.wordList.split(',').filter(function (word,pos,self) {
      return self.indexOf(word)=== pos;
    });

    this.options = $.extend(true,{
      vocabulary: vocabulary,
      height: 5,
      width: 5,
      fillBlanks: true,
      maxAttempts: 3
    },options);


    H5P.EventDispatcher.call(this);

    this.gridParams = {
      height: this.options.height,
      width: this.options.width,
      orientations: filterOrientations(options.behaviour.orientations),
      fillBlanks: this.options.fillBlanks,
      maxAttempts: this.options.maxAttempts,
      preferOverlap: options.behaviour.preferOverlap,
      vocabulary: this.options.vocabulary,
      gridActive: true,
      fillPool: this.options.behaviour.fillPool
    }

    this.grid = new FindTheWords.WordGrid(this.gridParams);
    //TODO : separate vocabulary as a separate class
    this.vocabulary = new FindTheWords.Vocabulary(this.options.vocabulary,this.options.behaviour.showVocabulary);

    this.registerDOMElements();

    this.on('resize', function () {

      const currentSize = this.elementSize;
      const currentVocMod = this.vocMode;
      this.calculateElementSize();
      this.setVocabularyMode();

      if (this.elementSize !== currentSize) {
        this.$puzzleContainer.empty();
        this.grid.appendTo(this.$puzzleContainer,this.elementSize );
        this.grid.drawGrid(MARGIN);

        //if there are already marked elements on the grid mark them
        if (!this.grid.options.gridActive) {
          this.grid.enableGrid();
          this.grid.mark(this.vocabulary.getFound());
          this.grid.disableGrid();
          this.grid.mark(this.vocabulary.getSolved());
        }
        else {
          this.grid.mark(this.vocabulary.getFound());
        }

        this.registerGridEvents();

      }
      if (this.options.behaviour.showVocabulary) {
        if (currentVocMod !== this.vocMode ) {
          this.vocabulary.setMode(this.vocMode);
          if (this.vocMode === 'block') {
            this.$puzzleContainer.removeClass('puzzle-inline').addClass('puzzle-block');
          }
          else {
            this.$puzzleContainer.removeClass('puzzle-block').addClass('puzzle-inline');
            //initial update has to be done manually
            this.$playArea.css({'width':parseInt(this.$gameContainer.width())+VOCABULARY_INLINE_WIDTH});
          }
        }

      }

      if (this.vocMode === 'inline') {
        this.$playArea.css({'width':parseInt(this.$gameContainer.width())+2});
      }
      else {
        this.$playArea.css({'width':parseInt(this.$puzzleContainer.width())+2});
      }

    });



  }

  FindTheWords.prototype = Object.create(H5P.EventDispatcher.prototype);
  FindTheWords.prototype.constructor = FindTheWords;


  //private and all prototype function goes there

  const filterOrientations = function (directions) {
    return Object.keys(directions).filter(function (key) {
      return directions[key];
    });
  };



  FindTheWords.prototype.registerDOMElements = function () {

    const that = this;


    this.$timer = $('<div/>',{
      class: 'time-status',
      tabindex: 0,
      html: '<span role="term" ><i class="fa fa-clock-o" ></i>&nbsp;&nbsp;'
       + this.options.l10n.timeSpent + '</span >:&nbsp;&nbsp;'+
        '<span role="definition"  class="h5p-time-spent" >0:00</span>'
    });

    //TODO need to replace it with proper initial value
    // TODO l10n.found rename
    this.$counter= $('<div/>', {
      class: 'counter-status',
      tabindex: 0,
      html: '<div role="term" ><span role="definition" class="h5p-counter">0</span>&nbsp;of&nbsp;<span>&nbsp;'+this.vocabulary.words.length+'&nbsp;</span> found</div>'
    });

    this.timer = new FindTheWords.Timer(this.$timer.find('.h5p-time-spent'));
    this.counter = new FindTheWords.Counter(this.$counter.find('.h5p-counter'));

    // TODO : new elements handle DOM accordingly

    this.$feedback = $('<div/>',{
      classs: 'feedback-element',
      tabindex: '0'
    });

    this.$progressBar = UI.createScoreBar(this.vocabulary.words.length, 'scoreBarLabel');

    // TODO: $checkPuzzleButton rename & callback handling
    that.$submitButton = that.createButton('submit', 'check', that.options.l10n.check, that.gameSubmitted);
    if (this.options.behaviour.enableShowSolution) {
      this.$showSolutionButton = this.createButton('solution', 'eye', this.options.l10n.showSolution, that.showSolutions);
    }
    if (this.options.behaviour.enableRetry) {
      this.$retryButton = this.createButton('retry', 'undo', this.options.l10n.tryAgain, that.resetTask);
    }

    this.$puzzleContainer = $('<div class="puzzle-container puzzle-inline" tabIndex="0" role="grid" />');
    this.$vocabularyContainer = $('<div class="vocabulary-container" tabIndex="0" />');

    this.$footerContainer = $('<div class="footer-container" />');


    this.$statusContainer = $('<div />',{
      class: 'game-status',
      'aria-label': 'game-status',
      role: 'group',
      tabindex: '0'
    });
    this.$feedbackContainer = $('<div class="feedback-container"/>');
    this.$buttonContainer = $('<div class="button-container" />');
  };




  FindTheWords.prototype.createButton = function (name, icon, param, callback) {

    const cfunction = callback.bind(this);
    return UI.createButton({
      title: name,
      click: cfunction,
      html: '<span><i class="fa fa-'+icon+'" aria-hidden="true"></i></span>&nbsp;' +
              param
    });
  };

  FindTheWords.prototype.calculateElementSize = function () {

    const containerWidth = this.$container.width();
    const gridCol = this.grid.wordGrid[0].length;

    let gridMaxWidth = gridCol * ELEMENT_MAX_SIZE + 2* MARGIN;
    let gridElementStdSize = (containerWidth - 2*MARGIN)/gridCol;

    if (gridMaxWidth < containerWidth) {
      this.elementSize = ELEMENT_MAX_SIZE;

    }
    else if (gridElementStdSize > ELEMENT_MIN_SIZE) {
      this.elementSize = gridElementStdSize;
    }
    else {
      this.elementSize = ELEMENT_MAX_SIZE;
    }

    // this.vocMode = (containerWidth-gridMaxWidth > VOCABULARY_INLINE_WIDTH)?true:false;



  };

  FindTheWords.prototype.setVocabularyMode = function () {
    const gridCol = this.grid.wordGrid[0].length;
    this.vocMode = (this.$container.width()-(gridCol * this.elementSize + 2* MARGIN) > VOCABULARY_INLINE_WIDTH)?'inline':'block';
  };


  FindTheWords.prototype.gameSubmitted = function () {

    const totalScore = this.vocabulary.words.length;
    this.timer.stop();


    this.$progressBar.setScore(this.numFound);
    const scoreText = this.options.l10n.score
      .replace('@score', this.numFound)
      .replace('@total', totalScore);

    this.$feedback.html(scoreText);
    this.$submitButton = this.$submitButton.detach();

    this.grid.disableGrid();
    //create the feedback container
    if (totalScore !== this.numFound) {

      if (this.options.behaviour.enableShowSolution) {
        this.$showSolutionButton.appendTo(this.$buttonContainer);
      }

    }

    if (this.options.behaviour.enableRetry) {
      this.$retryButton.appendTo(this.$buttonContainer);
    }


    this.$feedbackContainer.addClass('feedback-show'); //show feedbackMessage
    this.$feedback.focus();
    this.trigger('resize');
  };



  FindTheWords.prototype.showSolutions = function () {
    this.grid.disableGrid();
    this.grid.mark(this.vocabulary.getNotFound());
    this.vocabulary.solveWords();
    this.$showSolutionButton.detach();
    this.$vocabularyContainer.focus();
    this.trigger('resize');
  };

  FindTheWords.prototype.resetTask = function () {

    this.numFound = 0;
    this.timer.reset();
    this.counter.reset();
    this.$progressBar.reset();
    this.$puzzleContainer.empty();
    this.vocabulary.reset();
    if (this.$showSolutionButton) {
      this.$showSolutionButton.detach();
    }
    this.$retryButton.detach();
    this.$feedbackContainer.removeClass('feedback-show');



    this.grid = new FindTheWords.WordGrid(this.gridParams);
    this.grid.appendTo(this.$puzzleContainer, this.elementSize);
    this.grid.drawGrid(MARGIN);
    this.registerGridEvents();

    this.$submitButton.appendTo(this.$buttonContainer);
    this.$puzzleContainer.focus();
    this.trigger('resize');
  };


  FindTheWords.prototype.registerGridEvents = function () {
    const that = this;
    this.grid.on('drawStart', function (event) {
      that.timer.play();
    });

    this.grid.on('drawEnd', function (event) {


      if (that.vocabulary.checkWord(event.data['markedWord'])) {
        that.numFound++;
        that.counter.increment();
        that.grid.markWord(event.data['wordObject']);
      }
    });
  };


  FindTheWords.prototype.attach = function ($container) {

    const that = this;

    this.$container = $container.addClass('h5p-find-the-words');

    this.$playArea = $('<div />',{
      class: 'h5p-play-area'
    });



    this.$taskDescription = $('<div />',{
      class: 'h5p-task-description',
      html: this.options.taskDescription,
      tabIndex: 0,
    });
  


    this.$gameContainer = $('<div/>',{
      class: 'game-container'
    });

    if (this.grid) {

      this.calculateElementSize();
      this.grid.appendTo(this.$puzzleContainer,this.elementSize );
      this.$puzzleContainer.appendTo(this.$gameContainer);
      if (this.options.behaviour.showVocabulary) {
        this.setVocabularyMode();
        this.vocabulary.appendTo(this.$vocabularyContainer,this.vocMode);
        this.$vocabularyContainer.appendTo(this.$gameContainer);
      }

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

    this.$taskDescription.appendTo(this.$playArea);

    this.$gameContainer.appendTo(this.$playArea);
    this.$footerContainer.appendTo(this.$playArea);

    this.$playArea.appendTo(this.$container);


    this.grid.drawGrid(MARGIN);

    this.registerGridEvents();

    this.trigger('resize');
  };




  return FindTheWords;

}) (H5P.jQuery, H5P.JoubelUI);
