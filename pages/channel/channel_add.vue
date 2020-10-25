<template>
	<view class="wrap" style="padding-bottom: 34px;">
		<u-form class="form-wrap" :model="channel" ref="channelForm" label-width="auto">
			<u-form-item label="渠道名称:" prop="channelName">
				<u-input v-model="channel.channelName" placeholder="请输入渠道名称" />
			</u-form-item>
			<u-form-item label="所属公司:" prop="channelCompany">
				<u-input v-model="channel.channelCompany" placeholder="请输入渠道所属公司" />
			</u-form-item>
			<u-form-item label="报价信息:" v-for="(companyInfo, index) in channel.channelCompanyInfoList" :key="index">
				<u-input type="select" v-model="companyInfo.companyName" placeholder="请选择税源地(单选)" @click="onClickChooseCompany(index)" />
				<u-input type="digit" v-model="companyInfo.quotationPoint" placeholder="请输入报价点数大额(0-100)" />
				<u-input type="digit" v-model="companyInfo.quotationPointSmall" placeholder="请输入报价点数小额(0-100)" />
			</u-form-item>
			<view class="u-flex" style="justify-content: space-between;padding: 5px;">
				<u-button :disabled="minusButtonDisabled" @click="onClickMinus">减少报价信息</u-button>
				<u-button type="primary" @click="onClickPlus">增加报价信息</u-button>
			</view>
			<u-form-item label="备注:">
				<u-input v-model="channel.mark" type="textarea" :auto-height="true" height="44" placeholder="请输入备注(选填)" />
			</u-form-item>
		</u-form>
		<u-button class="submit-button" :loading="submiting" :disabled="submiting" @click="onClickSubmit" type="primary">提交</u-button>
		<u-toast ref="uToast" />
		<u-popup v-model="showCompanyListPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择税源地(单选)
				</view>
				<u-radio-group v-model="currentCompanyId">
					<u-radio v-for="(company, index) in companyList" :key="index" :name="company._id" @change="onChangeChooseCompany">
						{{company.companyName}} ({{company.serviceCharge}}% | {{company.serviceChargeSmall}}%)
					</u-radio>
				</u-radio-group>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				channel: {
					channelName: '',
					channelCompany: '',
					channelCompanyInfoList: [{
						companyId: '',
						companyName: '',
						quotationPoint: '',
						quotationPointSmall: ''
					}],
					mark: '',
					openid: '',
					createAt: null,
					createBy: null,
					updateAt: null,
					updateBy: null
				},
				isEdit: false,
				rules: {
					channelName: [{
						required: true,
						message: '请输入渠道名称',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					quotationPoint: [{
						required: true,
						message: '请输入报价点数大额(0-100)',
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value < 100 && value >= 0
						},
						message: '请输入报价点数大额(0-100)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					quotationPointSmall: [{
						required: true,
						message: '请输入报价点数小额(0-100)',
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value < 100 && value >= 0
						},
						message: '请输入报价点数小额(0-100)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					channelCompany: [{
						required: true,
						message: '请输入渠道所属公司',
						trigger: ['change', 'blur']
					}]
				},
				currentCompanyId: '',
				currentCompanyIndex: 0,
				showCompanyListPop: false,
				submiting: false
			}
		},
		onLoad(option) {
			if (option.channel) {
				this.channel = JSON.parse(option.channel)
				this.isEdit = true
			}
		},
		onReady() {
			this.$refs.channelForm.setRules(this.rules);
			if (this.isEdit) {
				uni.setNavigationBarTitle({
					title: '编辑渠道'
				})
			}
		},
		computed: {
			...mapGetters(['currentUser', 'channelList', 'companyList']),
			minusButtonDisabled() {
				return this.channel.channelCompanyInfoList.length < 2
			}
		},
		methods: {
			...mapMutations(['ADDCHANNEL', 'UPDATECHANNEL']),
			onClickChooseCompany(index) {
				this.currentCompanyIndex = index
				this.showCompanyListPop = true
				this.currentCompanyId = ''
			},
			onChangeChooseCompany(companyId) {
				const company = this.companyList.find(company => company._id === companyId)
				if (company) {
					const companyInfo = this.channel.channelCompanyInfoList[this.currentCompanyIndex]
					companyInfo.companyId = company._id
					companyInfo.companyName = company.companyName
				}
				this.showCompanyListPop = false
			},
			onClickMinus() {
				this.channel.channelCompanyInfoList.splice(this.channel.channelCompanyInfoList.length - 1, 1)
			},
			onClickPlus() {
				this.channel.channelCompanyInfoList.splice(this.channel.channelCompanyInfoList.length, 0, {
					companyId: '',
					companyName: '',
					quotationPoint: '',
					quotationPointSmall: ''
				})
			},
			onClickSubmit() {
				const self = this
				if (self.channel.channelCompanyInfoList[0].companyId.length <= 0) {
					this.$refs.uToast.show({
						title: '请输入报价信息',
						type: 'error'
					})
					return
				}
				self.channel.openid = self.currentUser.openid
				this.$refs.channelForm.validate(valid => {
					if (valid) {
						self.submiting = true
						if (self.isEdit) {
							self.channel.updateAt = Date.now()
							self.channel.updateBy = self.channel.openid
							uniCloud.callFunction({
								name: 'channel',
								data: {
									type: 'update',
									channel: self.channel
								}
							}).then(res => {
								if (res.result) {
									this.UPDATECHANNEL({
										channel: self.channel
									})
									self.showToast()
								}
							})
						} else {
							self.channel.createAt = Date.now()
							self.channel.createBy = self.channel.openid
							uniCloud.callFunction({
								name: 'channel',
								data: {
									type: 'add',
									channel: self.channel
								}
							}).then(res => {
								if (res.result.id) {
									self.channel._id = res.result.id
									self.ADDCHANNEL({
										channel: self.channel
									})
									self.showToast()
								}
							})
						}
					} else {
						self.submiting = false
						console.log('验证失败');
					}
				});
			},
			showToast() {
				this.$refs.uToast.show({
					title: this.isEdit ? '更新成功' : '添加成功',
					type: 'success'
				})
				setTimeout(() => {
					this.submiting = false
					uni.navigateBack()
				}, 500)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 20px 20px 34px;
		display: flex;
		flex-direction: column;
	}

	.show-pop {
		padding: 20px;
		display: flex;
		flex-direction: column;
	}

	.show-pop-title {
		font-size: 14px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 20px;
	}

	.submit-button {
		margin-top: 20px;
	}
</style>
