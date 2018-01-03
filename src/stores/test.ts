import { observable, computed, action } from "mobx";
export default class Person {
  @observable random = Math.random();

  @action
  changeRandom() {
    this.random = Math.random();
  }

  @computed
  get fullRandom() {
    return "帅帅的" + this.random;
  }
}
