[![Build Status](https://travis-ci.org/foxbunny/transplexer-hyperscribe.svg?branch=master)](https://travis-ci.org/foxbunny/transplexer-hyperscribe)

# Transplexer-Hyperscribe

Transplexer integration for Hyperscribe

## Overview

This library contains a set of functions that integrates
[transplexer](https://github.com/foxbunny/transplexer) with
[hyperscribe](https://github.com/foxbunny/hyperscribe), thus creating a
mechanism for reactive DOM updates. 

The goal of this library is to allow lightweight declarative, direct and
efficient DOM manipulation while keeping the runtime footprint relatively low.

## Installation

Install from the NPM repository with NPM:

```bash
npm install transplexer-hyperscribe
```

or with Yarn:

```bash
yarn add transplexer-hyperscribe
```

## Binding callbacks to DOM mutations using pipes

The gist of this library is to allow pipes to drive the DOM mutations. There
are three groups of DOM mutations that result from change in state:

- Modify DOM node properties or attributes.
- Toggle a single DOM node.
- Synchronize a group of DOM nodes with arrays.

### Setting/changing properties

To react to changes in state by mutating properties, we use a
`dynamicProp(pipe, propertyName)` function. For example, let's say we want to
update the `href` property of an anchor element dynamically:

```javascript
import pipe from 'transplexer';
import {a} from 'hyperscribe';
import {dynamicProp} from 'transplexer-hyperscribe';

const p = pipe();

a({href: '#foo'}, dynamicProp(p, 'href'));
```

Now whenever something is sent to `p`, the `href` attribute is updated to
whatever value was sent.

The rules by which the property name is used is the same as [in
hyperscribe](http://bit.ly/2IgmPvw). Thanks to this, we can use `dynamicProp`
to set things like style rules (e.g., `style.width`) and ARIA properties
(e.g., `aria.valuemax`, `role`).

### Toggling classes

Toggling classes is very common mutation. It's a special case of property
mutations, and this library provides a separate function 
`toggleClass(pipe, className)` which does this.

The `toggleClass` will treat values as Boolean: each truthy value will add the
specified class name, and falsy values will remove them.

```javascript
import pipe from 'transplexer';
import {div} from 'hyperscribe';
import {dynamicProp} from 'transplexer-hyperscribe';

const p = pipe();

div({class: 'menu'}, toggleClass(p, 'open'));
```

### Hotswapping DOM nodes

While using `display:none` will be effective in most cases, we may want to do
something more complex with the DOM and literally remove a DOM node from the
DOM tree and swap it out for another one. This is where 
`hotswap(pipe, defaultElement, altElement)` becomes useful.

This function takes a pipe and two elements. The first one is called a
'default', and the other one is the 'alternative'. The default element is
rendered immediately where hotswap is called, and then the pipe controls when
and which of the two are rendered. The default element maps to a falsy value
coming through the pipe, whereas the alternative is rendered for any truthy
values.

Here's a simple example:

```javascript
import pipe from 'transplexer';
import {div} from 'hyperscribe';
import {hotswap} from 'transplexer-hyperscribe';

const formErrorPipe = pipe();

div(
  hotswap(
    formErrorPipe, 
    document.createComment('placeholder'),
    div('Houston, we have a problem!')
  ),
);

formErrorPipe.send(true); // shows the form error
```

Elements suddenly appearing and disappearing can be a jarring experience.
Because of this, the `hotswap` function has support for making transitions and
animations before elements are removed from the DOM tree. To add a class to an
element before it is swapped out, we use the `removeClass` property (yes, it's
a custom property).

```javascript
import pipe from 'transplexer';
import {div} from 'hyperscribe';
import {hotswap} from 'transplexer-hyperscribe';

const formErrorPipe = pipe();

div(
  hotswap(
    formErrorPipe, 
    document.createComment('placeholder'),
    div(
      {removeClass: 'exit'},
      'Houston, we have a problem!'
    ),
  ),
);
```

When `hotswap` sees the `removeClass` property it will assume that this class
triggers some kind of animation or transition effect, and will wait for the
effect to finish before removing the node. If there is no animation, the node
does **not** get removed, so it is recommended to always add an animation when
using the `removeClass` property.

### Managing lists of DOM nodes

TODO

## Utility functions

TODO
