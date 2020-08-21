((window) => {
  'use strict';

  const hcSticky = window.hcSticky;
  const document = window.document;

  /*
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
   */
  if (typeof Object.assign !== 'function') {
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) {
        'use strict';
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) {
            for (var nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  /*
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
   */
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback) {
      var T, k;

      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      if (arguments.length > 1) {
        T = arguments[1];
      }

      k = 0;

      while (k < len) {
        var kValue;

        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }

        k++;
      }
    };
  }

  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = {passive: false};
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}

  const getElement = (el) => {
    let node = null;

    if (typeof el === 'string') {
      node = document.querySelector(el);
    }
    else if (window.jQuery && el instanceof window.jQuery && el.length) {
      node = el[0];
    }
    else if (el instanceof Element) {
      node = el;
    }

    return node;
  };

  // debounce taken from underscore
  const debounce = (func, wait, immediate) => {
    let timeout;

    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  // cross-browser get style
  const getStyle = (el, style) => {
    if (window.getComputedStyle) {
      return style ? document.defaultView.getComputedStyle(el, null).getPropertyValue(style) : document.defaultView.getComputedStyle(el, null);
    }
    else if (el.currentStyle) {
      return style ? el.currentStyle[style.replace(/-\w/g, (s) => {
        return s.toUpperCase().replace('-', '');
      })] : el.currentStyle;
    }
  };

  // check if object is empty
  const isEmptyObject = (obj) => {
    for (const name in obj) {
      return false;
    }

    return true;
  };

  // check if element has class
  const hasClass = (el, className) => {
    if (el.classList) {
      return el.classList.contains(className);
    }
    else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
  };

  // like jQuery .offset()
  const offset = (el) => {
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
    };
  };

  // like jQuery .position()
  const position = (el) => {
    const offsetParent = el.offsetParent;
    const parentOffset = offset(offsetParent);
    const elemOffset = offset(el);
    const prentStyle = getStyle(offsetParent);
    const elemStyle = getStyle(el);

    parentOffset.top += parseInt(prentStyle.borderTopWidth) || 0;
    parentOffset.left += parseInt(prentStyle.borderLeftWidth) || 0;

    return {
      top: elemOffset.top - parentOffset.top - (parseInt(elemStyle.marginTop) || 0),
      left: elemOffset.left - parentOffset.left - (parseInt(elemStyle.marginLeft) || 0)
    };
  };

  // get cascaded instead of computed styles
  const getCascadedStyle = (el) => {
    // clone element
    let clone = el.cloneNode(true);

    clone.style.display = 'none';

    // remove name attr from cloned radio buttons to prevent their clearing
    Array.prototype.slice.call(clone.querySelectorAll('input[type="radio"]')).forEach((el) => {
      el.removeAttribute('name');
    });

    // insert clone to DOM
    el.parentNode.insertBefore(clone, el.nextSibling);

    // get styles
    let currentStyle;

    if (clone.currentStyle) {
      currentStyle = clone.currentStyle;
    }
    else if (window.getComputedStyle) {
      currentStyle = document.defaultView.getComputedStyle(clone, null);
    }

    // new style oject
    let style = {};

    for (const prop in currentStyle) {
      if (isNaN(prop) && (typeof currentStyle[prop] === 'string' || typeof currentStyle[prop] === 'number')) {
        style[prop] = currentStyle[prop];
      }
    }

    // safari copy
    if (Object.keys(style).length < 3) {
      style = {}; // clear
      for (const prop in currentStyle) {
        if (!isNaN(prop)) {
          style[currentStyle[prop].replace(/-\w/g, (s) => {
            return s.toUpperCase().replace('-', '');
          })] = currentStyle.getPropertyValue(currentStyle[prop]);
        }
      }
    }

    // check for margin:auto
    if (!style.margin && style.marginLeft === 'auto') {
      style.margin = 'auto';
    }
    else if (!style.margin && style.marginLeft === style.marginRight && style.marginLeft === style.marginTop && style.marginLeft === style.marginBottom) {
      style.margin = style.marginLeft;
    }

    // safari margin:auto hack
    if (!style.margin && style.marginLeft === '0px' && style.marginRight === '0px') {
      const posLeft = el.offsetLeft - el.parentNode.offsetLeft;
      const marginLeft = posLeft - (parseInt(style.left) || 0) - (parseInt(style.right) || 0);
      const marginRight = el.parentNode.offsetWidth - el.offsetWidth - posLeft - (parseInt(style.right) || 0) + (parseInt(style.left) || 0);
      const diff = marginRight - marginLeft;

      if (diff === 0 || diff === 1) {
        style.margin = 'auto';
      }
    }

    // destroy clone
    clone.parentNode.removeChild(clone);
    clone = null;

    return style;
  };

  hcSticky.Helpers = {
    supportsPassive,
    isEmptyObject,
    debounce,
    hasClass,
    offset,
    position,
    getElement,
    getStyle,
    getCascadedStyle
  };

})(window);
