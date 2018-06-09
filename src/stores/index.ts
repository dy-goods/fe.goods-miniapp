import { useStrict } from 'mobx';
import Test from './test';
import Error from './error';
import Goods from './goods';

useStrict(true);
const store = {
  testStore: new Test(),
  errorStore: new Error(),
  goodsStore: new Goods(),
};

export default store;