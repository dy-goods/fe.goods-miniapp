import { useStrict } from 'mobx';
import Test from './test';

useStrict(true);
const test = new Test();
const store = {
  test,
};

export default store;