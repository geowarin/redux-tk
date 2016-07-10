import test from "ava";
import {createStore} from "redux";
import reducerBuilder from "../src/reducerBuilder";
import expect from "expect";

test('plain: should create reducer from function', () => {

  const increment = (state, action) => state + 1;
  const builder = reducerBuilder.plain()
    .fun(increment, 'inc');

  const store = createStore(builder.buildReducer(), 4);
  const actions = builder.buildActions(store.dispatch);
  actions.inc();

  expect(store.getState()).toEqual(5);
});

test('plain: should create reducer from objects', () => {

  const increment = (state, action) => state + 1;
  const decrement = (state, action) => state - 1;
  const reducer = reducerBuilder.plain()
    .obj({increment})
    .obj({decrement})
    .buildReducer();

  const store = createStore(reducer, 0);
  store.dispatch({type: 'increment'});
  store.dispatch({type: 'increment'});
  store.dispatch({type: 'decrement'});

  expect(store.getState()).toEqual(1);
});

test('plain: should create actions', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.plain()
    .obj({increment});

  const store = createStore(builder.buildReducer(), 0);
  const actions = builder.buildActions(store.dispatch);
  actions.increment(2);

  expect(store.getState()).toEqual(2);
});

test('plain: should handle namespaces', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.plain()
    .obj({increment}, 'counter');

  const store = createStore(builder.buildReducer(), {counter: 0});
  const actions = builder.buildActions(store.dispatch);
  actions.counter.increment(2);

  expect(store.getState().counter).toEqual(2);
});

test('plain: should handle deep namespaces', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.plain()
    .obj({increment}, 'deep.counter');

  const initialState = { deep: {counter: 0} };
  const store = createStore(builder.buildReducer(), initialState);
  const actions = builder.buildActions(store.dispatch);
  actions.deep.counter.increment(2);

  expect(store.getState()).toEqual({ deep: {counter: 2} });
});

test('plain: should allow a reducer to be defined in different namespaces', () => {

  const counter = {
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
  };
  const builder = reducerBuilder.plain()
    .obj(counter, 'count1', 0)
    .obj(counter, 'count2', 42);

  const store = createStore(builder.buildReducer());
  const actions = builder.buildActions(store.dispatch);
  actions.count1.increment(2);
  actions.count2.decrement(12);

  expect(store.getState()).toEqual({ count1: 2, count2: 30 });
});

test('plain: should allow a reducer object to declare an initial state', () => {

  const counter = {
    initialState: 0,
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
  };
  const builder = reducerBuilder.plain()
    .obj(counter, 'count1')
    .obj(counter, 'count2', 42)
    .obj(counter, 'count3', -23);

  const initialState = {count3: 11};
  const store = createStore(builder.buildReducer(), initialState);
  const actions = builder.buildActions(store.dispatch);
  actions.count1.increment(2);
  actions.count2.decrement(12);

  expect(store.getState()).toEqual({ count1: 2, count2: 30, count3: 11 });
});

test('plain: should have a default state', () => {

  const greeter = {
    greet: (state, action) => ({...state, greeting: `Hi, ${action.payload}`})
  };
  const builder = reducerBuilder.plain()
    .obj(greeter, 'greeter');

  const store = createStore(builder.buildReducer());
  const actions = builder.buildActions(store.dispatch);
  actions.greeter.greet('Leonard');

  expect(store.getState()).toEqual({ greeter: {greeting: 'Hi, Leonard' }});
});