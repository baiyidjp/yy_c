import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		currentUser: null,
		companyList: null,
		clientList: null,
		issueList: null,
		rebateInfoList: null,
		contractStatusList: null,
		invoiceStatusList: null
	},
	getters: {
		currentUser: state => state.currentUser,
		companyList: state => state.companyList,
		clientList: state => state.clientList,
		issueList: state => state.issueList,
		rebateInfoList: state => state.rebateInfoList,
		contractStatusList: state => state.contractStatusList,
		invoiceStatusList: state => state.invoiceStatusList
	},
	mutations: {
		UPDATECURRENTUSER (state, payload) {
			state.currentUser = payload.user
		},
		// company
		UPDATECOMPANYLIST (state, payload) {
			state.companyList = payload.companyList
		},
		ADDCOMPANY (state, payload) {
			state.companyList.splice(0, 0, payload.company)
		},
		UPDATECOMPANY (state, payload) {
			const index = state.companyList.findIndex(company => company._id === payload.company._id)
			state.companyList.splice(index, 1, payload.company)
		},
		DELETECOMPANY (state, payload) {
			const index = state.companyList.findIndex(company => company._id === payload.company._id)
			state.companyList.splice(index, 1)
		},
		// client
		UPDATECLIENTLIST (state, payload) {
			state.clientList = payload.clientList
		},
		ADDCLIENT (state, payload) {
			state.clientList.splice(0, 0, payload.client)
		},
		UPDATECLIENT (state, payload) {
			const index = state.clientList.findIndex(client => client._id === payload.client._id)
			state.clientList.splice(index, 1, payload.client)
		},
		DELETECLIENT (state, payload) {
			const index = state.clientList.findIndex(client => client._id === payload.client._id)
			state.clientList.splice(index, 1)
		},
		// issue
		UPDATEISSUELIST (state, payload) {
			state.issueList = payload.issueList
		},
		ADDISSUE (state, payload) {
			state.issueList.splice(0, 0, payload.issue)
		},
		UPDATEISSUE (state, payload) {
			const index = state.issueList.findIndex(issue => issue._id === payload.issue._id)
			state.issueList.splice(index, 1, payload.issue)
		},
		DELETEISSUE (state, payload) {
			const index = state.issueList.findIndex(issue => issue._id === payload.issue._id)
			state.issueList.splice(index, 1)
		},
		// rebate date
		UPDATEREBATEINFOLIST (state, payload) {
			state.rebateInfoList = payload.rebateInfoList
		},
		// contract list
		UPDATECONTRACTSTATUS (state, payload) {
			state.contractStatusList = payload.contractStatusList
		},
		UPDATEINVOICESTATUS (state, payload) {
			state.invoiceStatusList = payload.invoiceStatusList
		}
	},
	actions: {
	}
})

export default store