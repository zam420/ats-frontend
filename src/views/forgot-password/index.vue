<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="title">{{ $t('auth.forgotPasswordTitle') }}</h2>

      <!-- Step 1: request a reset code -->
      <el-form
        v-if="step === 1"
        ref="requestFormRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="requestCode"
      >
        <p class="hint">{{ $t('auth.forgotPasswordHint') }}</p>
        <el-form-item :label="$t('auth.email')" prop="email">
          <el-input v-model="form.email" autocomplete="username" />
        </el-form-item>
        <el-button type="primary" class="full" :loading="loading" @click="requestCode">
          {{ $t('auth.sendResetCode') }}
        </el-button>
      </el-form>

      <!-- Step 2: enter the code and a new password -->
      <el-form
        v-else
        ref="resetFormRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="reset"
      >
        <p class="hint">{{ $t('auth.resetCodeSent') }}</p>
        <el-form-item :label="$t('auth.email')" prop="email">
          <el-input v-model="form.email" disabled />
        </el-form-item>
        <el-form-item :label="$t('auth.resetCode')" prop="resetCode">
          <el-input v-model="form.resetCode" autocomplete="one-time-code" />
        </el-form-item>
        <el-form-item :label="$t('auth.newPassword')" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item :label="$t('auth.confirmPassword')" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-button type="primary" class="full" :loading="loading" @click="reset">
          {{ $t('auth.resetPassword') }}
        </el-button>
        <div class="link">
          <a href="javascript:;" @click="step = 1">{{ $t('auth.resendCode') }}</a>
        </div>
      </el-form>

      <div class="link">
        <router-link to="/login">{{ $t('auth.backToLogin') }}</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="forgotPassword">
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { forgotPasswordApi, resetPasswordApi } from '@/api/modules/auth'

const { t } = useI18n()
const router = useRouter()

const requestFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()
const loading = ref(false)
const step = ref(1)
const form = reactive({
  email: '',
  resetCode: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ],
  resetCode: [{ required: true, message: t('auth.resetCodeRequired'), trigger: 'blur' }],
  newPassword: [{ required: true, message: t('auth.passwordRequired'), trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: (e?: Error) => void) =>
        value === form.newPassword ? callback() : callback(new Error(t('auth.passwordMismatch'))),
      trigger: 'blur'
    }
  ]
}))

const requestCode = async () => {
  if (!(await requestFormRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    await forgotPasswordApi(form.email.trim())
    step.value = 2
    ElMessage.success(t('auth.resetCodeSent'))
  } catch (e: any) {
    ElMessage.error(e?.message || t('auth.resetPasswordFailed'))
  } finally {
    loading.value = false
  }
}

const reset = async () => {
  if (!(await resetFormRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    await resetPasswordApi({
      email: form.email.trim(),
      resetCode: form.resetCode.trim(),
      newPassword: form.newPassword
    })
    ElMessage.success(t('auth.resetPasswordSuccess'))
    router.replace('/login')
  } catch (e: any) {
    ElMessage.error(e?.message || t('auth.resetPasswordFailed'))
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
