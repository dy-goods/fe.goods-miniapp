import { App } from '@mtfe/wets';
import { Provider } from '@mtfe/wets-mobx';
import store from '../src/stores';

@App.Conf({
  window: {
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff',
  },
})
@Provider({
  store,
})
export class MyApp extends App {
  store: any;
}
