<template>
	<div class="container phone" :style="{'backgroundImage':'url('+mainBgkImg+')'}">
		<div class="er-box-mid">
			<div class="er-mid-top">
				<img class="elogo" :src="hospital_logo" alt="">
				<img class="line" src="../assets/line.svg" alt="">
				<span class="circle" :style="{'backgroundImage':'url('+p_avatar+')'}"></span>
				<span class="txt">{{p_name}}</span>
			</div>
      <transition name="fade">
        <div class="er-mid-mid" v-if="company">
          <p>向您推荐</p>
          <h3>{{company}}</h3>
        </div>
      </transition>
       <transition name="fadeUp">
			  <div class="er-code" v-if="showStatus==1">
         <vue-qr  :text="url" :margin="0" :size="800" :logoSrc="logoSrc" :logoScale="0.25"></vue-qr>
        </div>
      </transition>
		</div>
	</div>
</template>

<script>
import img from "../assets/bkg.jpg";
import emLogo from "../assets/em-logo.png";
import VueQr from "vue-qr";
import logo from "../assets/erlogo.png";

export default {
  data() {
    return {
      url: "", // 二维码的地址
      logoSrc: logo, // 公司logo图
      p_name: "",
      p_avatar: "",
      company: "",
      mainBgkImg: null,
      hospital_logo: emLogo,
      token: null,
      showStatus: 0 // 1 打开二维码 2 打开验证 3 登录成
    };
  },
  components: {
    VueQr
  },
  methods: {},
  async created() {
    let formData = {};
    // 这是浏览器打开的时候
    this.url = window.location.href.replace("qcode", "distribution");
    // 在浏览器中打开
    formData.pId = this.$getQueryString("pId")
      ? this.$getQueryString("pId")
      : "";
    formData.hospitalId = this.$getQueryString("hospitalId")
      ? this.$getQueryString("hospitalId")
      : "";
    // 获取用户信息
    this.$parent.openLoading("正在加载");
    const result = await this.$ajax("/rest/team/getpUserAndHospital", formData);
    this.$parent.closeLoading();
    if (result) {
      if (result.messageCode == 900) {
        this.mainBgkImg = result.data.hospital_background_img
          ? result.data.hospital_background_img
          : img;
        this.hospital_logo = result.data.hospital_logo;
        this.company = result.data.hospital_name;
        this.p_name = result.data.p_name
          ? result.data.p_name
          : result.data.pPhone;
        this.p_avatar = result.data.p_avatar;
        this.$parent.changeTitle(this.company);
        this.showStatus = 1;
      } else {
        let msg = result.message ? result.message : "网络开小差啦！！！";
        this.$layer.msg(msg);
      }
    }
  }
};
</script>

