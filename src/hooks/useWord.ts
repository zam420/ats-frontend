import JSZip from 'jszip'

export const useWord = () => {
  const convertToHtml = async (blob: Blob) => {
    const zip = await JSZip.loadAsync(blob)
    console.log('zip', zip)
    const parser = new DOMParser()
    const relationshipsContent = await zip?.file('word/_rels/document.xml.rels')?.async('string')
    const relationshipDoc = parser.parseFromString(relationshipsContent!, 'application/xml')
    const relationships = relationshipDoc.getElementsByTagName('Relationship')
    const linkObj: Record<string, string> = {}
    for (let i = 0; i < relationships.length; i++) {
      const relationship = relationships[i] as HTMLElement
      const id: string = relationship.getAttribute('Id') ?? ''
      const link: string = relationship.getAttribute('Target') ?? ''
      if (id) {
        linkObj[id] = link
      }
    }
    // 提取图片数据并将其转换为 Base64 数据 URL
    const imgPromises: any = []
    zip?.forEach(function (relativePath, file) {
        if (relativePath.startsWith('word/media/')) {
            imgPromises.push(file.async('base64').then((base64) => {
                const dataUrl = `data:image/${relativePath.split('.').pop()};base64,${base64}`;
                const id = Object.keys(linkObj).find(key => `word/${linkObj[key]}` === relativePath);
                if (id) {
                    linkObj[id] = dataUrl;
                }
            }));
        }
    });
    await Promise.all(imgPromises)
    const docxContent = await zip?.file('word/document.xml')?.async('string')
    const xmlDoc = parser.parseFromString(docxContent!, 'application/xml')
    console.log('xmlDoc', xmlDoc)
    const paragraphs = xmlDoc.getElementsByTagName('w:body')?.[0]?.childNodes
    // const html = ['<div style="font-family: SimSun;width: 800px;max-width: 800px">']
    const html = ['<div class="word-content-wrap" style="font-family: PingFangSC-light;">']
    for (let i = 0; i < paragraphs.length; i++) {
      const dom = paragraphs[i] as HTMLElement
      if (dom.nodeName === 'w:p') {
        const p = getXMlP(dom, linkObj)
        if (p) {
          html.push(p)
        }
      } else if (dom.nodeName === 'w:tbl') {
        const table = getXMLTable(dom, linkObj)
        if (table) {
          html.push(table.join(''))
        }
      }
    }
    html.push('</div>')
    return html.join('')
  }

  const getXMlP = (dom: HTMLElement, linkObj: Record<string, any>) => {
    const paraContent = []
    if (dom.nodeName === 'w:p') {
      const nodes = dom.childNodes
      const style = getXmlStyle(dom)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i] as HTMLElement
        if (node.nodeName === 'w:r' || node.nodeName === 'w:hyperlink') {
          const draw = node.getElementsByTagName('w:drawing')?.[0] as HTMLElement
          if (draw) {
            const extent = draw.getElementsByTagName('wp:extent')?.[0]
            const img = draw.getElementsByTagName('a:blip')?.[0]
            if (img) {
              let width = (extent.getAttribute('cx') ?? 0) as number
              let height = (extent.getAttribute('cy') ?? 0) as number
              if (width) {
                width = (width / 9525) * 0.75
              }
              if (height) {
                height = (height / 9525) * 0.75
              }
              const id = img.getAttribute('r:embed') ?? ''
              paraContent.push(
                `<img src='${linkObj?.[id]}' width='${width || 64}' height='${height || 78}' />`
              )
            }
          }
          const textNodes = node.getElementsByTagName('w:t')
          if (textNodes.length) {
            for (let j = 0; j < textNodes.length; j++) {
              const textNode = textNodes[j]
              if (textNode.textContent) {
                paraContent.push(textNode.textContent)
              }
            }
          }
        }
      }
      return `<p style="${style}"><span>${paraContent.join('')}</span></p>`
    }
  }

  const getXMLTable = (dom: HTMLElement, linkObj: Record<string, any>) => {
    let table: string[] = []
    if (dom.nodeName === 'w:tbl') {
      const trNodes = dom.childNodes
      const tableStyle: string[] = []
      for (let j = 0; j < trNodes.length; j++) {
        const trNode = trNodes[j] as HTMLElement
        if (trNode.nodeName === 'w:tblPr') {
          const tblW = dom?.getElementsByTagName('w:tblW')?.[0]
          if (trNode && tblW && tblW.getAttribute) {
            let tableWidth: number | string = '100%'
            const width = (tblW.getAttribute('w:w') ?? 0) as number
            const pct = tblW.getAttribute('w:type')
            if (width && pct !== 'pct' && pct !== 'auto') {
              tableWidth = `${width / 20}pt`
            }
            tableStyle.push(`width: ${tableWidth}`)
          }
          const tblBorders = dom?.getElementsByTagName('w:tblBorders')?.[0]
          if (tblBorders) {
            const borderTop = tblBorders.getElementsByTagName('w:top')?.[0] as HTMLElement
            const borderRight = tblBorders.getElementsByTagName('w:top')?.[0] as HTMLElement
            const borderBottom = tblBorders.getElementsByTagName('w:top')?.[0] as HTMLElement
            const borderLeft = tblBorders.getElementsByTagName('w:top')?.[0] as HTMLElement
            if (borderTop) {
              const color = borderTop.getAttribute('w:color')
              tableStyle.push(`border-top: 1px solid #${color}`)
            }
            if (borderRight) {
              const color = borderRight.getAttribute('w:color')
              tableStyle.push(`border-right: 1px solid #${color}`)
            }
            if (borderBottom) {
              const color = borderBottom.getAttribute('w:color')
              tableStyle.push(`border-bottom: 1px solid #${color}`)
            }
            if (borderLeft) {
              const color = borderLeft.getAttribute('w:color')
              tableStyle.push(`border-left: 1px solid #${color}`)
            }
          }
          break
        }
      }
      table.push(`<table cellspacing="0" cellpadding="0" style="${tableStyle.join(';')}">`)
      const rowSpan: Record<string, any>[] = []
      for (let j = 0; j < trNodes.length; j++) {
        const trNode = trNodes[j] as HTMLElement
        if (trNode.nodeName !== 'w:tr') {
          continue
        }
        const trStyle = getXmlStyle(trNode)
        table.push(`<tr style="${trStyle}">`)
        const tdNodes = trNode.childNodes
        for (let k = 0; k < tdNodes.length; k++) {
          const tdNode = tdNodes[k] as HTMLElement
          if (tdNode.nodeName !== 'w:tc') {
            continue
          }
          let tdCol = getXmlTableStyle(tdNode)
          let tdStyle = getXmlStyle(tdNode)
          const colNodes = tdNode.childNodes
          const textContents: string[] = []
          if (colNodes.length) {
            for (let c = 0; c < colNodes.length; c++) {
              const colNode = colNodes[c] as HTMLElement
              if (colNode.nodeName === 'w:t') {
                textContents.push(colNode.textContent ?? '')
                continue
              }
              if (colNode.nodeName === 'w:vMerge') {
                rowSpan.push(...getVMerge(colNode, k, j, table.length))
                tdCol = `${tdCol} rowspan=0`
                continue
              }
              if (colNode.nodeName === 'w:tbl') {
                textContents.push(...getXMLTable(colNode, linkObj))
                continue
              }
              if (colNode.nodeName === 'w:p') {
                const p = getXMlP(colNode, linkObj)
                if (p) {
                  textContents.push(p)
                }
                continue
              }
            }
          }
          table.push(`<td ${tdCol} style="${tdStyle};">${textContents.join('')}</td>`)
        }
        table.push('</tr>')
      }
      table = setRowSpan(rowSpan, table)
      table.push('</table>')
    }
    return table
  }

  const getRowSpan = (rowSpan: any) => {
    const maxColIndex = rowSpan.reduce((prev: number, cur: { index: number }) => {
      if (prev) {
        return prev > cur.index ? prev : cur.index
      }
      return cur.index
    })
    const rowList = []
    for (let i = 0; i <= maxColIndex; i++) {
      const cols = rowSpan.filter((o: { index: number }) => o.index === i)
      let row = null
      for (const col of cols) {
        if (!row) {
          row = {
            index: i,
            list: [col]
          }
          continue
        }
        const list = row.list
        const lastRow = list[list.length - 1].curRow
        if (col.curRow === lastRow + 1 && !col.isStart) {
          list.push(col)
        } else {
          rowList.push(row)
          row = {
            index: i,
            list: [col]
          }
        }
        if (col === cols[cols.length - 1]) {
          rowList.push(row)
        }
      }
    }
    return rowList
  }

  const getVMerge = (dom: HTMLElement, k: number, j: number, tableLen: number) => {
    const rowSpan: Record<string, any>[] = []
    if (dom && dom?.getAttribute) {
      if (dom?.getAttribute('w:val') === 'restart') {
        rowSpan.push({
          isStart: true,
          index: k,
          curRow: j,
          starRow: j,
          tableIndex: tableLen
        })
      } else {
        rowSpan.push({ isStart: false, index: k, curRow: j, tableIndex: tableLen })
      }
    }
    return rowSpan
  }
  const setRowSpan = (rowSpan: Record<string, any>[], table: string[]) => {
    if (rowSpan.length) {
      const rowList = getRowSpan(rowSpan)
      if (rowList.length) {
        for (const item of rowList) {
          const tableIndex = item?.list?.find(row => row.isStart)?.tableIndex
          if (tableIndex >= 0) {
            const str = table[tableIndex]
            table[tableIndex] = str.replace('rowspan=0', `rowspan=${item?.list.length}`)
          }
        }
      }
    }
    return table
  }

  const getXmlStyle = (dom: HTMLElement) => {
    const style = []
    const nodes = dom.childNodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (
        node.nodeName === 'w:trPr' ||
        node.nodeName === 'w:tcPr' ||
        node.nodeName === 'w:tcPr' ||
        node.nodeName === 'w:rPr' ||
        node.nodeName === 'w:pPr'
      ) {
        const trh = dom?.getElementsByTagName('w:trHeight')?.[0]
        if (trh) {
          const height = (trh.getAttribute('w:val') ?? 0) as number
          style.push(`height: ${height / 20}pt`)
        }
        if (dom.nodeName === 'w:tc') {
          const tcPr = dom?.getElementsByTagName('w:tcPr')?.[0]
          const tcMar = tcPr?.getElementsByTagName('w:tcMar')?.[0]
          if (tcMar) {
            const top = ((tcMar.getElementsByTagName('w:top')?.[0] as HTMLElement)?.getAttribute(
              'w:w'
            ) ?? 0) as number
            const left = ((tcMar.getElementsByTagName('w:left')?.[0] as HTMLElement)?.getAttribute(
              'w:w'
            ) ?? 0) as number
            const bottom = ((
              tcMar.getElementsByTagName('w:bottom')?.[0] as HTMLElement
            )?.getAttribute('w:w') ?? 0) as number
            const right = ((tcMar.getElementsByTagName('w:right')?.[0] as HTMLElement)?.getAttribute(
              'w:w'
            ) ?? 0) as number
            style.push(
              `padding: ${top / 20}pt ${right / 20 ?? 0}pt ${bottom / 20}pt ${left / 20}pt`
            )
          }
        }
        const tcW = dom?.getElementsByTagName('w:tcW')?.[0]
        if (tcW && tcW.getAttribute && tcW.getAttribute('w:w')) {
          const width = (tcW.getAttribute('w:w') || 0) as number
          const pct = tcW.getAttribute('w:type')
          if (pct === 'pct') {
            style.push(`width: 100%`)
          } else if (width > 0) {
            style.push(`width: ${width / 20}pt`)
          }
        }
        const jc = dom?.getElementsByTagName('w:jc')?.[0]
        if (jc && jc.getAttribute) {
          style.push(`text-align: ${jc.getAttribute('w:val')}`)
        } else {
          style.push(`text-align: left`)
        }
        const spacing = dom?.getElementsByTagName('w:spacing')?.[0]
        if (spacing && spacing.getAttribute) {
          const lineHeight = (spacing.getAttribute('w:line') ?? 0) as number
          style.push(`line-height: ${lineHeight / 20 || 26}pt`)
        }
        const sz = dom?.getElementsByTagName('w:sz')?.[0]
        if (sz && sz.getAttribute) {
          const fontSize = (sz.getAttribute('w:val') || 0) as number
          style.push(`font-size: ${fontSize / 2 || 18}pt`)
        }
        const szCs = dom?.getElementsByTagName('w:szCs')?.[0]
        if (szCs && szCs.getAttribute) {
          const fontSize = (szCs.getAttribute('w:val') || 0) as number
          style.push(`font-size: ${fontSize / 2 || 18}pt`)
        }
        const color = dom?.getElementsByTagName('w:color')?.[0]
        if (color && color.getAttribute) {
          style.push(`color: #${color.getAttribute('w:val')}`)
        }
        const fb = dom?.getElementsByTagName('w:b')?.[0]
        if (fb) {
          style.push('font-weight: bold')
        }
        const ind = dom?.getElementsByTagName('w:ind')?.[0]
        if (ind) {
          style.push('text-indent: 2em')
        }
        const shd = dom?.getElementsByTagName('w:shd')?.[0]
        if (shd && shd.getAttribute) {
          const bg = shd.getAttribute('w:fill')
          style.push(`background-color: ${bg === 'auto' ? 'auto' : '#' + bg}`)
        }
      }
    }
    return style.join(';')
  }

  const getXmlTableStyle = (tdNode: HTMLElement) => {
    const tdCol = []
    const gridSpan = tdNode?.getElementsByTagName('w:gridSpan')?.[0]
    if (gridSpan && gridSpan.getAttribute) {
      tdCol.push(`colspan=${gridSpan.getAttribute('w:val')}`)
    }
    return tdCol.join(' ')
  }
  return {
    convertToHtml
  }
}
