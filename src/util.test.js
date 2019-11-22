import { div } from 'hyperscribe';
import { once, onTransimationEnd, onMultiAnimationEnd } from './util';

describe('once', function () {

  test('cannot call more than once', function () {
    let f = jest.fn();
    let f1 = once(f);

    f1(1, 2, 3);
    f1(4, 5, 6);

    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith(1, 2, 3);
  });

});

describe('onTrasimationEnd', function () {

  test('add listeners', function () {
    let el = div();
    let f = jest.fn();
    onTransimationEnd(el, f);
    el.dispatchEvent(new Event('animationend'));
    expect(f).toHaveBeenCalled();
  });

  test('remove listeners', function () {
    let el = div();
    let f = jest.fn();
    let remove = onTransimationEnd(el, f);
    remove();
    el.dispatchEvent(new Event('animationend'));
    expect(f).not.toHaveBeenCalled();
  });

  test('double-trigger', function () {
    let el = div();
    let f = jest.fn();
    onTransimationEnd(el, f);
    el.dispatchEvent(new Event('animationend'));
    el.dispatchEvent(new Event('animationend'));
    expect(f).toHaveBeenCalledTimes(1);
  });

});

describe('onMultiAnimationEnd', function () {

  test('triggering all listeners triggers callback once', function () {
    let el1 = div();
    let el2 = div();
    let els = [el1, el2];
    let callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    els.forEach(function (el) {
      el.dispatchEvent(new Event('animationend'));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
  });

  test('triggering callback on transition event', function () {
    let el1 = div();
    let el2 = div();
    let els = [el1, el2];
    let callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    els.forEach(function (el) {
      el.dispatchEvent(new Event('transitionend'));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
  });

  test('triggering one listener multiple times', function () {
    let el1 = div();
    let el2 = div();
    let els = [el1, el2];
    let callback = jest.fn();

    onMultiAnimationEnd(els, callback);
    el1.dispatchEvent(new Event('animationend'));
    el1.dispatchEvent(new Event('transitionend'));

    expect(callback).not.toHaveBeenCalled();
  });

  test('triggering all callbacks multiple times', function () {
    let el1 = div();
    let el2 = div();
    let els = [el1, el2];
    let callback = jest.fn();

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
