H5P.FindTheWords = (function($, UI) {

  /**
   * @class H5P.FindTheWords
   * @param {Object} params
   */
  function FindTheWords(params) {

    /** @alias H5P.ImageSequencing# */
    var self = this;
    var score = 0;
    var wordList;

    /*
    * function for creating the puzzle object for the game
    * @param {Object} gameParams
    */
    var create = function(gameParams) {
      wordList = gameParams.vocabulary.slice(0).sort();
      self.vocLength = wordList.length;
      var puzzle = new FindTheWords.FindWordPuzzle(gameParams);
      return puzzle;
    };



    var startTurn = function() {
      self.gamePuzzle.startTurn(this);
    };

    var mouseMove = function() {
      self.gamePuzzle.mouseMove(this);
    };

    var endTurn = function() {
      score = (self.gamePuzzle.endTurn(this)) ? score + 1 : score;
    };

    /*
    * function to be called when clicking show solution button
    */
    self.solve = function() {

      var solution = self.gamePuzzle.solve().found;

      for (var i = 0, len = solution.length; i < len; i++) {
        var word = solution[i].word,
          orientation = solution[i].orientation,
          x = solution[i].x,
          y = solution[i].y,
          next = self.gamePuzzle.orientations[orientation];

        if (!$('.' + word).hasClass('wordFound')) {
          for (var j = 0, size = word.length; j < size; j++) {
            var nextPos = next(x, y, j);
            // $('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
            self.puzzleContainer.find('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
          }

          self.vocabularyContainer.find('.' + word).addClass('wordFound');
        }

      }

      self.displayFeedback();


    };



    self.displayFeedback = function() {

      var totalScore = score + self.gamePuzzle.solve().found.length;
      //create the retry button
      self.$retryButton = UI.createButton({
        title: 'retryButton',
        click: function(event) {
          score = 0;
          self.retry();
        },
        html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' + params.l10n.tryAgain
      });

      // create the progress bar
      self.$progressBar = UI.createScoreBar(totalScore, 'scoreBarLabel');
      self.$progressBar.setScore(score);
      //create the feedback container
      self.$feedbacks = $('<div class="feedback-container" />');
      var scoreText = params.l10n.score;
      scoreText = scoreText.replace('@score', score).replace('@total', totalScore);
      self.$feedbacks.html('<div class="feedback-text">' + scoreText + '</div>');
      self.$progressBar.appendTo(self.$feedbacks);
      self.footerContainer.html('').append(self.$feedbacks);
      self.footerContainer.append(self.$retryButton);

    };


    self.retry = function() {
      self.gamePuzzle = create(params);
      self.$container.empty();
      self.puzzleContainer.remove();
      self.vocabularyContainer.remove();
      self.attach(self.$container);
    };

    /*
    * function that makes the content type responsive
    */
    self.resize = function() {
      var containerWidth = self.puzzleContainer.width();
      var row = self.gamePuzzle.puzzle.length;
      var col = self.gamePuzzle.puzzle[0].length;
      var level = (col > row) ? col : row;
      var elementWidth = (containerWidth - (6 * level) - 4 - 40) / level;
      //set the grid elements size
      self.puzzleContainer.find('.puzzleSquare').css({
        'width': elementWidth + 'px',
        'height': elementWidth + 'px',
        'line-height': elementWidth + 'px'
      });
      //set the line-height of vocabulary words
      self.vocabularyContainer.find('li').css({
        'line-height': ((elementWidth * row + 80) / (self.vocLength + 1)) + "px"
      });

    };



    self.gamePuzzle = create(params);

    // when user finds all words
    self.gamePuzzle.on('complete', function() {
      self.puzzleContainer.find('.puzzleSquare').addClass('complete');
      self.displayFeedback();
    });

    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */

    self.attach = function($container) {

      self.puzzleContainer = $('<div class="puzzleContainer"></div>');
      self.vocabularyContainer = $('<div class="vocabularyContainer"></div>');
      self.footerContainer = $('<div class="footerContainer"></div>');

      self.$solvePuzzleButton = UI.createButton({
        title: 'Show Solution',
        click: function(event) {
          self.solve();
        },
        html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' + params.l10n.showSolution
      });

      if (self.$wrapper === undefined) {
        self.$wrapper = $('<div class="gameContainer"/>', {
          html: ''
        });
      }
      self.gamePuzzle.drawPuzzle(self.puzzleContainer);
      self.gamePuzzle.drawWords(self.vocabularyContainer);

      self.gamePuzzle.print(); // print the puzzle to console..useful for debugging

      self.footerContainer.append(self.$solvePuzzleButton);
      self.$wrapper.append(self.puzzleContainer);
      self.$wrapper.append(self.vocabularyContainer);

      //attach task description
      $container.html('<div class="h5p-task-description" >' + params.taskDescription + '</div>');
      $container.addClass('h5p-word-find').append(self.$wrapper);
      $container.append(self.footerContainer);
      self.$container = $container;
      self.puzzleContainer.find('.puzzleSquare').mousedown(startTurn);
      self.puzzleContainer.find('.puzzleSquare').mouseenter(mouseMove);
      self.puzzleContainer.find('.puzzleSquare').mouseup(endTurn);


      // when window size changes trigger resize function
      self.on('resize', function() {
        self.resize();
      });

      self.resize();

    };


  }
  FindTheWords.prototype.constructor = FindTheWords;
  return FindTheWords;
})(H5P.jQuery, H5P.JoubelUI);
