import{Z as e,g as n,an as o,a as s,x as i,ag as t,E as a,ao as r,$ as u,af as l,ab as d,y as c,ac as g}from"./index-nnZW9WDd.js";const f=e.importObject("uni-id-co"),p=e.database().collection("uni-id-users");let I=n("uni-id-pages-userInfo")||{};const h={async updateUserInfo(n=!1){if(n)p.where("_id==$env.uid").update(n).then((e=>{e.result.updated?(s({title:"更新成功",icon:"none",duration:3e3}),this.setUserInfo(n)):s({title:"没有改变",icon:"none",duration:3e3})}));else{const n=e.importObject("uni-id-co",{customUI:!0});try{let e=await p.where("'_id' == $cloudEnv_uid").field("mobile,nickname,username,email,avatar_file").get();const o=await n.getRealNameInfo();this.setUserInfo({...e.result.data[0],realNameAuth:o})}catch(o){this.setUserInfo({},{cover:!0}),console.error(o.message,o.errCode)}}},async setUserInfo(e,{cover:n}={cover:!1}){let o=n?e:Object.assign(w.userInfo,e);return w.userInfo=Object.assign({},o),w.hasLogin=0!=Object.keys(w.userInfo).length,i("uni-id-pages-userInfo",w.userInfo),e},async logout(){if(e.getCurrentUserInfo().tokenExpired>Date.now())try{await f.logout()}catch(n){console.error(n)}t("uni_id_token"),i("uni_id_token_expired",0),a({url:`/${r.uniIdRouter&&r.uniIdRouter.loginPage?r.uniIdRouter.loginPage:"uni_modules/uni-id-pages/pages/login/login-withoutpwd"}`}),u("uni-id-pages-logout"),this.setUserInfo({},{cover:!0})},loginBack(e={}){const{uniIdRedirectUrl:n=""}=e;let o=0,s=l();if(s.forEach(((e,n)=>{"login"==s[s.length-n-1].route.split("/")[3]&&o++})),n)return a({url:n,fail:e=>{d({url:n,fail:n=>{console.log(e,n)}})}});if("weixin"==e.loginType)return window.history.go(-3);if(o){const e=r.pages[0];return d({url:`/${e.path}`})}c({delta:o})},loginSuccess(e={}){const{showToast:n=!0,toastText:o="登录成功",autoBack:i=!0,uniIdRedirectUrl:t="",passwordConfirmed:r}=e;if(n&&s({title:o,icon:"none",duration:3e3}),this.updateUserInfo(),u("uni-id-pages-login-success"),g.setPasswordAfterLogin&&!r)return a({url:t?`/uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd?uniIdRedirectUrl=${t}&loginType=${e.loginType}`:`/uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd?loginType=${e.loginType}`,fail:e=>{console.log(e)}});i&&this.loginBack({uniIdRedirectUrl:t})}},w=o({userInfo:I,hasLogin:0!=Object.keys(I).length});export{h as m,w as s};
