H5P.WordFindGame = (function ($,UI) {

  /**
   * @class H5P.WordFindGame
   * @param {Object} params
   */
  function WordFindGame(params) {

    var self = this;
    var score=0;
    var vocabulary;

    var startSquare, selectedSquares = [], curOrientation, curWord = '';



    var startTurn = function () {
      $(this).addClass('selected');
      startSquare = this;
      selectedSquares.push(this);
      curWord = $(this).text();
      console.log(curWord);

    };

    var select = function (target) {
      // if the user hasn't started a word yet, just return

      if (!startSquare) {
        return;
      }

      // if the new square is actually the previous square, just return
      var lastSquare = selectedSquares[selectedSquares.length-1];
      if (lastSquare == target) {
        return;
      }

      // see if the user backed up and correct the selectedSquares state if
      // they did
      var backTo;
      for (var i = 0, len = selectedSquares.length; i < len; i++) {
        if (selectedSquares[i] == target) {
          backTo = i+1;
          break;
        }
      }

      while (backTo < selectedSquares.length) {
        $(selectedSquares[selectedSquares.length-1]).removeClass('selected');
        selectedSquares.splice(backTo,1);
        curWord = curWord.substr(0, curWord.length-1);
      }


      // see if this is just a new orientation from the first square
      // this is needed to make selecting diagonal words easier
      var newOrientation = calcOrientation(
          $(startSquare).attr('x')-0,
          $(startSquare).attr('y')-0,
          $(target).attr('x')-0,
          $(target).attr('y')-0
          );

      if (newOrientation) {
        selectedSquares = [startSquare];
        curWord = $(startSquare).text();
        if (lastSquare !== startSquare) {
          $(lastSquare).removeClass('selected');
          lastSquare = startSquare;
        }
        curOrientation = newOrientation;
      }

      // see if the move is along the same orientation as the last move
      var orientation = calcOrientation(
          $(lastSquare).attr('x')-0,
          $(lastSquare).attr('y')-0,
          $(target).attr('x')-0,
          $(target).attr('y')-0
          );

      // if the new square isn't along a valid orientation, just ignore it.
      // this makes selecting diagonal words less frustrating
      if (!orientation) {
        return;
      }

      // finally, if there was no previous orientation or this move is along
      // the same orientation as the last move then play the move
      if (!curOrientation || curOrientation === orientation) {
        curOrientation = orientation;
        playTurn(target);
      }

    };


    var mouseMove = function() {
      select(this);
    };

    var playTurn = function (square) {

      // make sure we are still forming a valid word
      for (var i = 0, len = wordList.length; i < len; i++) {
        if (wordList[i].indexOf(curWord + $(square).text()) === 0) {
          $(square).addClass('selected');
          selectedSquares.push(square);
          curWord += $(square).text();
          console.log("current word:"+curWord);
          break;
        }
      }
    };


    var calcOrientation = function (x1, y1, x2, y2) {

      for (var orientation in self.gamePuzzle.orientations) {
        var nextFn = self.gamePuzzle.orientations[orientation];
        var nextPos = nextFn(x1, y1, 1);

        if (nextPos.x === x2 && nextPos.y === y2) {
          return orientation;
        }
      }

      return null;
    };


    var create = function(gameParams){
          wordList = gameParams.vocabulary.slice(0).sort();

          self.vocLength = wordList.length;
          var puzzle = new WordFindGame.WordFindPuzzle(gameParams);

          return puzzle;
    }



    var startTurn = function(){
      self.gamePuzzle.startTurn(this);
    }

    var mouseMove = function(){
      self.gamePuzzle.mouseMove(this);
    }

    var endTurn = function(){
      score = (self.gamePuzzle.endTurn(this))? score+1 : score;
    }

    self.solve = function(){

              var solution = self.gamePuzzle.solve().found;

              for( var i = 0, len = solution.length; i < len; i++) {
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

                  $('.' + word).addClass('wordFound');
                }

              }

              self.displayFeedback();


    }

    self.displayFeedback = function(){

        var totalScore = score+self.gamePuzzle.solve().found.length;

      self.$retryButton = UI.createButton({
        title: 'retryButton',
        click: function(event) {
          score=0;
          self.retry();


        },
        html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;'+params.l10n.tryAgain
      });

      self.$progressBar = UI.createScoreBar(totalScore, 'scoreBarLabel');
      self.$progressBar.setScore(score);



      self.$feedbacks = $('<div class="feedback-container" />');

      var scoreText = params.l10n.score;
      scoreText = scoreText.replace('@score', score).replace('@total', totalScore);
      self.$feedbacks.html('<div class="feedback-text">' + scoreText + '</div>');

      self.$progressBar.appendTo(self.$feedbacks);


      self.footerContainer.html('').append(self.$feedbacks);
      self.footerContainer.append(self.$retryButton);

    }


    self.retry = function(){
      self.gamePuzzle = create(params);
      self.$container.empty();
      self.puzzleContainer.remove();
      self.vocabularyContainer.remove();
      self.attach(self.$container);
    }
    self.resize = function(){


   var containerWidth = self.puzzleContainer.width();
   var row = self.gamePuzzle.puzzle.length;
   var col = self.gamePuzzle.puzzle[0].length;

   var level = (col>row)?col:row;
   var elementWidth = (containerWidth - (6*level)-4 - 40)/level;
   var vocabularyTop = ((elementWidth*row+80) - self.vocabularyContainer.height())/2;

   self.puzzleContainer.find('.puzzleSquare').css({'width': elementWidth+'px','height': elementWidth+'px','line-height': elementWidth+'px'});
   self.vocabularyContainer.find('li').css({'line-height': ((elementWidth*row+80)/(self.vocLength+1))+"px"});

 }



    self.gamePuzzle = create(params);

    self.gamePuzzle.on('complete',function(){
     self.puzzleContainer.find('.puzzleSquare').addClass('complete');
     self.displayFeedback();
    });


    self.attach = function ($container) {

      self.puzzleContainer = $ ('<div class="puzzleContainer">puzzle</div>');
      self.vocabularyContainer = $('<div class="vocabularyContainer">vocabulary</div>');
      self.footerContainer = $('<div class="footer-container"></div>')

      self.$solvePuzzleButton = UI.createButton({
        title: 'Show Solution',
        click: function(event) {
          self.solve();
        },
        html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;'+params.l10n.showSolution
      });


      if (self.$wrapper === undefined) {
        self.$wrapper = $('<div class="gameContainer"/>', {
          html: ''
        });
      }
      self.gamePuzzle.drawPuzzle(self.puzzleContainer);
      self.gamePuzzle.drawWords(self.vocabularyContainer);

      self.gamePuzzle.print();

      self.footerContainer.append(self.$solvePuzzleButton);
      self.$wrapper.append(self.puzzleContainer);
      self.$wrapper.append(self.vocabularyContainer);

      $container.html('<div class="h5p-task-description" >'+params.taskDescription+'</div>');
      $container.addClass('h5p-WordFindGame').append(self.$wrapper);
      $container.append(self.footerContainer);

      self.$container = $container;


      $('.puzzleSquare').mousedown(startTurn);
      $('.puzzleSquare').mouseenter(mouseMove);
      $('.puzzleSquare').mouseup(endTurn);



      self.on('resize',function(){
        self.resize();
      });

      self.resize();

    };


  }
  WordFindGame.prototype.constructor = WordFindGame;
  return WordFindGame;
})(H5P.jQuery, H5P.JoubelUI);
