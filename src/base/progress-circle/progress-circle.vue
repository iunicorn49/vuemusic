<template>
  <div class="progress-circle">
    <!--
    r:半径;cx,cy:圆心坐标;viewBox:视口,这里就是从左上角开始,宽高100;
    stroke-dasharray:描边;stroke-dashoffset:描边偏移(进度);
    -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50"
              :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"
              fill="transparent"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      radius: {type: Number, default: 100},
      percent: {type: Number, default: 0}
    },
    data() {
      return {
        dashArray: Math.PI * 100
      }
    }, // data
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    } // computed
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
