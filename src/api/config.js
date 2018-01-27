/**
 * Created by zlk on 2018/1/3.
 */
// 模拟 qq音乐的请求接口
export const commonParams = {
  g_tk: 5381,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}

export const options = {
  param: 'jsonpCallback', // QQ音乐 jsonp约定的函数名
  prefix: 'jp'
}

// 大部分公司请求数据成功的返回 code 是0,自定义常量,其他方法判断的时候,直接指对比 ERR_OK,没有实际意义
export const ERR_OK = 0
