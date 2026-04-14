import { reactive } from 'vue'

/** 原型：厂商、设备类型选项（与需求一致） */
export const MANUFACTURER_OPTIONS = [
  { label: 'olym', value: 'olym' },
  { label: 'OLYM_XSIGN', value: 'OLYM_XSIGN' }
]

export const DEVICE_TYPE_OPTIONS = [
  { label: '时间戳服务器', value: '时间戳服务器' },
  { label: '签名验签服务器', value: '签名验签服务器' },
  { label: '云服务器密码机', value: '云服务器密码机' }
]

const defaultCapability =
  '密码服务、后台加密、消息认证、签名验签、加解密、生成签名密钥、生成加密密钥'

function padCode(n) {
  return String(n).padStart(4, '0')
}

let nextNumericCode = 30

/** 列表「分组编号」：内置分组为 null，界面显示为 -- */
const initialGroups = [
  {
    id: 'g-sys',
    code: null,
    name: '系统分组',
    groupType: '系统分组',
    builtin: true,
    manufacturer: null,
    deviceType: null,
    createdAt: '2026-04-08 09:15:22',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-unassigned',
    code: null,
    name: '未分配分组',
    groupType: '未指定分组',
    builtin: true,
    manufacturer: null,
    deviceType: null,
    createdAt: '2026-04-08 09:15:23',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-import',
    code: 'OLYM-HSM-IMP-0001',
    name: '密钥密码机分组',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'olym',
    deviceType: '云服务器密码机',
    createdAt: '2026-04-10 18:12:35',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-test2',
    code: 'OLYM-HSM-TST2-0001',
    name: 'test2分组',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'olym',
    deviceType: '云服务器密码机',
    createdAt: '2026-04-11 10:00:00',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-hsm2',
    code: 'OLYM-HSM-0012',
    name: '生产加密组',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'olym',
    deviceType: '云服务器密码机',
    createdAt: '2026-04-06 16:48:09',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-hsm3',
    code: 'OLYM-HSM-0021',
    name: '研发环境',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'olym',
    deviceType: '云服务器密码机',
    createdAt: '2026-04-02 13:45:28',
    deviceCapability: defaultCapability
  },
  {
    id: 'g3',
    code: 'OLYM_XSIGN-SVS-0004',
    name: 'vsm_test2',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'OLYM_XSIGN',
    deviceType: '签名验签服务器',
    createdAt: '2026-04-09 14:20:01',
    deviceCapability: defaultCapability
  },
  {
    id: 'g6',
    code: 'OLYM_XSIGN-SVS-0009',
    name: '验签集群 A',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'OLYM_XSIGN',
    deviceType: '签名验签服务器',
    createdAt: '2026-04-05 08:22:17',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-svs1',
    code: 'OLYM_XSIGN-SVS-0001',
    name: '签名验签',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'OLYM_XSIGN',
    deviceType: '签名验签服务器',
    createdAt: '2026-04-01 10:00:00',
    deviceCapability: defaultCapability
  },
  {
    id: 'g-svs2',
    code: 'OLYM_XSIGN-SVS-0002',
    name: '签名验签备份',
    groupType: '自定义分组',
    builtin: false,
    manufacturer: 'OLYM_XSIGN',
    deviceType: '签名验签服务器',
    createdAt: '2026-03-28 15:30:00',
    deviceCapability: defaultCapability
  }
]

/** 系统分组（g-sys）设备展开区：五列键值（原型示意，与界面稿一致） */
function buildSystemGroupExpandColumns(serialSuffix) {
  return [
    [
      { label: '密钥服务端口', value: '1111' },
      { label: '密码设备序列号', value: `SJ${serialSuffix}` },
      { label: 'CPU使用率', value: '0%' },
      { label: '联系方式', value: '--' }
    ],
    [
      { label: '密钥管理端口', value: '9080' },
      { label: '管理协议', value: 'KMIP' },
      { label: '内存使用率', value: '0.00%' },
      { label: '系统版本号', value: '4.2.1.4' }
    ],
    [
      { label: '密码设备管理端口', value: '8100' },
      { label: '协议版本号', value: '1.0.0' },
      { label: '存储空间使用率', value: '0.00%' },
      { label: '密码设备描述', value: '--' }
    ],
    [
      { label: '统计监控端口', value: '8001' },
      { label: '算法标准', value: 'SEC/ECC/TPKISEC…' },
      { label: '上架时间', value: '2024-03-26 19:33:15' }
    ],
    [
      { label: 'KMIP管理端口', value: '8089' },
      { label: '存储空间', value: '0MB' },
      { label: '运行时长', value: '0秒' }
    ]
  ]
}

function mkSvsDevice(id, ip) {
  return {
    id,
    name: ip,
    ip,
    cryptoType: '签名验签服务器',
    model: 'OLYM_SVS',
    manufacturer: 'OLYM_XSIGN',
    status: '已上架',
    resourceStatus: '资源可用'
  }
}

const initialDevices = {
  'g-sys': [
    {
      id: 'd1',
      name: '192.168.212.209',
      ip: '192.168.212.209',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用',
      expandColumns: buildSystemGroupExpandColumns('1631')
    },
    {
      id: 'd2',
      name: '192.168.212.207',
      ip: '192.168.212.207',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用',
      expandColumns: buildSystemGroupExpandColumns('1627')
    },
    {
      id: 'd3',
      name: '192.168.212.205',
      ip: '192.168.212.205',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用',
      expandColumns: buildSystemGroupExpandColumns('1605')
    },
    {
      id: 'd4',
      name: '192.168.212.202',
      ip: '192.168.212.202',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用',
      expandColumns: buildSystemGroupExpandColumns('1602')
    },
    {
      id: 'd5',
      name: '192.168.212.200',
      ip: '192.168.212.200',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用',
      expandColumns: buildSystemGroupExpandColumns('1600')
    }
  ],
  'g-import': [
    {
      id: 'd6',
      name: '192.168.220.101',
      ip: '192.168.220.101',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    },
    {
      id: 'gh-import-201',
      name: '192.168.212.201',
      ip: '192.168.212.201',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    }
  ],
  'g-test2': [
    {
      id: 'gt2-203',
      name: '192.168.212.203',
      ip: '192.168.212.203',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    }
  ],
  g3: [
    {
      id: 'd7',
      name: '10.0.12.31',
      ip: '10.0.12.31',
      cryptoType: '签名验签服务器',
      model: 'OLYM_SVS',
      manufacturer: 'OLYM_XSIGN',
      status: '已上架',
      resourceStatus: '资源可用'
    },
    {
      id: 'd8',
      name: '10.0.12.32',
      ip: '10.0.12.32',
      cryptoType: '签名验签服务器',
      model: 'OLYM_SVS',
      manufacturer: 'OLYM_XSIGN',
      status: '已上架',
      resourceStatus: '资源可用'
    }
  ],
  /**
   * 与虚拟密码机列表 IPv4 对齐，供「导入虚拟机影像」等按资源分组解析归属。
   * （192.168.212.200/202/205/207/209 已在系统分组 g-sys）
   */
  'g-hsm2': [
    {
      id: 'gh2-3',
      name: '192.168.212.204',
      ip: '192.168.212.204',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    },
    {
      id: 'gh2-4',
      name: '192.168.212.206',
      ip: '192.168.212.206',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    }
  ],
  'g-hsm3': [
    {
      id: 'gh3-1',
      name: '192.168.212.208',
      ip: '192.168.212.208',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    },
    {
      id: 'gh3-2',
      name: '192.168.212.210',
      ip: '192.168.212.210',
      cryptoType: '云服务器密码机',
      model: 'OLYM_CHSM',
      manufacturer: 'olym',
      status: '已上架',
      resourceStatus: '资源可用'
    }
  ],
  g6: [
    mkSvsDevice('g6-1', '10.0.13.11'),
    mkSvsDevice('g6-2', '10.0.13.12'),
    mkSvsDevice('g6-3', '10.0.13.13'),
    mkSvsDevice('g6-4', '10.0.13.14'),
    mkSvsDevice('g6-5', '10.0.13.15'),
    mkSvsDevice('g6-6', '10.0.13.16')
  ],
  'g-svs1': [mkSvsDevice('gs1-1', '10.0.14.21'), mkSvsDevice('gs1-2', '10.0.14.22'), mkSvsDevice('gs1-3', '10.0.14.23')],
  'g-svs2': [mkSvsDevice('gs2-1', '10.0.14.31')]
}

const initialAuth = {
  /** 授权机构 orgCode 须与「机构管理」organizationMock 中机构代号一致 */
  'g-sys': [
    {
      id: 'as-sys-chsm',
      orgName: '内置机构',
      orgCode: 'chsm',
      adminAccount: 'chsm_admin',
      maxUsers: 999,
      keyCount: 99,
      orgStatus: '启用',
      authTime: '2026-04-01 10:00:00'
    },
    {
      id: 'as-sys-liyn',
      orgName: 'liyn',
      orgCode: 'liyn',
      adminAccount: 'liyn',
      maxUsers: 999,
      keyCount: 99,
      orgStatus: '启用',
      authTime: '2026-04-02 14:20:00'
    }
  ],
  'g-hsm2': [
    {
      id: 'as-h2-liyn',
      orgName: 'liyn',
      orgCode: 'liyn',
      adminAccount: 'liyn',
      maxUsers: 999,
      keyCount: 99,
      orgStatus: '启用',
      authTime: '2026-04-05 09:30:00'
    }
  ],
  'g-hsm3': [
    {
      id: 'as-h3-1',
      orgName: '研发专用机构',
      orgCode: 'org-rd-dedicated',
      adminAccount: 'rd_adm',
      maxUsers: 100,
      keyCount: 20,
      orgStatus: '启用',
      authTime: '2026-04-03 16:00:00'
    }
  ],
  'g-import': [
    {
      id: 'a-zhangj',
      orgName: 'zhangj',
      orgCode: 'zhangj',
      adminAccount: 'zhangj',
      maxUsers: 999,
      keyCount: 99,
      orgStatus: '启用',
      authTime: '2026-04-10 18:13:34'
    }
  ],
  'g-test2': [
    {
      id: 'a-test2',
      orgName: 'test2',
      orgCode: 'test2',
      adminAccount: 'test2',
      maxUsers: 999,
      keyCount: 99,
      orgStatus: '启用',
      authTime: '2026-04-11 10:30:00'
    }
  ]
}

export const cryptoDeviceResourceMock = reactive({
  groups: [...initialGroups],
  devicesByGroupId: { ...initialDevices },
  authorizedByGroupId: { ...initialAuth }
})

/** 系统分组设备列表与展开详情的原型 ID（与「系统分组」行对应） */
export const SYSTEM_GROUP_ID = 'g-sys'

export function findGroupById(groupId) {
  return cryptoDeviceResourceMock.groups.find((g) => g.id === groupId) || null
}

export function listDevicesForGroup(groupId) {
  return cryptoDeviceResourceMock.devicesByGroupId[groupId] || []
}

/** 分组内设备条数（与列表、详情同源，避免与 `devicesByGroupId` 不一致） */
export function countDevicesInGroup(groupId) {
  return listDevicesForGroup(groupId).length
}

export function listAuthorizedForGroup(groupId) {
  return cryptoDeviceResourceMock.authorizedByGroupId[groupId] || []
}

export function listEnabledAuthorizedOrgsForGroup(groupId) {
  return listAuthorizedForGroup(groupId).filter((a) => a.orgStatus === '启用')
}

export function groupHasEnabledAuthorizedOrg(groupId) {
  return listEnabledAuthorizedOrgsForGroup(groupId).length > 0
}

function formatAuthTimeNow() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * 批量追加授权机构（原型）。`orgs` 为机构管理同源行（含 name/code/adminAccount 等）。
 * 已存在相同 orgCode 的项会跳过。
 */
export function appendAuthorizedOrgsForGroup(groupId, orgs) {
  if (!Array.isArray(orgs) || !orgs.length) return 0
  if (!cryptoDeviceResourceMock.authorizedByGroupId[groupId]) {
    cryptoDeviceResourceMock.authorizedByGroupId[groupId] = []
  }
  const arr = cryptoDeviceResourceMock.authorizedByGroupId[groupId]
  const t = formatAuthTimeNow()
  let added = 0
  for (const o of orgs) {
    const code = o.code
    if (!code || arr.some((a) => a.orgCode === code)) continue
    arr.push({
      id: `as-${groupId}-${code}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      orgName: o.name,
      orgCode: code,
      adminAccount: o.adminAccount ?? '',
      maxUsers: o.maxUsers ?? 999,
      keyCount: o.keyCount ?? 99,
      orgStatus: o.orgStatus === '停用' ? '停用' : '启用',
      authTime: t
    })
    added += 1
  }
  return added
}

/**
 * 克隆向导可选分组：与「密码设备资源管理」同源 `cryptoDeviceResourceMock.groups`，
 * 仅含无设备的非内置自定义分组（克隆机将落在该分组内）。
 */
export function listEmptyCustomGroupsForClone() {
  return cryptoDeviceResourceMock.groups.filter(
    (g) => !g.builtin && listDevicesForGroup(g.id).length === 0
  )
}

function typePrefix(deviceType) {
  if (deviceType === '时间戳服务器') return 'TS'
  if (deviceType === '签名验签服务器') return 'SVS'
  return 'HSM'
}

export function removeDeviceFromGroup(groupId, deviceId) {
  const arr = cryptoDeviceResourceMock.devicesByGroupId[groupId]
  if (!arr) return
  const idx = arr.findIndex((d) => d.id === deviceId)
  if (idx === -1) return
  arr.splice(idx, 1)
}

/** 设备上架/下架（原型）：已上架 → 下架；已下架 → 上架，并联动资源状态 */
export function setDeviceShelfStatus(groupId, deviceId, onShelf) {
  const arr = cryptoDeviceResourceMock.devicesByGroupId[groupId]
  const d = arr?.find((x) => x.id === deviceId)
  if (!d) return false
  if (onShelf) {
    d.status = '已上架'
    d.resourceStatus = '资源可用'
  } else {
    d.status = '已下架'
    d.resourceStatus = '资源不可用'
  }
  return true
}

export function deleteCustomGroup(groupId) {
  const idx = cryptoDeviceResourceMock.groups.findIndex((g) => g.id === groupId)
  if (idx === -1) return false
  const g = cryptoDeviceResourceMock.groups[idx]
  if (g.builtin) return false
  cryptoDeviceResourceMock.groups.splice(idx, 1)
  delete cryptoDeviceResourceMock.devicesByGroupId[groupId]
  delete cryptoDeviceResourceMock.authorizedByGroupId[groupId]
  return true
}

export function addCustomGroup({ name, manufacturer, deviceType }) {
  const id = `g-${Date.now()}`
  const prefix = manufacturer === 'OLYM_XSIGN' ? 'OLYM_XSIGN' : 'OLYM'
  const mid = typePrefix(deviceType)
  const code = `${prefix}-${mid}-${padCode(nextNumericCode++)}`
  const createdAt = new Date()
    .toLocaleString('zh-CN', { hour12: false })
    .replace(/\//g, '-')
  const row = {
    id,
    code,
    name,
    groupType: '自定义分组',
    builtin: false,
    manufacturer,
    deviceType,
    createdAt,
    deviceCapability: defaultCapability
  }
  cryptoDeviceResourceMock.groups.unshift(row)
  cryptoDeviceResourceMock.devicesByGroupId[id] = []
  cryptoDeviceResourceMock.authorizedByGroupId[id] = []
  return row
}
