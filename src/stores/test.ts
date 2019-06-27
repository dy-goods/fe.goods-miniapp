import {
  observable,
  action,
  computed,
  runInAction,
  IObservableArray
} from "mobx";
import client, { request } from "./client";
import { route } from "@mtfe/wets-mobx";
import gql from "graphql-tag";

export type Topic = {
  title: string;
};

export default class Person {
  @observable
  random = Math.random();
  @observable
  topicList = [
    {
      title: "没有主题"
    }
  ] as IObservableArray<Topic>;
  @observable
  goodsList = [
    {
      videoUrl: "", // 视频链接
      stars: 0, // 点赞数
      shareCount: 0, // 分享数
      buyCount: 1111, // 购买数量
      price: 0, // 以分为单位
      title: "", // 标题
      imgUrl: "", // 图片链接
      tkl: "" // 淘口令
    }
  ] as IObservableArray<GOODS.IGoodsType>;
  // pageInfo: IPage = {
  //   pageNo: 1,
  //   pageSize: 10,
  //   totalCount: 0,
  //   totalPageCount: 1
  // };

  @computed
  get fullRandom() {
    return "帅帅的" + this.random;
  }

  @action
  changeRandom() {
    this.random = Math.random();
  }

  @action
  async getTopicList2(tab: string) {
    const query = {
      page: 1,
      limit: 10,
      tab
    };
    const urlOption = {
      protocol: "https",
      host: "cnodejs.org"
    };
    const pathname = "/api/v1/topics";
    const url = `${urlOption.protocol}://${urlOption.host}${pathname}`;
    const ret = await request(url, "GET", query);
    const topicList: Topic[] = ret.data.data;
    runInAction(() =>
      this.topicList.replace(
        topicList.map(item => ({
          title: item.title
        }))
      )
    );
  }

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
        // pageNo: this.pageInfo.pageNo,
        // pageSize: this.pageInfo.pageSize
        pageNo: 1,
        pageSize: 10
      }
    });
    const { items } = ret.goods;
    if (items && items.length) {
      runInAction(() => {
        this.goodsList.replace(items);
        // this.pageInfo = page;
      });
      return items;
    }
  }

  @action
  @route("/api/v1/topics", "GET")
  *getTopicList1(tab: string) {
    const query = {
      page: 1,
      limit: 10,
      tab
    };
    const ret = yield query;
    const topicList: Topic[] = ret.data;
    runInAction(() =>
      this.topicList.replace(
        topicList.map(item => ({
          title: item.title
        }))
      )
    );
  }
}
