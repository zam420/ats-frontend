import jsPDF from 'jspdf'
import html2Canvas from 'html2canvas'

export const usePDF = () => {
  const htmlToPDF = (element: HTMLElement) => {
    return new Promise((resolve, reject) => {
      const newDom = document.createElement('div')
      newDom.id = 'export-pdf-wrap'
      newDom.innerHTML = element.innerHTML
      newDom.style.padding = '100px 60px 80px'
      newDom.style.position = 'relative'
      const A4 = { width: 592.28, height: 837.8, scale: 4 }
      const doms = newDom.querySelectorAll('.pdf-not-show, .el-tabs__header')
      if (doms.length) {
        for (let i = 0; i < doms.length; i++) {
          const dom = doms[i] as HTMLElement
          dom.style.display = 'none'
        }
      }
      document.body.append(newDom)
      const totalWidth = newDom.clientWidth
      const calculateScale = totalWidth / A4.width
      const pageHeight = calculateScale * A4.height
      let page = 1
      const domList = newDom.querySelectorAll('.esp-detail-wrap .pdf-row-content')
      const parentOffset = newDom.getBoundingClientRect()
      const parentOffsetTop = parentOffset.top
      if (domList.length) {
        for (let i = 0; i < domList.length; i++) {
          const curDom = domList[i] as HTMLElement
          const { top, height } = curDom.getBoundingClientRect()
          let paddingTop = top - parentOffsetTop - pageHeight * page
          if (paddingTop + height > -30) {
            page++
            let marginTop = 0
            if (curDom.classList.contains('esp-detail-title')) {
              marginTop += 26
            }
            const top = marginTop - paddingTop + 100 < 0 ? 0 : marginTop - paddingTop + 100
            curDom.style.marginTop = `${top}px`
          }
        }
      }
      html2Canvas(newDom as HTMLElement, {
        allowTaint: true,
        scale: A4.scale
      })
        .then(function (canvas) {
          let contentWidth = canvas.width
          let contentHeight = canvas.height
          let pageHeight = (contentWidth / A4.width) * A4.height
          let leftHeight = contentHeight
          let position = 0
          let imgWidth = A4.width
          let imgHeight = (A4.width / contentWidth) * (newDom.clientHeight * A4.scale)
          let pageData = canvas.toDataURL('image/jpeg', 1.0)
          let pdf = new jsPDF('portrait', 'pt', 'a4')
          if (leftHeight < pageHeight) {
            pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
          } else {
            while (leftHeight > 0) {
              pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight
              position -= A4.height
              if (leftHeight > 0) {
                pdf.addPage()
              }
            }
          }
          newDom.remove()
          resolve(pdf.output('blob'))
        })
        .catch(e => {
          console.log(e)
          reject(e)
        })
    })
  }
  return {
    htmlToPDF
  }
}
