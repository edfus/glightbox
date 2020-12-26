
/**
 * Keyboard Navigation
 * Allow navigation using the keyboard
 *
 * @param {object} instance
 */

 import {
     addEvent
 } from '../utils/helpers.js';

export default function keyboardNavigation(instance) {
    if (instance.events.hasOwnProperty('keyboard')) {
        return false;
    }
    instance.events['keyboard'] = addEvent('keydown', {
        onElement: window,
        withCallback: (event, target) => {
            event = event || window.event;
            switch (event.keyCode) {
                case 39: return instance.nextSlide(); // ArrowRight
                case 37: return instance.prevSlide(); // ArrowLeft
                case 27: return instance.close();     // Escape
                case 13: // fall through 
                case 9:  event.preventDefault(); // Enter, Tab
            }
        }
    })
}
