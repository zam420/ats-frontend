<template>
  <EspMain :title="$t('menu.tagManagement')">
    <template #right>
      <el-button class="btn-primary-gradient" @click="addTag">
        {{ $t('button.add') }}
      </el-button>
    </template>
    <div class="tag-panel" v-if="tagList.length > 0">
      <el-tag
        v-for="data in tagList"
        :key="data.tag_id"
        class="tag"
        :closable="true"
        @close="deleteTags(data.tag_id!)"
      >
        {{ data.name }}
      </el-tag>
    </div>
    <template v-else>
      <EspNoData :title="$t('table.noData')" />
    </template>
    <EspDialogForm ref="addTagRef" >
      <div class="tip">{{ $t('message.enterTip') }}</div>
    </EspDialogForm>
  </EspMain>
</template>
<script setup lang="ts" name="TagManagement">
import { ADD_TAG_FORM } from './data'
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash-es'
import { deleteTag, getTagList, saveTag } from '@/api/modules/tagManagement'
import Tag from '@/api/interface/tagManagement'
import { OPEN_DIALOG } from '@/config'
import mittBus from '@/utils/mittBus'
const { $t } = useLocale()
const tagList = ref<Tag.TagInfo[]>([])
const addTagRef = ref()
// 新增tag
const addTag = () => {
  addTagRef.value &&
    addTagRef.value.acceptParams({
      title: $t('tag.addTag'),
      isView: false,
      apiUrl: saveTag,
      formData: cloneDeep(ADD_TAG_FORM),
      size: 'small',
      getTableList: () => {
        refreshTag()
      }
    })
}

// 删除tag
const deleteTags = (id: number) => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('message.tips'),
    content: `${$t('message.ques')}${$t('opt.delete')}?`,
    center: 'center',
    size: 'small',
    confirm: () => {
      deleteTag([id]).then(res => {
        if (res?.success) {
          ElMessage.success($t('message.deleteSuc'))
          refreshTag()
        }
      })
    }
  })
}

// refresh tag
const refreshTag = () => {
  getTagList().then(res => {
    const list = res?.result ?? []
    tagList.value = [...list]
  })
}
onMounted(() => {
  refreshTag()
})
</script>
<style lang="less" scoped>
@import 'index.less';
</style>