import pipe from 'transplexer';
import {div, button, ul, li} from 'hyperscribe';
import {prettyPrint} from 'html';
import {
  bind,
  bindClass,
  bindProp,
  bindStyle,
  bindList,
  bindChildren,
} from './index';

describe('bind', function () {

  test('bind arbitrary callback to an object using a pipe', function () {
    const p = pipe();
    const f = jest.fn();
    const el = div(bind(p, f));

    p.send('test');

    expect(f).toHaveBeenCalledWith('test', el);
  });

});


describe('toggle class', function () {

  test('toggle a class with a pipe', function () {
    const p = pipe();
    const el = div(bindClass(p, 'test'));

    p.send(true);

    expect(el.classList.contains('test')).toBe(true);
  });

  test('toggle off', function () {
    const p = pipe();
    const el = div(bindClass(p, 'test'));

    p.send(true);
    p.send(false);

    expect(el.classList.contains('test')).toBe(false);
  });

  test('toggle off when already off', function () {
    const p = pipe();
    const el = div(bindClass(p, 'test'));

    p.send(false);

    expect(el.classList.contains('test')).toBe(false);
  });

  test('toggle with truthy value', function () {
    const p = pipe();
    const el = div(bindClass(p, 'test'));

    p.send('yes');

    expect(el.classList.contains('test')).toBe(true);
  });

  test('toggle off with falsy value', function () {
    const p = pipe();
    const el = div(bindClass(p, 'test'));

    p.send('yes');
    p.send('');

    expect(el.classList.contains('test')).toBe(false);
  });

});

describe('bindProp', function () {

  test('set a prop using a pipe', function () {
    const p = pipe();
    const el = button(bindProp(p, 'disabled'));

    p.send(true);

    expect(el.disabled).toBe(true);
  });

  test('set text content', function () {
    const p = pipe();
    const el = div(bindProp(p, 'textContent'), 'Hello, test!');

    p.send('Hello, World!');

    expect(el.textContent).toBe('Hello, World!');
  });

});

describe('bindStyle', function () {

  test('change a style rule with a pipe', function () {
    const p = pipe();
    const el = div(bindStyle(p, 'background'));

    p.send('white');

    expect(el.style.background).toBe('white');
  });

});

describe('bindChildren', function () {
  function renderPerson (person, personPipe) {
    const namePipe = personPipe.extend(function (next) {
      return function(person) {
        next(person.name);
      };
    });
    return li(
      bindProp(namePipe, 'textContent'),
      person.name,
    );
  }

  test('create a list of child nodes', function () {
    const initial = [
      {name: 'John', key: 'john'},
      {name: 'Jane', key: 'jane'},
    ]
    const p = pipe();
    const el = ul(
      bindChildren(p, initial, renderPerson),
    );

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('updating a property of a member', function () {
    const initial = [
      {name: 'John', key: 'john'},
      {name: 'Jane', key: 'jane'},
    ]
    const p = pipe();
    const el = ul(
      bindChildren(p, initial, renderPerson),
    );

    const firstChild = el.firstChild;
    initial[0].name = 'Ben';
    p.send(initial);

    expect(el.firstChild).toBe(firstChild);
    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('change order', function () {
    const initial = [
      {name: 'John', key: 'john'},
      {name: 'Jane', key: 'jane'},
    ]
    const p = pipe();
    const el = ul(
      bindChildren(p, initial, renderPerson),
    );

    p.send([
      initial[1],
      initial[0],
    ]);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('append item', function () {
    const initial = [
      {name: 'John', key: 'john'},
      {name: 'Jane', key: 'jane'},
    ]
    const p = pipe();
    const el = ul(
      bindChildren(p, initial, renderPerson),
    );

    initial.push({name: 'Bob', key: 'bob'});
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('pop item', function () {
    const initial = [
      {name: 'John', key: 'john'},
      {name: 'Jane', key: 'jane'},
    ]
    const p = pipe();
    const el = ul(
      bindChildren(p, initial, renderPerson),
    );

    initial.pop();
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('insert item', function () {
    const initial = [
      {name: 'John', key: 'john'},
      {name: 'Jane', key: 'jane'},
    ]
    const p = pipe();
    const el = ul(
      bindChildren(p, initial, renderPerson),
    );

    initial.splice(1, 0, {name: 'Bob', key: 'bob'});
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

});
