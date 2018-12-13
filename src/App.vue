<template>
  <div id="app">
    <distribution/>
  </div>
</template>

<script>
import loading from "./components/loading.vue";
import distribution from "./views/endistribution";

export default {
  name: "app",
  data() {
    return {};
  },
  components: {
    distribution
  },
  methods: {}
};
</script>

<style lang="less">
// @import url("./assets/style.less");

@mainBgk: #15cebc;

html,
body,
h1,
h2,
h3,
h4,
h5,
h6,
p,
ul,
li {
  margin: 0;
  padding: 0;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  min-height: 1080px;
  overflow-x: hidden;
  background-color: #f5f5f5;
  font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue",
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  font-weight: 400;
}
li {
  list-style: none;
}
a {
  text-decoration: none;
  color: #323232;
  outline: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
img {
  border: none;
}
.layer-msg-center {
  top: 50% !important;
  bottom: 0 !important;
  transform: translateY(-50%);
}
/*过渡动画*/
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
}
.fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  -webkit-transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter,
.fade-leave-to {
  transform: translateY(0.5rem);
  opacity: 0;
}
.fadeIn-enter-active {
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
}
.fadeIn-leave-active {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
  -webkit-transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.fadeIn-enter,
.fadeIn-leave-to {
  transform: translateY(0.5rem);
  opacity: 0;
}
/*时间出来等*/
.fadeUp-enter-active {
  transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
}
.fadeUp-leave-active {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
  -webkit-transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.fadeUp-enter,
.fadeUp-leave-to {
  transform: translateY(-0.5rem);
  opacity: 0;
}
.hover {
  position: relative;
  overflow: hidden;
}
.hover:after {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #666 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.3s, opacity 0.5s;
}
.hover:active:after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}
</style>

