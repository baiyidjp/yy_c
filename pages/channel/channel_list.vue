<template>
	<block v-if="channelList.length > 0">
		<view class="wrap">
			<block v-for="(channel, index) in channelList" :key="channel._id">
				<view class="channel-item">
					<view class="top-wrap">
						<text class="title">{{ channel.channelName }}</text>
						<view class="tag-wrap">
							<u-tag text="删除" type="error" @click="onClickDelete(channel)"></u-tag>
							<u-tag text="编辑" @click="onClickEdit(channel)"></u-tag>
						</view>
					</view>
					<text class="sub-title">所属公司: {{ channel.channelCompany }}</text>
					<view class="quotation-wrap" v-for="(companyInfo, index) in channel.channelCompanyInfoList" :key="index">
						<text class="sub-title">税源地: {{ companyInfo.companyName }}</text>
						<text class="sub-title">报价点位大额: {{ companyInfo.quotationPoint }}%</text>
						<text class="sub-title">报价点位小额: {{ companyInfo.quotationPointSmall }}%</text>
					</view>
					<text class="sub-title">备注: {{ channel.mark.length > 0 ? channel.mark : '无' }}</text>
				</view>
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
			<text>当前账号没有添加渠道</text>
			<u-button type="primary" @click="onClickAddButton">添加</u-button>
		</view>
	</block>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				showDeleteModal: false,
				deleteChannel: null
			};
		},
		onPullDownRefresh() {
			const self = this
			// 震动
			uni.vibrateShort()
			uniCloud.callFunction({
				name: 'channel',
				data: {
					type: 'get',
					openid: self.currentUser.openid
				}
			}).then(res => {
				self.UPDATECHANNELLIST({
					channelList: res.result.data
				})
				uni.stopPullDownRefresh()
			})
		},
		onShow() {
			const self = this
			this.channelList.map(channel => {
				channel.channelCompanyInfoList.map(companyInfo => {
					const company = self.companyList.find(company => company._id === companyInfo.companyId)
					if (company) {
						companyInfo.companyName = company.companyName
					}
					return companyInfo
				})
			})
		},
		computed: {
			...mapGetters(['currentUser', 'channelList', 'companyList'])
		},
		methods: {
			...mapMutations(['DELETECHANNEL', 'UPDATECHANNELLIST']),
			onClickAddButton() {
				uni.navigateTo({
					url: './channel_add'
				})
			},
			onClickEdit(channel) {
				uni.navigateTo({
					url: `./channel_add?channel=${JSON.stringify(channel)}`
				})
			},
			onClickDelete(channel) {
				this.deleteChannel = channel
				this.showDeleteModal = true
			},
			onClickCancelDelete() {
				this.deleteChannel = null
			},
			onClickConfirmDelete() {
				let self = this
				if (!self.deleteChannel) {
					return
				}
				const channel = self.deleteChannel
				if (channel.openid === self.currentUser.openid) {
					uniCloud.callFunction({
						name: 'channel',
						data: {
							type: 'delete',
							channel: channel
						}
					}).then(res => {
						self.showDeleteModal = false
						if (res.result) {
							self.DELETECHANNEL({
								channel: channel
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

	.channel-item {
		margin: 15px;
		padding: 15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px 2px $u-border-color;
		display: flex;
		flex-direction: column;
	}

	.channel-item .top-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.channel-item .top-wrap .tag-wrap {
		display: flex;
		align-items: center;
	}

	.tag-wrap u-tag {
		margin-left: 5px;
	}

	.channel-item .title {
		font-size: 14px;
		font-weight: bold;
		color: $u-main-color;
	}

	.channel-item .sub-title {
		margin-top: 5px;
		font-size: 14px;
		color: $u-content-color;
	}

	.quotation-wrap {
		margin-top: 5px;
		border-top: 1px solid $u-border-color;
		display: flex;
		flex-direction: column;
	}
	.quotation-wrap:last-of-type {
		border-bottom: 1px solid $u-border-color;
		padding-bottom: 5px;
	}
	
</style>
