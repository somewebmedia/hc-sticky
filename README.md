HC-Sticky
=========

Cross-browser plugin that makes any element on your page visible while you scroll.


## Usage

```html
<script src="/path/to/hc-sticky.js"></script>

<script>
  // call this script just before closing </html> or after your #element
  var Sticky = new hcSticky('#element', {
    stickTo: '#content'
  });
</script>
```

### jQuery

```html
<script src="/path/to/hc-sticky.js"></script>

<script>
  jQuery(document).ready(function($) {
    $('#element').hcSticky({
      stickTo: '#content'
    });
  });
</script>
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
| *`queries`* | null | object | Object containing responsive breakpoints, on which you can tell HC Sticky what to do. |
| *`onStart`* | null | function | Callback function fired when the element becomes attached. |
| *`onStop`* | null | function | Callback function fired when the element stops floating. |
| *`onBeforeResize`* | null | function | Callback function fired before sticky has been resized (happens after *Window* resize and before sticky reinit). |
| *`onResize`* | null | function | Callback function fired after sticky has been resized (happens after *Window* resize and sticky reinit). |
| *`resizeDebounce`* | 100 | int | Limit the rate at which the HC Sticky can fire on window resize. |


## Methods

Methods are used to control the plugin after initialization.

Example:
```javascript
var Sticky = new hcSticky('#element', {
  stickTo: '#content'
});

Sticky.update({
  top: 20
});
```

| Method | Accepts | Description |
|---------|---------|--------------|
| *`options`* | string | Returns current settings, or a specific setting if you specify it. |
| *`update`* | object | Updates the settings with the new ones. |
| *`reinit`* | | Recalculates sticky size and position. Useful after altering DOM elements inside sticky. |
| *`detach`* | | Detaches the HC-Sticky from element, preventing it from running. |
| *`attach`* | | Attaches the HC-Sticky back to the element. |
| *`destroy`* | | Completely destroys HC-Sticky and reverts element to original state. |
