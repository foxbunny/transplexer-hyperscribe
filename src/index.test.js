import pipe from 'transplexer';
import { div, button, ul, li, span } from 'hyperscribe';
import { prettyPrint } from 'html';
import {
  bind,
  toggleClass,
  dynamicProp,
  hotswap,
  dynamicText,
  dynamicList,
} from './index';

describe('bind', function () {

  test('bind arbitrary callback to an object using a pipe', function () {
    let p = pipe();
    let f = jest.fn();
    let el = div(bind(p, f));

    p.send('test');

    expect(f).toHaveBeenCalledWith('test', el);
  });

});

describe('toggle class', function () {

  test('toggle a class with a pipe', function () {
    let p = pipe();
    let el = div(toggleClass(p, 'test'));

    p.send(true);

    expect(el.classList.contains('test')).toBe(true);
  });

  test('toggle off', function () {
    let p = pipe();
    let el = div(toggleClass(p, 'test'));

    p.send(true);
    p.send(false);

    expect(el.classList.contains('test')).toBe(false);
  });

  test('toggle off when already off', function () {
    let p = pipe();
    let el = div(toggleClass(p, 'test'));

    p.send(false);

    expect(el.classList.contains('test')).toBe(false);
  });

  test('toggle with truthy value', function () {
    let p = pipe();
    let el = div(toggleClass(p, 'test'));

    p.send('yes');

    expect(el.classList.contains('test')).toBe(true);
  });

  test('toggle off with falsy value', function () {
    let p = pipe();
    let el = div(toggleClass(p, 'test'));

    p.send('yes');
    p.send('');

    expect(el.classList.contains('test')).toBe(false);
  });

});

describe('dynamicProp', function () {

  test('set a prop using a pipe', function () {
    let p = pipe();
    let el = button(dynamicProp(p, 'disabled'));

    p.send(true);

    expect(el.disabled).toBe(true);
  });

  test('set text content', function () {
    let p = pipe();
    let el = div(dynamicProp(p, 'textContent'), 'Hello, test!');

    p.send('Hello, World!');

    expect(el.textContent).toBe('Hello, World!');
  });

  test('for property', function () {
    let p = pipe();
    let el = span(dynamicProp(p, 'for'), { for: 'email' });
    p.send('password');
    expect(el.htmlFor).toBe('password');
  });

  test('style rule', function () {
    let p = pipe();
    let el = span(dynamicProp(p, 'style.backgroundColor'));
    p.send('blue');
    expect(el.style.backgroundColor).toBe('blue');
  });

});

describe('hotswap', function () {

  test('will render the default', function () {
    let p = pipe();
    let def = div();
    let alt = span();

    let res = hotswap(p, def, alt);

    expect(res).toBe(def);
  });

  test('will render the alt element once pipe is updated', function () {
    let p = pipe();
    let def = div();
    let alt = span();

    let parent = div(hotswap(p, def, alt));
    p.send(true);

    expect(parent.firstChild).toBe(alt);
    expect(def.parentNode).toBe(null);
  });

  test('will keep the alt element if pipe does not toggle', function () {
    let p = pipe();
    let def = div();
    let alt = span();

    let parent = div(hotswap(p, def, alt));
    p.send(true);
    p.send(true);

    expect(parent.firstChild).toBe(alt);
    expect(def.parentNode).toBe(null);
  });

  test('will swap back to default if pipe toggles', function () {
    let p = pipe();
    let def = div();
    let alt = span();

    let parent = div(hotswap(p, def, alt));
    p.send(true);
    p.send(false);

    expect(parent.firstChild).toBe(def);
    expect(alt.parentNode).toBe(null);
  });

  test('swap with a delay if element has a removeClass prop', function () {
    let p = pipe();
    let def = div({ removeClass: 'foo' });
    let alt = span();

    let parent = div(hotswap(p, def, alt));
    p.send(true);

    expect(parent.firstChild).toBe(def);
    expect(def.classList.contains('foo')).toBe(true);

    def.dispatchEvent(new Event('animationend'));

    expect(parent.firstChild).toBe(alt);
    expect(def.classList.contains('foo')).toBe(false);
  });

});

describe('dynamicText', function () {

  test('renders a text node', function () {
    let p = pipe();
    let el = dynamicText(p, 'Hello, World!');

    expect(el).toBeInstanceOf(Text);
    expect(el.textContent).toBe('Hello, World!');
  });

  test('update the text', function () {
    let p = pipe();
    let el = dynamicText(p, 'Hello, World!');

    p.send('Hello, hyperscribe!');

    expect(el.textContent).toBe('Hello, hyperscribe!');
  });

  test('use in a hyperscribe node', function () {
    let p = pipe();
    let el = div('Hello, ', dynamicText(p, 'World'), '!');

    expect(el.textContent).toBe('Hello, World!');

    p.send('transplexer');

    expect(el.textContent).toBe('Hello, transplexer!');
  });

});

describe('dynamicList', function () {
  function renderPerson (person, personPipe) {
    let namePipe = personPipe.extend(function (next) {
      return function (person) {
        next(person.name);
      };
    });
    return li(
      dynamicProp(namePipe, 'textContent'),
      person.name,
    );
  }

  test('create a list of child nodes', function () {
    let initial = [
      { name: 'John', key: 'john' },
      { name: 'Jane', key: 'jane' },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson),
    );

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('updating a property of a member', function () {
    let initial = [
      { name: 'John', key: 'john' },
      { name: 'Jane', key: 'jane' },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson),
    );

    let firstChild = el.firstChild;
    initial[0].name = 'Ben';
    p.send(initial);

    expect(el.firstChild).toBe(firstChild);
    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('change order', function () {
    let initial = [
      { name: 'John', key: 'john' },
      { name: 'Jane', key: 'jane' },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson),
    );

    p.send([
      initial[1],
      initial[0],
    ]);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('append item', function () {
    let initial = [
      { name: 'John', key: 'john' },
      { name: 'Jane', key: 'jane' },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson),
    );

    initial.push({ name: 'Bob', key: 'bob' });
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('pop item', function () {
    let initial = [
      { name: 'John', key: 'john' },
      { name: 'Jane', key: 'jane' },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson),
    );

    initial.pop();
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('insert item', function () {
    let initial = [
      { name: 'John', key: 'john' },
      { name: 'Jane', key: 'jane' },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson),
    );

    initial.splice(1, 0, { name: 'Bob', key: 'bob' });
    p.send(initial);

    expect(prettyPrint(el.outerHTML)).toMatchSnapshot();
  });

  test('custom key function', function () {
    function keyFn (person) {
      return person.eid;
    }
    let initial = [
      { name: 'John', eid: 33 },
      { name: 'Jane', eid: 61 },
    ];
    let p = pipe();
    let el = ul(
      dynamicList(p, initial, renderPerson, keyFn),
    );
    let firstChild = el.firstChild;

    initial[0].name = 'Bob';
    p.send(initial);
    expect(el.firstChild).toBe(firstChild);
    expect(el.firstChild.textContent).toBe('Bob');

    initial[0].eid = 47;
    p.send(initial);
    expect(el.firstChild).not.toBe(firstChild);
    expect(el.firstChild.textContent).toBe('Bob');
  });

});
