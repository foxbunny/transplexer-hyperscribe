import createPipe from 'transplexer';
import {addProps} from 'hyperscribe';
import {editList} from './editList';
import {onTransimationEnd} from './util';

/**
 * Assign a value at a given path inside an object
 *
 * The path is given as an array of key names, where the last key points to the
 * value, and intermediate keys point to nested objects.
 *
 * For example:
 *
 *     const obj = {};
 *     assignPath(obj, ['foo', 'bar', 'baz'], 1);
 *     // obj is now `{foo: {bar: {baz: 1}}}`
 */
function assignPath(obj, path, val) {
  if (path.length === 0) {
    return val;
  }
  const [head, ...rest] = path;
  obj[head] = assignPath(obj, rest, val);
  return obj;
}

/**
 * Create a hook that binds a callback to an element using a pipe
 */
export function bind(pipe, fn) {
  return function (el) {
    pipe.connect(function (value) {
      fn(value, el);
    });
  };
};

/**
 * Create a hook that toggles a single class using a pipe
 */
export function toggleClass(pipe, className) {
  return bind(pipe, function (flag, el) {
    if (flag) {
      el.classList.add(className);
    }
    else {
      el.classList.remove(className);
    }
  });
};

/**
 * Create a hook that sets a property on an element using a pipe
 *
 * The second argument, property name, is actually a dot-separated path (e.g.,
 * `style.backgroundImage`). The way props are assigned is the same as with
 * hyperscribe itself.
 *
 * More [here](https://github.com/foxbunny/hyperscribe#properties).
 */
export function dynamicProp(pipe, propName) {
  const path = propName.split('.');

  return bind(pipe, function (value, el) {
    addProps(assignPath({}, path, value), el);
  });
};

/**
 * Swap elements based on the value send from a pipe
 *
 * The first element is will be the default. The second element is the
 * alternative. The third argument is a pipe object (see `helpers/pipe.js`) and
 * it is expected that it transmits Boolean values.
 *
 * The value from the pipe is interpreted as follows:
 *
 * - `false` is default
 * - `true` is alternative
 *
 * When the pipe value is `false`, the default element replaces the alternative
 * one (or is kept in the tree if already present). Otherwise, the alternative
 * one is inserted/kept instead.
 */
export function hotswap(pipe, defaultEl, altEl) {
  function swapElements(old, next) {
    if (!old.parentNode) {
      return;
    }

    if (old.removeClass) {
      const removeListener = onTransimationEnd(old, function (e) {
        old.parentNode.replaceChild(next, old);
        old.classList.remove(old.removeClass);
        removeListener();
      });
      old.classList.add(old.removeClass);
    } else {
      old.parentNode.replaceChild(next, old);
    }
  }

  pipe.connect(function (flag) {
    if (flag) {
      swapElements(defaultEl, altEl);
    } else {
      swapElements(altEl, defaultEl);
    }
  });
  return defaultEl;
};

/**
 * Create a list of child nodes that can be updated using a pipe
 */
export function dynamicList(
  pipe,
  initialData,
  renderChild,
  toKey = function (obj) { return obj.key; },
) {
  // A list of keys that are currently in the DOM
  const currentKeys = [];
  // Mapping between keys and elements
  const elementLookup = {};
  // Mapping between keys and pipes
  const pipeLookup = {};

  function createChild(key, data) {
    const updatePipe = createPipe();
    const child = renderChild(data, updatePipe);
    elementLookup[key] = child;
    pipeLookup[key] = updatePipe;
    return child;
  }

  return function (parentNode) {
    // Create the initial DOM nodes and lookup tables
    initialData.forEach(function (member) {
      const key = toKey(member);
      const child = createChild(key, member);
      parentNode.appendChild(child);
      currentKeys.push(key);
    });

    pipe.connect(function (newData) {
      const nextKeys = [];

      newData.forEach(function (member) {
        const key = toKey(member);
        nextKeys.push(key);

        if (pipeLookup.hasOwnProperty(key)) {
          pipeLookup[key].send(member);
        }
        else {
          createChild(key, member);
        }
      });

      editList(currentKeys, nextKeys, {
        keep: function (key) {
          // Nothing to do
        },
        moveBefore: function (key, referenceKey) {
          const el = elementLookup[key];
          const ref = elementLookup[referenceKey];
          parentNode.insertBefore(el, ref);
        },
        moveAfter: function (key, referenceKey) {
          const el = elementLookup[key];
          const ref = elementLookup[referenceKey];
          parentNode.insertBefore(el, ref.nextSibling);
        },
        remove: function (key) {
          const el = elementLookup[key];
          parentNode.removeChild(el);
          delete elementLookup[key];
          delete pipeLookup[key];
        },
        create: function (key, referenceKey) {
          const el = elementLookup[key];
          const ref = elementLookup[referenceKey];
          parentNode.insertBefore(el, ref);
        },
        append: function (key) {
          const el = elementLookup[key];
          parentNode.appendChild(el);
        },
      });

      currentKeys.length = 0;
      currentKeys.splice(0, 0, ...nextKeys);
    });
  };
};
