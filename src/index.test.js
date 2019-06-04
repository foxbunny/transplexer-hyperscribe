import pipe from 'transplexer';
import {div, button, ul, li, span, label} from 'hyperscribe';
import {prettyPrint} from 'html';
import {
  bind,
  toggleClass,
  dynamicProp,
  bindStyle,
  hotswap,
  dynamicList,
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
    const el = div(toggleClass(p, 'test'));

    p.send(true);

    expect(el.classList.contains('test')).toBe(true);
  });

  test('toggle off', function () {
    const p = pipe();
    const el = div(toggleClass(p, 'test'));

    p.send(true);
    p.send(false);

    expect(el.classList.contains('test')).toBe(false);
  });

  test('toggle off when already off', function () {
    const p = pipe();
    const el = div(toggleClass(p, 'test'));

    p.send(false);

    expect(el.classList.contains('test')).toBe(false);
  });

  test('toggle with truthy value', function () {
    const p = pipe();
    const el = div(toggleClass(p, 'test'));

    p.send('yes');

    expect(el.classList.contains('test')).toBe(true);
  });

  test('toggle off with falsy value', function () {
    const p = pipe();
    const el = div(toggleClass(p, 'test'));

    p.send('yes');
    p.send('');

    expect(el.classList.contains('test')).toBe(false);
  });

});

describe('dynamicProp', function () {

  test('set a prop using a pipe', function () {
    const p = pipe();
    const el = button(dynamicProp(p, 'disabled'));

    p.send(true);

    expect(el.disabled).toBe(true);
  });

  test('set text content', function () {
    const p = pipe();
    const el = div(dynamicProp(p, 'textContent'), 'Hello, test!');

    p.send('Hello, World!');

    expect(el.textContent).toBe('Hello, World!');
  });

  test('for property', function () {
    const p = pipe();
    const el = span(dynamicProp(p, 'for'), {for: 'email'});
    p.send('password');
    expect(el.htmlFor).toBe('password');
  });

  test('style rule', function () {
    const p = pipe();
    const el = span(dynamicProp(p, 'style.backgroundColor'));
    p.send('blue');
    expect(el.style.backgroundColor).toBe('blue');
  });

});

describe('hotswap', function () {

  test('will render the default', function () {
    const p = pipe();
    const def = div();
    const alt = span();

    const res = hotswap(p, def, alt);

    expect(res).toBe(def);
  });

  test('will render the alt element once pipe is updated', function () {
    const p = pipe();
    const def = div();
    const alt = span();

    const parent = div(hotswap(p, def, alt));
    p.send(true);

    expect(parent.firstChild).toBe(alt);
    expect(def.parentNode).toBe(null);
  });

  test('will keep the alt element if pipe does not toggle', function () {
    const p = pipe();
    const def = div();
    const alt = span();

    const parent = div(hotswap(p, def, alt));
    p.send(true);
    p.send(true);

    expect(parent.firstChild).toBe(alt);
    expect(def.parentNode).toBe(null);
  });

  test('will swap back to default if pipe toggles', function () {
    const p = pipe();
    const def = div();
    const alt = span();

    const parent = div(hotswap(p, def, alt));
    p.send(true);
    p.send(false);

    expect(parent.firstChild).toBe(def);
    expect(alt.parentNode).toBe(null);
  });

  test('swap with a delay if element has a removeClass prop', function () {
    const p = pipe();
    const def = div({removeClass: 'foo'});
    const alt = span();

    const parent = div(hotswap(p, def, alt));
    p.send(true);

    expect(parent.firstChild).toBe(def);
    expect(def.classList.contains('foo')).toBe(true);

    def.dispatchEvent(new Event('animationend'));

    expect(parent.firstChild).toBe(alt);
    expect(def.classList.contains('foo')).toBe(false);
  });

});

describe('dynamicList', function () {
  function renderPerson (person, personPipe) {
    const namePipe = personPipe.extend(function (next) {
      return function(person) {
        next(person.name);
      };
    });
    return li(
      dynamicProp(namePipe, 'textContent'),
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
      dynamicList(p, initial, renderPerson),
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
      dynamicList(p, initial, renderPerson),
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
      dynamicList(p, initial, renderPerson),
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
      dynamicList(p, initial, renderPerson),
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
      dynamicList(p, initial, renderPerson),
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
      dynamicList(p, initial, renderPerson),
    );

    initial.splice(1, 0, {name: 'Bob', key: 'bob'});
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

});
