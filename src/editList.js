/**
 * The `editList()` code is based on Snabbdom's `updateNodes()`.
 *
 * The original code was modified to create minimal edit lists for arrays of
 * keys as opposed to arrays of VDOM nodes, and present an
 * event-emitter-style interface.
 *
 * Reference to the original function: http://bit.ly/2RRzmME
 *
 * Original: (c) 2015 Simon Friis Vindum
 */

/**
 * Calculate a minimal edit list to synchronize two sets of keys
 *
 * This function takes two lists of string keys and calculates a minimal set of
 * edits that should be made to the first list in order to recreate the second
 * list.
 *
 * As the edit list is calculated, the handler object is notified about the
 * required edits via its methods. The handlers object should have the
 * following methods:
 *
 * - `keep(key)` - the key should be kept as is.
 * - `moveAfter(key, referenceKey)` - move `key` right after `referenceKey`.
 * - `moveBefore(key, referenceKey)` - move `key` right before `referenceKey`.
 * - `create(key, refrenceKey)` - crate and insert a `key` right after
 *   `referenceKey`.
 * - `append(key)` - append the `key` to the end of the list.
 */
export function editList (oldKeys, newKeys, handlers) {
  let oldStartIdx = 0, newStartIdx = 0;
  let oldEndIdx = oldKeys.length - 1;
  let oldStartKey = oldKeys[0];
  let oldEndKey = oldKeys[oldEndIdx];
  let newEndIdx = newKeys.length - 1;
  let newStartKey = newKeys[0];
  let newEndKey = newKeys[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartKey === newStartKey) { // Heads match
      handlers.keep(oldStartKey);
      oldStartKey = oldKeys[++oldStartIdx];
      newStartKey = newKeys[++newStartIdx];
    }

    else if (oldEndKey === newEndKey) { // Tails match
      handlers.keep(oldEndKey);
      oldEndKey = oldKeys[--oldEndIdx];
      newEndKey = newKeys[--newEndIdx];
    }

    else if (oldStartKey === newEndKey) { // Key moved to tail
      handlers.moveAfter(oldStartKey, oldEndKey);
      oldStartKey = oldKeys[++oldStartIdx];
      newEndKey = newKeys[--newEndIdx];
    }

    else if (oldEndKey === newStartKey) { // Key moved to head
      handlers.moveBefore(oldEndKey, oldStartKey);
      oldEndKey = oldKeys[--oldEndIdx];
      newStartKey = newKeys[++newStartIdx];
    }

    else { // Key may or may not be somewhere in the middle
      const idxInOld = oldKeys.indexOf(newStartKey);

      if (idxInOld === -1) { // Key is not in middle
        handlers.create(newStartKey, oldStartKey);
      }

      else { // Key is in middle, extract to start of the current range
        handlers.moveBefore(newStartKey, oldStartKey);
        oldKeys[idxInOld] = undefined;
      }

      newStartKey = newKeys[++newStartIdx];
    }
  }

  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      // If we encounter an item past the last unaccounted-for item, then all
      // items should be inserted before it.
      if (newKeys[newEndIdx + 1]) {
        for (; newStartIdx <= newEndIdx; newStartIdx++) {
          handlers.create(newKeys[newStartIdx], newKeys[newEndIdx + 1]);
        }
      }
      // Otherwise, we append all items
      else {
        for (; newStartIdx <= newEndIdx; newStartIdx++) {
          handlers.append(newKeys[newStartIdx]);
        }
      }
    }
    else {
      for (; oldStartIdx <= oldEndIdx; oldStartIdx++) {
        if (oldKeys[oldStartIdx]) {
          handlers.remove(oldKeys[oldStartIdx]);
        }
      }
    }
  }
};
