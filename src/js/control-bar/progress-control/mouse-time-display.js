/**
 * @file mouse-time-display.js
 */
import window from 'global/window';
import Component from '../../component.js';
import * as Dom from '../../utils/dom.js';
import * as Fn from '../../utils/fn.js';
import formatTime from '../../utils/format-time.js';
import throttle from 'lodash-compat/function/throttle';

/**
 * The Mouse Time Display component shows the time you will seek to
 * when hovering over the progress bar
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Component
 * @class MouseTimeDisplay
 */
class MouseTimeDisplay extends Component {

  constructor(player, options) {
    super(player, options);

    if (options.playerOptions &&
        options.playerOptions.controlBar &&
        options.playerOptions.controlBar.progressControl &&
        options.playerOptions.controlBar.progressControl.keepTooltipsInside) {
      this.keepTooltipsInside = options.playerOptions.controlBar.progressControl.keepTooltipsInside;
    }

    if (this.keepTooltipsInside) {
      this.tooltip = Dom.createEl('div', {className: 'vjs-time-tooltip'});
      this.el().appendChild(this.tooltip);
      this.addClass('vjs-keep-tooltips-inside');
    }

    this.update(0, 0);

    player.on('ready', () => {
      let progressEl = this.player_.controlBar.progressControl.el();
      progressEl.appendChild(this.tooltip);
      this.on(progressEl, 'mousemove', throttle(Fn.bind(this, this.handleMouseMove), 25));
    });
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
    this.tooltip = Dom.createEl('div', {
      className: 'vjs-mouse-display-tooltip'
    });
    let el = super.createEl('div', {
      className: 'vjs-mouse-display'
    });
    return el;
  }

  dispose(){
    if (this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    Dom.removeElData(this.tooltip);
    this.tooltip = null;

    super.dispose();
  }

  handleMouseMove(event) {
    let isPercent = false;
    let duration = this.player_.duration();
    if (!duration) {
      isPercent = true;
      duration = 100;
    }
    let newTime = this.calculateDistance(event) * duration;

    let maxLeft = this.player().controlBar.progressControl.seekBar.width() - this.width();
    let position = event.pageX - Dom.findElPosition(this.el().parentNode).left;
    position = Math.min(Math.max(0, position), maxLeft);

    let tooltipWidth = this.tooltip.offsetWidth;
    let maxTooltipLeft = this.tooltip.parentNode.offsetWidth - tooltipWidth;
    let tooltipPosition = event.pageX - Dom.findElPosition(this.tooltip.parentNode).left - tooltipWidth/2;
    tooltipPosition = Math.min(Math.max(0, tooltipPosition), maxTooltipLeft);

    this.update(newTime, position, tooltipPosition, isPercent);
  }

  update(newTime, position, tooltipPosition, isPercent) {
    let time = isPercent ? Math.round(newTime) + '%' : formatTime(newTime, this.player_.duration());

    this.el().style.left = position + 'px';
    this.tooltip.innerHTML = time;

    if (this.keepTooltipsInside) {
      let clampedPosition = this.clampPosition_(position);
      let difference = position - clampedPosition + 1;
      let tooltipWidth = parseFloat(window.getComputedStyle(this.tooltip).width);
      let tooltipWidthHalf = tooltipWidth / 2;

      this.tooltip.style.left = 'auto';
      this.tooltip.style.right = `-${tooltipWidthHalf - difference}px`;
    } else {
      this.tooltip.style.right = 'auto';
      this.tooltip.style.left = tooltipPosition + 'px';
    }
  }

  calculateDistance(event) {
    return Dom.getPointerPosition(this.el().parentNode, event).x;
  }

  /**
   * This takes in a horizontal position for the bar and returns a clamped position.
   * Clamped position means that it will keep the position greater than half the width
   * of the tooltip and smaller than the player width minus half the width o the tooltip.
   * It will only clamp the position if `keepTooltipsInside` option is set.
   *
   * @param {Number} position the position the bar wants to be
   * @return {Number} newPosition the (potentially) clamped position
   * @method clampPosition_
   */
  clampPosition_(position) {
    if (!this.keepTooltipsInside) {
      return position;
    }

    let playerWidth = parseFloat(window.getComputedStyle(this.player().el()).width);
    let tooltipWidth = parseFloat(window.getComputedStyle(this.tooltip).width);
    let tooltipWidthHalf = tooltipWidth / 2;
    let actualPosition = position;

    if (position < tooltipWidthHalf) {
      actualPosition = Math.ceil(tooltipWidthHalf);
    } else if (position > (playerWidth - tooltipWidthHalf)) {
      actualPosition = Math.floor(playerWidth - tooltipWidthHalf);
    }

    return actualPosition;
  }
}

Component.registerComponent('MouseTimeDisplay', MouseTimeDisplay);
export default MouseTimeDisplay;
