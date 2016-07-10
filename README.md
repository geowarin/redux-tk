# Redux-toolkit

Tools to easily compose redux's reducers. 

## API

### reducerBuilder

#### ReducerBuilder.fun(reducerFunction, [namespace], [initialState])

Example with named reducer/action:

```js
import {reducerBuilder} from 'react-tk';

const increment = (state, action) => state + 1;
const builder = reducerBuilder.plain() // or reducerBuilder.immutable() for immutable support
    .fun(increment, 'increment'); // give this reducer a name

// Creates a store with an initial state
const store = createStore(builder.buildReducer(), 4);

// Bind actions to dispatch
const actions = builder.buildActions(store.dispatch);

// Actions follow the same namespace
actions.increment();
// equivalent of: store.dispatch({type: 'increment', payload});

expect(store.getState()).toEqual(5);
```

Example with namespaces:

```js
const reset = state => ({counter: 0});
const increment = (state, action) => state + action.payload;
const decrement = (state, action) => state - action.payload;

const builder = reducerBuilder.plain()
    .fun(reset, 'reset') // named function bound to the root state 
    .initialState('counter', 2)
    .fun(increment, 'counter.increment')
    .fun(decrement, 'counter.decrement');

const store = createStore(builder.buildReducer());
const actions = builder.buildActions(store.dispatch);
actions.counter.increment(2);
actions.counter.decrement(3);

expect(store.getState()).toEqual({counter: 1});
```

#### ReducerBuilder.obj(reducerObject, [namespace], [initialState])

`ReducerBuilder.obj` is more convenient to encapsulate a behavior spanning across
multiple reducers.

Example with a counter:

```js
const counter = {
    // reducer can have an initial state
    initialState: O, 
    
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
};

const builder = reducerBuilder.plain() // or reducerBuilder.immutable() for immutable support
    .obj(counter, 'myCounter') // namespace. Can contain dots

// Creates a store
const store = createStore(builder.buildReducer()); 

// Bind actions to dispatch
const actions = builder.buildActions(store.dispatch);

// Actions follow the same namespace
actions.myCounter.increment(2);

// And the state too
expect(store.getState()).toEqual({ 
    myCounter: 2,
});
```

You can also reuse reducers multiple times

```js
const counter = {
    initialState: O, 
    
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
};

const builder = reducerBuilder.plain()
    .obj(counter, 'count1')
    .obj(counter, 'count2', 42); // can override initial state
    // you could also do .initialState('count2', 42)

// Creates a store
const store = createStore(builder.buildReducer()); 

const actions = builder.buildActions(store.dispatch);
actions.count1.increment(2);
actions.count2.decrement(12);

expect(store.getState()).toEqual({ 
    count1: 2, 
    count2: 30 
});
```

Have a look at [the tests](https://github.com/geowarin/redux-tk/blob/master/test/reducerBuilder.test.js) for more examples.