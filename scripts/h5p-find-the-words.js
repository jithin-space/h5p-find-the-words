H5P.FindTheWords = (function ($, UI) {

  /**
   * FindTheWords Constructor
   *
   * @class H5P.FindTheWords
   * @param {Object} params
   */
  function FindTheWords(params) {

    var self = this;
    // specify the min and maximum grid element size
    var ELEMENT_MIN_SIZE = 32;
    var ELEMENT_MAX_SIZE = 64;
    var elementSize;
    var MARGIN = 8;
    var paint = false;
    var enableDrawing = true;
    var found = 0;
    // for handling mouse and touch events
    var clickStart = [];
    var clickEnd = [];
    var wordList = [];
    var showVocabulary = params.behaviour.showVocabulary;

    /*
     * create a puzzle by taking the parameters provided
     * @private
     * @param {Object} params
     */
    var createGame = function () {
      return new FindTheWords.FindWordPuzzle(params);
    };

    /*
     * function to dynamically calculate the grid element size
     * based on the vocabulary status (not available,inline or block)
     * @private
     * @param {Boolean} isBlock
     */
    var calculateElementSize = function (isBlock) {
      var puzzle = self.game.puzzle;
      var col = puzzle[0].length;
      var availableWidth = self.$gameWrapper.width();

      if (self.vocabularyWidth !== undefined && !isBlock) {
        //we need to give space for vocabulary
        availableWidth = availableWidth - (self.vocabularyWidth + 2 * MARGIN);
      }

      var elementWidth = availableWidth / col;


      if ((elementWidth > ELEMENT_MIN_SIZE) && (elementWidth < ELEMENT_MAX_SIZE)) {
        //if element width is inside the permissible ranges
        elementSize = elementWidth;
      }
      else if (elementWidth > 64) {
        // calculated width is greater than maximum allowed value
        elementSize = ELEMENT_MAX_SIZE;
      }
      else {
        // calculated width is less than the minimum allowed value
        elementSize = ELEMENT_MIN_SIZE;
      }

      return elementSize;

    };

    /*
    * Function for drawing the marking one a word is found or marked as solved
    * @private
    * @param {Object} canvas
    * @param {Number} endx
    * @param {Number} endy
    */
    var drawLine = function (canvas, endx, endy) {
      var context = canvas.getContext("2d");
      var dirIndex;
      var cordinates = calculateCordinates(endx,endy,canvas);
      var dir = processDrawnLine(clickStart[2],clickStart[3],cordinates[2],cordinates[3]);
      var dict = {
        1 : [1,0],
        2 : [-1,0],
        3 : [1,1],
        4 : [-1,1],
        5 : [1,-1],
        6 : [-1,-1],
        7 : [0,1],
        8  : [0,-1]
      };
      for (var key in dict) {
        if (dict[key][0]==dir[0]&&dict[key][1]==dir[1]) {
          dirIndex=key;
          break;
        }
      }
      var startingAngle;
      switch (dirIndex) {
        case '1': {
          startingAngle = (Math.PI/2);
          break;
        }
        case '2': {
          startingAngle = -(Math.PI/2);
          break;
        }
        case '3': {
          startingAngle = 3*(Math.PI/4);
          break;
        }
        case '4': {
          startingAngle = 5*(Math.PI/4);
          break;
        }
        case '5': {
          startingAngle = (Math.PI/4);
          break;
        }
        case '6': {
          startingAngle = -(Math.PI/4);
          break;
        }
        case '7': {
          startingAngle = (Math.PI);
          break;
        }
        case '8': {
          startingAngle = 0;
          break;
        }
      }
      context.beginPath();
      context.lineWidth = 2;
      context.arc(clickStart[0] - 7.5, clickStart[1] + 5,15,startingAngle,startingAngle+(Math.PI));
      context.arc(cordinates[0] - 7.5, cordinates[1] + 5,15,startingAngle+(Math.PI),startingAngle+(2*Math.PI));
      context.closePath();
      context.stroke();
      context.fill();
    };

    /*
     * function for drawing the line in the cavas as per the mouse/touch movements
     * @private
     * @param {Object} canvas
     * @param {Number} endx
     * @param {Number} endy
     */
    var drawLineMarking = function (canvas, endx, endy) {
      var context = canvas.getContext("2d");
      context.beginPath();
      context.lineCap="round";
      context.moveTo(clickStart[0] - 7.5, clickStart[1] + 5);
      context.strokeStyle = "rgba(107,177,125,0.4)";
      context.lineWidth = 30;
      context.lineTo(endx - 7.5, endy + 5);
      context.stroke();
      context.closePath();
    };

    /*
     * function to calculate the cordinates & grid postions at which the event occured
     */
    var calculateCordinates = function (x,y, canvas) {
      var row1 = Math.floor(x / self.elementSize);
      var col1 = Math.floor(y / self.elementSize);
      var x_click = row1 * elementSize + (elementSize / 2);
      var y_click = col1 * elementSize + (elementSize / 2);
      return [x_click, y_click, row1, col1];
    };

    /*
     * function to calulate the directional increment value
     * based on the endpoints given
     */
    var directionalValue = function (cordinate1, cordinate2) {
      var dirIncr;
      if (cordinate2 > cordinate1) {
        dirIncr = 1;
      }
      else if (cordinate2 < cordinate1) {
        dirIncr = -1;
      }
      else {
        dirIncr = 0;
      }
      return dirIncr;
    };

    /*
     * function to post process the line drawn to find if it is a valid marking
     * in terms of possible grid directions
     * returns directional value if it is a valid marking
     * else return false
     */
    var processDrawnLine = function (x1,y1,x2,y2) {
      var dirx = directionalValue(x1, x2);
      var diry = directionalValue(y1, y2);
      var y = y1;
      var x = x1;
      if (dirx != 0) {
        while (x != x2) {
          x = x + dirx;
          y = y + diry;
        }
      }
      else {
        while (y != y2) {
          y = y + diry;
        }
      }

      if (y2 == y) {
        return [dirx, diry];
      }
      else {
        return false;
      }

    };

    /*
     * event handler for handling mousedown event
     * @private
     */
    var mouseDownEventHandler = function (e, canvas) {
      if (enableDrawing) {
        paint = true;
      }
      var x = e.pageX - $(canvas).offset().left;
      var y = e.pageY - $(canvas).offset().top;

      clickStart = calculateCordinates(x,y, canvas);
    };

    /*
     * event handler for handling mousemove events
     * @private
     */

    var mouseMoveEventHandler = function (e, canvas) {
      var x, y;
      x = e.pageX - $(canvas).offset().left;
      y = e.pageY - $(canvas).offset().top;
      if (paint) {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.strokeStyle = "rgba(107,177,125,0.9)";
        context.fillStyle = "rgba(107,177,125,0.3)";
        drawLineMarking(canvas, x, y);
      }
    };

    /*
     * event handler for handling mouseup events
     * @private
     */
    var mouseUpEventHandler = function (e, canvas) {
      var markedWord = '';
      if (paint) {

        var x = e.pageX - $(canvas).offset().left;
        var y = e.pageY - $(canvas).offset().top;
        var cordinate = calculateCordinates(x,y, canvas);
        var x_click = cordinate[0];
        var y_click = cordinate[1];
        if ((Math.abs(x_click - x) < 20) && (Math.abs(y_click - y) < 10)) {
          //drag ended within permissible orange
          clickEnd = cordinate;
          var isDir = processDrawnLine(clickStart[2],clickStart[3],clickEnd[2],clickEnd[3]);
          //if it is a valid directional marking.
          if (isDir !== false) {
            var y1 = clickStart[3];
            var x1 = clickStart[2];
            var x2 = clickEnd[2];
            var y2 = clickEnd[3];

            do {
              markedWord += self.game.puzzle[y1][x1];
              x1 = x1 + isDir[0];
              y1 = y1 + isDir[1];
            } while (!((y1 == y2) && (x1 == x2)));

            markedWord += self.game.puzzle[y2][x2];

          }
        }

        canvas.getContext("2d").closePath();
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        paint = false;
        return markedWord;
      }

    };

    /*
     * if the drawn word is in the vocabulary, this function is invoked
     * to make the corresponding word marked
     * used also for showing the solution if solved is false
     * @private
     */
    var makeWordFound = function (word, $canvas, solved) {
      var context = $canvas[0].getContext("2d");
      var classname = word.replace(/ /g, '');
      if (solved) {
        if (showVocabulary) {
          self.$vocabularyContainer.find('.' + classname).addClass('word-found');
        }
        context.strokeStyle = "rgba(107,177,125,0.9)";
        context.fillStyle = "rgba(107,177,125,0.3)";
      }
      else {
        if (showVocabulary) {
          self.$vocabularyContainer.find('.' + classname).addClass('word-solved');
        }
        context.strokeStyle = "rgba(51, 102, 255,0.9)";
        context.fillStyle = "rgba(51, 102, 255,0.1)";
        context.setLineDash([8, 4]);
      }
      drawLine($canvas[0], clickEnd[0], clickEnd[1]);
    };

    /*
     * adapter for mapping touch events with mouse events
     * @private
     */

    var touchHandler = function (event) {
      var touches = event.changedTouches,
        first = touches[0],
        type = "";
      switch (event.type) {
        case "touchstart":
          type = "mousedown";
          break;
        case "touchmove":
          type = "mousemove";
          break;
        case "touchend":
          type = "mouseup";
          break;
        default:
          return;
      }

      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0 /*left*/ , null);

      first.target.dispatchEvent(simulatedEvent);
      event.preventDefault();
    };


    /*
     * function to trigger when the user clicks on the show solution button
     * @public
     */
    self.solvePuzzle = function (wordList) {
      self.$solvePuzzleButton.remove();
      var solution = self.game.solve(wordList).found;
      for (var i = 0, len = solution.length; i < len; i++) {
        var word = solution[i].word,
          orientation = solution[i].orientation,
          x = solution[i].x,
          y = solution[i].y,
          next = self.game.orientations[orientation];
        var cord = next(x, y, word.length - 1);
        var x1_click = x * elementSize + (elementSize / 2);
        var y1_click = y * elementSize + (elementSize / 2);
        var x2_click = cord.x * elementSize + (elementSize / 2);
        var y2_click = cord.y * elementSize + (elementSize / 2);
        clickStart = [x1_click, y1_click, x, y];
        clickEnd = [x2_click, y2_click, cord.x, cord.y];
        makeWordFound(word, self.$outputCanvas, false);
      }
    };

    /*
     * function to trigger when the user clicks on the retry button
     * @public
     */
    self.retry = function() {
      self.game = createGame(params);
      self.elementSize = undefined;
      enableDrawing = true;
      found = 0;
      self.$container.empty();
      if (showVocabulary) {
        self.$vocabularyContainer.remove();
      }
      self.$puzzleContainer.remove();

      self.attach(self.$container);
      self.trigger('resize');
    };

    /*
     * function to trigger when the user clicks on the check button
     * @public
     */
    self.displayFeedback = function () {

      var totalScore = self.game.wordList.length;
      self.timer.stop();
      enableDrawing = false;
      //create the retry button
      self.$retryButton = UI.createButton({
        title: 'retryButton',
        click: function (event) {
          self.retry();
        },
        html: '<span><i class="fa fa-refresh" aria-hidden="true"></i></span>&nbsp;' + params.l10n.tryAgain
      });

      self.$progressBar = UI.createScoreBar(totalScore, 'scoreBarLabel');
      self.$progressBar.setScore(found);
      //create the feedback container
      var scoreText = params.l10n.score;
      scoreText = scoreText.replace('@score', found).replace('@total', totalScore);
      self.$feedbackContainer.html('<div class="feedback-text">' + scoreText + '</div>');
      self.$progressBar.appendTo(self.$feedbackContainer);
      if (totalScore !== found) {
        self.$solvePuzzleButton = UI.createButton({
          title: 'Show Solution',
          click: function(event) {
            self.solvePuzzle(wordList);
          },
          html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' + params.l10n.showSolution
        });
        self.$footerContainer.append(self.$solvePuzzleButton);
      }
      self.$footerContainer.append(self.$retryButton);
    };


    /*
     * function to attach the footer section to gamecontainer
     * @public
     */
    self.attachFooter = function ($container) {
      self.$footerContainer = $('<div class="footer-container"></div>');
      self.$statusContainer = $('<div class="status-container"></div>');
      self.$timeStatus = $('<div class="time-status"><span><i class="fa fa-clock-o" aria-hidden="true"></i></span>&nbsp;' + params.l10n.timeSpent + '&nbsp;:&nbsp;<span class="h5p-time-spent">0:00</span></div>').appendTo(self.$statusContainer);
      self.$counterStatus = $('<div class="counter-status"/>');
      var counterText = params.l10n.found;
      counterText = counterText.replace('@found', '<span class="h5p-found">' + '0' + '</span>').replace('@totalWords', '<span class="total-words" >' + self.game.wordList.length + '</span>');
      self.$counterStatus.html('<div>' + counterText + '</div>').appendTo(self.$statusContainer);
      //creating the check button
      self.$checkPuzzleButton = UI.createButton({
        title: 'Show Solution',
        click: function (event) {
          self.displayFeedback();
        },
        html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' + params.l10n.check
      });

      self.$feedbackContainer = $('<div class="feedback-container"></div>').append(self.$checkPuzzleButton);
      self.$statusContainer.appendTo(self.$footerContainer);
      self.$feedbackContainer.appendTo(self.$footerContainer);
      $container.append(self.$footerContainer);
      //initialization of timer and counter modules
      self.timer = new FindTheWords.Timer(self.$timeStatus.find('.h5p-time-spent')[0]);
      self.counter = new FindTheWords.Counter(self.$counterStatus.find('.h5p-found'));
    };

    self.game = createGame();

    self.attach = function($container) {

      //task description is optional
      if (params.taskDescription) {
        $container.html('<div class="h5p-task-description" >' + params.taskDescription + '</div>');
      }
      if (self.$gameWrapper === undefined) {
        self.$gameWrapper = $('<div class="game-container" />', {
          html: ''
        });
      }
      // for the puzzle container
      self.$puzzleContainer = $('<div class="puzzle-container"></div>');
      //actual drawing to the canvas is not made here for making it responsive
      self.$gameWrapper.append(self.$puzzleContainer);
      // for the vocabulary container
      // displaying the vocabulary is also optional
      if (params.behaviour.showVocabulary) {
        self.$vocabularyContainer = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
        self.game.drawWords(self.$vocabularyContainer);
        self.$gameWrapper.append(self.$vocabularyContainer);

      }

      $container.addClass('h5p-find-the-words').append(self.$gameWrapper);
      //if there is a vocabulary assign its width
      self.vocabularyWidth = (self.$vocabularyContainer) ? self.$vocabularyContainer.width() : 0;
      self.attachFooter($container);

      // here is where all responsive functionalities of the game is centered on
      self.on('resize', function() {

        //find elementSize
        //initiallly vocabulary container is assumed to be in inline mode

        var puzzle = self.game.puzzle;
        wordList = self.game.wordList.slice(0); //clone
        elementSize = calculateElementSize(false);
        if (elementSize < ELEMENT_MAX_SIZE) {
          //making the vocabulary in block mode , try to increase the elementSize
          elementSize = calculateElementSize(true);
        }

        var canvasWidth = elementSize * puzzle[0].length;
        var canvasHeight = elementSize * puzzle.length;
        var margin = MARGIN;

        // redrawing of the canvas & thereby resetting of the game should take place inside
        if (elementSize != self.elementSize) {
          self.$puzzleContainer.empty().css('height', canvasHeight).css('width', canvasWidth).css('margin', margin + 'px');
          var $gridCanvas = $('<canvas class="canvas-element" height="' + canvasHeight + 'px" width="' + canvasWidth + 'px" />').appendTo(self.$puzzleContainer);
          self.$outputCanvas = $('<canvas class="canvas-element" height="' + canvasHeight + 'px" width="' + canvasWidth + 'px"/>').appendTo(self.$puzzleContainer);
          var $drawingCanvas = $('<canvas class="canvas-element" height="' + canvasHeight + 'px" width="' + canvasWidth + 'px"/>').appendTo(self.$puzzleContainer);
          self.game.drawPuzzle($gridCanvas, elementSize, canvasWidth, canvasHeight);
          //reset the vocabulary
          if (params.behaviour.showVocabulary) {
            self.$vocabularyContainer.remove();
            wordList = self.game.wordList.slice(0);
            self.$vocabularyContainer = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
            self.game.drawWords(self.$vocabularyContainer);
          }
          // reset the footer & associated parameters
          self.$footerContainer.remove();
          found = 0;
          enableDrawing = true;
          wordList = self.game.wordList.slice(0);
          self.attachFooter($container);

          self.elementSize = elementSize;
          //  registering touchstart event listener
          $drawingCanvas[0].addEventListener("touchstart", function(event) {

            event.preventDefault();
            if (enableDrawing) {
              self.timer.play();
            }
            // registering touchmove event listener
            $drawingCanvas[0].addEventListener("touchmove", function(event) {
              touchHandler(event);
            }, false);

            // registering touchend event listener
            $drawingCanvas[0].addEventListener("touchend", function(event) {
              touchHandler(event);
            }, false);

            touchHandler(event);

          }, false);




          // Registering mouse events
          $drawingCanvas.on('mousedown', function(event) {
            if (enableDrawing) {
              self.timer.play();
            }
            $drawingCanvas.on('mouseup', function(event) {

              var markedWord = mouseUpEventHandler(event, this);

              if ($.inArray(markedWord, wordList) != -1) {
                const index = wordList.indexOf(markedWord);
                wordList.splice(index, 1);
                found++;
                self.counter.increment();
                makeWordFound(markedWord, self.$outputCanvas, true);
              }
            });

            $drawingCanvas.on('mousedown', function(event) {
              mouseDownEventHandler(event, this);
            });
            $drawingCanvas.on('mousemove', function(event) {
              mouseMoveEventHandler(event, this);
            });
            mouseDownEventHandler(event, this);
          });
        }

        // reattach vocabulary container on resize
        if (params.behaviour.showVocabulary) {
          var innerhtml = self.$vocabularyContainer.html();
          self.$vocabularyContainer.remove();
          self.$vocabularyContainer = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
          self.$vocabularyContainer.append(innerhtml);
          self.$gameWrapper.append(self.$vocabularyContainer);
          self.vocabularyWidth = (self.$vocabularyContainer) ? self.$vocabularyContainer.width() : 0;
        }

        // check if vocabulary need to be changed from inline mode to block mode or vice versa
        if ((self.vocabularyWidth + canvasWidth + 4 * MARGIN) < self.$gameWrapper.width()) {
          self.$vocabularyContainer.removeClass('vocabulary-block-container').addClass('vocabulary-inline-container').css('height', elementSize * puzzle.length + 'px');
        } else {
          self.$vocabularyContainer.removeClass('vocabulary-inline-container').addClass('vocabulary-block-container').css('width', canvasWidth + 'px');
        }

      });
      self.$container = $container;
    };

  }

  FindTheWords.prototype.constructor = FindTheWords;
  return FindTheWords;
})(H5P.jQuery, H5P.JoubelUI);
H5P.FindTheWords = (function($, UI) {

  /**
   * FindTheWords Constructor
   *
   * @class H5P.FindTheWords
   * @param {Object} params
   */
  function FindTheWords(params) {

    var self = this;
    // specify the min and maximum grid element size
    var ELEMENT_MIN_SIZE = 32;
    var ELEMENT_MAX_SIZE = 64;
    var elementSize;
    var MARGIN = 8;
    var paint = false;
    var enableDrawing = true;
    var found = 0;
    // for handling mouse and touch events
    var clickStart = [];
    var clickEnd = [];
    var wordList = [];
    var showVocabulary = params.behaviour.showVocabulary;

    /*
     * create a puzzle by taking the parameters provided
     * @private
     * @param {Object} params
     */
    var createGame = function() {
      return new FindTheWords.FindWordPuzzle(params);
    };

    /*
     * function to dynamically calculate the grid element size
     * based on the vocabulary status (not available,inline or block)
     * @private
     * @param {Boolean} isBlock
     */
    var calculateElementSize = function(isBlock) {
      var puzzle = self.game.puzzle;
      var col = puzzle[0].length;
          var availableWidth = self.$gameWrapper.width();

      if (self.vocabularyWidth !== undefined && !isBlock) {
        //we need to give space for vocabulary
        availableWidth = availableWidth - (self.vocabularyWidth + 2 * MARGIN);
      }

      var elementWidth = availableWidth / col;


      if ((elementWidth > ELEMENT_MIN_SIZE) && (elementWidth < ELEMENT_MAX_SIZE)) {
        //if element width is inside the permissible ranges
        elementSize = elementWidth;
      } else if (elementWidth > 64) {
        // calculated width is greater than maximum allowed value
        elementSize = ELEMENT_MAX_SIZE;
      } else {
        // calculated width is less than the minimum allowed value
        elementSize = ELEMENT_MIN_SIZE;
      }

      return elementSize;

    };

    /*
    * Function for drawing the marking one a word is found or marked as solved
    * @private
    * @param {Object} canvas
    * @param {Number} endx
    * @param {Number} endy
    */
    var drawLine = function(canvas, endx, endy) {
      var context = canvas.getContext("2d");
      var dirIndex;
      var cordinates = calculateCordinates(endx,endy,canvas);
      var dir = processDrawnLine(clickStart[2],clickStart[3],cordinates[2],cordinates[3]);
      var dict = {
        1 : [1,0],
        2 : [-1,0],
        3 : [1,1],
        4 : [-1,1],
        5 : [1,-1],
        6 : [-1,-1],
        7 : [0,1],
        8 : [0,-1]
      };
      for(var key in dict){
        if(dict[key][0]==dir[0]&&dict[key][1]==dir[1]){
          dirIndex=key;
          break;
        }
      }
      var startingAngle;
      switch(dirIndex){
        case '1':{
              startingAngle = (Math.PI/2);
              break;
            }
        case '2':{
            startingAngle = -(Math.PI/2);
            break;
        }
        case '3':{
          startingAngle = 3*(Math.PI/4);
          break;
        }
        case '4':{
          startingAngle = 5*(Math.PI/4);
          break;
        }
        case '5':{
          startingAngle = (Math.PI/4);
          break;
        }
        case '6':{
          startingAngle = -(Math.PI/4);
          break;
        }
        case '7':{
          startingAngle = (Math.PI);
          break;
        }
        case '8':{
          startingAngle = 0;
          break;
        }
      }
      context.beginPath();
      context.lineWidth = 2;
      context.arc(clickStart[0] - 7.5, clickStart[1] + 5,15,startingAngle,startingAngle+(Math.PI));
      context.arc(cordinates[0] - 7.5, cordinates[1] + 5,15,startingAngle+(Math.PI),startingAngle+(2*Math.PI));
      context.closePath();
      context.stroke();
      context.fill();
    };

    /*
     * function for drawing the line in the cavas as per the mouse/touch movements
     * @private
     * @param {Object} canvas
     * @param {Number} endx
     * @param {Number} endy
     */
    var drawLineMarking = function(canvas, endx, endy) {
      var context = canvas.getContext("2d");
      context.beginPath();
      context.lineCap="round";
      context.moveTo(clickStart[0] - 7.5, clickStart[1] + 5);
      context.strokeStyle = "rgba(107,177,125,0.4)";
      context.lineWidth = 30;
      context.lineTo(endx - 7.5, endy + 5);
      context.stroke();
      context.closePath();
    };

    /*
     * function to calculate the cordinates & grid postions at which the event occured
     */
    var calculateCordinates = function(x,y, canvas) {
      var row1 = Math.floor(x / self.elementSize);
      var col1 = Math.floor(y / self.elementSize);
      var x_click = row1 * elementSize + (elementSize / 2);
      var y_click = col1 * elementSize + (elementSize / 2);
      return [x_click, y_click, row1, col1];
    };

    /*
     * function to calulate the directional increment value
     * based on the endpoints given
     */
    var directionalValue = function(cordinate1, cordinate2) {
      var dirIncr;
      if (cordinate2 > cordinate1) {
        dirIncr = 1;
      } else if (cordinate2 < cordinate1) {
        dirIncr = -1;
      } else {
        dirIncr = 0;
      }
      return dirIncr;
    };

    /*
     * function to post process the line drawn to find if it is a valid marking
     * in terms of possible grid directions
     * returns directional value if it is a valid marking
     * else return false
     */
    var processDrawnLine = function(x1,y1,x2,y2) {
      var dirx = directionalValue(x1, x2);
      var diry = directionalValue(y1, y2);
      var y = y1;
      var x = x1;
      if (dirx != 0) {
        while (x != x2) {
          x = x + dirx;
          y = y + diry;
        }
      } else {
        while (y != y2) {
          y = y + diry;
        }
      }

      if (y2 == y) {
        return [dirx, diry];
      } else {
        return false;
      }

    };

    /*
     * event handler for handling mousedown event
     * @private
     */
    var mouseDownEventHandler = function(e, canvas) {
      if (enableDrawing) {
        paint = true;
      }
      var x = e.pageX - $(canvas).offset().left;
      var y = e.pageY - $(canvas).offset().top;

      clickStart = calculateCordinates(x,y, canvas);
    };

    /*
     * event handler for handling mousemove events
     * @private
     */

    var mouseMoveEventHandler = function(e, canvas) {
      var x, y;
      x = e.pageX - $(canvas).offset().left;
      y = e.pageY - $(canvas).offset().top;
      if (paint) {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.strokeStyle = "rgba(107,177,125,0.9)";
        context.fillStyle = "rgba(107,177,125,0.3)";
        drawLineMarking(canvas, x, y);
      }
    };

    /*
     * event handler for handling mouseup events
     * @private
     */
    var mouseUpEventHandler = function(e, canvas) {
      var markedWord = '';
      if (paint) {

        var x = e.pageX - $(canvas).offset().left;
        var y = e.pageY - $(canvas).offset().top;
        var cordinate = calculateCordinates(x,y, canvas);
        var x_click = cordinate[0];
        var y_click = cordinate[1];
        if ((Math.abs(x_click - x) < 20) && (Math.abs(y_click - y) < 10)) {
          //drag ended within permissible orange
          clickEnd = cordinate;
          var isDir = processDrawnLine(clickStart[2],clickStart[3],clickEnd[2],clickEnd[3]);
          //if it is a valid directional marking.
          if (isDir !== false) {
            var y1 = clickStart[3];
            var x1 = clickStart[2];
            var x2 = clickEnd[2];
            var y2 = clickEnd[3];

            do {
              markedWord += self.game.puzzle[y1][x1];
              x1 = x1 + isDir[0];
              y1 = y1 + isDir[1];
            } while (!((y1 == y2) && (x1 == x2)));

            markedWord += self.game.puzzle[y2][x2];

          }
        }

        canvas.getContext("2d").closePath();
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        paint = false;
        return markedWord;
      }

    };

    /*
     * if the drawn word is in the vocabulary, this function is invoked
     * to make the corresponding word marked
     * used also for showing the solution if solved is false
     * @private
     */
    var makeWordFound = function(word, $canvas, solved) {
      var context = $canvas[0].getContext("2d");
      var classname = word.replace(/ /g, '');
      if (solved) {
        if (showVocabulary) {
          self.$vocabularyContainer.find('.' + classname).addClass('word-found');
        }
        context.strokeStyle = "rgba(107,177,125,0.9)";
        context.fillStyle = "rgba(107,177,125,0.3)";
      } else {
        if (showVocabulary) {
          self.$vocabularyContainer.find('.' + classname).addClass('word-solved');
        }
        context.strokeStyle = "rgba(51, 102, 255,0.9)";
        context.fillStyle = "rgba(51, 102, 255,0.1)";
        context.setLineDash([8, 4]);
      }
      drawLine($canvas[0], clickEnd[0], clickEnd[1]);
    };

    /*
     * adapter for mapping touch events with mouse events
     * @private
     */

    var touchHandler = function(event) {
      var touches = event.changedTouches,
        first = touches[0],
        type = "";
      switch (event.type) {
        case "touchstart":
          type = "mousedown";
          break;
        case "touchmove":
          type = "mousemove";
          break;
        case "touchend":
          type = "mouseup";
          break;
        default:
          return;
      }

      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0 /*left*/ , null);

      first.target.dispatchEvent(simulatedEvent);
      event.preventDefault();
    };


    /*
     * function to trigger when the user clicks on the show solution button
     * @public
     */
    self.solvePuzzle = function(wordList) {
      self.$solvePuzzleButton.remove();
      var solution = self.game.solve(wordList).found;
      for (var i = 0, len = solution.length; i < len; i++) {
        var word = solution[i].word,
          orientation = solution[i].orientation,
          x = solution[i].x,
          y = solution[i].y,
          next = self.game.orientations[orientation];
        var cord = next(x, y, word.length - 1);
        var x1_click = x * elementSize + (elementSize / 2);
        var y1_click = y * elementSize + (elementSize / 2);
        var x2_click = cord.x * elementSize + (elementSize / 2);
        var y2_click = cord.y * elementSize + (elementSize / 2);
        clickStart = [x1_click, y1_click, x, y];
        clickEnd = [x2_click, y2_click, cord.x, cord.y];
        makeWordFound(word, self.$outputCanvas, false);
      }
    };

    /*
     * function to trigger when the user clicks on the retry button
     * @public
     */
    self.retry = function() {
      self.game = createGame(params);
      self.elementSize = undefined;
      enableDrawing = true;
      found = 0;
      self.$container.empty();
      if (showVocabulary) {
        self.$vocabularyContainer.remove();
      }
      self.$puzzleContainer.remove();

      self.attach(self.$container);
      self.trigger('resize');
    };

    /*
     * function to trigger when the user clicks on the check button
     * @public
     */
    self.displayFeedback = function() {

      var totalScore = self.game.wordList.length;
      self.timer.stop();
      enableDrawing = false;
      //create the retry button
      self.$retryButton = UI.createButton({
        title: 'retryButton',
        click: function(event) {
          self.retry();
        },
        html: '<span><i class="fa fa-refresh" aria-hidden="true"></i></span>&nbsp;' + params.l10n.tryAgain
      });

      self.$progressBar = UI.createScoreBar(totalScore, 'scoreBarLabel');
      self.$progressBar.setScore(found);
      //create the feedback container
      var scoreText = params.l10n.score;
      scoreText = scoreText.replace('@score', found).replace('@total', totalScore);
      self.$feedbackContainer.html('<div class="feedback-text">' + scoreText + '</div>');
      self.$progressBar.appendTo(self.$feedbackContainer);
      if (totalScore !== found) {
        self.$solvePuzzleButton = UI.createButton({
          title: 'Show Solution',
          click: function(event) {
            self.solvePuzzle(wordList);
          },
          html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' + params.l10n.showSolution
        });
        self.$footerContainer.append(self.$solvePuzzleButton);
      }
      self.$footerContainer.append(self.$retryButton);
    };


    /*
     * function to attach the footer section to gamecontainer
     * @public
     */
    self.attachFooter = function($container) {
      self.$footerContainer = $('<div class="footer-container"></div>');
      self.$statusContainer = $('<div class="status-container"></div>');
      self.$timeStatus = $('<div class="time-status"><span><i class="fa fa-clock-o" aria-hidden="true"></i></span>&nbsp;' + params.l10n.timeSpent + '&nbsp;:&nbsp;<span class="h5p-time-spent">0:00</span></div>').appendTo(self.$statusContainer);
      self.$counterStatus = $('<div class="counter-status"/>');
      var counterText = params.l10n.found;
      counterText = counterText.replace('@found', '<span class="h5p-found">' + '0' + '</span>').replace('@totalWords', '<span class="total-words" >' + self.game.wordList.length + '</span>');
      self.$counterStatus.html('<div>' + counterText + '</div>').appendTo(self.$statusContainer);
      //creating the check button
      self.$checkPuzzleButton = UI.createButton({
        title: 'Show Solution',
        click: function(event) {
          self.displayFeedback();
        },
        html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' + params.l10n.check
      });

      self.$feedbackContainer = $('<div class="feedback-container"></div>').append(self.$checkPuzzleButton);
      self.$statusContainer.appendTo(self.$footerContainer);
      self.$feedbackContainer.appendTo(self.$footerContainer);
      $container.append(self.$footerContainer);
      //initialization of timer and counter modules
      self.timer = new FindTheWords.Timer(self.$timeStatus.find('.h5p-time-spent')[0]);
      self.counter = new FindTheWords.Counter(self.$counterStatus.find('.h5p-found'));
    };

    self.game = createGame();

    self.attach = function($container) {

      //task description is optional
      if (params.taskDescription) {
        $container.html('<div class="h5p-task-description" >' + params.taskDescription + '</div>');
      }
      if (self.$gameWrapper === undefined) {
        self.$gameWrapper = $('<div class="game-container" />', {
          html: ''
        });
      }
      // for the puzzle container
      self.$puzzleContainer = $('<div class="puzzle-container"></div>');
      //actual drawing to the canvas is not made here for making it responsive
      self.$gameWrapper.append(self.$puzzleContainer);
      // for the vocabulary container
      // displaying the vocabulary is also optional
      if (params.behaviour.showVocabulary) {
        self.$vocabularyContainer = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
        self.game.drawWords(self.$vocabularyContainer);
        self.$gameWrapper.append(self.$vocabularyContainer);

      }

      $container.addClass('h5p-find-the-words').append(self.$gameWrapper);
      //if there is a vocabulary assign its width
      self.vocabularyWidth = (self.$vocabularyContainer) ? self.$vocabularyContainer.width() : 0;
      self.attachFooter($container);

      // here is where all responsive functionalities of the game is centered on
      self.on('resize', function() {

        //find elementSize
        //initiallly vocabulary container is assumed to be in inline mode

        var puzzle = self.game.puzzle;
        wordList = self.game.wordList.slice(0); //clone
        elementSize = calculateElementSize(false);
        if (elementSize < ELEMENT_MAX_SIZE) {
          //making the vocabulary in block mode , try to increase the elementSize
          elementSize = calculateElementSize(true);
        }

        var canvasWidth = elementSize * puzzle[0].length;
        var canvasHeight = elementSize * puzzle.length;
        var margin = MARGIN;

        // redrawing of the canvas & thereby resetting of the game should take place inside
        if (elementSize != self.elementSize) {
          self.$puzzleContainer.empty().css('height', canvasHeight).css('width', canvasWidth).css('margin', margin + 'px');
          var $gridCanvas = $('<canvas class="canvas-element" height="' + canvasHeight + 'px" width="' + canvasWidth + 'px" />').appendTo(self.$puzzleContainer);
          self.$outputCanvas = $('<canvas class="canvas-element" height="' + canvasHeight + 'px" width="' + canvasWidth + 'px"/>').appendTo(self.$puzzleContainer);
          var $drawingCanvas = $('<canvas class="canvas-element" height="' + canvasHeight + 'px" width="' + canvasWidth + 'px"/>').appendTo(self.$puzzleContainer);
          self.game.drawPuzzle($gridCanvas, elementSize, canvasWidth, canvasHeight);
          //reset the vocabulary
          if (params.behaviour.showVocabulary) {
            self.$vocabularyContainer.remove();
            wordList = self.game.wordList.slice(0);
            self.$vocabularyContainer = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
            self.game.drawWords(self.$vocabularyContainer);
          }
          // reset the footer & associated parameters
          self.$footerContainer.remove();
          found = 0;
          enableDrawing = true;
          wordList = self.game.wordList.slice(0);
          self.attachFooter($container);

          self.elementSize = elementSize;
          //  registering touchstart event listener
          $drawingCanvas[0].addEventListener("touchstart", function(event) {

            event.preventDefault();
            if (enableDrawing) {
              self.timer.play();
            }
            // registering touchmove event listener
            $drawingCanvas[0].addEventListener("touchmove", function(event) {
              touchHandler(event);
            }, false);

            // registering touchend event listener
            $drawingCanvas[0].addEventListener("touchend", function(event) {
              touchHandler(event);
            }, false);

            touchHandler(event);

          }, false);




          // Registering mouse events
          $drawingCanvas.on('mousedown', function(event) {
            if (enableDrawing) {
              self.timer.play();
            }
            $drawingCanvas.on('mouseup', function(event) {

              var markedWord = mouseUpEventHandler(event, this);

              if ($.inArray(markedWord, wordList) != -1) {
                const index = wordList.indexOf(markedWord);
                wordList.splice(index, 1);
                found++;
                self.counter.increment();
                makeWordFound(markedWord, self.$outputCanvas, true);
              }
            });

            $drawingCanvas.on('mousedown', function(event) {
              mouseDownEventHandler(event, this);
            });
            $drawingCanvas.on('mousemove', function(event) {
              mouseMoveEventHandler(event, this);
            });
            mouseDownEventHandler(event, this);
          });
        }

        // reattach vocabulary container on resize
        if (params.behaviour.showVocabulary) {
          var innerhtml = self.$vocabularyContainer.html();
          self.$vocabularyContainer.remove();
          self.$vocabularyContainer = $('<div class="vocabulary-container vocabulary-inline-container"></div>').css('padding-top', MARGIN + 'px').css('padding-bottom', MARGIN + 'px');
          self.$vocabularyContainer.append(innerhtml);
          self.$gameWrapper.append(self.$vocabularyContainer);
          self.vocabularyWidth = (self.$vocabularyContainer) ? self.$vocabularyContainer.width() : 0;
        }

        // check if vocabulary need to be changed from inline mode to block mode or vice versa
        if ((self.vocabularyWidth + canvasWidth + 4 * MARGIN) < self.$gameWrapper.width()) {
          self.$vocabularyContainer.removeClass('vocabulary-block-container').addClass('vocabulary-inline-container').css('height', elementSize * puzzle.length + 'px');
        } else {
          self.$vocabularyContainer.removeClass('vocabulary-inline-container').addClass('vocabulary-block-container').css('width', canvasWidth + 'px');
        }

      });
      self.$container = $container;
    };

  }

  FindTheWords.prototype.constructor = FindTheWords;
  return FindTheWords;
})(H5P.jQuery, H5P.JoubelUI);
