(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GLightbox = factory());
}(this, (function () { 'use strict';

    var uid = Date.now();
    function extend() {
      var extended = {};
      var deep = true;
      var i = 0;
      var length = arguments.length;

      if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
      }

      var merge = obj => {
        for (var prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
              extended[prop] = extend(true, extended[prop], obj[prop]);
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };

      for (; i < length; i++) {
        var obj = arguments[i];
        merge(obj);
      }

      return extended;
    }
    function each(collection, callback) {
      if (isNode(collection) || collection === window || collection === document) {
        collection = [collection];
      }

      if (!isArrayLike(collection) && !isObject(collection)) {
        collection = [collection];
      }

      if (size(collection) == 0) {
        return;
      }

      if (isArrayLike(collection) && !isObject(collection)) {
        var l = collection.length,
            i = 0;

        for (; i < l; i++) {
          if (callback.call(collection[i], collection[i], i, collection) === false) {
            break;
          }
        }
      } else if (isObject(collection)) {
        for (var key in collection) {
          if (has(collection, key)) {
            if (callback.call(collection[key], collection[key], key, collection) === false) {
              break;
            }
          }
        }
      }
    }
    function getNodeEvents(node) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var fn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var cache = node[uid] = node[uid] || [];
      var data = {
        all: cache,
        evt: null,
        found: null
      };

      if (name && fn && size(cache) > 0) {
        each(cache, (cl, i) => {
          if (cl.eventName == name && cl.fn.toString() == fn.toString()) {
            data.found = true;
            data.evt = i;
            return false;
          }
        });
      }

      return data;
    }
    function addEvent(eventName) {
      var {
        onElement,
        withCallback,
        avoidDuplicate = true,
        once = false,
        useCapture = false
      } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var thisArg = arguments.length > 2 ? arguments[2] : undefined;
      var element = onElement || [];

      if (isString(element)) {
        element = document.querySelectorAll(element);
      }

      function handler(event) {
        if (isFunction(withCallback)) {
          withCallback.call(thisArg, event, this);
        }

        if (once) {
          handler.destroy();
        }
      }

      handler.destroy = function () {
        each(element, el => {
          var events = getNodeEvents(el, eventName, handler);

          if (events.found) {
            events.all.splice(events.evt, 1);
          }

          if (el.removeEventListener) {
            el.removeEventListener(eventName, handler, useCapture);
          }
        });
      };

      each(element, el => {
        var events = getNodeEvents(el, eventName, handler);

        if (el.addEventListener && avoidDuplicate && !events.found || !avoidDuplicate) {
          el.addEventListener(eventName, handler, useCapture);
          events.all.push({
            eventName: eventName,
            fn: handler
          });
        }
      });
      return handler;
    }
    function addClass(node, name) {
      each(name.split(' '), cl => node.classList.add(cl));
    }
    function removeClass(node, name) {
      each(name.split(' '), cl => node.classList.remove(cl));
    }
    function hasClass(node, name) {
      return node.classList.contains(name);
    }
    function closest(elem, selector) {
      while (elem !== document.body) {
        elem = elem.parentElement;

        if (!elem) {
          return false;
        }

        var matches = typeof elem.matches == 'function' ? elem.matches(selector) : elem.msMatchesSelector(selector);

        if (matches) {
          return elem;
        }
      }
    }
    function animateElement(element) {
      var animation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (!element || animation === '') {
        return false;
      }

      if (animation == 'none') {
        if (isFunction(callback)) {
          callback();
        }

        return false;
      }

      var animationEnd = whichAnimationEvent();
      var animationNames = animation.split(' ');
      each(animationNames, name => {
        addClass(element, 'g' + name);
      });
      addEvent(animationEnd, {
        onElement: element,
        avoidDuplicate: false,
        once: true,
        withCallback: (event, target) => {
          each(animationNames, name => {
            removeClass(target, 'g' + name);
          });

          if (isFunction(callback)) {
            callback();
          }
        }
      });
    }
    function cssTransform(node) {
      var translate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (translate == '') {
        node.style.webkitTransform = '';
        node.style.MozTransform = '';
        node.style.msTransform = '';
        node.style.OTransform = '';
        node.style.transform = '';
        return false;
      }

      node.style.webkitTransform = translate;
      node.style.MozTransform = translate;
      node.style.msTransform = translate;
      node.style.OTransform = translate;
      node.style.transform = translate;
    }
    function show(element) {
      element.style.display = 'block';
    }
    function hide(element) {
      element.style.display = 'none';
    }
    function createHTML(htmlStr) {
      var frag = document.createDocumentFragment(),
          temp = document.createElement('div');
      temp.innerHTML = htmlStr;

      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }

      return frag;
    }
    function windowSize() {
      return {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      };
    }
    function whichAnimationEvent() {
      var t,
          el = document.createElement('fakeelement');
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'animationend',
        WebkitAnimation: 'webkitAnimationEnd'
      };

      for (t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    }
    function whichTransitionEvent() {
      var t,
          el = document.createElement('fakeelement');
      var transitions = {
        transition: 'transitionend',
        OTransition: 'oTransitionEnd',
        MozTransition: 'transitionend',
        WebkitTransition: 'webkitTransitionEnd'
      };

      for (t in transitions) {
        if (el.style[t] !== undefined) {
          return transitions[t];
        }
      }
    }
    function isMobile() {
      return 'navigator' in window && window.navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i);
    }
    function isTouch() {
      return isMobile() !== null || document.createTouch !== undefined || 'ontouchstart' in window || 'onmsgesturechange' in window || navigator.msMaxTouchPoints;
    }
    function isFunction(f) {
      return typeof f === 'function';
    }
    function isString(s) {
      return typeof s === 'string';
    }
    function isNode(el) {
      return !!(el && el.nodeType && el.nodeType == 1);
    }
    function isArray(ar) {
      return Array.isArray(ar);
    }
    function isArrayLike(ar) {
      return ar && ar.length && isFinite(ar.length);
    }
    function isObject(o) {
      var type = typeof o;
      return type === 'object' && o != null && !isFunction(o) && !isArray(o);
    }
    function isNil(o) {
      return o == null;
    }
    function has(obj, key) {
      return obj !== null && hasOwnProperty.call(obj, key);
    }
    function size(o) {
      if (isObject(o)) {
        if (o.keys) {
          return o.keys().length;
        }

        var l = 0;

        for (var k in o) {
          if (has(o, k)) {
            l++;
          }
        }

        return l;
      } else {
        return o.length;
      }
    }
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function keyboardNavigation(instance) {
      if (instance.events.hasOwnProperty('keyboard')) {
        return false;
      }

      instance.events['keyboard'] = addEvent('keydown', {
        onElement: window,
        withCallback: (event, target) => {
          event = event || window.event;

          switch (event.keyCode) {
            case 39:
              return instance.nextSlide();

            case 37:
              return instance.prevSlide();

            case 27:
              return instance.close();

            case 13:
            case 9:
              event.preventDefault();
          }
        }
      });
    }

    function getLen(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    function dot(v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
    }

    function getAngle(v1, v2) {
      var mr = getLen(v1) * getLen(v2);
      if (mr === 0) return 0;
      var r = dot(v1, v2) / mr;
      if (r > 1) r = 1;
      return Math.acos(r);
    }

    function cross(v1, v2) {
      return v1.x * v2.y - v2.x * v1.y;
    }

    function getRotateAngle(v1, v2) {
      var angle = getAngle(v1, v2);

      if (cross(v1, v2) > 0) {
        angle *= -1;
      }

      return angle * 180 / Math.PI;
    }

    class EventsHandlerAdmin {
      constructor(el) {
        this.handlers = [];
        this.el = el;
      }

      add(handler) {
        this.handlers.push(handler);
      }

      del(handler) {
        if (!handler) this.handlers = [];

        for (var i = this.handlers.length; i >= 0; i--) {
          if (this.handlers[i] === handler) {
            this.handlers.splice(i, 1);
          }
        }
      }

      dispatch() {
        for (var i = 0, len = this.handlers.length; i < len; i++) {
          var handler = this.handlers[i];
          if (typeof handler === 'function') handler.apply(this.el, arguments);
        }
      }

    }

    function wrapFunc(el, handler) {
      var EventshandlerAdmin = new EventsHandlerAdmin(el);
      EventshandlerAdmin.add(handler);
      return EventshandlerAdmin;
    }

    class TouchEvents {
      constructor(el, option) {
        this.element = typeof el == 'string' ? document.querySelector(el) : el;
        this.start = this.start.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        this.cancel = this.cancel.bind(this);
        this.element.addEventListener("touchstart", this.start, false);
        this.element.addEventListener("touchmove", this.move, false);
        this.element.addEventListener("touchend", this.end, false);
        this.element.addEventListener("touchcancel", this.cancel, false);
        this.preV = {
          x: null,
          y: null
        };
        this.pinchStartLen = null;
        this.zoom = 1;
        this.isDoubleTap = false;

        var noop = function noop() {};

        this.rotate = wrapFunc(this.element, option.rotate || noop);
        this.touchStart = wrapFunc(this.element, option.touchStart || noop);
        this.multipointStart = wrapFunc(this.element, option.multipointStart || noop);
        this.multipointEnd = wrapFunc(this.element, option.multipointEnd || noop);
        this.pinch = wrapFunc(this.element, option.pinch || noop);
        this.swipe = wrapFunc(this.element, option.swipe || noop);
        this.tap = wrapFunc(this.element, option.tap || noop);
        this.doubleTap = wrapFunc(this.element, option.doubleTap || noop);
        this.longTap = wrapFunc(this.element, option.longTap || noop);
        this.singleTap = wrapFunc(this.element, option.singleTap || noop);
        this.pressMove = wrapFunc(this.element, option.pressMove || noop);
        this.twoFingerPressMove = wrapFunc(this.element, option.twoFingerPressMove || noop);
        this.touchMove = wrapFunc(this.element, option.touchMove || noop);
        this.touchEnd = wrapFunc(this.element, option.touchEnd || noop);
        this.touchCancel = wrapFunc(this.element, option.touchCancel || noop);
        this._cancelAllHandler = this.cancelAll.bind(this);
        window.addEventListener('scroll', this._cancelAllHandler);
        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = {
          x: null,
          y: null
        };
      }

      start(evt) {
        if (!evt.touches) return;
        this.now = Date.now();
        this.x1 = evt.touches[0].pageX;
        this.y1 = evt.touches[0].pageY;
        this.delta = this.now - (this.last || this.now);
        this.touchStart.dispatch(evt, this.element);

        if (this.preTapPosition.x !== null) {
          this.isDoubleTap = this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30;
          if (this.isDoubleTap) clearTimeout(this.singleTapTimeout);
        }

        this.preTapPosition.x = this.x1;
        this.preTapPosition.y = this.y1;
        this.last = this.now;
        var preV = this.preV,
            len = evt.touches.length;

        if (len > 1) {
          this._cancelLongTap();

          this._cancelSingleTap();

          var v = {
            x: evt.touches[1].pageX - this.x1,
            y: evt.touches[1].pageY - this.y1
          };
          preV.x = v.x;
          preV.y = v.y;
          this.pinchStartLen = getLen(preV);
          this.multipointStart.dispatch(evt, this.element);
        }

        this._preventTap = false;
        this.longTapTimeout = setTimeout(function () {
          this.longTap.dispatch(evt, this.element);
          this._preventTap = true;
        }.bind(this), 750);
      }

      move(evt) {
        if (!evt.touches) return;
        var preV = this.preV,
            len = evt.touches.length,
            currentX = evt.touches[0].pageX,
            currentY = evt.touches[0].pageY;
        this.isDoubleTap = false;

        if (len > 1) {
          var sCurrentX = evt.touches[1].pageX,
              sCurrentY = evt.touches[1].pageY;
          var v = {
            x: evt.touches[1].pageX - currentX,
            y: evt.touches[1].pageY - currentY
          };

          if (preV.x !== null) {
            if (this.pinchStartLen > 0) {
              evt.zoom = getLen(v) / this.pinchStartLen;
              this.pinch.dispatch(evt, this.element);
            }

            evt.angle = getRotateAngle(v, preV);
            this.rotate.dispatch(evt, this.element);
          }

          preV.x = v.x;
          preV.y = v.y;

          if (this.x2 !== null && this.sx2 !== null) {
            evt.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
            evt.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
          } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
          }

          this.twoFingerPressMove.dispatch(evt, this.element);
          this.sx2 = sCurrentX;
          this.sy2 = sCurrentY;
        } else {
          if (this.x2 !== null) {
            evt.deltaX = currentX - this.x2;
            evt.deltaY = currentY - this.y2;
            var movedX = Math.abs(this.x1 - this.x2),
                movedY = Math.abs(this.y1 - this.y2);

            if (movedX > 10 || movedY > 10) {
              this._preventTap = true;
            }
          } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
          }

          this.pressMove.dispatch(evt, this.element);
        }

        this.touchMove.dispatch(evt, this.element);

        this._cancelLongTap();

        this.x2 = currentX;
        this.y2 = currentY;

        if (len > 1) {
          evt.preventDefault();
        }
      }

      end(evt) {
        if (!evt.changedTouches) return;

        this._cancelLongTap();

        var self = this;

        if (evt.touches.length < 2) {
          this.multipointEnd.dispatch(evt, this.element);
          this.sx2 = this.sy2 = null;
        }

        if (this.x2 && Math.abs(this.x1 - this.x2) > 30 || this.y2 && Math.abs(this.y1 - this.y2) > 30) {
          evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
          this.swipeTimeout = setTimeout(function () {
            self.swipe.dispatch(evt, self.element);
          }, 0);
        } else {
          this.tapTimeout = setTimeout(function () {
            if (!self._preventTap) {
              self.tap.dispatch(evt, self.element);
            }

            if (self.isDoubleTap) {
              self.doubleTap.dispatch(evt, self.element);
              self.isDoubleTap = false;
            }
          }, 0);

          if (!self.isDoubleTap) {
            self.singleTapTimeout = setTimeout(function () {
              self.singleTap.dispatch(evt, self.element);
            }, 250);
          }
        }

        this.touchEnd.dispatch(evt, this.element);
        this.preV.x = 0;
        this.preV.y = 0;
        this.zoom = 1;
        this.pinchStartLen = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
      }

      cancelAll() {
        this._preventTap = true;
        clearTimeout(this.singleTapTimeout);
        clearTimeout(this.tapTimeout);
        clearTimeout(this.longTapTimeout);
        clearTimeout(this.swipeTimeout);
      }

      cancel(evt) {
        this.cancelAll();
        this.touchCancel.dispatch(evt, this.element);
      }

      _cancelLongTap() {
        clearTimeout(this.longTapTimeout);
      }

      _cancelSingleTap() {
        clearTimeout(this.singleTapTimeout);
      }

      _swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? 'Left' : 'Right' : y1 - y2 > 0 ? 'Up' : 'Down';
      }

      on(evt, handler) {
        if (this[evt]) {
          this[evt].add(handler);
        }
      }

      off(evt, handler) {
        if (this[evt]) {
          this[evt].del(handler);
        }
      }

      destroy() {
        if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
        if (this.tapTimeout) clearTimeout(this.tapTimeout);
        if (this.longTapTimeout) clearTimeout(this.longTapTimeout);
        if (this.swipeTimeout) clearTimeout(this.swipeTimeout);
        this.element.removeEventListener("touchstart", this.start);
        this.element.removeEventListener("touchmove", this.move);
        this.element.removeEventListener("touchend", this.end);
        this.element.removeEventListener("touchcancel", this.cancel);
        this.rotate.del();
        this.touchStart.del();
        this.multipointStart.del();
        this.multipointEnd.del();
        this.pinch.del();
        this.swipe.del();
        this.tap.del();
        this.doubleTap.del();
        this.longTap.del();
        this.singleTap.del();
        this.pressMove.del();
        this.twoFingerPressMove.del();
        this.touchMove.del();
        this.touchEnd.del();
        this.touchCancel.del();
        this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.rotate = this.touchStart = this.multipointStart = this.multipointEnd = this.pinch = this.swipe = this.tap = this.doubleTap = this.longTap = this.singleTap = this.pressMove = this.touchMove = this.touchEnd = this.touchCancel = this.twoFingerPressMove = null;
        window.removeEventListener('scroll', this._cancelAllHandler);
        return null;
      }

    }

    function resetSlideMove(slide) {
      var transitionEnd = whichTransitionEvent();
      var media = hasClass(slide, 'gslide-media') ? slide : slide.querySelector('.gslide-media');
      var desc = slide.querySelector('.gslide-description');
      addClass(media, 'greset');
      cssTransform(media, "translate3d(0, 0, 0)");
      addEvent(transitionEnd, {
        onElement: media,
        once: true,
        withCallback: () => {
          removeClass(media, 'greset');
        }
      });
      media.style.opacity = '';

      if (desc) {
        desc.style.opacity = '';
      }
    }

    function touchNavigation(instance) {
      if (instance.events.hasOwnProperty('touch')) {
        return false;
      }

      var winSize = windowSize();
      var winWidth = winSize.width;
      var winHeight = winSize.height;
      var process = false;
      var currentSlide = null;
      var media = null;
      var mediaImage = null;
      var doingMove = false;
      var initScale = 1;
      var maxScale = 4.5;
      var currentScale = 1;
      var doingZoom = false;
      var imageZoomed = false;
      var zoomedPosX = null;
      var zoomedPosY = null;
      var lastZoomedPosX = null;
      var lastZoomedPosY = null;
      var hDistance;
      var vDistance;
      var hDistancePercent = 0;
      var vDistancePercent = 0;
      var vSwipe = false;
      var hSwipe = false;
      var startCoords = {};
      var endCoords = {};
      var xDown = 0;
      var yDown = 0;
      var isInlined;
      var sliderWrapper = document.getElementById('glightbox-slider');
      var overlay = document.querySelector('.goverlay');
      var touchInstance = new TouchEvents(sliderWrapper, {
        touchStart: e => {
          if (hasClass(e.targetTouches[0].target, 'ginner-container') || closest(e.targetTouches[0].target, '.gslide-desc')) {
            process = false;
            return false;
          }

          process = true;
          endCoords = e.targetTouches[0];
          startCoords.pageX = e.targetTouches[0].pageX;
          startCoords.pageY = e.targetTouches[0].pageY;
          xDown = e.targetTouches[0].clientX;
          yDown = e.targetTouches[0].clientY;
          currentSlide = instance.activeSlide;
          media = currentSlide.querySelector('.gslide-media');
          isInlined = currentSlide.querySelector('.gslide-inline');
          mediaImage = null;

          if (hasClass(media, 'gslide-image')) {
            mediaImage = media.querySelector('img');
          }

          removeClass(overlay, 'greset');
          if (e.pageX > 20 && e.pageX < window.innerWidth - 20) return;
          e.preventDefault();
        },
        touchMove: e => {
          if (!process) {
            return;
          }

          endCoords = e.targetTouches[0];

          if (doingZoom || imageZoomed) {
            return;
          }

          if (isInlined && isInlined.offsetHeight > winHeight) {
            var moved = startCoords.pageX - endCoords.pageX;

            if (Math.abs(moved) <= 13) {
              return false;
            }
          }

          doingMove = true;
          var xUp = e.targetTouches[0].clientX;
          var yUp = e.targetTouches[0].clientY;
          var xDiff = xDown - xUp;
          var yDiff = yDown - yUp;

          if (Math.abs(xDiff) > Math.abs(yDiff)) {
            vSwipe = false;
            hSwipe = true;
          } else {
            hSwipe = false;
            vSwipe = true;
          }

          hDistance = endCoords.pageX - startCoords.pageX;
          hDistancePercent = hDistance * 100 / winWidth;
          vDistance = endCoords.pageY - startCoords.pageY;
          vDistancePercent = vDistance * 100 / winHeight;
          var opacity;

          if (vSwipe && mediaImage) {
            opacity = 1 - Math.abs(vDistance) / winHeight;
            overlay.style.opacity = opacity;

            if (instance.settings.touchFollowAxis) {
              hDistancePercent = 0;
            }
          }

          if (hSwipe) {
            opacity = 1 - Math.abs(hDistance) / winWidth;
            media.style.opacity = opacity;

            if (instance.settings.touchFollowAxis) {
              vDistancePercent = 0;
            }
          }

          if (!mediaImage) {
            return cssTransform(media, "translate3d(".concat(hDistancePercent, "%, 0, 0)"));
          }

          cssTransform(media, "translate3d(".concat(hDistancePercent, "%, ").concat(vDistancePercent, "%, 0)"));
        },
        touchEnd: () => {
          if (!process) {
            return;
          }

          doingMove = false;

          if (imageZoomed || doingZoom) {
            lastZoomedPosX = zoomedPosX;
            lastZoomedPosY = zoomedPosY;
            return;
          }

          var v = Math.abs(parseInt(vDistancePercent));
          var h = Math.abs(parseInt(hDistancePercent));

          if (v > 29 && mediaImage) {
            instance.close();
            return;
          }

          if (v < 29 && h < 25) {
            addClass(overlay, 'greset');
            overlay.style.opacity = 1;
            return resetSlideMove(media);
          }
        },
        multipointEnd: () => {
          setTimeout(() => {
            doingZoom = false;
          }, 50);
        },
        multipointStart: () => {
          doingZoom = true;
          initScale = currentScale ? currentScale : 1;
        },
        pinch: evt => {
          if (!mediaImage || doingMove) {
            return false;
          }

          doingZoom = true;
          mediaImage.scaleX = mediaImage.scaleY = initScale * evt.zoom;
          var scale = initScale * evt.zoom;
          imageZoomed = true;

          if (scale <= 1) {
            imageZoomed = false;
            scale = 1;
            lastZoomedPosY = null;
            lastZoomedPosX = null;
            zoomedPosX = null;
            zoomedPosY = null;
            mediaImage.setAttribute('style', '');
            return;
          }

          if (scale > maxScale) {
            scale = maxScale;
          }

          mediaImage.style.transform = "scale3d(".concat(scale, ", ").concat(scale, ", 1)");
          currentScale = scale;
        },
        pressMove: e => {
          if (imageZoomed && !doingZoom) {
            var mhDistance = endCoords.pageX - startCoords.pageX;
            var mvDistance = endCoords.pageY - startCoords.pageY;

            if (lastZoomedPosX) {
              mhDistance = mhDistance + lastZoomedPosX;
            }

            if (lastZoomedPosY) {
              mvDistance = mvDistance + lastZoomedPosY;
            }

            zoomedPosX = mhDistance;
            zoomedPosY = mvDistance;
            var style = "translate3d(".concat(mhDistance, "px, ").concat(mvDistance, "px, 0)");

            if (currentScale) {
              style += " scale3d(".concat(currentScale, ", ").concat(currentScale, ", 1)");
            }

            cssTransform(mediaImage, style);
          }
        },
        swipe: evt => {
          if (imageZoomed) {
            return;
          }

          if (doingZoom) {
            doingZoom = false;
            return;
          }

          if (evt.direction == 'Left') {
            if (instance.index == instance.elements.length - 1) {
              return resetSlideMove(media);
            }

            instance.nextSlide();
          }

          if (evt.direction == 'Right') {
            if (instance.index == 0) {
              return resetSlideMove(media);
            }

            instance.prevSlide();
          }
        }
      });
      instance.events['touch'] = touchInstance;
    }

    class ZoomImages {
      constructor(el, slide) {
        var onclose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        this.img = el;
        this.slide = slide;
        this.onclose = onclose;

        if (this.img.setZoomEvents) {
          return false;
        }

        this.active = false;
        this.zoomedIn = false;
        this.dragging = false;
        this.currentX = null;
        this.currentY = null;
        this.initialX = null;
        this.initialY = null;
        this.xOffset = 0;
        this.yOffset = 0;
        this.img.addEventListener('mousedown', e => this.dragStart(e), false);
        this.img.addEventListener('mouseup', e => this.dragEnd(e), false);
        this.img.addEventListener('mousemove', e => this.drag(e), false);
        this.img.addEventListener('click', e => {
          if (this.slide.classList.contains('dragging-nav')) {
            this.zoomOut();
            return false;
          }

          if (!this.zoomedIn) {
            return this.zoomIn();
          }

          if (this.zoomedIn && !this.dragging) {
            this.zoomOut();
          }
        }, false);
        this.img.setZoomEvents = true;
      }

      zoomIn() {
        var winWidth = this.widowWidth();

        if (this.zoomedIn || winWidth <= 768) {
          return;
        }

        var img = this.img;
        img.setAttribute('data-style', img.getAttribute('style'));
        img.style.maxWidth = img.naturalWidth + 'px';
        img.style.maxHeight = img.naturalHeight + 'px';

        if (img.naturalWidth > winWidth) {
          var centerX = winWidth / 2 - img.naturalWidth / 2;
          this.setTranslate(this.img.parentNode, centerX, 0);
        }

        this.slide.classList.add('zoomed');
        this.zoomedIn = true;
      }

      zoomOut() {
        this.img.parentNode.setAttribute('style', '');
        this.img.setAttribute('style', this.img.getAttribute('data-style'));
        this.slide.classList.remove('zoomed');
        this.zoomedIn = false;
        this.currentX = null;
        this.currentY = null;
        this.initialX = null;
        this.initialY = null;
        this.xOffset = 0;
        this.yOffset = 0;

        if (this.onclose && typeof this.onclose == 'function') {
          this.onclose();
        }
      }

      dragStart(e) {
        e.preventDefault();

        if (!this.zoomedIn) {
          this.active = false;
          return;
        }

        if (e.type === "touchstart") {
          this.initialX = e.touches[0].clientX - this.xOffset;
          this.initialY = e.touches[0].clientY - this.yOffset;
        } else {
          this.initialX = e.clientX - this.xOffset;
          this.initialY = e.clientY - this.yOffset;
        }

        if (e.target === this.img) {
          this.active = true;
          this.img.classList.add('dragging');
        }
      }

      dragEnd(e) {
        e.preventDefault();
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        this.active = false;
        setTimeout(() => {
          this.dragging = false;
          this.img.isDragging = false;
          this.img.classList.remove('dragging');
        }, 100);
      }

      drag(e) {
        if (this.active) {
          e.preventDefault();

          if (e.type === 'touchmove') {
            this.currentX = e.touches[0].clientX - this.initialX;
            this.currentY = e.touches[0].clientY - this.initialY;
          } else {
            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;
          }

          this.xOffset = this.currentX;
          this.yOffset = this.currentY;
          this.img.isDragging = true;
          this.dragging = true;
          this.setTranslate(this.img, this.currentX, this.currentY);
        }
      }

      onMove(e) {
        if (!this.zoomedIn) {
          return;
        }

        var xOffset = e.clientX - this.img.naturalWidth / 2;
        var yOffset = e.clientY - this.img.naturalHeight / 2;
        this.setTranslate(this.img, xOffset, yOffset);
      }

      setTranslate(node, xPos, yPos) {
        node.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
      }

      widowWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      }

    }

    function slideImage(slide, data, callback) {
      var slideMedia = slide.querySelector('.gslide-media');
      var slideTitle = slide.querySelector('.gslide-title');
      var img = new Image();
      var titleID = 'gSlideTitle_' + data.index;
      var textID = 'gSlideDesc_' + data.index;
      img.addEventListener('load', () => {
        if (isFunction(callback)) {
          callback();
        }
      }, false);
      img.src = data.href;
      img.alt = '';
      img.addEventListener('error', function () {
        if (!img.errored) {
          img.errored = true;

          if (/(\.webp)$/.test(img.src)) {
            img.src = img.src.substring(0, img.src.length - 5);
          } else {
            img.src = img.src.concat('.webp');
          }
        } else {
          img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAENJREFUeF7tzbEJACEQRNGBLeAasBCza2lLEGx0CxFGG9hBMDDxRy/72O9FMnIFapGylsu1fgoBdkXfUHLrQgdfrlJN1BdYBjQQm3UAAAAASUVORK5CYII=';
          img.alt = '404 Not Found';
          img.classList.add('error');
          slideTitle.innerHTML = '<div style="min-width: 52px;text-align: center;">ERROR</div>';
        }
      }, false);

      if (data.title !== '') {
        img.setAttribute('aria-labelledby', titleID);
      }

      if (data.description !== '') {
        img.setAttribute('aria-describedby', textID);
      }

      slideMedia.insertBefore(img, slideMedia.firstChild);
      return;
    }

    class SlideConfigParser {
      constructor() {
        var slideParamas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.defaults = {
          href: '',
          title: '',
          type: '',
          description: '',
          descPosition: 'bottom',
          effect: '',
          width: '',
          height: '',
          content: false,
          zoomable: true,
          draggable: true
        };

        if (isObject(slideParamas)) {
          this.defaults = extend(this.defaults, slideParamas);
        }
      }

      sourceType(url) {
        return 'image';
      }

      parseConfig(element, settings) {
        var data = extend({
          descPosition: settings.descPosition
        }, this.defaults);

        if (isObject(element) && !isNode(element)) {
          if (!has(element, 'type')) {
            element.type = this.sourceType(element.href);
          }

          var objectData = extend(data, element);
          this.setSize(objectData, settings);
          return objectData;
        }

        var url = '';
        var config = element.getAttribute('data-glightbox');
        var nodeType = element.nodeName.toLowerCase();

        if (nodeType === 'a') {
          url = element.href;
        }

        data.href = url;
        each(data, (val, key) => {
          if (has(settings, key) && key !== 'width') {
            data[key] = settings[key];
          }

          var nodeData = element.dataset[key];

          if (!isNil(nodeData)) {
            data[key] = this.sanitizeValue(nodeData);
          }
        });

        if (!data.type && url) {
          data.type = this.sourceType(url);
        }

        if (!isNil(config)) {
          var cleanKeys = [];
          each(data, (v, k) => {
            cleanKeys.push(';\\s?' + k);
          });
          cleanKeys = cleanKeys.join('\\s?:|');

          if (config.trim() !== '') {
            each(data, (val, key) => {
              var str = config;
              var match = '\s?' + key + '\s?:\s?(.*?)(' + cleanKeys + '\s?:|$)';
              var regex = new RegExp(match);
              var matches = str.match(regex);

              if (matches && matches.length && matches[1]) {
                var value = matches[1].trim().replace(/;\s*$/, '');
                data[key] = this.sanitizeValue(value);
              }
            });
          }
        } else {
          if (!data.title && nodeType == 'a') {
            var title = element.title;

            if (!isNil(title) && title !== '') {
              data.title = title;
            }
          }
        }

        if (data.description && data.description.substring(0, 1) == '.' && document.querySelector(data.description)) {
          data.description = document.querySelector(data.description).innerHTML;
        } else {
          var nodeDesc = element.querySelector('.glightbox-desc');

          if (nodeDesc) {
            data.description = nodeDesc.innerHTML;
          }
        }

        this.setSize(data, settings);
        this.slideConfig = data;
        return data;
      }

      setSize(data, settings) {
        var defaultWith = this.checkSize(settings.width);
        var defaultHeight = this.checkSize(settings.height);
        data.width = has(data, 'width') && data.width !== '' ? this.checkSize(data.width) : defaultWith;
        data.height = has(data, 'height') && data.height !== '' ? this.checkSize(data.height) : defaultHeight;
        return data;
      }

      checkSize(size) {
        return isNumber(size) ? "".concat(size, "px") : size;
      }

      sanitizeValue(val) {
        if (val !== 'true' && val !== 'false') {
          return val;
        }

        return val === 'true';
      }

    }

    class Slide {
      constructor(el, instance) {
        this.element = el;
        this.instance = instance;
      }

      setContent() {
        var slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (hasClass(slide, 'loaded')) {
          return false;
        }

        var settings = this.instance.settings;
        var slideConfig = this.slideConfig;
        var isMobileDevice = isMobile();

        if (isFunction(settings.beforeSlideLoad)) {
          settings.beforeSlideLoad({
            index: slideConfig.index,
            slide: slide,
            player: false
          });
        }

        var type = slideConfig.type;
        var position = slideConfig.descPosition;
        var slideMedia = slide.querySelector('.gslide-media');
        var slideTitle = slide.querySelector('.gslide-title');
        var slideText = slide.querySelector('.gslide-desc');
        var slideDesc = slide.querySelector('.gdesc-inner');
        var finalCallback = callback;
        var titleID = 'gSlideTitle_' + slideConfig.index;
        var textID = 'gSlideDesc_' + slideConfig.index;

        if (isFunction(settings.afterSlideLoad)) {
          finalCallback = () => {
            if (isFunction(callback)) {
              callback();
            }

            settings.afterSlideLoad({
              index: slideConfig.index,
              slide: slide,
              player: this.instance.getSlidePlayerInstance(slideConfig.index)
            });
          };
        }

        if (slideConfig.title == '' && slideConfig.description == '') {
          if (slideDesc) {
            slideDesc.parentNode.parentNode.removeChild(slideDesc.parentNode);
          }
        } else {
          if (slideTitle && slideConfig.title !== '') {
            slideTitle.id = titleID;
            slideTitle.innerHTML = slideConfig.title;
          } else {
            slideTitle.parentNode.removeChild(slideTitle);
          }

          if (slideText && slideConfig.description !== '') {
            slideText.id = textID;

            if (isMobileDevice && settings.moreLength > 0) {
              slideConfig.smallDescription = this.slideShortDesc(slideConfig.description, settings.moreLength, settings.moreText);
              slideText.innerHTML = slideConfig.smallDescription;
              this.descriptionEvents(slideText, slideConfig);
            } else {
              slideText.innerHTML = slideConfig.description;
            }
          } else {
            slideText.parentNode.removeChild(slideText);

            if (slideTitle) {
              slideTitle.classList.add('without-desc');
              slideTitle.parentNode.classList.add('without-desc');
              slideTitle.parentNode.parentNode.classList.add('without-desc');
            }
          }

          addClass(slideMedia.parentNode, "desc-".concat(position));
          addClass(slideDesc.parentNode, "description-".concat(position));
        }

        addClass(slideMedia, "gslide-".concat(type));
        addClass(slide, 'loaded');
        return slideImage(slide, slideConfig, () => {
          var img = slide.querySelector('img');

          if (slideConfig.zoomable && img.naturalWidth > img.offsetWidth) {
            addClass(img, 'zoomable');
            new ZoomImages(img, slide, () => {
              this.instance.resize();
            });
          }

          if (isFunction(finalCallback)) {
            finalCallback();
          }
        });
      }

      slideShortDesc(string) {
        var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
        var wordBoundary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var useWordBoundary = wordBoundary;
        string = string.trim();

        if (string.length <= n) {
          return string;
        }

        var subString = string.substr(0, n - 1);

        if (!useWordBoundary) {
          return subString;
        }

        return subString + '... <a href="#" class="desc-more">' + wordBoundary + '</a>';
      }

      descriptionEvents(desc, data) {
        var moreLink = desc.querySelector('.desc-more');

        if (!moreLink) {
          return false;
        }

        addEvent('click', {
          onElement: moreLink,
          withCallback: (event, target) => {
            event.preventDefault();
            var body = document.body;
            var desc = closest(target, '.gslide-desc');

            if (!desc) {
              return false;
            }

            desc.innerHTML = data.description;
            addClass(body, 'gdesc-open');
            var shortEvent = addEvent('click', {
              onElement: [body, closest(desc, '.gslide-description')],
              withCallback: (event, target) => {
                if (event.target.nodeName.toLowerCase() !== 'a') {
                  removeClass(body, 'gdesc-open');
                  addClass(body, 'gdesc-closed');
                  desc.innerHTML = data.smallDescription;
                  this.descriptionEvents(desc, data);
                  setTimeout(() => {
                    removeClass(body, 'gdesc-closed');
                  }, 400);
                  shortEvent.destroy();
                }
              }
            });
          }
        });
      }

      create() {
        return createHTML(this.instance.settings.slideHTML);
      }

      getConfig() {
        var parser = new SlideConfigParser(this.instance.settings.slideExtraAttributes);
        this.slideConfig = parser.parseConfig(this.element, this.instance.settings);
        return this.slideConfig;
      }

    }

    var version = '3.1.4';

    var isMobile$1 = isMobile();

    var isTouch$1 = isTouch();

    var html = document.getElementsByTagName('html')[0];
    var defaults = {
      selector: '.glightbox',
      elements: null,
      skin: 'clean',
      closeButton: true,
      startAt: null,
      descPosition: 'bottom',
      width: '900px',
      height: '506px',
      beforeSlideChange: null,
      afterSlideChange: null,
      beforeSlideLoad: null,
      afterSlideLoad: null,
      slideInserted: null,
      slideRemoved: null,
      slideExtraAttributes: null,
      onOpen: null,
      onClose: null,
      loop: false,
      zoomable: true,
      draggable: false,
      dragAutoSnap: false,
      dragToleranceX: 40,
      dragToleranceY: 65,
      preload: true,
      oneSlidePerOpen: false,
      touchNavigation: true,
      touchFollowAxis: true,
      keyboardNavigation: true,
      closeOnOutsideClick: true,
      openEffect: 'zoom',
      closeEffect: 'zoom',
      slideEffect: 'slide',
      moreText: 'See more',
      moreLength: 60,
      cssEfects: {
        fade: {
          in: 'fadeIn',
          out: 'fadeOut'
        },
        zoom: {
          in: 'zoomIn',
          out: 'zoomOut'
        },
        slide: {
          in: 'slideInRight',
          out: 'slideOutLeft'
        },
        slideBack: {
          in: 'slideInLeft',
          out: 'slideOutRight'
        },
        none: {
          in: 'none',
          out: 'none'
        }
      },
      svg: {
        close: '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><g><path d="M505.943,6.058c-8.077-8.077-21.172-8.077-29.249,0L6.058,476.693c-8.077,8.077-8.077,21.172,0,29.249C10.096,509.982,15.39,512,20.683,512c5.293,0,10.586-2.019,14.625-6.059L505.943,35.306C514.019,27.23,514.019,14.135,505.943,6.058z"/></g></g><g><g><path d="M505.942,476.694L35.306,6.059c-8.076-8.077-21.172-8.077-29.248,0c-8.077,8.076-8.077,21.171,0,29.248l470.636,470.636c4.038,4.039,9.332,6.058,14.625,6.058c5.293,0,10.587-2.019,14.624-6.057C514.018,497.866,514.018,484.771,505.942,476.694z"/></g></g></svg>',
        next: '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"> <g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g></svg>',
        prev: '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"><g><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"/></g></svg>'
      }
    };
    defaults.slideHTML = "<section class=\"gslide\">\n        <div class=\"gslide-inner-content\">\n            <figure class=\"ginner-container\">\n                <div class=\"gslide-media\">\n                </div>\n                <figcaption class=\"gslide-description\">\n                    <div class=\"gdesc-inner\">\n                        <h4 class=\"gslide-title\"></h4>\n                        <div class=\"gslide-desc\"></div>\n                    </div>\n                </figcaption>\n            </figure>\n        </div>\n    </section>";
    defaults.lightboxHTML = "<aside id=\"glightbox-body\" class=\"glightbox-container\">\n        <div class=\"gloader visible\"></div>\n        <div class=\"goverlay\"></div>\n        <div class=\"gcontainer\">\n            <div id=\"glightbox-slider\" class=\"gslider\"></div>\n            <button class=\"gnext gbtn\" tabindex=\"-1\" aria-label=\"Next\">{nextSVG}</button>\n            <button class=\"gprev gbtn\" tabindex=\"-1\" aria-label=\"Previous\">{prevSVG}</button>\n            <button class=\"gclose gbtn\" tabindex=\"-1\" aria-label=\"Close\">{closeSVG}</button>\n        </div>\n    </aside>";

    class GlightboxInit {
      constructor() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.settings = extend(defaults, options);
        this.effectsClasses = this.getAnimationClasses();
        this.apiEvents = [];
        this.fullElementsList = false;
      }

      init() {
        var selector = this.getSelector();

        if (selector) {
          this.baseEvents = addEvent('click', {
            onElement: selector,
            withCallback: (e, target) => {
              e.preventDefault();
              this.open(target);
            }
          });
        }

        this.elements = this.getElements();
      }

      open() {
        var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (this.elements.length == 0) {
          return false;
        }

        this.activeSlide = null;
        this.prevActiveSlideIndex = null;
        this.prevActiveSlide = null;
        var index = isNumber(startAt) ? startAt : this.settings.startAt;

        if (isNode(element)) {
          var gallery = element.getAttribute('data-gallery');

          if (gallery) {
            this.fullElementsList = this.elements;
            this.elements = this.getGalleryElements(this.elements, gallery);
          }

          if (isNil(index)) {
            index = this.getElementIndex(element);

            if (index < 0) {
              index = 0;
            }
          }
        }

        if (!isNumber(index)) {
          index = 0;
        }

        this.build();

        animateElement(this.overlay, this.settings.openEffect == 'none' ? 'none' : this.settings.cssEfects.fade.in);

        var body = document.body;
        var scrollBar = window.innerWidth - document.documentElement.clientWidth;

        if (scrollBar > 0) {
          var styleSheet = document.createElement('style');
          styleSheet.className = 'gcss-styles';
          styleSheet.innerText = ".gscrollbar-fixer {margin-right: ".concat(scrollBar, "px}");
          document.head.appendChild(styleSheet);

          addClass(html, 'gscrollbar-fixer');
        }

        addClass(body, 'glightbox-open');

        addClass(html, 'glightbox-open');

        if (isMobile$1) {
          addClass(document.body, 'glightbox-mobile');

          this.settings.slideEffect = 'slide';
        }

        this.showSlide(index, true);

        if (this.elements.length == 1) {
          hide(this.prevButton);

          hide(this.nextButton);
        } else {
          show(this.prevButton);

          show(this.nextButton);
        }

        this.lightboxOpen = true;
        this.trigger('open');

        if (isFunction(this.settings.onOpen)) {
          this.settings.onOpen();
        }

        if (isTouch$1 && this.settings.touchNavigation) {
          touchNavigation(this);
        }

        if (this.settings.keyboardNavigation) {
          keyboardNavigation(this);
        }
      }

      openAt() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        this.open(null, index);
      }

      showSlide() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var first = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        show(this.loader);

        this.index = parseInt(index);
        var current = this.slidesContainer.querySelector('.current');

        if (current) {
          removeClass(current, 'current');
        }

        this.slideAnimateOut();
        var slideNode = this.slidesContainer.querySelectorAll('.gslide')[index];

        if (hasClass(slideNode, 'loaded')) {
          this.slideAnimateIn(slideNode, first);

          hide(this.loader);
        } else {
          show(this.loader);

          var slide = this.elements[index];
          var slideData = {
            index: this.index,
            slide: slideNode,
            slideNode: slideNode,
            slideConfig: slide.slideConfig,
            slideIndex: this.index,
            trigger: slide.node,
            player: null
          };
          this.trigger('slide_before_load', slideData);
          slide.instance.setContent(slideNode, () => {
            hide(this.loader);

            this.resize();
            this.slideAnimateIn(slideNode, first);
            this.trigger('slide_after_load', slideData);
          });
        }

        this.slideDescription = slideNode.querySelector('.gslide-description');
        this.slideDescriptionContained = this.slideDescription && hasClass(this.slideDescription.parentNode, 'gslide-media');

        if (this.settings.preload) {
          this.preloadSlide(index + 1);
          this.preloadSlide(index - 1);
        }

        this.updateNavigationClasses();
        this.activeSlide = slideNode;
      }

      preloadSlide(index) {
        if (index < 0 || index > this.elements.length - 1) {
          return false;
        }

        if (isNil(this.elements[index])) {
          return false;
        }

        var slideNode = this.slidesContainer.querySelectorAll('.gslide')[index];

        if (hasClass(slideNode, 'loaded')) {
          return false;
        }

        var slide = this.elements[index];
        var type = slide.type;
        var slideData = {
          index: index,
          slide: slideNode,
          slideNode: slideNode,
          slideConfig: slide.slideConfig,
          slideIndex: index,
          trigger: slide.node
        };
        this.trigger('slide_before_load', slideData);
        slide.instance.setContent(slideNode, () => {
          this.trigger('slide_after_load', slideData);
        });
      }

      prevSlide() {
        this.goToSlide(this.index - 1);
      }

      nextSlide() {
        this.goToSlide(this.index + 1);
      }

      goToSlide() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.prevActiveSlide = this.activeSlide;
        this.prevActiveSlideIndex = this.index;

        if (!this.loop() && (index < 0 || index > this.elements.length - 1)) {
          return false;
        }

        if (index < 0) {
          index = this.elements.length - 1;
        } else if (index >= this.elements.length) {
          index = 0;
        }

        this.showSlide(index);
      }

      insertSlide() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        var slide = new Slide(config, this);
        var data = slide.getConfig();

        var slideInfo = extend({}, data);

        var newSlide = slide.create();
        var totalSlides = this.elements.length - 1;

        if (index < 0) {
          index = this.elements.length;
        }

        slideInfo.index = index;
        slideInfo.node = false;
        slideInfo.instance = slide;
        slideInfo.slideConfig = data;
        this.elements.splice(index, 0, slideInfo);
        var addedSlideNode = null;
        var addedSlidePlayer = null;

        if (this.slidesContainer) {
          if (index > totalSlides) {
            this.slidesContainer.appendChild(newSlide);
          } else {
            var existingSlide = this.slidesContainer.querySelectorAll('.gslide')[index];
            this.slidesContainer.insertBefore(newSlide, existingSlide);
          }

          if (this.settings.preload && this.index == 0 && index == 0 || this.index - 1 == index || this.index + 1 == index) {
            this.preloadSlide(index);
          }

          if (this.index == 0 && index == 0) {
            this.index = 1;
          }

          this.updateNavigationClasses();
          addedSlideNode = this.slidesContainer.querySelectorAll('.gslide')[index];
          addedSlidePlayer = this.getSlidePlayerInstance(index);
          slideInfo.slideNode = addedSlideNode;
        }

        this.trigger('slide_inserted', {
          index: index,
          slide: addedSlideNode,
          slideNode: addedSlideNode,
          slideConfig: data,
          slideIndex: index,
          trigger: null,
          player: addedSlidePlayer
        });

        if (isFunction(this.settings.slideInserted)) {
          this.settings.slideInserted({
            index: index,
            slide: addedSlideNode,
            player: addedSlidePlayer
          });
        }
      }

      removeSlide() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

        if (index < 0 || index > this.elements.length - 1) {
          return false;
        }

        var slide = this.slidesContainer && this.slidesContainer.querySelectorAll('.gslide')[index];

        if (slide) {
          if (this.getActiveSlideIndex() == index) {
            if (index == this.elements.length - 1) {
              this.prevSlide();
            } else {
              this.nextSlide();
            }
          }

          slide.parentNode.removeChild(slide);
        }

        this.elements.splice(index, 1);
        this.trigger('slide_removed', index);

        if (isFunction(this.settings.slideRemoved)) {
          this.settings.slideRemoved(index);
        }
      }

      slideAnimateIn(slide, first) {
        var slideMedia = slide.querySelector('.gslide-media');
        var slideDesc = slide.querySelector('.gslide-description');
        var prevData = {
          index: this.prevActiveSlideIndex,
          slide: this.prevActiveSlide,
          slideNode: this.prevActiveSlide,
          slideIndex: this.prevActiveSlide,
          slideConfig: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].slideConfig,
          trigger: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].node
        };
        var nextData = {
          index: this.index,
          slide: this.activeSlide,
          slideNode: this.activeSlide,
          slideConfig: this.elements[this.index].slideConfig,
          slideIndex: this.index,
          trigger: this.elements[this.index].node
        };

        if (slideMedia.offsetWidth > 0 && slideDesc) {
          hide(slideDesc);

          slideDesc.style.display = '';
        }

        removeClass(slide, this.effectsClasses);

        if (first) {
          animateElement(slide, this.settings.cssEfects[this.settings.openEffect].in, () => {
            this.trigger('slide_changed', {
              prev: prevData,
              current: nextData
            });

            if (isFunction(this.settings.afterSlideChange)) {
              this.settings.afterSlideChange.apply(this, [prevData, nextData]);
            }
          });
        } else {
          var effectName = this.settings.slideEffect;
          var animIn = effectName !== 'none' ? this.settings.cssEfects[effectName].in : effectName;

          if (this.prevActiveSlideIndex > this.index) {
            if (this.settings.slideEffect == 'slide') {
              animIn = this.settings.cssEfects.slideBack.in;
            }
          }

          animateElement(slide, animIn, () => {
            this.trigger('slide_changed', {
              prev: prevData,
              current: nextData
            });

            if (isFunction(this.settings.afterSlideChange)) {
              this.settings.afterSlideChange.apply(this, [prevData, nextData]);
            }
          });
        }

        setTimeout(() => {
          this.resize(slide);
        }, 100);

        addClass(slide, 'current');
      }

      slideAnimateOut() {
        if (!this.prevActiveSlide) {
          return false;
        }

        var prevSlide = this.prevActiveSlide;

        removeClass(prevSlide, this.effectsClasses);

        addClass(prevSlide, 'prev');

        var animation = this.settings.slideEffect;
        var animOut = animation !== 'none' ? this.settings.cssEfects[animation].out : animation;
        this.trigger('slide_before_change', {
          prev: {
            index: this.prevActiveSlideIndex,
            slide: this.prevActiveSlide,
            slideNode: this.prevActiveSlide,
            slideIndex: this.prevActiveSlideIndex,
            slideConfig: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].slideConfig,
            trigger: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].node
          },
          current: {
            index: this.index,
            slide: this.activeSlide,
            slideNode: this.activeSlide,
            slideIndex: this.index,
            slideConfig: this.elements[this.index].slideConfig,
            trigger: this.elements[this.index].node
          }
        });

        if (isFunction(this.settings.beforeSlideChange)) {
          this.settings.beforeSlideChange.apply(this, [{
            index: this.prevActiveSlideIndex,
            slide: this.prevActiveSlide
          }, {
            index: this.index,
            slide: this.activeSlide
          }]);
        }

        if (this.prevActiveSlideIndex > this.index && this.settings.slideEffect == 'slide') {
          animOut = this.settings.cssEfects.slideBack.out;
        }

        animateElement(prevSlide, animOut, () => {
          var media = prevSlide.querySelector('.gslide-media');
          var desc = prevSlide.querySelector('.gslide-description');
          media.style.transform = '';

          removeClass(media, 'greset');

          media.style.opacity = '';

          if (desc) {
            desc.style.opacity = '';
          }

          removeClass(prevSlide, 'prev');
        });
      }

      setElements(elements) {
        this.settings.elements = false;
        var newElements = [];

        if (elements && elements.length) {
          each(elements, (el, i) => {
            var slide = new Slide(el, this);
            var data = slide.getConfig();

            var slideInfo = extend({}, data);

            slideInfo.slideConfig = data;
            slideInfo.instance = slide;
            slideInfo.index = i;
            newElements.push(slideInfo);
          });
        }

        this.elements = newElements;

        if (this.lightboxOpen) {
          this.slidesContainer.innerHTML = '';

          if (this.elements.length) {
            each(this.elements, () => {
              var slide = createHTML(this.settings.slideHTML);

              this.slidesContainer.appendChild(slide);
            });

            this.showSlide(0, true);
          }
        }
      }

      getElementIndex(node) {
        var index = false;

        each(this.elements, (el, i) => {
          if (has(el, 'node') && el.node == node) {
            index = i;
            return true;
          }
        });

        return index;
      }

      getElements() {
        var list = [];
        this.elements = this.elements ? this.elements : [];

        if (!isNil(this.settings.elements) && isArray(this.settings.elements) && this.settings.elements.length) {
          each(this.settings.elements, (el, i) => {
            var slide = new Slide(el, this);
            var elData = slide.getConfig();

            var slideInfo = extend({}, elData);

            slideInfo.node = false;
            slideInfo.index = i;
            slideInfo.instance = slide;
            slideInfo.slideConfig = elData;
            list.push(slideInfo);
          });
        }

        var nodes = false;
        var selector = this.getSelector();

        if (selector) {
          nodes = document.querySelectorAll(this.getSelector());
        }

        if (!nodes) {
          return list;
        }

        each(nodes, (el, i) => {
          var slide = new Slide(el, this);
          var elData = slide.getConfig();

          var slideInfo = extend({}, elData);

          slideInfo.node = el;
          slideInfo.index = i;
          slideInfo.instance = slide;
          slideInfo.slideConfig = elData;
          slideInfo.gallery = el.getAttribute('data-gallery');
          list.push(slideInfo);
        });

        return list;
      }

      getGalleryElements(list, gallery) {
        return list.filter(el => {
          return el.gallery == gallery;
        });
      }

      getSelector() {
        if (this.settings.elements) {
          return false;
        }

        if (this.settings.selector && this.settings.selector.substring(0, 5) == 'data-') {
          return "*[".concat(this.settings.selector, "]");
        }

        return this.settings.selector;
      }

      getActiveSlide() {
        return this.slidesContainer.querySelectorAll('.gslide')[this.index];
      }

      getActiveSlideIndex() {
        return this.index;
      }

      getAnimationClasses() {
        var effects = [];

        for (var key in this.settings.cssEfects) {
          if (this.settings.cssEfects.hasOwnProperty(key)) {
            var effect = this.settings.cssEfects[key];
            effects.push("g".concat(effect.in));
            effects.push("g".concat(effect.out));
          }
        }

        return effects.join(' ');
      }

      build() {
        if (this.built) {
          return false;
        }

        var nextSVG = has(this.settings.svg, 'next') ? this.settings.svg.next : '';
        var prevSVG = has(this.settings.svg, 'prev') ? this.settings.svg.prev : '';
        var closeSVG = has(this.settings.svg, 'close') ? this.settings.svg.close : '';
        var lightboxHTML = this.settings.lightboxHTML;
        lightboxHTML = lightboxHTML.replace(/{nextSVG}/g, nextSVG);
        lightboxHTML = lightboxHTML.replace(/{prevSVG}/g, prevSVG);
        lightboxHTML = lightboxHTML.replace(/{closeSVG}/g, closeSVG);
        lightboxHTML = createHTML(lightboxHTML);
        document.body.appendChild(lightboxHTML);
        var modal = document.getElementById('glightbox-body');
        this.modal = modal;
        var closeButton = modal.querySelector('.gclose');
        this.prevButton = modal.querySelector('.gprev');
        this.nextButton = modal.querySelector('.gnext');
        this.overlay = modal.querySelector('.goverlay');
        this.loader = modal.querySelector('.gloader');
        this.slidesContainer = document.getElementById('glightbox-slider');
        this.events = {};

        addClass(this.modal, 'glightbox-' + this.settings.skin);

        if (this.settings.closeButton && closeButton) {
          this.events['close'] = addEvent('click', {
            onElement: closeButton,
            withCallback: (e, target) => {
              e.preventDefault();
              this.close();
            }
          });
        }

        if (closeButton && !this.settings.closeButton) {
          closeButton.parentNode.removeChild(closeButton);
        }

        if (this.nextButton) {
          this.events['next'] = addEvent('click', {
            onElement: this.nextButton,
            withCallback: (e, target) => {
              e.preventDefault();
              this.nextSlide();
            }
          });
        }

        if (this.prevButton) {
          this.events['prev'] = addEvent('click', {
            onElement: this.prevButton,
            withCallback: (e, target) => {
              e.preventDefault();
              this.prevSlide();
            }
          });
        }

        if (this.settings.closeOnOutsideClick) {
          this.events['outClose'] = addEvent('click', {
            onElement: modal,
            withCallback: (e, target) => {
              if (!this.preventOutsideClick && !hasClass(document.body, 'glightbox-mobile') && !closest(e.target, '.ginner-container')) {
                if (!closest(e.target, '.gbtn') && !hasClass(e.target, 'gnext') && !hasClass(e.target, 'gprev')) {
                  this.close();
                }
              }
            }
          });
        }

        each(this.elements, (slide, i) => {
          this.slidesContainer.appendChild(slide.instance.create());
          slide.slideNode = this.slidesContainer.querySelectorAll('.gslide')[i];
        });

        if (isTouch$1) {
          addClass(document.body, 'glightbox-touch');
        }

        this.events['resize'] = addEvent('resize', {
          onElement: window,
          withCallback: () => {
            this.resize();
          }
        });
        this.built = true;
      }

      resize() {
        var slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        slide = !slide ? this.activeSlide : slide;

        if (!slide || hasClass(slide, 'zoomed')) {
          return;
        }

        if (windowSize().width <= 768) {
          addClass(document.body, 'glightbox-mobile');
        } else {
          removeClass(document.body, 'glightbox-mobile');
        }

        return;
      }

      reload() {
        this.init();
      }

      updateNavigationClasses() {
        var loop = this.loop();

        removeClass(this.nextButton, 'disabled');

        removeClass(this.prevButton, 'disabled');

        if (this.index == 0 && this.elements.length - 1 == 0) {
          addClass(this.prevButton, 'disabled');

          addClass(this.nextButton, 'disabled');
        } else if (this.index === 0 && !loop) {
          addClass(this.prevButton, 'disabled');
        } else if (this.index === this.elements.length - 1 && !loop) {
          addClass(this.nextButton, 'disabled');
        }
      }

      loop() {
        var loop = has(this.settings, 'loopAtEnd') ? this.settings.loopAtEnd : null;
        loop = has(this.settings, 'loop') ? this.settings.loop : loop;
        return loop;
      }

      close() {
        if (!this.lightboxOpen) {
          if (this.events) {
            for (var key in this.events) {
              if (this.events.hasOwnProperty(key)) {
                this.events[key].destroy();
              }
            }

            this.events = null;
          }

          return false;
        }

        if (this.closing) {
          return false;
        }

        this.closing = true;

        if (this.fullElementsList) {
          this.elements = this.fullElementsList;
        }

        addClass(this.modal, 'glightbox-closing');

        animateElement(this.overlay, this.settings.openEffect == 'none' ? 'none' : this.settings.cssEfects.fade.out);

        animateElement(this.activeSlide, this.settings.cssEfects[this.settings.closeEffect].out, () => {
          this.activeSlide = null;
          this.prevActiveSlideIndex = null;
          this.prevActiveSlide = null;
          this.built = false;

          if (this.events) {
            for (var _key in this.events) {
              if (this.events.hasOwnProperty(_key)) {
                this.events[_key].destroy();
              }
            }

            this.events = null;
          }

          var body = document.body;

          removeClass(html, 'glightbox-open');

          removeClass(body, 'glightbox-open touching gdesc-open glightbox-touch glightbox-mobile gscrollbar-fixer');

          this.modal.parentNode.removeChild(this.modal);
          this.trigger('close');

          if (isFunction(this.settings.onClose)) {
            this.settings.onClose();
          }

          var styles = document.querySelector('.gcss-styles');

          if (styles) {
            styles.parentNode.removeChild(styles);
          }

          this.lightboxOpen = false;
          this.closing = null;
        });
      }

      destroy() {
        this.close();
        this.clearAllEvents();

        if (this.baseEvents) {
          this.baseEvents.destroy();
        }
      }

      on(evt, callback) {
        var once = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (!evt || !isFunction(callback)) {
          throw new TypeError('Event name and callback must be defined');
        }

        this.apiEvents.push({
          evt,
          once,
          callback
        });
      }

      once(evt, callback) {
        this.on(evt, callback, true);
      }

      trigger(eventName) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var onceTriggered = [];

        each(this.apiEvents, (event, i) => {
          var {
            evt,
            once,
            callback
          } = event;

          if (evt == eventName) {
            callback(data);

            if (once) {
              onceTriggered.push(i);
            }
          }
        });

        if (onceTriggered.length) {
          each(onceTriggered, i => this.apiEvents.splice(i, 1));
        }
      }

      clearAllEvents() {
        this.apiEvents.splice(0, this.apiEvents.length);
      }

      version() {
        return version;
      }

    }

    function glightbox (config) {
      var instance = new GlightboxInit(config);
      instance.init();
      return instance;
    }

    return glightbox;

})));
