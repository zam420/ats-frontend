import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()
// add tag form
export const ADD_TAG_FORM: Form.FormItem[] = [
  {
    label: $t('tag.tagName'),
    prop: 'tag_names',
    type: FormItemTypeEnum.TAG,
    required: true,
    col: 24
  }
]