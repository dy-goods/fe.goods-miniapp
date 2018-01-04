import { Atom, Reaction, extras } from "mobx";
import { Constructor, isObjectShallowModified } from "./utils";
import { Page } from "@mtfe/wets";

const observer = () => <T extends Constructor<Page>>(PageConstructor: T) => {
  return class Observer extends PageConstructor {
    __$mobxIsUnmounted = false;
    reaction: Reaction;
    pageWillReceiveData?: () => void;

    onLoad() {
      let skipRender = false;
      let isForcingUpdate = false;
      const makePropertyObservableReference = (propName: string) => {
        let valueHolder = this[propName];
        const atom = new Atom(`${this.route}/${propName}`);
        Object.defineProperty(this, propName, {
          configurable: true,
          enumerable: true,
          get: function() {
            atom.reportObserved();
            return valueHolder;
          },
          set: function set(v) {
            if (!isForcingUpdate && isObjectShallowModified(valueHolder, v)) {
              valueHolder = v;
              skipRender = true;
              atom.reportChanged();
              skipRender = false;
            } else {
              valueHolder = v;
            }
          }
        });
      };

      makePropertyObservableReference("data");

      let isRenderingPending = false;
      this.reaction = new Reaction(`${this.route}/reaction`, () => {
        if (!isRenderingPending) {
          isRenderingPending = true;
          if (this.pageWillReceiveData) {
            this.pageWillReceiveData();
          }
          if (!this.__$mobxIsUnmounted) {
            let hasError = true;
            try {
              isForcingUpdate = true;
              if (!skipRender) {
                this.reaction.track(() => {
                  isRenderingPending = false;
                  extras.allowStateChanges(true, () => this.setData(this.data));
                });
              }
              hasError = false;
            } finally {
              isForcingUpdate = false;
              if (hasError) this.reaction.dispose();
            }
          }
        }
      });
      this.reaction.track(() => {
        isRenderingPending = false;
        extras.allowStateChanges(true, () => this.setData(this.data));
      });
      if (super["onLoad"]) {
        super["onLoad"]();
      }
    }
    onUnload() {
      this.reaction.dispose();
      this.__$mobxIsUnmounted = true;
      if (super["onUnload"]) {
        super["onUnload"]();
      }
    }
  };
};
export default observer;
