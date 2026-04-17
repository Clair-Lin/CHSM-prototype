/** 是否至少成功完成过一次「制作密钥导出 key」（用于导出编排：首次强制制作 / 非首次询问） */
const LS_MAKE_EXPORT_DONE = 'CHSM_MAKE_EXPORT_KEY_DONE'

export function hasMadeExportKeyOnce() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(LS_MAKE_EXPORT_DONE) === '1'
  } catch {
    return false
  }
}

export function markMakeExportKeyCompletedOnce() {
  try {
    localStorage.setItem(LS_MAKE_EXPORT_DONE, '1')
  } catch {
    /* ignore */
  }
}
