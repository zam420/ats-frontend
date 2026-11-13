<template>
  <section class="applicant-information">
    <h1 v-if="showHeading">{{ $t('jobPosition.yourApplication') }}</h1>
    <div class="application-field">
      <label for="application-first-name">{{ $t('jobPosition.firstName') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-first-name" required aria-required="true" />
    </div>
    <div class="application-field">
      <label for="application-last-name">{{ $t('jobPosition.lastName') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-last-name" required aria-required="true" />
    </div>
    <div class="application-field">
      <label for="application-preferred-name">{{ $t('jobPosition.preferredName') }}</label>
      <el-input id="application-preferred-name" />
    </div>
    <div class="application-field">
      <label for="application-email">{{ $t('jobPosition.email') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-email" type="email" required aria-required="true" />
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
          <el-input id="application-phone" type="tel" required aria-required="true" />
        </div>
      </div>
    </div>
    <div class="application-field">
      <label for="application-current-location">{{ $t('jobPosition.currentLocation') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-input id="application-current-location" required aria-required="true" />
    </div>
    <div class="application-field">
      <label>{{ $t('jobPosition.resumeCv') }}<span class="required" aria-hidden="true"> *</span></label>
      <el-upload :auto-upload="false" :limit="1" accept=".pdf,.doc,.docx" required aria-required="true">
        <el-button>{{ $t('jobPosition.uploadResumeCv') }}</el-button>
      </el-upload>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ showHeading?: boolean }>(), { showHeading: true })

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
</style>
