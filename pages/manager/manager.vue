<template>
	<view class="admin-center">
		<view class="header">
			<text class="header-title">管理者模式</text>
		</view>

		<!-- 筛选部分 -->
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
			<button class="filter-btn" @click="applyFilter">筛选</button>
		</view>

		<!-- 批量操作按钮 -->
		<view class="batch-actions" v-if="selectedItems.length > 0">
			<button class="batch-delete-btn" @click="batchDelete">
				批量删除({{ selectedItems.length }})
			</button>
			<button class="batch-restore-btn" @click="batchRestore">
				批量恢复({{ selectedItems.length }})
			</button>
		</view>
		<unicloud-db ref="udb" v-slot:default="{ data, loading, hasMore, error }" :collection="'questions'"
			:where="dbWhere" :field="field" :getone="false" :getcount="true" :orderby="'states desc,is_stick desc,time desc'">
			<view v-if="error" class="error-message">{{ error.message }}</view>
			<view v-else>
				<uni-list class="question-list" v-if="data && data.length">
					<checkbox-group @change="checkboxGroupChange">
					<uni-list-item v-for="(item, index) in data" :key="item._id" :clickable="true"
						@click="handleItemClick(item._id)" class="list-item">
						<template v-slot:header>
							
								<view class="item-header">
									<checkbox :value="item._id" :checked="selectedItems.includes(item._id)" />
									<view class="user-info">
										<text class="nickname">{{ item.user_id.nickname }}</text>
									</view>
								</view>
							

						</template>
						<template v-slot:body>
							<view class="question-content">
								<view class="title-container">
									<text class="title" :style="{ color: item.states ? '#333' : 'red', textDecoration: item.states ? 'none' : 'line-through' }">
										{{ item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title }}
									</text>
								</view>
								<text class="description">
									{{ item.descrip.substring(0, 100) }}{{ item.descrip.length > 100 ? '...' : '' }}
								</text>
							</view>
						</template>
					</uni-list-item>
					</checkbox-group>
				</uni-list>
				<view v-else-if="!loading" class="error-message">暂无数据</view>
			</view>
			<uni-load-more class="load-more"
				:status="loading ? 'loading' : (hasMore ? 'more' : 'noMore')"></uni-load-more>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database();

	export default {
		data() {
			return {
				startDate: '',
				endDate: '',
				dbWhere: '',
				field: 'title,time,descrip,difficulties,category,is_stick,user_id{nickname,avatar_file}, states',
				currentUser: null,
				selectedItems: [], // 存储选中的项目ID
			};
		},

		methods: {
			// 处理开始日期变化
			onStartDateChange(e) {
				this.startDate = e.detail.value;
			},

			// 处理结束日期变化
			onEndDateChange(e) {
				this.endDate = e.detail.value;
			},

			// 应用筛选
			applyFilter() {
				const startTime = new Date(this.startDate).getTime();
				const endTime = new Date(this.endDate).getTime() + 86400000; // 加一天的毫秒数，确保包含结束日期的整天
				if(!this.endDate)
					this.dbWhere = `time >= ${startTime}`;
				else if(!this.startDate)
					this.dbWhere = `time < ${endTime}`;
				else
					this.dbWhere = `time >= ${startTime} && time < ${endTime}`;
				console.log(this.dbWhere)
			},

			// 处理复选框变化
			checkboxGroupChange(e) {
				// `e.detail.value` 是一个包含所有选中值的数组
				this.selectedItems = e.detail.value;
			},


			// 批量删除
			async batchDelete() {
				if (this.selectedItems.length === 0) {
					uni.showToast({
						title: '请选择要删除的项目',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '确认删除',
					content: `确定要删除选中的 ${this.selectedItems.length} 个帖子吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const promises = this.selectedItems.map(id =>
									db.collection('questions').doc(id).update({
										states: false
									})
								);

								await Promise.all(promises);

								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});

								this.selectedItems = []; // 清空选中项
								this.$refs.udb.refresh()
							} catch (error) {
								uni.showToast({
									title: '删除失败',
									icon: 'error'
								});
								console.error('批量删除失败:', error);
							}
						}
					}
				});
			},
			// 处理列表项点击
			handleItemClick(id) {
				if (this.selectedItems.length === 0) { // 如果没有选中项，才进行跳转
					uni.navigateTo({
						url: '/pages/questions/detail?id=' + id
					});
				}
			},

			// 批量恢复
			async batchRestore() {
				if (this.selectedItems.length === 0) {
					uni.showToast({
						title: '请选择要恢复的项目',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '确认恢复',
					content: `确定要恢复选中的 ${this.selectedItems.length} 个帖子吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const promises = this.selectedItems.map(id =>
									db.collection('questions').doc(id).update({
										states: true
									})
								);

								await Promise.all(promises);

								uni.showToast({
									title: '恢复成功',
									icon: 'success'
								});

								this.selectedItems = []; // 清空选中项
								this.$refs.udb.refresh()
							} catch (error) {
								uni.showToast({
									title: '恢复失败',
									icon: 'error'
								});
								console.error('批量恢复失败:', error);
							}
						}
					}
				});
			}


		}
	};
</script>

<style>
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

	.filter-btn {
		background-color: #007AFF;
		color: #ffffff;
		border-radius: 8rpx;
		padding: 15rpx 30rpx;
		font-size: 28rpx;
		border: none;
		margin-top: 20rpx;
	}

	.batch-actions {
		padding: 20rpx;
		display: flex;
		justify-content: flex-end;
		background-color: #ffffff;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.batch-delete-btn {
		background-color: #ff4d4f;
		color: #ffffff;
		font-size: 28rpx;
		padding: 10rpx 30rpx;
		border-radius: 8rpx;
		border: none;
	}

	.batch-restore-btn {
		background-color: #52c41a;
		color: #ffffff;
		font-size: 28rpx;
		padding: 10rpx 30rpx;
		border-radius: 8rpx;
		border: none;
	}

	.question-list {
		background-color: #ffffff;
		border-radius: 10rpx;
	}

	.list-item {
		border-bottom: 1rpx solid #f0f0f0;
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
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

	.delete-btn {
		background-color: #ff4d4f;
		color: #ffffff;
		border-radius: 6rpx;
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		border: none;
		margin-top: 10rpx;
	}

	.delete-btn:active,
	.batch-delete-btn:active,
	.filter-btn:active {
		opacity: 0.8;
	}

	.item-header checkbox {
		transform: scale(0.8);
	}
</style>