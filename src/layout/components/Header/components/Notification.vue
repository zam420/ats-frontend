<template>
  <div class="message">
    <ElPopover
      popper-class="message-popper"
      placement="bottom-start"
      :width="POPOVER_DEFAULT_WIDTH"
      trigger="click"
    >
      <template #reference>
        <div>
          <ElBadge is-dot class="item" :class="messageList.length === 0 ? 'hidden' : ''">
            <img class="notification" src="@/assets/svgs/menu-notification.svg" />
          </ElBadge>
        </div>
      </template>
      <ElTabs v-model="activeName">
        <template :key="item.name" v-for="item of list">
          <ElTabPane :label="item.title" :name="item.name">
            <template v-if="item.list.length">
              <div class="message-list">
                <template :key="index" v-for="(message, index) of item.list">
                  <div class="message-item">
                    <div class="message-content">
                      <span class="message-title" :class="{ isLink: message.type === NotificationTypeEnum.RESUME_COMMENT }" @click="jump(message)">{{ message.message }}</span>
                      <span class="message-date">{{ message.create_time }}</span>
                    </div>
                    <div class="operation-icon disabled">
                      <el-popconfirm :title="$t('message.deleteQues')" :width="200" :teleported="false" @confirm="deleteData(message.id)">
                        <template #reference>
                          <i class="el-icon iconfont icon-unfit text-primary-gradient"></i>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <template v-else>
              <EspNoData :title="item.noData" />
            </template>
          </ElTabPane>
        </template>
      </ElTabs>
      <div @click="clear()" class="clear-btn">{{ $t('button.clearAll') }}</div>
    </ElPopover>
  </div>
</template>
<script setup lang="ts" name="Notification">
import { OPEN_DIALOG, POPOVER_DEFAULT_WIDTH } from '@/config'
import { useLocale } from '@/hooks/useLocale'
import { useGlobalStore } from '@/store/modules/global'
import { NotificationTypeEnum } from '@/enums/notificationTypeEnum'
import router from '@/router'
import { ROUTER_CV_MANAGEMENT_DETAIL } from '@/router/routerName'
import { clearAllNotification, deleteNotification } from '@/api/modules/common'
import mittBus from '@/utils/mittBus'
const activeName = ref<string>('first')
const globalStore = useGlobalStore()
const { $t } = useLocale()
interface MessageProps {
  id: number
  user_id: number
  message: string
  type: number
  create_time: string
  notify_time: string
  task: boolean
  extend_param?: any
  status?: number
}
interface MessageListProps {
  title: string
  name: string
  noData: string
  list: MessageProps[]
}
const messageList = ref<MessageProps[]>(globalStore.userInfo?.notifications ?? [])
console.log('globalStore.userInfo?.notifications: ', globalStore.userInfo?.notifications)
// const toDoList: MessageProps[] = globalStore.userInfo?.tasks ?? []
const list = ref<MessageListProps[]>([
  {
    title: $t('header.notification', { total: messageList.value.length }),
    name: 'first',
    noData: $t('message.noNotification'),
    list: messageList.value
  }
  // {
  //   title: $t('header.message', { total: 0 }),
  //   name: 'second',
  //   noData: $t('message.noMessage'),
  //   list: []
  // },
  // {
  //   title: $t('header.toDo', { total: toDoList.length }),
  //   name: 'second',
  //   noData: $t('message.nothingToDo'),
  //   list: toDoList
  // }
])

const jump = (message: MessageProps) => {
  if (message.type === NotificationTypeEnum.RESUME_COMMENT) {
    const { href } = router.resolve({
      path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/${message?.extend_param.candidate_resume_id}`
    })
    window.open(href, '_blank')
  }
}

// 清空
const clear = () => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('message.tips'),
    content: `${$t('message.ques')}${$t('button.clearAll')}?`,
    center: 'center',
    size: 'small',
    confirm: () => {
      clearAllNotification().then(res => {
        if (res?.success) {
          ElMessage.success($t('message.clearAllSuc'))
          refreshNotification()
        }
      })
    }
  })
}

// delete notification
const deleteData = (id: number) => {
  deleteNotification(id).then(res => {
    if (res?.success) {
      ElMessage.success($t('message.deleteSuc'))
      refreshNotification()
    }
  })
}

const refreshNotification = async () => {
  await globalStore.getUserInfo()
  messageList.value = globalStore.userInfo?.notifications ?? []
  list.value[0].list = messageList.value
  list.value[0].title = $t('header.notification', { total: messageList.value.length })
}
</script>
<style lang="less" scoped>
.notification {
  display: block;
  width: 1.7em;
  height: auto;
  cursor: pointer;
  filter: grayscale(1) brightness(0.45);
  font-family: var(--font-family-regular);
}
.message {
  .text {
    color: var(--color-gray1);
    white-space: nowrap;
    margin-left: 1rem;
  }
}
.clear-btn {
  position: absolute;
  right: 12px;
  top: 25px;
  font-size: var(--el-font-size-small);
  color: var(--el-color-primary);
  font-weight: bold;
  cursor: pointer;
}
.el-badge {
  &.hidden {
    :deep(.is-dot) {
      display: none;
    }
  }
}
.message-list {
  display: flex;
  flex-direction: column;
  max-height: 30rem;
  overflow-y: auto;
  .message-item {
    .fja(flex-start);
    padding: 1em 0;
    border-bottom: 1px solid var(--color-gray5);
    font-family: var(--font-family-light);
    &:last-child {
      border: none;
    }
    .message-icon {
      width: 30px;
      height: 30px;
      margin: 0 20px 0 5px;
    }
    .message-content {
      display: flex;
      flex-direction: column;
      .message-title {
        margin-bottom: 5px;
        &.isLink {
          color: var(--el-color-primary);
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
      .message-date {
        font-size: var(--el-font-size-extra-small);
        color: var(--el-text-color-secondary);
      }
    }
    .operation-icon {
      margin-left: 0.3rem;
      &.disabled {
        cursor: pointer !important;
      }
      .el-icon {
        height: 1.2em;
      }

      :deep(.el-popconfirm) {
        text-align: center;
        .el-popconfirm__action {
          display: inline-flex;
          button {
            min-width: 3rem !important;
            border: var(--el-border) !important;
            background: var(--el-button-bg-color);
            .el-button--primary {
              background: linear-gradient(180deg, var(--el-color-primary-light-2), var(--el-color-primary)) !important;
            }
          }
        }
      }
    }
    &:hover {
      i {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    }
  }
}
</style>
