import { DocumentNode } from "graphql";
import { print } from "graphql/language/printer";

import { Middleware, ComposedMiddleware } from "koa-compose";
import * as compose from "koa-compose";

export interface IRequestOption {
  headers: { [key: string]: string | number };
  url?: string;
}

export interface IRequest {
  options: IRequestOption;
  send(data: string): Promise<any>;
}

class Request implements IRequest {
  options: IRequestOption = {
    headers: {}
  };

  constructor(private readonly url: string) {}

  send(data: string) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.options.url || this.url,
        method: "POST",
        header: this.options.headers,
        data,
        success: (res: any) => {
          if (res.data.errors) {
            reject(res.data.errors);
          } else {
            resolve(res.data.data);
          }
        },
        fail: reject
      });
    });
  }
}

export interface INetworkInterfaceOption {
  url: string;
}

export interface INetworkInterface {
  use(fn: Middleware<IRequest>): any;
  send(data: string): Promise<any>;
}

class NetworkInterface implements INetworkInterface {
  private middlewares: Array<Middleware<IRequest>> = [];
  private fn: ComposedMiddleware<IRequest>;

  constructor(private readonly options: INetworkInterfaceOption) {}

  use(fn: Middleware<IRequest>) {
    this.middlewares.push(fn);
  }

  send(data: string) {
    if (!this.fn) {
      this.fn = compose(this.middlewares);
    }
    const req = new Request(this.options.url);
    return this.fn(req).then(() => req.send(data));
  }
}

export const createNetworkInterface = (
  options: INetworkInterfaceOption
): INetworkInterface => new NetworkInterface(options);

export interface IClientOption {
  networkInterface: INetworkInterface;
}

export class Client {
  constructor(private readonly options: IClientOption) {}

  mutate<T>(req: {
    mutation: DocumentNode;
    variables: { [key: string]: any };
  }) {
    return this.query<T>({
      query: req.mutation,
      variables: req.variables
    });
  }

  query<T>(req: { query: DocumentNode; variables: { [key: string]: any } }) {
    const query = print(req.query);
    return this.options.networkInterface.send(
      JSON.stringify({
        query,
        variables: req.variables || {}
      })
    ) as Promise<T>;
  }
}

const networkInterface = createNetworkInterface({
  url: "https://www.53zi.com/graphql"
});

const client = new Client({
  networkInterface
});

export default client;
