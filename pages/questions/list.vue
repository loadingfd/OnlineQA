<template>
	<view class="container">
		<view class="search-filter">
			<view class="filter-box">
				<uni-data-select :value="selectedCategory" :localdata="categories" @change="handleCategoryChange"
					placeholder="选择分类" />
			</view>
			<view class="search-box">
				<uni-search-bar v-model="searchKeyword" placeholder="搜索问题" @confirm="handleSearch" />
			</view>
		</view>
		<view class="filter-box">
			<uni-segmented-control :current="timeFilter" :values="['最近一天', '最近三天']"
				@clickItem="handleTimeFilterChange" />
		</view>
		<unicloud-db ref="udb" v-slot:default="{ data, loading, hasMore, error }" :collection="colList" :where="dbWhere"
			:field="field" :getone="false" :getcount="true" :orderby="'is_stick desc,time desc'">
			<view v-if="error" class="error-message">{{ error.message }}</view>
			<view v-else>
				<uni-list class="question-list" v-if="data && data.length">
					<uni-list-item v-for="(item, index) in data" :key="index" showArrow :clickable="true"
						@click="handleItemClick(item._id)" class="list-item">
						<template v-slot:header>
							<view class="user-info">
								<view class="avatar-container">
									<image class="avatar" mode="aspectFill" :src="item.user_id[0].avatar_file.url" />
									<text class="nickname">{{ item.user_id[0].nickname }}</text>
								</view>
							</view>
						</template>
						<template v-slot:body>
							<view class="question-content">
								<view class="title-container">
									<text v-if="item.is_stick" class="stick-tag">置顶</text>
									<text class="title">{{ item.title.length > 15 ? item.title.substring(0, 15) + '...' :
                                        item.title}}</text>
								</view>
								<text class="description">{{ item.descrip.substring(0, 100) }}{{ item.descrip.length > 100
                                    ? '...' : ''}}</text>
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
				<view v-else-if="!loading" class="error-message">暂无数据</view>
			</view>
			<uni-load-more class="load-more"
				:status="loading ? 'loading' : (hasMore ? 'more' : 'noMore')"></uni-load-more>
		</unicloud-db>
		<uni-fab ref="fab" horizontal="right" vertical="bottom" :pop-menu="false" @fabClick="fabClick" />
	</view>
</template>


<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				loadMore: {
					contentdown: '上拉加载更多',
					contentrefresh: '加载中...',
					contentnomore: '没有更多数据了'
				},
				timeFilter: 0,
				
				pastTime: 0,
				searchKeyword: '',
				dbWhere: {},
				field: 'title,time,descrip,difficulties,category,is_stick,user_id{nickname,avatar_file}',
				questionsTemp: null,
				usersTemp: null,
				colList: null,
				 questions: [],
				            
				            selectedCategory: '',  // 选中的分类
				            categories: [
				                { value: '', text: '全部' },
				                { value: 'math', text: '数学题' },
				                { value: 'code', text: '编程题' },
				                { value: 'resource', text: '求资料' },
				                { value: 'other', text: '其他' }
				            ]
			}
		},
	
		created() {
			this.setTimeFilter(0)
			this.usersTemp = db.collection('uni-id-users')
				.field('_id,nickname,avatar_file').getTemp()
			this.colList = [this.questionsTemp, this.usersTemp]
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		 computed: {
		        // 根据分类和搜索关键词过滤问题
		        filteredQuestions() {
		            if (!this.questions) return []
		            
		            return this.questions.filter(question => {
		                // 分类筛选
		                const categoryMatch = !this.selectedCategory || 
		                    question.category === this.selectedCategory
		                
		                return categoryMatch
		            })
		        }
		    },
		methods: {
			 async handleCategoryChange(value) {
			        console.log('1. 开始处理分类变化, 选择的值:', value)
			        
			        // 先更新状态
			        await this.$nextTick()
			        this.selectedCategory = value
			        
			        // 构建新的查询条件
			        let whereStr = ''
			        if (value) {
			            whereStr = `category == '${value}'`
			        }
			        console.log('2. 构建的查询条件:', whereStr)
			        
			        // 更新查询
			        this.questionsTemp = db.collection('questions')
			            .where(whereStr || {})
			            .field('title,time,descrip,difficulties,category,is_stick,user_id')
			            .getTemp()
			        
			        this.colList = [this.questionsTemp, this.usersTemp]
			        
			        // 确保状态已更新
			        await this.$nextTick()
			        
			        // 手动触发数据重新加载
			        if (this.$refs.udb) {
			            this.$refs.udb.loadData({
			                clear: true
			            })
			        }
			    },
					 async getCommentedQuestions() {
					            try {
					                console.log('开始获取问题')
					                if (!this.userInfo) return
					                
					                const answersRes = await db.collection('answers')
					                    .where({
					                        user_id: this.userInfo._id
					                    })
					                    .field('question_id')
					                    .get()
					                
					                if (answersRes.result && answersRes.result.data && answersRes.result.data.length > 0) {
					                    const questionIds = [...new Set(answersRes.result.data.map(answer => answer.question_id))]
					                    console.log('用户回答过的问题ID:', questionIds)
					                    
					                    // 构建查询条件
					                    let whereCondition = `_id in [${questionIds.map(id => `'${id}'`).join(',')}]`
					                    if (this.selectedCategory) {
					                        whereCondition += ` && category == '${this.selectedCategory}'`
					                    }
					                    
					                    console.log('查询条件:', whereCondition)
					                    
					                    const questionsRes = await db.collection('questions')
					                        .where(whereCondition)
					                        .field(this.field)
					                        .get()
					                    
					                    console.log('查询结果:', questionsRes.result.data)
					                    this.questions = questionsRes.result.data || []
					                } else {
					                    this.questions = []
					                }
					            } catch (e) {
					                console.error('获取回答失败:', e)
					                this.questions = []
					            }
					        },
			updateQtmp() {
				if (true) {
					//debug
					this.questionsTemp = db.collection('questions').where(`time >= ${0}`).
					field('title,time,descrip,difficulties,category,is_stick,user_id').getTemp()
				} else {
					this.questionsTemp = db.collection('questions').where(`time >= ${this.pastTime}`).
					field('title,time,descrip,difficulties,category,is_stick,user_id').getTemp()
				}

				this.colList = [this.questionsTemp, this.usersTemp]
			},
			handleItemClick(id) {
				uni.navigateTo({
					url: './detail?id=' + id
				})
			},
			fabClick() {
				uni.navigateTo({
					url: './add',
					events: {
						refreshData: () => {
							this.$refs.udb.loadData({
								clear: true
							})
						}
					}
				})
			},
			handleTimeFilterChange(e) {
				this.timeFilter = e.currentIndex
				this.setTimeFilter(e.currentIndex)
			},
			setTimeFilter(index) {
				const days = index === 0 ? 1 : 3
				const pastTime = new Date()
				pastTime.setDate(pastTime.getDate() - (days - 1))
				pastTime.setHours(0, 0, 0, 0)
				this.pastTime = pastTime.getTime()
				this.dbWhere = this.getSearchWhere()
				//console.log(this.pastTime)
				this.updateQtmp()
			},
			handleSearch(e) {
				this.dbWhere = this.getSearchWhere()
			},
			getSearchWhere() {
				if (this.searchKeyword) {
					let keywordReg = new RegExp(this.searchKeyword, 'i'); // 忽略大小写
					return `(${keywordReg}.test("title") || ${keywordReg}.test("descrip"))`;
				}
				if (this.selectedCategory) {
				            return `category == '${this.selectedCategory}'`
				        }
				        return ''

			}
		}
	}
</script>

<style>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.search-filter {
		width: 100%;
		display: inline-flex;
		align-items: center;
		padding: 5rpx;
		background-color: #fff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		
	}
	
	.search-filter .filter-box {
		flex: 1;
	}
	
	.search-box {
		flex: 4;
	}
	
	.error-message {
		text-align: center;
		color: #ff5a5f;
		padding: 30rpx;
	}

	.question-list {
		background: transparent;
	}

	.list-item {
		margin-bottom: 20rpx;
		border-radius: 15rpx;
		background: #fff;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.user-info {
		width: 100rpx;
		padding: 15rpx;
		margin-right: 15rpx;
		margin-bottom: 10rpx;
	}

	.avatar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-bottom: 10rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.nickname {
		font-size: 20rpx;
		width: 140rpx;
		color: #666;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

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

	.stick-tag {
		font-size: 24rpx;
		color: #ff5a5f;
		border: 1px solid #ff5a5f;
		padding: 2rpx 10rpx;
		border-radius: 10rpx;
		margin-right: 10rpx;
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

	.load-more {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
	}
</style>