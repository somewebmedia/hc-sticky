HC-Sticky
=========

> v.1.2.43


Cross-browser jQuery plugin that makes any element attached to the page and always visible while you scroll.


##Call the plugin

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery.hc-sticky.js"></script>
<script>
	jQuery(document).ready(function($){
		$('#element').hcSticky();
	});
</script>
```

## Options and callbacks

Options can be updated at any time by calling the plugin again.

Example:
```javascript
$('#element').hcSticky({
	top: 50
});
```

<table>
	<tr>
		<th>Property</th>
		<th>Default</th>
		<th>Type</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><strong>top</strong></td>
		<td>0</td>
		<td>int</td>
		<td>The distance from the top of the Window at which to trigger HC-Sticky.</td>
	</tr>
	<tr>
		<td><strong>bottom</strong></td>
		<td>0</td>
		<td>int</td>
		<td>The distance from the bottom of the Window at which to glue HC-Sticky.</td>
	</tr>
	<tr>
		<td><strong>innerTop</strong></td>
		<td>0</td>
		<td>int</td>
		<td>The distance from the top inside of the sticky content at which to trigger HC-Sticky.</td>
	</tr>
	<tr>
		<td><strong>innerSticker</strong></td>
		<td>null</td>
		<td>jQuery selector</td>
		<td>Element at which to trigger HC-Sticky instead of top of sticky container. This has higher priority than innerTop option.</td>
	</tr>
	<tr>
		<td><strong>bottomEnd</strong></td>
		<td>0</td>
		<td>int</td>
		<td>The distance from the bottom of the referring element at which to stop HC-Sticky.</td>
	</tr>
	<tr>
		<td><strong>stickTo</strong></td>
		<td>null</td>
		<td>jQuery selector / jQuery object</td>
		<td>Element that represents the reference for height instead of height of the container. Use<code>document</code> for top menus.</td>
	</tr>
	<tr>
		<td><strong>responsive</strong></td>
		<td>true</td>
		<td>boolean</td>
		<td>When set to <code>true</code>, HC-Sticky will recalculate its dimensions and position on resize.</td>
	</tr>
	<tr>
		<td><strong>offResolutions</strong></td>
		<td>null</td>
		<td>int / array</td>
		<td>Set resolutions at which HC-Sticky will turn itself off. If integer is negative, it will turn off below given resolution, if positive it will turn off above it. Example: <code>[-780, 1600]</code></td>
	</tr>
	<tr>
		<td><strong>followScroll</strong></td>
		<td>true</td>
		<td>boolean</td>
		<td>When set to <code>false</code>, sticky content will not move with the page if it is bigger that Window.</td>
	</tr>
	<tr>
		<td><strong>className</strong></td>
		<td>"sticky"</td>
		<td>string</td>
		<td>HTML class that will be applied to sticky element while it is floating.</td>
	</tr>
	<tr>
		<td><strong>wrapperClassName</strong></td>
		<td>"wrapper-sticky"</td>
		<td>string</td>
		<td>HTML class that is set to wrapper that HC-Sticky creates around your sticky element.</td>
	</tr>
	<tr>
		<td><strong>onStart</strong></td>
		<td>false</td>
		<td>function</td>
		<td>Callback function on plugin Start event (when the element starts floating).</td>
	</tr>
	<tr>
		<td><strong>onStop</strong></td>
		<td>false</td>
		<td>function</td>
		<td>Callback function on plugin Stop event (when the element stops floating and returns to its normal state).</td>
	</tr>
</table>


## Commands

Commands are used to control the plugin after initialization.

Example:
```javascript
$('#element').hcSticky('stop');
```

<table>
	<tr>
		<th>Command</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><strong>stop</strong></td>
		<td>Stops the sticky while preserving its current position.</td>
	</tr>
	<tr>
		<td><strong>off</strong></td>
		<td>Turnes off the sticky completely.</td>
	</tr>
	<tr>
		<td><strong>on</strong></td>
		<td>Turns the sticky back on after above two commands.</td>
	</tr>
	<tr>
		<td><strong>reinit</strong></td>
		<td>Recalculates sticky size. Useful after altering DOM elements inside sticky.</td>
	</tr>
	<tr>
		<td><strong>destroy</strong></td>
		<td>Completely destroys sticky and reverts element to original state.</td>
	</tr>
</table>