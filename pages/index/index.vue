<template>
	<view class="wrap">
		<view class="load-wrap" v-if="!user">
			<u-loading></u-loading>
			<text class="loadTitle">正在检测账号权限</text>
		</view>
		<view v-else-if="!user.isApproved">
			<text>当前账号没有权限,如已申请,可点击刷新</text>
			<view class="buttons">
				<u-button class="refresh" type="warning" @click="checkAccess">刷新</u-button>
				<u-button type="primary" :disabled="user.name.length > 0" @click="onClickAccess">申请</u-button>
			</view>
		</view>
		<view class="load-wrap" v-else-if="user.isApproved">
			<u-loading></u-loading>
			<text class="loadTitle">正在拉取数据</text>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				user: null
			}
		},
		onShow() {
			this.checkAccess()
		},
		methods: {
			...mapMutations(['UPDATECURRENTUSER', 'UPDATECOMPANYLIST', 'UPDATECLIENTLIST', 'UPDATECHANNELLIST', 'UPDATEISSUELIST', 'UPDATEREBATEINFOLIST']),
			checkAccess() {
				const self = this
				self.user = null;
				// 取出微信的code
				uni.login({
					provider: 'weixin',
					success: loginRes => {
						// 取出当前用户的信息
						uniCloud.callFunction({
							name: 'login',
							data: {
								code: loginRes.code
							}
						}).then(res => {
							self.user = res.result
							self.UPDATECURRENTUSER({
								user: self.user
							})
							if (self.user.isApproved) {
								uniCloud.callFunction({
									name: 'all_data',
									data: {
										openid: self.user.openid
									}
								}).then(res => {
									console.log(res.result);
									const result = res.result
									self.UPDATECOMPANYLIST({
										companyList: result.companyList.data
									})
									self.UPDATECLIENTLIST({
										clientList: result.clientList.data
									})
									self.UPDATEISSUELIST({
										issueList: result.issueList.data
									})
									self.UPDATEREBATEINFOLIST({
										rebateInfoList: result.rebateInfoList.data
									})
									// 有权限使用小程序 跳转首页
									uni.switchTab({
										url: '../issue/issue_list'
									})
								})
							}
						})
					},
					fail: (error) => {
						console.log(error);
						uni.showToast({
							title: '查询权限失败'
						})
					}
				})
			},
			onClickAccess() {
				uni.navigateTo({
					url: './access_request'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.load-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loadTitle {
		margin-left: 10px;
	}

	.buttons {
		display: flex;
		justify-content: center;
		margin-top: 10px;
	}

	.buttons .refresh {
		margin-right: 10px;
	}
</style>
