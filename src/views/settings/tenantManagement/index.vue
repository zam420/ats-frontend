<template>
  <EspMain :title="$t('tenantManagement.title')">
    <template #right>
      <ElButton v-if="has(CLNC)" class="btn-primary-gradient" @click="openCreate">
        {{ $t('button.create') }}
      </ElButton>
    </template>
    <EspTable
      v-if="has(CLNS)" ref="table" :columns="columns" :is-set-col="false"
      :page-search="true" :request-api="requestList" :is-front-pagination="false" row-key="id"
    >
      <template #operation="{ row }">
        <template v-if="canEdit(row)">
          <el-tooltip :content="$t('opt.edit')" placement="top">
            <span class="operation-icon"><i class="iconfont icon-edit text-primary-gradient" @click="openEdit(row)" /></span>
          </el-tooltip>
          <el-tooltip :content="$t('opt.inActive')" placement="top">
            <span class="operation-icon"><i class="iconfont icon-inactive text-primary-gradient" @click="deactivate(row)" /></span>
          </el-tooltip>
        </template>
      </template>
    </EspTable>
    <el-alert v-else :title="$t('tenantManagement.noSearchPermission')" type="warning" :closable="false" />

    <el-dialog v-model="dialogVisible" :title="$t(form.id ? 'tenantManagement.edit' : 'tenantManagement.create')" width="520px" @closed="resetLogo">
      <el-form ref="formRef" :model="form" label-position="top" require-asterisk-position="right" @submit.prevent="save">
        <el-form-item :label="$t('tenantManagement.organizationName')" prop="name"
          :rules="[{ required: true, whitespace: true, message: $t('form.required'), trigger: 'blur' }]">
          <el-input v-model="form.name" maxlength="100" />
        </el-form-item>
        <el-form-item :label="$t('tenantManagement.description')">
          <el-input v-model="form.description" type="textarea" maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('tenantManagement.logo')">
          <div class="logo-field">
            <img v-if="previewUrl" class="logo-preview" :src="previewUrl" :alt="$t('tenantManagement.logo')" />
            <input type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" @change="selectLogo" />
            <div class="logo-hint">{{ $t('tenantManagement.logoHint') }}</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">{{ $t('button.cancel') }}</el-button>
        <el-button class="btn-primary-gradient" :loading="saving" :disabled="validatingLogo" @click="save">{{ $t('button.save') }}</el-button>
      </template>
    </el-dialog>
  </EspMain>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { getTenants, getTenant, getTenantLogo, saveTenant, deactivateTenant, type Tenant, type TenantRequest } from '@/api/modules/tenant'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useGlobalStore } from '@/store/modules/global'
import { useLocale } from '@/hooks/useLocale'

const { CLNC, CLNE, CLNS, CLNSA } = UserPermissionEnum
const { $t } = useLocale()
const store = useGlobalStore()
const has = (permission: UserPermissionEnum) => store.permissions.includes(permission)
const table = ref()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const saving = ref(false)
const validatingLogo = ref(false)
const form = reactive<TenantRequest>({ name: '', description: '' })
const logo = ref<File | null>(null)
const previewUrl = ref('')
let logoVersion = 0

const columns: Table.ColumnProps[] = [
  { columnType: TableColumnTypeEnum.OPERATION, label: $t('table.operate'), width: 100, fixed: TableColumnFixedEnum.LEFT, isShow: true },
  { prop: 'name', label: $t('tenantManagement.organizationName'), filter: false, sortable: false, minWidth: 180 },
  { prop: 'description', label: $t('tenantManagement.description'), filter: false, sortable: false, minWidth: 240 }
]
const requestList = (params: Record<string, unknown>) => getTenants({
  pageNum: params.page_num, pageSize: params.page_size
})
const canEdit = (row: Tenant) => has(CLNE) && (has(CLNSA) || row.owner_id === store.userInfo?.id)
const resetLogo = () => {
  logoVersion++
  validatingLogo.value = false
  logo.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}
const setPreview = (blob: Blob) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(blob)
}
const openCreate = () => {
  resetLogo()
  Object.assign(form, { id: undefined, name: '', description: '' })
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}
const openEdit = async (row: Tenant) => {
  const res = await getTenant(row.id)
  if (!res?.result) return
  resetLogo()
  Object.assign(form, { id: res.result.id, name: res.result.name, description: res.result.description ?? '' })
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
  if (res.result.has_logo) {
    const version = logoVersion
    try {
      const file = await getTenantLogo(row.id)
      if (!(file instanceof Blob) || !file.type.startsWith('image/')) throw new Error('Invalid logo response')
      if (version === logoVersion && dialogVisible.value) setPreview(file)
    } catch (error) {
      console.error('Failed to load tenant logo', error)
      ElMessage.error($t('tenantManagement.logoLoadError'))
    }
  }
}
const svgDimensions = async (file: File): Promise<[number, number]> => {
  const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml')
  const root = doc.documentElement
  if (root.localName !== 'svg' || root.namespaceURI !== 'http://www.w3.org/2000/svg' || doc.querySelector('parsererror')) throw new Error('Invalid SVG')
  const width = root.getAttribute('width')
  const height = root.getAttribute('height')
  if (width && height) {
    const length = /^(?:\d+(?:\.\d+)?|\.\d+)(?:px)?$/
    if (!length.test(width) || !length.test(height)) throw new Error('Invalid SVG dimensions')
    return [parseFloat(width), parseFloat(height)]
  }
  if (width || height) throw new Error('Missing SVG dimension')
  const viewBox = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/)
  if (viewBox.length !== 4) throw new Error('Missing SVG dimensions')
  if (![Number(viewBox[0]), Number(viewBox[1])].every(Number.isFinite)) throw new Error('Invalid SVG viewBox')
  return [Number(viewBox[2]), Number(viewBox[3])]
}
const rasterDimensions = (file: File): Promise<[number, number]> => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => { URL.revokeObjectURL(url); resolve([image.naturalWidth, image.naturalHeight]) }
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Invalid image')) }
  image.src = url
})
const selectLogo = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const version = ++logoVersion
  validatingLogo.value = true
  try {
    const extension = file.name.toLowerCase().split('.').pop()
    if (!['jpg', 'jpeg', 'png', 'svg'].includes(extension ?? '') || !file.size || file.size > 1024 * 1024) throw new Error('Invalid logo')
    const [width, height] = extension === 'svg' ? await svgDimensions(file) : await rasterDimensions(file)
    if (![width, height].every(value => Number.isFinite(value) && value > 0 && value <= 140)) throw new Error('Invalid dimensions')
    if (version !== logoVersion) return
    logo.value = file
    setPreview(file)
  } catch {
    if (version === logoVersion) ElMessage.error($t('tenantManagement.invalidLogo'))
  } finally {
    if (version === logoVersion) validatingLogo.value = false
  }
}
const save = async () => {
  if (saving.value || validatingLogo.value || !(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const res = await saveTenant({ ...form, name: form.name.trim() }, logo.value)
    if (res?.success) {
      ElMessage.success($t('tenantManagement.saved'))
      dialogVisible.value = false
      table.value?.refresh(null, true)
    }
  } finally {
    saving.value = false
  }
}
const deactivate = async (row: Tenant) => {
  try {
    await ElMessageBox.confirm($t('tenantManagement.deactivateConfirm'), $t('opt.inActive'), { type: 'warning' })
  } catch {
    return
  }
  const result = await deactivateTenant(row.id)
  if (result?.success) {
    ElMessage.success($t('tenantManagement.deactivated'))
    table.value?.refresh(null, true)
  }
}
onBeforeUnmount(resetLogo)
</script>

<style lang="less" scoped>
.logo-field { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.logo-preview { max-width: 140px; max-height: 140px; object-fit: contain; }
.logo-hint { color: var(--color-gray3); font-size: 12px; }
</style>
