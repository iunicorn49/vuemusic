<template>
  <div class="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <div class="slider-content">
            <Slider ref="slider">
              <div v-for="item in recommends">
                <a :href="item.linkUrl">
                  <!-- fastclick不会拦截具有needsclick的元素, -->
                  <img class="needsclick" @load="loadImage" :src="item.picUrl">
                </a>
              </div>
            </Slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <!--  列表组件  -->
            <li v-for="item in discList" class="item">
              <div class="icon">
                <img width="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <Loading></Loading>
      </div>
    </Scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Loading from 'base/loading/loading'
  import Scroll from 'base/scroll/scroll'
  import Slider from 'base/slider/slider'
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  export default {
    data() {
      return {
        recommends: [], // 轮播图数据
        discList: [] // 歌单数据
      }
    },
    created() {
      this._getRecommend()
      this._getDiscList()
    }, // created end
    methods: {
      _getRecommend() { // 我们getRecommend封装的是一个Promise对象,所以可以从then方法拿到返回的数据
        getRecommend().then(res => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      }, // _getCommend end
      _getDiscList() {
        getDiscList().then(res => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },  // _discList end
      loadImage() {
        if (!this.checkLoaded) {
          this.checkLoaded = true
          setTimeout(() => {
            this.$refs.scroll.refresh()
          }, 20)
        }
      }  // loadImage end
    }, // methods end
    components: {
      Scroll,
      Slider,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        height: 0
        padding-top: 40%
        overflow: hidden
        .slider-content
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
