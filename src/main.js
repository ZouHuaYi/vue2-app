import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import layer from "@/plugin/layer"
import loading from "@/plugin/loading"

Vue.config.productionTip = false;
import "lib-flexible";

import 'babel-polyfill'
import Es6Promise from 'es6-promise'
Es6Promise.polyfill()

if (window.location.href.indexOf('m3m.fengwoo.cn') > -1) {
    let url = window.location.href.replace('m3m.fengwoo.cn', 'admin.topmei3mei.com');
    window.location.href = url;
}

Vue.use(loading);
Vue.use(layer);

// 提示框文字居中的样式封装
Vue.prototype.$layerCenterMsg = function (content, time = 2) {
    Vue.layer.open({
        content: content,
        className: "layer-msg-center",
        skin: "msg",
        time: time
    });
};
Vue.layer.msg = function (content, time = 2) {
    Vue.layer.open({
        content: content,
        skin: "msg",
        time: time
    });
};

// const root = "http://admin.topmei3mei.com"http://test.topmei3mei.com; 192.168.2.236:8080/msm
// const root = process.env.NODE_ENV == 'production' ? "" : "http://test.topmei3mei.com";
// const root = process.env.NODE_ENV == 'production' ? "" : "http://192.168.2.236:8080/msm";
const root = ''



// 判断对象的方法
function isObject(val) {
    return val != null && typeof val === "object" && Array.isArray(val) === false;
}
// ajax 请求
let instance = axios.create({
    baseURL: root,
    timeout: 30000,
    transformRequest: [
        function transformRequest(data, headers) {
            if (isObject(data)) {
                headers["Content-Type"] = "application/json;charset=utf-8";
                return data;
            } else {
                let formData = JSON.parse(data);
                let keys2 = Object.keys(formData);
                headers["Content-Type"] = "application/x-www-form-urlencoded";
                return encodeURI(
                    keys2.map(name => `${name}=${formData[name]}`).join("&")
                );
            }
        }
    ]
});
Vue.prototype.$ajax = function (url, data, dataType = "form", type = "post") {
    return new Promise((resolve, reject) => {
        if (dataType == "form") {
            data = JSON.stringify(data);
        }
        instance[type](url, data)
            .then(data => {
                resolve(data.data);
            })
            .catch(() => {
                Vue.prototype.$layerCenterMsg("网络开小差啦,请重试！");
                resolve(false);
            });
    });
};

Vue.prototype.$axios = axios;

// 获取url的值 传递过来的值
function getQueryString(name) {
    return window.location.href.match(new RegExp("[?&]" + name + "=([^#?&]+)", "i")) ? decodeURIComponent(RegExp.$1) : "";
};

Vue.prototype.$getQueryString = getQueryString;
Object.defineProperty(Vue.prototype, "$pPhone", { value: getQueryString('pPhone') });
Object.defineProperty(Vue.prototype, "$pId", { value: getQueryString('pId') });
Object.defineProperty(Vue.prototype, "$hospitalId", { value: getQueryString('hospitalId') });
Object.defineProperty(Vue.prototype, "$token", { value: getQueryString('token') });
Object.defineProperty(Vue.prototype, "$code", { value: getQueryString('code') });
Object.defineProperty(Vue.prototype, "$scan", { value: getQueryString('scan') });


new Vue({
    render: h => h(App)
}).$mount("#app")