'use strict';
exports.main = async (event, context) => {

	const type = event.type

	const db = uniCloud.database()

	if (type === 'get') {
		const userList = await db.collection('user_list').orderBy('createAt', 'desc').get()
		return userList
	}

	if (type === 'add') {
		const userid = await db.collection('user_list').add(event.user)
		//返回数据给客户端
		return userid ? true : false
	}

	if (type === 'update') {
		const user = event.user
		const result = await db.collection('user_list').doc(user._id).update({
			isApproved: user.isApproved,
			updateAt: user.updateAt,
			updateBy: user.updateBy
		})
		return result ? true : false
	}

	//返回数据给客户端
	return event
};
