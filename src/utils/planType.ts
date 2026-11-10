interface PlanVisibility {
  is_public?: boolean | null
  is_shared_within_tenant?: boolean | null
  is_system_template?: boolean | null
}

export const planTypeMessageKey = (plan: PlanVisibility) => {
  if (plan.is_public) return 'interviewProcess.typeSharedEveryone'
  if (plan.is_shared_within_tenant) return 'interviewProcess.typeSharedUsers'
  if (plan.is_system_template) return 'interviewProcess.typeSystemTemplate'
  return 'interviewProcess.typePrivate'
}
