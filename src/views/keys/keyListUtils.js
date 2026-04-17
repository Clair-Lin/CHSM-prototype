import { KEY_STATUS_LABEL } from '../../mock/keyListMock.js'

export function formatDash(val) {
  return val == null || val === '' ? '—' : val
}

export function keyStatusMeta(status) {
  if (status === 'archived') {
    return { label: KEY_STATUS_LABEL.archived, dotClass: 'status-dot--warning' }
  }
  return { label: KEY_STATUS_LABEL.activated, dotClass: 'status-dot--success' }
}

/** 日期范围（YYYY-MM-DD HH:mm:ss 字符串）是否在 [start,end] 内；空则不过滤 */
export function inDateTimeRange(value, start, end) {
  if (!start && !end) return true
  if (!value) return false
  const v = String(value).replace(/-/g, '')
  const s = start ? String(start).replace(/[- :]/g, '') : ''
  const e = end ? String(end).replace(/[- :]/g, '') : ''
  if (s && v < s) return false
  if (e && v > e) return false
  return true
}
