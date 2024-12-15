<template>
	<view class="admin-center">
		<view class="header">
			<text class="header-title">管理者模式</text>
		</view>
		<view class="filter-section">
			<picker mode="date" @change="onStartDateChange">
				<view class="picker">
					开始日期: {{ startDate || '请选择' }}
				</view>
			</picker>
			<picker mode="date" @change="onEndDateChange">
				<view class="picker">
					结束日期: {{ endDate || '请选择' }}
				</view>
			</picker>
			<button @click="applyFilter">筛选</button>
		</view>

		<unicloud-db ref="udb" v-slot:default="{ data, loading, hasMore, error }" :collection="'questions'"
			:where="dbWhere" :field="field" :getone="false" :getcount="true" :orderby="'is_stick desc,time desc'">
			<view v-if="error" class="error-message">{{ error.message }}</view>
			<view v-else>
				<uni-list class="question-list" v-if="data && data.length">
					<uni-list-item v-for="(item, index) in data" :key="index" showArrow :clickable="true"
						@click="handleItemClick(item._id)" class="list-item">
						<template v-slot:header>
							<view class="user-info">
								<view class="avatar-container">
									<text class="nickname">{{ item.user_id.nickname}}</text>
								</view>
							</view>
						</template>
						<template v-slot:body>
							<view class="question-content">
								<view class="title-container">
									<text class="title">{{ item.title.length > 15 ? item.title.substring(0, 15) + '...' :
                                        item.title}}</text>
								</view>
								<text class="description">{{ item.descrip.substring(0, 100) }}{{ item.descrip.length > 100
                                    ? '...' : ''}}</text>
								<button v-if="uniIDHasRole('MANAGER')" class="dbutton"
									@click="deleteQuestion(item._id)">删除帖子</button>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
				<view v-else-if="!loading" class="error-message">暂无数据</view>
			</view>
			<uni-load-more class="load-more"
				:status="loading ? 'loading' : (hasMore ? 'more' : 'noMore')"></uni-load-more>
		</unicloud-db>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				startDate: '',
				endDate: '',
				dbWhere: 'states==true',
				field: 'title,time,descrip,difficulties,category,is_stick,user_id{nickname,avatar_file}',
				currentUser: null,
			};
		},
		created() {
			this.fetchQuestions();
		},
		methods: {
			onStartDateChange(e) {
				this.startDate = e.detail.value;
				this.updateDbWhere();
			},
			onEndDateChange(e) {
				this.endDate = e.detail.value;
				this.updateDbWhere();
			},
			updateDbWhere() {
				const startTime = new Date(this.startDate).getTime();
				const endTime = new Date(this.endDate).getTime() + 86400000; // 加一天的毫秒数，确保包含结束日期的整天
				this.dbWhere = `time >= ${startTime} && time < ${endTime} && states == true`;
			},
			applyFilter() {
				const startTime = new Date(this.startDate).getTime();
				const endTime = new Date(this.endDate).getTime() + 86400000; // 加一天的毫秒数，确保包含结束日期的整天
				this.dbWhere = `time >= ${startTime} && time < ${endTime} && states == true`;
			},
			handleItemClick(id) {
				uni.navigateTo({
					url: './detail?id=' + id
				});
			},
			async getCurrentUser() {
				try {
					const userInfo = await uniCloud.callFunction({
						name: 'getUserInfo'
					});
					if (userInfo.result && userInfo.result.code === 0) {
						this.currentUser = userInfo.result.result;
					} else {
						console.error('获取用户信息失败:', userInfo.result.message);
					}
				} catch (error) {
					console.error('获取失败', error);
				}
			},
			
			async deleteQuestion(questionId) {
				try {
					const db = uniCloud.database();

					// 获取文档
					const checkDoc = await db.collection('questions').doc(questionId).get();
					console.log('获取到的文档:', checkDoc);

					// 修改检查逻辑，适应实际的数据结构
					if (!checkDoc.result || !checkDoc.result.data || checkDoc.result.data.length === 0) {
						uni.showToast({
							title: '文档不存在',
							icon: 'none'
						});
						return;
					}

					// 执行更新操作
					const res = await db.collection('questions').doc(questionId).update({
						states: false
					});
					console.log('更新结果:', res);

					// 修改检查更新结果的逻辑
					if (res && res.result && res.result.updated === 1) {
						// 更新成功，重新获取数据
						await this.fetchQuestions();
						uni.showToast({
							title: '问题已删除',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: '删除失败',
							icon: 'error'
						});
						console.error('更新失败:', res);
					}
				} catch (error) {
					uni.showToast({
						title: '操作失败',
						icon: 'error'
					});
					console.error('删除问题失败:', error);
				}
			},
			async fetchQuestions() {
				try {
					const db = uniCloud.database();
					const res = await db.collection('questions')
						.where(this.dbWhere)
						.get();
					this.$set(this, 'questions', res.result.data);
				} catch (error) {
					console.error('获取问题列表失败:', error);
				}
			}
		},
	}
</script>

<style>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.filter-section {
		margin-bottom: 20rpx;
	}

	.picker {
		margin: 10rpx 0;
	}

	.question-list {
		background: transparent;
	}

	.list-item {
		margin-bottom: 20rpx;
		padding: 10rpx;
		border-radius: 10rpx;
		background: #fff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.nickname {
		font-size: 28rpx;
		color: #666;
		text-align: center;
	}

	.question-content {
		padding: 15rpx 10rpx 0rpx 0rpx;
		width: calc(90% - 60px);
	}

	.title-container {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
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

	.error-message {
		text-align: center;
		color: #ff5a5f;
		padding: 30rpx;
	}

	.load-more {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
	}

	.admin-center {
		background-color: #f0f4f7;
		min-height: 100vh;
		padding: 20rpx;
	}

	.header {
		background-color: #007AFF;
		padding: 30rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		text-align: center;
	}

	.header-title {
		color: #ffffff;
		font-size: 36rpx;
		font-weight: bold;
	}

	.filter-section {
		background-color: #ffffff;
		padding: 20rpx;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}

	.picker {
		margin: 10rpx 0;
		padding: 10rpx;
		border: 1rpx solid #ddd;
		border-radius: 5rpx;
		background-color: #f9f9f9;
		font-size: 28rpx;
		color: #333;
	}

	.filter-button {
		background-color: #007AFF;
		color: #ffffff;
		padding: 10rpx 20rpx;
		border-radius: 5rpx;
		text-align: center;
		margin-top: 10rpx;
	}

	.dbutton {
		background-color: red;
		color: white;
		border: none;
		padding: 3px 0px;
		font-size: 14px;
		cursor: pointer;
		border-radius: 3px;

	}
</style>