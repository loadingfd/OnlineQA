<template>
	<view class="header-back">
	    <uni-icons type="left" size="24" @click="goBack"></uni-icons>
	    <text>返回</text>
	</view>
    <view class="container">
		<view v-if="!userInfo" class="login-tip">
		            <text class="tip-text">请先登录后查看</text>
		</view>
		<view v-else>
        <unicloud-db ref="udb" v-slot:default="{ data, loading, hasMore, error }" 
            collection="questions" 
            :where="dbWhere" 
            :field="field" 
            :getone="false" 
            :getcount="true" 
            orderby="time desc">
            <view v-if="error" class="error-message">{{ error.message }}</view>
            <view v-else>
                <uni-list class="question-list" v-if="data && data.length">
                    <uni-list-item v-for="(item, index) in data" :key="index" 
                        showArrow 
                        :clickable="true"
                        @click="handleItemClick(item._id)" 
                        class="list-item">
                        <template v-slot:body>
                            <view class="question-content">
                                <view class="title-container">
                                    <text class="title">{{ item.title }}</text>
                                </view>
                                <text class="description">{{ item.descrip }}</text>
                                <view class="tags">
                                    <text class="tag difficulty"
                                        :class="{ 'easy': item.difficulties === 0, 'medium': item.difficulties === 1, 'hard': item.difficulties === 2 }">
                                        {{ item.difficulties === 0 ? '简单' : item.difficulties === 1 ? '中等' : '困难' }}
                                    </text>
                                    <text class="tag category">{{ item.category === 'math' ? '数学题' :
                                        item.category === 'code' ? '编程题' :
                                            item.category === 'resource' ? '求资料' : '其他'}}</text>
                                </view>
                            </view>
                        </template>
                    </uni-list-item>
                </uni-list>
                <view v-else-if="!loading" class="empty-state">
                    <text class="empty-text">暂无发布的问题</text>
                </view>
            </view>
            <uni-load-more class="load-more"
                :status="loading ? 'loading' : (hasMore ? 'more' : 'noMore')"></uni-load-more>
        </unicloud-db>
    </view>
	</view>
</template>

<script>
export default {
    data() {
        return {
            userInfo: null,
            dbWhere: '',
            field: 'title,time,descrip,difficulties,category'
        }
    },
    created() {
        const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
        if (userInfo) {
            this.userInfo = userInfo
			
            this.setWhere()
        } else {
            uni.navigateTo({
                url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
            })
        }
    },
    methods: {
        setWhere() {
            // 设置查询条件：查询当前用户发布的且未删除的问题
            this.dbWhere = `user_id == '${this.userInfo._id}' && states == true`
			 
        },
        handleItemClick(id) {
            uni.navigateTo({
                url: '/pages/questions/detail?id=' + id
            })
        },
		goBack() {
			uni.navigateBack()
		}
    },
	onLoad() {
	        // 监听数据变化
	        this.$refs.udb && this.$refs.udb.$on('load', (data) => {
	            console.log('加载的数据:', data)
	        })
	    },
    // 下拉刷新
    onPullDownRefresh() {
        this.$refs.udb.loadData({
            clear: true
        }, () => {
            uni.stopPullDownRefresh()
        })
    },
    // 触底加载更多
    onReachBottom() {
        this.$refs.udb.loadMore()
    },
	
}
</script>

<style lang="scss">
.container {
    padding: 20rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.question-list {
    background: transparent;
}

.list-item {
    margin-bottom: 20rpx;
    border-radius: 15rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.question-content {
    padding: 15rpx;
}

.title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
}

.description {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 15rpx;
}

.tags {
    display: flex;
    gap: 10rpx;
}

.tag {
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
}

.difficulty {
    &.easy {
        background-color: #f0f9eb;
        color: #67c23a;
    }
    &.medium {
        background-color: #fdf6ec;
        color: #e6a23c;
    }
    &.hard {
        background-color: #fef0f0;
        color: #f56c6c;
    }
}

.category {
    background-color: #f0f9eb;
    color: #67c23a;
}

.empty-state {
    text-align: center;
    padding: 100rpx 0;
    
    .empty-text {
        color: #999;
        font-size: 28rpx;
    }
}

.load-more {
    margin: 20rpx 0;
}
.header-back {
    display: flex;
    align-items: center;
    background-color: #f4f4f4;
    height: 40px;
    padding-left: 10px;
}

</style>