/*!
 * HC-Sticky
 * =========
 * Version: 2.1.0
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

  const defaultOptions = {
    top: 0,
    bottom: 0,
    bottomEnd: 0,
    innerTop: 0,
    innerSticker: null,
    stickyClass: 'sticky',
    stickTo: null,
    followScroll: true,
    queries: null,
    queryFlow: 'down',
    onStart: null,
    onStop: null,
    onBeforeResize: null,
    onResize: null,
    resizeDebounce: 100,
    disable: false
  };

  const document = window.document;

  const hcSticky = function(elem, userSettings) {
    // use querySeletor if string is passed
    if (typeof elem === 'string') {
      elem = document.querySelector(elem);
    }

    // check if element exist
    if (!elem) {
      return false;
    }

    let stickyOptions = {};
    const Helpers = hcSticky.Helpers;
    const elemParent = elem.parentNode;

    // parent can't be static
    if (Helpers.getStyle(elemParent, 'position') === 'static') {
      elemParent.style.position = 'relative';
    }

    const setOptions = (options = {}) => {
      // nothing to set
      if (Helpers.isEmptyObject(options) && stickyOptions) {
        return;
      }

      // extend options
      stickyOptions = Object.assign({}, defaultOptions, stickyOptions, options);
    };

    const resetOptions = (options) => {
      stickyOptions = Object.assign({}, defaultOptions, options || {});
    };

    const getOptions = (option) => {
      return option ? (stickyOptions.option || null) : Object.assign({}, stickyOptions);
    };

    const isDisabled = () => {
      return stickyOptions.disable;
    };

    const applyQueries = () => {
      if (stickyOptions.queries) {
        const window_width = window.innerWidth;
        const queryFlow = stickyOptions.queryFlow;
        const queries = stickyOptions.queries;

        // reset settings
        resetOptions(userSettings);

        if (queryFlow === 'up') {
          for (const width in queries) {
            if (window_width >= width && !Helpers.isEmptyObject(queries[width])) {
              setOptions(queries[width]);
            }
          }
        }
        else {
          const queries_arr = [];

          // convert to array so we can reverse loop it
          for (const b in stickyOptions.queries) {
            const q = {};

            q[b] = queries[b];
            queries_arr.push(q);
          }

          for (let i = queries_arr.length - 1; i >= 0; i--) {
            const query = queries_arr[i];
            const breakpoint = Object.keys(query)[0];

            if (window_width <= breakpoint && !Helpers.isEmptyObject(query[breakpoint])) {
              setOptions(query[breakpoint]);
            }
          }
        }
      }
    };

    // our helper function for getting necesery styles
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
        if (Helpers.hasClass(elem, stickyOptions.stickyClass)) {
          // check if element is already sticky
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
          elem.classList.add(stickyOptions.stickyClass);
        }
        else {
          elem.className += ' ' + stickyOptions.stickyClass;
        }

        // fire 'start' event
        if (stickyOptions.onStart) {
          stickyOptions.onStart.call(elem, stickyOptions);
        }
      },
      reset: (args = {}) => {
        args.disable = args.disable || false;

        // check if we've already done this
        if (Sticky.position !== 'fixed' && Sticky.position !== null && (
          (typeof args.top === 'undefined' && typeof args.bottom === 'undefined') ||
          (typeof args.top !== 'undefined' && (parseInt(Helpers.getStyle(elem, 'top')) || 0) === args.top) ||
          (typeof args.bottom !== 'undefined' && (parseInt(Helpers.getStyle(elem, 'bottom')) || 0) === args.bottom)
        )) {
          return;
        }

        if (args.disable === true) {
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
        elem.style.left = args.disable === true ? Sticky.css.left : Spacer.positionLeft + 'px';
        elem.style.width = position !== 'absolute' ? Sticky.css.width : Spacer.width;

        if (typeof args.bottom === 'undefined') {
          elem.style.bottom = args.disable === true ? '' : 'auto';
        }
        else {
          elem.style.bottom = args.bottom + 'px';
        }

        if (typeof args.top === 'undefined') {
          elem.style.top = args.disable === true ? '' : 'auto';
        }
        else {
          elem.style.top = args.top + 'px';
        }

        // remove sticky class
        if (elem.classList) {
          elem.classList.remove(stickyOptions.stickyClass);
        }
        else {
          elem.className = elem.className.replace(new RegExp('(^|\\b)' + stickyOptions.stickyClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }

        // fire 'stop' event
        if (stickyOptions.onStop) {
          stickyOptions.onStop.call(elem, stickyOptions);
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
        // copy styles from element
        for (const prop in Sticky.css) {
          Spacer.el.style[prop] = Sticky.css[prop];
        }

        const elemStyle = Helpers.getStyle(elem);

        // get spacer offset and position
        Spacer.offsetLeft = Helpers.offset(elem).left  - (parseInt(elemStyle.marginLeft) || 0);
        Spacer.positionLeft = Helpers.position(elem).left;

        // get spacer width
        Spacer.width = Helpers.getStyle(elem, 'width');
      },
      attach: () => {
        // insert spacer to DOM
        elemParent.insertBefore(Spacer.el, elem.nextSibling);
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
      stickTo_document = stickyOptions.stickTo && (stickyOptions.stickTo === 'document'
        || (stickyOptions.stickTo.nodeType && stickyOptions.stickTo.nodeType === 9)
        || (typeof stickyOptions.stickTo === 'object' && stickyOptions.stickTo instanceof (typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document)))
      ? true : false;

      // select referred container
      container = stickyOptions.stickTo
        ? stickTo_document
          ? document
          : typeof stickyOptions.stickTo === 'string'
            ? document.querySelector(stickyOptions.stickTo)
            : stickyOptions.stickTo
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
      elemParent_offsetTop = !stickyOptions.stickTo
        ? container_offsetTop // parent is container
        : !stickTo_document
          ? Helpers.offset(elemParent).top
          : 0;
      window_height = window.innerHeight;
      sticky_offsetTop = elem.offsetTop - (parseInt(Sticky.css.marginTop) || 0);

      // get inner sticker element
      inner_sticker = stickyOptions.innerSticker
        ? typeof stickyOptions.innerSticker === 'string'
          ? document.querySelector(stickyOptions.innerSticker)
          : stickyOptions.innerSticker
        : null;

      // top
      options_top = isNaN(stickyOptions.top) && stickyOptions.top.indexOf('%') > -1
        ? (parseFloat(stickyOptions.top) / 100) * window_height
        : stickyOptions.top;

      // bottom
      options_bottom = isNaN(stickyOptions.bottom) && stickyOptions.bottom.indexOf('%') > -1
        ? (parseFloat(stickyOptions.bottom) / 100) * window_height
        : stickyOptions.bottom;

      // calculate sticky breakpoints
      stick_top = inner_sticker
        ? inner_sticker.offsetTop
        : stickyOptions.innerTop
          ? stickyOptions.innerTop
          : 0;
      stick_bottom = isNaN(stickyOptions.bottomEnd) && stickyOptions.bottomEnd.indexOf('%') > -1
        ? (parseFloat(stickyOptions.bottomEnd) / 100) * window_height
        : stickyOptions.bottomEnd,

      top_limit = container_offsetTop - options_top + stick_top + sticky_offsetTop;
    };

    // store scroll position so we can determine scroll direction
    let last_pos = window.pageYOffset || document.documentElement.scrollTop;
    let diff_y = 0;
    let scroll_dir;

    const runSticky = () => {
      // always calculate sticky and container height in case of change
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
        if (bottom_limit + options_top + (largerSticky ? options_bottom : 0) - (stickyOptions.followScroll && largerSticky ? 0 : options_top) <= offset_top + sticky_height - stick_top - ((sticky_height - stick_top > window_height - (top_limit - stick_top) && stickyOptions.followScroll) ? (((bottom_distance = sticky_height - window_height - stick_top) > 0) ? bottom_distance : 0) : 0)) { // bottom reached end
          Sticky.reset({
            position: 'absolute',
            //top: bottom_limit - sticky_height - top_limit + stick_top + sticky_offsetTop
            bottom: elemParent_offsetTop + elemParent.offsetHeight - bottom_limit - options_top
          });
        }
        else if (largerSticky && stickyOptions.followScroll) { // sticky is bigger than container and follows scroll
          if (scroll_dir === 'down') { // scroll down
            if (sticky_window_top + sticky_height + options_bottom <= window_height) { // stick on bottom
              Sticky.stick({
                //top: window_height - sticky_height - options_bottom
                bottom: options_bottom
              });
            }
            else if (Sticky.position === 'fixed') { // bottom reached window bottom
              Sticky.reset({
                position: 'absolute',
                top: sticky_top - options_top - top_limit - diff_y + stick_top
              });
            }
          }
          else { // scroll up
            if (sticky_window_top + stick_top < 0 && Sticky.position === 'fixed') { // top reached window top
              Sticky.reset({
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
        Sticky.reset({
          disable: true
        });
      }
    };

    let scrollAttached = false;
    let resizeAttached = false;

    const stopSticky = () => {
      if (scrollAttached) {
        // detach sticky from scroll
        Helpers.event.unbind(window, 'scroll', runSticky);

        // sticky is not attached to scroll anymore
        scrollAttached = false;
      }
    };

    const initSticky = () => {
      // calculate stuff
      calcSticky();

      // check if sticky is bigger than reffering container
      if (sticky_height >= container_height) {
        stopSticky();

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
        elem.classList.remove(stickyOptions.stickyClass);
      }
      else {
        elem.className = elem.className.replace(new RegExp('(^|\\b)' + stickyOptions.stickyClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
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
        stopSticky();
        return;
      }

      // restart sticky
      initSticky();
    };

    const resizeSticky = () => {
      // fire 'beforeResize' event
      if (stickyOptions.onBeforeResize) {
        stickyOptions.onBeforeResize.call(elem, stickyOptions);
      }

      // reinit sticky
      reinitSticky();

      // fire 'resize' event
      if (stickyOptions.onResize) {
        stickyOptions.onResize.call(elem, stickyOptions);
      }
    };

    const resize_cb = !stickyOptions.resizeDebounce ? resizeSticky : Helpers.debounce(resizeSticky, stickyOptions.resizeDebounce);

    // Method for updating options
    const Update = (options) => {
      setOptions(options);
      reinitSticky();
    };

    const Detach = () => {
      // detach resize reinit
      if (resizeAttached) {
        Helpers.event.unbind(window, 'resize', resize_cb);
        resizeAttached = false;
      }

      stopSticky();
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
        stopSticky();
        return;
      }

      initSticky();
    };

    this.options = getOptions;
    this.reinit = reinitSticky;
    this.update = Update;
    this.attach = Attach;
    this.detach = Detach;
    this.destroy = Destroy;

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

    $.fn.extend({
      hcSticky: function(options) {
        // check if selected element exist
        if (!this.length) {
          return this;
        }

        return this.each(function() {
          const namespace = 'hcSticky';
          let instance = $.data(this, namespace);

          if (instance) {
            // already created
            instance.update(options);
          }
          else {
            // create new instance
            instance = new hcSticky(this, options);
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
