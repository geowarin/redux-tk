import test from "ava";
import {createStore} from "redux";
import reducerBuilder from "../src/reducerBuilder";
import expect from "expect";

test('should create reducer from function', () => {

  const increment = (state, action) => state + 1;
  const builder = reducerBuilder.get()
    .fun(increment, 'inc');

  const store = createStore(builder.buildReducer(), 4);
  const actions = builder.buildActions(store.dispatch);
  actions.inc();

  expect(store.getState()).toEqual(5);
});

test('should create reducer from objects', () => {

  const increment = (state, action) => state + 1;
  const decrement = (state, action) => state - 1;
  const reducer = reducerBuilder.get()
    .obj({increment})
    .obj({decrement})
    .buildReducer();

  const store = createStore(reducer, 0);
  store.dispatch({type: 'increment'});
  store.dispatch({type: 'increment'});
  store.dispatch({type: 'decrement'});

  expect(store.getState()).toEqual(1);
});

test('should create actions', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.get()
    .obj({increment});

  const store = createStore(builder.buildReducer(), 0);
  const actions = builder.buildActions(store.dispatch);
  actions.increment(2);

  expect(store.getState()).toEqual(2);
});

test('should handle namespaces', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.get()
    .obj({increment}, 'counter');

  const store = createStore(builder.buildReducer(), {counter: 0});
  const actions = builder.buildActions(store.dispatch);
  actions.counter.increment(2);

  expect(store.getState().counter).toEqual(2);
});

test('should handle deep namespaces', () => {

  const increment = (state, action) => state + action.payload;
  const builder = reducerBuilder.get()
    .obj({increment}, 'deep.counter');

  const initialState = { deep: {counter: 0} };
  const store = createStore(builder.buildReducer(), initialState);
  const actions = builder.buildActions(store.dispatch);
  actions.deep.counter.increment(2);

  expect(store.getState()).toEqual({ deep: {counter: 2} });
});

test('should work', () => {

  const counter = {
    increment: (state, action) => state + action.payload,
    decrement: (state, action) => state - action.payload
  };
  const builder = reducerBuilder.get()
    .obj(counter, 'count1')
    .obj(counter, 'count2');

  const initialState = { count1: 0, count2: 42 };
  const store = createStore(builder.buildReducer(), initialState);
  const actions = builder.buildActions(store.dispatch);
  actions.count1.increment(2);
  actions.count2.decrement(12);

  expect(store.getState()).toEqual({ count1: 2, count2: 30 });
});