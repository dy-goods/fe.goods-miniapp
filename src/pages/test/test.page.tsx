import { Page } from "@mtfe/wets";

import "./test.page.css";

interface IData {
  recordFilePath: string;
  result: string;
  question: string;
}

@Page.Conf({
  navigationBarTitleText: "TestPage"
})
export class TestPage extends Page<any, IData> {
  initialData = {
    recordFilePath: '',
    result: '',
    question: ''
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
      url: "http://192.168.0.102:8080/v1/aiui/v1/voice_semantic", //仅为示例，非真实的接口地址
      filePath: recordFilePath,
      name: "record",
      success: (res) => {
        console.log(res);
        const data = JSON.parse(res.data);
        let result = '';
        let question = '';
        if (data.code === '00000') {
          result = data.data.answer ? data.data.answer.text : data.data.result;
        } else {
          result = data.desc;
        }
        question = data.data.text;
        this.setData({
          result,
          question,
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
        <button type="primary">按住开始录音，松开结束</button>
        <view className="result">你的提问: {this.data.question || '请开始你的表演'}</view>
        <view className="result">识别结果: {this.data.result || '识别结果为空'}</view>
      </view>
    );
  }
}
