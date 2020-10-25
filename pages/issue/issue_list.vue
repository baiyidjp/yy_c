<template>
	<block v-if="issueList.length > 0">
		<view class="wrap">
			<block v-for="(issue, index) in issueList" :key="issue._id">
				<issue-item :issue="issue" @delete="onClickDelete(issue)"></issue-item>
			</block>
			<view class="add-wrap" @click="onClickAddButton">
				<u-icon name="plus" color="#ffffff" size="60"></u-icon>
			</view>
			<u-toast ref="uToast" />
			<u-modal v-model="showDeleteModal" content="删除后无法恢复,请确认是否删除?" :show-cancel-button="true" confirm-text="删除"
			 confirm-color="#fa3534" :async-close="true" @confirm="onClickConfirmDelete" @cancel="onClickCancelDelete"></u-modal>
		</view>
	</block>
	<block v-else>
		<view class="wrap no-data-wrap">
			<text>当前账号没有添加工单</text>
			<u-button type="primary" @click="onClickAddButton">添加</u-button>
		</view>
	</block>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import IssueItem from './issue_item.vue'
	export default {
		data() {
			return {
				showDeleteModal: false,
				deleteIssue: null
			};
		},
		onPullDownRefresh() {
			const self = this
			// 震动
			uni.vibrateShort()
			uniCloud.callFunction({
				name: 'issue',
				data: {
					type: 'get',
					openid: self.currentUser.openid
				}
			}).then(res => {
				self.UPDATEISSUELIST({
					issueList: res.result.data
				})
				uni.stopPullDownRefresh()
			})
		},
		components: {
			IssueItem
		},
		computed: {
			...mapGetters(['currentUser', 'issueList'])
		},
		methods: {
			...mapMutations(['DELETEISSUE', 'UPDATEISSUELIST']),
			onClickAddButton() {
				uni.navigateTo({
					url: './issue_add'
				})
			},
			onClickEdit(issue) {
				uni.navigateTo({
					url: `./issue_add?issue=${JSON.stringify(issue)}`
				})
			},
			onClickDelete(issue) {
				this.deleteIssue = issue
				this.showDeleteModal = true
			},
			onClickCancelDelete() {
				this.deleteIssue = null
			},
			onClickConfirmDelete() {
				let self = this
				if (!self.deleteIssue) {
					return
				}
				const issue = self.deleteIssue
				if (issue.openid === self.currentUser.openid) {
					uniCloud.callFunction({
						name: 'issue',
						data: {
							type: 'delete',
							issue: issue
						}
					}).then(res => {
						self.showDeleteModal = false
						if (res.result) {
							self.DELETEISSUE({
								issue: issue
							})
							self.$refs.uToast.show({
								title: '删除成功',
								type: 'success'
							})
						}
					})
				} else {
					self.$refs.uToast.show({
						title: '无权删除',
						type: 'error'
					})
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.wrap {
		display: flex;
		flex-direction: column;
	}

	.no-data-wrap {
		height: 100vh;
		justify-content: center;
		align-items: center;
	}

	.no-data-wrap u-button {
		margin-top: 10px;
	}

	.add-wrap {
		position: fixed;
		bottom: 10px;
		right: 10px;
		width: 44px;
		height: 44px;
		background-color: $u-type-primary;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.issue-item {
		margin: 15px;
		padding: 15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px 2px $u-border-color;
		display: flex;
		flex-direction: column;
	}

	.issue-item .top-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.issue-item .top-wrap .tag-wrap {
		display: flex;
		align-items: center;
	}

	.tag-wrap u-tag {
		margin-left: 5px;
	}

	.issue-item .title {
		font-size: 14px;
		font-weight: bold;
		color: $u-main-color;
	}

	.issue-item .sub-title {
		margin-top: 5px;
		font-size: 14px;
		color: $u-content-color;
	}
</style>
