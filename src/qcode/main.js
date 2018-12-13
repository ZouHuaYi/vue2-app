import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import layer from "vue2-layer-mobile";

import 'babel-polyfill'
import Es6Promise from 'es6-promise'
Es6Promise.polyfill()

Vue.config.productionTip = false;
import "lib-flexible";

Vue.use(layer);
//提示框文字居中的样式封装
Vue.prototype.$layerCenterMsg = function(content, time = 2) {
    Vue.layer.open({
        content: content,
        className: "layer-msg-center",
        skin: "msg",
        time: time
    });
};
Vue.layer.msg = function(content, time = 2) {
    Vue.layer.open({
        content: content,
        skin: "msg",
        time: time
    });
};

//项目域名地址
// const root = "http://admin.topmei3mei.com";
const root = process.env.NODE_ENV === 'production'? "http://admin.topmei3mei.com" : "http://test.topmei3mei.com";




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
Vue.prototype.$ajax = function(url, data, dataType = "form", type = "post") {
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

// 获取url的值 传递过来的值
Vue.prototype.$getQueryString = function(name) {
    return window.location.href.match(
            new RegExp("[?&]" + name + "=([^#?&]+)", "i")
        ) ?
        decodeURIComponent(RegExp.$1) :
        "";
};

new Vue({
    render: h => h(App)
}).$mount("#app");