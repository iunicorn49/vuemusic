<template>
  <div class="search-list" v-show="searches.length">
    <ul>
      <li class="search-item"
          @click="selectItem(item)"
          v-for="item in searches">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      searches: {type: Array, default: []}
    },
    methods: {
      // 这是一个基础组件,不需要处理复杂的业务逻辑
      // 当这个组件某个地方触发的时候,只需要告诉外部组件,我被点击的是什么即可
      // 具体逻辑在外部组件处理,有可能每个外部组件处理的逻辑不一样
      selectItem(item) {
        this.$emit('select', item)
      },
      deleteOne(item) {
        this.$emit('delete', item)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
