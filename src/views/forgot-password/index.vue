<template>
  <AuthShell :title="$t('auth.forgotPasswordTitle')">
    <!-- Step 1: request a reset code -->
    <form v-if="step === 1" novalidate @submit.prevent="requestCode">
      <p class="rp-hint">{{ $t('auth.forgotPasswordHint') }}</p>
      <label class="rp-field" :class="{ 'is-invalid': errors.email }">
        <span class="rp-field__label">{{ $t('auth.email') }}</span>
        <input
          v-model="form.email"
          type="email"
          autocomplete="username"
          :placeholder="$t('auth.emailPlaceholder')"
        />
        <span v-if="errors.email" class="rp-field__error">{{ errors.email }}</span>
      </label>
      <button type="submit" class="rp-btn" :disabled="loading">{{ $t('auth.sendResetCode') }}</button>
    </form>

    <!-- Step 2: enter the code and a new password -->
    <form v-else novalidate @submit.prevent="reset">
      <p class="rp-hint">{{ $t('auth.resetCodeSent') }}</p>
      <label class="rp-field">
        <span class="rp-field__label">{{ $t('auth.email') }}</span>
        <input v-model="form.email" disabled />
      </label>
      <label class="rp-field" :class="{ 'is-invalid': errors.resetCode }">
        <span class="rp-field__label">{{ $t('auth.resetCode') }}</span>
        <input v-model="form.resetCode" autocomplete="one-time-code" />
        <span v-if="errors.resetCode" class="rp-field__error">{{ errors.resetCode }}</span>
      </label>
      <label class="rp-field" :class="{ 'is-invalid': errors.newPassword }">
        <span class="rp-field__label">{{ $t('auth.newPassword') }}</span>
        <input v-model="form.newPassword" type="password" autocomplete="new-password" />
        <span v-if="errors.newPassword" class="rp-field__error">{{ errors.newPassword }}</span>
      </label>
      <label class="rp-field" :class="{ 'is-invalid': errors.confirmPassword }">
        <span class="rp-field__label">{{ $t('auth.confirmPassword') }}</span>
        <input v-model="form.confirmPassword" type="password" autocomplete="new-password" />
        <span v-if="errors.confirmPassword" class="rp-field__error">{{ errors.confirmPassword }}</span>
      </label>
      <button type="submit" class="rp-btn" :disabled="loading">{{ $t('auth.resetPassword') }}</button>
      <div class="rp-center">
        <a class="rp-link" href="javascript:;" @click="step = 1">{{ $t('auth.resendCode') }}</a>
      </div>
    </form>

    <div class="rp-center">
      <router-link class="rp-link" to="/login">{{ $t('auth.backToLogin') }}</router-link>
    </div>
  </AuthShell>
</template>

<script setup lang="ts" name="forgotPassword">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { forgotPasswordApi, resetPasswordApi } from '@/api/modules/auth'
import AuthShell from '@/views/auth-shell/index.vue'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const step = ref(1)
const form = reactive({
  email: '',
  resetCode: '',
  newPassword: '',
  confirmPassword: ''
})
const errors = reactive({ email: '', resetCode: '', newPassword: '', confirmPassword: '' })

const validateEmail = () => {
  const email = form.email.trim()
  errors.email = !email
    ? t('auth.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? t('auth.emailInvalid')
      : ''
  return !errors.email
}

const validateReset = () => {
  errors.resetCode = form.resetCode.trim() ? '' : t('auth.resetCodeRequired')
  errors.newPassword = form.newPassword ? '' : t('auth.passwordRequired')
  errors.confirmPassword = !form.confirmPassword
    ? t('auth.passwordRequired')
    : form.confirmPassword !== form.newPassword
      ? t('auth.passwordMismatch')
      : ''
  return !errors.resetCode && !errors.newPassword && !errors.confirmPassword
}

const requestCode = async () => {
  if (!validateEmail()) return
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
  if (!validateReset()) return
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
