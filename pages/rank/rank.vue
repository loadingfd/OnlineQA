<template>
	<view class="header-back">
		<uni-icons type="left" size="24" @click="goBack"></uni-icons>
		<text>返回</text>
	</view>
	<view class="header">
		<text class="title">志愿工时排行榜</text>
	</view>
	<view class="top-three">
		<view class="top-item second">
			<image :src="topThree[1].avatar_file.url" class="avatar silver"></image>
			<text class="name">{{ topThree[1].nickname.length > 6 ? topThree[1].nickname.substring(0,6) + '...' : topThree[1].nickname }}</text>
			<text class="workhour">{{ topThree[1].workhour }}</text>
		</view>
		<view class="top-item first">
			<image :src="topThree[0].avatar_file.url" class="avatar gold"></image>
			<text class="name crown">{{ topThree[0].nickname.length > 6 ? topThree[0].nickname.substring(0,6) + '...' : topThree[0].nickname }}</text>
			<text class="workhour">{{ topThree[0].workhour }}</text>
		</view>
		<view class="top-item third">
			<image :src="topThree[2].avatar_file.url" class="avatar bronze"></image>
			<text class="name">{{ topThree[2].nickname.length > 6 ? topThree[2].nickname.substring(0,6) + '...' : topThree[2].nickname }}</text>
			<text class="workhour">{{ topThree[2].workhour }}</text>
		</view>
	</view>
	<uni-list>
		<view class="list-item" v-for="(item, index) in rankList" :key="index">
			<text class="rank">{{ index + 4 }}</text>
			<text class="name">{{ item.nickname }}</text>
			<text class="workhour">{{ item.workhour }} 小时</text>
		</view>
	</uni-list>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				wh_sheet: null,
				topThree: [],
				rankList: []
			}
		},
		onReady() {
			this.get_all_worktime()
		},
		methods: {
			get_all_worktime() {
				db.collection("uni-id-users").field("_id, nickname, avatar_file, workhour").get()
					.then(res => {
						const sortedData = res.result.data.sort((a, b) => b.workhour - a.workhour)
						sortedData.forEach(item => {
							item.workhour = this.minute_to_time(item.workhour)
						})
						this.topThree = sortedData.slice(0, 3)
						this.rankList = sortedData.slice(3)
					})
			},
			minute_to_time(minute) {
				return minute < 60 ? `${minute}分钟` : `${Math.floor(minute / 60)}小时${minute % 60}分钟`
			},
			goBack() {
				uni.navigateBack()
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

	.header {
		text-align: center;
		margin-bottom: 20px;
		background: linear-gradient(45deg, #6db3f2, #00b0d6);
		padding: 20px 0;
		color: white;
		border-radius: 8px;
	}

	.title {
		font-size: 24px;
		font-weight: bold;
		letter-spacing: 1px;
	}

	.top-three {
		display: flex;
		justify-content: space-around;
		align-items: flex-end;
		margin: 20px 10px;
		background-color: #f9f9f9;
		padding: 40px;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.top-item {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 10px;
		position: relative;
		transition: transform 0.3s;
	}

	.top-item:hover {
		transform: scale(1.05);
	}

	.first .avatar {
		border: 3px solid gold;
		transform: scale(1.2);
	}

    .second .avatar {
        border: 3px solid silver;
        transform: scale(1.1);
    }

    .third .avatar {
        border: 3px solid #cd853f;
        transform: scale(1.1);
    }

	.name {
		font-size: 16px;
		font-weight: bold;
		margin-top: 10px;
		color: #333;
	}

	.name.crown::before {
		content: "👑 ";
		color: gold;
	}

	.workhour {
		font-size: 14px;
		color: #666;
	}

	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px;
		border-bottom: 1px solid #f0f0f0;
		background-color: white;
		border-radius: 8px;
		margin: 5px 10px;
	}

	.list-item:hover {
		background-color: #f5f5f5;
	}

	.rank {
		font-weight: bold;
		color: #4A90E2;
	}
   
	.top-item.first {
		transform: translateY(-30px);
	}
	.top-item.first:hover {
		transform: translateY(-30px) scale(1.05);
	}
	.top-item:hover{
	    transform: scale(1.1);
	}
	

</style>