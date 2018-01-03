import Test from './test';
import { useStrict } from 'mobx';

useStrict(true);
const test = new Test();
const store = {
  test,
};

export default store;