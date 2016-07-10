import test from "ava";
import {createStore} from "redux";
import reducerBuilder from "../src/reducerBuilder";
import expect from "expect";
import Immutable, {Map} from 'immutable';
import expectImmutable from 'expect-immutable';

expect.extend(expectImmutable);

test('immutable: should create reducer from function', () => {

  const increment = (state, action) => state + 1;
  const builder = reducerBuilder.immutable()
    .fun(increment, 'inc');

  const store = createStore(builder.buildReducer(), 4);
  const actions = builder.buildActions(store.dispatch);
  actions.inc();

  expect(store.getState()).toEqual(5);
});

test('immutable: should create reducer from objects', () => {

  const increment = (state, action) => state + 1;
  const decrement = (state, action) => state - 1;
  const reducer = reducerBuilder.immutable()
    .obj({increment})
    .obj({decrement})
    .buildReducer();

  const store = createStore(reducer, 0);
  store.dispatch({type: 'increment'});
  store.dispatch({type: 'increment'});
  store.dispatch({type: 'decrement'});

  expect(store.getState()).toEqual(1);
});

test('immutable: should create actions', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.immutable()
    .obj({increment});

  const store = createStore(builder.buildReducer(), 0);
  const actions = builder.buildActions(store.dispatch);
  actions.increment(2);

  expect(store.getState()).toEqual(2);
});

test('immutable: should handle namespaces', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.immutable()
    .obj({increment}, 'counter');

  const store = createStore(builder.buildReducer(), Map({counter: 0}));
  const actions = builder.buildActions(store.dispatch);
  actions.counter.increment(2);

  expect(store.getState().get('counter')).toEqual(2);
});

test('immutable: should handle deep namespaces', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.immutable()
    .obj({increment}, 'deep.counter');

  const initialState = Immutable.fromJS({ deep: {counter: 0} });
  const store = createStore(builder.buildReducer(), initialState);
  const actions = builder.buildActions(store.dispatch);
  actions.deep.counter.increment(2);

  expect(store.getState()).toEqualImmutable(Map({ deep: {counter: 2} }));
});

test('immutable: should allow a reducer to be defined in different namespaces', () => {

  const counter = {
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
  };
  const builder = reducerBuilder.immutable()
    .obj(counter, 'count1', 0)
    .obj(counter, 'count2', 42);

  const store = createStore(builder.buildReducer());
  const actions = builder.buildActions(store.dispatch);
  actions.count1.increment(2);
  actions.count2.decrement(12);

  expect(store.getState()).toEqualImmutable(Map({ count1: 2, count2: 30 }));
});

test('immutable: should allow a reducer object to declare an initial state', () => {

  const counter = {
    initialState: 0,
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
  };
  const builder = reducerBuilder.immutable()
    .obj(counter, 'count1')
    .obj(counter, 'count2', 42)
    .obj(counter, 'count3', -23);

  const initialState = Map({count3: 11});
  const store = createStore(builder.buildReducer(), initialState);
  const actions = builder.buildActions(store.dispatch);
  actions.count1.increment(2);
  actions.count2.decrement(12);
  
  expect(store.getState()).toEqualImmutable(Map({ count1: 2, count2: 30, count3: 11 }));
});

test('immutable: should have a default state', () => {

  const greeter = {
    greet: (state, action) => state.set('greeting', `Hi, ${action.payload}`)
  };
  const builder = reducerBuilder.immutable()
    .obj(greeter, 'greeter');

  const store = createStore(builder.buildReducer());
  const actions = builder.buildActions(store.dispatch);
  actions.greeter.greet('Leonard');

  expect(store.getState()).toEqualImmutable(Map({ greeter: {greeting: 'Hi, Leonard' }}));
});