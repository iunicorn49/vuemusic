# vue-music

## 依赖

### -S

####babel-runtime

对 ES 语法进行转译

####fastclick

解决移动端 300ms 延迟

### -D

#### bable-polyfill

对 ES6 的API 进行转译

## JSONP

在发送请求之前, 先在 window 注册一个方法, 通过 script标签的src属性, 传输到服务器, 可以跨域抓取数据.

地址: https://github.com/webmodules/jsonp

```javascript
jsonp(url, opts, fn)
```

opts 是一个对象

- param: 参数
- timeout: 最长等待时间