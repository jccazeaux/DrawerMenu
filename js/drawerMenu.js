/*! Copyright (C) 2014 Jean-Christophe Cazeaux
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @Class DrawerMenu
 */
/**
 * DrawerMenu Object
 * @constructor DrawerMenu
 * @param {DOMElement} menu Element du menu
 * @param {Object} options
 * @... {int} leftPadding the left padding where the menu can be opened
 * @returns
 */
function DrawerMenu(menu, options) {
	var settings = {
		"leftPadding": 40
	};
	// Merge the settings with the options
	for (var optionsItem in options) {
		settings[optionsItem] = options[optionsItem];
	}
    var that = this;
   	/* touch/mouse events*/
    var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
    	hasTouch = 'ontouchstart' in window && !isTouchPad,
	START_EVENT = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EVENT = hasTouch ? 'touchmove' : 'mousemove',
	END_EVENT = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EVENT = hasTouch ? 'touchcancel' : 'mouseup';

	/** shadow element */
    var shadow = createShadow();
    
    /**
     * Create the shadow div
     * @function {private void} createShadow
     */
    function createShadow() {
    	var divShadow = document.createElement("div");
    	divShadow.setAttribute("class", "drawermenu-shadow");
    	divShadow.style.position = "fixed";
    	divShadow.style.top = 0;
   		divShadow.style.left = 0;
   		divShadow.style.height = 0;
   		divShadow.style.width = 0;
   		divShadow.style["z-index"] = 999;
   		divShadow.style.background = "#000";
   		divShadow.style.opacity = 0;
   		divShadow.style[getTransitionProp()] = "opacity .3s ease-out";

    	document.body.appendChild(divShadow);
    	return divShadow;
    }
    
    /* Events initialisation */
	window.addEventListener(START_EVENT, this, true);
	shadow.addEventListener('click', this, true);
	
	/**
	 * Implementation of the handleEvent of the interface EventListener
	 * @function {public void} handleEvent
	 * @param {Event} event
	 */
	this.handleEvent = function(event) {
		switch (event.type) {
			case START_EVENT: startDrag(event); break;
			case MOVE_EVENT: drag(event); break;
			case CANCEL_EVENT: release(event); break;
			case END_EVENT: release(event); break;
			case 'click': 
				if (event.target === shadow) {
					return that.hide(event);
				}
				break;
		}
	};

	/**
	 * Destruction du menu. Détruit le shadow, réinitialise le menu et débranche les listeners
	 * @function {public void} destroy
	 */
	this.destroy = function() {
		shadow.parentNode.removeChild(shadow);
	    /* Events initialisation */
		window.removeEventListener(START_EVENT, this, true);
		shadow.removeEventListener('click', this, true);
		unAnimateMenu();
		this.show();
		reset();
	};
	
	/**
	 * Callback on a drag starting
	 * @function {private void} startDrag
	 * @param {Event} e
	 */
	function startDrag(e) {
		unAnimateMenu();
		that.initialMouseX = getMousePosition(e).X;
		that.initialleft = getDimMenu().left;
		if (that.initialMouseX < settings.leftPadding + that.initialleft + getDimMenu().width) {
			window.addEventListener(MOVE_EVENT, that, true);
			window.addEventListener(END_EVENT, that, true);
		}
	}
	
	/**
	 * Reset the events on the menu
	 * @function {private void} reset
	 */
	function reset() {
		window.removeEventListener(MOVE_EVENT, that, true);
		window.removeEventListener(END_EVENT, that, true);
	}
	
	/**
	 * Callback when the menu is dragged
	 * @function {private void} drag
	 * @param {Event} e
	 */
	function drag(e) {
		e.preventDefault();
		that.clientX = getMousePosition(e).X;
		// On calcule la position relative
		var position = that.clientX + that.initialleft - that.initialMouseX ;
		if (position > 0) {
			position = 0;
		} else if (position < getDimMenu().width * -1 ) {
			position = getDimMenu().left * -1;
		}
		menu.style[getTransformProp()] = "translate3d(" + position  + "px,0,0)";
	}
	
	/**
	 * Callback when the menu is released
	 * @function {private void} release
	 */
	function release() {
		animateMenu();
		if (getDimMenu().left > Math.round(getDimMenu().width / 2) * -1) {
			that.show();
		} else {
			that.hide();
		}
		reset();
	}
	
	/**
	 * Gets the dimension of the menu
	 * @todo works on all browsers?
	 * @function {private Object} getDimMenu
	 */
	function getDimMenu() {
		return menu.getBoundingClientRect();
	}

	/**
	 * Activate the animation on the menu
	 * @function {private void} animateMenu
	 */
	function animateMenu() {
		menu.style.transition = "transform .3s ease-out";
		menu.style.WebkitTransition = "-webkit-transform .3s ease-out";
		menu.style.MozTransition = "-moz-transform .3s ease-out";
		menu.style.OTransition = "-o-transform .3s ease-out";
		menu.style.msTransition = "-ms-transform .3s ease-out";
	}
	/**
	 * Deactive the animation on the menu
	 * @function {private void} unAnimateMenu
	 */
	function unAnimateMenu() {
		menu.style.transition = "none";
		menu.style.WebkitTransition = "none";
		menu.style.MozTransition = "none";
		menu.style.OTransition = "none";
		menu.style.msTransition = "none";
	}
	
	/**
	 * Hide the menu
	 * @function {public void} hide
	 */
	this.hide = function() {
		menu.style[getTransformProp()] = "translate3d(-" + getDimMenu().width + "px,0,0)";
		animateMenu();
		hideShadow();
		reset();
	};
	
	/**
	 * Show the menu
	 * @function {public void} show
	 */
	this.show = function() {
		menu.style[getTransformProp()] = "translate3d(0,0,0)";
		animateMenu();
		showShadow();
		reset();
	};
	
	/**
	 * Show the shadow div
	 * @function {private void} showShadow
	 */
 	function showShadow() {
		shadow.style.opacity = "0.3";
		shadow.style.height = "100%";
		shadow.style.width = "100%";
	}
	
	/**
	 * Hide the shadow div
	 * @function {private void} showShadow
	 */
	function hideShadow() {
		shadow.style.opacity = "0";
		shadow.style.height = "0";
		shadow.style.width = "0";
	}
	
	/**
	 *
	 * Gets the mouse position from the Event
	 * @function {private Object} getMousePosition
	 * @param e
	 * @returns position
	 * @... {int} X
	 * @... {int} Y 
	 */
	function getMousePosition(e) {
		var position = {};
		var evt = e || window.event;
		var touches;
		if (e.touches) {
			touches = e.touches;
		} else if(e.originalEvent) {
			touches = evt.originalEvent.changedTouches;
		}
		if (touches) {
			position.X = touches[0].clientX;
			position.Y = touches[0].clientX;
		} else {
			position.X = evt.clientX;
			position.Y = evt.clientX;
		}
		return position;
	}
	
	/**
	 * Get the transform property for the current browser
	 * The result is stored in a property of the method for optimisation
	 * @function {private String} getTransformProp
	 * @return {String} La propriete de transformation a utiliser
	 */
	function getTransformProp() {
		if (!getTransformProp.transformProp) {
			getTransformProp.transformProp = "none";
			var el = document.createElement('div');
			var props = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
			for(var i = 0, l = props.length; i < l; i++) {
				if(typeof el.style[props[i]] !== "undefined") {
					getTransformProp.transformProp = props[i];
				}
			}
		}
		return getTransformProp.transformProp;
	}

	/**
	 * Get the transition property for the current browser
	 * The result is stored in a property of the method for optimisation
	 * @function {private String} getTransitionProp
	 * @return {String} La propriete de transformation a utiliser
	 */
	function getTransitionProp() {
		if (!getTransitionProp.transitionProp) {
			getTransitionProp.transitionProp = "none";
			var el = document.createElement('div');
			var props = 'transition WebkitTransition MozTransition OTransition msTransition'.split(' ');
			for(var i = 0, l = props.length; i < l; i++) {
				if(typeof el.style[props[i]] !== "undefined") {
					getTransitionProp.transitionProp = props[i];
				}
			}
		}
		return getTransitionProp.transitionProp;
	}
    /**
     * Init of the menu
     * @function {private void} init
     */
    function init() {
    	that.hide();
    }
    init();

}

module.exports = DrawerMenu;
