import{Z as s,ac as o,a as e,z as a,r as t,c as r,w as i,l as n,o as l,b as d,d as u,q as p,j as c,k as m,B as f}from"./index-nnZW9WDd.js";import{_ as w}from"./uni-match-media.Do13bpDi.js";import{r as h}from"./uni-app.es.YMhB4L0_.js";import{_}from"./uni-easyinput.o8bItaYz.js";import{_ as g}from"./uni-forms-item.CBR7qWz9.js";import{_ as P}from"./uni-id-pages-sms-form.BRnVV4w_.js";import{_ as y}from"./uni-forms.Ds0BSXHg.js";import{_ as b}from"./uni-popup-captcha.DYLVVgpX.js";import{p as j}from"./password.S_wKC5Jx.js";import{s as k,m as D}from"./store.DnxQcecy.js";import{_ as C}from"./_plugin-vue_export-helper.BCo6x5W8.js";import"./uni-icons.BTZacCfd.js";import"./uni-captcha.BviBMIWq.js";import"./uni-popup.DJiqA2x_.js";const I=s.importObject("uni-id-co",{customUI:!0});const U=C({name:"set-pwd.vue",data:()=>({uniIdRedirectUrl:"",loginType:"",logo:"/static/logo.png",focusNewPassword:!1,focusNewPassword2:!1,allowSkip:!1,formData:{code:"",captcha:"",newPassword:"",newPassword2:""},rules:j.getPwdRules("newPassword","newPassword2")}),computed:{userInfo:()=>k.userInfo},onReady(){this.$refs.form.setRules(this.rules)},onLoad(s){var e;this.uniIdRedirectUrl=s.uniIdRedirectUrl,this.loginType=s.loginType,o.setPasswordAfterLogin&&(null==(e=o.setPasswordAfterLogin)?void 0:e.allowSkip)&&(this.allowSkip=!0)},methods:{submit(){if(!/^\d{6}$/.test(this.formData.code))return this.$refs.smsCode.focusSmsCodeInput=!0,e({title:"验证码格式不正确",icon:"none"});this.$refs.form.validate().then((s=>{I.setPwd({password:this.formData.newPassword,code:this.formData.code,captcha:this.formData.captcha}).then((s=>{a({content:"密码设置成功",showCancel:!1,success:()=>{D.loginBack({uniIdRedirectUrl:this.uniIdRedirectUrl,loginType:this.loginType})}})})).catch((s=>{a({content:s.message,showCancel:!1})}))})).catch((s=>{"uni-id-captcha-required"==s.errCode?this.$refs.popup.open():console.log(s.errMsg)})).finally((s=>{this.formData.captcha=""}))},skip(){D.loginBack({uniIdRedirectUrl:this.uniIdRedirectUrl})}}},[["render",function(s,o,e,a,j,k){const D=c,C=n,I=m,U=h(t("uni-match-media"),w),V=h(t("uni-easyinput"),_),R=h(t("uni-forms-item"),g),v=h(t("uni-id-pages-sms-form"),P),B=f,x=h(t("uni-forms"),y),N=h(t("uni-popup-captcha"),b);return l(),r(C,{class:"uni-content"},{default:i((()=>[d(U,{"min-width":690},{default:i((()=>[d(C,{class:"login-logo"},{default:i((()=>[d(D,{src:j.logo},null,8,["src"])])),_:1}),d(I,{class:"title title-box"},{default:i((()=>[u("设置密码")])),_:1})])),_:1}),d(x,{class:"set-password-form",ref:"form",value:j.formData,"err-show-type":"toast"},{default:i((()=>[d(I,{class:"tip"},{default:i((()=>[u("输入密码")])),_:1}),d(R,{name:"newPassword"},{default:i((()=>[d(V,{focus:j.focusNewPassword,onBlur:o[0]||(o[0]=s=>j.focusNewPassword=!1),class:"input-box",type:"password",inputBorder:!1,modelValue:j.formData.newPassword,"onUpdate:modelValue":o[1]||(o[1]=s=>j.formData.newPassword=s),placeholder:"请输入密码"},null,8,["focus","modelValue"])])),_:1}),d(I,{class:"tip"},{default:i((()=>[u("再次输入密码")])),_:1}),d(R,{name:"newPassword2"},{default:i((()=>[d(V,{focus:j.focusNewPassword2,onBlur:o[2]||(o[2]=s=>j.focusNewPassword2=!1),class:"input-box",type:"password",inputBorder:!1,modelValue:j.formData.newPassword2,"onUpdate:modelValue":o[3]||(o[3]=s=>j.formData.newPassword2=s),placeholder:"请再次输入新密码"},null,8,["focus","modelValue"])])),_:1}),d(v,{modelValue:j.formData.code,"onUpdate:modelValue":o[4]||(o[4]=s=>j.formData.code=s),type:"set-pwd-by-sms",ref:"smsCode",phone:k.userInfo.mobile},null,8,["modelValue","phone"]),d(C,{class:"link-box"},{default:i((()=>[d(B,{class:"uni-btn send-btn",type:"primary",onClick:k.submit},{default:i((()=>[u("确认")])),_:1},8,["onClick"]),j.allowSkip?(l(),r(B,{key:0,class:"uni-btn send-btn",type:"default",onClick:k.skip},{default:i((()=>[u("跳过")])),_:1},8,["onClick"])):p("",!0)])),_:1})])),_:1},8,["value"]),d(N,{onConfirm:k.submit,modelValue:j.formData.captcha,"onUpdate:modelValue":o[5]||(o[5]=s=>j.formData.captcha=s),scene:"set-pwd-by-sms",ref:"popup"},null,8,["onConfirm","modelValue"])])),_:1})}],["__scopeId","data-v-f34b7681"]]);export{U as default};
