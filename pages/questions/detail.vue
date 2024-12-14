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
							<image @click="enlarge_photo(file)" class="post-image" :src="file.url"
								v-if="file.fileType === 'image'" />
							<div class="largephoto" v-if="showModal">
								<span class="closelargeimage" @click="recover_photo()">&times;</span>
								<image class="largeimage" :src="large_photo" />
							</div>
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
					<text :class="['sort-item', sortBy === 'time' ? 'active' : '']" @click="changeSort('time')">
						最新
						<text v-if="sortBy === 'time'" class="sort-direction">
							{{ sortDirection === 'desc' ? '↓' : '↑' }}
						</text>
					</text>
					<text :class="['sort-item', sortBy === 'thumbs' ? 'active' : '']" @click="changeSort('thumbs')">
						最赞
						<text v-if="sortBy === 'thumbs'" class="sort-direction">
							{{ sortDirection === 'desc' ? '↓' : '↑' }}
						</text>
					</text>
				</view>
			</view>

			<view class="answer-list">
				<view v-for="(answer, index) in answers" :key="index" class="answer-item">
					<view class="answerer-info">
						<image class="avatar" :src="answer.user_id[0].avatar_file.url" mode="aspectFill"
							v-if="answer.user_id[0].avatar_file" />
						<text class="nickname">{{ answer.user_id[0].nickname }}</text>
						<text class="lou"> {{index+1}}楼</text>
					</view>

					<view class="answer-content">
						<text class="answer-text">{{ answer.content }}</text>
						<view class="answer-images" v-if="answer.images && answer.images.length">
							<image v-for="(img, i) in answer.images" :key="i" :src="img.url" mode="aspectFill"
								class="answer-image" />
						</view>
					</view>
					<!-- 回复列表部分 -->
					<view class="replies-list" v-if="answer.replies && answer.replies.length">
						<view v-for="(reply, replyIndex) in answer.replies" :key="replyIndex" class="reply-item">
							<text class="reply-nickname" v-if="reply.reply_to">{{ reply.user_id[0].nickname }}</text>
							<text class="reply-nickname" v-else> {{ reply.user_id[0].nickname }}：</text>
							<text class="reply-text" v-if="reply.reply_to">回复 {{ reply.reply_to[0].nickname }}:</text>
							<text class="reply-content">{{ reply.content }}</text>
						</view>
					</view>

					<view class="answer-actions">
						<view class="action-item" @click="likeAnswer(answer)">
							<uni-icons type="hand-up" size="20" :color="isLiked(answer) ? '#007AFF' : '#666'" />
							<text
								:style="{ color: isLiked(answer) ? '#007AFF' : '#666' }">{{ answer.like_count || 0 }}</text>
						</view>
						<view class="action-item" @click="handleReply(answer)">
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
				<textarea v-model="answerContent" class="answer-textarea" placeholder="写下你的回答..."
					:adjust-position="false" :cursor-spacing="20" :fixed="true" />

				<view class="selected-images" v-if="selectedImages.length">
					<view class="image-item" v-for="(image, index) in selectedImages" :key="index">
						<image :src="image" mode="aspectFill" />
						<view class="delete-btn" @click="deleteImage(index)">×</view>
					</view>
				</view>

				<view class="popup-footer">
					<view class="left-actions">
						<uni-icons type="image" size="24" color="#666" @click="chooseImage" />
						<text class="image-count" v-if="selectedImages.length">{{selectedImages.length}}/3</text>
					</view>
					<button class="submit-btn" :disabled="!answerContent && !selectedImages.length"
						@click="submitAnswer">发布</button>
				</view>
			</view>
		</uni-popup>
		<!-- 添加回复弹出框 -->
		<uni-popup ref="replyPopup" type="bottom">
			<view class="reply-popup">
				<textarea v-model="replyContent" class="reply-textarea" :placeholder="replyPlaceholder"
					:adjust-position="false" :cursor-spacing="20" :fixed="true" auto-height />
				<view class="popup-footer">
					<button class="submit-btn" :disabled="!replyContent" @click="submitReply">发送</button>
				</view>
			</view>
		</uni-popup>
		<view class="image-viewer" v-if="showModal" @click="recover_photo">
			<movable-area class="movable-area">
				<movable-view class="movable-view" direction="all" :scale="true" :scale-min="1" :scale-max="4"
					:scale-value="1" out-of-bounds>
					<image :src="large_photo" class="preview-image" mode="aspectFit" @click.stop />
				</movable-view>
			</movable-area>
			<view class="close-btn" @click.stop="recover_photo">×</view>
		</view>
	</view>
</template>


<script>
	const db = uniCloud.database()
	const dbJQL = uniCloud.databaseForJQL()

	export default {
		data() {
			return {
				large_photo: '',
				showModal: false,
				queryWhere: '',
				collectionList: null,
				postList: null,
				usersTmp: null,
				question: null,
				loadMore: {
					contentdown: '',
					contentrefresh: '',
					contentnomore: ''
				},
				answers: null,
				answersCount: 0,
				sortBy: 'time',
				sortDirection: 'desc',
				answerContent: '',
				selectedImages: [],
				currentUser: {
					_id: ''
				},
				replyContent: '',
				currentReplyTo: null,
				replyPlaceholder: '写下你的评论...'
			}
		},
		onLoad(e) {
			this._id = e.id
		},
		async onReady() {
			if (this._id) {
				this.queryWhere = '_id=="' + this._id + '"'
				this.question = db.collection('questions').where(`_id=="${this._id}"`).getTemp()
				this.usersTmp = db.collection('uni-id-users').field('_id,nickname,avatar_file').getTemp()
				this.collectionList = [this.question, this.usersTmp]

				await this.getCurrentUser() // 添加这行
				await this.getAnswers()
			}
		},
		methods: {
			// 处理回复点击
			handleReply(answer) {
				this.currentReplyTo = answer
				this.replyPlaceholder = `回复 ${answer.user_id[0].nickname}`
				this.$refs.replyPopup.open()
			},

			// 提交回复

			async submitReply() {
				if (!this.currentUser._id) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				try {
					const db = uniCloud.database()
					const answersCollection = db.collection('answers')

					// 创建新回复,添加 reply_to 字段
					const replyData = {
						content: this.replyContent,
						parent_id: this.currentReplyTo._id,
						user_id: this.currentUser._id,
						reply_to: this.currentReplyTo.user_id[0]._id, // 添加被回复者的id
						time: Date.now(),
						question_id: this._id
					}

					await answersCollection.add(replyData)

					// 刷新回答列表
					await this.getAnswers()

					// 清理并关闭弹窗
					this.replyContent = ''
					this.currentReplyTo = null
					this.$refs.replyPopup.close()

					uni.showToast({
						title: '回复成功',
						icon: 'none'
					})
				} catch (error) {
					console.error('回复失败:', error)
					uni.showToast({
						title: '回复失败',
						icon: 'none'
					})
				}
			},

			async getCurrentUser() {
				try {
					const db = uniCloud.database()
					const userInfo = await db.collection('uni-id-users')
						.where('_id == $cloudEnv_uid')
						.field('_id,nickname,avatar_file')
						.get()

					if (userInfo.result.data.length > 0) {
						this.currentUser = userInfo.result.data[0]
					}
				} catch (error) {
					console.error('获取用户信息失败:', error)
				}
			},

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
			// 修改 getAnswers 方法以包含回复数据和用户信息
			async getAnswers() {
			  try {
			    const db = uniCloud.database()
			    // 获取回答
			    const answerTmp = db.collection("answers")
			      .where(`question_id == "${this._id}" && parent_id == null`) // 只获取主回答
			      .orderBy(this.sortBy, this.sortDirection)
			      .getTemp()
			
			    const mainAnswers = await db.collection(answerTmp, this.usersTmp).get()
			
			    if (mainAnswers.result.data) {
			      // 获取每个回答的回复
			      for (let answer of mainAnswers.result.data) {
			        const repliesTmp = db.collection('answers')
			          .where(`parent_id == "${answer._id}"`)
			          .orderBy('time', 'asc')
			          .getTemp()
			          
			        // 关联用户表获取回复者和被回复者的信息
			        const replies = await db.collection(repliesTmp, this.usersTmp)
			          .get()
			
			        // 为每个回复获取被回复者的信息
			        for (let reply of replies.result.data) {
			          if (reply.reply_to) {
			            const replyToUser = await db.collection('uni-id-users')
			              .doc(reply.reply_to)
			              .field('nickname,avatar_file')
			              .get()
			            reply.reply_to = replyToUser.result.data
			          }
			        }
			
			        answer.replies = replies.result.data
			      }
			
			      this.answers = mainAnswers.result.data
			      this.answersCount = this.answers.length
			    }
			  } catch (err) {
			    console.error('获取回答失败:', err)
			  }
			},

			// 获取排序字段
			getSortField() {
				return this.sortBy === 'time' ? 'time' : 'like_count'
			},

			// 切换排序方式
			async changeSort(type) {
				if (this.sortBy === type) {
					// 如果点击相同的排序方式，切换排序方向
					this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc'
				} else {
					// 切换排序方式时，重置为降序
					this.sortBy = type
					this.sortDirection = 'desc'
				}
				await this.getAnswers() // 重新获取数据
			},

			enlarge_photo(file) {
				this.large_photo = file.url;
				this.showModal = true;
			},

			recover_photo() {
				this.showModal = false;
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
				if (!this.answerContent && !this.selectedImages.length) {
					uni.showToast({
						title: '请输入回答内容或上传图片',
						icon: 'none'
					})
					return
				}

				const imageUrls = []
				if (this.selectedImages.length) {
					for (let path of this.selectedImages) {
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
					thumbs: 0,
					time: Date.now(),
					user_id: this.user_id
				})

				this.getAnswers()

				this.answerContent = ''
				this.selectedImages = []
				this.$refs.answerPopup.close()
			},

			isLiked(answer) {
				if (!answer.liked_users) return false;
				return answer.liked_users.includes(this.currentUser._id);
			},

			// 处理点赞/取消点赞
			async likeAnswer(answer) {
				// 检查用户是否登录
				if (!this.currentUser._id) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					return;
				}

				const db = uniCloud.database();
				const answersCollection = db.collection('answers');

				try {
					const isLiked = this.isLiked(answer);
					const userId = this.currentUser._id;

					if (!isLiked) {
						// 添加点赞
						await answersCollection.doc(answer._id).update({
							like_count: db.command.inc(1),
							liked_users: db.command.push([userId])
						});

						// 更新本地数据
						answer.like_count = (answer.like_count || 0) + 1;
						if (!answer.liked_users) answer.liked_users = [];
						answer.liked_users.push(userId);
					} else {
						// 取消点赞
						await answersCollection.doc(answer._id).update({
							like_count: db.command.inc(-1),
							liked_users: db.command.pull(userId)
						});

						// 更新本地数据
						answer.like_count = Math.max(0, (answer.like_count || 1) - 1);
						answer.liked_users = answer.liked_users.filter(id => id !== userId);
					}
				} catch (error) {
					console.error('点赞操作失败:', error);
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					});
				}
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

	.sort-direction {
		margin-left: 4rpx;
		font-size: 24rpx;
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
		margin-right: 10rpx;
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

	.largephoto {
		z-index: 1;
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(189, 189, 189, 0.8);
	}

	.closelargeimage {
		margin-right: 30rpx;
		margin-top: 15rpx;
		color: #000000;
		float: right;
		font-size: 28px;
		font-weight: bold;
	}

	.largeimage {
		z-index: 22;
		margin: auto;
		margin-top: 300rpx;
		display: block;
		width: 85%;
		max-width: 1200px;
		max-height: 800px;
	}

	.image-viewer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.9);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.movable-area {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.movable-view {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-image {
		width: 100%;
		height: 100%;
	}

	.close-btn {
		position: fixed;
		top: 30rpx;
		right: 30rpx;
		width: 60rpx;
		height: 60rpx;
		background-color: rgba(255, 255, 255, 0.3);
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		z-index: 1000;
	}

	.lou {
		margin-left: auto;
		font-size: 12px;
	}



	.reply-user {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 4rpx;
	}

	.replies-list {
		margin-top: 20rpx;
		padding-left: 20rpx;
	}

	.reply-item {
		margin-bottom: 16rpx;
		padding: 10rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;
	}

	.reply-nickname {
		color: #007AFF;
		font-size: 24rpx;
	}

	.reply-text {
		color: #999;
		font-size: 24rpx;
		margin: 0 4rpx;
	}

	.reply-content {
		font-size: 26rpx;
		color: #333;
	}

	.reply-popup {
		background-color: #fff;
		padding: 30rpx;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
	}

	.reply-textarea {
		width: 100%;
		min-height: 80rpx;
		padding: 20rpx;
		font-size: 28rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
	}

	.popup-footer {
		margin-top: 20rpx;
		display: flex;
		justify-content: flex-end;
	}
</style>