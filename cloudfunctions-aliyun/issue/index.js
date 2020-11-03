'use strict';
exports.main = async (event, context) => {
	// event.type = get/add/update/delete
	// get 获取税源地的列表
	// add 增加新的税源地
	// update 更新税源地信息
	// delete 删除税源地信息
	const type = event.type

	const db = uniCloud.database()

	if (type === 'get') {
		let issueList = await db.collection('issue_list').where({
			openid: event.openid
		}).orderBy('createAt', 'desc').get()
		return issueList
	}

	if (type === 'add') {

		const issueid = await db.collection('issue_list').add(event.issue)
		return issueid
	}

	if (type === 'update') {
		const issue = event.issue
		const result = await db.collection('issue_list').doc(issue._id).update({
			clientId: issue.clientId,
			companyId: issue.companyId,
			totalAmount: issue.totalAmount,
			companyServiceCharge: issue.companyServiceCharge,
			channelQuotationPoint: issue.channelQuotationPoint,
			serviceChargeAmount: issue.serviceChargeAmount,
			channelAmount: issue.channelAmount,
			myAmount: issue.myAmount,
			rebateInfoList: issue.rebateInfoList,
			invoiceStatusId: issue.invoiceStatusId,
			mark: issue.mark,
			createAt: issue.createAt,
			createBy: issue.createBy,
			updateAt: issue.updateAt,
			updateBy: issue.updateBy
		})
		return result ? true : false
	}

	if (type === 'delete') {
		const issue = event.issue
		const result = await db.collection('issue_list').where({
			openid: issue.openid,
			_id: issue._id
		}).remove()
		return result ? true : false
	}

	//返回数据给客户端
	return event
};
