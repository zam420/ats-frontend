<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="title">{{ $t('auth.loginTitle') }}</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
        <el-form-item :label="$t('auth.email')" prop="email">
          <el-input v-model="form.email" autocomplete="username" />
        </el-form-item>
        <el-form-item :label="$t('auth.password')" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <div class="forgot">
          <router-link :to="`/${ROUTER_FORGOT_PASSWORD}`">{{ $t('auth.forgotPassword') }}</router-link>
        </div>
        <el-button type="primary" class="full" :loading="loading" @click="submit">
          {{ $t('auth.login') }}
        </el-button>
      </el-form>
      <el-divider>{{ $t('auth.or') }}</el-divider>
      <!-- Google login is not implemented yet -->
      <el-button class="full" @click="onGoogleLogin">{{ $t('auth.googleLogin') }}</el-button>
      <div class="link">
        {{ $t('auth.noAccount') }}
        <router-link :to="`/${ROUTER_REGISTER}`">{{ $t('auth.register') }}</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="login">
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { loginApi } from '@/api/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import { ROUTER_FORGOT_PASSWORD, ROUTER_REGISTER } from '@/router/routerName'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ email: '', password: '' })
const rules = computed<FormRules>(() => ({
  email: [{ required: true, message: t('auth.emailRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('auth.passwordRequired'), trigger: 'blur' }]
}))

const submit = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    const res = await loginApi({ email: form.email.trim(), password: form.password })
    await globalStore.login(res)
    router.replace((route.query.redirect as string) || '/')
  } catch (e: any) {
    ElMessage.error(e?.message || t('auth.loginFailed'))
  } finally {
    loading.value = false
  }
}

const onGoogleLogin = () => {
  ElMessage.info(t('auth.googleNotAvailable'))
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
  width: 400px;
  .title {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  .full {
    width: 100%;
  }
  .link {
    margin-top: 1rem;
    text-align: center;
  }
  .forgot {
    text-align: right;
    margin: -0.5rem 0 1rem;
  }
}
</style>
