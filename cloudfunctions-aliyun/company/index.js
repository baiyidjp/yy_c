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
		let companyList = await db.collection('company_list').where({
			openid: event.openid
		}).orderBy('createAt', 'desc').get()
		return companyList
	}
	
	if (type === 'add') {
		
		const companyid = await db.collection('company_list').add(event.company)
		return companyid
	}
	
	if (type === 'update') {
		const company = event.company
		const result = await db.collection('company_list').doc(company._id).update({
			companyName: company.companyName,
			serviceCharge: company.serviceCharge,
			serviceChargeSmall: company.serviceChargeSmall,
			tax: company.tax,
			rebateInfoList: company.rebateInfoList,
			rebateInfoListSmall: company.rebateInfoListSmall,
			mark: company.mark,
			createAt: company.createAt,
			createBy: company.createBy,
			updateAt: company.updateAt,
			updateBy: company.updateBy
		})
		return result ? true : false
	}
	
	if (type === 'delete') {
		const company = event.company
		const result = await db.collection('company_list').where({
			openid: company.openid,
			_id: company._id
		}).remove()
		return result ? true : false
	}
	
	//返回数据给客户端
	return event
};
