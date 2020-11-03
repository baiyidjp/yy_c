<template>
	<view class="issue-item">
		<view class="top-wrap">
			<text class="title">{{ checkedClient.clientName }}</text>
			<view class="tag-wrap">
				<u-tag :text="issueFinish ? '已完成' : '未完成'" :type="issueFinish ? 'success' : 'error'"></u-tag>
				<u-tag text="编辑" @click="onClickEdit"></u-tag>
			</view>
		</view>
		<text class="sub-title">税源地: {{ checkedCompany.companyName }}</text>
		<text class="sub-title">众包费: {{ issue.totalAmount }}</text>
		<text class="sub-title">税源地应得: {{ issue.serviceChargeAmount }}</text>
		<text class="sub-title">个人应得: {{ issue.myAmount }}</text>
		<view class="rebate-wrap" v-for="(rebateInfo, index) in issue.rebateInfoList" :key="index">
			<view class="rebate-wrap-info">
				<text class="sub-title">返佣时间: {{ rebateInfo.date}}</text>
				<text class="sub-title">应返佣金: {{ rebateInfo.amount}}</text>
			</view>
			<u-button class="flag-button" @click="onClickFlagButton(rebateInfo)" :type="rebateInfo.isFinish ? 'error' : 'success'">{{ rebateInfo.isFinish ? '标记为未完成' : '标记为已完成' }}</u-button>
		</view>
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
			return {
				issueId: null
			}
		},
		onLoad(option) {
			if (option._id) {
				this.issueId = option._id
			}
		},
		computed: {
			...mapGetters(['issueList', 'clientList', 'companyList', 'invoiceStatusList']),
			issue() {
				const findIssue = this.issueList.find(issue => issue._id === this.issueId)
				if (findIssue) {
					return findIssue
				}
				return null
			},
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
			onClickEdit() {
				uni.navigateTo({
					url: `./issue_add?issue=${JSON.stringify(this.issue)}`
				})
			},
			onClickFlagButton(rebateInfo) {
				const self = this
				rebateInfo.isFinish = !rebateInfo.isFinish
				self.issue.updateAt = Date.now()
				self.issue.updateBy = self.issue.openid
				uniCloud.callFunction({
					name: 'issue',
					data: {
						type: 'update',
						issue: self.issue
					}
				}).then(res => {
					
				})
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
	
	.rebate-wrap {
		margin-top: 5px;
		border-top: 1px solid $u-border-color;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.rebate-wrap:last-of-type {
		border-bottom: 1px solid $u-border-color;
		padding-bottom: 5px;
	}
	
	.rebate-wrap-info {
		display: flex;
		flex-direction: column;
	}
	
</style>
