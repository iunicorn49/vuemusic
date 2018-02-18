/**
 * 利用 node 模拟服务端
 */

const express = require('express')
const config = require('./config/index')
const axios = require('axios')

var app = express()
//  创建后端代理
var apiRoutes = express.Router()
//  在getDiscList中,我们让自己的服务端去请求,而不是让浏览器去请求
apiRoutes.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then(response => {
    res.json(response.data)
  }).catch(e => {
    console.log(e)
  })
})
// 抓取歌词
apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/ // 可以捕获jsonp的callback中的字符串
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

apiRoutes.get('/getCdInfo', function (req, res) {
  var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({.+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

app.use('/api', apiRoutes)

app.use(express.static('./dist')) // dist目录为静态资源入口

// process.env.PORT 为环境端口, 如果没配置,就读取build中的端口
var port = process.env.PORT || config.build.port

module.export = app.listen(port, err => {
  if (err) {
    console.log(err)
    return
  }
  console.log(`服务开启成功, at port ${port}`)
})
