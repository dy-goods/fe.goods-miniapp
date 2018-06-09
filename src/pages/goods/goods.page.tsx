import { Page } from "@mtfe/wets";
import { inject, observer } from "@mtfe/wets-mobx";

import "./goods.page.css";
import GoodsStore from "../../stores/goods";

interface IData {
  goodsStore: GoodsStore;
}

@Page.Conf({
  navigationBarTitleText: "GoodsPage"
})
@inject("goodsStore")
@observer()
export class GoodsPage extends Page<any, IData> {
  onLoad() {
    this.data.goodsStore.getGoodsList();
  }
  render() {
    return (
      <view className="goods-page">
        <text>Goods Page</text>
        <view className="goods-list">
          {this.data.goodsStore.goodsList.map((goods, index) => {
            return <view key={index}>{goods.title}</view>;
          })}
        </view>
      </view>
    );
  }
}
