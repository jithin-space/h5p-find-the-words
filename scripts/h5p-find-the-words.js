H5P.FindTheWords = (function($, UI) {

  /**
   * @class H5P.FindTheWords
   * @param {Object} params
   */
  function FindTheWords(params) {

    /** @alias H5P.FindTheWords# */
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
      self.timer.play();
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

      self.timer.stop();

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
      self.footerContainer.html('').append(self.$status).append(self.$feedbacks);
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
    // // self.resize = function() {
    // //   var containerWidth = (self.$wrapper.width()*70)/100;
    // //   var row = self.gamePuzzle.puzzle.length;
    // //   var col = self.gamePuzzle.puzzle[0].length;
    // //   var level = (col > row) ? col : row;
    // //   var elementWidth = (containerWidth - (6 * level) - 4 - 40) / level;
    // //   //set the grid elements size
    // //
    // //   if((elementWidth > 16)&&(elementWidth < 64)){
    // //     self.puzzleContainer.find('.puzzleSquare').css({
    // //       'width': elementWidth + 'px',
    // //       'height': elementWidth + 'px',
    // //       'line-height': elementWidth +'px'
    // //     });
    // //   }else if(elementWidth < 16){
    // //     self.puzzleContainer.find('.puzzleSquare').css({
    // //       'width': 16+ 'px',
    // //       'height': 16+ 'px',
    // //       'line-height': 16 +'px'
    // //     });
    // //   }else{
    // //     self.puzzleContainer.find('.puzzleSquare').css({
    // //       'width': 64+ 'px',
    // //       'height': 64+ 'px',
    // //       'line-height': 64 +'px'
    // //     });
    // //   }
    //
    //
    //
    //   //set the line-height of vocabulary words
    //   self.vocabularyContainer.find('li').css({
    //     'line-height': ((elementWidth * row + 80) / (self.vocLength + 1)) + "px"
    //   });
    //
    // };



    self.gamePuzzle = create(params);

    // when user finds all words
    self.gamePuzzle.on('complete', function() {
      self.puzzleContainer.find('.puzzleSquare').addClass('complete');
        self.timer.stop();
      self.displayFeedback();
    });

    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */


     var ITEM_MIN_SIZE = 16;
     var ITEM_MAX_SIZE = 64;
     var showVocabulary = true;

     var clickStartX;
     var clickStartY;

     var clickEndX;
     var clickEndY;

     var clickDragX;
     var clickDragY;

     var paint;
     var context;
     var canvas;

     var canvasWidth;
     var canvasHeight;
     var elementSize;

     var addStartClick = function (x,y){
       clickStartX =x;
       clickStartY = y
     }

     var addEndClick = function(x,y){
       clickEndX=x;
       clickEndY=y;
     }

     var addDragClick = function(x,y){
       clickDragX=x;
       clickDragY=y;
     }

     var drawLine = function(){
       context.clearRect(0,0,448,512);
       context.beginPath();
       // Staring point (10,45)
        context.moveTo(clickStartX,clickStartY);
       // End point (180,47)
       context.lineTo(clickDragX,clickDragY);
       // Make the line visible
       context.stroke();
     }


    var mouseDownEventHandler = function(e,canvas){
      paint = true;
      var x = e.pageX - $(canvas).offset().left;
      var y = e.pageY - $(canvas).offset().top;
      var row1= Math.ceil(x/elementSize);
      var col1= Math.ceil(y/elementSize);
      console.log(x+'_'+y);
      console.log(row1+'_'+col1);
      console.log(self.gamePuzzle.puzzle[col1-1][row1-1]);
      // addStartClick(x,y);
    }

    var mouseMoveEventHandler = function(e){

      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;
      if(paint){
        addDragClick(x,y);
        drawLine();
      }
    }

    var mouseUpEventHandler = function(e){
      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;
      context.closePath();
      paint=false;
      addEndClick(x,y);
      processLine(clickStartX,clickStartY,clickEndX,clickEndY);
    }

    var processLine = function(x1,y1,x2,y2){
        var row1= Math.ceil(x1/elementSize);
        var col1= Math.ceil(y1/elementSize)-1;
        var row2= Math.ceil(x2/elementSize);
        var col2= Math.ceil(y2/elementSize)-1;
        console.log(x1+'_'+y1+'_'+x2+'_'+y2+'_'+elementSize);
        console.log(row1+'_'+col1+'_'+row2+'_'+col2);

        checkDirection(row1,col1,row2,col2);


    }

    var checkDirection=function(x1,y1,x2,y2){

      var x;
      var y;

      if(x2>x1){
        //possible directions--downward
        x=1;

      }else if(x2<x1){
        //possible direction--upward
        x=-1;
      }else{
        //possible direction-- horizontal
        x=0;
      }

      if(y2>y1){
        //possible directions--towardsright
        y=1;

      }else if(y2<y1){
        //possible direction--towardsleft
        y=-1;
      }else{
        //possible direction-- horizontal
        y=0;
      }

      return possible(x,y,x1,y1,x2,y2);
    }

    var possible = function(dirx,diry,x1,y1,x2,y2){
      var y=y1;
      var x=x1;
      if(dirx !=0){
        while(x != x2){
          x= x+dirx;
          y=y+diry;
          console.log(x+'_'+y);
        }
      }else{
        while(y != y2){
          y=y+diry;
        }
      }

      if(y2==y){
        //find the marked word
        var markedWord='';
        do{
          markedWord+=self.gamePuzzle.puzzle[y1][x1-1];
          console.log(y2+'____'+y1+'and'+x1+'--------'+x2);
          x1=x1+dirx;
          y1=y1+diry;
        }while(!((y1 == y2)&&(x1 == x2)) )
        markedWord+=self.gamePuzzle.puzzle[y2][x2-1];
        console.log(markedWord);
        console.log(self.gamePuzzle.wordList);
        if($.inArray(markedWord,self.gamePuzzle.wordList) != -1){
          console.log('correct marking');

          context2=canvas2.getContext('2d');

          context2.strokeStyle = "blue";
          context2.lineJoin = "round";
          context2.lineWidth = 2;


          context2.beginPath();
          // Staring point (10,45)
           context2.moveTo(clickStartX,clickStartY);
          // End point (180,47)
          context2.lineTo(clickEndX,clickEndY);
          // Make the line visible
          context2.stroke();
        }

      }else{
        console.log('not a valid marking');
      }

    }




    self.attach = function($container) {

      // console.log($container.width());
      var row = self.gamePuzzle.puzzle.length;
      var col = self.gamePuzzle.puzzle[0].length;

      var requiredMinWidth = ITEM_MIN_SIZE * col;
      var requiredMaxWidth = ITEM_MAX_SIZE * col;

      var containerWidth = $container.width();
      var segmentWidth = Math.floor(containerWidth/3)
      var puzzleWidth;
      var vocabularyWidth;
      var elementWidth;

      if(showVocabulary){

        puzzleWidth = segmentWidth * 2;
        vocabularyWidth = segmentWidth;

      }else{
        //diplay as two blocks
        puzzleWidth = containerWidth;
        vocabulareWidth= containerWidth;

      }

      elementWidth= Math.floor(puzzleWidth / col);

        if((elementWidth >ITEM_MIN_SIZE) & (elementWidth < ITEM_MAX_SIZE)){

          elementSize  = elementWidth;
        }
        else if (elementWidth > 64){

          elementSize = 64;
        }else{

            elementSize =16;
        }


       canvasWidth = elementSize*col;
       canvasHeight = elementSize*row;

      if (self.$wrapper === undefined) {
        self.$wrapper = $('<div class="gameContainer" />', {
          html: ''
        });
      }

      $container.addClass('h5p-word-find').append(self.$wrapper);

      self.puzzleContainer = $('<div class="puzzleContainer" style="height:'+canvasHeight+'px;width:'+canvasWidth+'px;"></div>').appendTo(self.$wrapper);
      self.vocabularyContainer = $('<div class="vocabularyContainer" style="min-height:'+canvasHeight+'px"></div>').appendTo(self.$wrapper);

      var $gridCanvas = $('<canvas class="gridCanvas" height="'+canvasHeight+'px" width="'+canvasWidth+'px" />').appendTo(self.puzzleContainer);



      self.gamePuzzle.drawPuzzle($gridCanvas,elementSize,canvasWidth,canvasHeight);
      self.gamePuzzle.drawWords(self.vocabularyContainer);

      var $outputCanvas =  $('<canvas class="outputCanvas" height="'+canvasHeight+'px" width="'+canvasWidth+'px"/>').appendTo(self.puzzleContainer);


      $outputCanvas.on('mousedown',function(event){


        // $gridCanvas.addEventListener('mouseup', mouseUpEventHandler);
        // canvas.addEventListener('mousemove', mouseMoveEventHandler);
        // canvas.addEventListener('mousedown', mouseDownEventHandler);

        mouseDownEventHandler(event,this);

      });





      // var $canvas = $('<canvas height="'+canvasHeight+'px" width="'+canvasWidth+'px" style="z-index:3"/>').appendTo(self.$wrapper);
      // var $canvas2 = $('<canvas height="'+canvasHeight+'px" width="'+canvasWidth+'px" style="z-index:2"/>').appendTo(self.$wrapper);
      //
      //
      // self.gamePuzzle.drawPuzzle(self.$wrapper,elementSize,canvasWidth,canvasHeight);
      //
      // canvas = $canvas[0];
      // canvas2 = $canvas2[0];
      // context = canvas.getContext("2d");
      // context.strokeStyle = "#ff0000";
      // context.lineJoin = "round";
      // context.lineWidth = 25;
      //
      //
      // $canvas.on('mousedown',function(event){
      //  canvas.addEventListener('mouseup', mouseUpEventHandler);
      //  canvas.addEventListener('mousemove', mouseMoveEventHandler);
      //  canvas.addEventListener('mousedown', mouseDownEventHandler);
      //  mouseDownEventHandler(event);
      // });
      // $canvas.on('drag',function(event){
      //   console.log('mousemoving');
      // });
      // $canvas.on('dragend',function(event){
      //   console.log(event.pageX);
      // });

      // self.puzzleContainer = $('<div class="puzzleContainer"></div>');
      // self.vocabularyContainer = $('<div class="vocabularyContainer"></div>');
      // self.footerContainer = $('<div class="footerContainer"></div>');
      //
      // self.$solvePuzzleButton = UI.createButton({
      //   title: 'Show Solution',
      //   click: function(event) {
      //     self.solve();
      //   },
      //   html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' + params.l10n.showSolution
      // });
      //
      // if (self.$wrapper === undefined) {
      //   self.$wrapper = $('<div class="gameContainer"/>', {
      //     html: ''
      //   });
      // }
      // self.gamePuzzle.drawPuzzle(self.puzzleContainer);
      // self.gamePuzzle.drawWords(self.vocabularyContainer);
      //
      // self.gamePuzzle.print(); // print the puzzle to console..useful for debugging
      //
      // self.$status = $('<dl class="sequencing-status">' + '<dt>' + 'parameters.l10n.timeSpent' + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
      //     '</dl>');
      //
      //
      // self.footerContainer.append(self.$status);
      // self.footerContainer.append(self.$solvePuzzleButton);
      // self.$wrapper.append(self.puzzleContainer);
      // self.$wrapper.append(self.vocabularyContainer);
      //
      // //attach task description
      // if(params.taskDescription){
      //   $container.html('<div class="h5p-task-description" >' + params.taskDescription + '</div>');
      // }
      // $container.addClass('h5p-word-find').append(self.$wrapper);
      // $container.append(self.footerContainer);
      // self.$container = $container;
      //
      // self.timer = new FindTheWords.Timer(self.$status.find('.h5p-time-spent')[0]);
      // self.puzzleContainer.find('.puzzleSquare').mousedown(startTurn);
      // self.puzzleContainer.find('.puzzleSquare').mouseenter(mouseMove);
      // self.puzzleContainer.find('.puzzleSquare').mouseup(endTurn);
      //
      //
      // // when window size changes trigger resize function
      // self.on('resize', function() {
      //   self.resize();
      // });

      self.trigger('resize');

    };


  }
  FindTheWords.prototype.constructor = FindTheWords;
  return FindTheWords;
})(H5P.jQuery, H5P.JoubelUI);
