import { reactive } from 'vue'

const initialRows = [
  {
    id: 'org-zhangj',
    name: 'zhangj',
    code: 'zhangj',
    contact: '',
    mobile: '',
    adminAccount: 'zhangj',
    maxUsers: 999,
    keyCount: 99,
    serviceMonths: 999,
    orgStatus: '启用',
    thirdPartyAuth: '未启用',
    createdAt: '2020-12-28 18:23:15',
    expiresAt: '2104-03-29 16:56:44',
    builtin: false
  },
  {
    id: 'org-liyn',
    name: 'liyn',
    code: 'liyn',
    contact: '',
    mobile: '',
    adminAccount: 'liyn',
    maxUsers: 999,
    keyCount: 99,
    serviceMonths: 999,
    orgStatus: '启用',
    thirdPartyAuth: '未启用',
    createdAt: '2020-12-28 18:23:15',
    expiresAt: '2104-03-29 16:56:44',
    builtin: false
  },
  {
    id: 'org-test2',
    name: 'test2',
    code: 'test2',
    contact: '',
    mobile: '',
    adminAccount: 'test2',
    maxUsers: 999,
    keyCount: 99,
    serviceMonths: 999,
    orgStatus: '启用',
    thirdPartyAuth: '未启用',
    createdAt: '2020-12-28 18:23:15',
    expiresAt: '2104-03-29 16:56:44',
    builtin: false
  },
  {
    id: 'org-chsm',
    name: '内置机构',
    code: 'chsm',
    contact: '',
    mobile: '',
    adminAccount: 'chsm_admin',
    maxUsers: 999,
    keyCount: 99,
    serviceMonths: 999,
    orgStatus: '启用',
    thirdPartyAuth: '未启用',
    createdAt: '2020-12-28 18:23:15',
    expiresAt: '2104-03-29 16:56:44',
    builtin: true
  },
  {
    id: 'org-rd-dedicated',
    name: '研发专用机构',
    code: 'org-rd-dedicated',
    contact: '',
    mobile: '',
    adminAccount: 'rd_adm',
    maxUsers: 100,
    keyCount: 20,
    serviceMonths: 999,
    orgStatus: '启用',
    thirdPartyAuth: '未启用',
    createdAt: '2020-12-28 18:23:15',
    expiresAt: '2104-03-29 16:56:44',
    builtin: false
  }
]

export const organizationMock = reactive({
  rows: initialRows.map((r) => ({ ...r }))
})

export function setOrganizationStatus(id, enabled) {
  const row = organizationMock.rows.find((r) => r.id === id)
  if (!row || row.builtin) return false
  row.orgStatus = enabled ? '启用' : '停用'
  return true
}
