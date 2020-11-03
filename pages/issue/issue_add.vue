<template>
	<view class="wrap">
		<u-form class="form-wrap" :model="issue" ref="issueForm" label-width="auto">
			<u-form-item label="业务单客户:" prop="clientId">
				<u-input type="select" :value="checkedClient.clientName" placeholder="请选择客户" @click="onClickClientList" />
			</u-form-item>
			<u-form-item label="税源地:" prop="companyId">
				<u-input type="select" :value="checkedCompanyName" placeholder="请选择税源地" @click="onClickCompanyList" />
			</u-form-item>
			<u-form-item v-if="checkedCompany" label="服务费类型:">
				<u-radio-group :wrap="true" v-model="issue.companyServiceCharge" @change="onChangeCompanyServiceCharge">
					<u-radio :name="checkedCompany.serviceCharge">大额({{ checkedCompany.serviceCharge || 0 }}%)</u-radio>
					<u-radio :name="checkedCompany.serviceChargeSmall">小额({{ checkedCompany.serviceChargeSmall || 0 }}%)</u-radio>
				</u-radio-group>
			</u-form-item>
			<u-form-item v-if="checkedCompany" label="众包费:" prop="totalAmount">
				<u-input v-model="issue.totalAmount" type="digit" placeholder="请输入众包费(数字)" />
			</u-form-item>
			<u-form-item v-if="checkedCompany" label="税源地应得:">
				<u-input :value="serviceChargeAmount" type="digit" :disabled="true" placeholder="税源地服务费" />
			</u-form-item>
			<u-form-item v-if="checkedCompany" label="个人应得:">
				<u-input :value="myAmount" type="number" :disabled="true" placeholder="个人所得" />
			</u-form-item>
			<u-form-item v-if="checkedCompany" label="返佣时间:" v-for="(rebateInfo, index) in issue.rebateInfoList" :key="rebateInfo.date">
				<text>{{ rebateInfo.date }} 应返佣金: {{ index === 0 ? firstRebateAmount : secondRebateAmount}}</text>
			</u-form-item>
			<u-form-item label="发票状态:" prop="invoiceStatusId">
				<u-input :value="checkedInvoiceStatus.status" type="select" placeholder="请选择发票状态(单选)" @click="onClickInvoiceList" />
			</u-form-item>
			<u-form-item label="备注:">
				<u-input v-model="issue.mark" type="textarea" :auto-height="true" height="44" placeholder="请输入备注(选填)" />
			</u-form-item>
		</u-form>
		<u-button class="submit-button" :loading="submiting" :disabled="submiting" @click="onClickSubmit" type="primary">提交</u-button>
		<u-toast ref="uToast" />
		<u-modal v-model="showClientModal" content="暂无客户,是否去添加?" :show-cancel-button="true" confirm-text="添加" @confirm="onClickConfirmClient"></u-modal>
		<u-popup v-model="showClientPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择客户(单选)
				</view>
				<u-radio-group v-model="checkedClient._id" :wrap="true">
					<u-radio v-for="(client, index) in issueClientList" :key="index" :name="client._id" @change="onChangeClient">
						{{client.clientName}} (签约价格: {{client.signupPoint}}%)
					</u-radio>
				</u-radio-group>
			</view>
		</u-popup>
		<u-modal v-model="showCompanyModal" content="请先选择客户" @confirm="onClickClientList"></u-modal>
		<u-popup v-model="showCompanyPop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择税源地(单选)
				</view>
				<u-radio-group v-model="checkedCompany._id" :wrap="true">
					<u-radio v-for="(company, index) in checkedClientCompanyList" :key="index" :name="company._id" @change="onChangeCompany">
						{{company.companyName}} ({{company.serviceCharge}}% | {{company.serviceChargeSmall}}%)
					</u-radio>
				</u-radio-group>
			</view>
		</u-popup>
		<u-calendar v-model="showCalendar" mode="date" max-date="2099-01-01" @change="onChangeDate"></u-calendar>
		<u-popup v-model="showInvoicePop" mode="center" border-radius="10" width="95%" :closeable="true">
			<view class="show-pop">
				<view class="show-pop-title">
					请选择发票状态(单选)
				</view>
				<u-radio-group :wrap="true" v-model="issue.invoiceStatusId">
					<u-radio v-for="(invoice, index) in showInvoiceStatusList" :key="index" :name="invoice._id" @change="onChangeInvoiceStatus">
						{{invoice.status}}
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
				issue: {
					// 客户的id
					clientId: '',
					// 税源地id
					companyId: '',
					// 众包费
					totalAmount: 0,
					// 税源地的服务费
					companyServiceCharge: 0,
					// 税源地应得
					serviceChargeAmount: 0,
					// 个人应得
					myAmount: 0,
					// 返佣信息 
					rebateInfoList: [],
					// 发票状态Id
					invoiceStatusId: '',
					mark: '',
					openid: '',
					createAt: null,
					createBy: null,
					updateAt: null,
					updateBy: null
				},
				isEdit: false,
				rules: {
					clientId: [{
						required: true,
						message: '请选择客户(单选)',
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value.length > 0
						},
						message: '请选择客户(单选)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					companyId: [{
						required: true,
						message: '请选择税源地(单选)',
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value.length > 0
						},
						message: '请选择税源地(单选)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}],
					totalAmount: [{
						required: true,
						message: '请输入众包费(数字)',
						trigger: ['change', 'blur'],
					}, {
						validator: (rule, value, callback) => {
							// 返回true表示校验通过，返回false表示不通过
							return value > 0
						},
						message: '请输入众包费(数字)',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur']
					}]
				},
				// 提交中
				submiting: false,
				// 展示无客户的提示
				showClientModal: false,
				// 选择客户
				showClientPop: false,
				// 可供选择的客户列表
				issueClientList: [],
				// 选中的客户
				checkedClient: null,
				// 展示无税源地的提示
				showCompanyModal: false,
				// 选择税源地
				showCompanyPop: false,
				// 选中的客户关联的税源地列表
				checkedClientCompanyList: [],
				// 选择的税源地
				checkedCompany: null,
				// 展示日历
				showCalendar: false,
				// 展示发票状态列表
				showInvoicePop: false,
				showInvoiceStatusList: [],
				// 当前选中的发票状态
				checkedInvoiceStatus: null
			}
		},
		onLoad(option) {
			if (option.issue) {
				this.issue = JSON.parse(option.issue)
				this.isEdit = true
				this.checkedClient = this.clientList.find(client => client._id === this.issue.clientId)
				this.checkedClientCompanyList = this.companyList.filter(company => this.checkedClient.companyIds.includes(company._id))
				this.checkedCompany = this.companyList.find(company => company._id === this.issue.companyId)
			}
			if (this.invoiceStatusList.length > 0) {
				this.showInvoiceStatusList = this.invoiceStatusList.map(invoiceStatus => {
					return {
						_id: invoiceStatus._id,
						status: invoiceStatus.status,
						checked: false
					}
				})
				this.checkedInvoiceStatus = this.invoiceStatusList.find(invoiceStatus => invoiceStatus._id === this.issue.invoiceStatusId)
			}
		},
		onShow() {
			let self = this
			// 将数据转换为可被使用的数据
			self.issueClientList = self.clientList.map(client => {
				return {
					checked: self.issue.clientId === client._id,
					_id: client._id,
					clientName: client.clientName,
					signupPoint: client.signupPoint
				}
			})
		},
		onReady() {
			// 设置校验
			this.$refs.issueForm.setRules(this.rules);
			if (this.isEdit) {
				uni.setNavigationBarTitle({
					title: '编辑业务单'
				})
			}
		},
		computed: {
			...mapGetters(['currentUser', 'issueList', 'clientList', 'companyList', 'invoiceStatusList']),
			// 选中的税源地名
			checkedCompanyName() {
				return this.checkedCompany ? this.checkedCompany.companyName : ''
			},
			// 税源地应得
			serviceChargeAmount() {
				const amount = this.issue.totalAmount * (this.issue.companyServiceCharge * 0.01)
				return amount.toFixed(2)
			},
			// 个人应得
			myAmount() {
				if (this.checkedClient && this.checkedCompany) {
					const amount = this.issue.totalAmount * (this.checkedClient.signupPoint * 0.01 - this.issue.companyServiceCharge *
							0.01) *
						(1 - this.checkedCompany.tax * 0.01)
					return amount.toFixed(2)
				}
				return 0
			},
			// 第一次返佣
			firstRebateAmount() {
				if (this.checkedClient && this.checkedCompany && this.issue.rebateInfoList.length > 0) {
					const amount = this.issue.totalAmount * (this.checkedClient.signupPoint * 0.01 - this.issue.rebateInfoList[0].scale *
							0.01) *
						(1 - this.checkedCompany.tax * 0.01)
					return amount.toFixed(2)
				}
				return 0
			},
			// 第二次返佣
			secondRebateAmount() {
				if (this.checkedClient && this.checkedCompany && this.issue.rebateInfoList.length > 1) {
					const amount = this.issue.totalAmount * (this.issue.rebateInfoList[0].scale *
							0.01 - this.issue.companyServiceCharge * 0.01) *
						(1 - this.checkedCompany.tax * 0.01)
					return amount.toFixed(2)
				}
				return 0
			}
		},
		methods: {
			...mapMutations(['ADDISSUE', 'UPDATEISSUE']),
			// 确定添加新的客户
			onClickConfirmClient() {
				uni.navigateTo({
					url: '../client/client_add'
				})
			},
			// 弹出客户的列表
			onClickClientList() {
				if (this.clientList.length > 0) {
					this.showClientPop = true
				} else {
					this.showClientModal = true
				}
			},
			// 选择客户(客户id)
			onChangeClient(id) {
				this.issue.clientId = id
				this.checkedClient = this.clientList.find(client => client._id === id)
				this.checkedClientCompanyList = this.companyList.filter(company => this.checkedClient.companyIds.includes(company._id))
				// 清空已选择的税源地
				this.issue.companyId = ''
				this.checkedCompany = null
				this.showClientPop = false
			},
			// 弹出税源地的列表
			onClickCompanyList() {
				if (this.checkedClientCompanyList.length > 0) {
					this.showCompanyPop = true
				} else {
					this.showCompanyModal = true
				}
			},
			// 选择税源地
			onChangeCompany(id) {
				this.issue.companyId = id
				this.checkedCompany = this.companyList.find(company => company._id === id)
				this.issue.companyServiceCharge = this.checkedCompany.serviceCharge
				this.handleRebateInfoList()
				this.showCompanyPop = false
			},
			// 选择/改变 税源地服务费
			onChangeCompanyServiceCharge(value) {
				if (value === this.checkedCompany.serviceCharge) {
					this.handleRebateInfoList()
				}
				if (value === this.checkedCompany.serviceChargeSmall) {
					this.handleRebateInfoListSmall()
				}
			},
			handleRebateInfoList() {
				this.issue.rebateInfoList = this.checkedCompany.rebateInfoList.map(rebateDate => {
					// 转为具体的 年月日
					let dateString = rebateDate.date
					const type = rebateDate.type
					const currentDate = new Date()
					// type 
					// 0-当天 
					// 1-下周二 
					// 2-次月25号 
					// 3-次月15号 
					// 4-次次月25号
					if (type === 0) {
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					if (type === 1) {
						const currentDay = currentDate.getDay()
						let moreDay = 0
						// 算出多加几天的时间 周末是0 直接加2天
						if (currentDay === 0) {
							moreDay = 2
						} else {
							moreDay = 9 - currentDay
						}
						dateString = this.$util.timeFormat(currentDate.getTime() + moreDay * 24 * 60 * 60 * 1000)
					}
					if (type === 2) {
						let year = currentDate.getFullYear()
						let month = currentDate.getMonth() + 1
						if (month > 11) {
							month = 0
							year += 1
						}
						// 设置下一个月25号的日期
						currentDate.setFullYear(year, month, 25)
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					if (type === 3) {
						let year = currentDate.getFullYear()
						let month = currentDate.getMonth() + 1
						if (month > 11) {
							month = 0
							year += 1
						}
						// 设置下一个月15号的日期
						currentDate.setFullYear(year, month, 15)
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					if (type === 4) {
						let year = currentDate.getFullYear()
						let month = currentDate.getMonth() + 2
						if (month > 11) {
							month = 0
							year += 1
						}
						// 设置下下一个月25号的日期
						currentDate.setFullYear(year, month, 25)
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					const dateStringArray = dateString.split('-')
					const rebateInfo = {
						date: dateString,
						type: type,
						scale: rebateDate.scale,
						isFinish: false
					}
					if (dateStringArray.length === 3) {
						rebateInfo['year'] = dateStringArray[0]
						rebateInfo['month'] = dateStringArray[1]
						rebateInfo['day'] = dateStringArray[2]
					}
					return rebateInfo
				})
			},
			handleRebateInfoListSmall() {
				this.issue.rebateInfoList = this.checkedCompany.rebateInfoListSmall.map(rebateDate => {
					// 转为具体的 年月日
					let dateString = rebateDate.date
					const type = rebateDate.type
					const currentDate = new Date()
					// type
					// 0-当天 
					// 1-下周二 
					// 2-次月25号 
					// 3-次月15号 
					// 4-次次月25号
					if (type === 0) {
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					if (type === 1) {
						const currentDay = currentDate.getDay()
						let moreDay = 0
						// 算出多加几天的时间 周末是0 直接加2天
						if (currentDay === 0) {
							moreDay = 2
						} else {
							moreDay = 9 - currentDay
						}
						dateString = this.$util.timeFormat(currentDate.getTime() + moreDay * 24 * 60 * 60 * 1000)
					}
					if (type === 2) {
						let year = currentDate.getFullYear()
						let month = currentDate.getMonth() + 1
						if (month > 11) {
							month = 0
							year += 1
						}
						// 设置下一个月25号的日期
						currentDate.setFullYear(year, month, 25)
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					if (type === 3) {
						let year = currentDate.getFullYear()
						let month = currentDate.getMonth() + 1
						if (month > 11) {
							month = 0
							year += 1
						}
						// 设置下一个月15号的日期
						currentDate.setFullYear(year, month, 15)
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					if (type === 4) {
						let year = currentDate.getFullYear()
						let month = currentDate.getMonth() + 2
						if (month > 11) {
							month = 0
							year += 1
						}
						// 设置下下一个月25号的日期
						currentDate.setFullYear(year, month, 25)
						dateString = this.$util.timeFormat(currentDate.getTime())
					}
					const dateStringArray = dateString.split('-')
					const rebateInfo = {
						date: dateString,
						type: type,
						scale: rebateDate.scale,
						isFinish: false
					}
					if (dateStringArray.length === 3) {
						rebateInfo['year'] = dateStringArray[0]
						rebateInfo['month'] = dateStringArray[1]
						rebateInfo['day'] = dateStringArray[2]
					}
					return rebateInfo
				})
			},
			// 弹出选择发票状态
			onClickInvoiceList() {
				this.showInvoicePop = true
			},
			// 选了发票状态
			onChangeInvoiceStatus(id) {
				this.issue.invoiceStatusId = id
				this.checkedInvoiceStatus = this.invoiceStatusList.find(invoiceStatus => invoiceStatus._id === id)
				this.showInvoicePop = false
			},
			// 提交
			onClickSubmit() {
				const self = this
				self.issue.openid = self.currentUser.openid
				self.issue.serviceChargeAmount = self.serviceChargeAmount
				self.issue.myAmount = self.myAmount
				self.issue.rebateInfoList[0].amount = self.firstRebateAmount
				if (self.issue.rebateInfoList.length === 2) {
					self.issue.rebateInfoList[1].amount = self.secondRebateAmount
				}
				this.$refs.issueForm.validate(valid => {
					if (valid) {
						self.submiting = true
						if (self.isEdit) {
							self.issue.updateAt = Date.now()
							self.issue.updateBy = self.issue.openid
							uniCloud.callFunction({
								name: 'issue',
								data: {
									type: 'update',
									issue: self.issue
								}
							}).then(res => {
								if (res.result) {
									self.UPDATEISSUE({
										issue: self.issue
									})
									self.showToast()
								}
							})
						} else {
							self.issue.createAt = Date.now()
							self.issue.createBy = self.issue.openid
							uniCloud.callFunction({
								name: 'issue',
								data: {
									type: 'add',
									issue: self.issue
								}
							}).then(res => {
								if (res.result.id) {
									self.issue._id = res.result.id
									self.ADDISSUE({
										issue: self.issue
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
