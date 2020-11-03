<template>
	<view class="wrap">
		<u-form class="form-wrap" :model="client" ref="clientForm" label-width="auto">
			<u-form-item label="客户名称:" prop="clientName">
				<u-input v-model="client.clientName" placeholder="请输入客户名称" />
			</u-form-item>
			<u-form-item label="签约点位(%):" prop="signupPoint">
				<u-input type="digit" v-model="client.signupPoint" placeholder="请输入签约点位(0-100)" />
			</u-form-item>
			<u-form-item label="税源地:" prop="companyIds">
				<u-input :value="clientCompanyNames" type="select" placeholder="请选择税源地(可多选)" @click="onClickCompanyList" />
			</u-form-item>
			<u-form-item label="联系方式:">
				<u-input :value="clientContactNames" type="select" placeholder="请输入客户联系方式" @click="showContactPop = true" />
			</u-form-item>
			<u-form-item label="开票信息:">
				<u-input :value="clientInvoiceInfo" type="select" placeholder="请输入客户开票信息" @click="showInvoiceInfoPop = true" />
			</u-form-item>
			<u-form-item label="签约时间:" prop="signupTime">
				<u-input :value="client.signupTime" type="select" placeholder="请选择签约时间" @click="showCalendar = true" />
			</u-form-item>
			<u-form-item label="合同状态:" prop="contractStatusId">
				<u-input :value="checkedContractStatus.status" type="select" placeholder="请选择合同状态(单选)" @click="onClickContractList" />
			</u-form-item>
			<u-form-item label="备注:">
				<u-input v-model="client.mark" type="textarea" :auto-height="true" height="44" placeholder="请输入备注(选填)" />
			</u-form-item>
		</u-form>
		<u-button class="submit-button" :loading="submiting" :disabled="submiting" @click="onClickSubmit" type="primary">提交</u-button>
		<u-toast ref="uToast" />
		<u-calendar v-model="showCalendar" mode="date" max-date="2099-01-01" @change="onChangeDate"></u-calendar>
		<u-modal v-model="showCompanyModal" content="暂无税源地,是否去添加?" :show-cancel-button="true" confirm-text="添加" @confirm="onClickConfirmCompany"></u-modal>
		<u-popup v-model="showCompanyPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择税源地(多选)
				</view>
				<u-checkbox-group :wrap="true" shape="circle" @change="onChangeCompany">
					<u-checkbox v-model="company.checked" v-for="(company, index) in clientCompanyList" :key="index" :name="company._id">
						{{company.companyName}} ({{company.serviceCharge}}% | {{company.serviceChargeSmall}}%)
					</u-checkbox>
				</u-checkbox-group>
			</view>
		</u-popup>
		<u-popup v-model="showContactPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请填写客户联系方式
				</view>
				<u-form class="contact-form" :model="client.contactInformation" label-width="160">
					<u-form-item label="联系人姓名:">
						<u-input v-model="client.contactInformation.name" placeholder="请输入姓名" />
					</u-form-item>
					<u-form-item label="联系方式:">
						<u-input v-model="client.contactInformation.phone" placeholder="请输入联系方式" />
					</u-form-item>
					<u-form-item label="地址:">
						<u-input v-model="client.contactInformation.address" placeholder="请输入地址" />
					</u-form-item>
				</u-form>
				<u-button @click="onClickContactDone" type="primary">完成</u-button>
			</view>
		</u-popup>
		<u-popup v-model="showInvoiceInfoPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请填写客户开票信息
				</view>
				<u-form class="contact-form" :model="client.invoiceInfo" label-width="160">
					<u-form-item label="公司名称:">
						<u-input v-model="client.invoiceInfo.companyName" placeholder="请输入公司名称" />
					</u-form-item>
					<u-form-item label="纳税识别号:">
						<u-input v-model="client.invoiceInfo.taxNumber" placeholder="请输入纳税识别号" />
					</u-form-item>
					<u-form-item label="注册地址:">
						<u-input v-model="client.invoiceInfo.registerAddress" placeholder="请输入注册地址" />
					</u-form-item>
					<u-form-item label="电话:">
						<u-input v-model="client.invoiceInfo.phone" placeholder="请输入电话" />
					</u-form-item>
					<u-form-item label="银行开户行:">
						<u-input v-model="client.invoiceInfo.bankName" placeholder="请输入银行开户行" />
					</u-form-item>
					<u-form-item label="银行账号:">
						<u-input v-model="client.invoiceInfo.bankNumber" placeholder="请输入银行账号" />
					</u-form-item>
					<u-form-item label="邮寄地址:">
						<u-input v-model="client.invoiceInfo.postAddress" placeholder="请输入邮寄地址" />
					</u-form-item>
				</u-form>
				<u-button @click="onClickInvoiceDone" type="primary">完成</u-button>
			</view>
		</u-popup>
		<u-popup v-model="showContractPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择合同状态(单选)
				</view>
				<u-radio-group :wrap="true" v-model="client.contractStatusId">
					<u-radio v-for="(contract, index) in showContractStatusList" :key="index" :name="contract._id" @change="onChangeContractStatus">
						{{contract.status}}
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
				client: {
					clientName: '',
					signupPoint: '',
					companyIds: [],
					contactInformation: {
						name: '',
						phone: '',
						address: ''
					},
					invoiceInfo: {
						companyName: '',
						taxNumber: '',
						registerAddress: '',
						phone: '',
						bankName: '',
						bankNumber: '',
						postAddress: '',
					},
					signupTime: '',
					contractStatusId: '',
					mark: '',
					openid: '',
					createAt: null,
					createBy: null,
					updateAt: null,
					updateBy: null
				},
				isEdit: false,
				rules: {
					clientName: [{
						required: true,
						message: '请输入客户名称',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					signupPoint: [{
						required: true,
						message: '请输入服务费费率(0-100)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value < 100 && value >= 0
						},
						message: '请输入服务费费率(0-100)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					companyIds: [{
						// 自定义验证函数
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value.length > 0
						},
						message: '请选择税源地(可多选)',
						trigger: ['change', 'blur']
					}],
					signupTime: [{
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value.length > 0 ? true : false
						},
						message: '请选择签约时间',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}]
				},
				submiting: false,
				showCalendar: false,
				showCompanyModal: false,
				// check box 使用
				clientCompanyList: [],
				showCompanyPop: false,
				clientCompanyNames: '',
				showContactPop: false,
				clientContactNames: '',
				showInvoiceInfoPop: false,
				clientInvoiceInfo: '',
				showContractPop: false,
				showContractStatusList: [],
				checkedContractStatus: null
			}
		},
		onLoad(option) {
			if (option.client) {
				this.client = JSON.parse(option.client)
				this.isEdit = true
				this.clientCompanyNames = this.companyList.filter(company => this.client.companyIds.includes(company._id)).map(
					company => company.companyName).toString()
				this.clientContactNames =
					`${this.client.contactInformation.name} ${this.client.contactInformation.phone} ${this.client.contactInformation.address}`
				this.clientInvoiceInfo = `${this.client.invoiceInfo.companyName} ${this.client.invoiceInfo.taxNumber}`
			}
			if (this.contractStatusList.length > 0) {
				this.showContractStatusList = this.contractStatusList.map(contractStatus => {
					return {
						_id: contractStatus._id,
						status: contractStatus.status,
						checked: false
					}
				})
				this.checkedContractStatus = this.contractStatusList.find(contractStatus => contractStatus._id === this.client.contractStatusId)
			}
		},
		onShow() {
			let self = this
			self.clientCompanyList = self.companyList.map(company => {
				return {
					checked: self.client.companyIds.includes(company._id),
					_id: company._id,
					companyName: company.companyName,
					serviceCharge: company.serviceCharge,
					serviceChargeSmall: company.serviceChargeSmall
				}
			})
		},
		onReady() {
			this.$refs.clientForm.setRules(this.rules);
			if (this.isEdit) {
				uni.setNavigationBarTitle({
					title: '编辑客户'
				})
			}
		},
		computed: {
			...mapGetters(['currentUser', 'clientList', 'companyList', 'contractStatusList'])
		},
		methods: {
			...mapMutations(['ADDCLIENT', 'UPDATECLIENT']),
			onChangeDate(e) {
				this.client.signupTime = e.result
			},
			onClickCompanyList() {
				if (this.companyList.length > 0) {
					this.showCompanyPop = true
				} else {
					this.showCompanyModal = true
				}
			},
			onClickConfirmCompany() {
				uni.navigateTo({
					url: '../company/company_add'
				})
			},
			onChangeCompany(ids) {
				const checkedCompanyList = this.companyList.filter(company => ids.includes(company._id))
				this.clientCompanyNames = checkedCompanyList.map(company => company.companyName).toString()
				this.client.companyIds = checkedCompanyList.map(company => company._id)
			},
			onClickContactDone() {
				this.showContactPop = false
				this.clientContactNames =
					`${this.client.contactInformation.name} ${this.client.contactInformation.phone} ${this.client.contactInformation.address}`
			},
			onClickInvoiceDone() {
				this.showInvoiceInfoPop = false
				const invoiceInfo = this.client.invoiceInfo
				this.clientInvoiceInfo = `${invoiceInfo.companyName} ${invoiceInfo.taxNumber}`
			},
			onClickContractList() {
				this.showContractPop = true
			},
			onChangeContractStatus(id) {
				this.client.contractStatusId = id
				this.checkedContractStatus = this.contractStatusList.find(contractStatus => contractStatus._id === id)
				this.showContractPop = false
			},
			onClickSubmit() {
				const self = this
				self.client.openid = self.currentUser.openid
				this.$refs.clientForm.validate(valid => {
					if (valid) {
						self.submiting = true
						if (self.isEdit) {
							self.client.updateAt = Date.now()
							self.client.updateBy = self.client.openid
							uniCloud.callFunction({
								name: 'client',
								data: {
									type: 'update',
									client: self.client
								}
							}).then(res => {
								if (res.result) {
									self.UPDATECLIENT({
										client: self.client
									})
									self.showToast()
								}
							})
						} else {
							console.log(self.client);
							self.client.createAt = Date.now()
							self.client.createBy = self.client.openid
							uniCloud.callFunction({
								name: 'client',
								data: {
									type: 'add',
									client: self.client
								}
							}).then(res => {
								console.log(res);
								if (res.result.id) {
									self.client._id = res.result.id
									self.ADDCLIENT({
										client: self.client
									})
									self.showToast()
								}
							})
						}
					} else {
						self.submiting = false
						console.log('验证失败');
					}
				})
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

	.contact-form {
		margin-bottom: 10px;
	}

	.submit-button {
		margin-top: 20px;
	}
</style>
