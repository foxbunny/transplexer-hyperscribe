/**
 * Modify a function so it can only ever be called once
 */
export function once(fn) {
  let called = false;

  return function (...args) {
    if (called) {
      return;
    }
    called = true;
    return fn(...args);
  };
};

/**
 * Add listeners for animation and transition events so that it only fires once
 *
 * Returns a function that removes the event listeners.
 */
export function onTransimationEnd(element, callback) {
  callback = once(callback);

  element.addEventListener('animationend', callback, false);
  element.addEventListener('transitionend', callback, false);

  return function () {
    element.removeEventListener('animationend', callback, false);
    element.removeEventListener('transitionend', callback, false);
  };
};

/**
 * Invoke a callback when animation ends on all specified elements
 *
 * This function is used in situations where we want to start multiple
 * animations of possibly differring lengths on various elements, and then
 * invoke a single callback when animation finishes on all those elements.
 *
 * The first argument should be an array of DOM elements. The second argument
 * is a callback function. It is invoked without any arguments.
 */
export function onMultiAnimationEnd(elements, callback) {
  let animationCount = elements.length;

  callback = once(callback);

  function animationCallback(e) {
    animationCount--;

    e.target.removeTransimationListener();

    if (animationCount <= 0) {
      callback();
    }
  };

  elements.forEach(function (element) {
    element.removeTransimationListener = onTransimationEnd(
      element,
      animationCallback,
    );
  });
};
