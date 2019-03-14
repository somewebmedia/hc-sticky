HC-Sticky
=========

Dependency free javascript library that makes any element on your page visible while you scroll.
Check out the [demos](https://somewebmedia.github.io/hc-sticky).


## Quick start

### Install

This package can be installed with:

- [npm](https://www.npmjs.com/package/hc-sticky): `npm install --save hc-sticky`
- [bower](http://bower.io/search/?q=hc-sticky): `bower install --save hc-sticky`

Or download the [latest release](https://github.com/somewebmedia/hc-sticky/releases).


### Load

#### Static HTML

```html
<script src="/path_to/hc-sticky.js"></script>
```

#### Browserify

In the script, including HC-Sticky will usually look like this:

```js
const hcSticky = require('hc-sticky');
```


### Usage

Be sure to call HC-Sticky once your element is available in the DOM.

#### Vanilla JS

```js
var Sticky = new hcSticky('#element', {
  stickTo: '#content'
});
```

#### jQuery

```js
jQuery(document).ready(function($) {
  $('#element').hcSticky({
    stickTo: '#content'
  });
});
```


## Options

HC Sticky has a wide range of options you can set to have a full controll over the sticky elements.

| Property | Default | Type | Description |
|-----------|---------|-------|-------------|
| *`top`* | 0 | int | The distance from the top of the *Window* at which to trigger HC-Sticky. |
| *`bottom`* | 0 | int | The distance from the bottom of the *Window* at which to attach HC-Sticky. |
| *`innerTop`* | 0 | int | The distance from the top inside of the sticky element at which to trigger HC-Sticky. |
| *`innerSticker`* | null | string / element object | Element inside of the sticky element at which to attach HC-Sticky. This has higher priority than innerTop option. |
| *`bottomEnd`* | 0 | int | The distance from the bottom of the referring element at which to stop HC-Sticky. |
| *`stickTo`* | null (parent element) | string / element object | Element that represents the reference for height instead of height of the container. |
| *`followScroll`* | true | boolean | When set to `false`, sticky content will not move with the page if it is bigger than *Window*. |
| *`stickyClass`* | 'sticky' | string | HTML class that will be applied to sticky element while it is attached. |
| *`responsive`* | null | object | Object containing responsive breakpoints, on which you can tell HC Sticky what to do. |
| *`mobileFirst`* | false | boolean | Direction of the responsive queries. |
| *`disable`* | false | boolean | Disable the plugin. Usualy used with responsive object. |
| *`onStart`* | null | function | Callback function fired when the element becomes attached. |
| *`onStop`* | null | function | Callback function fired when the element stops floating. |
| *`onBeforeResize`* | null | function | Callback function fired before sticky has been resized (happens after *Window* resize and before sticky reinit). |
| *`onResize`* | null | function | Callback function fired after sticky has been resized (happens after *Window* resize and sticky reinit). |
| *`resizeDebounce`* | 100 | int | Limit the rate at which the HC Sticky can fire on window resize. |

More on how to use the responsive object [here](https://github.com/somewebmedia/hc-sticky/issues/55#issuecomment-416826958).


### Methods

Methods are used to control the plugin after initialization.

| Method | Accepts | Description |
|---------|---------|--------------|
| *`options`* | string | Returns current settings, or a specific setting if you specify it. |
| *`update`* | object | Updates the settings with the new ones. |
| *`refresh`* | N/A | Recalculates sticky size and position. Useful after altering DOM elements inside sticky. |
| *`detach`* | N/A | Detaches the HC-Sticky from element, preventing it from running. |
| *`attach`* | N/A | Attaches the HC-Sticky back to the element. |
| *`destroy`* | N/A | Completely destroys HC-Sticky and reverts element to original state. |

#### Vanilla JS

```js
var Sticky = new hcSticky('#element', {
  stickTo: '#content'
});

Sticky.update({
  top: 20
});
```

#### jQuery

```js
var $sticky = $('#element');

$sticky.hcSticky({
  stickTo: '#content'
});

$sticky.hcSticky('update', {
  top: 20
});
```


## Dev Building

This package comes with [Gulp](https://gulpjs.com/). The following tasks are available:

  * `default` compiles the JS into `/dist` and builds the Demos into `demo/build`.
  * `watch` watches source JS and Demo files and builds them automatically whenever you save.

You can pass a `--dev` command if you don't want the compiled JS to be minified.


## License

The code and the documentation are released under the MIT License.