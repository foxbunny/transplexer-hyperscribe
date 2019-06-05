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

## Contents

<!-- vim-markdown-toc GFM -->

* [Installation](#installation)
* [Binding callbacks to DOM mutations using pipes](#binding-callbacks-to-dom-mutations-using-pipes)
  * [Setting/changing properties](#settingchanging-properties)
  * [Toggling classes](#toggling-classes)
  * [Hotswapping DOM nodes](#hotswapping-dom-nodes)
  * [Dynamic text](#dynamic-text)
  * [Managing lists of DOM nodes](#managing-lists-of-dom-nodes)

<!-- vim-markdown-toc -->

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

### Dynamic text

Although it's possible to use `dynamicProp` with `textContent`, it does
require the dynamic portion of the text to take up the entire contents of the
element. To crate a stand-alone text node that represents a dynamic text, we
use the `dynamicText(pipe, initialText)` function.

```javascript
import pipe from 'transplexer';
import {div} from 'hyperscribe';
import {dynamicText} from 'transplexer-hyperscribe';

const p = pipe();

div('Hello, ', dynamicText(p, 'World'), '!');
```

### Managing lists of DOM nodes

One of the most difficult tasks when it comes to managing DOM nodes is managing
lists of DOM nodes that are generated based on arrays, and keeping it in sync
with the array from which they are created.

Most modern DOM libraries (including virtual DOM ones) will allow for creating
both keyed and non-keyed lists of nodes. That is, nodes that are either
identified or not identified uniquely. In the interest of simplicity, this
library only allows the keyed lists.

Every DOM node that represents the list item (it may have children) in a keyed
list must have a `key`, a value that uniquely identifies it. Keys are always
converted to string, to it should be a value that preserves its uniqueness
after it's converted to a key.

In order to manage this type of lists, we use the 
`dynamicList(pipe, initialData, renderChild, toKey)` function. Let's first go
over the arguments briefly and then talk about its usage. The arguments are as
follows:

- `pipe` - the pipe that will send out new versions of the list (it does not
  have to be a completely new instance of an array, it can be the same instance
  as before).
- `initialData` - the initial state of the list.
- `renderChild` - a function that takes an object or a value representing the
  list item and a pipe with updates to the value, and renders a child node from
  it. The function must always return a single root node, but the node may have
  any number of child nodes.
- `toKey` - a function that takes the value of the item, and returns a key that
  uniquely identifies it. This argument is optional, and defaults to a function
  that returns the `key` property of the value. In other words, as long as all
  values are objects with a `key` property, you don't have to specify this
  function. This function should return a value that retains its uniqueness
  when converted to a string (numbers and strings usually work better).

Here's a simple example:

```javascript
import pipe from 'transplexer';
import {ul, li, div, span} from 'hyperscribe';
import {dynamicList, dynamicProp} from 'transplexer-hyperscribe';
import {toTransformer as t$} from 'transplexer-tools';

const users = [
  {name: 'John Doe', email: 'jdoe@example.com', id: 11, key: '11'},
  {name: 'Jane Doe', email: 'doej@example.com', id: 42, key: '42'},
];

function renderUser(user, updatePipe) {
  const namePipe = updatePipe.extends(t$(user => user.name));
  const emailPipe = updatePipe.extends(t$(user => user.email));

  return li(
    div('name: ', span(
      user.name, 
      dynamicProp(namePipe, 'textContent')
    )),
    div('email: ', span(
      user.email, 
      dynamicProp(emailPipe, 'textContent')
    )),
  );
}

const userListUpdatesPipe = pipe();

ul(
  dynamicList(
    userUpdates,
    users,
    renderUser,
  ),
)
```

In the example code, the `renderUser` function is the most important part. It
should be pointed out that this function is only called once per every new list
item. When list items are updated, they retain the same key but may contain new
data. The render function will receive such updates through the second
argument, which is a pipe.

The render function sets up its own more granular pipes that will handle the
updates to the name and email fields. It should also be noted that this example
does not include performance optimizations such as blocking the pipes when the
values haven't changed from the previous/initial value.

Updates to the list are handled using the edit lists, which are created using
an algorithm borrowed from [Snabbdom](https://github.com/snabbdom/snabbdom).
They ensure that minimum amount of shuffling is done in order to update the
list.

