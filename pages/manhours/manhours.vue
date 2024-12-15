<template>
    <view class="header-back">
        <uni-icons type="left" size="24" @click="goBack"></uni-icons>
        <text>返回</text>
    </view>
    <view class="total-time-container">
        <view class="time-circle">
            <view class="time-value">{{ formatTotalTime }}</view>
            <view class="time-label">志愿时长</view>
        </view>
    </view>
    <view class="container">
        <uni-list>
            <view v-for="(item, idx) in userManwork" :key="idx">
                <view class="card">
                    <view class="card-content">
                        <view class="info-row" @click="toPost(item)">
                            <text class="nickname text-ellipsis">{{ item.que_user_id[0].nickname }}</text>
                            <text class="title text-ellipsis">{{ item.question_id[0].title }}</text>
                            <text class="duration">{{ getDuration(item.difficulties) }}分钟</text>
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
            userManwork: null,
            totaltime: 0
        }
    },
    computed: {
        formatTotalTime() {
            const totalMinutes = this.totaltime;
            if (totalMinutes >= 60) {
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours}小时${minutes ? minutes + '分' : ''}`;
            }
            return `${totalMinutes}分钟`;
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
                //console.log(this.userManwork)
            })

            db.collection("uni-id-users").where(`_id == "${uid}"`).field("workhour").get()
                .then(res => {
                    this.totaltime = res.result.data[0].workhour
                })
        },
        getDuration(difficulty) {
            const durations = {
                0: 5,
                1: 10,
                2: 15
            }
            return durations[difficulty] || 0
        },
		goBack() {
			uni.navigateBack()
		},
		toPost(item) {
			uni.navigateTo({
				url:  '/pages/questions/detail?id=' + item.question_id[0]._id
			})
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

.total-time-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40rpx 0;
    background: linear-gradient(to bottom, #f4f4f4, #ffffff);
}

.time-circle {
    width: 300rpx;
    height: 300rpx;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 8rpx 30rpx rgba(0, 122, 255, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    border: 8rpx solid rgba(0, 122, 255, 0.1);
}

.time-value {
    font-size: 44rpx;
    color: #007AFF;
    font-weight: 600;
    margin-bottom: 10rpx;
}

.time-label {
    font-size: 28rpx;
    color: #666;
}

/* 添加圆形渐变边框效果 */
.time-circle::before {
    content: '';
    position: absolute;
    top: -4rpx;
    left: -4rpx;
    right: -4rpx;
    bottom: -4rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(0, 122, 255, 0.05));
    z-index: -1;
}
</style>