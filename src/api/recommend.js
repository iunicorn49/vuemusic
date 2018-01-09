/**
 * Created by zlk on 2018/1/3.
 * 抓取 推荐 数据
 */
import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config' // config 暴露了多个常量, 所以用 {}
import axios from 'axios'
//  获取轮播图数据
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

//  获取歌单数据
export function getDiscList() {
  const url = '/api/getDiscList'
  const data = Object.assign({}, commonParams, {
    // 下面的配置都是模拟 qq音乐接口的配置
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
