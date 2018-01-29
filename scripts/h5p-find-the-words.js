H5P.FindTheWords = (function($, UI) {

  /**
   * @class H5P.FindTheWords
   * @param {Object} params
   */
  function FindTheWords(params) {

    /** @alias H5P.FindTheWords# */
    var self = this;
    var score = 0;
    var found= 0;
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

    // var mouseMove = function() {
    //   self.gamePuzzle.mouseMove(this);
    // };

    var endTurn = function() {
      score = (self.gamePuzzle.endTurn(this)) ? score + 1 : score;

    };

    /*
    * function to be called when clicking show solution button
    */
    self.solve = function() {

      // self.timer.stop();

      self.$solvePuzzleButton.remove();

      var solution = self.gamePuzzle.solve().found;

      console.log(solution);



      for (var i = 0, len = solution.length; i < len; i++) {
        var word = solution[i].word,
          orientation = solution[i].orientation,
          x = solution[i].x,
          y = solution[i].y,
          next = self.gamePuzzle.orientations[orientation];

          console.log(next(x,y,word.length-1).x);
          cord= next(x,y,word.length-1);

          output=[x,y,cord.x,cord.y,word];

          self.drawOutput(output,self.canvas2,false);

        // if (!$('.' + word).hasClass('wordFound')) {
        //   for (var j = 0, size = word.length; j < size; j++) {
        //     var nextPos = next(x, y, j);
        //     // $('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
        //     self.puzzleContainer.find('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
        //   }
        //
        //   self.vocabularyContainer.find('.' + word).addClass('wordFound');
        // }

      }

      // self.displayFeedback();


    };



    self.displayFeedback = function() {

      var totalScore = self.gamePuzzle.wordList.length+found;
        self.timer.stop();
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
      self.$progressBar.setScore(found);
      //create the feedback container
      self.$feedbacks = $('<div class="feedback-container" />');
      var scoreText = params.l10n.score;
      scoreText = scoreText.replace('@score', found).replace('@total', totalScore);
      self.$feedbacks.html('<div class="feedback-text">' + scoreText + '</div>');
      self.$progressBar.appendTo(self.$feedbacks);
      self.footerContainer.html('').append(self.$status).append(self.$feedbacks);
      if(totalScore !== found){
        self.$solvePuzzleButton = UI.createButton({
          title: 'Show Solution',
          click: function(event) {
            self.solve();
          },
          html: '<span><i class="fa fa-eye" aria-hidden="true"></i></span>&nbsp;' + params.l10n.showSolution
        });
        self.footerContainer.append(self.$solvePuzzleButton);
      }

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

     var wordList;

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

     var drawinit=function(clickStartX,clickStartY,canvas){
       // var context=canvas.getContext("2d");
       // context.clearRect(0,0,canvasWidth,canvasHeight);
       // context.strokeStyle="rgba(107, 177, 125,0.3)";
       // context.fillStyle="rgba(107,177,125,0.8)";
       //
       // context.beginPath();
       // // // Staring point (10,45)
       // var startx=clickStartX*elementSize+(elementSize/2-20)+10;
       // var starty=clickStartY*elementSize+(elementSize/2-10)+10;
       // context.moveTo(startx,starty);
       // context.arc(startx,starty, 10, 0,2*Math.PI);
       // context.lineWidth=35;
       // context.fill();
       // context.closePath();
     }

     var drawLine = function(context){
       context.clearRect(0,0,canvasWidth,canvasHeight);
       context.strokeStyle="rgba(107, 177, 125,0.3)";
       context.fillStyle="rgba(107,177,125,0.8)";

       context.beginPath();
       // Staring point (10,45)
       var startx=clickStartX*elementSize+(elementSize/2-20)+10;
       var starty=clickStartY*elementSize+(elementSize/2-10)+10;
       context.moveTo(startx,starty);
       context.arc(startx,starty, 15, 0,2*Math.PI,false);
       context.lineWidth=30;
       context.fill();
       context.closePath();

       // context.stroke();
       context.beginPath()
       context.moveTo(startx,starty);
       // // End point (180,47)
       context.lineTo(clickDragX,clickDragY);
       context.stroke();
       context.closePath();

       // context.stroke();

       context.beginPath();
       context.moveTo(clickDragX,clickDragY);
       context.arc(clickDragX,clickDragY,15, 0, 2 * Math.PI, true);
       context.fill();
       context.closePath();


       // context.fill();
       // context.stroke();

     }


    var mouseDownEventHandler = function(e,canvas){
      paint = true;
      var x = e.pageX - $(canvas).offset().left;
      var y = e.pageY - $(canvas).offset().top;
      var row1= Math.ceil(x/elementSize);
      var col1= Math.ceil(y/elementSize);

      // console.log("clicked_on"+self.gamePuzzle.puzzle[col1-1][row1-1]);
      console.log("clicking x and y"+x+"_"+y);
      var x_click= (row1-1)*elementSize+(elementSize/2-15)+10;
      var y_click= (col1-1)*elementSize+(elementSize/2-5)+10;
      console.log("element start"+x_click+"_"+y_click);
      addStartClick(row1-1,col1-1);
      drawinit(row1-1,col1-1,canvas);
      var context2 = canvas.getContext("2d");


      // context2.fillRect(x_click,y_click,10,10);

      // drawCordinates(x_click,y_click)


    }

    var mouseMoveEventHandler = function(e,canvas){
      var x = e.pageX - $(canvas).offset().left;
      var y = e.pageY - $(canvas).offset().top;
      if(paint){
        console.log(paint);
        addDragClick(x,y);
        drawLine(canvas.getContext("2d"));
      }
    }

    var mouseUpEventHandler = function(e,canvas){
      if(paint){
        var x = e.pageX - $(canvas).offset().left;
        var y = e.pageY - $(canvas).offset().top;
        var row1= Math.ceil(x/elementSize);
        var col1= Math.ceil(y/elementSize);
        var x_click= (row1-1)*elementSize+(elementSize/2-15)+10;
        var y_click= (col1-1)*elementSize+(elementSize/2-5)+10;

        if((Math.abs(x_click-x)<10)&&(Math.abs(y_click-y)<10)){
          var context2 = canvas.getContext("2d");
          context2.arc(x_click, y_click, 10, 0, 2 * Math.PI, true);
          context2.fill();
          addEndClick(row1-1,col1-1);

          //valid end process
          var obtainedWord=processLine(clickStartX,clickStartY,clickEndX,clickEndY);

          if(obtainedWord){
            canvas.getContext("2d").closePath();
            paint= false;
            return [clickStartX,clickStartY,clickEndX,clickEndY,obtainedWord];
          }

        }

        canvas.getContext("2d").closePath();
        paint= false;

        return;



      }

    }

    var processLine = function(x1,y1,x2,y2){

      var x;
      var y;
      x= directionalValue(x1,x2);
      y= directionalValue(y1,y2);



      if(possible(x,y,x1,y1,x2,y2)){
        var markedWord='';
        do{
          markedWord+=self.gamePuzzle.puzzle[y1][x1];
          x1=x1+x;
          y1=y1+y;
        }while(!((y1 == y2)&&(x1 == x2)) )

        markedWord+=self.gamePuzzle.puzzle[y2][x2];
        console.log(markedWord);

        if($.inArray(markedWord,wordList) != -1){

          return markedWord;
        }else {
          return;
        }
      }else{
        return;
      }



    }

    var directionalValue=function(x1,x2){
      var x;
      if(x2>x1){
        x=1;
      }else if(x2<x1){
        x=-1;
      }else{
        x=0;
      }
      return x;
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
        return true;

      }else{
        return false;
      }

    }

self.drawOutput=function(output,canvas2,solved){



  self.counter.increment();
  found++;


  context=canvas2.getContext("2d");
  context.globalCompositeOperation='destination-over';

  if(solved){
    self.vocabularyContainer.find('.' + output[4]).addClass('wordFound');
    const index = wordList.indexOf(output[4]);
    wordList.splice(index, 1);

    if (wordList.length === 0) {
      // this.trigger('complete');
      console.log('complete');
    }
    context.strokeStyle="rgba(107,177,125,0.3)";
    context.fillStyle="rgba(107,177,125,0.8)";
  }
  else{
    self.vocabularyContainer.find('.' + output[4]).addClass('wordSolved');
    context.strokeStyle="rgba(51, 102, 255,0.3)";
    context.fillStyle="rgba(51, 102, 255,0.8)";
    context.setLineDash([1, 1])
  }

  context.lineWidth=30;
  context.beginPath();
  // Staring point (10,45)
  var startx=output[0]*elementSize+(elementSize/2)-10;
  var starty=output[1]*elementSize+(elementSize/2);
  var endx=output[2]*elementSize+(elementSize/2)-10;
  var endy=output[3]*elementSize+(elementSize/2);

  context.moveTo(startx,starty);
  context.arc(startx,starty, 15, 0,2*Math.PI,true);
  context.lineWidth=30;
  context.fill();
  context.closePath();


  context.beginPath()
  context.moveTo(startx,starty);
  // // End point (180,47)
  context.lineTo(endx,endy);
  context.stroke();
  context.closePath();

  // context.stroke();

  context.beginPath();
  context.moveTo(endx,endy);
  context.arc(endx,endy,15, 0, 2 * Math.PI, true);
  context.fill();
  context.closePath();







}





    self.attach = function($container) {

      // console.log($container.width());
      var row = self.gamePuzzle.puzzle.length;
      var col = self.gamePuzzle.puzzle[0].length;

      var requiredMinWidth = ITEM_MIN_SIZE * col;
      var requiredMaxWidth = ITEM_MAX_SIZE * col;

      var containerWidth = $container.width();
      console.log(containerWidth);
      var segmentWidth = containerWidth/3;
      var puzzleWidth;
      var vocabularyWidth;
      var elementWidth;

      if(showVocabulary){

        puzzleWidth = segmentWidth * 2;
        vocabularyWidth = segmentWidth;

      }else{
        //diplay as two blocks
        puzzleWidth = containerWidth;
        vocabularyWidth= containerWidth;

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
      self.vocabularyContainer = $('<div class="vocabularyContainer"></div>').appendTo(self.$wrapper);



      var $gridCanvas = $('<canvas class="gridCanvas" height="'+canvasHeight+'px" width="'+canvasWidth+'px" />').appendTo(self.puzzleContainer);



      self.gamePuzzle.drawPuzzle($gridCanvas,elementSize,canvasWidth,canvasHeight);
      self.gamePuzzle.drawWords(self.vocabularyContainer);

      wordList=self.gamePuzzle.wordList;

      var $outputCanvas =  $('<canvas class="outputCanvas" height="'+canvasHeight+'px" width="'+canvasWidth+'px"/>').appendTo(self.puzzleContainer);
      var $drawingCanvas = $('<canvas class="drawingCanvas" height="'+canvasHeight+'px" width="'+canvasWidth+'px"/>').appendTo(self.puzzleContainer);
      var canvas=$drawingCanvas[0];
      var canvas2=$outputCanvas[0];
      self.canvas2 = canvas2;
      $drawingCanvas.on('mousedown',function(event){

          self.timer.play();

       $drawingCanvas.on('mouseup',function(event){
         var output=mouseUpEventHandler(event,this);

         canvas.getContext("2d").clearRect(0,0,canvasWidth,canvasHeight);

         if(output){



            self.drawOutput(output,canvas2,true);


         }

       });
       $drawingCanvas.on('mousemove',function(event){
         mouseMoveEventHandler(event,this);
       });
       $drawingCanvas.on('mousedown',function(event){
         mouseDownEventHandler(event,this);
       });


        mouseDownEventHandler(event,this);

      });



      self.footerContainer = $('<div class="footerContainer"></div>');

      self.$checkPuzzleButton = UI.createButton({
        title: 'Show Solution',
        click: function(event) {
          // self.solve();
          self.displayFeedback();
        },
        html: '<span><i class="fa fa-check" aria-hidden="true"></i></span>&nbsp;' + params.l10n.check
      });




      // self.gamePuzzle.print(); // print the puzzle to console..useful for debugging

      self.$status = $('<dl class="sequencing-status">' + '<dt>' + 'parameters.l10n.timeSpent' + '</dt>' + '<dd class="h5p-time-spent">0:00</dd>' +
          '<dt>' + 'words found' + '</dt>' + '<dd class="h5p-submits">0</dd></dl>');

        self.$counter = $('<div class="counter-container" />');

          var counterText = params.l10n.found;
          counterText = counterText.replace('@found', '<span class="h5p-found">'+found+'</span>').replace('@totalWords', self.gamePuzzle.wordList.length);
          self.$counter.html('<div class="feedback-text">' + counterText + '</div>');


      self.footerContainer.append(self.$status);
      self.footerContainer.append(self.$counter)
      self.footerContainer.append(self.$checkPuzzleButton);
      // self.$wrapper.append(self.puzzleContainer);
      // self.$wrapper.append(self.vocabularyContainer);
      //
      // //attach task description
      // if(params.taskDescription){
      //   $container.html('<div class="h5p-task-description" >' + params.taskDescription + '</div>');
      // }
      // $container.addClass('h5p-word-find').append(self.$wrapper);
      $container.append(self.footerContainer);

      self.counter = new FindTheWords.Counter(self.$counter.find('.h5p-found'));
      self.$container = $container;
      //
      self.timer = new FindTheWords.Timer(self.$status.find('.h5p-time-spent')[0]);


      // self.trigger('resize');

      self.on('resize',function(){
        console.log(self.vocabularyContainer.width());
        console.log(self.$container.width());
        console.log(self.puzzleContainer.width());
        if(250+self.puzzleContainer.width() > self.$container.width()){
          self.vocabularyContainer.removeClass('vocabularyInlineContainer').addClass('vocabularyBlockContainer');
          self.vocabularyContainer.css('height','auto');
          // self.$container.addClass('inline');

        }else{
            self.vocabularyContainer.removeClass('vocabularyBlockContainer').addClass('vocabularyInlineContainer');
            self.vocabularyContainer.css('height',canvasHeight+'px');
            // self.$container.removeClass('inline');
        }

      });

      self.trigger('resize');

    };


  }
  FindTheWords.prototype.constructor = FindTheWords;
  return FindTheWords;
})(H5P.jQuery, H5P.JoubelUI);
