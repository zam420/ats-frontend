export enum UserRoleEnum {
  SA = 'sa',
  HRA = 'hra',
  REC = 'rec',
  HM = 'hm',
  ITV = 'itv',
  CDT = 'cdt'
}

export const UserRoleSource: Record<string, CommonEnum.enumItem> = {
  [UserRoleEnum.SA]: {
    value: UserRoleEnum.SA,
    name: 'System Admin'
  },
  [UserRoleEnum.HRA]: {
    value: UserRoleEnum.HRA,
    name: 'HR Admin'
  },
  [UserRoleEnum.REC]: {
    value: UserRoleEnum.REC,
    name: 'Recruiter'
  },
  [UserRoleEnum.HM]: {
    value: UserRoleEnum.HM,
    name: 'Hiring Manager'
  },
  [UserRoleEnum.ITV]: {
    value: UserRoleEnum.ITV,
    name: 'Interviewer'
  },
  [UserRoleEnum.CDT]: {
    value: UserRoleEnum.CDT,
    name: 'Candidate'
  }
}
