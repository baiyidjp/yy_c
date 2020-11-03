<template>
	<view class="wrap">
		<u-form class="form-wrap" :model="company" ref="companyForm" label-width="auto">
			<u-form-item label="税源地名称:" prop="companyName">
				<u-input v-model="company.companyName" placeholder="请输入税源地名称" />
			</u-form-item>
			<u-form-item label="大额服务费(%):" prop="serviceCharge">
				<u-input type="digit" v-model="company.serviceCharge" placeholder="请输入税源地大额服务费(0-100)" />
			</u-form-item>
			<u-form-item label="小额服务费(%):" prop="serviceChargeSmall">
				<u-input type="digit" v-model="company.serviceChargeSmall" placeholder="请输入税源地小额服务费(0-100)" />
			</u-form-item>
			<u-form-item label="个税(%):" prop="tax">
				<u-input type="digit" v-model="company.tax" placeholder="请输入税源地个税(0-100)" />
			</u-form-item>
			<u-form-item v-for="(rebate, index) in company.rebateInfoList" :key="index" label="返佣信息(大额):">
				<u-input type="select" v-model="rebate.date" placeholder="请选择大额返佣时间" @click="onClickRebateDate(index)" />
				<u-input type="digit" style="width: 100px" v-model="rebate.scale" placeholder="大额返佣比例(%)(0-100)" />
			</u-form-item>
			<view class="u-flex" style="justify-content: space-between;padding: 5px;">
				<u-button :disabled="minusButtonDisabled" @click="onClickMinusIcon">减少大额返佣信息</u-button>
				<u-button :disabled="plusButtonDisabled" type="primary" @click="onClickPlusIcon">增加大额返佣信息</u-button>
			</view>
			<u-form-item v-for="(rebate, index) in company.rebateInfoListSmall" :key="index" label="返佣信息(小额):">
				<u-input type="select" v-model="rebate.date" placeholder="请选择小额返佣时间" @click="onClickRebateDateSmall(index)" />
				<u-input type="digit" style="width: 100px" v-model="rebate.scale" placeholder="小额返佣比例(%)(0-100)" />
			</u-form-item>
			<view class="u-flex" style="justify-content: space-between;padding: 5px;">
				<u-button :disabled="minusButtonDisabledSmall" @click="onClickMinusIconSmall">减少小额返佣信息</u-button>
				<u-button :disabled="plusButtonDisabledSmall" type="primary" @click="onClickPlusIconSmall">增加小额返佣信息</u-button>
			</view>
			<u-form-item label="备注:">
				<u-input v-model="company.mark" type="textarea" :auto-height="true" height="44" placeholder="请输入备注(选填)" />
			</u-form-item>
		</u-form>
		<u-button class="submit-button" :loading="submiting" :disabled="submiting" @click="onClickSubmit" type="primary">提交</u-button>
		<u-toast ref="uToast" />
		<u-popup v-model="showRebatePop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择大额返佣时间(单选)
				</view>
				<u-radio-group :wrap="true" v-model="currentRebateType">
					<u-radio v-for="(rebateDate, index) in rebateInfoList" :key="index" :name="rebateDate.type" @change="onChangeRebateDate">{{rebateDate.date}}</u-radio>
				</u-radio-group>
			</view>
		</u-popup>
		<u-popup v-model="showRebateSmallPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择小额返佣时间(单选)
				</view>
				<u-radio-group :wrap="true" v-model="currentRebateSmallType">
					<u-radio v-for="(rebateDate, index) in rebateInfoList" :key="index" :name="rebateDate.type" @change="onChangeRebateDateSmall">{{rebateDate.date}}</u-radio>
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
				company: {
					companyName: '',
					serviceCharge: '',
					serviceChargeSmall: '',
					tax: '1.5',
					rebateInfoList: [],
					rebateInfoListSmall: [],
					mark: '',
					openid: '',
					createAt: null,
					createBy: null,
					updateAt: null,
					updateBy: null
				},
				isEdit: false,
				rules: {
					companyName: [{
						required: true,
						message: '请输入税源地名称',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					serviceCharge: [{
						required: true,
						message: '请输入税源地服务费(小数)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value < 100 && value >= 0
						},
						message: '请输入税源地服务费(小数)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					serviceChargeSmall: [{
						required: true,
						message: '请输入税源地小额服务费(小数)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value < 100 && value >= 0
						},
						message: '请输入税源地小额服务费(小数)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					tax: [{
						required: true,
						message: '请输入税源地个税(小数)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value < 100 && value >= 0
						},
						message: '请输入税源地个税(小数)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
				},
				currentRebateIndex: 0,
				currentRebateSmallIndex: 0,
				showRebatePop: false,
				showRebateSmallPop: false,
				currentRebateType: 0,
				currentRebateSmallType: 0,
				submiting: false
			}
		},
		onLoad(option) {
			if (option.company) {
				this.company = JSON.parse(option.company)
				this.isEdit = true
			} else {
				const rebateDate = this.rebateInfoList[0]
				this.company.rebateInfoList = [{
					_id: rebateDate._id,
					type: rebateDate.type,
					date: rebateDate.date,
					scale: ''
				}]
				this.company.rebateInfoListSmall = [{
					_id: rebateDate._id,
					type: rebateDate.type,
					date: rebateDate.date,
					scale: ''
				}]
			}
		},
		onReady() {
			this.$refs.companyForm.setRules(this.rules);
			if (this.isEdit) {
				uni.setNavigationBarTitle({
					title: '编辑税源地'
				})
			}
		},
		computed: {
			...mapGetters(['currentUser', 'companyList', 'rebateInfoList']),
			minusButtonDisabled() {
				return this.company.rebateInfoList.length < 2
			},
			plusButtonDisabled() {
				return this.company.rebateInfoList.length >= 2
			},
			minusButtonDisabledSmall() {
				return this.company.rebateInfoListSmall.length < 2
			},
			plusButtonDisabledSmall() {
				return this.company.rebateInfoListSmall.length >= 2
			}
		},
		methods: {
			...mapMutations(['ADDCOMPANY', 'UPDATECOMPANY']),
			onClickPlusIcon() {
				if (this.company.rebateInfoList.length > 2) {
					return
				}
				this.company.rebateInfoList.splice(this.company.rebateInfoList.length, 0, {})
			},
			onClickMinusIcon(index) {
				this.company.rebateInfoList.splice(this.company.rebateInfoList.length-1, 1)
			},
			onClickRebateDate(index) {
				this.currentRebateIndex = index
				this.showRebatePop = true
				this.currentRebateType = -1
			},
			onChangeRebateDate(type) {
				const rebateDate = this.rebateInfoList.find(rebate => rebate.type === type)
				if (rebateDate) {
					this.company.rebateInfoList[this.currentRebateIndex] = {
						_id: rebateDate._id,
						type: rebateDate.type,
						date: rebateDate.date,
						scale: ''
					}
				}
				this.showRebatePop = false
			},
			onClickPlusIconSmall() {
				if (this.company.rebateInfoListSmall.length > 2) {
					return
				}
				this.company.rebateInfoListSmall.splice(this.company.rebateInfoListSmall.length, 0, {})
			},
			onClickMinusIconSmall(index) {
				this.company.rebateInfoListSmall.splice(1, 1)
			},
			onClickRebateDateSmall(index) {
				this.currentRebateSmallIndex = index
				this.showRebateSmallPop = true
				this.currentRebateSmallType = -1
			},
			onChangeRebateDateSmall(type) {
				const rebateDate = this.rebateInfoList.find(rebate => rebate.type === type)
				if (rebateDate) {
					this.company.rebateInfoListSmall[this.currentRebateSmallIndex] = {
						_id: rebateDate._id,
						type: rebateDate.type,
						date: rebateDate.date,
						scale: ''
					}
				}
				this.showRebateSmallPop = false
			},
			onClickSubmit() {
				const self = this
				if (self.company.rebateInfoList[0].scale <= 0) {
					this.$refs.uToast.show({
						title: '请输入返佣信息',
						type: 'error'
					})
					return
				}
				self.company.openid = self.currentUser.openid
				this.$refs.companyForm.validate(valid => {
					if (valid) {
						self.submiting = true
						if (self.isEdit) {
							self.company.updateAt = Date.now()
							self.company.updateBy = self.company.openid
							uniCloud.callFunction({
								name: 'company',
								data: {
									type: 'update',
									company: self.company
								}
							}).then(res => {
								if (res.result) {
									self.UPDATECOMPANY({
										company: self.company
									})
									self.showToast()
								}
							})
						} else {
							self.company.createAt = Date.now()
							self.company.createBy = self.company.openid
							uniCloud.callFunction({
								name: 'company',
								data: {
									type: 'add',
									company: self.company
								}
							}).then(res => {
								if (res.result.id) {
									self.company._id = res.result.id
									self.ADDCOMPANY({
										company: self.company
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
