<template>
	<view class="header-back">
		<uni-icons type="left" size="24" @click="goBack"></uni-icons>
		<text>返回</text>
	</view>
	<view class="container">
		<uni-list>
			<view v-for="(item, idx) in userManwork" :key="idx">
				<view class="card">
					<view class="card-content">
						<view class="info-row">
							<text class="nickname text-ellipsis">{{item.que_user_id[0].nickname}}</text>
							<text class="title text-ellipsis">{{item.question_id[0].title}}</text>
							<text class="duration">{{getDuration(item.difficulties)}}分钟</text>
						</view>
					</view>
				</view>
			</view>
		</uni-list>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				userManwork: null
			}
		},
		onReady() {
			this.get_manwork()
		},
		methods: {
			get_manwork() {
				if (uniCloud.getCurrentUserInfo().tokenExpired < Date.now()) {
					return
				}
				const uid = uniCloud.getCurrentUserInfo().uid

				const mTmp = db.collection("manhour").where(`ans_user_id == "${uid}"`).field(
					"_id, question_id, que_user_id, difficulties").orderBy("time desc").getTemp()
				const uTmp = db.collection("uni-id-users").field("_id, nickname").getTemp()
				const qTmp = db.collection("questions").field("_id, title").getTemp()
				db.collection(mTmp, uTmp, qTmp).get().then(res => {
					this.userManwork = res.result.data
					console.log(this.userManwork)
				})
			},
			getDuration(difficulty) {
				const durations = {
					0: 5,
					1: 10,
					2: 15
				}
				return durations[difficulty] || 0
			}
		},
		goBack() {
			uni.navigateBack()
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

	.container {
		padding: 20rpx;
	}

	.card {
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		margin: 16rpx 0;
		padding: 24rpx;
	}

	.card-content {
		width: 100%;
	}

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.nickname {
		flex: 1.5;
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}

	.title {
		flex: 3;
		font-size: 28rpx;
		color: #666;
		margin: 0 20rpx;
	}

	.duration {
		flex: 1;
		font-size: 28rpx;
		color: #007AFF;
		text-align: right;
	}

	.text-ellipsis {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>