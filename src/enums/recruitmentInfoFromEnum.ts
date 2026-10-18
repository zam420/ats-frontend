export enum RecruitmentInfoFromEnum {
  // 乐鑫官方招聘微信号
  ESPRESSIF_WECHAT_OFFICIAL = 0,
  // 乐鑫官网
  ESPRESSIF_OFFICIAL_WEBSITE = 1,
  // 同学 / 朋友 / 学长学姐推荐
  REFERRAL_BY_PEERS = 2,
  // 老师推荐
  REFERRAL_BY_TEACHER = 3,
  // 学校就业资讯
  SCHOOL_JOB_INFORMATION = 4,
  // 前程无忧
  JOB51 = 5,
  // 应届生BBS
  CAMPUS_BBS = 6,
  // 实习僧
  INTERNSHIP_MONK = 7,
  // 香樟校招
  ZHANGZONG_CAMPUS_RECRUITMENT = 8,
  // offer先生
  OFFER_GENTLEMAN = 9,
  // 其他
  OTHER = 10,
  // 知乎官方账号
  ZHIHU_OFFICIAL_ACCOUNT = 11,
  // 校招薪水
  CAMPUS_RECRUITMENT_SALARY = 12,
  // 牛客网
  NOWCODER = 13,
  // 一亩三分地
  LEETCODE = 14,
  // 领英
  LINKEDIN = 15,
  // B站官方账号
  BILIBILI_OFFICIAL_ACCOUNT = 16,
  // 猎聘
  LIEPIN = 17,
  // BOSS直聘
  BOSS = 18
}

export const RecruitmentInfoFrom: Record<string, CommonEnum.enumItem> = {
  [RecruitmentInfoFromEnum.ESPRESSIF_WECHAT_OFFICIAL]: {
    value: RecruitmentInfoFromEnum.ESPRESSIF_WECHAT_OFFICIAL,
    name: '乐鑫官方招聘微信号'
  },
  [RecruitmentInfoFromEnum.ESPRESSIF_OFFICIAL_WEBSITE]: {
    value: RecruitmentInfoFromEnum.ESPRESSIF_OFFICIAL_WEBSITE,
    name: 'Official Website'
  },
  [RecruitmentInfoFromEnum.REFERRAL_BY_PEERS]: {
    value: RecruitmentInfoFromEnum.REFERRAL_BY_PEERS,
    name: '候选人推荐'
  },
  [RecruitmentInfoFromEnum.REFERRAL_BY_TEACHER]: {
    value: RecruitmentInfoFromEnum.REFERRAL_BY_TEACHER,
    name: '老师推荐'
  },
  [RecruitmentInfoFromEnum.SCHOOL_JOB_INFORMATION]: {
    value: RecruitmentInfoFromEnum.SCHOOL_JOB_INFORMATION,
    name: '学校就业资讯'
  },
  [RecruitmentInfoFromEnum.JOB51]: {
    value: RecruitmentInfoFromEnum.JOB51,
    name: '51job'
  },
  [RecruitmentInfoFromEnum.CAMPUS_BBS]: {
    value: RecruitmentInfoFromEnum.CAMPUS_BBS,
    name: '应届生 BBS'
  },
  [RecruitmentInfoFromEnum.INTERNSHIP_MONK]: {
    value: RecruitmentInfoFromEnum.INTERNSHIP_MONK,
    name: '实习僧'
  },
  [RecruitmentInfoFromEnum.ZHANGZONG_CAMPUS_RECRUITMENT]: {
    value: RecruitmentInfoFromEnum.ZHANGZONG_CAMPUS_RECRUITMENT,
    name: '香樟校招'
  },
  [RecruitmentInfoFromEnum.OFFER_GENTLEMAN]: {
    value: RecruitmentInfoFromEnum.OFFER_GENTLEMAN,
    name: 'Offer 先生'
  },
  [RecruitmentInfoFromEnum.OTHER]: {
    value: RecruitmentInfoFromEnum.OTHER,
    name: 'Other'
  },
  [RecruitmentInfoFromEnum.ZHIHU_OFFICIAL_ACCOUNT]: {
    value: RecruitmentInfoFromEnum.ZHIHU_OFFICIAL_ACCOUNT,
    name: '知乎官方账号'
  },
  [RecruitmentInfoFromEnum.CAMPUS_RECRUITMENT_SALARY]: {
    value: RecruitmentInfoFromEnum.CAMPUS_RECRUITMENT_SALARY,
    name: '校招薪水'
  },
  [RecruitmentInfoFromEnum.NOWCODER]: {
    value: RecruitmentInfoFromEnum.NOWCODER,
    name: '牛客网'
  },
  [RecruitmentInfoFromEnum.LEETCODE]: {
    value: RecruitmentInfoFromEnum.LEETCODE,
    name: '一亩三分地'
  },
  [RecruitmentInfoFromEnum.LINKEDIN]: {
    value: RecruitmentInfoFromEnum.LINKEDIN,
    name: '领英'
  },
  [RecruitmentInfoFromEnum.BILIBILI_OFFICIAL_ACCOUNT]: {
    value: RecruitmentInfoFromEnum.BILIBILI_OFFICIAL_ACCOUNT,
    name: 'B 站官方账号'
  },
  [RecruitmentInfoFromEnum.LIEPIN]: {
    value: RecruitmentInfoFromEnum.LIEPIN,
    name: '猎聘'
  },
  [RecruitmentInfoFromEnum.BOSS]: {
    value: RecruitmentInfoFromEnum.BOSS,
    name: 'BOSS 直聘'
  }
}
