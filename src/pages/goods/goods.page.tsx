import { Page } from "@mtfe/wets";
import { inject, observer } from "@mtfe/wets-mobx";

import "./goods.page.css";
import GoodsStore from "../../stores/goods";

interface IData {
  goodsStore: GoodsStore;
  screenHeight: number;
  screenWidth: number;
  lastX: number;
  lastY: number;
  currentGesture: GESTURE;
  // 手势标示
}

interface IProps {
  goodsStore: GoodsStore;
}

@Page.Conf({
  navigationBarTitleText: "GoodsPage",
  disableScroll: true,
  // enablePullDownRefresh: true
})
@inject("goodsStore")
@observer()
export class GoodsPage extends Page<IProps, IData> {
  videoCtx: any;
  lastX: 0;
  lastY: 0;
  currentGesture: GESTURE.NONE;
  onLoad() {
    this.videoCtx = wx.createVideoContext("video-container");
    // this.videoCtx.requestFullScreen(0);
    const rect = wx.getSystemInfoSync();
    this.setData({
      screenWidth: rect.screenWidth,
      screenHeight: rect.screenHeight,
    });
    // screenWidth	屏幕宽度, windowWidth	可使用窗口宽度
    this.test();
    this.props.goodsStore.getGoodsList();
  }


  test() {
    const ctx = wx.createCanvasContext("my-canvas");
    ctx.setFillStyle("transparent");
    ctx.fillRect(0, 0, this.data.screenWidth, this.data.screenHeight);
    ctx.draw();
  }

  // onPullDownRefresh() {
  //   console.log("11111");
  // }
  play() {
    this.videoCtx.play();
  }
  pause() {
    this.videoCtx.pause();
  }
  handleTouchMove(event: any) {
    if (this.data.currentGesture != GESTURE.NONE) {
      return;
    }
    let currentX = (event.touches[0] as any).x;
    let currentY = (event.touches[0] as any).y;
    let tx = currentX - this.data.lastX;
    let ty = currentY - this.data.lastY;
    //左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        this.data.currentGesture = GESTURE.LEFT;
      } else if (tx > 0) {
        this.data.currentGesture = GESTURE.RIGHT;
      }
    }
    //上下方向滑动
    else {
      if (ty < 0) {
        this.props.goodsStore.setCurrentGoods();
        this.data.currentGesture = GESTURE.UP;
      } else if (ty > 0) {
        this.data.currentGesture = GESTURE.DOWN;
        this.props.goodsStore.setCurrentGoods();
      }
    }

    //将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX;
    this.data.lastY = currentY;
  }

  handleTouchStart(event: any) {
    this.data.lastX = (event.touches[0] as any).x;
    this.data.lastY = (event.touches[0] as any).y;
  }
  handleTouchEnd(event: any) {
    this.data.currentGesture = GESTURE.NONE;
  }
  render() {
    return (
      <view
        className="goods-page"
        style={`width:${this.data.screenWidth}px;height:${
          this.data.screenHeight
        }px`}
      >
        <view className="test">{this.data.goodsStore.currentGoods.videoUrl}</view>
        {/* <video
          id="video-container"
          src={this.data.goodsStore.currentGoods.videoUrl}
          controls={false}
          show-play-btn={false}
          show-center-play-btn={true}
          autoplay={true}
          loop={true}
          direction={0}
          objectFit="contain"
          event-model="bubble"
        /> */}
        <canvas
          id="my-canvas"
          canvas-id="my-canvas"
          bindtouchstart={this.handleTouchStart}
          bindtouchmove={this.handleTouchMove}
          bindtouchend={this.handleTouchEnd}
        >
          {/* <cover-view className="controls">
            <cover-view className="play" bindtap={this.play}>
              <cover-image className="img" src="/path/to/icon_play" />
            </cover-view>
            <cover-view className="pause" bindtap={this.pause}>
              <cover-image className="img" src="/path/to/icon_pause" />
            </cover-view>
            <cover-view className="time">00:00</cover-view>
          </cover-view> */}
        </canvas>

        {/* <view className="goods-list">
          {this.data.goodsStore.goodsList.map((goods, index) => {
            return (
              <view key={index}>
                <view>{goods.title}</view>
                <video
                  id="myVideo"
                  src={goods.videoUrl}
                  enable-danmu={true}
                  danmu-btn={true}
                  controls={true}
                />
              </view>
            );
          })}
        </view> */}
      </view>
    );
  }
}
