<template>
  <div class="esp-form-wrap" v-click-outside="updateContent">
    <div v-if="props.readOnly" class="quill-editor-wrap readonly">
      <QuillEditor
        ref="quillEditorRef"
        theme=""
        :content="state.content"
        contentType="html"
        :toolbar="[]"
        :readOnly="true"
      />
    </div>
    <div class="el-form" v-else>
      <div class="el-form-item">
        <label class="el-form-item__label" v-if="!hideLabel"
          >{{ $t('emailTemplate.emailContent') }}<span class="red">*</span></label
        >
        <div class="quill-editor-wrap" :class="{ error: state.isError }">
          <QuillEditor
            ref="quillEditorRef"
            theme="snow"
            :content="state.content"
            contentType="html"
            :options="state.options"
            @update:content="validate"
            @blur="updateContent"
          />
          <div class="el-form-item__error" v-if="state.isError && state.content === ''">
            {{ $t('form.required') }}
          </div>
          <div
            v-click-outside="hideSelect"
            class="quill-editor-select-wrap"
            v-show="state.showSelect"
            :style="{
              left: state.left !== 'unset' ? `${state.left}px` : 'unset',
              top: `${state.top}px`
            }"
          >
            <ul>
              <template :key="item.value" v-for="item of selectOptions">
                <li
                  :class="{ active: item.value === state.curValue }"
                  @click.stop="selectValue(item)"
                >
                  {{ item.label }}
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="EspQuillEditor">
import { reactive, ref, onMounted, watch, nextTick } from 'vue'
import { QuillEditor, Quill } from '@vueup/vue-quill'
import { useLocale } from '@/hooks/useLocale'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import mittBus from '@/utils/mittBus'
import { OPEN_EMAIL_PREVIEW } from '@/config'
import { stringToBlob } from '@/utils'
const { $t } = useLocale()
const quillEditorRef = ref()
interface QuillEditorProps {
  content: string
  selectOptions: Form.FormSelect[]
  readOnly?: boolean
  hideLabel?: boolean
  updateCallback?: any
  canPreview?: boolean
  parseContent?: string
}

interface QuillEditorOption {
  placeholder: string // 默认显示文字
  theme: string // 主题
  modules: any
}

interface QuillEditorState {
  options: QuillEditorOption
  content: string
  curValue: string
  left: string | number
  top: string | number
  showSelect: boolean
  curDom: any
  isError: boolean
  optionIncludeKeys: number[]
  parseContent: string
}

const props = withDefaults(defineProps<QuillEditorProps>(), {
  content: '',
  parseContent: '',
  selectOptions: () => [],
  readOnly: false,
  canPreview: false
})

const state = reactive<QuillEditorState>({
  options: {
    placeholder: '', // 默认显示文字
    theme: 'snow', // 主题
    modules: {
      toolbar: {
        container: props.canPreview
          ? [
              [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
              ['bold', 'italic', 'underline', 'strike'], // toggled buttons
              [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
              [{ color: [] }, { background: [] }], // dropdown with defaults from theme
              ['code-block', 'link'],
              ['clean'], // remove formatting button
              ['select'],
              ['preview']
            ]
          : [
              [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
              ['bold', 'italic', 'underline', 'strike'], // toggled buttons
              [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
              [{ color: [] }, { background: [] }], // dropdown with defaults from theme
              ['code-block', 'link'],
              ['clean'], // remove formatting button
              ['select']
            ], // 自定义工具栏
        handlers: {
          select: () => {
            const quill = quillEditorRef.value.getQuill()
            const index = quill.getSelection(true)?.index
            try {
              quill.insertEmbed(
                index,
                'customHtml',
                { key: 'name', name: $t('emailTemplate.name') },
                Quill.sources.USER
              )
              quill.insertEmbed(index + 1, 'text', ' ')
            } catch (e) {
              console.log('ccc', e)
            }
            quill.setSelection(index + 2)
            setTimeout(() => {
              initSelectEvent()
            }, 200)
          },
          preview: async () => {
            if (props.updateCallback && !state.showSelect) {
              props.updateCallback(getContent())
            }
            nextTick(() => {
              const virtualElement = document.createElement('div')
              virtualElement.classList.add('ql-editor')
              virtualElement.innerHTML = state.parseContent
              const content = virtualElement?.outerHTML ?? ''
              const blob = stringToBlob(content)
              mittBus.emit(OPEN_EMAIL_PREVIEW, {
                blob,
                file_name: $t('scheduleInterview.emailPreview')
              })
            })
          }
        }
      }
    }
  },
  content: '',
  curValue: '',
  left: 0,
  top: 0,
  showSelect: false,
  curDom: {},
  isError: false,
  optionIncludeKeys: [],
  parseContent: ''
})

const initHtml = () => {
  quillEditorRef.value.setHTML(props.content)
  setTimeout(() => {
    initSelectEvent()
  }, 200)
}

const vClickOutside = {
  mounted(el: any, binding: any) {
    function eventHandler(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (
        el.contains(target) ||
        (target.getAttribute('contenteditable') === 'false' && target.nodeName === 'SPAN')
      ) {
        return false
      }

      if (binding.value && typeof binding.value === 'function') {
        binding.value(e)
      }
    }

    el.__click_outside__ = eventHandler
    document.addEventListener('click', eventHandler)
  },
  beforeUnmount(el: any) {
    document.removeEventListener('click', el.__click_outside__)
    delete el.__click_outside__
  }
}
// 更新content
const updateContent = () => {
  if (props.updateCallback && !state.showSelect) {
    props.updateCallback(getContent())
  }
}
watch(
  () => props.content,
  (val, oldVal) => {
    nextTick(() => {
      initHtml()
      // 第一次进来不要校验
      if (oldVal !== undefined) {
        validate()
      }
    })
  },
  { deep: true, immediate: true }
)

watch(
  () => props.parseContent,
  () => {
    state.parseContent = props.parseContent
  },
  { deep: true, immediate: true }
)

const setErrorKey = () => {
  const doms: any = document.querySelectorAll('.ql-esp-select')
  if (doms.length) {
    for (let i = 0; i < doms.length; i++) {
      doms[i].classList.remove('error')
      const key = doms[i].dataset.value
      if (!state.optionIncludeKeys.includes(key)) {
        doms[i].classList.add('error')
      }
    }
  }
}

watch(
  () => props.selectOptions,
  val => {
    if (val?.length) {
      state.optionIncludeKeys = val?.map(item => item.value)
    } else {
      state.optionIncludeKeys = []
    }
    setErrorKey()
  },
  { deep: true, immediate: true }
)

const initSelectEvent = () => {
  const doms: any = document.querySelectorAll('.ql-esp-select > span')
  if (doms.length) {
    for (let i = 0; i < doms.length; i++) {
      doms[i].onclick = (e: { target: { parentNode: any } }) => {
        const domUl: any = document.querySelector('.quill-editor-select-wrap')
        if (domUl) {
          domUl.style.right = 'unset'
          const domParent: any = document.querySelector('.ql-container .ql-editor')
          const scrollTop = domParent.scrollTop ?? 0
          const dom: any = e.target
          state.left = dom.offsetLeft
          state.top = dom.offsetTop + 40 - scrollTop
          const curParent = e.target.parentNode
          state.curValue = curParent.dataset.value
          state.curDom = curParent
          if (domParent.clientWidth - (state.left as number) < 120) {
            state.left = 'unset'
            domUl.style.right = 0
          }
          state.showSelect = true
        }
      }
    }
  }
  const domsReadOnly: any = document.querySelectorAll('.quill-editor-wrap.readonly .ql-esp-select[data-value="onlineInterviewLink"] > span')
  if (domsReadOnly.length) {
    for (let i = 0; i < domsReadOnly.length; i++) {
      domsReadOnly[i].onclick = (e: any) => {
        const url = e.target?.innerText ?? ''
        if (url?.startsWith('http')) {
          window.open(url, '_blank')
        }
      }
    }
  }
}

const selectValue = (item: Form.FormSelect) => {
  state.curDom.setAttribute('data-value', item.value)
  state.curDom.querySelector('span').innerText = item.label
  state.curDom.classList.remove('error')
  state.showSelect = false
  updateContent()
}

const initQuill = () => {
  const Base = Quill.import('blots/embed')
  class CustomBlot extends Base {
    static blotName: string
    static tagName: string
    static className: string
    static create(data: { key: any; name: any }) {
      const node = super.create()
      node.setAttribute('data-value', data.key)
      node.innerText = data.name
      return node
    }

    static formats() {
      return true
    }

    static value(node: { innerHTML: any }) {
      return {
        content: node.innerHTML
      }
    }
  }
  CustomBlot.blotName = 'customHtml'
  CustomBlot.tagName = 'span'
  CustomBlot.className = 'ql-esp-select'

  Quill.register({
    'formats/customHtml': CustomBlot
  })
}
const getContent = () => {
  let content = quillEditorRef.value?.getHTML() ?? ''
  if (
    content === '<p><br></p>' ||
    content === '<h1><br></h1>' ||
    content === '<h2><br></h2>' ||
    content === '<h3><br></h3>' ||
    content === '<h4><br></h4>' ||
    content === '<h5><br></h5>' ||
    content === '<h6><br></h6>'
  ) {
    content = ''
  }
  if (content) {
    const dom: any = new DOMParser().parseFromString(content, 'text/html')
    const doms = dom.querySelectorAll('.ql-esp-select') ?? []
    for (let i = 0; i < doms.length; i++) {
      const text = doms[i].querySelector('span')?.innerText
      doms[i].innerText = text
    }
    content = dom.querySelector('body')?.innerHTML
  }
  return content
}
const hideSelect = () => {
  state.showSelect = false
}
const validate = () => {
  state.isError = false
  if (!getContent()) {
    state.isError = true
  }
  return !state.isError
}

onMounted(() => {
  initQuill()
})

defineExpose({
  getContent,
  validate
})
</script>
<style lang="less" scoped>
@import 'index';
</style>
