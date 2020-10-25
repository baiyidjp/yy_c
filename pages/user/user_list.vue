<template>
	<view>
		<block v-for="user in userList" :key="user._id">
			<view class="user-item">
				<view class="top-wrap">
					<text class="title">{{ user.name }}</text>
					<u-tag v-if="user.isApproved" text="取消授权" type="error" @click="onClickCancel(user)"></u-tag>
					<u-tag v-if="!user.isApproved" text="授权" @click="onClickApproved(user)"></u-tag>
				</view>
				<text class="sub-title">联系方式: {{ user.phone }}</text>
			</view>
		</block>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userList: []
			}
		},
		onLoad() {
			const self = this
			uniCloud.callFunction({
				name: 'user',
				data: {
					type: 'get'
				}
			}).then(res => {
				self.userList = res.result.data
			})
		},
		methods: {
			onClickApproved(user) {
				user.isApproved = true
				uniCloud.callFunction({
					name: 'user',
					data: {
						type: 'update',
						user: user
					}
				})
			},
			onClickCancel(user) {
				user.isApproved = false
				uniCloud.callFunction({
					name: 'user',
					data: {
						type: 'update',
						user: user
					}
				})
			}
		},
	}
</script>

<style lang="scss" scoped>
	.user-item {
		margin: 15px;
		padding: 15px;
		border-radius: 5px;
		box-shadow: 1px 1px 5px 2px $u-border-color;
		display: flex;
		flex-direction: column;
	}

	.user-item .top-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.user-item .title {
		font-size: 14px;
		font-weight: bold;
		color: $u-main-color;
	}

	.user-item .sub-title {
		margin-top: 5px;
		font-size: 14px;
		color: $u-content-color;
	}
</style>
