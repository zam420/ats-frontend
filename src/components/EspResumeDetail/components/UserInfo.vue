<template>
  <div class="esp-detail-wrap">
    <div class="user-header-wrap" v-if="userInfo">
      <div class="left">
        <div class="user-header-icon">
          <img src="@/assets/imgs/user1.png" />
        </div>
        <div class="user-header-content">
          <h3>
            {{ userInfo?.name }}
            <i
              class="gender iconfont"
              :class="userInfo?.gender === 0 ? 'icon-male' : 'icon-female'"
            ></i>
            <p class="user-status pdf-not-show" v-if="userInfo.status">
              <template v-if="userInfo.status_comment">
                <el-tooltip :content="`${$t('cv.notes')}: ${userInfo.status_comment}`" placement="top-start">
                  <EspStatus :type="userInfo.status_type" class="pdf-not-show">
                    {{ userInfo.status }}
                  </EspStatus>
                </el-tooltip>
              </template>
              <EspStatus :type="userInfo.status_type" class="pdf-not-show" v-else>
                {{ userInfo.status }}
              </EspStatus>
            </p>
            <p class="pdf-not-show" v-show="!hideDuplication">
              <template v-if="duplications?.length">
                <div class="check-btn-wrap pdf-not-show" @click="startDuplication">
                  <span>
                    <img src="@/assets/imgs/warning.png" />
                    {{
                      $t('button.FindDuplicateApplication', {
                        count: duplications?.length
                      })
                    }}
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="check-btn-wrap pdf-not-show">
                  <span class="no">{{ $t('message.noDuplicateApplication') }}</span>
                </div>
              </template>
            </p>
          </h3>
          <div class="user-header-item-wrap">
            <div class="user-header-item" v-show="userInfo?.applying_position_title">
              <p class="desc">
                {{ $t('cv.positionApplied') }}: {{ userInfo?.applying_position_title }}
              </p>
              <p class="desc">{{ $t('cv.appliedAt') }}: {{ userInfo?.applied_at }}</p>
              <p class="desc" v-if="userInfo?.pooled_at">
                {{ $t('tp.pooledAt') }}: {{ userInfo?.pooled_at }}
              </p>
            </div>
            <div class="user-header-item">
              <template :key="index" v-for="(item, index) in userInfo?.list">
                <span class="line" v-if="item">{{ item }}</span>
              </template>
            </div>
            <div class="user-header-tags">
              <el-tag
                class="applied-times pdf-not-show"
                v-if="userInfo?.resume_count && userInfo?.resume_count > 1"
              >
                {{ $t('table.appliedTimes', { number: userInfo?.resume_count }) }}
              </el-tag>
              <div class="tag-item" v-for="info in userInfo?.tags ?? []" :key="info.tag_id" :class="info.match_type === TagMatchEnum.PARTIAL_MATCH ? 'tag-gray' : ''">
                <div class="tag-text">{{ info.tag_name }}</div>
                <div class="tag-num">{{ info.match_count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right pdf-not-show">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="EspResumeDetailUserInfo">
import { DetailUserInfo } from '@/api/interface'
import CV from '@/api/interface/cv'
import { TagMatchEnum } from '@/enums/tagMatchEnum'
interface ParamsProps {
  userInfo?: DetailUserInfo
  duplications: CV.DuplicationInfo[]
  hideDuplication?: boolean
  checkDup: () => void
}
const props = defineProps<ParamsProps>()

const startDuplication = () => {
  props.checkDup && props.checkDup()
}
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
