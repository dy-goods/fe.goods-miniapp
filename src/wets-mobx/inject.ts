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
    pageData: {
      [key: string]: any;
    }
  ) => {
    storeNames.forEach(storeName => {
      if (storeName in pageData) return;
      if (!(storeName in baseStores))
        throw new Error(
          "MobX injector: Store '" +
            storeName +
            "' is not available! Make sure it is provided by some Provider"
        );
      pageData[storeName] = baseStores[storeName];
    });
    return pageData;
  };
}

export default function inject(
  ...args: any[] /* fn(stores, nextProps) or ...storeNames */
) {
  const grabStoresFn =
    typeof args[0] === "function" ? args[0] : grabStoresByName(args);
  return <T extends Constructor<Page>>(PageConstructor: T) =>
    createStoreInjector(grabStoresFn, PageConstructor);
}
