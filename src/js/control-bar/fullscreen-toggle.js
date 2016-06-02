/**
 * @file fullscreen-toggle.js
 */
import Button from '../button.js';
import Component from '../component.js';
import * as Fn from '../utils/fn.js';

/**
 * Toggle fullscreen video
 *
 * @extends Button
 * @class FullscreenToggle
 */
class FullscreenToggle extends Button {
  constructor(player, options) {
    super(player, options);

    player.on('ready', () => {
      this.player_.on('fullscreenchange', Fn.bind(this, this.updateHint));
    });
  }

  /**
   * Allow sub components to stack CSS class names
   *
   * @return {String} The constructed class name
   * @method buildCSSClass
   */
  buildCSSClass() {
    return `vjs-fullscreen-control ${super.buildCSSClass()}`;
  }

  /**
   * Handles click for full screen
   *
   * @method handleClick
   */
  handleClick() {
    if (!this.player_.isFullscreen()) {
      this.player_.requestFullscreen();
    } else {
      this.player_.exitFullscreen();
    }

    this.updateHint();
  }

  /**
   * Update button controlText
   *
   * @method update
   */
  updateHint() {
    if (this.player_.isFullscreen()) {
      this.controlText('Exit fullscreen');
    } else {
      this.controlText('Fullscreen');
    }
  }

}

FullscreenToggle.prototype.controlText_ = 'Fullscreen';

Component.registerComponent('FullscreenToggle', FullscreenToggle);
export default FullscreenToggle;
