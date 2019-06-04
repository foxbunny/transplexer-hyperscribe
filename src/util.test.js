import {div} from 'hyperscribe';
import {once, onTransimationEnd, onMultiAnimationEnd} from './util';

describe('once', function () {

  test('cannot call more than once', function () {
    const f = jest.fn();
    const f1 = once(f);

    f1(1, 2, 3);
    f1(4, 5, 6);

    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith(1, 2, 3);
  });

});

describe('onTrasimationEnd', function () {

  test('add listeners', function () {
    const el = div();
    const f = jest.fn();
    onTransimationEnd(el, f);
    el.dispatchEvent(new Event('animationend'));
    expect(f).toHaveBeenCalled();
  });

  test('remove listeners', function () {
    const el = div();
    const f = jest.fn();
    const remove = onTransimationEnd(el, f);
    remove();
    el.dispatchEvent(new Event('animationend'));
    expect(f).not.toHaveBeenCalled();
  });

  test('double-trigger', function () {
    const el = div();
    const f = jest.fn();
    onTransimationEnd(el, f);
    el.dispatchEvent(new Event('animationend'));
    el.dispatchEvent(new Event('animationend'));
    expect(f).toHaveBeenCalledTimes(1);
  });

});

describe('onMultiAnimationEnd', function () {

  test('triggering all listeners triggers callback once', function () {
    const el1 = div();
    const el2 = div();
    const els = [el1, el2];
    const callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    els.forEach(function (el) {
      el.dispatchEvent(new Event('animationend'));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
  });

  test('triggering callback on transition event', function () {
    const el1 = div();
    const el2 = div();
    const els = [el1, el2];
    const callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    els.forEach(function (el) {
      el.dispatchEvent(new Event('transitionend'));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
  });

  test('triggering one listener multiple times', function () {
    const el1 = div();
    const el2 = div();
    const els = [el1, el2];
    const callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    el1.dispatchEvent(new Event('animationend'));
    el1.dispatchEvent(new Event('transitionend'));

    expect(callback).not.toHaveBeenCalled();
  });

  test('triggering all callbacks multiple times', function () {
    const el1 = div();
    const el2 = div();
    const els = [el1, el2];
    const callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    els.forEach(function (el) {
      el.dispatchEvent(new Event('animationend'));
    });
    els.forEach(function (el) {
      el.dispatchEvent(new Event('animationend'));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

});
