import client from "./client";
import { observable, IObservableArray, action, runInAction } from "mobx";
import gql from "graphql-tag";

export default class GoodsStore {
  goodsList: IObservableArray<
    GOODS.IGoodsType & { isStared?: boolean }
  > = observable([]);
  @observable
  pageInfo: IPage = {
    pageNo: 1,
    pageSize: 10,
    totalCount: 0,
    totalPageCount: 1
  };
  @observable
  currentGoods: GOODS.IGoodsType = {
    id: "",
    isDeleted: false,
    createdAt: 0,
    updatedAt: 0,
    videoUrl: "http://7xtj85.com1.z0.glb.clouddn.com/LC1QBaNkPL0qjgK67n0@@ldregop.mp4", // 视频链接
    stars: 0, // 点赞数
    shareCount: 0, // 分享数
    buyCount: 0, // 购买数量
    price: 0, // 以分为单位
    title: "", // 标题
    imgUrl: "", // 图片链接
    tkl: "", // 淘口令

    recommends: "", // 推荐语
    taobaoPrice: 0, // 淘宝价格
    discount: 0, // 折扣
    labels: "" // 标签, eg好玩到爆，省事的气球车
  };
  @action
  changeCurrentGoods(gesture?: GESTURE) {
    let index = 0;
    if (this.goodsList && this.goodsList.length) {
      if (this.currentGoods) {
        index = this.goodsList.findIndex(
          goods => goods.id === this.currentGoods.id
        );
        if (gesture === GESTURE.UP) {
          index -= 1;
        }
        if (gesture === GESTURE.DOWN) {
          index += 1;
        }
        if (index === this.goodsList.length) {
          index = 0;
        }
        if (index === -1) {
          index = this.goodsList.length - 1;
        }
      }
    }
    const goods = this.goodsList[index];
    this.setCurrentGoods(goods);
  }
  @action
  setCurrentGoods(goods: GOODS.IGoodsType) {
    if (goods) {
      this.currentGoods = goods;
    } else if (this.goodsList && this.goodsList.length) {
      this.currentGoods = this.goodsList[0];
    }
  }
  @action
  setCurrentGoodsById(id?: string) {
    if (id && this.goodsList && this.goodsList.length) {
      const index = this.goodsList.findIndex(goods => goods.id === id);
      this.setCurrentGoods(this.goodsList[index]);
    } else {
      this.changeCurrentGoods();
    }
  }

  @action
  async getGoodsList(id?: string) {
    const query = gql`
      query goods($pageNo: Int, $pageSize: Int) {
        goods(pageNo: $pageNo, pageSize: $pageSize) {
          page {
            pageNo
            pageSize
            totalCount
            totalPageCount
          }
          items {
            id
            videoUrl
            stars
            shareCount
            buyCount
            price
            title
            imgUrl
            tkl
            poster
            recommends
            taobaoPrice
            discount
            labels
          }
        }
      }
    `;
    const ret = await client.query<{
      goods: GOODS.ISearchOutput;
    }>({
      query,
      variables: {
        pageNo: this.pageInfo.pageNo,
        pageSize: this.pageInfo.pageSize
      }
    });
    const { items, page } = ret.goods;
    if (items && items.length) {
      runInAction(() => {
        this.goodsList.replace(items.map(item => ({
          ...item,
          isStared: false,
        })));
        this.pageInfo = page;
      });
      return items;
    }
  }

  @action
  async deleteGoods(id: string) {
    const mutation = gql`
      mutation deleteGoods($id: String!) {
        deleteGoods(id: $id)
      }
    `;
    const ret = await client.mutate<{
      deleteGoods: boolean;
    }>({
      mutation,
      variables: {
        id
      }
    });
    if (ret && ret.deleteGoods) {
      runInAction(() => {
        const goods = this.goodsList.find(
          item => item.id === id
        ) as GOODS.IGoodsType;
        this.goodsList.remove(goods);
      });
      return true;
    }
  }

  @action
  async updateGoods(goods: GOODS.IGoodsType & {
    isStared?: boolean,
  }) {
    if (!goods.id) {
      return;
    }
    const mutation = gql`
      mutation updateGoods($input: UpdateGoodsInput!) {
        updateGoods(input: $input)
      }
    `;
    const input: GOODS.IUpdateInput = {
      id: goods.id,
      videoUrl: goods.videoUrl,
      stars: goods.stars,
      shareCount: goods.shareCount,
      buyCount: goods.buyCount,
      price: goods.price,
      title: goods.title,
      imgUrl: goods.imgUrl,
      tkl: goods.tkl,

      recommends: goods.recommends || "",
      taobaoPrice: goods.taobaoPrice || 0,
      discount: goods.discount || 0,
      labels: goods.labels || "",
    };
    const ret = await client.mutate<{
      updateGoods: boolean;
    }>({
      mutation,
      variables: {
        input
      }
    });
    if (ret && ret.updateGoods) {
      runInAction(() => {
        this.setCurrentGoods(goods);
        const id = this.goodsList.findIndex(item => item.id === input.id);
        this.goodsList[id] = {
          ...this.goodsList[id],
          ...input,
          isStared: goods.isStared,
        };
      });
      return true;
    }
  }

  @action
  async addGoos(input: GOODS.IAddInput) {
    const mutation = gql`
      mutation addGoods($input: AddGoodsInput!) {
        addGoods(input: $input) {
          id
        }
      }
    `;
    const ret = await client.mutate<{
      addGoods: GOODS.IAdOutput;
    }>({
      mutation,
      variables: {
        input
      }
    });
    if (ret && ret.addGoods) {
      runInAction(() => {
        this.goodsList.push({
          ...input,
          id: (ret as any).addGoods.id,
          isDeleted: false
        });
      });
      return true;
    }
  }

  @action
  selectPage(pageNo: number) {
    this.pageInfo.pageNo = pageNo;
    this.getGoodsList();
  }
}
