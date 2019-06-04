import {editList} from './editList';

const KEEP = 'keep';
const MOVE_BEFORE = 'move before';
const MOVE_AFTER = 'move after';
const REMOVE = 'remove';
const CREATE = 'create';
const APPEND = 'append';

const CASES = [
  [
    'identical lists',
    ['A', 'B', 'C', 'D', 'E'],
    ['A', 'B', 'C', 'D', 'E'],
    [
      [KEEP, 'A'],
      [KEEP, 'B'],
      [KEEP, 'C'],
      [KEEP, 'D'],
      [KEEP, 'E'],
    ],
  ],
  [
    'completely empty old',
    [],
    ['A', 'B', 'C', 'D', 'E'],
    [
      [APPEND, 'A'],
      [APPEND, 'B'],
      [APPEND, 'C'],
      [APPEND, 'D'],
      [APPEND, 'E'],
    ],
  ],
  [
    'completely empty target',
    ['A', 'B', 'C', 'D', 'E'],
    [],
    [
      [REMOVE, 'A'],
      [REMOVE, 'B'],
      [REMOVE, 'C'],
      [REMOVE, 'D'],
      [REMOVE, 'E'],
    ]
  ],
  [
    'complete swap',
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    [
      [CREATE, 'F', 'A'],
      [CREATE, 'G', 'A'],
      [CREATE, 'H', 'A'],
      [CREATE, 'I', 'A'],
      [CREATE, 'J', 'A'],
      [REMOVE, 'A'],
      [REMOVE, 'B'],
      [REMOVE, 'C'],
      [REMOVE, 'D'],
      [REMOVE, 'E'],
    ]
  ],
  [
    'swap middle',
    ['A', 'B', 'C', 'D', 'E'],
    ['A', 'B', 'D', 'C', 'E'],
    [
      [KEEP, 'A'],
      [KEEP, 'B'],
      [KEEP, 'E'],
      [MOVE_AFTER, 'C', 'D'],
      [KEEP, 'D'],
    ],
  ],
  [
    'middle subset',
    ['A', 'B', 'C', 'D', 'E'],
    ['B', 'C', 'D'],
    [
      [MOVE_BEFORE, 'B', 'A'],
      [MOVE_BEFORE, 'C', 'A'],
      [MOVE_BEFORE, 'D', 'A'],
      [REMOVE, 'A'],
      [REMOVE, 'E'],
    ],
  ],
  [
    'single item overlap',
    ['A', 'B', 'C'],
    ['C', 'D', 'E'],
    [
      [MOVE_BEFORE, 'C', 'A'],
      [CREATE, 'D', 'A'],
      [CREATE, 'E', 'A'],
      [REMOVE, 'A'],
      [REMOVE, 'B'],
    ],
  ],
  [
    'remove initial and from middle',
    ['A', 'B', 'C', 'D', 'E'],
    ['B', 'C', 'E'],
    [
      [KEEP, 'E'],
      [MOVE_BEFORE, 'B', 'A'],
      [MOVE_BEFORE, 'C', 'A'],
      [REMOVE, 'A'],
      [REMOVE, 'D'],
    ],
  ],
  [
    'remove initial',
    ['A', 'B', 'C', 'D', 'E'],
    ['B', 'C', 'D', 'E'],
    [
      [KEEP, 'E'],
      [KEEP, 'D'],
      [KEEP, 'C'],
      [KEEP, 'B'],
      [REMOVE, 'A'],
    ],
  ],
  [
    'append',
    ['A', 'B', 'C', 'D', 'E'],
    ['A', 'B', 'C', 'D', 'E', 'F'],
    [
      [KEEP, 'A'],
      [KEEP, 'B'],
      [KEEP, 'C'],
      [KEEP, 'D'],
      [KEEP, 'E'],
      [APPEND, 'F'],
    ],
  ],
];

// Test handler that simply creates a human-readable edit list
function accumulator() {
  const changes = [];

  return {
    keep(key) {
      changes.push([KEEP, key]);
    },
    moveBefore(key, pos) {
      changes.push([MOVE_BEFORE, key, pos]);
    },
    moveAfter(key, pos) {
      changes.push([MOVE_AFTER, key, pos]);
    },
    remove(key) {
      changes.push([REMOVE, key]);
    },
    create(key, pos) {
      changes.push([CREATE, key, pos]);
    },
    append(key) {
      changes.push([APPEND, key]);
    },
    getChanges() {
      return changes;
    },
  };
};

describe('editList', function () {
  test.each(CASES)(
    '%s',
    function (title, oldKeys, newKeys, edits) {
      const acc = accumulator();
      editList(
        oldKeys.slice(),
        newKeys.slice(),
        acc,
      );

      expect(acc.getChanges()).toEqual(edits);
    }
  );

  test('append', function () {
    const acc = accumulator();
    editList(
      ['A', 'B', 'C', 'D', 'E'],
      ['A', 'B', 'C', 'D', 'E', 'F'],
      acc
    );

    expect(acc.getChanges()).toEqual([
      [KEEP, 'A'],
      [KEEP, 'B'],
      [KEEP, 'C'],
      [KEEP, 'D'],
      [KEEP, 'E'],
      [APPEND, 'F'],
    ]);
  });
});
