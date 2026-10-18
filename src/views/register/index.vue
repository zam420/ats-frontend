<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h2 class="title">{{ $t('auth.registerTitle') }}</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
        <el-form-item :label="$t('auth.email')" prop="email">
          <el-input v-model="form.email" autocomplete="username" />
        </el-form-item>
        <el-form-item :label="$t('auth.password')" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item :label="$t('auth.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-button type="primary" class="full" :loading="loading" @click="submit">
          {{ $t('auth.register') }}
        </el-button>
      </el-form>
      <div class="link">
        {{ $t('auth.haveAccount') }}
        <router-link to="/login">{{ $t('auth.login') }}</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="register">
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { registerApi } from '@/api/modules/auth'
import { useGlobalStore } from '@/store/modules/global'

const { t } = useI18n()
const router = useRouter()
const globalStore = useGlobalStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ],
  password: [{ required: true, message: t('auth.passwordRequired'), trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: (e?: Error) => void) =>
        value === form.password ? callback() : callback(new Error(t('auth.passwordMismatch'))),
      trigger: 'blur'
    }
  ]
}))

const submit = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return
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
  .full {
    width: 100%;
  }
  .link {
    margin-top: 1rem;
    text-align: center;
  }
}
</style>
