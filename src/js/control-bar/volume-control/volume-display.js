/**
 * @file volume-display.js
 */
import Component from '../../component.js';
import * as Dom from '../../utils/dom.js';
import * as Fn from '../../utils/fn.js';
import throttle from 'lodash-compat/function/throttle';

/**
 * The Mouse Time Display component shows the time you will seek to
 * when hovering over the progress bar
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Component
 * @class VolumeDisplay
 */
class VolumeDisplay extends Component {

  constructor(player, options) {
    super(player, options);

    this.update(0, 0, 0);

    player.on('ready', () => {
      player.controlBar.progressControl.el().appendChild(this.tooltip);

      this.parent = player.controlBar.volumeMenuButton.volumeBar;
      this.on(this.parent.el(), 'mousemove', throttle(Fn.bind(this, this.handleMouseMove), 25));
      this.on(this.parent.el(), 'mouseover', throttle(Fn.bind(this, this.handleHover), 25));
      this.on(this.parent.el(), 'mouseout', throttle(Fn.bind(this, this.handleLeave), 25));
    });
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
    this.className = 'vjs-volume-display';
    this.tooltipClassName = this.className+'-tooltip';

    this.tooltip = Dom.createEl('div', {
      className: this.tooltipClassName
    });
    return super.createEl('div', {
      className: this.className
    });
  }

  /**
   * Dispose of the component and all child components
   *
   * @method dispose
   */
  dispose() {
    // Remove tooltipelement from DOM
    if (this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    Dom.removeElData(this.tooltip);
    this.tooltip = null;

    super.dispose();
  }

  handleMouseMove(event) {
    let newValue = this.calculateDistance(event) * 100;

    let maxLeft = this.parent.width() - this.width();
    let position = event.pageX - Dom.findElPosition(this.el().parentNode).left;
    position = Math.min(Math.max(0, position), maxLeft);

    let tooltipWidth = this.tooltip.offsetWidth;
    let tooltipParentLeft = Dom.findElPosition(this.tooltip.parentNode).left;
    let minTooltipLeft = Dom.findElPosition(this.parent.el()).left - tooltipParentLeft - tooltipWidth/2;
    let maxTooltipLeft = minTooltipLeft + this.parent.width();

    let tooltipPosition = event.pageX - tooltipParentLeft - tooltipWidth/2;
    tooltipPosition = Math.min(Math.max(minTooltipLeft, tooltipPosition), maxTooltipLeft);

    this.update(newValue, position, tooltipPosition);
  }

  handleHover(event) {
    Dom.addElClass(this.tooltip, this.tooltipClassName + '-active');
  }

  handleLeave(event) {
    Dom.removeElClass(this.tooltip, this.tooltipClassName + '-active');
  }

  update(newValue, position, tooltipPosition) {
    let value = Math.round(newValue) + '%';

    this.el().style.left = position + 'px';

    this.tooltip.style.left = tooltipPosition + 'px';
    this.tooltip.innerHTML = value;
  }

  calculateDistance(event) {
    return Dom.getPointerPosition(this.el().parentNode, event).x;
  }
}

Component.registerComponent('VolumeDisplay', VolumeDisplay);
export default VolumeDisplay;
