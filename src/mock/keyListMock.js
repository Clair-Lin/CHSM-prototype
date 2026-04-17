/** 密钥列表原型数据（三页签分源） */

export const KEY_STATUS_LABEL = {
  activated: '已激活',
  archived: '已归档'
}

/** 系统管理主密钥 */
export const SYS_MASTER_KEY_ROWS = [
  {
    id: '1774233547040801',
    name: '系统管理主密钥',
    version: '01',
    status: 'activated',
    typeLabel: '系统管理主密钥_256',
    typeDesc: '用于生成管理与签名密钥',
    deviceGroup: '系统分组',
    replica: '1/1',
    source: '本地创建',
    activator: 'init_system@myibc.net',
    activatedAt: '2023-03-23 10:39:07',
    effectiveAt: '2023-03-23 10:39:08',
    expireAt: '长期有效'
  }
]

/** 机构-密码机密钥 */
export const INSTITUTION_HSM_KEY_ROWS = [
  {
    id: '1776233532225801',
    name: 'SM9分片主密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'SM9分片主密钥_256',
    typeDesc: '生成加密密钥, 加密, 签名校验, 生成签名密钥',
    deviceGroup: '影像操作密码机',
    replica: '1/1',
    source: '密码机登记',
    orgName: 'zhangj',
    addedBy: 'sys_admin',
    addedAt: '2023-04-01 09:12:00',
    effectiveAt: '2023-04-01 09:12:01',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225802',
    name: 'SM2签名密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'SM2_256',
    typeDesc: '签名, 验签',
    deviceGroup: '影像操作密码机',
    replica: '1/1',
    source: '本地创建',
    orgName: '内管机构',
    addedBy: 'sys_admin',
    addedAt: '2023-04-02 11:20:33',
    effectiveAt: '2023-04-02 11:20:34',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225803',
    name: 'RSA加密密钥',
    version: '02',
    status: 'activated',
    typeLabel: 'RSA_2048',
    typeDesc: '加密, 解密',
    deviceGroup: '有寄机密密码机',
    replica: '2/2',
    source: '密码机登记',
    orgName: 'liyn',
    addedBy: 'chsm_admin',
    addedAt: '2023-04-05 14:08:11',
    effectiveAt: '2023-04-05 14:08:12',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225804',
    name: '对称会话密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'AES_128',
    typeDesc: '数据加密',
    deviceGroup: '系统分组',
    replica: '1/1',
    source: '本地创建',
    orgName: 'zhangj',
    addedBy: 'sys_admin',
    addedAt: '2023-04-06 16:45:00',
    effectiveAt: '2023-04-06 16:45:01',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225805',
    name: 'SM9分片主密钥',
    version: '01',
    status: 'archived',
    typeLabel: 'SM9分片主密钥_256',
    typeDesc: '生成加密密钥',
    deviceGroup: '影像操作密码机',
    replica: '0/1',
    source: '密码机登记',
    orgName: '内管机构',
    addedBy: 'sys_admin',
    addedAt: '2023-03-28 10:00:00',
    effectiveAt: '2023-03-28 10:00:01',
    expireAt: '2024-03-28 10:00:00'
  },
  {
    id: '1776233532225806',
    name: 'ECC加密密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'ECC_P256',
    typeDesc: '密钥协商',
    deviceGroup: '有寄机密密码机',
    replica: '1/1',
    source: '本地创建',
    orgName: 'test2',
    addedBy: 'liyn',
    addedAt: '2023-04-10 08:30:22',
    effectiveAt: '2023-04-10 08:30:23',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225807',
    name: 'HMAC密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'HMAC_SHA256',
    typeDesc: '完整性校验',
    deviceGroup: '影像操作密码机',
    replica: '1/1',
    source: '密码机登记',
    orgName: 'zhangj',
    addedBy: 'sys_admin',
    addedAt: '2023-04-11 13:11:11',
    effectiveAt: '2023-04-11 13:11:12',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225808',
    name: 'SM4数据密钥',
    version: '03',
    status: 'activated',
    typeLabel: 'SM4_128',
    typeDesc: '加密存储',
    deviceGroup: '系统分组',
    replica: '1/1',
    source: '本地创建',
    orgName: '内管机构',
    addedBy: 'chsm_admin',
    addedAt: '2023-04-12 09:09:09',
    effectiveAt: '2023-04-12 09:09:10',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225809',
    name: '国密SSL密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'SM2_SSL_256',
    typeDesc: 'SSL握手',
    deviceGroup: '有寄机密密码机',
    replica: '1/1',
    source: '密码机登记',
    orgName: 'liyn',
    addedBy: 'sys_admin',
    addedAt: '2023-04-13 15:15:15',
    effectiveAt: '2023-04-13 15:15:16',
    expireAt: '长期有效'
  }
]

/** 机构-库内密钥 */
export const INSTITUTION_LIBRARY_KEY_ROWS = [
  {
    id: '1776233532225901',
    name: 'SM9分片密钥',
    version: '01',
    status: 'archived',
    typeLabel: 'SM9分片主密钥_256',
    typeDesc: '生成加密密钥, 加密, 签名校验, 生成签名密钥',
    deviceGroup: '有寄机密密码机',
    orgName: 'liyn',
    addedBy: 'chsm_admin',
    addedAt: '2023-05-01 10:22:00',
    effectiveAt: '2023-05-01 10:22:01',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225902',
    name: '机构库对称密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'SM4_128',
    typeDesc: '加密, 解密',
    deviceGroup: '系统分组',
    orgName: '内管机构',
    addedBy: 'chsm_admin',
    addedAt: '2023-05-02 11:33:44',
    effectiveAt: '2023-05-02 11:33:45',
    expireAt: '长期有效'
  },
  {
    id: '1776233532225903',
    name: '分片备份密钥',
    version: '01',
    status: 'activated',
    typeLabel: 'SM9分片主密钥_256',
    typeDesc: '生成签名密钥',
    deviceGroup: '有寄机密密码机',
    orgName: 'liyn',
    addedBy: 'liyn',
    addedAt: '2023-05-03 12:44:55',
    effectiveAt: '2023-05-03 12:44:56',
    expireAt: '长期有效'
  }
]

export const HSM_KEY_FILTER_OPTIONS = {
  keyTypes: ['SM9分片主密钥_256', 'SM2_256', 'RSA_2048', 'AES_128', 'ECC_P256', 'HMAC_SHA256', 'SM4_128', 'SM2_SSL_256'],
  keyUsages: ['生成加密密钥', '加密', '签名', '验签', '数据加密', '密钥协商', '完整性校验', '加密存储', 'SSL握手'],
  keySources: ['密码机登记', '本地创建'],
  statuses: ['已激活', '已归档'],
  deviceGroups: ['影像操作密码机', '有寄机密密码机', '系统分组']
}

export const LIB_KEY_FILTER_OPTIONS = {
  keyTypes: ['SM9分片主密钥_256', 'SM4_128'],
  keyUsages: ['生成加密密钥', '加密', '签名校验', '生成签名密钥', '加密', '解密', '生成签名密钥'],
  statuses: ['已激活', '已归档']
}
