<template>
  <div class="container phone" :style="{'backgroundImage':'url('+mainBgkImg+')'}">
    <div class="er-box-mid">
      <div class="er-mid-top">
        <div class="elogo-div">
          <img class="elogo" :src="hospital_logo" alt>
        </div>
        <img class="line" src="../assets/line.svg" alt>
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
        <div class="er-mid-bot" v-if="showStatus==2">
          <div class="form-input">
            <input
              type="number"
              v-model.trim="phone"
              @input="inputPhone(11,'phone')"
              placeholder="请输入您的手机号码"
            >
          </div>
          <div class="form-gound">
            <input
              type="tel"
              ref="vcheckmak"
              v-model.trim="vcode"
              @input="inputPhone(6,'vcode')"
              placeholder="请输入验证码"
            > |
            <a
              class="check hover"
              :class="disabledStatus?'on':''"
              href="javascript:;"
              @click="clickSendVcode"
            >{{vcodetxt}}</a>
          </div>
          <a class="btn-form hover" href="javascript:;" @click="postVcode">加入我们</a>
        </div>
      </transition>
      <transition name="fadeUp">
        <div class="er-mid-bot-hidden" v-if="showStatus==3">
          <p class="text">当前登陆账户</p>
          <p class="num">{{phone}}</p>
          <a class="btn-form hover" @click="bindParent" href="javascript:;">加入我们</a>
        </div>
      </transition>
      <transition name="fadeUp">
        <div class="er-code" v-if="showStatus==1">
          <vue-qr :text="url" :margin="0" :size="800" :logoSrc="logoSrc" :logoScale="0.18"></vue-qr>
        </div>
      </transition>
    </div>
    <layer
      class="toast-box"
      v-model="showLayer"
      @sure="passwYesFn"
      :btn="['确定']"
      :title="['注册成功,请先完善密码','background:#15CEBC;color:#ffffff;']"
    >
      <div class="toast-content">
        <input type="password" v-model="password" placeholder="请输入您的密码">
        <input type="password" v-model="repassword" placeholder="再次确认您的密码">
      </div>
    </layer>
  </div>
</template>

<script>
import img from "../assets/bkg.jpg";
import emLogo from "../assets/em-logo.png";
import VueQr from "vue-qr";
import logo from "../assets/ic_logo.png";
import wx from "weixin-js-sdk";

export default {
  components: {
    VueQr
  },
  data() {
    return {
      phone: "", // 输入的电话号码
      vcode: "", // 输入的验证码
      vcodetxt: "发送验证码", // 验证码的文字
      disabled: true, // 验证码输入禁止
      disabledStatus: false, // 验证码输入禁止的状态
      showLayer: false, // 提示输入密码的操作
      password: "", // 密码输入
      repassword: "", // 再次输入密码
      p_name: "", // 人名
      p_avatar: "", // 人物头像
      company: "", // 医院套餐
      hospital_logo: emLogo, //医院logo
      mainBgkImg: null, // 主背景图
      url: "", // 二维码的地址
      logoSrc: logo, // 公司logo图
      pPhone: this.$pPhone ? this.$pPhone : "", // 父级电话号码
      token: this.$token ? this.$token : "", // 登录后用户的token值
      pId: this.$pId ? this.$pId : "", // 父级的pId
      hospitalId: this.$hospitalId ? this.$hospitalId : "", // 医院id
      showStatus: window.sessionStorage.getItem("showStatus")
        ? window.sessionStorage.getItem("showStatus")
        : 0 // 1 打开二维码 2 打开验证 3 登录成功
    };
  },
  methods: {
    // 限制 input 输入字数
    inputPhone(val, key) {
      this[key] = this[key].substr(0, val);
    },
    // 点击发送验证码
    async clickSendVcode() {
      let phone = this.phone;
      let reg = /^1\d{10}$/;
      let time = 59;
      let self = this;
      self.$layer.closeAll();
      if (!phone) {
        self.$layer.msg("手机号码不能为空");
        return;
      }
      if (!reg.test(phone)) {
        self.$layer.msg("手机号码格式不正确");
        return;
      }
      if (self.disabledStatus) return; // 不能多次点击验证码
      self.disabledStatus = true;
      self.disabled = false; // 打开验证码的禁止输入
      // 发送验证码的请求
      self.$parent.openLoading("正在发送");
      const result = await this.$ajax("/rest/user/send_code", {
        phone: phone,
        type: 5
      });
      self.$parent.closeLoading();
      if (result) {
        if (result.messageCode == 900) {
          self.$layer.msg("验证码发送成功");
          self.$refs.vcheckmak.focus();
          // 倒计时开始
          self.vcodetxt = `${time}s后重试`;
          let t = setInterval(() => {
            time--;
            self.vcodetxt = `${time}s后重试`;
            if (time === 0) {
              clearInterval(t);
              self.vcodetxt = "发送验证码";
              self.disabledStatus = false;
            }
          }, 1000);
        } else {
          let msg = result.message ? result.message : "发送失败";
          self.$layer.msg(msg);
          self.disabledStatus = false;
        }
      } else {
        self.disabledStatus = false;
      }
    },
    //提交验证码
    async postVcode() {
      let phone = this.phone;
      let vcode = this.vcode;
      let self = this;
      let reg = /^1\d{10}$/;
      self.$layer.closeAll();
      if (!phone) {
        self.$layer.msg("手机号码不能为空");
        return;
      }
      if (!reg.test(phone)) {
        self.$layer.msg("手机号码格式不正确");
        return;
      }
      if (!vcode) {
        self.$layer.msg("验证码不能为空");
        return;
      }
      if ((vcode + "").length != 6) {
        self.$layer.msg("验证码格式不正确");
        return;
      }
      self.$parent.openLoading("正在提交");
      const result = await self.$ajax("/rest/user/login_by_code", {
        phone: phone,
        code: vcode
      });
      self.$parent.closeLoading();
      if (result) {
        if (result.messageCode == 129) {
          // 没有设置密码的时候
          self.token = result.data.token;
          self.showLayer = true;
        } else if (result.messageCode == 900) {
          // 绑定上一级
          self.token = result.data.token;
          this.judgeScan(() => {
            let phone = "" + self.phone;
            self.phone = this.formatPhone(phone);
            this.setStatusFun(3);
          });
        } else {
          let msg = result.message ? result.message : "验证码错误";
          self.$layer.msg(msg);
        }
      }
    },
    // 设置密码按钮
    async passwYesFn() {
      let { password, repassword } = this.$data;
      this.$layer.closeAll();
      if (!password) {
        this.$layerCenterMsg("密码不能为空");
        return;
      }
      if (!repassword) {
        this.$layerCenterMsg("再次输入密码不能为空");
        return;
      }
      if ("" + password.length < 6) {
        this.$layerCenterMsg("设置密码要6位数以上");
        return;
      }
      if (password === repassword) {
        // 提交密码
        this.$parent.openLoading("正在提交");
        const passw = await this.$ajax("/rest/user/improve_password", {
          token: this.token,
          password: password
        });
        this.$parent.closeLoading();
        this.password = "";
        this.repassword = "";
        if (passw) {
          if (passw.messageCode == 900) {
            this.showLayer = false;
            // 来到登录确认页
            this.judgeScan(() => {
              let phone = "" + this.phone;
              this.phone = this.formatPhone(phone);
              this.setStatusFun(3);
            });
          } else {
            let msg = passw.message ? passw.message : "密码设置失败！";
            this.showLayer = false;
            this.$layer.msg(msg);
          }
        } else {
          this.showLayer = false;
          this.$layer.msg("网络开小差啦！请再次提交。");
        }
      } else {
        this.$layerCenterMsg("两次输入的密码不一致");
      }
    },
    // 绑定上一级
    async bindParent() {
      const pdata = await this.$ajax("/rest/team/bind/token", {
        pPhone: this.pPhone,
        pId: this.pId ? parseInt(this.pId) : "",
        token: this.token,
        hospitalId: this.hospitalId
      });
      this.$layer.closeAll();
      if (pdata) {
        if (pdata.messageCode == 1409 || pdata.messageCode == 900) {
          let msg = pdata.message ? pdata.message : "绑定成功绑定上一级";
          this.$layer.msg(msg);
          this.judgeScan();
        } else {
          // 绑定失败
          let msg = pdata.message ? pdata.message : "绑定上一级失败，请重试！";
          this.$layer.msg(msg);
        }
      }
    },
    // 跳转到app页
    gotoApp() {
      window.location.href = `https://axz20z.mlinks.cc/ABcN?type=8&id=${
        this.hospitalId
      }&name=${this.company}`;
    },
    // 设置状态页
    setStatusFun(val) {
      this.showStatus = val;
      window.sessionStorage.setItem("showStatus", val);
    },
    //  第一次获取数据的函数 获取用户信息
    async getUserData(callback) {
      let formData = {};
      formData.pPhone = this.pPhone;
      formData.pId = this.pId ? parseInt(this.pId) : "";
      formData.hospitalId = parseInt(this.hospitalId);
      console.log(formData, "===");
      this.$parent.openLoading("正在加载");
      const result = await this.$ajax(
        "/rest/team/getpUserAndHospital",
        formData
      );
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
          this.pId = result.data.pId;
          this.pPhone = result.data.pPhone;
          this.$title = this.p_name;
          this.$hospital = this.company;
          this.getwxsignal();
          callback && callback(result);
        } else {
          let msg = result.message ? result.message : "网络开小差啦！！！";
          this.$layer.msg(msg);
        }
      }
    },
    // 判断打开web的环境
    judgeBrowse() {
      let ua = navigator.userAgent.toLowerCase();
      let app = /meishangmei/i;
      let wx = /MicroMessenger/i;
      if (app.test(ua)) {
        return "isApp";
      } else if (wx.test(ua)) {
        return "isWechat";
      } else {
        return "isWeb";
      }
    },
    // 判断是否有权限发展下一级
    async judgeScan(callback) {
      this.$parent.openLoading("正在加载");
      const result = await this.$ajax("/rest/user/getUser", {
        token: this.token,
        hospitalId: this.hospitalId
      });
      this.$parent.closeLoading();
      if ((result && result.messageCode == 900) || result.messageCode == 1402) {
        // 判断是否在团队中的时候
        if (result.data.isAllow == 1) {
          this.$layer.closeAll();
          this.pPhone = "";
          this.pId = result.data.userId;
          // this.$layer.msg('您已经加入该团队');
          // 判断是否购买套餐
          let self = this;
          if (result.data.packageType != 0) {
            // 跳转到我的二维码页
            this.$layer.open({
              btn: ["确认", "取消"],
              content: "您已在该团队中，点确定转跳到您的推广页",
              className: "layer-class-alert",
              shade: true,
              success(layer) {},
              yes(index, $layer) {
                self.pId = result.data.userId;
                self.createQrcode();
              }
            });
          } else {
            // 去购买套餐
            this.$layer.open({
              btn: ["确认", "取消"],
              content: "您已在该团队中,点确认将跳转到套餐购买页",
              className: "layer-class-alert",
              shade: true,
              success(layer) {},
              yes(index, $layer) {
                self.gotoApp();
              }
            });
          }
        } else {
          // 不在团队中 也就是没有被绑定 跳转到登录确认页
          callback && callback();
        }
      } else {
        let msg = result.message ? result.message : "找不到该用户";
        this.$layer.msg(msg);
      }
    },
    // 判断是否在团队里面
    judgeSmallFun(tphone) {
      this.judgeScan();
      this.getUserData(() => {
        // 判断pId 或者 phone 是不是自己打开
        // if(this.pId == tphone.data.id){
        //   this.pId = tphone.data.id;
        //   this.createQrcode();
        //   return;
        // }
        this.setStatusFun(3);
        this.phone = this.formatPhone(tphone.data.phone);
        this.phoneValue = tphone.data.phone;
      });
    },
    // 格式化手机号
    formatPhone(phone) {
      return phone.substr(0, 3) + "****" + phone.substr(7);
    },
    // 过滤url
    filterUrl() {
      let url = window.location.href;
      url = url.replace(/[?&]?code=[^#?&]+/, "");
      url = url.replace(/[?&]?state=[^#?&]+/, "");
      return url;
    },
    // 获取微信签名
    async getwxsignal() {
      let data = await this.$ajax("/rest/user/getSign", {
        url: encodeURIComponent(window.location.href.split("#")[0])
      });
      if (data.messageCode == 900) {
        this.wxstart(data.data);
      } else {
        this.$layer.msg("微信签名失败");
      }
    },
    // 微信分享
    wxstart(data) {
      let appId = data.appId;
      let timestamp = data.timestamp;
      let nonceStr = data.nonceStr;
      let signature = data.signature;
      let self = this;
      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: appId, // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature, // 必填，签名，见附录1
        jsApiList: [
          "onMenuShareTimeline",
          "onMenuShareAppMessage",
          "onMenuShareQQ"
        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.ready(() => {
        let imgurl =
          window.location.protocol +
          "//" +
          document.domain +
          "/static/img/logo.png";
        let title = self.p_name + "向你推荐" + self.company;
        let desc = "美上美你美丽的财富，你身边美丽的管家";
        wx.onMenuShareTimeline({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: self.filterUrl(), // 分享链接
          imgUrl: imgurl, // 分享图标
          success: function() {
            // 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareAppMessage({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: self.filterUrl(), // 分享链接
          imgUrl: imgurl, // 分享图标
          type: "", // 分享类型,music、video或link，不填默认为link
          dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
          success: function(res) {
            // 用户确认分享后执行的回调函数
            console.log(res);
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareQQ({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: self.filterUrl(), // 分享链接
          imgUrl: imgurl, // 分享图标
          success: function() {
            // 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
      });
    },
    // 生成二维码页
    createQrcode() {
      let url = window.location.href.split("?")[0];
      document.getElementsByTagName("title")[0].innerHTML = "推广二维码";
      this.pPhone = "";
      this.getUserData(() => {
        this.setStatusFun(1);
        url = `${url}?hospitalId=${this.hospitalId}&pId=${this.pId}`;
        this.url = url;
        history.pushState(null, "", url);
        this.getwxsignal();
      });
    }
  },
  async created() {
    // this.createQrcode()
    // return;
    if (this.judgeBrowse() === "isWechat") {
      // 在微信中打开
      let code = this.$code;
      if (code) {
        const result = await this.$ajax("/rest/user/getUnionId", {
          code: code
        });
        if (result && result.messageCode == 900) {
          if (result.data.isLogined == 1) {
            // 微信已经绑定该用户 token phone
            this.token = result.data.token;
            let tphone = await this.$ajax("rest/user/token", {
              token: this.token
            });
            if (tphone.messageCode == 900) {
              // 判断是否在企业团队里面
              this.judgeSmallFun(tphone);
            } else {
              let msg = tphone.message ? tphone.message : "该用户不存在";
              this.$layer.msg(msg);
            }
          } else {
            this.getUserData(() => {
              this.setStatusFun(2);
            });
          }
        } else {
          this.getUserData(() => {
            this.setStatusFun(2);
          });
        }
        return;
      }
      let appid = "wx594f420067cba83d";
      let backUrl = encodeURIComponent(window.location.href);
      let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${backUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
      window.location.href = url;
    } else if (this.judgeBrowse() == "isApp") {
      // 在app中打开
      if (this.token) {
        let tphone = await this.$ajax("rest/user/token", { token: this.token });
        if (tphone.messageCode == 900) {
          this.judgeSmallFun(tphone);
        } else {
          let msg = tphone.message ? tphone.message : "该用户不存在";
          this.$layer.msg(msg);
        }
      } else {
        // 在app中打开没有token值的时候 也就是app没有登陆的时候
        this.getUserData(() => {
          this.setStatusFun(2);
        });
      }
    } else {
      //在浏览器中打开
      this.getUserData(() => {
        this.setStatusFun(2);
      });
    }
  }
};
</script>
