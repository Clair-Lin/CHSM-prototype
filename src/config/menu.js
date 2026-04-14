import IcoMonitoringOverview from '../access/icon/IcoMonitoringOverview.vue'
import IcoOrganization from '../access/icon/IcoOrganization.vue'
import IcoCryptoDeviceResources from '../access/icon/IcoCryptoDeviceResources.vue'
import IcoCloudHsm from '../access/icon/IcoCloudHsm.vue'
import IcoVmCluster from '../access/icon/IcoVmCluster.vue'
import IcoImageManagement from '../access/icon/IcoImageManagement.vue'
import IcoKeys from '../access/icon/IcoKeys.vue'
import IcoLogs from '../access/icon/IcoLogs.vue'
import IcoSystem from '../access/icon/IcoSystem.vue'
import IcoAbout from '../access/icon/IcoAbout.vue'

/** 侧边栏菜单配置（与路由 path 一致）；icon 为 Vue 组件（SVG 内联，见 src/access/icon） */
export const sidebarMenu = [
  { type: 'link', title: '监测概览', path: '/monitoring/overview', icon: IcoMonitoringOverview },
  { type: 'link', title: '机构管理', path: '/organization', icon: IcoOrganization },
  { type: 'link', title: '密码设备资源管理', path: '/crypto-device/resources', icon: IcoCryptoDeviceResources },
  {
    type: 'group',
    key: 'cloudHsm',
    title: '云密码机管理',
    icon: IcoCloudHsm,
    children: [
      { title: '宿主机管理', path: '/cloud-hsm/host' },
      { title: '虚拟密码机管理', path: '/cloud-hsm/virtual-hsm' },
      { title: '影像管理', path: '/cloud-hsm/media' },
      { title: 'IP池管理', path: '/cloud-hsm/ip-pool' },
      { title: '第三方接管平台', path: '/cloud-hsm/third-party' },
      { title: '漂移列表', path: '/cloud-hsm/drift' }
    ]
  },
  {
    type: 'group',
    key: 'vmCluster',
    title: '虚拟机集群管理',
    icon: IcoVmCluster,
    children: [
      { title: '虚拟机集群', path: '/vm-cluster/clusters' },
      { title: '集群动态扩容配置', path: '/vm-cluster/auto-scale' },
      { title: '集群监控', path: '/vm-cluster/monitoring' }
    ]
  },
  { type: 'link', title: '镜像管理', path: '/images', icon: IcoImageManagement },
  {
    type: 'group',
    key: 'keys',
    title: '密钥信息',
    icon: IcoKeys,
    children: [
      { title: '密钥资源池', path: '/keys/resource-pool' },
      { title: '密钥列表', path: '/keys/list' }
    ]
  },
  {
    type: 'group',
    key: 'logs',
    title: '日志管理',
    icon: IcoLogs,
    children: [{ title: '操作日志', path: '/logs/operation' }]
  },
  {
    type: 'group',
    key: 'system',
    title: '系统管理',
    icon: IcoSystem,
    children: [
      { title: '管理员管理', path: '/system/admins' },
      { title: '权限管理', path: '/system/permissions' },
      { title: '系统设置', path: '/system/settings' },
      { title: '系统应用', path: '/system/applications' },
      { title: '设备操作', path: '/system/device-operations' },
      { title: 'snmp配置', path: '/system/snmp' },
      { title: 'Syslog配置', path: '/system/syslog' },
      { title: '节点管理', path: '/system/nodes' }
    ]
  },
  { type: 'link', title: '关于', path: '/about', icon: IcoAbout }
]
