<template>
  <section class="applicant-information">
    <h1 v-if="showHeading" id="your-application-heading">{{ $t('jobPosition.yourApplication') }}</h1>
    <div class="application-field">
      <label for="application-first-name">{{ $t('jobPosition.firstName') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-first-name" v-model="form.firstName" maxlength="100" required aria-required="true" />
    </div>
    <div class="application-field">
      <label for="application-last-name">{{ $t('jobPosition.lastName') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-last-name" v-model="form.lastName" maxlength="100" required aria-required="true" />
    </div>
    <div class="application-field">
      <label for="application-preferred-name">{{ $t('jobPosition.preferredName') }}</label>
      <el-input id="application-preferred-name" v-model="form.preferredName" maxlength="100" />
    </div>
    <div class="application-field">
      <label for="application-email">{{ $t('jobPosition.email') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-email" v-model="form.email" maxlength="254" type="email" required aria-required="true" />
    </div>
    <div class="application-field">
      <div class="phone-fields">
        <div class="country-field">
          <label for="application-country">{{ $t('jobPosition.country') }}<span class="required" aria-hidden="true"> *</span></label>
          <el-select id="application-country" v-model="selectedCountryCode" required aria-required="true">
            <el-option v-for="country in countries" :key="country.code" :value="country.code" :label="`${country.flag} ${country.dialCode}`">
              <span class="country-option">{{ country.flag }} {{ country.name }} ({{ country.dialCode }})</span>
            </el-option>
          </el-select>
        </div>
        <div class="phone-number-field">
          <label for="application-phone">{{ $t('jobPosition.phoneNumber') }}<span class="required" aria-hidden="true"> *</span></label>
          <el-input id="application-phone" v-model="form.phoneNumber" maxlength="40" type="tel" required aria-required="true" />
        </div>
      </div>
    </div>
    <div class="application-field">
      <label for="application-current-location">{{ $t('jobPosition.currentLocation') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-current-location" v-model="form.currentLocation" maxlength="200" required aria-required="true" />
    </div>
    <div class="application-field">
      <label>{{ $t('jobPosition.resumeCv') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-upload ref="resumeUpload" :auto-upload="false" :limit="1" :disabled="!!resume" accept=".pdf,.doc,.docx" :on-change="onResumeChange" :on-remove="onResumeRemove" required aria-required="true">
        <el-button :disabled="!!resume">{{ $t('jobPosition.uploadResumeCv') }}</el-button>
        <template #tip>
          <div class="el-upload__tip">{{ $t('jobPosition.resumeUploadHint') }}</div>
        </template>
        <template #file="{ file }">
          <div class="resume-file">
            <span class="resume-file-name" :title="file.name">{{ file.name }}</span>
            <button type="button" class="remove-resume" :aria-label="$t('button.delete') + ' ' + $t('jobPosition.resumeCv')" @click="resumeUpload?.handleRemove(file)">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </template>
      </el-upload>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UploadFile, UploadInstance } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useLocale } from '@/hooks/useLocale'
withDefaults(defineProps<{ showHeading?: boolean }>(), { showHeading: true })
const { $t } = useLocale()
const form = reactive({ firstName: '', lastName: '', preferredName: '', email: '', phoneNumber: '', currentLocation: '' })
const resumeUpload = ref<UploadInstance>()
const resume = ref<File>()
const onResumeChange = (file: UploadFile) => { resume.value = file.raw }
const onResumeRemove = () => { resume.value = undefined }

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' }
]
const selectedCountryCode = ref('US')
const getApplication = () => {
  const country = countries.find(item => item.code === selectedCountryCode.value)
  if (!form.firstName.trim() || !form.lastName.trim() || !form.phoneNumber.trim() ||
      !form.currentLocation.trim() || !country || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    ElMessage.error($t('jobPosition.applicationFieldsRequired'))
    return null
  }
  if (!resume.value || resume.value.size === 0 || resume.value.size > 5 * 1024 * 1024 ||
      !/\.(pdf|doc|docx)$/i.test(resume.value.name)) {
    ElMessage.error($t('jobPosition.applicationResumeInvalid'))
    return null
  }
  return {
    first_name: form.firstName.trim(), last_name: form.lastName.trim(), preferred_name: form.preferredName.trim(),
    email: form.email.trim(), country_code: country.dialCode, phone_number: form.phoneNumber.trim(),
    current_location: form.currentLocation.trim(), resume: resume.value
  }
}
defineExpose({ getApplication })
</script>

<style lang="less" scoped>
.applicant-information { margin-top: 28px; }
.applicant-information h1 { font-size: 24px; font-weight: 600; }
.application-field { max-width: 480px; margin-top: 20px; }
.application-field > label { display: block; font-weight: 600; margin-bottom: 8px; }
.required { color: var(--el-color-danger); }
.phone-fields { display: flex; align-items: flex-end; gap: 12px; }
.country-field { width: 170px; flex: 0 0 170px; }
.phone-number-field { min-width: 0; flex: 1; }
.country-field > label, .phone-number-field > label { display: block; font-weight: 600; margin-bottom: 8px; }
.country-option { white-space: nowrap; }
.resume-file { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; }
.resume-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.remove-resume { display: inline-flex; align-items: center; padding: 0; border: 0; background: none; color: var(--el-text-color-regular); cursor: pointer; }
</style>
