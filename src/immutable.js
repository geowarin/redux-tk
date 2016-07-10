import {Map} from 'immutable';

export default {
  getter(obj, path) {
    return obj.getIn(path.split('.'))
  },
  setter(obj, path, value) {
    return obj.setIn(path.split('.'), value)
  },
  initialState: () => Map()
}