(function(FindTheWords, EventDispatcher, $) {

  /**
   * Controls all the operations on the puzzle
   *
   * @class H5P.FindTheWords.FindWordPuzzle
   * @extends H5P.EventDispatcher
   * @param {Object} gameParams
   */
  FindTheWords.FindWordPuzzle = function(gameParams) {

    // Initialize event inheritance
    EventDispatcher.call(this);
    // Letters that can be used to fill blanks
    var letters = 'abcdefghijklmnoprstuvwy';
    var wordList, puzzle, directions, attempts = 0, opts = gameParams || {};
    var allOrientations = ['horizontal', 'horizontalBack', 'vertical', 'verticalUp',
      'diagonal', 'diagonalUp', 'diagonalBack', 'diagonalUpBack'
    ];

    // get i th element position based on the current position for different orientations

    var orientations = {
      horizontal: function(x, y, i) {
        return {
          x: x + i,
          y: y
        };
      },
      horizontalBack: function(x, y, i) {
        return {
          x: x - i,
          y: y
        };
      },
      vertical: function(x, y, i) {
        return {
          x: x,
          y: y + i
        };
      },
      verticalUp: function(x, y, i) {
        return {
          x: x,
          y: y - i
        };
      },
      diagonal: function(x, y, i) {
        return {
          x: x + i,
          y: y + i
        };
      },
      diagonalBack: function(x, y, i) {
        return {
          x: x - i,
          y: y + i
        };
      },
      diagonalUp: function(x, y, i) {
        return {
          x: x + i,
          y: y - i
        };
      },
      diagonalUpBack: function(x, y, i) {
        return {
          x: x - i,
          y: y - i
        };
      }
    };



    // Determines if an orientation is possible given the starting square (x,y),
    // the height (h) and width (w) of the puzzle, and the length of the word (l).
    // Returns true if the word will fit starting at the square provided using
    // the specified orientation.

    var checkOrientations = {
      horizontal: function(x, y, h, w, l) {
        return w >= x + l;
      },
      horizontalBack: function(x, y, h, w, l) {
        return x + 1 >= l;
      },
      vertical: function(x, y, h, w, l) {
        return h >= y + l;
      },
      verticalUp: function(x, y, h, w, l) {
        return y + 1 >= l;
      },
      diagonal: function(x, y, h, w, l) {
        return (w >= x + l) && (h >= y + l);
      },
      diagonalBack: function(x, y, h, w, l) {
        return (x + 1 >= l) && (h >= y + l);
      },
      diagonalUp: function(x, y, h, w, l) {
        return (w >= x + l) && (y + 1 >= l);
      },
      diagonalUpBack: function(x, y, h, w, l) {
        return (x + 1 >= l) && (y + 1 >= l);
      }
    };

    // Determines the next possible valid square given the square (x,y) was ]
    // invalid and a word lenght of (l).  This greatly reduces the number of
    // squares that must be checked. Returning {x: x+1, y: y} will always work
    // but will not be optimal.


    var skipOrientations = {
      horizontal: function(x, y, l) {
        return {
          x: 0,
          y: y + 1
        };
      },
      horizontalBack: function(x, y, l) {
        return {
          x: l - 1,
          y: y
        };
      },
      vertical: function(x, y, l) {
        return {
          x: 0,
          y: y + 100
        };
      },
      verticalUp: function(x, y, l) {
        return {
          x: 0,
          y: l - 1
        };
      },
      diagonal: function(x, y, l) {
        return {
          x: 0,
          y: y + 1
        };
      },
      diagonalBack: function(x, y, l) {
        return {
          x: l - 1,
          y: x >= l - 1 ? y + 1 : y
        };
      },
      diagonalUp: function(x, y, l) {
        return {
          x: 0,
          y: y < l - 1 ? l - 1 : y + 1
        };
      },
      diagonalUpBack: function(x, y, l) {
        return {
          x: l - 1,
          y: x >= l - 1 ? y + 1 : y
        };
      }
    };

    // copy and sort the words by length, inserting words into the puzzle
    // from longest to shortest works out the best
    wordList = gameParams.vocabulary.slice(0).sort(function(a, b) {
      return (a.length < b.length) ? 1 : 0;
    });

    this.wordList = wordList;
    this.orientations = orientations;

    //for removing locations that are exceeding maximum overlap value;

    var pruneLocations = function(locations, overlap) {
      var pruned = [];
      for (var i = 0, len = locations.length; i < len; i++) {
        if (locations[i].overlap >= overlap) {
          pruned.push(locations[i]);
        }
      }

      return pruned;
    };

    // An adapter between original code and h5p parameters

    var processOrientations = function(directions) {

      var orientations = [];
      for (var key in directions) {
        if (directions.hasOwnProperty(key) && directions[key] === true) {

          orientations.push(key);
        }
      }
      return orientations;
    };

    directions = processOrientations(opts.behaviour.orientations);

    var fillPuzzle = function(words, options) {

      var puzzle = [],
        i, j, len;

      // initialize the puzzle with blanks
      for (i = 0; i < options.height; i++) {
        puzzle.push([]);
        for (j = 0; j < options.width; j++) {
          puzzle[i].push('');
        }
      }

      // add each word into the puzzle one at a time
      for (i = 0, len = words.length; i < len; i++) {
        if (!placeWordInPuzzle(puzzle, options, words[i])) {
          // if a word didn't fit in the puzzle, give up
          return null;
        }
      }

      // return the puzzle
      return puzzle;
    };

    var fillBlanks = function(puzzle) {
      for (var i = 0, height = puzzle.length; i < height; i++) {
        var row = puzzle[i];
        for (var j = 0, width = row.length; j < width; j++) {

          if (!puzzle[i][j]) {
            var randomLetter = Math.floor(Math.random() * letters.length);
            puzzle[i][j] = letters[randomLetter];
          }
        }
      }
    };
    var placeWordInPuzzle = function(puzzle, options, word) {

      // find all of the best locations where this word would fit
      var locations = findBestLocations(puzzle, options, word);

      if (locations.length === 0) {
        return false;
      }

      // select a location at random and place the word there
      var sel = locations[Math.floor(Math.random() * locations.length)];
      placeWord(puzzle, word, sel.x, sel.y, orientations[sel.orientation]);

      return true;
    };

    var findBestLocations = function(puzzle, options, word) {
      var locations = [],
        height = options.height,
        width = options.width,
        wordLength = word.length,
        maxOverlap = 0; // we'll start looking at overlap = 0

      // loop through all of the possible orientations at this position
      for (var k = 0, len = options.orientations.length; k < len; k++) {

        var orientation = options.orientations[k],
          check = checkOrientations[orientation],
          next = orientations[orientation],
          skipTo = skipOrientations[orientation],
          x = 0,
          y = 0;

        // loop through every position on the board
        while (y < height) {

          // see if this orientation is even possible at this location
          if (check(x, y, height, width, wordLength)) {

            // determine if the word fits at the current position
            var overlap = calcOverlap(word, puzzle, x, y, next);

            // if the overlap was bigger than previous overlaps that we've seen
            if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
              maxOverlap = overlap;
              locations.push({
                x: x,
                y: y,
                orientation: orientation,
                overlap: overlap
              });
            }

            x++;
            if (x >= width) {
              x = 0;
              y++;
            }
          } else {
            // if current cell is invalid, then skip to the next cell where
            // this orientation is possible. this greatly reduces the number
            // of checks that we have to do overall
            var nextPossible = skipTo(x, y, wordLength);
            x = nextPossible.x;
            y = nextPossible.y;
          }

        }
      }

      // finally prune down all of the possible locations we found by
      // only using the ones with the maximum overlap that we calculated
      return options.preferOverlap ?
        pruneLocations(locations, maxOverlap) :
        locations;
    };
    var placeWord = function(puzzle, word, x, y, fnGetSquare) {
      for (var i = 0, len = word.length; i < len; i++) {
        var next = fnGetSquare(x, y, i);
        puzzle[next.y][next.x] = word[i];
      }
    };

    var calcOverlap = function(word, puzzle, x, y, fnGetSquare) {
      var overlap = 0;

      // traverse the squares to determine if the word fits
      for (var i = 0, len = word.length; i < len; i++) {

        var next = fnGetSquare(x, y, i),
          square = puzzle[next.y][next.x];

        // if the puzzle square already contains the letter we
        // are looking for, then count it as an overlap square
        if (square === word[i]) {
          overlap++;
        }
        // if it contains a different letter, than our word doesn't fit
        // here, return -1
        else if (square !== '') {
          return -1;
        }
      }

      // if the entire word is overlapping, skip it to ensure words aren't
      // hidden in other words
      return overlap;
    };

    this.print = function() {
      puzzle = this.puzzle;
      var puzzleString = '';
      for (var i = 0, height = puzzle.length; i < height; i++) {
        var row = puzzle[i];
        for (var j = 0, width = row.length; j < width; j++) {
          puzzleString += (row[j] === '' ? ' ' : row[j]) + ' ';
        }
        puzzleString += '\n';
      }

      console.log(puzzleString);
      return puzzleString;
    };

    // this.drawPuzzle = function($container) {
    //
    //   var output = '';
    //   var puzzle = this.puzzle;
    //   // for each row in the puzzle
    //   for (var i = 0, height = puzzle.length; i < height; i++) {
    //     // append a div to represent a row in the puzzle
    //     var row = puzzle[i];
    //     output += '<div class="h5p-word-find-row">';
    //     // for each element in that row
    //     for (var j = 0, width = row.length; j < width; j++) {
    //       // append our button with the appropriate class
    //       output += '<div class="puzzleSquare" x="' + j + '" y="' + i + '"><span>';
    //       output += row[j] || '&nbsp;';
    //       output += '</span></div>';
    //     }
    //     // close our div that represents a row
    //     output += '</div>';
    //   }
    //
    //   $container.html(output);
    // };

    this.drawPuzzle = function($container,elementSize,canvasWidth,canvasHeight){


      var puzzle = this.puzzle;

      var drawingCanvas = $container;
      var canvasElement = drawingCanvas[0];
      var ctx1 = canvasElement.getContext("2d");
      var rowHeight = elementSize;
      var colWidth = elementSize;

      ctx1.clearRect(0, 0, canvasElement.width, canvasElement.height);

      for (var i = 0, height = puzzle.length; i < height; i++) {
        var letterRow = [];
        var row = puzzle[i];
        for (var j = 0, width = row.length; j < width; j++) {
           ctx1.font =  (elementSize/3)+"px Arial";
           ctx1.fillText(row[j].toUpperCase(), j * colWidth + (colWidth/2 -15), i * (rowHeight) + (colWidth/2 + 10));
         }
     }


    }
    this.drawWords = function($container) {
      var words = this.wordList;
      var output = '<div class="vocHeading"><i class="fa fa-book fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;Find the words</div><ul>';

      for (var i = 0, len = words.length; i < len; i++) {
        var word = words[i];
        output += '<li><div class="word ' + word + '"><i class="fa fa-check" aria-hidden="true"></i>&nbsp;' + word+'</div></li>';
      }
      output += '</ul>';

      $container.html(output);
    };

    this.solve = function() {
      var words = this.wordList;
      var puzzle = this.puzzle;
      var options = {
          height: puzzle.length,
          width: puzzle[0].length,
          orientations: allOrientations,
          preferOverlap: true
        },
        found = [],
        notFound = [];

      for (var i = 0, len = words.length; i < len; i++) {
        var word = words[i],
          locations = findBestLocations(puzzle, options, word);

        if (locations.length > 0 && locations[0].overlap === word.length) {
          locations[0].word = word;
          found.push(locations[0]);
        } else {
          notFound.push(word);
        }
      }

      return {
        found: found,
        notFound: notFound
      };
    };

    var startSquare, selectedSquares = [],
      curOrientation, curWord = '';



    this.startTurn = function(obj) {
      $(obj).addClass('selected');
      startSquare = obj;
      selectedSquares.push(obj);
      curWord = $(obj).text();
    };

    this.mouseMove = function(obj) {
      select(obj);
    };

    var calcOrientation = function(x1, y1, x2, y2) {

      for (var orientation in orientations) {
        var nextFn = orientations[orientation];
        var nextPos = nextFn(x1, y1, 1);

        if (nextPos.x === x2 && nextPos.y === y2) {
          return orientation;
        }
      }

      return null;
    };

    var select = function(target) {
      // if the user hasn't started a word yet, just return

      if (!startSquare) {
        return;
      }

      // if the new square is actually the previous square, just return
      var lastSquare = selectedSquares[selectedSquares.length - 1];
      if (lastSquare == target) {
        return;
      }

      // see if the user backed up and correct the selectedSquares state if
      // they did
      var backTo;
      for (var i = 0, len = selectedSquares.length; i < len; i++) {
        if (selectedSquares[i] == target) {
          backTo = i + 1;
          break;
        }
      }

      while (backTo < selectedSquares.length) {
        $(selectedSquares[selectedSquares.length - 1]).removeClass('selected');
        selectedSquares.splice(backTo, 1);
        curWord = curWord.substr(0, curWord.length - 1);
      }


      // see if this is just a new orientation from the first square
      // this is needed to make selecting diagonal words easier
      var newOrientation = calcOrientation(
        $(startSquare).attr('x') - 0,
        $(startSquare).attr('y') - 0,
        $(target).attr('x') - 0,
        $(target).attr('y') - 0
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
        $(lastSquare).attr('x') - 0,
        $(lastSquare).attr('y') - 0,
        $(target).attr('x') - 0,
        $(target).attr('y') - 0
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

    var playTurn = function(square) {

      // make sure we are still forming a valid word
      for (var i = 0, len = wordList.length; i < len; i++) {
        if (wordList[i].indexOf(curWord + $(square).text()) === 0) {
          $(square).addClass('selected');
          selectedSquares.push(square);
          curWord += $(square).text();
          console.log("current word:" + curWord);
          break;
        }
      }
    };


    this.endTurn = function(obj) {

      var flag = false;
      for (var i = 0, len = wordList.length; i < len; i++) {

        if (wordList[i] === curWord) {
          $('.selected').addClass('found');
          wordList.splice(i, 1);
          flag = true;
          $('.' + curWord).addClass('wordFound');
        }

        if (wordList.length === 0) {
          this.trigger('complete');
        }
      }

      // reset the turn
      $('.selected').removeClass('selected');
      startSquare = null;
      selectedSquares = [];
      curWord = '';
      curOrientation = null;
      return flag;
    };


    //  initialize the options
    var options = {
      height: opts.behaviour.gridDimensions.height || wordList[0].length,
      width: opts.behaviour.gridDimensionswidth || wordList[0].length,
      orientations: directions || allOrientations,
      fillBlanks: opts.behaviour.fillBlanks !== undefined ? opts.behaviour.fillBlanks : true,
      maxAttempts: opts.behaviour.maxAttempts || 3,
      preferOverlap: opts.behaviour.preferOverlap !== undefined ? opts.behaviour.preferOverlap : true
    };

    // add the words to the puzzle
    // since puzzles are random, attempt to create a valid one up to
    // maxAttempts and then increase the puzzle size and try again
    while (!puzzle) {
      while (!puzzle && attempts++ < options.maxAttempts) {
        puzzle = fillPuzzle(wordList, options);
      }

      if (!puzzle) {
        options.height++;
        options.width++;
        attempts = 0;
      }
    }

    // fill in empty spaces with random letters
    if (options.fillBlanks) {
      fillBlanks(puzzle, options);
    }

    //set the output puzzle

    this.puzzle = puzzle;


  };

  FindTheWords.FindWordPuzzle.prototype = Object.create(EventDispatcher.prototype);
  FindTheWords.FindWordPuzzle.prototype.constructor = FindTheWords.FindWordPuzzle;
})(H5P.FindTheWords, H5P.EventDispatcher, H5P.jQuery);
