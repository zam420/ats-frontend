<template>
  <div class="rp-login">
    <div class="rp-login__left">
      <div class="rp-login__lang">
        <img :src="flagUsa" alt="" />
        <span>English</span>
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>

      <div class="rp-login__form">
        <div class="rp-login__brand">
          <img :src="logoMark" alt="Remote People" />
          <span>{{ $t('auth.brandAts') }}</span>
        </div>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="rp-login__subtitle">{{ subtitle }}</p>
        <slot />
      </div>
    </div>

    <div class="rp-login__right">
      <div class="rp-login__hero" aria-hidden="true">
        <div
          v-for="c in candidates"
          :key="c.name"
          class="rp-cand"
          :class="[`rp-cand--${c.state}`]"
        >
          <span class="rp-cand__avatar" :style="{ background: c.color }">{{ c.name.charAt(0) }}</span>
          <span>{{ c.name }}</span>
          <span v-if="c.state === 'active' || c.state === 'next'" class="rp-cand__arrow">→</span>
        </div>
      </div>
      <div class="rp-login__promo">
        <h3>{{ $t('auth.referTitle').toUpperCase() }}</h3>
        <p>
          {{ $t('auth.referBodyPre') }} <strong>{{ $t('auth.referBodyBrand') }}</strong>
          {{ $t('auth.referBodyPost') }}
        </p>
        <p class="rp-login__muted">{{ $t('auth.referSpread') }}</p>
        <a class="rp-btn rp-btn--solid" href="https://remotepeople.com" target="_blank" rel="noopener">
          {{ $t('auth.referButton') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AuthShell">
import logoMark from '@/assets/brand/rp-mark.svg'
import flagUsa from '@/assets/brand/flag-usa.svg'

defineProps<{ title: string; subtitle?: string }>()

// Decorative candidate pipeline shown on the right-hand panel
const candidates = [
  { name: 'Sameer Shah', color: '#6aad1e', state: 'faded' },
  { name: 'Emily Watson', color: '#fc9e62', state: 'idle' },
  { name: 'Lina Chen', color: '#ffffff', state: 'active' },
  { name: 'Darius Walker', color: '#70d4c9', state: 'idle' },
  { name: 'Olivia Smith', color: '#a3e059', state: 'next' },
  { name: 'Liang Chen', color: '#fc8d4a', state: 'idle' },
  { name: 'Rahul Verma', color: '#5c8d7b', state: 'faded' }
]
</script>

<style lang="less" src="./auth-shell.less"></style>
