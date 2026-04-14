import { reactive } from 'vue'

/** IP 池管理列表默认行（与 IP 池管理页、克隆向导下拉同源） */
export const IP_POOL_INITIAL_ROWS = [
  {
    id: 'pool-212',
    name: '212网段',
    startIp: '192.168.212.200',
    endIp: '192.168.212.255',
    gateway: '192.168.212.1',
    subnetMask: '255.255.255.0',
    enabled: true,
    createdAt: '2026-03-23 10:36:45'
  }
]

/**
 * 与 IP 池管理页 `IpPoolManagement.vue` 共用的响应式列表；
 * 克隆向导第 3 步通过 `listCloneIpPoolSelectOptions()` 读取同一数据源（仅启用池）。
 */
export const ipPoolResourceMock = reactive({
  rows: IP_POOL_INITIAL_ROWS.map((r) => ({ ...r }))
})

function maskToPrefix(mask) {
  const m = String(mask)
    .split('.')
    .map((x) => Number(x))
  if (m.length !== 4 || m.some((x) => Number.isNaN(x))) return '24'
  let bits = 0
  for (const o of m) bits += [...o.toString(2)].filter((c) => c === '1').length
  return String(bits)
}

/** 虚拟密码机克隆：从当前 IP 池列表派生下拉项（仅启用） */
export function toCloneIpPoolOptions(rows) {
  return rows
    .filter((r) => r.enabled)
    .map((r) => {
      const p = String(r.startIp || '').split('.')
      const net =
        p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.0/${maskToPrefix(r.subnetMask)}` : ''
      return {
        id: r.id,
        label: net ? `${r.name} (${net})` : r.name
      }
    })
}

export function listCloneIpPoolSelectOptions() {
  return toCloneIpPoolOptions(ipPoolResourceMock.rows)
}
