'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	const code = event.code
	if (!code) {
		return false
	}
	
	const db = uniCloud.database()
	
	let appInfos = await db.collection('app_info').get()
	const appInfo = appInfos.data[0]
	
	const openidUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appInfo.appid}&secret=${appInfo.secret}&js_code=${code}&grant_type=authorization_code`

	const openidResult = await uniCloud.httpclient.request(openidUrl, {
		method:'GET',
		dataType: 'json'
	})
	const openid = openidResult.data.openid
	
	let users = await db.collection('user_list').where({
		openid: openid
	}).get()
	// 返回当前用户的对象
	let user = {
		openid: openid,
		name: '',
		phone: '',
		isApproved: false,
		isAdmin: false,
		createAt: null,
		createBy: null,
		updateAt: null,
		updateBy: null
	}
	// 如果在后台有记录则返回记录的用户对象
	if (users.data.length > 0) {
		user = users.data[0]
	}
	
	let reviewInfo = await db.collection('review').get()
	if (reviewInfo.data[0].isReview) {
		user.isApproved = true
	}
	
	return user
};
