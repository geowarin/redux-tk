import set from 'lodash.set';
import get from 'lodash.get';

export default {
  getter(obj, path) {
    return get(obj, path)
  },
  setter(obj, path, value) {
    return set(obj, path, value)
  }
}