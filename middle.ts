// redux的tsd文件
import { Dispatch, Middleware as ReduxMiddleware } from 'redux';

interface Subscribe {
  [key:string]:<T>({dispatch:Dispatch}) => Promise<T>;
}

interface PromiseReducer {
  namespace:string;
  effects:{
    [key:string]:({getState, dispatch:Dispatch}, action:any) => Promise<any>,
  };
}

interface PromiseMiddleware {
  subscribe:Subscribe;
  dispatch:Dispatch<any>;
  getState:any;
  add_model(model:PromiseReducer) : this;
}

class Middleware implements PromiseMiddleware {
  subscribe = {};
  dispatch;
  getState;
  add_model = (model:PromiseReducer) => {
    if (!this.dispatch || !this.getState) {
      throw new Error('需要在把redux_middleware加入redux之后才可以调用该函数');
    }
    const namespace = model.namespace;
    const keys = Object.keys(model.effects);
    keys.map((key) => {
      const k = `${namespace}/${key}`;
      this.subscribe[k] = model.effects[key].bind(null, {dispatch: this.dispatch, getState: this.getState});
    });
    return this;
  }
}

export const middleware = new Middleware();

export const redux_middleware:ReduxMiddleware = function({getState, dispatch}) {
  middleware.dispatch = dispatch;
  middleware.getState = getState;
  return function (next) {
    return function (action) {
      const res = next(action);
      const effect = middleware.subscribe[action.type];
      if (effect) {
        return effect(action);
      }
      return res;
    };
  };
};

export const self_dispatch = <T>(type:string, payload?) : Promise<T> => {
  if (!middleware.dispatch) {
    throw new Error('dispatch不存在，需要在redux初始化的时候加入promisemiddleware');
  }
  return middleware.dispatch({type, payload});
};