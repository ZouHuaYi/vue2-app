<template>
  <div class="loading-box" v-show="show">
    <div class="loading">
      <div class="loading-con"></div>
      <div class="title">{{text}}</div>
    </div>
  </div>
</template>

<script>
export default {
    props:{
        text:{
            type:String,
            default:'正在加载'
        },
        show:{
            type:Boolean,
            default:false
        }
    }
}
</script>

<style lang="less" scoped>
.loading-box {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 10001;
}
.mak-box {
  width: 100%;
}
.loading {
  width: 200px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px 12px;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 50px 20px 40px;
  .loading-con {
    width: 100%;
    height: 50px;
    background-image: url(../assets/loading.svg);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 200% 200%;
  }
  .title {
    text-align: center;
    color: #ffffff;
    font-size: 24px;
    padding-top: 30px;
    line-height: 24px;
  }
}
</style>

