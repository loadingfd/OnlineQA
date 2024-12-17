import{p as e}from"./password.S_wKC5Jx.js";const t={username:{rules:[{required:!0,errorMessage:"请输入用户名"},{minLength:3,maxLength:32,errorMessage:"用户名长度在 {minLength} 到 {maxLength} 个字符"},{validateFunction:function(e,t,n,s){return(/^1\d{10}$/.test(t)||/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(t))&&s("用户名不能是：手机号或邮箱"),/^\d+$/.test(t)&&s("用户名不能为纯数字"),/[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/.test(t)&&s("用户名不能包含中文"),!0}}],label:"用户名"},nickname:{rules:[{minLength:3,maxLength:32,errorMessage:"昵称长度在 {minLength} 到 {maxLength} 个字符"},{validateFunction:function(e,t,n,s){return(/^1\d{10}$/.test(t)||/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(t))&&s("昵称不能是：手机号或邮箱"),/^\d+$/.test(t)&&s("昵称不能为纯数字"),/[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/.test(t)&&s("昵称不能包含中文"),!0}}],label:"昵称"},...e.getPwdRules()};export{t as r};
