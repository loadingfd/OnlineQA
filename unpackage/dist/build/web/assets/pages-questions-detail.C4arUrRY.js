import{Z as e,a as s,y as t,n as i,X as l,Y as a,r as n,c as r,w as o,l as d,o as c,b as u,d as _,t as h,e as p,q as f,f as m,F as y,i as g,k,j as w,V as C,_ as b,B as I,m as q}from"./index-nnZW9WDd.js";import{_ as T}from"./uni-icons.BTZacCfd.js";import{r as v}from"./uni-app.es.YMhB4L0_.js";import{_ as $}from"./uni-load-more.CaYHO8__.js";import{_ as F}from"./unicloud-db.CMy1RrDf.js";import{_ as P}from"./uni-popup.DJiqA2x_.js";import{_ as D}from"./_plugin-vue_export-helper.BCo6x5W8.js";const R=e.database(),A=R.command;e.databaseForJQL();const x=D({data:()=>({queryWhere:"",collectionList:null,postList:null,usersTmp:null,question:null,loadMore:{contentdown:"",contentrefresh:"",contentnomore:""},answers:null,answersCount:0,sortBy:"time",sortDirection:"desc",answerContent:"",selectedImages:[],currentUser:{_id:""},best_answer_user_id:null,question_user_id:null,replyContent:"",currentReplyTo:null,replyPlaceholder:"写下你的评论...",solved:!1,qhard:-1}),onLoad(e){this._id=e.id},onReady(){this._id&&(this.queryWhere='_id=="'+this._id+'"',this.question=R.collection("questions").where(`_id=="${this._id}"`).getTemp(),this.usersTmp=R.collection("uni-id-users").field("_id,nickname,avatar_file").getTemp(),this.collectionList=[this.question,this.usersTmp],this.getAnswers(),this.currentUser._id=e.getCurrentUserInfo().uid,R.collection("questions").where(`_id=="${this._id}"`).get().then((e=>{this.question_user_id=e.result.data[0].user_id,this.qhard=e.result.data[0].difficulties,this.solved=e.result.data[0].had_answer,this.solved&&(this.best_answer_user_id=e.result.data[0].best_answer_user_id)})))},methods:{handleReply(e){this.currentReplyTo=e,e.user_id._id===this.currentUser._id?this.replyPlaceholder="说点什么":this.replyPlaceholder=`回复 ${e.user_id.nickname}`,this.$refs.replyPopup.open()},handleReplyClick(e){this.currentReplyTo=e,e.reply_to&&e.reply_to._id===this.currentUser._id?this.replyPlaceholder="说点什么":this.replyPlaceholder=`回复 ${e.user_id.nickname}`,this.$refs.replyPopup.open()},timestampToDate(e){if(!e)return"";const s=new Date(e),t=new Date-s;if(t<6e4)return"刚刚";if(t<36e5)return Math.floor(t/6e4)+"分钟前";if(t<864e5)return Math.floor(t/36e5)+"小时前";return`${s.getFullYear()}-${(s.getMonth()+1).toString().padStart(2,"0")}-${s.getDate().toString().padStart(2,"0")}`},async createMessage(s,t,i){try{const l=e.database();await l.collection("message").add({user_id:i,from_user_id:this.userInfo._id,type:"reply_answer",content:this.replyContent,question_id:t,answer_id:s,create_time:Date.now(),is_read:!1})}catch(l){console.error("创建消息失败:",l)}},async submitReply(){if(this.currentUser._id)try{await this.saveReply();await this.createMessage(this.answerId,this.questionId,this.toUserId);const t=e.database().collection("answers");let i=this.currentReplyTo._id;this.currentReplyTo.parent_id&&(i=this.currentReplyTo.parent_id);const l={content:this.replyContent,parent_id:i,reply_to:this.currentReplyTo.user_id._id,question_id:this._id};await t.add(l),await this.getAnswers(),this.replyContent="",this.currentReplyTo=null,this.$refs.replyPopup.close(),s({title:"回复成功",icon:"none"})}catch(t){console.error("回复失败:",t),s({title:"回复失败",icon:"none"})}else s({title:"请先登录",icon:"none"})},goBack(){t()},handleUpdate(){i({url:"./edit?id="+this._id,events:{refreshData:()=>{this.$refs.udb.loadData({clear:!0}),this.getAnswers()}}})},async getAnswers(){try{let e=function(e){e.forEach((e=>{e.user_id&&e.user_id.length>0&&a.add(e.user_id),e.children&&e.children.length>0&&e.children.forEach((e=>{e.user_id&&e.user_id.length>0&&a.add(e.user_id),e.reply_to&&e.reply_to.length>0&&a.add(e.reply_to)}))}))},s=function(e){e.forEach((e=>{e.user_id&&e.user_id.length>0&&(e.user_id=r[e.user_id]),e.children&&e.children.length>0&&e.children.forEach((e=>{e.user_id&&e.user_id.length>0&&(e.user_id=r[e.user_id]),e.reply_to&&e.reply_to.length>0&&(e.reply_to=r[e.reply_to])}))}))},t=null;await R.collection("answers").where(`question_id == "${this._id}"`).orderBy(this.sortBy,this.sortDirection).get().then((e=>{t=e.result.data}));const i={};t.forEach((e=>{e.children=[],i[e._id]=e}));const l=[];t.forEach((e=>{e.parent_id?i[e.parent_id]&&i[e.parent_id].children.push(e):l.push(e)}));const a=new Set;e(l);let n=null;await R.collection("uni-id-users").where({_id:A.in([...a])}).field("_id, nickname, avatar_file").get().then((e=>{n=e.result.data}));const r={};n.forEach((e=>{r[e._id]=e})),s(l),this.answers=l,this.answersCount=l.length}catch(e){console.error("获取回答失败:",e)}},getSortField(){return"time"===this.sortBy?"time":"like_count"},async changeSort(e){this.sortBy===e?this.sortDirection="desc"===this.sortDirection?"asc":"desc":(this.sortBy=e,this.sortDirection="desc"),await this.getAnswers()},enlarge_photo(e,s){const t=e.map((e=>e.url));l({urls:t,current:s,indicator:"number"})},async chooseImage(){if(this.selectedImages.length>=3)s({title:"最多只能选择3张图片",icon:"none"});else try{const e=await a({count:3-this.selectedImages.length,sizeType:["compressed"],sourceType:["album","camera"]});this.selectedImages=[...this.selectedImages,...e.tempFilePaths]}catch(e){console.error(e)}},async submitAnswer(){if(!this.answerContent&&!this.selectedImages.length)return void s({title:"请输入回答内容或上传图片",icon:"none"});const t=[];if(this.selectedImages.length)for(let s of this.selectedImages){const i=await e.uploadFile({filePath:s,cloudPath:`answers/${Date.now()}-${Math.random()}.jpg`});t.push({url:i.fileID})}await R.collection("answers").add({question_id:this._id,content:this.answerContent,images:t,user_id:this.user_id}),this.getAnswers(),this.answerContent="",this.selectedImages=[],this.$refs.answerPopup.close()},isLiked(e){return!!e.liked_users&&e.liked_users.includes(this.currentUser._id)},async likeAnswer(t){if(this.currentUser._id)try{const i=e.database().collection("answers"),l=this.isLiked(t),a=this.currentUser._id;let n={};n=l?{like_count:Math.max(0,(t.like_count||1)-1),liked_users:(t.liked_users||[]).filter((e=>e!==a))}:{like_count:(t.like_count||0)+1,liked_users:t.liked_users?[...t.liked_users,a]:[a]},await i.doc(t._id).update(n),t.like_count=n.like_count,t.liked_users=n.liked_users,s({title:l?"已取消点赞":"点赞成功",icon:"none"})}catch(i){console.error("点赞操作失败:",i),s({title:"操作失败",icon:"none"})}else s({title:"请先登录",icon:"none"})},difficultyClass:e=>({easy:0===e,medium:1===e,hard:2===e}),difficultyText:e=>0===e?"简单":1===e?"中等":"困难",categoryText:e=>"math"===e?"数学题":"code"===e?"编程题":"resource"===e?"求资料":"其他",handleInputFocus(){this.$refs.answerPopup.open()},handlePopupChange(e){e.show||(this.tempContent="")},deleteImage(e){this.selectedImages.splice(e,1)},acceptAnswer(e){R.collection("questions").where(`_id=="${this._id}"`).update({best_answer_user_id:e.user_id._id,had_answer:!0}),this.getAnswers(),this.solved=!0,this.best_answer_user_id=e.user_id._id;let s={question_id:this._id,que_user_id:this.question_user_id,ans_user_id:e.user_id._id,difficulties:this.qhard};R.collection("manhour").add(s);let t=0;R.collection("uni-id-users").where(`_id == "${e.user_id._id}"`).field("workhour").get().then((e=>{e.result.data[0].workhour&&(t=e.result.data[0].workhour)}));R.collection("uni-id-users").where(`_id == "${e.user_id._id}"`).update({workhour:t+{0:5,1:10,2:15}[this.qhard]||t})}}},[["render",function(e,s,t,i,l,a){const D=v(n("uni-icons"),T),R=k,A=d,x=v(n("uni-load-more"),$),B=w,U=v(n("unicloud-db"),F),V=C,j=b,L=I,S=v(n("uni-popup"),P);return c(),r(A,null,{default:o((()=>[u(A,{class:"header-back"},{default:o((()=>[u(D,{type:"left",size:"24",onClick:a.goBack},null,8,["onClick"]),u(R,null,{default:o((()=>[_("返回")])),_:1})])),_:1}),u(A,{class:"original-post"},{default:o((()=>[u(U,{ref:"udb",collection:l.collectionList,where:l.queryWhere,getone:!0,manual:!0},{default:o((({data:e,loading:s,error:t})=>[t?(c(),r(A,{key:0},{default:o((()=>[_(h(t.message),1)])),_:2},1024)):s?(c(),r(A,{key:1},{default:o((()=>[u(x,{contentText:l.loadMore,status:"loading"},null,8,["contentText"])])),_:1})):e?(c(),r(A,{key:2},{default:o((()=>[u(A,{class:"user-info"},{default:o((()=>[u(A,{class:"avatar-container"},{default:o((()=>[u(B,{class:"avatar",mode:"aspectFill",src:e.user_id[0].avatar_file.url},null,8,["src"])])),_:2},1024),u(R,{class:"nickname"},{default:o((()=>[_(h(e.user_id[0].nickname),1)])),_:2},1024)])),_:2},1024),u(A,{class:"question-content"},{default:o((()=>[u(R,{class:"title"},{default:o((()=>[_(h(e.title),1)])),_:2},1024),u(R,{class:"description"},{default:o((()=>[_(h(e.descrip),1)])),_:2},1024),l.solved?(c(),p("img",{key:0,src:"/assets/SV-Bh8yOHCE.png",alt:"已解决",class:"resolved-icon"})):f("",!0)])),_:2},1024),u(A,null,{default:o((()=>[(c(!0),p(y,null,m(e.images,((s,t)=>(c(),p(y,null,["image"===s.fileType?(c(),r(B,{key:0,onClick:s=>a.enlarge_photo(e.images,t),class:"post-image",src:s.url},null,8,["onClick","src"])):f("",!0)],64)))),256))])),_:2},1024),u(A,{class:"tags"},{default:o((()=>[u(R,{class:g(["tag difficulty",a.difficultyClass(e.difficulties)])},{default:o((()=>[_(h(a.difficultyText(e.difficulties)),1)])),_:2},1032,["class"]),u(R,{class:"tag category"},{default:o((()=>[_(h(a.categoryText(e.category)),1)])),_:2},1024)])),_:2},1024)])),_:2},1024)):f("",!0)])),_:1},8,["collection","where"])])),_:1}),u(A,{class:"answers-section"},{default:o((()=>[u(A,{class:"answers-header"},{default:o((()=>[u(R,{class:"answers-count"},{default:o((()=>[_(h(l.answersCount)+"个回答",1)])),_:1}),u(A,{class:"sort-options"},{default:o((()=>[u(R,{class:g(["sort-item","time"===l.sortBy?"active":""]),onClick:s[0]||(s[0]=e=>a.changeSort("time"))},{default:o((()=>[_(" 最新 "),"time"===l.sortBy?(c(),r(R,{key:0,class:"sort-direction"},{default:o((()=>[_(h("desc"===l.sortDirection?"↓":"↑"),1)])),_:1})):f("",!0)])),_:1},8,["class"]),u(R,{class:g(["sort-item","like_count"===l.sortBy?"active":""]),onClick:s[1]||(s[1]=e=>a.changeSort("like_count"))},{default:o((()=>[_(" 最赞 "),"like_count"===l.sortBy?(c(),r(R,{key:0,class:"sort-direction"},{default:o((()=>[_(h("desc"===l.sortDirection?"↓":"↑"),1)])),_:1})):f("",!0)])),_:1},8,["class"])])),_:1})])),_:1}),u(A,{class:"answer-list"},{default:o((()=>[(c(!0),p(y,null,m(l.answers,((s,t)=>(c(),r(A,{key:t,class:"answer-item"},{default:o((()=>[u(A,{class:"answerer-info"},{default:o((()=>[s.user_id.avatar_file?(c(),r(B,{key:0,class:"avatar",src:s.user_id.avatar_file.url,mode:"aspectFill"},null,8,["src"])):f("",!0),u(R,{class:"nickname"},{default:o((()=>[_(h(s.user_id.nickname),1)])),_:2},1024),u(R,{class:"timestamp"},{default:o((()=>[_(h(a.timestampToDate(s.time)),1)])),_:2},1024)])),_:2},1024),u(A,{class:"answer-content"},{default:o((()=>[u(R,{class:"answer-text"},{default:o((()=>[_(h(s.content),1)])),_:2},1024),s.images&&s.images.length?(c(),r(A,{key:0,class:"answer-images"},{default:o((()=>[(c(!0),p(y,null,m(s.images,((e,t)=>(c(),r(B,{key:t,src:e.url,onClick:e=>a.enlarge_photo(s.images,t),mode:"aspectFill",class:"answer-image"},null,8,["src","onClick"])))),128))])),_:2},1024)):f("",!0),s.user_id._id===l.best_answer_user_id?(c(),p("img",{key:1,src:"/assets/BA-a5RrO6Vp.png",alt:"最佳答案",class:"best-answer-icon"})):f("",!0)])),_:2},1024),s.children&&s.children.length?(c(),r(A,{key:0,class:"replies-list"},{default:o((()=>[(c(!0),p(y,null,m(s.children,((s,t)=>(c(),r(A,{key:t,class:"reply-item",onClick:e=>a.handleReplyClick(s)},{default:o((()=>[s.reply_to&&s.reply_to._id===s.user_id._id?(c(),r(R,{key:0,class:"reply-nickname"},{default:o((()=>[_(h(s.user_id.nickname||e.游客)+" : ",1)])),_:2},1024)):(c(),r(R,{key:1,class:"reply-nickname"},{default:o((()=>[_(h(s.user_id.nickname||e.游客)+" 回复 "+h(s.reply_to.nickname||e.游客)+": ",1)])),_:2},1024)),u(R,{class:"reply-content"},{default:o((()=>[_(h(s.content),1)])),_:2},1024)])),_:2},1032,["onClick"])))),128))])),_:2},1024)):f("",!0),u(A,{class:"answer-actions"},{default:o((()=>[u(A,{class:"action-item",onClick:e=>a.likeAnswer(s)},{default:o((()=>[u(D,{type:"hand-up",size:"20",color:a.isLiked(s)?"#007AFF":"#666"},null,8,["color"]),u(R,{style:q({color:a.isLiked(s)?"#007AFF":"#666"})},{default:o((()=>[_(h(s.like_count||0),1)])),_:2},1032,["style"])])),_:2},1032,["onClick"]),u(A,{class:"action-item",onClick:e=>a.handleReply(s)},{default:o((()=>[u(D,{type:"chat",size:"20"}),u(R,null,{default:o((()=>[_("评论")])),_:1})])),_:2},1032,["onClick"]),l.currentUser._id!=l.question_user_id||l.solved||l.question_user_id==s.user_id._id?f("",!0):(c(),r(A,{key:0,onClick:e=>a.acceptAnswer(s)},{default:o((()=>[u(D,{type:"checkmarkempty"}),_(" 采纳 ")])),_:2},1032,["onClick"]))])),_:2},1024)])),_:2},1024)))),128))])),_:1})])),_:1}),u(A,{class:"footer-input"},{default:o((()=>[u(V,{modelValue:l.answerContent,"onUpdate:modelValue":s[2]||(s[2]=e=>l.answerContent=e),placeholder:"写下你的回答...",class:"input-trigger",onFocus:a.handleInputFocus},null,8,["modelValue","onFocus"])])),_:1}),u(S,{ref:"answerPopup",type:"bottom",onChange:a.handlePopupChange},{default:o((()=>[u(A,{class:"answer-popup"},{default:o((()=>[u(j,{modelValue:l.answerContent,"onUpdate:modelValue":s[3]||(s[3]=e=>l.answerContent=e),class:"answer-textarea",placeholder:"写下你的回答...","adjust-position":!1,"cursor-spacing":20,fixed:!0},null,8,["modelValue"]),l.selectedImages.length?(c(),r(A,{key:0,class:"selected-images"},{default:o((()=>[(c(!0),p(y,null,m(l.selectedImages,((e,s)=>(c(),r(A,{class:"image-item",key:s},{default:o((()=>[u(B,{src:e,mode:"aspectFill"},null,8,["src"]),u(A,{class:"delete-btn",onClick:e=>a.deleteImage(s)},{default:o((()=>[_("×")])),_:2},1032,["onClick"])])),_:2},1024)))),128))])),_:1})):f("",!0),u(A,{class:"popup-footer"},{default:o((()=>[u(A,{class:"left-actions"},{default:o((()=>[u(D,{type:"image",size:"24",color:"#666",onClick:a.chooseImage},null,8,["onClick"]),l.selectedImages.length?(c(),r(R,{key:0,class:"image-count"},{default:o((()=>[_(h(l.selectedImages.length)+"/3",1)])),_:1})):f("",!0)])),_:1}),u(L,{class:"submit-btn",disabled:!l.answerContent&&!l.selectedImages.length,onClick:a.submitAnswer},{default:o((()=>[_("发布")])),_:1},8,["disabled","onClick"])])),_:1})])),_:1})])),_:1},8,["onChange"]),u(S,{ref:"replyPopup",type:"bottom"},{default:o((()=>[u(A,{class:"reply-popup"},{default:o((()=>[u(j,{modelValue:l.replyContent,"onUpdate:modelValue":s[4]||(s[4]=e=>l.replyContent=e),class:"reply-textarea",placeholder:l.replyPlaceholder,"adjust-position":!1,"cursor-spacing":20,fixed:!0,"auto-height":""},null,8,["modelValue","placeholder"]),u(A,{class:"popup-footer"},{default:o((()=>[u(L,{class:"submit-btn",disabled:!l.replyContent,onClick:a.submitReply},{default:o((()=>[_("发送")])),_:1},8,["disabled","onClick"])])),_:1})])),_:1})])),_:1},512)])),_:1})}],["__scopeId","data-v-6a745122"]]);export{x as default};
