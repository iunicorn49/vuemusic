export function addClass(el, className) {
  // 首先判断是否已经具有传入的class,如果是true则打断
  if (hasClass(el, className)) return
  //  通过空格拆分,将已经具有的class转换为数组
  let newClass = el.className.split(' ')
  //  将新的class加进数组
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass(el, className) {
  //  使用正则判断,传入的class前面是空格或者是开头,后面是空格或者是结尾,则返回true
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}
