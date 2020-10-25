<template>
	<view>
		<view>待完善</view>
		<u-button v-if="currentUser.isAdmin" type="primary" @click="onClickAllUserButton">用户列表</u-button>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	export default {
		data() {
			return {
				
			};
		},
		computed: {
			...mapGetters(['currentUser'])
		},
		methods: {
			onClickAllUserButton() {
				uni.navigateTo({
					url: '../user/user_list'
				})
			}
		},
	}
</script>

<style lang="scss">

</style>
