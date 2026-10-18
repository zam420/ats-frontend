export enum ResumeSourceEnum {
  // 猎聘
  LIEPIN = 0,
  // Official
  OFFICIAL_WEBSITE = 1,
  // 51job
  JOB51 = 2,
  // 脉脉
  MAIMAI = 3,
  // BOSS
  BOSS = 4,
  // Linkedin
  LINKEDIN = 5,
  // 牛客网
  NOWCODER = 6,
  // 猎头推荐
  HEADHUNTER_REFERRAL = 7,
  // 内部员工推荐
  INTERNAL_EMPLOYEE_REFERRAL = 8,
  // 候选人推荐
  CANDIDATE_REFERRAL = 9,
  // 实习僧
  INTERNSHIP_MONK = 10,
  // Indeed
  INDEED = 11,
  // Naukri
  NAUKRI = 12,
  // Jobs.CZ
  JOBS_CZ = 13,
  // JazzHR
  JAZZHR = 14,
  // Monster
  MONSTER = 15,
  // Others
  OTHERS = 16
}

export const ResumeSource: Record<string, CommonEnum.enumItem> = {
  [ResumeSourceEnum.LIEPIN]: {
    value: ResumeSourceEnum.LIEPIN,
    name: '猎聘'
  },
  [ResumeSourceEnum.OFFICIAL_WEBSITE]: {
    value: ResumeSourceEnum.OFFICIAL_WEBSITE,
    name: 'Official Website'
  },
  [ResumeSourceEnum.JOB51]: {
    value: ResumeSourceEnum.JOB51,
    name: '51job'
  },
  [ResumeSourceEnum.MAIMAI]: {
    value: ResumeSourceEnum.MAIMAI,
    name: '脉脉'
  },
  [ResumeSourceEnum.BOSS]: {
    value: ResumeSourceEnum.BOSS,
    name: 'BOSS'
  },
  [ResumeSourceEnum.LINKEDIN]: {
    value: ResumeSourceEnum.LINKEDIN,
    name: 'Linkedin'
  },
  [ResumeSourceEnum.NOWCODER]: {
    value: ResumeSourceEnum.NOWCODER,
    name: '牛客网'
  },
  [ResumeSourceEnum.HEADHUNTER_REFERRAL]: {
    value: ResumeSourceEnum.HEADHUNTER_REFERRAL,
    name: '猎头推荐'
  },
  [ResumeSourceEnum.INTERNAL_EMPLOYEE_REFERRAL]: {
    value: ResumeSourceEnum.INTERNAL_EMPLOYEE_REFERRAL,
    name: '内部员工推荐'
  },
  [ResumeSourceEnum.CANDIDATE_REFERRAL]: {
    value: ResumeSourceEnum.CANDIDATE_REFERRAL,
    name: '候选人推荐'
  },
  [ResumeSourceEnum.INTERNSHIP_MONK]: {
    value: ResumeSourceEnum.INTERNSHIP_MONK,
    name: '实习僧'
  },
  [ResumeSourceEnum.INDEED]: {
    value: ResumeSourceEnum.INDEED,
    name: 'Indeed'
  },
  [ResumeSourceEnum.NAUKRI]: {
    value: ResumeSourceEnum.NAUKRI,
    name: 'Naukri'
  },
  [ResumeSourceEnum.JOBS_CZ]: {
    value: ResumeSourceEnum.JOBS_CZ,
    name: 'Jobs.CZ'
  },
  [ResumeSourceEnum.JAZZHR]: {
    value: ResumeSourceEnum.JAZZHR,
    name: 'JazzHR'
  },
  [ResumeSourceEnum.MONSTER]: {
    value: ResumeSourceEnum.MONSTER,
    name: 'Monster'
  },
  [ResumeSourceEnum.OTHERS]: {
    value: ResumeSourceEnum.OTHERS,
    name: 'Others'
  }
}
