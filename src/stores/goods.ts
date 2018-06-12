import client from "./client";
import { observable, IObservableArray, action, runInAction } from "mobx";
import gql from "graphql-tag";

export default class GoodsStore {
  goodsList: IObservableArray<GOODS.IGoodsType> = observable([]);
  pageInfo: IPage = observable({
    pageNo: 1,
    pageSize: 10,
    totalCount: 0,
    totalPageCount: 1
  });
  @observable videoUrl = 'http://7xtj85.com1.z0.glb.clouddn.com/1527589552.mp4';
  currentGoods: GOODS.IGoodsType = observable({
    id: "",
    isDeleted: false,
    createdAt: 0,
    updatedAt: 0,
    videoUrl: "http://7xtj85.com1.z0.glb.clouddn.com/1527589552.mp4", // 视频链接
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
    labels: "", // 标签, eg好玩到爆，省事的气球车
  });

  @action
  setCurrentGoods() {
    if (this.goodsList && this.goodsList.length) {
      if (!this.currentGoods) {
        this._setGoods(this.goodsList[0]);
      } else {
        let index = this.goodsList.findIndex(
          goods => goods.id === this.currentGoods.id
        );
        index += 1;
        if (index === this.goodsList.length) {
          index = 0;
        }
        this._setGoods(this.goodsList[index]);
      }
    }
  }
  @action
  _setGoods(goods: GOODS.IGoodsType) {
    this.currentGoods.id = goods.id;
    this.currentGoods.isDeleted = goods.isDeleted;
    this.currentGoods.createdAt = goods.createdAt;
    this.currentGoods.updatedAt = goods.updatedAt;
    this.currentGoods.videoUrl = goods.videoUrl;
    this.videoUrl = goods.videoUrl;
    console.log(this.currentGoods.videoUrl);
  };

  @action
  async getGoodsList() {
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
        this.goodsList.replace(items);
        this.pageInfo.pageNo = page.pageNo;
        this.pageInfo.pageSize = page.pageSize;
        this.pageInfo.totalCount = page.pageSize;
        this.pageInfo.totalPageCount = page.totalPageCount;
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
  async updateGoods(input: GOODS.IUpdateInput) {
    const mutation = gql`
      mutation updateGoods($input: UpdateGoodsInput!) {
        updateGoods(input: $input)
      }
    `;
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
        const id = this.goodsList.findIndex(item => item.id === input.id);
        this.goodsList[id] = {
          ...this.goodsList[id],
          ...input
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
