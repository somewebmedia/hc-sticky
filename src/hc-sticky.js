/*!
 * HC-Sticky
 * =========
 * Version: 2.2.3
 * Author: Some Web Media
 * Author URL: http://somewebmedia.com
 * Plugin URL: https://github.com/somewebmedia/hc-sticky
 * Description: Cross-browser plugin that makes any element on your page visible while you scroll
 * License: MIT
 */

(function(global, factory) {
  'use strict';

  if (typeof module === 'object' && typeof module.exports === 'object') {
    if (global.document) {
      module.exports = factory(global);
    }
    else {
      throw new Error('HC-Sticky requires a browser to run.');
    }
  }
  else if (typeof define === 'function' && define.amd) {
    define('hcSticky', [], factory(global));
  }
  else {
    factory(global);
  }
})(typeof window !== 'undefined' ? window : this, (window) => {
  'use strict';

  const DEFAULT_OPTIONS = {
    top: 0,
    bottom: 0,
    bottomEnd: 0,
    innerTop: 0,
    innerSticker: null,
    stickyClass: 'sticky',
    stickTo: null,
    followScroll: true,
    responsive: null,
    mobileFirst: false,
    onStart: null,
    onStop: null,
    onBeforeResize: null,
    onResize: null,
    resizeDebounce: 100,
    disable: false,

    // deprecated
    queries: null,
    queryFlow: 'down'
  };

  const deprecated = (() => {
    const pluginName = 'HC Sticky';

    return (what, instead, type) => {
      console.warn(
        '%c' + pluginName + ':'
        + '%c ' + type
        + "%c '"+ what + "'"
        + '%c is now deprecated and will be removed. Use'
        + "%c '" + instead + "'"
        + '%c instead.',
        'color: #fa253b',
        'color: default',
        'color: #5595c6',
        'color: default',
        'color: #5595c6',
        'color: default');
    };
  })();

  const document = window.document;

  const hcSticky = function(elem, userSettings = {}) {
    // use querySeletor if string is passed
    if (typeof elem === 'string') {
      elem = document.querySelector(elem);
    }

    // check if element exist
    if (!elem) {
      return false;
    }

    if (userSettings.queries) {
      deprecated('queries', 'responsive', 'option');
    }

    if (userSettings.queryFlow) {
      deprecated('queryFlow', 'mobileFirst', 'option');
    }

    let STICKY_OPTIONS = {};
    const Helpers = hcSticky.Helpers;
    const elemParent = elem.parentNode;

    // parent can't be static
    if (Helpers.getStyle(elemParent, 'position') === 'static') {
      elemParent.style.position = 'relative';
    }

    const setOptions = (options = {}) => {
      if (Helpers.isEmptyObject(options) && !Helpers.isEmptyObject(STICKY_OPTIONS)) {
        // nothing to set
        return;
      }

      // extend options
      STICKY_OPTIONS = Object.assign({}, DEFAULT_OPTIONS, STICKY_OPTIONS, options);
    };

    const resetOptions = (options) => {
      STICKY_OPTIONS = Object.assign({}, DEFAULT_OPTIONS, options || {});
    };

    const getOptions = (option) => {
      return option ? STICKY_OPTIONS[option] : Object.assign({}, STICKY_OPTIONS);
    };

    const isDisabled = () => {
      return STICKY_OPTIONS.disable;
    };

    const applyQueries = () => {
      const mediaQueries = STICKY_OPTIONS.responsive || STICKY_OPTIONS.queries;

      if (mediaQueries) {
        const window_width = window.innerWidth;

        // reset settings
        resetOptions(userSettings);

        if (STICKY_OPTIONS.mobileFirst) {
          for (const width in mediaQueries) {
            if (window_width >= width && !Helpers.isEmptyObject(mediaQueries[width])) {
              setOptions(mediaQueries[width]);
            }
          }
        }
        else {
          const queriesArr = [];

          // convert to array so we can reverse loop it
          for (const b in mediaQueries) {
            const q = {};

            q[b] = mediaQueries[b];
            queriesArr.push(q);
          }

          for (let i = queriesArr.length - 1; i >= 0; i--) {
            const query = queriesArr[i];
            const breakpoint = Object.keys(query)[0];

            if (window_width <= breakpoint && !Helpers.isEmptyObject(query[breakpoint])) {
              setOptions(query[breakpoint]);
            }
          }
        }
      }
    };

    // our helper function for getting necessary styles
    const getStickyCss = (el) => {
      const cascadedStyle = Helpers.getCascadedStyle(el);
      const computedStyle = Helpers.getStyle(el);

      const css = {
        height: el.offsetHeight + 'px',
        left: cascadedStyle.left,
        right: cascadedStyle.right,
        top: cascadedStyle.top,
        bottom: cascadedStyle.bottom,
        position: computedStyle.position,
        display: computedStyle.display,
        verticalAlign: computedStyle.verticalAlign,
        boxSizing: computedStyle.boxSizing,
        marginLeft: cascadedStyle.marginLeft,
        marginRight: cascadedStyle.marginRight,
        marginTop: cascadedStyle.marginTop,
        marginBottom: cascadedStyle.marginBottom,
        paddingLeft: cascadedStyle.paddingLeft,
        paddingRight: cascadedStyle.paddingRight
      };

      if (cascadedStyle['float']) {
        css['float'] = cascadedStyle['float'] || 'none';
      }

      if (cascadedStyle.cssFloat) {
        css['cssFloat'] = cascadedStyle.cssFloat || 'none';
      }

      // old firefox box-sizing
      if (computedStyle.MozBoxSizing) {
        css['MozBoxSizing'] = computedStyle.MozBoxSizing;
      }

      css['width'] = cascadedStyle.width !== 'auto' ? cascadedStyle.width : (css.boxSizing === 'border-box' || css.MozBoxSizing === 'border-box' ? el.offsetWidth + 'px' : computedStyle.width);

      return css;
    };

    const Sticky = {
      css: {},
      position: null, // so we don't need to check css all the time
      stick: (args = {}) => {
        // check if element is already sticky
        if (Helpers.hasClass(elem, STICKY_OPTIONS.stickyClass)) {
          return;
        }

        if (Spacer.isAttached === false) {
          Spacer.attach();
        }

        Sticky.position = 'fixed';

        // apply styles
        elem.style.position = 'fixed';
        elem.style.left = Spacer.offsetLeft + 'px';
        elem.style.width = Spacer.width;

        if (typeof args.bottom === 'undefined') {
          elem.style.bottom = 'auto';
        }
        else {
          elem.style.bottom = args.bottom + 'px';
        }

        if (typeof args.top === 'undefined') {
          elem.style.top = 'auto';
        }
        else {
          elem.style.top = args.top + 'px';
        }

        // add sticky class
        if (elem.classList) {
          elem.classList.add(STICKY_OPTIONS.stickyClass);
        }
        else {
          elem.className += ' ' + STICKY_OPTIONS.stickyClass;
        }

        // fire 'start' event
        if (STICKY_OPTIONS.onStart) {
          STICKY_OPTIONS.onStart.call(elem, Object.assign({}, STICKY_OPTIONS));
        }
      },
      release: (args = {}) => {
        args.stop = args.stop || false;

        // check if we've already done this
        if (args.stop !== true && Sticky.position !== 'fixed' && Sticky.position !== null && (
          (typeof args.top === 'undefined' && typeof args.bottom === 'undefined') ||
          (typeof args.top !== 'undefined' && (parseInt(Helpers.getStyle(elem, 'top')) || 0) === args.top) ||
          (typeof args.bottom !== 'undefined' && (parseInt(Helpers.getStyle(elem, 'bottom')) || 0) === args.bottom)
        )) {
          return;
        }

        if (args.stop === true) {
          // remove spacer
          if (Spacer.isAttached === true) {
            Spacer.detach();
          }
        }
        else {
          // check spacer
          if (Spacer.isAttached === false) {
            Spacer.attach();
          }
        }

        const position = args.position || Sticky.css.position;

        // remember position
        Sticky.position = position;

        // apply styles
        elem.style.position = position;
        elem.style.left = args.stop === true ? Sticky.css.left : Spacer.positionLeft + 'px';
        elem.style.width = position !== 'absolute' ? Sticky.css.width : Spacer.width;

        if (typeof args.bottom === 'undefined') {
          elem.style.bottom = args.stop === true ? '' : 'auto';
        }
        else {
          elem.style.bottom = args.bottom + 'px';
        }

        if (typeof args.top === 'undefined') {
          elem.style.top = args.stop === true ? '' : 'auto';
        }
        else {
          elem.style.top = args.top + 'px';
        }

        // remove sticky class
        if (elem.classList) {
          elem.classList.remove(STICKY_OPTIONS.stickyClass);
        }
        else {
          elem.className = elem.className.replace(new RegExp('(^|\\b)' + STICKY_OPTIONS.stickyClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }

        // fire 'stop' event
        if (STICKY_OPTIONS.onStop) {
          STICKY_OPTIONS.onStop.call(elem, Object.assign({}, STICKY_OPTIONS));
        }
      }
    };

    const Spacer = {
      el: document.createElement('div'),
      offsetLeft: null,
      positionLeft: null,
      width: null,
      isAttached: false,
      init: () => {
        Spacer.el.className = 'sticky-spacer';

        // copy styles from sticky element
        for (const prop in Sticky.css) {
          Spacer.el.style[prop] = Sticky.css[prop];
        }

        // just to be sure the spacer is behind everything
        Spacer.el.style['z-index'] = '-1';

        const elemStyle = Helpers.getStyle(elem);

        // get spacer offset and position
        Spacer.offsetLeft = Helpers.offset(elem).left - (parseInt(elemStyle.marginLeft) || 0);
        Spacer.positionLeft = Helpers.position(elem).left;

        // get spacer width
        Spacer.width = Helpers.getStyle(elem, 'width');
      },
      attach: () => {
        // insert spacer to DOM
        elemParent.insertBefore(Spacer.el, elem);
        Spacer.isAttached = true;
      },
      detach: () => {
        // remove spacer from DOM
        Spacer.el = elemParent.removeChild(Spacer.el);
        Spacer.isAttached = false;
      }
    };

    // define our private variables
    let stickTo_document;
    let container;
    let inner_sticker;

    let container_height;
    let container_offsetTop;

    let elemParent_offsetTop;

    let window_height;

    let options_top;
    let options_bottom;

    let stick_top;
    let stick_bottom;

    let top_limit;
    let bottom_limit;

    let largerSticky;
    let sticky_height;
    let sticky_offsetTop;

    let calcContainerHeight;
    let calcStickyHeight;

    const calcSticky = () => {
      // get/set element styles
      Sticky.css = getStickyCss(elem);

      // init or reinit spacer
      Spacer.init();

      // check if referring element is document
      stickTo_document = STICKY_OPTIONS.stickTo && (STICKY_OPTIONS.stickTo === 'document'
        || (STICKY_OPTIONS.stickTo.nodeType && STICKY_OPTIONS.stickTo.nodeType === 9)
        || (typeof STICKY_OPTIONS.stickTo === 'object' && STICKY_OPTIONS.stickTo instanceof (typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document)))
      ? true : false;

      // select referred container
      container = STICKY_OPTIONS.stickTo
        ? stickTo_document
          ? document
          : typeof STICKY_OPTIONS.stickTo === 'string'
            ? document.querySelector(STICKY_OPTIONS.stickTo)
            : STICKY_OPTIONS.stickTo
        : elemParent;

      // get sticky height
      calcStickyHeight = () => {
        const height = elem.offsetHeight + (parseInt(Sticky.css.marginTop) || 0) + (parseInt(Sticky.css.marginBottom) || 0);
        const h_diff = (sticky_height || 0) - height;

        if (h_diff >= -1 && h_diff <= 1) {
          // sometimes element height changes by 1px when it get fixed position, so don't return new value
          return sticky_height;
        }
        else {
          return height;
        }
      };

      sticky_height = calcStickyHeight();

      // get container height
      calcContainerHeight = () => {
        return !stickTo_document ? container.offsetHeight : Math.max(document.documentElement.clientHeight, document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight);
      };

      container_height = calcContainerHeight();

      container_offsetTop = !stickTo_document ? Helpers.offset(container).top : 0;
      elemParent_offsetTop = !STICKY_OPTIONS.stickTo
        ? container_offsetTop // parent is container
        : !stickTo_document
          ? Helpers.offset(elemParent).top
          : 0;
      window_height = window.innerHeight;
      sticky_offsetTop = elem.offsetTop - (parseInt(Sticky.css.marginTop) || 0);

      // get inner sticker element
      inner_sticker = STICKY_OPTIONS.innerSticker
        ? typeof STICKY_OPTIONS.innerSticker === 'string'
          ? document.querySelector(STICKY_OPTIONS.innerSticker)
          : STICKY_OPTIONS.innerSticker
        : null;

      // top
      options_top = isNaN(STICKY_OPTIONS.top) && STICKY_OPTIONS.top.indexOf('%') > -1
        ? (parseFloat(STICKY_OPTIONS.top) / 100) * window_height
        : STICKY_OPTIONS.top;

      // bottom
      options_bottom = isNaN(STICKY_OPTIONS.bottom) && STICKY_OPTIONS.bottom.indexOf('%') > -1
        ? (parseFloat(STICKY_OPTIONS.bottom) / 100) * window_height
        : STICKY_OPTIONS.bottom;

      // calculate sticky breakpoints
      stick_top = inner_sticker
        ? inner_sticker.offsetTop
        : STICKY_OPTIONS.innerTop
          ? STICKY_OPTIONS.innerTop
          : 0;

      stick_bottom = isNaN(STICKY_OPTIONS.bottomEnd) && STICKY_OPTIONS.bottomEnd.indexOf('%') > -1
        ? (parseFloat(STICKY_OPTIONS.bottomEnd) / 100) * window_height
        : STICKY_OPTIONS.bottomEnd;

      top_limit = container_offsetTop - options_top + stick_top + sticky_offsetTop;
    };

    // store scroll position so we can determine scroll direction
    let last_pos = window.pageYOffset || document.documentElement.scrollTop;
    let diff_y = 0;
    let scroll_dir;

    const runSticky = () => {
      // always calculate sticky and container height in case of DOM change
      sticky_height = calcStickyHeight();
      container_height = calcContainerHeight();

      bottom_limit = container_offsetTop + container_height - options_top - stick_bottom;

      // check if sticky is bigger than container
      largerSticky = sticky_height > window_height;

      const offset_top = window.pageYOffset || document.documentElement.scrollTop;
      const sticky_top = Helpers.offset(elem).top;
      const sticky_window_top = sticky_top - offset_top;
      let bottom_distance;

      // get scroll direction
      scroll_dir = offset_top < last_pos ? 'up' : 'down';
      diff_y = offset_top - last_pos;
      last_pos = offset_top;

      if (offset_top > top_limit) {
        // http://geek-and-poke.com/geekandpoke/2012/7/27/simply-explained.html
        if (bottom_limit + options_top + (largerSticky ? options_bottom : 0) - (STICKY_OPTIONS.followScroll && largerSticky ? 0 : options_top) <= offset_top + sticky_height - stick_top - ((sticky_height - stick_top > window_height - (top_limit - stick_top) && STICKY_OPTIONS.followScroll) ? (((bottom_distance = sticky_height - window_height - stick_top) > 0) ? bottom_distance : 0) : 0)) { // bottom reached end
          Sticky.release({
            position: 'absolute',
            //top: bottom_limit - sticky_height - top_limit + stick_top + sticky_offsetTop
            bottom: elemParent_offsetTop + elemParent.offsetHeight - bottom_limit - options_top
          });
        }
        else if (largerSticky && STICKY_OPTIONS.followScroll) { // sticky is bigger than container and follows scroll
          if (scroll_dir === 'down') { // scroll down
            if (sticky_window_top + sticky_height + options_bottom <= window_height + .9) { // stick on bottom
              // fix subpixel precision with adding .9 pixels
              Sticky.stick({
                //top: window_height - sticky_height - options_bottom
                bottom: options_bottom
              });
            }
            else if (Sticky.position === 'fixed') { // bottom reached window bottom
              Sticky.release({
                position: 'absolute',
                top: sticky_top - options_top - top_limit - diff_y + stick_top
              });
            }
          }
          else { // scroll up
            if (Math.ceil(sticky_window_top + stick_top) < 0 && Sticky.position === 'fixed') { // top reached window top
              Sticky.release({
                position: 'absolute',
                top: sticky_top - options_top - top_limit + stick_top - diff_y
              });
            }
            else if (sticky_top >= offset_top + options_top - stick_top) { // stick on top
              Sticky.stick({
                top: options_top - stick_top
              });
            }
          }
        }
        else { // stick on top
          Sticky.stick({
            top: options_top - stick_top
          });
        }
      }
      else { // starting point
        Sticky.release({
          stop: true
        });
      }
    };

    let scrollAttached = false;
    let resizeAttached = false;

    const disableSticky = () => {
      if (scrollAttached) {
        // detach sticky from scroll
        Helpers.event.unbind(window, 'scroll', runSticky);

        // sticky is not attached to scroll anymore
        scrollAttached = false;
      }
    };

    const initSticky = () => {
      // check if element or it's parents are visible
      if (elem.offsetParent === null || Helpers.getStyle(elem, 'display') === 'none') {
        disableSticky();
        return;
      }

      // calculate stuff
      calcSticky();

      // check if sticky is bigger than reffering container
      if (sticky_height > container_height) {
        disableSticky();
        return;
      }

      // run
      runSticky();

      if (!scrollAttached) {
        // attach sticky to scroll
        Helpers.event.bind(window, 'scroll', runSticky);

        // sticky is attached to scroll
        scrollAttached = true;
      }
    };

    const resetSticky = () => {
      // remove inline styles
      elem.style.position = '';
      elem.style.left = '';
      elem.style.top = '';
      elem.style.bottom = '';
      elem.style.width = '';

      // remove sticky class
      if (elem.classList) {
        elem.classList.remove(STICKY_OPTIONS.stickyClass);
      }
      else {
        elem.className = elem.className.replace(new RegExp('(^|\\b)' + STICKY_OPTIONS.stickyClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }

      // reset sticky object data
      Sticky.css = {};
      Sticky.position = null;

      // remove spacer
      if (Spacer.isAttached === true) {
        Spacer.detach();
      }
    };

    const reinitSticky = () => {
      resetSticky();
      applyQueries();

      if (isDisabled()) {
        disableSticky();
        return;
      }

      // restart sticky
      initSticky();
    };

    const resizeSticky = () => {
      // fire 'beforeResize' event
      if (STICKY_OPTIONS.onBeforeResize) {
        STICKY_OPTIONS.onBeforeResize.call(elem, Object.assign({}, STICKY_OPTIONS));
      }

      // reinit sticky
      reinitSticky();

      // fire 'resize' event
      if (STICKY_OPTIONS.onResize) {
        STICKY_OPTIONS.onResize.call(elem, Object.assign({}, STICKY_OPTIONS));
      }
    };

    const resize_cb = !STICKY_OPTIONS.resizeDebounce ? resizeSticky : Helpers.debounce(resizeSticky, STICKY_OPTIONS.resizeDebounce);

    // Method for updating options
    const Update = (options) => {
      setOptions(options);

      // also update user settings
      userSettings = Object.assign({}, userSettings, options || {});

      reinitSticky();
    };

    const Detach = () => {
      // detach resize reinit
      if (resizeAttached) {
        Helpers.event.unbind(window, 'resize', resize_cb);
        resizeAttached = false;
      }

      disableSticky();
    };

    const Destroy = () => {
      Detach();
      resetSticky();
    };

    const Attach = () => {
      // attach resize reinit
      if (!resizeAttached) {
        Helpers.event.bind(window, 'resize', resize_cb);
        resizeAttached = true;
      }

      applyQueries();

      if (isDisabled()) {
        disableSticky();
        return;
      }

      initSticky();
    };

    this.options = getOptions;
    this.refresh = reinitSticky;
    this.update = Update;
    this.attach = Attach;
    this.detach = Detach;
    this.destroy = Destroy;

    // jQuery methods
    this.triggerMethod = (method, options) => {
      if (typeof this[method] === 'function') {
        this[method](options);
      }
    };

    this.reinit = () => {
      deprecated('reinit', 'refresh', 'method');
      reinitSticky();
    };

    // init settings
    setOptions(userSettings);

    // start sticky
    Attach();

    // reinit on complete page load
    Helpers.event.bind(window, 'load', reinitSticky);
  };

  // jQuery Plugin
  if (typeof window.jQuery !== 'undefined') {
    const $ = window.jQuery;
    const namespace = 'hcSticky';

    $.fn.extend({
      hcSticky: function(args, update) {
        // check if selected element exist
        if (!this.length) return this;

        // we need to return options
        if (args === 'options') {
          return $.data(this.get(0), namespace).options();
        }

        return this.each(function() {
          let instance = $.data(this, namespace);

          if (instance) {
            // already created, trigger method
            instance.triggerMethod(args, update);
          }
          else {
            // create new instance
            instance = new hcSticky(this, args);
            $.data(this, namespace, instance);
          }
        });
      }
    });
  }

  // browser global
  window.hcSticky = window.hcSticky || hcSticky;

  return hcSticky;
});
