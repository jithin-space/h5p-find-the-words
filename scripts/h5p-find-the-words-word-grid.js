(function (FindTheWords, EventDispatcher, $) {

  FindTheWords.WordGrid = function (params) {

    EventDispatcher.call(this);

    const allOrientations = ['horizontal', 'horizontalBack', 'vertical', 'verticalUp',
      'diagonal', 'diagonalUp', 'diagonalBack', 'diagonalUpBack'
    ];

    this.options = $.extend({
      height: 7,
      width: 7,
      orientations: allOrientations,
      fillBlanks: true,
      maxAttempts: 3,
      preferOverlap: true,
      gridActive: true
    },params);





    this.createWordGrid();

  };

  FindTheWords.WordGrid.prototype = Object.create(EventDispatcher.prototype);
  FindTheWords.WordGrid.prototype.constructor = FindTheWords.WordGrid;

  const orientations = {
    horizontal: function (x, y, i) {
      return {
        x: x + i,
        y: y
      };
    },
    horizontalBack: function (x, y, i) {
      return {
        x: x - i,
        y: y
      };
    },
    vertical: function (x, y, i) {
      return {
        x: x,
        y: y + i
      };
    },
    verticalUp: function (x, y, i) {
      return {
        x: x,
        y: y - i
      };
    },
    diagonal: function (x, y, i) {
      return {
        x: x + i,
        y: y + i
      };
    },
    diagonalBack: function (x, y, i) {
      return {
        x: x - i,
        y: y + i
      };
    },
    diagonalUp: function (x, y, i) {
      return {
        x: x + i,
        y: y - i
      };
    },
    diagonalUpBack: function (x, y, i) {
      return {
        x: x - i,
        y: y - i
      };
    }
  };

  const checkOrientations = {
    horizontal: function (x, y, h, w, l) {
      return w >= x + l;
    },
    horizontalBack: function (x, y, h, w, l) {
      return x + 1 >= l;
    },
    vertical: function (x, y, h, w, l) {
      return h >= y + l;
    },
    verticalUp: function (x, y, h, w, l) {
      return y + 1 >= l;
    },
    diagonal: function (x, y, h, w, l) {
      return (w >= x + l) && (h >= y + l);
    },
    diagonalBack: function (x, y, h, w, l) {
      return (x + 1 >= l) && (h >= y + l);
    },
    diagonalUp: function (x, y, h, w, l) {
      return (w >= x + l) && (y + 1 >= l);
    },
    diagonalUpBack: function (x, y, h, w, l) {
      return (x + 1 >= l) && (y + 1 >= l);
    }
  };

  const skipOrientations = {
    horizontal: function (x, y, l) {
      return {
        x: 0,
        y: y + 1
      };
    },
    horizontalBack: function (x, y, l) {
      return {
        x: l - 1,
        y: y
      };
    },
    vertical: function (x, y, l) {
      return {
        x: 0,
        y: y + 100
      };
    },
    verticalUp: function (x, y, l) {
      return {
        x: 0,
        y: l - 1
      };
    },
    diagonal: function (x, y, l) {
      return {
        x: 0,
        y: y + 1
      };
    },
    diagonalBack: function (x, y, l) {
      return {
        x: l - 1,
        y: x >= l - 1 ? y + 1 : y
      };
    },
    diagonalUp: function (x, y, l) {
      return {
        x: 0,
        y: y < l - 1 ? l - 1 : y + 1
      };
    },
    diagonalUpBack: function (x, y, l) {
      return {
        x: l - 1,
        y: x >= l - 1 ? y + 1 : y
      };
    }
  };


  const calcOverlap = function (word, wordGrid, x, y, fnGetSquare) {

    let overlap = 0;

    for ( let index = 0 ; index < word.length; index++) {
      const next = fnGetSquare(x, y, index);
      const square = wordGrid[next.y][next.x];

      if (square === word[index]) {
        overlap++;
      }
      else if (square !== '') {
        return -1;
      }
    }
    // word.forEach(function (letter, index) {
    //   const next = fnGetSquare(x, y, index);
    //   const square = wordGrid[next.y][next.x];
    //
    //   if (square === letter) {
    //     overlap++;
    //   }
    //   else if (square !== '') {
    //     return -1;
    //   }
    // });

    return overlap;
  };

  const findBestLocations = function (wordGrid, options, word) {

    let locations = [];
    const height = options.height;
    const width = options.width;
    const wordLength = word.length;
    let maxOverlap = 0;

    options.orientations.forEach(function (orientation) {

      const check = checkOrientations[orientation];
      const next = orientations[orientation];
      const skipTo = skipOrientations[orientation];

      let x = 0;
      let y = 0;

      while (y < height) {

        if (check(x,y,height,width,wordLength)) {

          const overlap = calcOverlap(word, wordGrid, x, y, next);

          if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1 )) {
            maxOverlap = overlap;
            locations.push({
              x: x,
              y: y,
              orientation: orientation,
              overlap: overlap
            });
          }
          x++;
          if ( x >= width) {
            x = 0;
            y++;
          }
        }
        else {
          const nextPossible = skipTo(x, y, wordLength);
          x = nextPossible.x;
          y = nextPossible.y;
        }
      }

    });

    return locations;

  };

  // const placeWord = function (wordGrid, word, x, y, fnGetSquare) {
  //   word.forEach(function (letter, index) {
  //     const next = fnGetSquare(x, y, index);
  //     wordGrid[next.y][next.x] = letter;
  //   });
  // };
  //

  const placeWordInGrid = function (wordGrid, options, word) {

    const locations = findBestLocations(wordGrid, options, word);

    if (locations.length === 0) {
      return false;
    }

    const selectedLoc = locations[Math.floor(Math.random() * locations.length)];

    // placeWord(wordGrid, word, selectedLoc.x, selectedLoc.y, orientations[selectedLoc.orientation]);
    // word.forEach(function (letter, index) {
    //   const next = orientations[selectedLoc.orientation](selectedLoc.x, selectedLoc.y, index);
    //   wordGrid[next.y][next.x] = letter;
    // });

    for ( let index=0; index < word.length; index++) {
      const next = orientations[selectedLoc.orientation](selectedLoc.x, selectedLoc.y, index);
      wordGrid[next.y][next.x] = word[index];
    }

    return true;
  }

  const fillGrid = function (words, options) {
    let wordGrid = new Array(options.height).fill([]).map(function () {
      return new Array(options.width).fill('');
    });

    for (let i in words) {
      if (!placeWordInGrid(wordGrid, options, words[i])) {
        return null;
      }
    }

    return wordGrid;
  }

  const fillBlanks = function (wordGrid) {

    const letters = 'abcdefghijklmnoprstuvwy';

    wordGrid.forEach(function (row , index1) {
      row.forEach(function (element, index2) {
        if (!element) {
          let randomLetter = Math.floor(Math.random() * letters.length);
          wordGrid[index1][index2] = letters[randomLetter];
        }
      });
    });

    return wordGrid;

  }


  // const event handlerss

  /*
   * function to calculate the cordinates & grid postions at which the event occured
   */
  const calculateCordinates = function (x,y, elementSize) {
    const row1 = Math.floor(x / elementSize);
    const col1 = Math.floor(y / elementSize);
    const x_click = row1 * elementSize + (elementSize / 2);
    const y_click = col1 * elementSize + (elementSize / 2);
    return [x_click, y_click, row1, col1];
  };

  /*
   * function to post process the line drawn to find if it is a valid marking
   * in terms of possible grid directions
   * returns directional value if it is a valid marking
   * else return false
   */
  const getValidDirection = function (x1,y1,x2,y2) {

    const dirx = (x2>x1)?1:((x2<x1)?-1:0);
    const diry = (y2>y1)?1:((y2<y1)?-1:0);

    let y = y1;
    let x = x1;
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
  const mouseDownEventHandler = function (e, canvas, elementSize) {
    const x = e.pageX - $(canvas).offset().left;
    const y = e.pageY - $(canvas).offset().top;
    return calculateCordinates(x,y, elementSize);
  };


  /*
   * event handler for handling mousemove events
   * @private
   */

  const mouseMoveEventHandler = function (e, canvas, srcPos,eSize) {



    const offsetTop = ($(canvas).offset().top > eSize*0.75)? Math.floor(eSize*0.75): $(canvas).offset().top;

    const desX = e.pageX - $(canvas).offset().left;
    const desY = e.pageY - Math.abs(offsetTop);

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // context.strokeStyle = "rgba(107,177,125,0.9)";
    context.fillStyle = "rgba(107,177,125,0.3)";

    context.beginPath();
    context.lineCap="round";
    context.moveTo(srcPos[0] - (eSize/8), srcPos[1] + (offsetTop/8));
    context.strokeStyle = "rgba(107,177,125,0.4)";
    context.lineWidth = Math.floor(eSize/2);
    context.lineTo(desX - (eSize/8), desY +(offsetTop/8));
    context.stroke();
    context.closePath();

  };


  /*
   * event handler for handling mouseup events
   * @private
   */
  var mouseUpEventHandler = function (e, canvas,elementSize, clickStart) {
    let wordObject = {};
    const offsetTop = ($(canvas).offset().top > elementSize*0.75)? Math.floor(elementSize*0.75)*(-1): $(canvas).offset().top;
    const x = e.pageX - $(canvas).offset().left;
    const y = e.pageY - Math.abs(offsetTop);
    const clickEnd = calculateCordinates(x,y, elementSize);

    if ((Math.abs(clickEnd[0] - x) < 20) && (Math.abs(clickEnd[1] - y) < 15)) {
      //drag ended within permissible range
      wordObject = {
        'start': clickStart,
        'end': clickEnd,
        'dir': getValidDirection(clickStart[2],clickStart[3],clickEnd[2],clickEnd[3])
      };
    }

    canvas.getContext("2d").closePath();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    return wordObject;
  };


  const touchHandler = function (event) {

    const touches = event.changedTouches;
    const  first = touches[0];
    const simulatedEvent = document.createEvent('MouseEvent');
    let type = '';

    switch (event.type) {
      case 'touchstart':
        type = "mousedown";
        break;
      case 'touchmove':
        type = "mousemove";
        break;
      case 'touchend':
        type = "mouseup";
        break;
      default:
        return;
    }


    simulatedEvent.initMouseEvent(type, true, true, window, 1,
      first.screenX, first.screenY,
      first.clientX, first.clientY, false,
      false, false, false, 0 /*left*/ , null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
  };



    // if (paint) {
    //
    //   var x = e.pageX - $(canvas).offset().left;
    //   var y = e.pageY - $(canvas).offset().top;
    //   var cordinate = calculateCordinates(x,y, canvas);
    //   var x_click = cordinate[0];
    //   var y_click = cordinate[1];
    //   if ((Math.abs(x_click - x) < 20) && (Math.abs(y_click - y) < 10)) {
    //     //drag ended within permissible orange
    //     clickEnd = cordinate;
    //     var isDir = processDrawnLine(clickStart[2],clickStart[3],clickEnd[2],clickEnd[3]);
    //     //if it is a valid directional marking.
    //     if (isDir !== false) {
    //       var y1 = clickStart[3];
    //       var x1 = clickStart[2];
    //       var x2 = clickEnd[2];
    //       var y2 = clickEnd[3];
    //
    //       do {
    //         markedWord += self.game.puzzle[y1][x1];
    //         x1 = x1 + isDir[0];
    //         y1 = y1 + isDir[1];
    //       } while (!((y1 == y2) && (x1 == x2)));
    //
    //       markedWord += self.game.puzzle[y2][x2];
    //
    //     }
    //   }

    //   canvas.getContext("2d").closePath();
    //   canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    //   paint = false;
    //   return markedWord;
    // }



  FindTheWords.WordGrid.prototype.createWordGrid = function () {

    let wordGrid = null ;
    let attempts = 0;

    const wordList = this.options.vocabulary.slice(0).sort(function (a, b) {
      return (a.length < b.length) ? 1 : 0;
    });

    while ( !wordGrid) {
      // TODO : check this while
      while (!wordGrid  && attempts++ < this.options.maxAttempts) {
        // TODO : pass only the required parameters
        wordGrid = fillGrid(wordList, this.options);
      }

      if (!wordGrid) {
        this.options.height++;
        this.options.width++;
        attempts = 0;
      }
    }

    // fill in empty spaces with random letters
    if (this.options.fillBlanks) {
      wordGrid = fillBlanks(wordGrid);
    }

    //set the output puzzle

    this.wordGrid = wordGrid;
  };


  FindTheWords.WordGrid.prototype.markWord = function (wordParams) {
    const context = this.$outputCanvas[0].getContext("2d");
    const offsetTop = (this.$container.offset().top > this.elementSize*0.75)? Math.floor(this.elementSize*0.75)*(-1): this.$container.offset().top;


    context.strokeStyle = "rgba(107,177,125,0.9)";
    context.fillStyle = "rgba(107,177,125,0.3)";

    if (!this.options.gridActive) {
      context.strokeStyle = "rgba(51, 102, 255,0.9)";
      context.fillStyle = "rgba(51, 102, 255,0.1)";
      context.setLineDash([8, 4]);
    }




    // drawLine($canvas[0], clickEnd[0], clickEnd[1]);
    // start of rewriting
    // var cordinates = calculateCordinates(endx,endy,canvas);

    const dirKey = wordParams['directionKey'];
    const clickStart = wordParams['start'];
    const clickEnd = wordParams['end'];


    let startingAngle;
    switch (dirKey) {
      case 'horizontal': {
        startingAngle = (Math.PI/2);
        break;
      }
      case 'horizontalBack': {
        startingAngle = -(Math.PI/2);
        break;
      }
      case 'diagonal': {
        startingAngle = 3*(Math.PI/4);
        break;
      }
      case 'diagonalBack': {
        startingAngle = 5*(Math.PI/4);
        break;
      }
      case 'diagonalUp': {
        startingAngle = (Math.PI/4);
        break;
      }
      case 'diagonalUpBack': {
        startingAngle = -(Math.PI/4);
        break;
      }
      case 'vertical': {
        startingAngle = (Math.PI);
        break;
      }
      case 'verticalUp': {
        startingAngle = 0;
        break;
      }
    }
    context.beginPath();
    context.lineWidth = 2;

    const topRadius = Math.floor(this.elementSize/8);
    const bottomRadius = Math.abs(Math.floor(offsetTop/8));
    const lineWidth = Math.floor(this.elementSize/4);

    context.arc(clickStart[0] - topRadius, clickStart[1] + bottomRadius,lineWidth,startingAngle,startingAngle+(Math.PI));
    context.arc(clickEnd[0] - topRadius, clickEnd[1] + bottomRadius,lineWidth,startingAngle+(Math.PI),startingAngle+(2*Math.PI));
    context.closePath();
    context.stroke();
    context.fill();


    // end of rewriting
  };

  FindTheWords.WordGrid.prototype.mark = function (wordList) {
    const words = wordList;
    const that = this;
    const options = {
      height: this.wordGrid.length,
      width: this.wordGrid[0].length,
      orientations: this.options.orientations,
      preferOverlap: this.options.preferOverlap
    };
    const found = [];
    const notFound = [];

    words.forEach(function (word) {
      let locations = findBestLocations(that.wordGrid,options,word);
      if (locations.length > 0 && locations[0].overlap === word.length) {
        locations[0].word = word;
        found.push(locations[0]);
      }
      else {
        notFound.push(word);
      }
    });

    this.markSolution(found);

  };

  FindTheWords.WordGrid.prototype.markSolution = function (solutions) {

    const that = this;

    solutions.forEach(function (solution) {
      const next = orientations[solution.orientation];
      const word = solution.word;
      const startX= solution.x;
      const startY= solution.y;
      const endPos = next(startX,startY,word.length-1);

      const clickStartX = startX * that.elementSize + (that.elementSize / 2);
      const clickStartY = startY * that.elementSize + (that.elementSize / 2);
      const clickEndX = endPos.x * that.elementSize + (that.elementSize / 2);
      const clickEndY = endPos.y * that.elementSize + (that.elementSize / 2);

      const wordParams = {
        'start': [clickStartX,clickStartY,startX,startY],
        'end': [clickEndX,clickEndY,endPos.x,endPos.y],
        'directionKey': solution.orientation
      };

      that.markWord(wordParams);


    });


  };

  FindTheWords.WordGrid.prototype.disableGrid = function () {
    this.options.gridActive = false;
  };

  FindTheWords.WordGrid.prototype.enableGrid = function () {
    this.options.gridActive = true;
  };


  FindTheWords.WordGrid.prototype.appendTo = function ($container, elementSize) {


    this.$container = $container;
    this.canvasWidth = elementSize * this.wordGrid[0].length;
    this.canvasHeight = elementSize * this.wordGrid.length;
    this.elementSize = elementSize;

    $container.css('height', this.canvasHeight);
    $container.css('width', this.canvasWidth);
  };


  FindTheWords.WordGrid.prototype.drawGrid = function (margin) {

    const that = this;
    const marginResp = (Math.floor(that.elementSize/8)<margin)? (Math.floor(that.elementSize/8)): margin;
    const offsetTop = (that.$container.offset().top > that.elementSize*0.75)? Math.floor(that.elementSize*0.75): that.$container.offset().top;
    this.$gridCanvas = $('<canvas id="grid-canvas" class="canvas-element" height="' + that.canvasHeight + 'px" width="' + that.canvasWidth + 'px" />').appendTo(that.$container);
    this.$outputCanvas = $('<canvas class="canvas-element" height="' + that.canvasHeight + 'px" width="' + that.canvasWidth + 'px"/>').appendTo(that.$container);
    this.$drawingCanvas = $('<canvas id="drawing-canvas" class="canvas-element" height="' + that.canvasHeight + 'px" width="' + that.canvasWidth + 'px"/>').appendTo(that.$container);

    const ctx1 = this.$gridCanvas[0].getContext("2d");

    const offset = that.$container.offset();

    ctx1.clearRect(offset.left, offset.top, that.canvasWidth, that.canvasHeight);

    ctx1.font = (that.elementSize / 3 )+"px Arial";

    that.wordGrid.forEach(function (row, index1) {
      row.forEach(function (element, index2) {
        ctx1.fillText(element.toUpperCase(), index2 * that.elementSize + 2*marginResp , index1 * that.elementSize + (offsetTop) );
      });
    });

    let clickStart = [];
    let isDragged = 0;
    let clickMode = 0;


    this.$drawingCanvas[0].addEventListener("touchstart", function (event) {
      touchHandler(event);
    }, false);

    this.$drawingCanvas[0].addEventListener("touchmove", function (event) {
      touchHandler(event);
    }, false);

    this.$drawingCanvas[0].addEventListener("touchend", function (event) {
      touchHandler(event);
    }, false);





    this.$drawingCanvas.on('mousedown', function (event) {
      if (that.options.gridActive ) {
        if (clickMode === 0) {
          that.enableDrawing = true;
          clickStart = mouseDownEventHandler(event, this, that.elementSize);
          that.trigger('drawStart');

        }
        // else {
        //   console.log('testing');
        //   clickPointStart= mouseDownEventHandler(event, this, that.elementSize);
        // }

      }
    });



    this.$drawingCanvas.on('mouseup', function (event) {

      if (that.enableDrawing) {

        if (isDragged === 1 || clickMode === 1) {
          if (clickMode === 1) {
            clickMode = 0;
          }
          let markedWord = '';
          const wordObject = mouseUpEventHandler(event, this, that.elementSize, clickStart);

          const dict = {
            'horizontal' : [1,0],
            'horizontalBack' : [-1,0],
            'diagonal' : [1,1],
            'diagonalBack' : [-1,1],
            'diagonalUp' : [1,-1],
            'diagonalUpBack' : [-1,-1],
            'vertical' : [0,1],
            'verticalUp' : [0,-1]
          };

          if ( ! $.isEmptyObject(wordObject) && wordObject['dir'] !== false ) {

            const dir = wordObject['dir'];
            let y1 = wordObject['start'][3];
            let x1 = wordObject['start'][2];
            let x2 = wordObject['end'][2];
            let y2 = wordObject['end'][3];


            do {
              markedWord += that.wordGrid[y1][x1];
              x1 = x1 + dir[0];
              y1 = y1 + dir[1];
            } while (!((y1 == y2) && (x1 == x2)));

            markedWord += that.wordGrid[y2][x2];

            for (let key in dict) {
              if (dict[key][0]==dir[0]&&dict[key][1]==dir[1]) {
                wordObject['directionKey'] = key;
                break;
              }
            }
          }
          that.enableDrawing = false;
          isDragged = 0;
          that.trigger('drawEnd',{'markedWord': markedWord, 'wordObject': wordObject});
        }
        else if (clickMode === 0) {
          clickMode = 1;
          const offsetTop = (that.$container.offset().top > that.elementSize*0.75)? Math.floor(that.elementSize*0.75): that.$container.offset().top;
          const context = that.$drawingCanvas[0].getContext("2d");
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
          context.lineWidth = Math.floor(that.elementSize/2);
          context.strokeStyle = "rgba(107,177,125,0.9)";
          context.fillStyle = "rgba(107,177,125,0.3)";
          context.beginPath();
          context.arc(clickStart[0]- (that.elementSize/8),clickStart[1]+ Math.floor(offsetTop/8) ,that.elementSize/4,0,2*Math.PI);
          context.fill();
          context.closePath();
        }
      }
    });





    this.$drawingCanvas.on('mousemove', function (event) {
      if (that.enableDrawing ) {
        isDragged = 1;
        mouseMoveEventHandler(event, this , clickStart,that.elementSize);
      }
    });




  };
  return FindTheWords.WordGrid;


}) (H5P.FindTheWords, H5P.EventDispatcher, H5P.jQuery);
