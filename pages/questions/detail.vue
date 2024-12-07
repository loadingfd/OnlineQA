<template>
    <view>
        <view class="header-back">
            <uni-icons type="left" size="24" @click="goBack"></uni-icons>
            <text>返回</text>
        </view>
        <view class="original-post">
            <unicloud-db ref="udb" v-slot:default="{ data, loading, error }" :collection="collectionList"
                :where="queryWhere" :getone="true" :manual="true">
                <view v-if="error">{{ error.message }}</view>
                <view v-else-if="loading">
                    <uni-load-more :contentText="loadMore" status="loading"></uni-load-more>
                </view>
                <view v-else-if="data">
                    <view class="user-info">
                        <view class="avatar-container">
                            <image class="avatar" mode="aspectFill" :src="data.user_id[0].avatar_file.url" />
                        </view>
                        <text class="nickname"> {{ data.user_id[0].nickname }}</text>
                    </view>
                    <view class="question-content">
                        <text class="title">{{ data.title }}</text>
                        <text class="description">{{ data.descrip }}</text>
                    </view>
                    <view>
                        <template v-for="(file, j) in data.images">
                            <image class="post-image" :src="file.url"
                                v-if="file.fileType === 'image'" />
                        </template>
                    </view>
                    <view class="tags">
                        <text class="tag difficulty" :class="difficultyClass(data.difficulties)">
                            {{ difficultyText(data.difficulties) }}
                        </text>
                        <text class="tag category">{{ categoryText(data.category) }}</text>
                    </view>
                </view>
            </unicloud-db>
        </view>

        <view class="answers-section">
            <view class="answers-header">
                <text class="answers-count">{{ answersCount }}个回答</text>
                <view class="sort-options">
                    <text :class="['sort-item', sortBy === 'time' ? 'active' : '']" @click="changeSort('time')">最新</text>
                    <text :class="['sort-item', sortBy === 'thumbs' ? 'active' : '']" @click="changeSort('thumbs')">最赞</text>
                </view>
            </view>

            <view class="answer-list">
                <view v-for="(answer, index) in answers" :key="index" class="answer-item">
                    <view class="answerer-info">
                        <image class="avatar" :mode="scaleToFill" :src="answer.user.avatar" mode="aspectFill" />
                        <text class="nickname">{{ answer.user.nickname }}</text>
                    </view>
                    <view class="answer-content">
                        <text class="answer-text">{{ answer.content }}</text>
                        <view class="answer-images" v-if="answer.images && answer.images.length">
                            <image v-for="(img, i) in answer.images" :key="i" :src="img.url" mode="aspectFill" class="answer-image" />
                        </view>
                    </view>
                    <view class="answer-actions">
                        <view class="action-item" @click="likeAnswer(answer)">
                            <uni-icons type="hand-up" size="20" color="#409EFF" />
                            <text>{{ answer.thumbs }}</text>
                        </view>
                        <view class="action-item">
                            <uni-icons type="chat" size="20" />
                            <text>评论</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="footer-input">
            <input v-model="answerContent" placeholder="写下你的回答..." class="input-trigger" @focus="handleInputFocus" />
        </view>

        <uni-popup ref="answerPopup" type="bottom" @change="handlePopupChange">
            <view class="answer-popup">
                <textarea 
                    v-model="answerContent"
                    class="answer-textarea"
                    placeholder="写下你的回答..."
                    :adjust-position="false"
                    :cursor-spacing="20"
                    :fixed="true"
                />
                
                <view class="selected-images" v-if="selectedImages.length">
                    <view class="image-item" v-for="(image, index) in selectedImages" :key="index">
                        <image :src="image" mode="aspectFill" />
                        <view class="delete-btn" @click="deleteImage(index)">×</view>
                    </view>
                </view>
                
                <view class="popup-footer">
                    <view class="left-actions">
                        <uni-icons 
                            type="image" 
                            size="24" 
                            color="#666"
                            @click="chooseImage"
                        />
                        <text class="image-count" v-if="selectedImages.length">{{selectedImages.length}}/3</text>
                    </view>
                    <button 
                        class="submit-btn" 
                        :disabled="!answerContent && !selectedImages.length"
                        @click="submitAnswer"
                    >发布</button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>


<script>
const db = uniCloud.database()

export default {
    data() {
        return {
            queryWhere: '',
            collectionList: null,
            usersTmp: null,
            question: null,
            loadMore: {
                contentdown: '',
                contentrefresh: '',
                contentnomore: ''
            },
            answers: [],
            answersCount: 0,
            sortBy: 'time',
            answerContent: '',
            selectedImages: [],
            currentUser: {
                _id: ''
            }
        }
    },
    onLoad(e) {
        this._id = e.id
    },
    onReady() {
        if (this._id) {
            this.queryWhere = '_id=="' + this._id + '"'
            this.question = db.collection('questions').where(`_id=="${this._id}"`).getTemp()
            this.usersTmp = db.collection('uni-id-users').field('_id,nickname,avatar_file').getTemp()
            this.collectionList = [this.question, this.usersTmp]
            
            this.getAnswers()
        }
    },
    methods: {
        goBack() {
            uni.navigateBack()
        },
        handleUpdate() {
            uni.navigateTo({
                url: './edit?id=' + this._id,
                events: {
                    refreshData: () => {
                        this.$refs.udb.loadData({
                            clear: true
                        })
                        this.getAnswers()
                    }
                }
            })
        },
        async getAnswers() {
            const answers = await db.collection('answers')
                .where({
                    question_id: this._id
                })
                .orderBy(this.sortBy, 'desc')
                .get()
            
            this.answers = answers.data
            this.answersCount = answers.data.length
        },
        
        changeSort(type) {
            this.sortBy = type
            this.getAnswers()
        },
        
        async chooseImage() {
            if (this.selectedImages.length >= 3) {
                uni.showToast({
                    title: '最多只能选择3张图片',
                    icon: 'none'
                });
                return;
            }
            
            try {
                const res = await uni.chooseImage({
                    count: 3 - this.selectedImages.length,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera']
                });
                
                this.selectedImages = [...this.selectedImages, ...res.tempFilePaths];
            } catch (e) {
                console.error(e);
            }
        },
        
        async submitAnswer() {
            if(!this.answerContent && !this.selectedImages.length) {
                uni.showToast({
                    title: '请输入回答内容或上传图片',
                    icon: 'none'
                })
                return
            }
            
            const imageUrls = []
            if(this.selectedImages.length) {
                for(let path of this.selectedImages) {
                    const res = await uniCloud.uploadFile({
                        filePath: path,
                        cloudPath: `answers/${Date.now()}-${Math.random()}.jpg`
                    })
                    imageUrls.push({
                        url: res.fileID
                    })
                }
            }
            
            await db.collection('answers').add({
                question_id: this._id,
                content: this.answerContent,
                images: imageUrls,
                user_id: this.currentUser._id,
                thumbs: 0,
                create_time: Date.now()
            })
            
            this.getAnswers()
            
            this.answerContent = ''
            this.selectedImages = []
        },

        async likeAnswer(answer) {
            const dbAnswer = db.collection('answers').doc(answer._id)
            await dbAnswer.update({
                thumbs: db.command.inc(1)
            })
            answer.thumbs += 1
        },

        difficultyClass(difficulty) {
            return {
                easy: difficulty === 0,
                medium: difficulty === 1,
                hard: difficulty === 2
            }
        },

        difficultyText(difficulty) {
            return difficulty === 0 ? '简单' : difficulty === 1 ? '中等' : '困难'
        },

        categoryText(category) {
            return category === 'math' ? '数学题' :
                   category === 'code' ? '编程题' :
                   category === 'resource' ? '求资料' : '其他'
        },

        handleInputFocus() {
            this.$refs.answerPopup.open()
        },

        handlePopupChange(e) {
            if (!e.show) {
                this.tempContent = '';
            }
        },

        deleteImage(index) {
            this.selectedImages.splice(index, 1);
        }
    }
}
</script>

<style>
.header-back {
    display: flex;
    align-items: center;
    background-color: #f4f4f4;
    height: 40px;
    padding-left: 10px;
}

.header-back uni-icons {
    margin-right: 10px;
}

.original-post {
    background-color: #ffffff;
    margin-bottom: 10px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.user-info {
    display: flex;
    padding: 10rpx;
    margin-left: 0;
    margin-bottom: 10rpx;
    align-items: center;
}

.avatar-container {
    display: flex;
    align-items: center;
}

.avatar {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    margin-right: 10rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.nickname {
    font-size: 30rpx;
    color: #666;
}

.question-content {
    margin-left: 10rpx;
    width: 90%;
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
    margin-left: 15px;
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

.answers-section {
    padding: 20rpx 30rpx;
    padding-bottom: 120rpx;
    background-color: #fff;
}

.answers-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
}

.answers-count {
    font-size: 28rpx;
    color: #666;
}

.sort-options {
    display: flex;
    gap: 20rpx;
}

.sort-item {
    padding: 10rpx 20rpx;
    font-size: 28rpx;
    color: #666;
    cursor: pointer;
}

.sort-item.active {
    color: #007AFF;
    font-weight: bold;
}

.answer-list {
    margin-top: 20rpx;
}

.answer-item {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.answerer-info {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
}

.answerer-info .avatar {
    width: 35rpx;
    height: 35rpx;
}

.answerer-info .nickname {
    font-size: 26rpx;
    color: #333;
    margin-left: 10rpx;
}

.answer-content {
    margin: 20rpx 0;
}

.answer-text {
    font-size: 28rpx;
    line-height: 1.6;
    color: #333;
}

.answer-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 20rpx;
}

.answer-image {
    width: 220rpx;
    height: 220rpx;
    border-radius: 8rpx;
}

.answer-actions {
    display: flex;
    gap: 40rpx;
    margin-top: 20rpx;
    color: #666;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 10rpx;
    cursor: pointer;
}

.action-item uni-icons {
    margin-right: 5rpx;
}

.footer-input {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background-color: #fff;
    border-top: 1px solid #eee;
}

.input-with-icon {
    flex: 1;
    height: 60rpx;
    padding-left: 15rpx;
    font-size: 28rpx;
    background-color: #f0f0f0;
    border-radius: 30rpx;
    outline: none;
}

.icon-container uni-icons {
    cursor: pointer;
}

.post-image {
	width: 200rpx;
	height: 200rpx;
}

.footer-input {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background-color: #fff;
    border-top: 1px solid #eee;
}

.input-trigger {
    margin: 0rpx 0rpx 0rpx 0rpx;
    height: 72rpx;
    background-color: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
}

.answer-popup {
    background-color: #fff;
    padding: 30rpx;
    padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.answer-textarea {
    width: 100%;
    height: 300rpx;
    font-size: 32rpx;
    line-height: 48rpx;
    padding: 20rpx;
    box-sizing: border-box;
    background-color: #f5f5f5;
    border-radius: 16rpx;
}

.selected-images {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-top: 30rpx;
}

.image-item {
    position: relative;
    width: 160rpx;
    height: 160rpx;
}

.image-item image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
}

.delete-btn {
    position: absolute;
    right: -12rpx;
    top: -12rpx;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
}

.popup-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30rpx;
}

.left-actions {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.image-count {
    font-size: 24rpx;
    color: #999;
}

.submit-btn {
    background-color: #007AFF;
    color: #fff;
    font-size: 28rpx;
    padding: 0 40rpx;
    height: 60rpx;
	width: 140rpx;
    line-height: 60rpx;
    border-radius: 36rpx;
    margin-right: 0rpx;
    border: 1rpx solid;
}

.submit-btn:disabled {
    background-color: #ccc;
}
</style>