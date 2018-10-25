(function (FindTheWords, Timer) {

  /**
   * Adapter between H5P.FindTheWords and H5P.Timer
   *
   * @class H5P.FindTheWords.Timer
   * @extends H5P.Timer
   * @param {Element} element
   */
  FindTheWords.Timer = function (element) {
    /** @alias H5P.FindTheWords.Timer# */
    var self = this;
    // Initialize event inheritance
    Timer.call(self, 100);
    /** @private {string} */
    var naturalState = element.innerText;
    /**
     * Set up callback for time updates.
     * Formats time stamp for humans.
     *
     * @private
     */

    var update = function () {
      var time = self.getTime();

      var minutes = Timer.extractTimeElement(time, 'minutes');
      var seconds = Timer.extractTimeElement(time, 'seconds') % 60;
      if (seconds < 10) {
        seconds = '0' + seconds;
      }

      element.innerText = minutes + ':' + seconds;
    };

    // Setup default behavior
    self.notify('every_tenth_second', update);
    self.on('reset', function () {
      element.innerText = naturalState;
      self.notify('every_tenth_second', update);
    });
  };

  // Inheritance
  FindTheWords.Timer.prototype = Object.create(Timer.prototype);
  FindTheWords.Timer.prototype.constructor = FindTheWords.Timer;

})(H5P.FindTheWords, H5P.Timer);
