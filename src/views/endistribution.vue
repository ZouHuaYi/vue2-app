<template>
<div class="pages">
  <div class="container">
    <div class="content">
      <div class="cont-top">
        <div class="t-header">
          <div class="logo">
            <img :src="p_avatar" ref="avatar" alt>
          </div>
          <div class="text">
            <span class="tit">推广人</span>
            <h5>{{p_name}}</h5>
          </div>
        </div>
        <div class="t-center">
          <img :src="hospital_logo" alt srcset>
        </div>
        <div class="t-footer">
          <span>向您推广</span>
          <span>{{company}}</span>
        </div>
      </div>
      <div class="cont-midden">
        <span class="circle lt"></span>
        <span class="circle rt"></span>
      </div>
      <div class="cont-bottom">
        <transition name="fadeUp">
          <div class="b-item" v-if="showStatus==2">
            <div class="form-ground">
              <input
                type="tel"
                @blur="scrollToTop"
                @input="inputPhone(11,'phone')"
                v-model.trim="phone"
                placeholder="请输入您的手机号"
              >
            </div>
            <div class="form-vcode">
              <input
                @blur="scrollToTop"
                type="tel"
                @input="inputPhone(6,'vcode')"
                v-model.trim="vcode"
                ref="vcheckmak"
                placeholder="请输入验证码"
              >
              <a
                class="btn-code no-touch"
                href="javascript:;"
                :class="disabledStatus?'on':''"
                @click="clickSendVcode"
              >{{vcodeText}}</a>
            </div>
            <div class="btn-join">
              <a class="btn-input hover no-touch" @click="postVcode" href="javascript:;">加入我们</a>
            </div>
          </div>
        </transition>
        <transition name="fadeUp">
          <div class="b-item" v-if="showStatus==3">
            <div class="zh title">当前登陆账号</div>
            <div class="zh phone">{{phone}}</div>
            <div class="btn-join">
              <a class="btn-input hover no-touch" @click="bindParent" href="javascript:;">加入我们</a>
            </div>
          </div>
        </transition>
        <transition name="fadeUp">
          <div class="b-item" v-if="showStatus==1">
            <div class="qrcode">
              <vue-qr
                class="ecode"
                :text="url"
                :margin="0"
                :size="800"
                :logoSrc="logoSrc"
                :logoScale="0.18"
              ></vue-qr>
            </div>
          </div>
        </transition>
        <transition name="fadeUp">
          <div class="b-item alert" v-if="showStatus==4">
            <div class="al al-text">你已成功加入团队</div>
            <div class="al al-time">{{alertText}}</div>
          </div>
        </transition>
      </div>
    </div>  
  </div>
  <layer
      class="toast-box"
      v-model="showLayer"
      @sure="passwYesFn"
      :btn="['确定']"
      :title="['注册成功,请先完善密码','background:#15CEBC;color:#ffffff;']"
    >
      <div class="toast-content">
        <input type="password" @blur="scrollToTop" v-model="password" placeholder="请输入您的密码" />
        <input type="password" @blur="scrollToTop" v-model="repassword" placeholder="再次确认您的密码" />
      </div>
    </layer>
</div>
</template>
<script>
import logo from "../assets/ic_logo.png";
import wx from "weixin-js-sdk";
import VueQr from "vue-qr";
import defaultname from "../assets/default.png";
export default {
  components: {
    VueQr
  },
  data() {
    return {
      phone: "",
      vcode: "",
      vcodeText: "获取验证码",
      disabledStatus: false,
      showLayer: false,
      password: "",
      repassword: "",
      p_name: "", // 人名
      p_avatar: "", // 人物头像
      company: "", // 医院套餐
      hospital_logo: "",
      logoSrc: logo, // 公司logo图
      url: "",
      alertText: "3秒后前往购买页",
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
    // 收起键盘回滚
    scrollToTop(){
      clearTimeout(this.timWin);
      this.timWin = setTimeout(()=>{
        window.scroll(0,0);
      },500);
    },
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
      // 发送验证码的请求
      self.$loading.show("正在发送");
      const result = await this.$ajax("/rest/user/send_code", {
        phone: phone,
        type: 5
      });
      self.$loading.hide();
      if (result) {
        if (result.messageCode == 900) {
          self.$layer.msg("验证码发送成功");
          self.$refs.vcheckmak.focus();
          // 倒计时开始
          self.vcodeText = `${time}s后重试`;
          let t = setInterval(() => {
            time--;
            self.vcodeText = `${time}s后重试`;
            if (time === 0) {
              clearInterval(t);
              self.vcodeText = "发送验证码";
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
      self.$loading.show("正在提交");
      const result = await self.$ajax("/rest/user/login_by_code", {
        phone: phone,
        code: vcode
      });
      self.$loading.hide();
      if (result) {
        if (result.messageCode == 129) {
          // 没有设置密码的时候
          self.token = result.data.token;
          self.showLayer = true;
          self.bindUnicodeFun(result.data.id);
        } else if (result.messageCode == 900) {
          // 绑定上一级
          self.token = result.data.token;
          this.judgeScan(() => {
            let phone = "" + self.phone;
            self.phone = this.formatPhone(phone);
            this.setStatusFun(3);
          });
          self.bindUnicodeFun(result.data.id);
        } else {
          let msg = result.message ? result.message : "验证码错误";
          self.$layer.msg(msg);
        }
      }
    },
    // 静默式的绑定uincodeid
    async bindUnicodeFun(id) {
      let code = this.$code;
      if(code){
        const result = await this.$ajax('/rest/user/open_bind_unbundled',{
          wechat:code,
					unionId:code,
					id:id,
					action:0
        })
        if(result.messageCode==900){
          console.log('绑定成功')
        }
      }
    },
    // 判断是否有权限发展下一级
    async judgeScan(callback) {
      this.$loading.show("正在加载");
      const result = await this.$ajax("/rest/user/getUser", {
        token: this.token,
        hospitalId: this.hospitalId
      });
      this.$loading.hide();
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
            if (this.judgeBrowse() == "isApp" && this.$scan != "scan") {
              self.pId = result.data.userId;
              self.createQrcode();
            } else {
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
            }
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
          if (
            !this.hospitalId &&
            this.judgeBrowse() == "isApp" &&
            this.$scan != "scan"
          ) {
            this.pId = result.data.userId;
            this.createQrcode();
            return;
          }
          if (!this.hospitalId && this.userId == this.pId) {
            this.pId = result.data.userId;
            this.createQrcode();
            return;
          }
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
        this.setStatusFun(3);
        this.phone = this.formatPhone(tphone.data.phone);
        this.phoneValue = tphone.data.phone;
      });
    },
    //  第一次获取数据的函数 获取用户信息
    async getUserData(callback) {
      let formData = {};
      formData.pPhone = this.pPhone;
      formData.pId = this.pId ? parseInt(this.pId) : "";
      formData.hospitalId = this.hospitalId ? parseInt(this.hospitalId) : "";
      this.$loading.show("正在加载");
      const result = await this.$ajax(
        "/rest/team/getpUserAndHospital",
        formData
      );
      this.$loading.hide();
      if (result) {
        if (result.messageCode == 900) {
          this.hospital_logo = result.data.hospital_logo;
          this.company = result.data.hospital_name;
          this.p_name = result.data.p_name
            ? result.data.p_name
            : result.data.pPhone;
          this.p_avatar = result.data.p_avatar
            ? result.data.p_avatar
            : defaultname;
          this.pId = result.data.pId;
          this.pPhone = result.data.pPhone;
          this.getwxsignal();
          callback && callback(result);
        } else {
          let msg = result.message ? result.message : "网络开小差啦！！！";
          this.$layer.msg(msg);
        }
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
        if (pdata.messageCode == 900) {
          this.showStatus = 4;
          let timp = null;
          let numtime = 3;
          clearInterval(timp);
          timp = setInterval(() => {
            numtime -= 1;
            this.alertText = `${numtime}秒后前往购买页`;
            if (numtime <= 0) {
              clearInterval(timp);
              this.gotoApp();
            }
          }, 1000);
        } else if (pdata.messageCode == 1409) {
          this.judgeScan();
        } else if (pdata.messageCode == 1402) {
          this.$layer.msg(`${this.p_name}没有权限发展下级，绑定失败。`);
        } else {
          // 绑定失败
          let msg = pdata.message ? pdata.message : "绑定上一级失败，请重试！";
          this.$layer.msg(msg);
        }
      }
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
        this.getwxsignal(); // 微信签名
      });
    },
    // 跳转到app页
    gotoApp() {
      let hospitalId = this.hospitalId ? this.hospitalId : 0;
      window.location.href = `https://axz20z.mlinks.cc/ABcN?type=8&id=${hospitalId}&name=${this.company}`;
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
    // 格式化手机号
    formatPhone(phone) {
      return phone.substr(0, 3) + "****" + phone.substr(7);
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
        this.$loading.show("正在提交");
        const passw = await this.$ajax("/rest/user/improve_password", {
          token: this.token,
          password: password
        });
        this.$loading.hide();
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
    // 设置状态页
    setStatusFun(val) {
      this.showStatus = val;
      window.sessionStorage.setItem("showStatus", val);
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
        let desc = "美上美你美丽的财富，你身边美丽管家.";
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
    }
  },
  async created() {
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
              this.userId = tphone.data.id;
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
      let urlOld = window.location.href;
      if (urlOld.indexOf("m3m.fengwoo.cn") > -1) {
        urlOld = urlOld.replace("m3m.fengwoo.cn", "admin.topmei3mei.com");
      }
      let backUrl = encodeURIComponent(urlOld);
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
  },
  mounted() {
    this.$refs.avatar.onerror = () => {
      this.p_avatar = defaultname;
    };
  }
};
</script>
<style lang="less">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
.pages{
  position:relative;
  width:100%;
  height:100%;
}
.layui-m-layer{
  position:absolute !important;
  width:100%;
  height:100vh;
}
a.no-touch {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
input {
  outline: none;
  box-shadow: none;
  -webkit-appearance: none !important;
}
input:focus {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-user-modify: read-write-plaintext-only;
}
[contenteditable="true"],
input,
textarea {
  -webkit-user-select: auto !important;
  -khtml-user-select: auto !important;
  -moz-user-select: auto !important;
  -ms-user-select: auto !important;
  -o-user-select: auto !important;
  user-select: auto !important;
}
.qrcode {
  width: 56%;
  margin: 0 auto;
  padding-top: 16px;
  padding-bottom: 24px;
  .ecode {
    width: 100%;
    padding: 0;
    background: #ffffff;
    border: 10px solid #ffffff;
    img {
      display: block;
      width: 100%;
    }
  }
}
.toast-box {
  .layui-m-layercont {
    padding: 40px 40px;
  }
  input {
    width: 100%;
    height: 70px;
    line-height: 70px;
    border: none;
    outline: none;
    text-align: center;
    font-size: 50px;
    &::-webkit-input-placeholder {
      font-size: 28px;
    }
    &:last-child {
      border-top: 1px solid #323232;
    }
  }
}
</style>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  background: #14cebc;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.5px;
}
.content {
  width: 87%;
  // min-height: 84%;
  padding-bottom: 30px;
  min-height: 1050px;
  background: #ffffff;
  border-radius: 32px;
}
.cont-top {
  display: flex;
  flex-direction: column;
  min-height: 50%;
  justify-content: center;
  .t-header {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 37px;
    box-sizing: border-box;
    .logo {
      width: 108px;
      height: 108px;
      border-radius: 50% 50%;
      overflow: hidden;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .text {
      padding-left: 20px;
      .tit {
        display: block;
        font-size: 28px;
        line-height: 24px;
        padding-top: 17px;
      }
      h5 {
        height: 30px;
        padding-top: 17px;
        line-height: 30px;
        font-size: 30px;
        font-weight: 600;
      }
    }
  }
  .t-center {
    width: 40%;
    margin: 0 auto;
    max-height: 240px;
    overflow: hidden;
    padding-bottom: 10px;
    img {
      display: block;
      width: 100%;
    }
  }
  .t-footer {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: 36px;
    color: #000000;
    line-height: 36px;
    padding-top: 20px;
    padding-bottom: 30px;
    span {
      display: block;
      padding-top: 30px;
    }
  }
}
.cont-midden {
  width: 100%;
  height: 64px;
  position: relative;
  &::after {
    position: absolute;
    content: " ";
    width: 100%;
    top: 50%;
    border-bottom: 1px dashed #eacc20;
    left: 0;
    z-index: 1;
  }
  .circle {
    position: absolute;
    width: 64px;
    height: 64px;
    background: #14cebc;
    border-radius: 50%;
    top: 0;
    z-index: 2;
    &.lt {
      left: -32px;
    }
    &.rt {
      right: -32px;
    }
  }
}
.cont-bottom {
  padding-bottom: 30px;
  .b-item {
    width: 80%;
    margin: 0 auto;
    font-size: 36px;
    input {
      letter-spacing: 1px;
      outline: none;
      font-size: 32px;
      &::-webkit-input-placeholder {
        color: #666666;
        letter-spacing: 0.5px;
      }
    }
    .form-ground {
      width: 100%;
      height: 90px;
      padding-top: 24px;
      line-height: 90px;
      input {
        display: block;
        width: 100%;
        height: 100%;
        border: 1px solid #e2e2e2;
        box-sizing: border-box;
        padding-left: 64px;
        border-radius: 12px;
        background-color: #d0f5f2;
        background-image: url(../assets/phone.png);
        background-repeat: no-repeat;
        background-position: 24px center;
        background-size: 22px 32px;
      }
    }
    .form-vcode {
      display: flex;
      justify-content: space-between;
      height: 90px;
      line-height: 90px;
      padding-top: 30px;
      input {
        display: block;
        width: 56%;
        height: 100%;
        border: 1px solid #e2e2e2;
        box-sizing: border-box;
        padding-left: 64px;
        border-radius: 12px;
        // outline: none;
        background-color: #d0f5f2;
        background-image: url(../assets/mc.png);
        background-repeat: no-repeat;
        background-position: 20px center;
        background-size: 30px 20px;
      }
      a.btn-code {
        width: 40%;
        height: 100%;
        text-align: center;
        border: 1px solid #e2e2e2;
        border-radius: 12px;
        font-size: 28px;
        box-sizing: border-box;
        &.on {
          color: #999999;
        }
      }
    }
    .btn-join {
      width: 100%;
      padding-top: 30px;
      height: 90px;
      line-height: 90px;
      a.btn-input {
        display: block;
        width: 100%;
        height: 90px;
        line-height: 90px;
        background: #14cebc;
        text-align: center;
        font-size: 32px;
        color: #ffffff;
        border-radius: 12px;
      }
    }
    .zh {
      width: 100%;
      text-align: center;
      padding-top: 36px;
      font-size: 36px;
      line-height: 36px;
      color: #323232;
      &.phone {
        padding-bottom: 30px;
      }
    }
    &.alert {
      text-align: center;
      .al-text {
        text-align: center;
        padding-top: 80px;
        font-size: 48px;
        font-weight: 500;
        background: linear-gradient(to bottom, #f9f5b6, #53a0bc);
        -webkit-background-clip: text;
        color: transparent;
      }
      .al-time {
        display: inline-block;
        padding: 15px 40px;
        border-radius: 40px;
        background: #03d0bc;
        font-size: 30px;
        color: #ffffff;
        margin-top: 30px;
        box-shadow: 0px 10px 10px rgba(3, 208, 188, 0.22);
      }
    }
  }
}
</style>

