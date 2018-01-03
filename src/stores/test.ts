import { observable, computed, action } from "mobx";
export default class Person {
  @observable name = "洛丹";

  @action
  changeName(name: string) {
    this.name = name;
  }
  
  @computed
  get fullName() {
    return "帅帅的" + this.name;
  }
}
