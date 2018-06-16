import { Page } from "@mtfe/wets";
import { inject, observer } from "@mtfe/wets-mobx";

import "./goods.page.css";
import GoodsStore from "../../stores/goods";

interface IData {
  goodsStore: GoodsStore;
  screenHeight: number;
  screenWidth: number;
  currentGesture: GESTURE;
  // 手势标示
  isSatred: boolean;
  isShared: boolean;
  price: string;
  taobaoPrice: string;
  isPlaying: boolean;
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
  lastX: number;
  lastY: number;
  currentGesture: GESTURE;
  startX: number;
  startY: number;
  clickCount: number = 0;
  timer: any;
  onLoad(options: any) {
    this.videoCtx = wx.createVideoContext("video-container");
    // this.videoCtx.requestFullScreen(0);
    const rect = wx.getSystemInfoSync();
    this.setData({
      screenWidth: rect.screenWidth,
      screenHeight: rect.screenHeight,
      isSatred: false,
      isShared: false,
      isPlaying: true
    });
    // screenWidth	屏幕宽度, windowWidth	可使用窗口宽度
    this.init();
    this.props.goodsStore.getGoodsList().then(() => {
      this.props.goodsStore.setCurrentGoodsById((options && options.id) || "");
      this.setData({
        isSatred: this.getIsStared()
      });
    });
  }

  init() {
    const ctx = wx.createCanvasContext("my-canvas");
    ctx.setFillStyle("transparent");
    ctx.fillRect(0, 0, this.data.screenWidth, this.data.screenHeight);
    ctx.draw();
  }

  togglePlay() {
    if (this.data.isPlaying) {
      this.videoCtx.pause();
    } else {
      this.videoCtx.play();
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    });
  }
  handleTouchMove(event: any) {
    if ((event.target.target || event.target.id) !== "my-canvas") {
      return;
    }
    if (this.currentGesture !== GESTURE.NONE) {
      return;
    }
    let currentX = (event.touches[0] as any).x;
    let currentY = (event.touches[0] as any).y;
    let tx = currentX - this.lastX;
    let ty = currentY - this.lastY;
    //左右方向滑动
    this.clickCount = 2;
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        this.currentGesture = GESTURE.LEFT;
      } else if (tx > 0) {
        this.currentGesture = GESTURE.RIGHT;
      }
    }
    //上下方向滑动
    else {
      if (ty < 0) {
        this.currentGesture = GESTURE.UP;
      } else if (ty > 0) {
        this.currentGesture = GESTURE.DOWN;
      }
    }

    //将当前坐标进行保存以进行下一次计算
    this.lastX = currentX;
    this.lastY = currentY;
  }
  getIsStared() {
    const id = this.data.goodsStore.currentGoods.id;
    const goods = this.data.goodsStore.goodsList.find(item => item.id === id);
    const isSatred = goods ? goods.isStared : false;
    return isSatred;
  }

  handleTouchStart(event: any) {
    if ((event.target.target || event.target.id) !== "my-canvas") {
      return;
    }
    this.lastX = (event.touches[0] as any).x;
    this.lastY = (event.touches[0] as any).y;
    this.startX = (event.touches[0] as any).x;
    this.startY = (event.touches[0] as any).y;
  }
  onShow() {
    this.setData({
      isPlaying: false
    });
  }
  onReady() {
    this.setData({
      isPlaying: true
    });
  }
  handleTouchEnd(event: any) {
    if ((event.target.target || event.target.id) !== "my-canvas") {
      return;
    }
    if ([GESTURE.UP, GESTURE.DOWN].includes(this.currentGesture)) {
      this.setData({
        isSatred: this.getIsStared(),
        isShared: false,
        isPlaying: true
      });
      switch (this.currentGesture) {
        case GESTURE.UP:
          this.props.goodsStore.changeCurrentGoods(GESTURE.UP);
          break;
        case GESTURE.DOWN:
          this.props.goodsStore.changeCurrentGoods(GESTURE.DOWN);
          break;
        default:
          break;
      }
    }
    this.currentGesture = GESTURE.NONE;
    this.clickCount++;
    if (this.clickCount > 2) {
      this.clickCount = 0;
      return;
    }
    const endX = ((event.touches[0] || event.changedTouches[0]) as any).x;
    const endY = ((event.touches[0] || event.changedTouches[0]) as any).y;
    if (Math.abs(this.startX - endX) < 2 && Math.abs(this.startY - endY) < 2) {
      if (this.clickCount === 1) {
        this.timer = setTimeout(() => {
          this.togglePlay();
          this.clickCount = 0;
        }, 200);
      } else if (this.clickCount === 2) {
        clearTimeout(this.timer);
        this.star(true);
        this.clickCount = 0;
      }
    }
  }
  star(isSatred?: any) {
    this.setData(
      {
        isSatred: typeof isSatred === "boolean" ? isSatred : !this.data.isSatred
      },
      () =>
        wx.showToast({
          title: `${
            this.data.isSatred
              ? "么么哒，双击666❤️❤️❤️"
              : "么么哒，不开森💔💔💔"
          }`,
          icon: "none"
        } as any)
    );
    const { stars } = this.data.goodsStore.currentGoods;
    this.props.goodsStore.updateGoods({
      ...this.data.goodsStore.currentGoods,
      stars: this.data.isSatred ? stars + 1 : stars - 1,
      isStared: this.data.isSatred
    });
  }
  share() {
    wx.showToast({
      title: "么么哒，喜欢请点右上方的转发按钮哦 😊😊😊",
      icon: "none",
      duration: 3000
    } as any);
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
      content: "么么哒，淘口令已复制，可以打开淘宝购买了哦 😊😊😊",
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
    const { title, imgUrl, id, poster } = this.data.goodsStore.currentGoods;
    return {
      title,
      path: `/pages/goods?id=${id}`,
      imageUrl: poster || imgUrl
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
          poster={currentGoods.poster || currentGoods.imgUrl}
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
          <cover-view className="play" catchtap={this.togglePlay}>
            {!this.data.isPlaying && (
              <cover-image src={require("../../asset/img/play.png")} />
            )}
          </cover-view>
          {!!this.data.goodsStore.currentGoods.taobaoPrice && (
            <cover-view className="hint-area">
              <cover-view className="star" catchtap={this.star}>
                {this.data.isSatred ? (
                  <cover-image
                    className="img"
                    src={require("../../asset/img/star_active.png")}
                  />
                ) : (
                  <cover-image
                    className="img"
                    src={require("../../asset/img/star.png")}
                  />
                )}
                <cover-view className="count">
                  {currentGoods.stars}人喜欢
                </cover-view>
              </cover-view>
              <cover-view className="share" catchtap={this.share}>
                {this.data.isShared ? (
                  <cover-image
                    className="img"
                    src={require("../../asset/img/share_active.png")}
                  />
                ) : (
                  <cover-image
                    className="img"
                    src={require("../../asset/img/share.png")}
                  />
                )}
                <cover-view className="count">
                  {currentGoods.shareCount}人分享
                </cover-view>
              </cover-view>
            </cover-view>
          )}
          {!!this.data.goodsStore.currentGoods.taobaoPrice && (
            <cover-view className="footer">
              <cover-view className="recommond">
                {currentGoods.recommends || ""}
              </cover-view>
              <cover-view className="footer-main">
                <cover-image className="left" src={currentGoods.imgUrl} />
                <cover-view className="middle">
                  <cover-view className="title">
                    {currentGoods.title}
                  </cover-view>
                  <cover-view className="price">
                    ￥{currentGoods.price / 100}
                  </cover-view>
                </cover-view>
                <cover-view className="right">
                  <cover-view className="buy-btn" catchtap={this.buy}>
                    立即购买
                  </cover-view>
                  <cover-view className="buy-count">
                    {currentGoods.buyCount || 0}人已购买
                  </cover-view>
                </cover-view>
              </cover-view>
            </cover-view>
          )}
        </canvas>
      </view>
    );
  }
}
