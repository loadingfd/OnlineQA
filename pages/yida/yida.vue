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
        <view v-if="questions && questions.length">
            <uni-list class="question-list">
                <uni-list-item v-for="(item, index) in questions" :key="index" 
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
        </view>
        <view v-else class="empty-state">
            <text class="empty-text">暂无回答过的问题</text>
        </view>
    </view>
</view>
</template>

<script>
const db = uniCloud.database()
export default {
    data() {
        return {
            userInfo: null,
            field: 'title,time,descrip,difficulties,category',
            questions: [] // 在这里定义 questions
        }
    },
    created() {
       
        const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
                if (userInfo) {
                    this.userInfo = userInfo
                    this.getCommentedQuestions()
                }
    },
    methods: {
        async getCommentedQuestions() {
            try {
                // 1. 先获取用户的所有回答
                const answersRes = await db.collection('answers')
                    .where({
                        user_id: this.userInfo._id
                    })
                    .field('question_id')
                    .get()
                
                if (answersRes.result && answersRes.result.data && answersRes.result.data.length > 0) {
                    const questionIds = [...new Set(answersRes.result.data.map(answer => answer.question_id))]
               
                    
                    // 2. 直接查询这些问题
                    const questionsRes = await db.collection('questions')
                        .where(`_id in [${questionIds.map(id => `'${id}'`).join(',')}]`)
                        .field(this.field)
                        .get()
                        
                  
                    
                    // 3. 将结果存储到 data 中
                    this.questions = questionsRes.result.data || []
                } else {
                    this.questions = []
                }
            } catch (e) {
                console.error('获取回答失败:', e)
                this.questions = []
            }
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
    onPullDownRefresh() {
        this.getCommentedQuestions().then(() => {
            uni.stopPullDownRefresh()
        })
    }
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