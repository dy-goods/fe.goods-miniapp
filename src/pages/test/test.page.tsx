import { Page } from '@mtfe/wets';

import './test.page.css';
import TestStore from '../../stores/test';
import { inject, observer } from '../../wets-mobx';

@Page.Conf({
  navigationBarTitleText: 'TestPage',
})
@inject('test')
@observer()
export class TestPage extends Page<any, {
  test: TestStore
}> {
  onLoad() {
    console.log(this.data.test);
  }
  test() {
    this.data.test.changeName('test');
  }
  render() {
    return (
      <view className="test-page">
        <text>{this.data.test.name}</text>
        <button bindtap={this.test}>changeName</button>
      </view>
    );
  }
}
