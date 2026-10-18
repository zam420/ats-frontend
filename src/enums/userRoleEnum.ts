export enum UserRoleEnum {
  SA = 'sa',
  HRD = 'hrd',
  PROA = 'proa',
  HRR = 'hrr',
  HRRC = 'hrrc',
  HM = 'hm',
  ITV = 'itv',
  CDT = 'cdt'
}

export const UserRoleSource: Record<string, CommonEnum.enumItem> = {
  [UserRoleEnum.SA]: {
    value: UserRoleEnum.SA,
    name: 'System Admin'
  },
  [UserRoleEnum.HRD]: {
    value: UserRoleEnum.HRD,
    name: 'HR Directiors'
  },
  [UserRoleEnum.PROA]: {
    value: UserRoleEnum.PROA,
    name: 'Project Admins'
  },
  [UserRoleEnum.HRR]: {
    value: UserRoleEnum.HRR,
    name: 'HR Recruiters'
  },
  [UserRoleEnum.HRRC]: {
    value: UserRoleEnum.HRRC,
    name: 'HR Recruiter Coordinators'
  },
  [UserRoleEnum.HM]: {
    value: UserRoleEnum.HM,
    name: 'Hiring Managers'
  },
  [UserRoleEnum.ITV]: {
    value: UserRoleEnum.ITV,
    name: 'Interviewers'
  },
  [UserRoleEnum.CDT]: {
    value: UserRoleEnum.CDT,
    name: 'Candidates'
  }
}
