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
  isSatred: boolean;
  isShared: boolean;
  price: string;
  taobaoPrice: string;
}

interface IProps {
  goodsStore: GoodsStore;
}

@Page.Conf({
  navigationBarTitleText: "抖友好物说",
  disableScroll: true
  // enablePullDownRefresh: true
})
@inject("goodsStore")
@observer()
export class GoodsPage extends Page<IProps, IData> {
  videoCtx: any;
  lastX: 0;
  lastY: 0;
  currentGesture: GESTURE.NONE;
  onLoad(options: any) {
    this.videoCtx = wx.createVideoContext("video-container");
    // this.videoCtx.requestFullScreen(0);
    const rect = wx.getSystemInfoSync();
    this.setData({
      screenWidth: rect.screenWidth,
      screenHeight: rect.screenHeight,
      isSatred: false,
      isShared: false
    });
    // screenWidth	屏幕宽度, windowWidth	可使用窗口宽度
    this.init();
    this.props.goodsStore
      .getGoodsList()
      .then(() =>
        this.props.goodsStore.setCurrentGoodsById((options && options.id) || "")
      );
  }

  init() {
    const ctx = wx.createCanvasContext("my-canvas");
    ctx.setFillStyle("transparent");
    ctx.fillRect(0, 0, this.data.screenWidth, this.data.screenHeight);
    ctx.draw();
  }

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
        this.props.goodsStore.changeCurrentGoods(GESTURE.UP);
        this.data.currentGesture = GESTURE.UP;
      } else if (ty > 0) {
        this.data.currentGesture = GESTURE.DOWN;
        this.props.goodsStore.changeCurrentGoods(GESTURE.DOWN);
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
  star() {
    this.setData({
      isSatred: !this.data.isSatred
    });
    const { stars } = this.data.goodsStore.currentGoods;
    this.props.goodsStore.updateGoods({
      ...this.data.goodsStore.currentGoods,
      stars: this.data.isSatred ? stars + 1 : stars - 1
    });
  }
  share() {
    // wx.showShareMenu({
    //   withShareTicket: true,
    // });
    const { shareCount } = this.data.goodsStore.currentGoods;
    this.props.goodsStore.updateGoods({
      ...this.data.goodsStore.currentGoods,
      shareCount: shareCount + 1
    });
  }
  buy() {
    wx.setClipboardData({
      data: this.data.goodsStore.currentGoods.tkl
    });
    wx.showModal({
      title: "立即购买",
      content: "淘口令复制成功,请打开淘宝完成购买",
      showCancel: false,
      success: res => {
        if (res.confirm) {
          const { buyCount } = this.data.goodsStore.currentGoods;
          this.props.goodsStore.updateGoods({
            ...this.data.goodsStore.currentGoods,
            buyCount: buyCount + 1
          });
        }
      }
    });
  }
  onShareAppMessage() {
    const { title, imgUrl, id } = this.data.goodsStore.currentGoods;
    return {
      title,
      path: `/page/goods?id=${id}`,
      imageUrl: imgUrl
    };
  }
  render() {
    const currentGoods = this.data.goodsStore.currentGoods;
    return (
      <view
        className="goods-page"
        style={`width:${this.data.screenWidth}px;height:${
          this.data.screenHeight
        }px`}
      >
        <video
          id="video-container"
          src={currentGoods.videoUrl}
          controls={false}
          poster="https://p1.pstatp.com/large/8aa1000cf24688239d46.jpg"
          show-play-btn={false}
          show-center-play-btn={true}
          autoplay={true}
          loop={true}
          direction={0}
          objectFit="contain"
          event-model="bubble"
        />
        <canvas
          id="my-canvas"
          canvas-id="my-canvas"
          bindtouchstart={this.handleTouchStart}
          bindtouchmove={this.handleTouchMove}
          bindtouchend={this.handleTouchEnd}
        >
          <cover-view className="hint-area">
            <cover-view className="star" bindtap={this.star}>
              <cover-image
                className={`${this.data.isSatred ? "active" : "img"}`}
                src=""
              />
              <cover-view className="count">{currentGoods.stars}</cover-view>
            </cover-view>
            <cover-view className="share" bindtap={this.share}>
              <button open-type="share" className={`${this.data.isShared ? "active" : "img"}`} />
              <cover-view className="count">
                {currentGoods.shareCount}
              </cover-view>
            </cover-view>
          </cover-view>
          <cover-view className="footer">
            <cover-view className="recommond">
              {currentGoods.recommends || ""}
            </cover-view>
            <cover-view className="footer-main">
              <cover-image className="left" src={currentGoods.imgUrl} />
              <cover-view className="middle">
                <cover-view className="title">{currentGoods.title}</cover-view>
                <cover-view className="price">
                  ￥{currentGoods.price / 100}
                </cover-view>
              </cover-view>
              <cover-view className="right">
                <cover-view className="buy-btn" bindtap={this.buy}>
                  立即购买
                </cover-view>
                <cover-view className="buy-count">
                  {currentGoods.buyCount || 0}人已购买
                </cover-view>
              </cover-view>
            </cover-view>
          </cover-view>
        </canvas>
      </view>
    );
  }
}
