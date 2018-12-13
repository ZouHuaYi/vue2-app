// https://github.com/michael-ciniawsky/postcss-load-config
// to edit target browsers: use "browserslist" field in package.json
module.exports = {
    "plugins": {
        "postcss-import": {},
        "postcss-url": {},
        "autoprefixer": {},
        "postcss-pxtorem": {
            "rootValue": 75, // 换算的基数
            "selectorBlackList": ["layer"], // 忽略转换正则匹配项
            "minPixelValue": 2,
            "propList": ["*"]
        }
    }
}