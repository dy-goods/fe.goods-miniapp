import {
  observable,
  action,
  computed,
  runInAction,
  IObservableArray
} from 'mobx';
import { route } from '@mtfe/wets-mobx';

export type Topic = {
  title: string;
};

export default class Person {
  @observable random = Math.random();
  @observable topicList = [{
    title: '没有主题'
  }] as IObservableArray<Topic>;

  @computed
  get fullRandom() {
    return '帅帅的' + this.random;
  }  

  @action
  changeRandom() {
    this.random = Math.random();
  }

  @action
  @route('/api/v1/topics', 'GET')
  * getTopicList(tab: string) {
    const query = {
      page: 1,
      limit: 10,
      tab
    };
    const ret = yield query;
    const topicList: Topic[] = ret.data;
    runInAction(() =>
      this.topicList.replace(
        topicList.map(item => ({
          title: item.title
        }))
      )
    );
  }
}
