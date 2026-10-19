<template>
  <AuthShell :title="$t('auth.registerTitle')">
    <form novalidate @submit.prevent="submit">
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
      <label class="rp-field" :class="{ 'is-invalid': errors.password }">
        <span class="rp-field__label">{{ $t('auth.password') }}</span>
        <input
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          :placeholder="$t('auth.passwordPlaceholder')"
        />
        <span v-if="errors.password" class="rp-field__error">{{ errors.password }}</span>
      </label>
      <label class="rp-field" :class="{ 'is-invalid': errors.confirmPassword }">
        <span class="rp-field__label">{{ $t('auth.confirmPassword') }}</span>
        <input v-model="form.confirmPassword" type="password" autocomplete="new-password" />
        <span v-if="errors.confirmPassword" class="rp-field__error">{{ errors.confirmPassword }}</span>
      </label>
      <button type="submit" class="rp-btn" :disabled="loading">{{ $t('auth.register') }}</button>
      <div class="rp-center">
        {{ $t('auth.haveAccount') }}
        <router-link class="rp-link" to="/login">{{ $t('auth.login') }}</router-link>
      </div>
    </form>
  </AuthShell>
</template>

<script setup lang="ts" name="register">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { registerApi } from '@/api/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import AuthShell from '@/views/auth-shell/index.vue'

const { t } = useI18n()
const router = useRouter()
const globalStore = useGlobalStore()

const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})
const errors = reactive({ email: '', password: '', confirmPassword: '' })

const validate = () => {
  const email = form.email.trim()
  errors.email = !email
    ? t('auth.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? t('auth.emailInvalid')
      : ''
  errors.password = form.password ? '' : t('auth.passwordRequired')
  errors.confirmPassword = !form.confirmPassword
    ? t('auth.passwordRequired')
    : form.confirmPassword !== form.password
      ? t('auth.passwordMismatch')
      : ''
  return !errors.email && !errors.password && !errors.confirmPassword
}

const submit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const email = form.email.trim()
    // The email doubles as the user name; login accepts either
    const res = await registerApi({
      userName: email,
      email,
      password: form.password
    })
    await globalStore.login(res)
    router.replace('/')
  } catch (e: any) {
    ElMessage.error(e?.message || t('auth.registerFailed'))
  } finally {
    loading.value = false
  }
}
</script>
