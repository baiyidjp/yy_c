<template>
	<view class="client-item" @click="onClickDetail">
		<view class="top-wrap">
			<text class="title">{{ client.clientName }}</text>
			<u-tag text="删除" type="error" @tap.native.stop="onClickDelete"></u-tag>
		</view>
		<text class="sub-title">签约点位: {{ client.signupPoint }}%</text>
		<text class="sub-title">税源地: {{ clientCompanyNames }}</text>
		<text class="sub-title">签约时间: {{ client.signupTime}}</text>
		<text class="sub-title">合同状态: {{ clientContractStatus}}</text>
		<text class="sub-title">备注: {{ client.mark.length > 0 ? client.mark : '无' }}</text>
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
			client: null,
			index: null
		},
		computed: {
			...mapGetters(['companyList', 'contractStatusList']),
			clientCompanyNames() {
				const companyListInfo = this.companyList.filter(company => this.client.companyIds.includes(company._id))
				const names = companyListInfo.map(company => company.companyName)
				if (names.length > 0) {
					let companyNames = names[0]
					if (names.length > 1) {
						companyNames += ` 等(共${names.length}个)`
					}
					return companyNames
				}
				return '无/被删除'
			},
			clientContractStatus() {
				const contractStatusInfo = this.contractStatusList.find(contractStatus => contractStatus._id === this.client.contractStatusId)
				if (contractStatusInfo) {
					return contractStatusInfo.status
				}
				return '无/被删除'
			}
		},
		methods: {
			onClickDelete() {
				this.$emit('delete')
			},
			onClickDetail() {
				uni.navigateTo({
					url: `./client_detail?_id=${this.client._id}`
				})
			}
		},
	}
</script>

<style lang="scss" scoped>
	.client-item {
		margin: 15px;
		padding: 15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px 2px $u-border-color;
		display: flex;
		flex-direction: column;
	}

	.client-item .top-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.client-item .title {
		font-size: 14px;
		font-weight: bold;
		color: $u-main-color;
	}

	.client-item .sub-title {
		margin-top: 5px;
		font-size: 14px;
		color: $u-content-color;
	}
</style>
