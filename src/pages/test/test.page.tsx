import { Page } from "@mtfe/wets";

import "./test.page.css";

interface IData {
  recordFilePath: string;
  result: string
}

@Page.Conf({
  navigationBarTitleText: "TestPage"
})
export class TestPage extends Page<any, IData> {
  initialData = {
    recordFilePath: '',
    result: '',
  };

  uploadRecordFile(res?: { tempFilePath: string }) {
    if (!res) {
      return;
    }
    const recordFilePath = res.tempFilePath;
    this.setData({
      recordFilePath
    });
    console.log(recordFilePath);
    wx.uploadFile({
      url: "https://05e.fe.dev.sankuai.com/v1/aiui/v1/iat", //仅为示例，非真实的接口地址
      filePath: recordFilePath,
      name: "record",
      success: (res) => {
        console.log(res);
        const data = JSON.parse(res.data);
        let result = '';
        if (data.code === '00000') {
          result = data.data.result;
        } else {
          result = data.desc;
        }
        this.setData({
          result
        });
      }
    });
  }
  onLoad() {
    wx.setEnableDebug({
      enableDebug: true
    });
  }
  async startRecord() {
    console.log("recorder start");
    wx.startRecord({
      success: this.uploadRecordFile,
      fail(res) {
        console.error(res);
      }
    });
  }
  stopRecord() {
    console.log("recorder stop");
    wx.stopRecord();
  }
  render() {
    return (
      <view
        className="test-page"
        bindtouchstart={this.startRecord}
        bindtouchend={this.stopRecord}
      >
        <button type="primary">按住这个按钮开始录音，松开结束</button>
        <view className="result">识别结果: {this.data.result || '未能正确识别'}</view>
      </view>
    );
  }
}
