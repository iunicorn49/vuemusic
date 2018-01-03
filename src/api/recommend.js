/**
 * Created by zlk on 2018/1/3.
 * 抓取 推荐 数据
 */
import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config' // config 暴露了多个常量, 所以用 {}
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, {
    // 下面的配置都是模拟 qq音乐接口的配置
    platform: 'h5',
    uin: 0,
    meedNewCode: 1
  })
  return jsonp(url, data, options)
}
