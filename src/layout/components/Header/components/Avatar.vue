<template>
  <ElPopover
      popper-class="message-popper"
      placement="bottom-start"
      trigger="hover"
    >
    <template #reference>
      <div class="avatar">
        <img src="@/assets/imgs/user2.png" alt="avatar" />
      </div>
    </template>
    <div @click="logout" class="sign">{{ $t('header.signOut') }}</div>
  </ElPopover>
  <!-- 个人信息 -->
  <InfoDialog ref="infoRef" />
  <!-- 修改密码 -->
  <PasswordDialog ref="passwordRef" />
</template>
<script setup lang="ts" name="Avatar">
import { useGlobalStore } from '@/store/modules/global'
import InfoDialog from './InfoDialog.vue'
import PasswordDialog from './PasswordDialog.vue'
import { useLocale } from '@/hooks/useLocale'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'

const { $t } = useLocale()
const globalStore = useGlobalStore()

const infoRef = ref<InstanceType<typeof InfoDialog> | null>(null)
const passwordRef = ref<InstanceType<typeof PasswordDialog> | null>(null)

const logout = () => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('message.logoutTitle'),
    content: $t('message.logoutMsg'),
    type: 'warning',
    size: 'small',
    center: 'center',
    confirm: globalStore.logOut
  })
}
</script>
<style scoped lang="less">
.avatar {
  cursor: pointer;
  display: flex;
  align-items: center;
  .text {
    color: var(--color-gray1);
    white-space: nowrap;
    margin-left: 0.8rem;
  }
  img {
    width: 2.2rem;
  }
}
.sign {
  cursor: pointer;
}
</style>
