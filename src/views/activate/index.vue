<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="title">{{ $t('auth.activateTitle') }}</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
        <p class="hint">{{ $t('auth.activateHint', { email: globalStore.email }) }}</p>
        <el-form-item :label="$t('auth.activationCode')" prop="activationCode">
          <el-input v-model="form.activationCode" autocomplete="one-time-code" />
        </el-form-item>
        <el-button type="primary" class="full" :loading="loading" @click="submit">
          {{ $t('auth.activate') }}
        </el-button>
      </el-form>
      <div class="link">
        <a href="javascript:;" @click="globalStore.logOut()">{{ $t('auth.logout') }}</a>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="activate">
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { activateApi } from '@/api/modules/auth'
import { useGlobalStore } from '@/store/modules/global'

const { t } = useI18n()
const router = useRouter()
const globalStore = useGlobalStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ activationCode: '' })
const rules = computed<FormRules>(() => ({
  activationCode: [{ required: true, message: t('auth.activationCodeRequired'), trigger: 'blur' }]
}))

const submit = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    await activateApi(globalStore.email, form.activationCode.trim())
    await globalStore.onActivated()
    ElMessage.success(t('auth.activateSuccess'))
    router.replace('/')
  } catch (e: any) {
    ElMessage.error(e?.message || t('auth.activateFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.auth-card {
  width: 420px;
  .title {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  .hint {
    margin-bottom: 1rem;
    color: #606266;
  }
  .full {
    width: 100%;
  }
  .link {
    margin-top: 1rem;
    text-align: center;
  }
}
</style>
