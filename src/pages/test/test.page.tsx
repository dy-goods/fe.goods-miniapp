import { Page } from '@mtfe/wets';
import { inject, observer, autorun } from '@mtfe/wets-mobx';

import './test.page.css';
import TestStore from '../../stores/test';

interface IData {
  testStore: TestStore;
  fullRandom: string;
  tabIndex: number;
  tabArray: string[];
}

interface IProps {
  testStore: TestStore;
} 

@Page.Conf({
  navigationBarTitleText: 'TestPage'
})
@inject('testStore')
@observer()
export class TestPage extends Page<IProps, IData> {
  onLoad() {
    this.setData({
      tabIndex: 0,
      tabArray: ['ask', 'share', 'job', 'good']
    });
    autorun(() =>
      this.setData({
        fullRandom: this.props.testStore.fullRandom
      })
    );
  }

  test() {
    this.props.testStore.changeRandom();
  }

  getTopicList() {
    this.props.testStore.getTopicList1(this.data.tabArray[this.data.tabIndex]);
  }

  bindPickerChange(e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      tabIndex: e.detail.value
    });
  }

  render() {
    return (
      <view className='test-page'>
        <text>{this.data.fullRandom}</text>
        <button bindtap={this.test}>changeRandom</button>
        <view className='section'>
          <view className='section__title'>tab选择器</view>
          <picker
            mode='selector'
            bindchange={this.bindPickerChange}
            value={this.data.tabIndex}
            range={this.data.tabArray}
          >
            <view className='picker'>
              当前选择: {this.data.tabArray[this.data.tabIndex]}
            </view>
          </picker>
        </view>
        <button bindtap={this.getTopicList}>get topic list</button>
        <view className='topicList'>
          {this.data.testStore.topicList.map((topic, index) => {
            return (
              <view key={index}>
                {index}: {topic.title}
              </view>
            );
          })}
        </view>
      </view>
    );
  }
}
