import { App }from '@mtfe/wets';
import { Constructor } from './utils';

export interface ProviderOption {
  store: {
    [key: string]: any;
  };
}

export default function Provider(options: ProviderOption) {
  return <T extends Constructor<App>>(AppConstructor: T) => {
    const { store } = options;
    return class MobxProvider extends AppConstructor {
      store = store;
    };
  };
}