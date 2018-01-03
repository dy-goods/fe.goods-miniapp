import { Page } from "@mtfe/wets";
import { Constructor } from "./utils";

declare var getApp: () => {
  store: any;
};

/**
 * Store Injection
 */
const createStoreInjector = <T extends Constructor<Page>>(
  grabStoresFn: Function,
  PageConstructor: T
) =>
  class Injector extends PageConstructor {
    isMobxInjector = true;
    props: {
      [key: string]: any
    } = {};

    onLoad(options: { [key: string]: any }) {
      const app = getApp();
      if (!app.store) {
        throw new Error("Store对象不存在");
      }
      let data: {
        [key: string]: any;
      } = {};
      Object.assign(data, options);
      const additionalProps = grabStoresFn(app.store || {}, data) || {};
      Object.assign(data, additionalProps);
      Object.assign(this.props, additionalProps);
      this.setData(data);
      if (super["onLoad"]) {
        super["onLoad"](options);
      }
    }

    onUnload() {
      if (super["onUnload"]) {
        super["onUnload"]();
      }
    }
  };

function grabStoresByName(storeNames: string[]) {
  return (
    baseStores: {
      [key: string]: any;
    },
    nextProps: {
      [key: string]: any;
    }
  ) => {
    storeNames.forEach(storeName => {
      if (
        storeName in nextProps // prefer props over stores
      )
        return;
      if (!(storeName in baseStores))
        throw new Error(
          "MobX injector: Store '" +
            storeName +
            "' is not available! Make sure it is provided by some Provider"
        );
      nextProps[storeName] = baseStores[storeName];
    });
    return nextProps;
  };
}

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
export default function inject(
  ...args: any[] /* fn(stores, nextProps) or ...storeNames */
) {
  const storeNames: string[] = args;
  const grabStoresFn = grabStoresByName(storeNames);
  return <T extends Constructor<Page>>(PageConstructor: T) =>
    createStoreInjector(grabStoresFn, PageConstructor);
}
