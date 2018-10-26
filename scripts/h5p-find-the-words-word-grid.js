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

    word.forEach(function (letter, index) {
      const next = fnGetSquare(x, y, index);
      const square = wordGrid[next.y][next.x];

      if (square === letter) {
        overlap++;
      }
      else if (square !== '') {
        return -1;
      }
    });

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
    word.forEach(function (letter, index) {
      const next = orientations[selectedLoc.orientation](selectedLoc.x, selectedLoc.y, index);
      wordGrid[next.y][next.x] = letter;
    });

    return true;
  }

  const fillGrid = function (words, options) {
    let wordGrid = new Array(options.height).fill([]).map(function () {
      return new Array(options.width).fill('');
    });
    words.forEach(function (word) {
      if (!placeWordInGrid(wordGrid, options, word)) {
        return null;
      }
    });
    return wordGrid;
  }

  const fillBlanks = function (wordGrid) {

    const letters = 'abcdefghijklmnoprstuvwy';

    wordGrid.forEach(function (row) {
      row.forEach(function (element) {
        if (!element) {
          let randomLetter = Math.floor(Math.random() * letters.length);
          element = letters[randomLetter];
        }
      });
    });

  }

  FindTheWords.WordGrid.prototype.createWordGrid = function () {

    let wordGrid = [] ;
    let attempts = 0;

    const wordList = this.options.vocabulary.slice(0).sort(function (a, b) {
      return (a.length < b.length) ? 1 : 0;
    });

    while (this.wordGrid) {
      // TODO : check this while
      while ( !wordGrid  && attempts++ < this.options.maxAttempts) {
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
      fillBlanks(wordGrid);
    }

    //set the output puzzle

    this.wordGrid = wordGrid;
  };

  FindTheWords.WordGrid.prototype.appendTo = function ($container) {
    
  }
  return FindTheWords.WordGrid;


}) (H5P.FindTheWords, H5P.EventDispatcher, H5P.jQuery)
