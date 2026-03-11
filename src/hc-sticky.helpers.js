( ( window ) => {
  const hcSticky = window.hcSticky;

  const getElement = ( el ) => {
    if ( typeof el === 'string' ) return document.querySelector( el );
    if ( window.jQuery && el instanceof window.jQuery && el.length ) return el[0];
    if ( el instanceof Element ) return el;
    return null;
  };

  const debounce = ( func, wait, immediate ) => {
    let timeout;

    return function() {
      const context = this;
      const args = arguments;
      const later = () => {
        timeout = null;
        if ( ! immediate ) func.apply( context, args );
      };
      const callNow = immediate && ! timeout;

      clearTimeout( timeout );
      timeout = setTimeout( later, wait );

      if ( callNow ) func.apply( context, args );
    };
  };

  const getStyle = ( el, style ) => {
    const computed = document.defaultView.getComputedStyle( el, null );
    return style ? computed.getPropertyValue( style ) : computed;
  };

  const isEmptyObject = ( obj ) => {
    for ( const name in obj ) return false;
    return true;
  };

  const offset = ( el ) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  };

  const position = ( el ) => {
    const offsetParent = el.offsetParent;
    const parentOffset = offset( offsetParent );
    const elemOffset = offset( el );
    const parentStyle = getStyle( offsetParent );
    const elemStyle = getStyle( el );

    parentOffset.top += parseInt( parentStyle.borderTopWidth ) || 0;
    parentOffset.left += parseInt( parentStyle.borderLeftWidth ) || 0;

    return {
      top: elemOffset.top - parentOffset.top - ( parseInt( elemStyle.marginTop ) || 0 ),
      left: elemOffset.left - parentOffset.left - ( parseInt( elemStyle.marginLeft ) || 0 )
    };
  };

  // get cascaded instead of computed styles
  const getCascadedStyle = ( el ) => {
    // clone element
    let clone = el.cloneNode( true );

    clone.style.display = 'none';

    clone.querySelectorAll( 'input[type="radio"]' ).forEach( ( input ) => {
      input.removeAttribute( 'name' );
    } );

    // insert clone to DOM
    el.parentNode.insertBefore( clone, el.nextSibling );

    const currentStyle = document.defaultView.getComputedStyle( clone, null );
    let style = {};

    for ( const prop in currentStyle ) {
      if ( isNaN( prop ) && ( typeof currentStyle[prop] === 'string' || typeof currentStyle[prop] === 'number' ) ) {
        style[prop] = currentStyle[prop];
      }
    }

    if ( Object.keys( style ).length < 3 ) {
      style = {};
      for ( const prop in currentStyle ) {
        if ( ! isNaN( prop ) ) {
          style[currentStyle[prop].replace( /-\w/g, ( s ) => {
            return s.toUpperCase().replace( '-', '' );
          } )] = currentStyle.getPropertyValue( currentStyle[prop] );
        }
      }
    }

    // check for margin:auto
    if ( ! style.margin && style.marginLeft === 'auto' ) {
      style.margin = 'auto';
    }
    else if ( ! style.margin && style.marginLeft === style.marginRight && style.marginLeft === style.marginTop && style.marginLeft === style.marginBottom ) {
      style.margin = style.marginLeft;
    }

    if ( ! style.margin && style.marginLeft === '0px' && style.marginRight === '0px' ) {
      const posLeft = el.offsetLeft - el.parentNode.offsetLeft;
      const marginLeft = posLeft - ( parseInt( style.left ) || 0 ) - ( parseInt( style.right ) || 0 );
      const marginRight = el.parentNode.offsetWidth - el.offsetWidth - posLeft - ( parseInt( style.right ) || 0 ) + ( parseInt( style.left ) || 0 );
      const diff = marginRight - marginLeft;

      if ( diff === 0 || diff === 1 ) style.margin = 'auto';
    }

    // destroy clone
    clone.parentNode.removeChild( clone );
    clone = null;

    return style;
  };

  const supportsPassive = ( () => {
    let result = false;
    try {
      const opts = Object.defineProperty( {}, 'passive', {
        get: () => { result = { passive: false }; }
      } );
      window.addEventListener( 'testPassive', null, opts );
      window.removeEventListener( 'testPassive', null, opts );
    }
    catch ( e ) {}
    return result;
  } )();

  hcSticky.Helpers = {
    supportsPassive,
    isEmptyObject,
    debounce,
    offset,
    position,
    getElement,
    getStyle,
    getCascadedStyle
  };

} )( window );
