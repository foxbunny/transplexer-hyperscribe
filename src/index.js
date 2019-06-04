import createPipe from 'transplexer';
import {editList} from './editList';

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
export function bindClass(pipe, className) {
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
 */
export function bindProp(pipe, propName) {
  return bind(pipe, function (value, el) {
    el[propName] = value;
  });
};

/**
 * Create a hook that changes style properties using a pipe
 */
export function bindStyle(pipe, rule) {
  return bind(pipe, function (value, el) {
    el.style[rule] = value;
  });
};

/**
 * Create a list of child nodes that can be updated using a pipe
 */
export function bindChildren(
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
        create: function (key, refrenceKey) {
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
