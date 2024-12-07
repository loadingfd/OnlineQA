<template>
  <view >
	    <view class="header-back">
	             <uni-icons type="left" size="24" @click="goBack"></uni-icons>
	             <text>返回</text>
	           </view>
	  <view class="original-post">
    <unicloud-db ref="udb" v-slot:default="{data, loading, error, options}" :options="options" :collection="collectionList" field="title,descrip,difficulties,category,images,is_stick,user_id{nickname,avatar_file}" :where="queryWhere" :getone="true" :manual="true">
      <view v-if="error">{{error.message}}</view>
      <view v-else-if="loading">
        <uni-load-more :contentText="loadMore" status="loading"></uni-load-more>
      </view>
      <view v-else-if="data" >
		  <view class="user-info">
		    <view class="avatar-container">
	          <cloud-image class="avatar" mode="aspectFill" :src="data.user_id[0].avatar_file.url" />
		    </view>
			<text class="nickname"> {{data.user_id[0].nickname}}</text> 
		  </view>	
        <view class="question-content">
          <text class="title">{{data.title}}</text>
          <text class="description">{{data.descrip}}</text>
        </view>
        <view>
        <template v-for="(file, j) in data.images">
        <cloud-image class="post-image" mode="aspectFill" :src="file.url" v-if="file.fileType === 'image'" />
        </template>
        </view>
        <view class="tags">
          <text v-if="data.is_stick" class="stick-tag">置顶</text>
		   <text class="tag difficulty" :class="{ 'easy': data.difficulties === 0, 'medium': data.difficulties=== 1, 'hard': data.difficulties === 2 }">{{options.difficulties_valuetotext[data.difficulties]}}</text>
		   <text class="tag category">{{options.category_valuetotext[data.category]}}</text>
          <!-- <text>{{data.is_stick == true ? '✅' : '❌'}}</text> -->
        </view>
		
      </view>
    </unicloud-db>
    <!-- <view class="btns">
      <button type="primary" @click="handleUpdate">修改</button>
      <button type="warn" class="btn-delete" @click="handleDelete">删除</button>
    </view> -->
	<view class="footer-input">
		<view class="icon-container"> 
		  <uni-icons type="home" size="20" class="left-icon"> </uni-icons>
		</view>
		<view>
		  <input placeholder="请输入你的回答" class="input-with-icon"/>
		</view>
		<view class="icon-container">
			<uni-icons type="image" size="23" class="right-icon"></uni-icons>
		</view>
			<button class="sendbtn">发送</button>
	</view>
   </view>
  </view>
  
    <view class="reply"></view>
	<view>
		<text class> 回复</text>
	</view>
</template>


<script>
  // 由schema2code生成，包含校验规则和enum静态数据
  import { enumConverter } from '../../js_sdk/validator/questions.js'
  const db = uniCloud.database()

  export default {
    data() {
      return {
        queryWhere: '',
        collectionList: "questions,uni-id-users",
        loadMore: {
          contentdown: '',
          contentrefresh: '',
          contentnomore: ''
        },
        options: {
          // 将scheme enum 属性静态数据中的value转成text
          ...enumConverter
        },
		// 新增，用于存储查询到的用户昵称
      }
    },
    onLoad(e) {
      this._id = e.id
    },
    onReady() {
      if (this._id) {
        this.queryWhere = '_id=="' + this._id + '"'
      }
    },
    methods: {
	  goBack() {
		    uni.navigateBack();
	      },
      handleUpdate() {
        // 打开修改页面
        uni.navigateTo({
          url: './edit?id=' + this._id,
          events: {
            // 监听修改页面成功修改数据后, 刷新当前页面数据
            refreshData: () => {
              this.$refs.udb.loadData({
                clear: true
              })
            }
          }
        })
      },
      handleDelete() {
        this.$refs.udb.remove(this._id, {
          success: (res) => {
            // 删除数据成功后跳转到list页面
            uni.navigateTo({
              url: './list'
            })
          }
        })
      }
    },
	
  }
</script>

<style>
  .post-image{
	    
	    width: 100%; /* 假设图片占满父容器宽度，如果有不同需求可调整 */
	    margin-bottom: 10px;
		 margin-left: 20px;/* 图片之间的垂直间距 */
	    border-radius: 5px;
	    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 图片阴影效果 */
	
  }	
  .container {
    background-color: #f4f4f4;
	margin-bottom: 0px;
  }

  .btns {
    margin-top: 10px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
  }

  .btns button {
    flex: 1;
  }

  .btn-delete {
    margin-left: 10px;
  }
	
  .original-post {
	    background-color: transparent; /* 统一设置与回复相同的背景色 */
	  
	    
	    margin-bottom: 10px; /* 添加底部外边距，让原帖和回复之间有间隔 */
	    padding: 10px; /* 添加内边距，让内容不紧贴边框 */
  }
	
  .reply {
		margin-top: 5px;
	    background-color: transparent; /* 统一设置背景色 */
	    padding: 10px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) inset;
  }

	.user-info {
		display: flex;
		padding: 20rpx;
		margin-left: 0rpx;
		margin-bottom: 0rpx;
	}

	.avatar-container {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		margin-bottom: 0rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.nickname {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin-left: 20rpx;
		margin-top:15px;
	}

	.question-content {
		padding: 0rpx 0rpx 0rpx 30rpx;
		width: calc(90% - 60px);
	}

	.title-container {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.stick-tag {
		font-size: 24rpx;
		color: #ff5a5f;
		border: 1px solid #ff5a5f;
		padding: 2rpx 10rpx;
		border-radius: 10rpx;
		margin-right: 10rpx;
		
	}
	.tags{
		margin-left: 15px;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.description {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 15rpx;
		display: block;
		text-align: left;
		word-wrap: break-word;
		word-break: break-all;
		white-space: pre-wrap;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.tag {
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}

	.difficulty {
		background-color: #e6f3ff;
		color: #409eff;
	}

	.difficulty.easy {
		background-color: #f0f9eb;
		color: #67c23a;
	}

	.difficulty.medium {
		background-color: #fdf6ec;
		color: #e6a23c;
	}

	.difficulty.hard {
		background-color: #fef0f0;
		color: #f56c6c;
	}

	.category {
		background-color: #f0f9eb;
		color: #67c23a;
	}
	
	.footer-input {
	     position: fixed;
	     bottom: 0;
	     left: 0;
	     width: 100%;
	     background-color: #fff;
	     padding: 10px;
	     box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
		 display: flex;
    }
	
	.icon-container {
	    display: flex;
	    flex-direction: column;
	    align-items: flex-start;
	    margin-right: 10px;
	}
	
	.input-with-icon {
	    flex: 1;
		height: 30px;
		width:203px;
		margin-top:4px;
	    margin-right: 10px; 
	    outline: none;
	    font-size: 16px;
	    padding-left: 5px;
		background-color: #ededed;
		 border-radius: 10px;
	}
	
	.icon-text {
	    font-size: 12px;
	    color: #666;
	}
	
	.right-icon{
		
		margin-right: 10px;
		margin-top: 7px;
	}
	.left-icon{
		margin-left: 0px;
		margin-top: 7px;
	}
	
	.header-back {
	       display: flex;
	       align-items: center;
	       background-color: #f4f4f4;
	       height: 40px;
	       padding-left: 10px;
	    
	}
	
	.header-back.un-icons {
	       margin-right: 10px;
	}
	
	.sendbtn{
		margin-right: 20px;
	}
</style>
