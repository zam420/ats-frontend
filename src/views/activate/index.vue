<template>
  <AuthShell :title="$t('auth.activateTitle')">
    <form novalidate @submit.prevent="submit">
      <p class="rp-hint">{{ $t('auth.activateHint', { email: globalStore.email }) }}</p>
      <label class="rp-field" :class="{ 'is-invalid': error }">
        <span class="rp-field__label">{{ $t('auth.activationCode') }}</span>
        <input v-model="form.activationCode" autocomplete="one-time-code" />
        <span v-if="error" class="rp-field__error">{{ error }}</span>
      </label>
      <button type="submit" class="rp-btn" :disabled="loading">{{ $t('auth.activate') }}</button>
      <div class="rp-center">
        <a class="rp-link" href="javascript:;" @click="globalStore.logOut()">{{ $t('auth.logout') }}</a>
      </div>
    </form>
  </AuthShell>
</template>

<script setup lang="ts" name="activate">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { activateApi } from '@/api/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import AuthShell from '@/views/auth-shell/index.vue'

const { t } = useI18n()
const router = useRouter()
const globalStore = useGlobalStore()

const loading = ref(false)
const form = reactive({ activationCode: '' })
const error = ref('')

const submit = async () => {
  error.value = form.activationCode.trim() ? '' : t('auth.activationCodeRequired')
  if (error.value) return
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
