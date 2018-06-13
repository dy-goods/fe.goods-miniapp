import { App } from '@mtfe/wets';
import { Provider } from '@mtfe/wets-mobx';
import { route } from '@mtfe/wets-mobx';

import store from '../src/stores';

route.prototype.setUrlOption({
  protocol: 'https',
  host: 'cnodejs.org'
});

@App.Conf({
  window: {
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff',
    navigationStyle: 'custom',
  },
})
@Provider({
  store,
})
export class MyApp extends App {
  store: any;
}
