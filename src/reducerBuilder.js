import set from "lodash.set";

function buildNamespace (namespace, name) {
  return namespace ? `${namespace}.${name}` : name;
}

function getPath (name) {
  const split = name.split('.');
  return split.length > 1 ? split.slice(0, -1).join('.') : undefined;
}

class reducerBuilder {

  constructor (strategy) {
    this.reducers = new Map();
    this.initialStates = new Map();
    this.strategy = strategy;
  }

  static plain () {
    return new reducerBuilder(require('./plain').default);
  }

  static immutable () {
    return new reducerBuilder(require('./immutable').default);
  }

  fun (reducerFunction, namespace) {
    if (namespace == null) {
      throw new Error(`Cannot create reducer with ${namespace} namespace`);
    }
    this.reducers.set(namespace, reducerFunction);
    return this;
  }
  
  initialState(namespace, initialState) {
    if (initialState !== undefined) {
      this.initialStates.set(namespace, initialState);
    }
    return this;
  }

  obj (reducerObj, namespace = undefined, initialState = undefined) {
    Object.keys(reducerObj).forEach(name => {
      if (name !== 'initialState') {
        this.reducers.set(buildNamespace(namespace, name), reducerObj[name]);
      }
    });

    if (initialState !== undefined) {
      this.initialStates.set(namespace, initialState);
    } else if (reducerObj.initialState !== undefined) {
      this.initialStates.set(namespace, reducerObj.initialState);
    } else {
      this.initialStates.set(namespace, this.strategy.initialState());
    }
    return this;
  }

  buildReducer () {
    return (state = this.strategy.initialState(), action) => {

      const reducer = this.reducers.get(action.type);

      if (reducer) {
        const actionPath = getPath(action.type);

        const stateForNamespace = this.getInitialState(state, actionPath);
        const newState = reducer(stateForNamespace, action);
        if (!actionPath) {
          return newState;
        }
        state = this.strategy.setter(state, actionPath, newState);
      }

      return state;
    };
  }

  getInitialState (state, path) {
    if (!path) {
      return state;
    }
    const stateForNamespace = this.strategy.getter(state, path);
    return stateForNamespace !== undefined ? stateForNamespace : this.initialStates.get(path);
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