/** 虚拟密码机管理 — 原型列表数据（初始快照，页面内用 ref 持有可变副本） */

/** 与界面稿一致的长序列号（含 92dc-459e-a65b- 段），名称与序列号相同 */
function mkSerial(stem, tail12) {
  const t = String(tail12)
    .replace(/[^a-fA-F0-9]/g, '')
    .padEnd(12, '0')
    .slice(0, 12)
  return `${stem}-92dc-459e-a65b-${t}`
}

function sn(stem, tail12) {
  const s = mkSerial(stem, tail12)
  return { serial: s, name: s }
}

/** resourceOnShelf：是否已上架至密码资源（false 时导入影像弹窗无需选分组/机构） */
/** hasCryptoData：虚拟机内已有密钥等业务数据时，迁移目标选择中不可选（原型字段） */
export const VIRTUAL_HSM_ROWS = [
  {
    id: 'v1',
    ...sn('os-vsm1.2.0-51281a1e', '198c1c660462'),
    ipv4: '192.168.212.200',
    ipv6: '',
    imageLabel: '云服务器密码机',
    version: '1.2.0',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true
  },
  {
    id: 'v2',
    ...sn('os-vsm1.2.0-a1b2c3d4', '298d2d771573'),
    ipv4: '192.168.212.201',
    ipv6: '',
    imageLabel: '签名验签服务器',
    version: '1.7.1',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true,
    hasCryptoData: true
  },
  {
    id: 'v3',
    ...sn('os-vsm1.2.0-e5f60718', '3a9e3e882684'),
    ipv4: '192.168.212.202',
    ipv6: '',
    imageLabel: '云服务器密码机',
    version: '1.2.0',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true
  },
  {
    id: 'v4',
    ...sn('os-vsm1.7.1-11223344', '4b0f4f993795'),
    ipv4: '192.168.212.203',
    ipv6: '',
    imageLabel: '签名验签服务器',
    version: '1.7.1',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true
  },
  {
    id: 'v5',
    ...sn('os-vsm1.2.0-55667788', '5c1a5aa048a6'),
    ipv4: '192.168.212.204',
    ipv6: '',
    imageLabel: '云服务器密码机',
    version: '1.2.0',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true,
    hasCryptoData: true
  },
  {
    id: 'v6',
    ...sn('os-vsm1.2.0-99aabbcc', '6d2b6bb159b7'),
    ipv4: '192.168.212.205',
    ipv6: '',
    imageLabel: '云服务器密码机',
    version: '1.2.0',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true
  },
  {
    id: 'v7',
    ...sn('os-vsm1.7.1-ccddeeff', '7e3c7cc26ac8'),
    ipv4: '192.168.212.206',
    ipv6: '',
    imageLabel: '签名验签服务器',
    version: '1.7.1',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true
  },
  {
    id: 'v8',
    ...sn('os-vsm1.2.0-00112233', '8f4d8dd37bd9'),
    ipv4: '192.168.212.207',
    ipv6: '',
    imageLabel: '云服务器密码机',
    version: '1.2.0',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: false
  },
  {
    id: 'v9',
    ...sn('os-vsm1.2.0-44556677', '9a5e9ee48cea'),
    ipv4: '192.168.212.208',
    ipv6: '',
    imageLabel: '签名验签服务器',
    version: '1.7.1',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: false
  },
  {
    id: 'v10',
    ...sn('os-vsm1.2.0-88990011', '0b6f0ff59dfb'),
    ipv4: '192.168.212.209',
    ipv6: '',
    imageLabel: '云服务器密码机',
    version: '1.2.0',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true,
    hasCryptoData: true
  },
  {
    id: 'v11',
    ...sn('os-vsm1.7.1-aabbccdd', '1c7a1aa6ae0c'),
    ipv4: '192.168.212.210',
    ipv6: '',
    imageLabel: '签名验签服务器',
    version: '1.7.1',
    hostName: '云机',
    manufacturer: 'olym',
    status: 'normal',
    resourceOnShelf: true
  }
]

/** 克隆向导可选目标宿主机（宿主机版本与虚拟机镜像版本相互独立） */
export const CLONE_TARGET_HOSTS = [
  { id: 'host-1', name: '云机', version: '1.5.0' },
  { id: 'host-2', name: '云机-B', version: '1.4.2' }
]

export function formatCloneTargetHostLabel(host) {
  if (!host) return ''
  return `${host.name} (版本: ${host.version})`
}

function gatewayFromIpv4(ipv4) {
  if (!ipv4 || ipv4 === '--') return '--'
  const parts = String(ipv4).split('.')
  if (parts.length !== 4) return '--'
  return `${parts[0]}.${parts[1]}.${parts[2]}.1`
}

function buildPerfMetricsByVm(row) {
  const perfItems = [
    'SM2密钥生成',
    'SM2 签名',
    'SM2 验证',
    'SM2 P7签名',
    'SM2 P7验证',
    'SM2 加密',
    'SM2 解密',
    'RSA 生密钥',
    'RSA 签名',
    'RSA 验证',
    'RSA P7签名',
    'RSA P7验证',
    'SM9 生密钥',
    'SM9 签名',
    'SM9 验证',
    'SM9 P7签名',
    'SM9 P7验证',
    'SM9 加密',
    'SM9 解密',
    'SM9 密钥协商',
    'SM1 加密运算',
    'SM4 加密运算',
    'AES 加密运算',
    'SM1 解密运算',
    'SM4 解密运算',
    'AES 解密运算'
  ]

  const seed = Number(String(row?.id || '').replace(/\D/g, '')) || 1
  const base = 900 + seed * 35
  return perfItems.map((item, idx) => ({
    item,
    tps: Math.max(120, base + (perfItems.length - idx) * 27)
  }))
}

/**
 * 列表行 → 查看详情弹窗用完整数据（原型：网口 eth0 与列表 IPv4 对齐，其余网口占位）
 * @param {object} row 列表行
 */
export function getVirtualHsmDetail(row) {
  const ip4 = row.ipv4 || ''
  const hasIp = Boolean(ip4)
  const gw = gatewayFromIpv4(ip4)
  const mask4 = hasIp ? '255.255.255.0' : '--'

  const iface = (id, v4, m4, g4) => ({
    id,
    ipV4: v4,
    ipV6: '--',
    maskV4: m4,
    maskV6: '--',
    gwV4: g4,
    gwV6: '--'
  })

  return {
    name: row.name,
    serial: row.serial,
    imageLabel: row.imageLabel,
    version: row.version,
    status: row.status,
    specText: 'CPU: 2核  内存: 2GB  带宽: 800Mbps',
    cpuUsagePct: 0,
    memUsagePct: 0,
    memUsedMb: 0,
    memTotalGb: 0,
    memUsedText: '0 B',
    memTotalText: '0 B',
    connectionCount: row.hasCryptoData ? 68 : 24,
    perfMetrics: buildPerfMetricsByVm(row),
    description: '',
    hostName: row.hostName,
    manufacturer: row.manufacturer,
    keyMgmtPort: 9080,
    mgmtProtocol: 'KMIP',
    group: '系统分组',
    model: 'OLYM_CHSM',
    monitorPort: 8100,
    kmipMgmtPort: 8089,
    interfaces: [
      iface('eth0', hasIp ? ip4 : '--', hasIp ? mask4 : '--', hasIp ? gw : '--'),
      iface('eth1', '--', '--', '--'),
      iface('eth2', '--', '--', '--'),
      iface('eth3', '--', '--', '--')
    ]
  }
}
