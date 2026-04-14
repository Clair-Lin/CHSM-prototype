/**
 * 导入虚拟机影像弹窗 — 与「密码设备资源管理」「机构管理」对齐
 *
 * 1. 分组：由资源管理中设备归属决定——按虚拟机 IPv4 匹配 `devicesByGroupId` 中设备的 ip/name，得到唯一分组 id。
 * 2. 机构：须同时满足——该分组 `authorizedByGroupId` 已授权，且机构代号在「机构管理」中存在且为启用状态。
 * 3. 受控 VSM：分组内须至少存在 1 台 id 在 IMPORT_CONTROL_VSM_IDS 中的虚拟机，且该虚拟机解析到的资源分组与此分组一致。
 */

import { VIRTUAL_HSM_ROWS } from './virtualHsmMock.js'
import { cryptoDeviceResourceMock, listAuthorizedForGroup } from './cryptoDeviceResourceMock.js'
import { organizationMock } from './organizationMock.js'

/**
 * 受控 VSM：同一资源分组内至少需有 1 台处于此集合中的虚拟机，才允许作为导入上下文。
 */
/** 须覆盖各资源分组至少一台（含 g-test2 的 v4、g-hsm3 的 v11） */
export const IMPORT_CONTROL_VSM_IDS = new Set(['v1', 'v2', 'v4', 'v6', 'v7', 'v10', 'v11'])

/** 按 IPv4 解析虚拟机在密码设备资源中的分组 id（与列表设备 ip/name 一致） */
export function resolveVmResourceGroupId(vm) {
  const key = (vm?.ipv4 && String(vm.ipv4).trim()) || ''
  if (!key) return null
  const map = cryptoDeviceResourceMock.devicesByGroupId
  for (const [groupId, devices] of Object.entries(map)) {
    if (!Array.isArray(devices)) continue
    if (devices.some((d) => d.ip === key || d.name === key)) return groupId
  }
  return null
}

export function getVmGroupId(vmId) {
  const vm = VIRTUAL_HSM_ROWS.find((r) => r.id === vmId)
  return vm ? resolveVmResourceGroupId(vm) : null
}

function findManagedOrgByCode(code) {
  const c = String(code)
  return organizationMock.rows.find((r) => r.code === c && r.orgStatus === '启用') ?? null
}

/**
 * 下拉用：分组授权 ∩ 机构管理（代号一致且启用），展示名以机构管理为准。
 */
export function listAuthorizedOrgSelectOptions(groupId) {
  if (!groupId) return []
  const out = []
  for (const a of listAuthorizedForGroup(groupId)) {
    const code = a.orgCode != null && a.orgCode !== '' ? String(a.orgCode) : String(a.id)
    const org = findManagedOrgByCode(code)
    if (!org) continue
    out.push({ id: code, label: org.name })
  }
  return out
}

/** 确定时校验：该分组授权且机构在机构管理中启用 */
export function isOrgAuthorizedAndManaged(groupId, orgCode) {
  if (!groupId || orgCode == null || orgCode === '') return false
  return listAuthorizedOrgSelectOptions(groupId).some((o) => o.id === String(orgCode))
}

export function groupHasAtLeastOneControlVsm(groupId) {
  if (!groupId) return false
  for (const vm of VIRTUAL_HSM_ROWS) {
    if (!IMPORT_CONTROL_VSM_IDS.has(vm.id)) continue
    if (resolveVmResourceGroupId(vm) === groupId) return true
  }
  return false
}

export function isVmImportEligible(vmId) {
  const gid = getVmGroupId(vmId)
  if (!gid) return false
  return groupHasAtLeastOneControlVsm(gid)
}

export function assertVirtualHsmLinkedToCryptoResource() {
  for (const row of VIRTUAL_HSM_ROWS) {
    const gid = resolveVmResourceGroupId(row)
    if (!gid) {
      console.warn(
        `[importVmDialogScopeMock] 虚拟机 ${row.id}（IP ${row.ipv4}）未在密码设备资源任一分组中登记`
      )
    }
  }
}

if (import.meta.env.DEV) {
  assertVirtualHsmLinkedToCryptoResource()
}
