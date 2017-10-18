/**
 * @file error-display.js
 */
import Component from './component';
import ModalDialog from './modal-dialog';

import * as Dom from './utils/dom';
import mergeOptions from './utils/merge-options';

/**
 * Display that an error has occurred making the video unplayable.
 *
 * @extends ModalDialog
 * @class ErrorDisplay
 */
class ErrorDisplay extends ModalDialog {

  /**
   * Constructor for error display modal.
   *
   * @param  {Player} player
   * @param  {Object} [options]
   */
  constructor(player, options) {
    super(player, options);
    this.on(player, 'error', this.open);
  }

  /**
   * Include the old class for backward-compatibility.
   *
   * This can be removed in 6.0.
   *
   * @method buildCSSClass
   * @deprecated
   * @return {String}
   */
  buildCSSClass() {
    return `vjs-error-display ${super.buildCSSClass()}`;
  }

  /**
   * Opens modal dialog only for error codes not configured for ignore.
   */
  open() {
    let error = this.player().error(), ignore = this.options_.ignoreErr;
    if (error && (ignore===true ||
      typeof ignore==='number' && ignore===error.code ||
      ignore instanceof Array && ignore.indexOf(error.code)>=0)) {
      this.player().addClass('vjs-error-hidden');
      return this;
    }
    return super.open();
  }

  /**
   * Override close of modal dialog for proper player uninit.
   */
  close() {
    this.player().removeClass('vjs-error-hidden');
    return super.close();
  }

  /**
   * Generates the modal content based on the player error.
   *
   * @return {String|Null}
   */
  content() {
    let error = this.player().error();
    return error ? this.localize(error.message) : '';
  }
}

ErrorDisplay.prototype.options_ = mergeOptions(ModalDialog.prototype.options_, {
  fillAlways: true,
  temporary: false,
  uncloseable: true,
  ignoreErr: false
});

Component.registerComponent('ErrorDisplay', ErrorDisplay);
export default ErrorDisplay;
