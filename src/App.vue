<template>
  <div id="app">
    <m-header></m-header>
  </div>
</template>

<script type="text/ecmascript-6">
  //  如果没有在 webpack.base.conf.js 配置别名的情况下,需要使用相对路径,这边已经配置过了 components === src/components
  import MHeader from 'components/m-header/m-header'
  export default {
    components: {
      MHeader //  挂载组件
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  #app
    color: $color-theme
</style>

