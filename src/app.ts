import { App } from '@mtfe/wets';
import { Provider, Client, createNetworkInterface } from '@mtfe/wets-graphql';

const networkInterface = createNetworkInterface({
  url: '127.0.0.1:8080',
});
const client = new Client({
  networkInterface,
});
const store: any = null;

@App.Conf({
  window: {
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff',
  },
})
@Provider({
  client,
  store,
})
export class MyApp extends App {
}
