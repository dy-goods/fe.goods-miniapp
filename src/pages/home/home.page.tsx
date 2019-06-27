import { Page } from "@mtfe/wets";

import "./home.page.css";

@Page.Conf({
  navigationBarTitleText: "HomePage"
})
export class HomePage extends Page {
  showLoginPage() {
    wx.navigateTo({
      url: "test"
    });
  }
  render() {
    return (
      <view>
        <view>HomePage</view>
        <button bindtap={this.showLoginPage}>测试</button>
      </view>
    );
  }
}
