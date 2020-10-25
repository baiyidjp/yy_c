<template>
	<view class="wrap">
		<view class="top-wrap">
			<text class="title">{{ client.clientName }}</text>
			<u-tag text="编辑" @click="onClickEdit"></u-tag>
		</view>
		<text class="sub-title">签约点位: {{ client.signupPoint }}%</text>
		<text class="sub-title">税源地: {{ clientCompanyNames }}</text>
		<text class="sub-title">联系人: {{ client.contactInformation.name }}</text>
		<text class="sub-title">联系人电话: {{ client.contactInformation.phone }}</text>
		<text class="sub-title">联系人地址: {{ client.contactInformation.address}}</text>
		<text class="sub-title">开票公司: {{ client.invoiceInfo.companyName}}</text>
		<text class="sub-title">纳税识别号: {{ client.invoiceInfo.taxNumber}}</text>
		<text class="sub-title">公司注册地址: {{ client.invoiceInfo.registerAddress}}</text>
		<text class="sub-title">开票联系方式: {{ client.invoiceInfo.phone}}</text>
		<text class="sub-title">开户行: {{ client.invoiceInfo.bankName}}</text>
		<text class="sub-title">银行卡号: {{ client.invoiceInfo.bankNumber}}</text>
		<text class="sub-title">邮寄地址: {{ client.invoiceInfo.postAddress}}</text>
		<text class="sub-title">签约时间: {{ client.signupTime}}</text>
		<text class="sub-title">备注: {{ client.mark.length > 0 ? client.mark : '无' }}</text>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {
				clientId: ''
			}
		},
		onLoad(option) {
			if (option._id) {
				this.clientId = option._id
			}
		},
		computed: {
			...mapGetters(['clientList', 'companyList']),
			client() {
				const findClient = this.clientList.find(client => client._id === this.clientId)
				if (findClient) {
					return findClient
				}
				return null
			},
			clientCompanyNames() {
				if (this.client) {
					const companyListInfo = this.companyList.filter(company => this.client.companyIds.includes(company._id))
					const names = companyListInfo.map(company => company.companyName)
					return names.toString()
				}
				return ''
			}
		},
		methods: {
			onClickEdit() {
				uni.navigateTo({
					url: `./client_add?client=${JSON.stringify(this.client)}`
				})
			}
		},
	}
</script>

<style lang="scss" scoped>
	.wrap {
		margin: 15px;
		padding: 15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px 2px $u-border-color;
		display: flex;
		flex-direction: column;
	}

	.wrap .top-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wrap .title {
		font-size: 14px;
		font-weight: bold;
		color: $u-main-color;
	}

	.wrap .sub-title {
		margin-top: 5px;
		font-size: 14px;
		color: $u-content-color;
	}
</style>
