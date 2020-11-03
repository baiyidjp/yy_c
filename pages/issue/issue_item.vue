<template>
	<view class="issue-item" @click="onClickIssueItem">
		<view class="top-wrap">
			<text class="title">{{ checkedClient.clientName }}</text>
			<view class="tag-wrap">
				<u-tag text="删除" type="error" @tap.native.stop="onClickDelete"></u-tag>
			</view>
		</view>
		<text class="sub-title">税源地: {{ checkedCompany.companyName }}</text>
		<text class="sub-title">众包费: {{ issue.totalAmount }}</text>
		<text class="sub-title" :class="issueFinish ? 'issue-item-finish' : 'issue-item-unfinish'">业务单状态: {{issueFinish ? '已完成' : '未完成' }}</text>
		<text class="sub-title">发票状态: {{ issueInvoiceStatus }}</text>
		<text class="sub-title">备注: {{ issue.mark.length > 0 ? issue.mark : '无' }}</text>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {}
		},
		props: {
			issue: null,
			index: null
		},
		computed: {
			...mapGetters(['currentUser', 'issueList', 'clientList', 'companyList', 'invoiceStatusList']),
			issueFinish() {
				if (this.issue) {
					let isFinish = true
					this.issue.rebateInfoList.forEach(rebateInfo => {
						if (!rebateInfo.isFinish) {
							isFinish = false
						}
					})
					return isFinish
				}
				return false
			},
			checkedClient() {
				if (this.issue) {
					return this.clientList.find(client => client._id === this.issue.clientId)
				}
			},
			checkedCompany() {
				if (this.issue) {
					return	this.companyList.find(company => company._id === this.issue.companyId)
				}
			},
			issueInvoiceStatus() {
				if (this.issue) {
					const invoiceStatusInfo = this.invoiceStatusList.find(invoiceStatus => invoiceStatus._id === this.issue.invoiceStatusId)
					if (invoiceStatusInfo) {
						return invoiceStatusInfo.status
					}
					return '无/被删除'
				}
				return ''
			}
		},
		methods: {
			onClickIssueItem() {
				uni.navigateTo({
					url: `./issue_detail?_id=${this.issue._id}`
				})
			},
			onClickDelete() {
				this.$emit('delete', this.index)
			}
		},
	}
</script>

<style lang="scss" scoped>
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
	
	.issue-item .issue-item-finish {
		color: $u-type-success;
	}
	
	.issue-item .issue-item-unfinish {
		color: $u-type-error;
	}
</style>
