<template>
	<block v-if="companyList.length > 0">
		<view class="wrap">
			<block v-for="(company, index) in companyList" :key="company._id">
				<view class="company-item">
					<view class="top-wrap">
						<text class="title">{{ company.companyName }}</text>
						<view class="tag-wrap">
							<u-tag text="删除" type="error" @click="onClickDelete(company)"></u-tag>
							<u-tag text="编辑" @click="onClickEdit(company)"></u-tag>
						</view>
					</view>
					<text class="sub-title">大额服务费比例: {{ company.serviceCharge }}%</text>
					<text class="sub-title">小额服务费比例: {{ company.serviceChargeSmall }}%</text>
					<text class="sub-title">个税比例: {{ company.tax }}%</text>
					<view class="rebate-wrap">
						<view class="rebate-wrap-info">
							<text class="sub-title" v-for="rebate in company.rebateInfoList" :key="rebate.date">大额返佣时间: {{ rebate.date }}  返佣比例: {{ rebate.scale}}%</text>
						</view>
					</view>
					<view class="rebate-wrap">
						<view class="rebate-wrap-info">
							<text class="sub-title" v-for="rebate in company.rebateInfoListSmall" :key="rebate.date">小额返佣时间: {{ rebate.date }}  返佣比例: {{ rebate.scale}}%</text>
						</view>
					</view>
					<text class="sub-title">备注: {{ company.mark.length > 0 ? company.mark : '无' }}</text>
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
			<text>当前账号没有添加税源地</text>
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
				deleteCompany: null
			};
		},
		onPullDownRefresh() {
			const self = this
			// 震动
			uni.vibrateShort()
			uniCloud.callFunction({
				name: 'company',
				data: {
					type: 'get',
					openid: self.currentUser.openid
				}
			}).then(res => {
				self.UPDATECOMPANYLIST({
					companyList: res.result.data
				})
				uni.stopPullDownRefresh()
			})
		},
		computed: {
			...mapGetters(['currentUser', 'companyList'])
		},
		methods: {
			...mapMutations(['DELETECOMPANY', 'UPDATECOMPANYLIST']),
			onClickAddButton() {
				uni.navigateTo({
					url: './company_add'
				})
			},
			onClickEdit(company) {
				uni.navigateTo({
					url: `./company_add?company=${JSON.stringify(company)}`
				})
			},
			onClickDelete(company) {
				this.deleteCompany = company
				this.showDeleteModal = true
			},
			onClickCancelDelete() {
				this.deleteCompany = null
			},
			onClickConfirmDelete() {
				let self = this
				if (!self.deleteCompany) {
					return
				}
				const company = self.deleteCompany
				if (company.openid === self.currentUser.openid) {
					uniCloud.callFunction({
						name: 'company',
						data: {
							type: 'delete',
							company: company
						}
					}).then(res => {
						self.showDeleteModal = false
						if (res.result) {
							self.DELETECOMPANY({
								company: company
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

	.company-item {
		margin: 15px;
		padding: 15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px 2px $u-border-color;
		display: flex;
		flex-direction: column;
	}

	.company-item .top-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.company-item .top-wrap .tag-wrap {
		display: flex;
		align-items: center;
	}

	.tag-wrap u-tag {
		margin-left: 5px;
	}

	.company-item .title {
		font-size: 14px;
		font-weight: bold;
		color: $u-main-color;
	}

	.company-item .sub-title {
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
