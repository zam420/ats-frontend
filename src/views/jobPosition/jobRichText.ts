import createDOMPurify from 'dompurify'

const purifier = createDOMPurify(window)
const quillClass = /^ql-(?:align-(?:center|right|justify)|indent-[1-8]|font-(?:serif|monospace)|size-(?:small|large|huge)|direction-rtl|syntax)$/
const color = /^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|rgb\(\s*(?:[0-9]{1,3}\s*,\s*){2}[0-9]{1,3}\s*\)|black|white|red|orange|yellow|green|blue|purple)$/i

purifier.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'class') {
    data.attrValue = data.attrValue.split(/\s+/).filter(name => quillClass.test(name)).join(' ')
    data.keepAttr = !!data.attrValue
  } else if (data.attrName === 'style') {
    data.attrValue = data.attrValue.split(';').flatMap(declaration => {
      const separator = declaration.indexOf(':')
      if (separator < 0) return []
      const property = declaration.slice(0, separator).trim().toLowerCase()
      const value = declaration.slice(separator + 1).trim()
      return (property === 'color' || property === 'background-color') && color.test(value)
        ? [`${property}: ${value}`]
        : []
    }).join('; ')
    data.keepAttr = !!data.attrValue
  } else if (data.attrName === 'href') {
    data.keepAttr = node.nodeName === 'A' && /^(?:https?:|mailto:)/i.test(data.attrValue)
  } else if (data.attrName === 'target') {
    data.keepAttr = node.nodeName === 'A' && data.attrValue === '_blank'
  } else if (data.attrName === 'data-checked') {
    data.keepAttr = node.nodeName === 'UL' && /^(?:true|false)$/.test(data.attrValue)
  }
})

purifier.addHook('afterSanitizeAttributes', node => {
  if (node.nodeName === 'A' && node.getAttribute('target') === '_blank') {
    if (node.hasAttribute('href')) node.setAttribute('rel', 'noopener noreferrer')
    else node.removeAttribute('target')
  }
})

export const jobRichTextToHtml = (text?: string | null): string => {
  if (!text) return ''
  const html = text.trim().startsWith('<')
    ? text
    : text.split(/\r?\n/).map(line => `<p>${line || '<br>'}</p>`).join('')
  return purifier.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ol', 'ul', 'li', 'a', 'span', 'sub', 'sup'],
    ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'data-checked'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false
  })
}
