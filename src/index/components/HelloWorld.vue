<template>
	<div class="container phone" :style="{'backgroundImage':'url('+mainBgkImg+')'}">
		<div class="er-box-mid">
			<div class="er-mid-top">
				<img class="elogo" :src="hospital_logo"  alt="">
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
        <div class="er-mid-bot" v-if="showStatus==2" >
          <div class="form-input" >
            <input type="number" v-model.trim="phone" @input="inputPhone(11,'phone')" placeholder="请输入您的手机号码" />
          </div>
          <div class="form-gound">
            <input type="number"  v-model.trim="vcode" @input="inputPhone(6,'vcode')" placeholder="请输入验证码" /> |
            <a class="check hover" :class="disabledStatus?'on':''" href="javascript:;" @click="clickSendVcode">{{vcodetxt}}</a>
          </div>
          <a class="btn-form hover" href="javascript:;" @click="postVcode">加入我们</a>
        </div>
      </transition>
      <transition name="fadeUp">
        <div class="er-mid-bot-hidden" v-if="showStatus==3">
          <p class="text">当前登陆账户</p>
          <p class="num">{{phone}}</p>
          <a class="btn-form hover" @click="gotoApp" href="javascript:;">加入我们</a>
        </div>
      </transition>
		</div>
		<layer class="toast-box" v-model="showLayer" @sure="passwYesFn" :btn="['确定']" :title="['注册成功,请先完善密码','background:#15CEBC;color:#ffffff;']">
			<div class="toast-content">
				<input type="password" v-model="password" placeholder="请输入您的密码" />
				<input type="password" v-model="repassword" placeholder="再次确认您的密码" />
			</div>
		</layer>
	</div>
</template>

<script>
import img from "../assets/bkg.jpg";
import emLogo from "../assets/em-logo.png";

export default {
  data() {
    return {
      phone: "", // 输入的电话号码
      vcode: "", // 输入的验证码
      vcodetxt: "发送验证码", // 验证码的文字
      disabled: true, // 验证码输入禁止
      disabledStatus: false, // 验证码输入禁止的状态
      showLayer: true, // 提示输入密码的操作
      password: "", // 密码输入
      repassword: "", // 再次输入密码
      p_name: "", // 人名
      p_avatar: "", // 人物头像
      company: "", // 医院套餐
      hospital_logo: emLogo, //医院logo
      mainBgkImg: null, // 主背景图
      token: null, // 登录后用户的token值
      pId: "", // 父级的pId
      hospitalId: "", // 医院id
      showStatus: 0 // 1 打开二维码 2 打开验证 3 登录成功
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
          let phone = "" + self.phone;
          self.phone = phone.substr(0, 3) + "****" + phone.substr(7);
          this.showStatus = 3;
          self.bindParent();
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
        if (passw) {
          if (passw == 900) {
            this.showLayer = false;
            // 绑定上一级
            let phone = "" + this.phone;
            this.phone = phone.substr(0, 3) + "****" + phone.substr(7);
            this.showStatus = 3;
            this.bindParent();
          } else {
            let msg = passw.message
              ? passw.message
              : "绑定上一级失败，请重试！";
            this.showLayer = false;  
            this.$layer.msg(msg);
          }
        }
      } else {
        this.$layerCenterMsg("两次输入的密码不一致");
      }
    },
    // 绑定上一级
    async bindParent() {
      const pdata = await this.$ajax("/rest/team/bind/token", {
        pId: this.pId,
        token: this.token,
        hospitalId: this.hospitalId
      });
      if (pdata) {
        if (pdata.messageCode == 1409 || pdata.messageCode == 900) {
          this.judgeScan();
        } else {
          // 绑定失败的时候进入登录确认页
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
    //  第一次获取数据的函数 获取用户信息
    async getUserData() {
      let formData = {};
      formData.pPhone = this.$getQueryString("pPhone")
        ? this.$getQueryString("pPhone")
        : "";
      formData.pId = this.$getQueryString("pId")
        ? this.$getQueryString("pId")
        : "";
      formData.hospitalId = this.$getQueryString("hospitalId");
      this.hospitalId = formData.hospitalId;
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
          this.showStatus = 2;
          this.pId = result.data.pId;
        } else {
          let msg = result.message ? result.message : "网络开小差啦！！！";
          this.$layer.msg(msg);
        }
      }
    },
    // app扫码取用户信息的函数
    async getMyData(formData, callback) {
      this.$parent.openLoading("正在加载");
      const result = await this.$ajax(
        "/rest/team/getpUserAndHospital",
        formData
      );
      this.$parent.closeLoading();
      callback && callback();
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
          this.showStatus = 3;
          this.phone =
            result.data.pPhone.substr(0, 3) +
            "****" +
            result.data.pPhone.substr(7);
        }
      } else {
        let msg = result.message ? result.message : "网络开小差啦！！！";
        this.$layer.msg(msg);
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
    async judgeScan() {
      this.$parent.openLoading("正在加载");
      const result = await this.$ajax("/rest/user/getUser", {
        token: this.token,
        hospitalId: this.hospitalId
      });
      this.$parent.closeLoading();
      // document.body.innerHTML = JSON.stringify(result);
      if (result && result.messageCode == 900 || result.messageCode == 1402) {
        // 判断是否在团队中的时候
        if (result.data.isAllow == 1) {
          // 判断是否购买套餐
          if (result.data.packageType == 1) {
            this.$layer.msg("您已经成功加入我们团队");
            // 跳转到我的二维码页
            setTimeout(() => {
              window.location.href = `qcode.html?pId=${
                result.data.userId
              }&hospitalId=${this.hospitalId}`;
            }, 2000);
          } else {
            this.getMyData(
              {
                pId: result.data.userId,
                hospitalId: this.hospitalId
              },
              () => {
                this.gotoApp();
              }
            );
          }
        } else {
          // 判断pId或者ppHone
          if (this.$getQueryString("pId") || this.$getQueryString("ppHone")) {
            this.getMyData({
              pId: result.data.userId,
              hospitalId: this.hospitalId
            });
          } else {
            this.$layer.msg("您这连接不合法请认真检查");
          }
        }
      }else{
        let msg = result.message?result.message:'找不到该用户';
        this.$layer.msg(msg);
      }
    }
  },
  async created() {
    if (this.judgeBrowse() === "isWechat") {
      // 在微信中打开
      let code = this.$getQueryString("code");
      if (code) {
        const result = await this.$ajax("/rest/user/getUnionId", {
          code: code
        });
        if (result && result.messageCode == 900) {
          if (result.data.isLogined == 1) {
            // 微信已经绑定该用户
            this.gotoApp();
          }
        } else {
          let msg = result.message ? result.message : "该微信没有绑定";
          this.$layer.msg(msg);
          this.getUserData();
        }
        return;
      }
      let appid = "wx594f420067cba83d";
      // test url
      // let backUrl = encodeURIComponent(
      //   "http://test.topmei3mei.com/distribution.html?pPhone=13688370774&hospitalId=665"
      // );
      let backUrl = encodeURIComponent(window.location.href);
      let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${backUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
      window.location.href = url;
    } else if (this.judgeBrowse() == "isApp") {
      // 在app中打开
      let token = this.$getQueryString("token");
      let hospitalId = this.$getQueryString("hospitalId");
      this.hospitalId = hospitalId;
      if (token) {
        this.token = token;
        this.judgeScan();
      } else {
        // 在app中打开没有token值的时候 也就是app没有登陆的时候
        this.getUserData();
      }
    } else {
      //在浏览器中打开
      this.getUserData();
    }
  }
};
</script>

<style lang="less">
.phone {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
.er-box-mid {
  width: 610px;
  margin: 40px 0;
  background: rgba(239, 225, 212, 0.6);
  padding-top: 70px;
  letter-spacing: 3px;
  box-shadow: 5px 5px 5px rgba(111, 101, 101, 0.32);
  .er-mid-top {
    margin-bottom: 105px;
    span {
      display: block;
      text-align: center;
      &.txt {
        font-size: 32px;
      }
    }
    span.circle {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      background-color: #ffffff;
      margin: 40px auto 30px;
      background-repeat: no-repeat;
      background-size: cover;
    }
    img.line {
      display: block;
      width: 375px;
      height: 1px;
      margin: 0 auto;
    }
    .elogo {
      display: block;
      width: 140px;
      margin: 0 auto 40px;
    }
  }
  .er-mid-mid {
    width: 100%;
    background: #15cebc;
    padding-bottom: 20px;
    text-align: center;
    color: #ffffff;
    p {
      font-size: 28px;
      line-height: 28px;
      padding-top: 19px;
    }
    h3 {
      font-size: 34px;
      font-weight: 500;
      box-sizing: border-box;
      line-height: 48px;
      box-sizing: border-box;
      padding: 10px 20px 0px;
    }
  }
}
.er-code {
  width: 230px;
  margin: 0 auto;
  padding: 60px 0 100px;
  img {
    display: block;
    width: 100%;
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
    font-size:32px;
    &:last-child {
      border-top: 1px solid #323232;
    }
  }
}
</style>

<style lang="less" scoped>
@inputColor: #666666;
.er-mid-bot {
  width: 470px;
  margin: 60px auto 0;
  padding-bottom: 74px;
  input::-webkit-input-placeholder {
    color: @inputColor;
  }
  .form-input {
    width: 100%;
    border-bottom: 1px solid #323232;
    input {
      display: block;
      width: 100%;
      background: none;
      border: none;
      outline: none;
      height: 72px;
      line-height: 72px;
      font-size: 32px;
      text-align: center;
      letter-spacing: 4px;
      color: @inputColor;
    }
  }
  .form-gound {
    width: 100%;
    display: flex;
    height: 72px;
    line-height: 72px;
    border-bottom: 1px solid #323232;
    font-size: 32px;
    text-align: center;
    letter-spacing: 4px;
    input {
      width: 240px;
      background: none;
      outline: none;
      border: none;
      font-size: 32px;
      text-align: center;
      letter-spacing: 4px;
      color: @inputColor;
    }
    .check {
      flex: 1;
      color: @inputColor;
      &.on {
        opacity: 0.3;
        outline: none;
        -webkit-tap-heighlight-color: transparent;
      }
    }
  }
  .btn-form {
    display: block;
    width: 100%;
    height: 90px;
    background: #15cebc;
    text-align: center;
    color: #ffffff;
    font-size: 30px;
    line-height: 90px;
    margin-top: 32px;
    border-radius: 8px 8px;
  }
}
.er-mid-bot-hidden {
  width: 470px;
  margin: 60px auto 0;
  padding-bottom: 74px;
  text-align: center;
  .text {
    height: 72px;
    line-height: 72px;
    font-size: 32px;
    letter-spacing: 4px;
    color: @inputColor;
    border-bottom: 1px solid #323232;
  }
  .num {
    .text;
    border-bottom: none;
  }
  .btn-form {
    display: block;
    width: 100%;
    height: 90px;
    background: #15cebc;
    text-align: center;
    color: #ffffff;
    font-size: 30px;
    line-height: 90px;
    margin-top: 32px;
    border-radius: 8px 8px;
  }
}
</style>
