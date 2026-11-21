import moment from 'moment'

export const applicationAgeDays = (createdAt: string, now: Date): number => {
  if (typeof createdAt !== 'string' || !createdAt.trim()) throw new Error('Missing application creation date')
  const applied = moment(createdAt, moment.ISO_8601, true)
  if (!applied.isValid()) throw new Error('Invalid application creation date')
  return moment(now).startOf('day').diff(applied.startOf('day'), 'days')
}
