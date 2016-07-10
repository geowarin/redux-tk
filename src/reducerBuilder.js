import set from "lodash.set";
import get from "lodash.get";

function buildNamespace (namespace, name) {
  return namespace ? `${namespace}.${name}` : name;
}

function getNamespace(name) {
  const split = name.split('.');
  return split.length > 1 ? split.slice(0, -1).join('.') : undefined;
}

class reducerBuilder {

  constructor () {
    this.reducers = new Map();
  }

  static get () {
    return new reducerBuilder();
  }

  fun (reducerFunction, namespace) {
    if (!namespace) {
      throw new Error(`Cannot create reducer with ${namespace} namespace`);
    }
    this.reducers.set(namespace, reducerFunction);
    return this;
  }

  obj (reducerObj, namespace = undefined) {
    Object.keys(reducerObj).forEach(name => {
      this.fun(reducerObj[name], buildNamespace(namespace, name));
    });
    return this;
  }

  buildReducer () {
    return (state, action) => {

      const reducer = this.reducers.get(action.type);

      if (reducer) {
        const namespace = getNamespace(action.type);

        const stateForNamespace = namespace ? get(state, namespace) : state;
        const newState = reducer(stateForNamespace, action);
        if (!namespace) {
          return newState;
        }
        set(state, namespace, newState);
      }

      return state;
    };
  }

  buildActions (dispatch) {
    const actions = [];
    for (let namespace of this.reducers.keys()) {

      var boundAction = (payload) => {
        const action = payload => ({
          type: namespace,
          payload
        });
        dispatch(action(payload))
      };
      set(actions, namespace, boundAction);
    }
    return actions;
  }
}

export default reducerBuilder;