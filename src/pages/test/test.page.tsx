import { Page } from '@mtfe/wets';

import './test.page.css';
import TestStore from '../../stores/test';
import { inject, observer } from '../../wets-mobx';
import { autorun } from 'mobx';

@Page.Conf({
  navigationBarTitleText: 'TestPage',
})
@inject('test')
@observer()
export class TestPage extends Page<any, {
  test: TestStore,
  fullRandom: string
}> {
  onLoad() {
    console.log(this.data);
    autorun(() => this.setData({
      fullRandom: this.data.test.fullRandom
    }));
  }
  test() {
    this.data.test.changeRandom();
  }
  render() {
    return (
      <view className="test-page">
        <text>{this.data.fullRandom}</text>
        <button bindtap={this.test}>changeRandom</button>
      </view>
    );
  }
}
