import{a as e,r as t,o as s,c as o,w as a,b as l,d as u,t as i,k as n,l as c}from"./index-nnZW9WDd.js";import{_ as p}from"./uni-captcha.BviBMIWq.js";import{r}from"./uni-app.es.YMhB4L0_.js";import{_ as f}from"./uni-popup.DJiqA2x_.js";import{_ as d}from"./_plugin-vue_export-helper.BCo6x5W8.js";const m=d({data:()=>({focus:!1}),props:{modelValue:String,value:String,scene:{type:String,default:()=>""},title:{type:String,default:()=>""}},computed:{val:{get(){return this.value||this.modelValue},set(e){this.$emit("update:modelValue",e)}}},methods:{open(){this.focus=!0,this.val="",this.$refs.popup.open()},close(){this.focus=!1,this.$refs.popup.close()},confirm(){if(!this.val)return e({title:"请填写验证码",icon:"none"});this.close(),this.$emit("confirm")}}},[["render",function(e,d,m,h,_,v){const g=n,V=r(t("uni-captcha"),p),b=c,j=r(t("uni-popup"),f);return s(),o(j,{ref:"popup",type:"center"},{default:a((()=>[l(b,{class:"popup-captcha"},{default:a((()=>[l(b,{class:"content"},{default:a((()=>[l(g,{class:"title"},{default:a((()=>[u(i(m.title),1)])),_:1}),l(V,{focus:_.focus,scene:m.scene,modelValue:v.val,"onUpdate:modelValue":d[0]||(d[0]=e=>v.val=e)},null,8,["focus","scene","modelValue"])])),_:1}),l(b,{class:"button-box"},{default:a((()=>[l(b,{onClick:v.close,class:"btn"},{default:a((()=>[u("取消")])),_:1},8,["onClick"]),l(b,{onClick:v.confirm,class:"btn confirm"},{default:a((()=>[u("确认")])),_:1},8,["onClick"])])),_:1})])),_:1})])),_:1},512)}],["__scopeId","data-v-f0f3582f"]]);export{m as _};
