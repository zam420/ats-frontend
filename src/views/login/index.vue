<template>
  <AuthShell :title="$t('auth.loginWelcome')" :subtitle="$t('auth.loginSubtitle')">
      <form @submit.prevent="submit">

        <label class="rp-field">
          <span class="rp-field__label">{{ $t('auth.email') }}</span>
          <input
            v-model="form.email"
            type="email"
            autocomplete="username"
            :placeholder="$t('auth.emailPlaceholder')"
          />
        </label>

        <label class="rp-field">
          <span class="rp-field__label">{{ $t('auth.password') }}</span>
          <span class="rp-field__password">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :placeholder="$t('auth.passwordPlaceholder')"
            />
            <button type="button" class="rp-field__eye" tabindex="-1" @click="showPassword = !showPassword">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
                <template v-if="showPassword">
                  <path
                    d="M1.7 10s2.9-5.8 8.3-5.8S18.3 10 18.3 10s-2.9 5.8-8.3 5.8S1.7 10 1.7 10Z"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linejoin="round"
                  />
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.4" />
                </template>
                <path
                  v-else
                  d="M2 8.5c1.6 2.6 4.6 4 8 4s6.4-1.4 8-4M5 12l-1.5 2M8.5 13.2 8 15.5M11.5 13.2l.5 2.3M15 12l1.5 2"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </span>
        </label>

        <div class="rp-login__row">
          <label class="rp-check">
            <input v-model="remember" type="checkbox" />
            <span class="rp-check__box">
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
                <path d="m2.5 6.2 2.3 2.3 4.7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            {{ $t('auth.rememberMe') }}
          </label>
          <router-link class="rp-link" :to="`/${ROUTER_FORGOT_PASSWORD}`">
            {{ $t('auth.forgotPasswordLink') }}
          </router-link>
        </div>

        <button type="submit" class="rp-btn" :disabled="!canSubmit || loading">
          {{ $t('auth.loginButton') }}
        </button>

        <div class="rp-login__or"><span>{{ $t('auth.or').toUpperCase() }}</span></div>

        <div class="rp-login__signup">
          {{ $t('auth.noAccount') }}
          <router-link class="rp-link" :to="`/${ROUTER_REGISTER}`">{{ $t('auth.signUpNow') }}</router-link>
        </div>
      </form>
  </AuthShell>
</template>

<script setup lang="ts" name="login">
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { loginApi } from '@/api/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import { ROUTER_FORGOT_PASSWORD, ROUTER_REGISTER } from '@/router/routerName'
import AuthShell from '@/views/auth-shell/index.vue'

const REMEMBER_KEY = 'rememberedEmail'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()

const loading = ref(false)
const showPassword = ref(false)
const rememberedEmail = localStorage.getItem(REMEMBER_KEY) ?? ''
const remember = ref(!!rememberedEmail)
const form = reactive({ email: rememberedEmail, password: '' })
const canSubmit = computed(() => !!form.email.trim() && !!form.password)

const submit = async () => {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  try {
    const email = form.email.trim()
    const res = await loginApi({ email, password: form.password })
    if (remember.value) {
      localStorage.setItem(REMEMBER_KEY, email)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    await globalStore.login(res)
    router.replace((route.query.redirect as string) || '/')
  } catch (e: any) {
    ElMessage.error(e?.message || t('auth.loginFailed'))
  } finally {
    loading.value = false
  }
}
</script>
