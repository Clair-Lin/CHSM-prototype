import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import HomeWelcome from '../views/HomeWelcome.vue'
import ModulePlaceholder from '../views/ModulePlaceholder.vue'
import CryptoDeviceResources from '../views/crypto-device/CryptoDeviceResources.vue'
import CryptoDeviceGroupDetail from '../views/crypto-device/CryptoDeviceGroupDetail.vue'
import CryptoDeviceGroupAuthorize from '../views/crypto-device/CryptoDeviceGroupAuthorize.vue'
import VirtualHsmManagement from '../views/cloud-hsm/VirtualHsmManagement.vue'
import CloudHsmMediaManagement from '../views/cloud-hsm/CloudHsmMediaManagement.vue'
import IpPoolManagement from '../views/cloud-hsm/IpPoolManagement.vue'
import OrganizationManagement from '../views/organization/OrganizationManagement.vue'

function placeholder(title, section = null) {
  return {
    component: ModulePlaceholder,
    meta: { title, section }
  }
}

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: HomeWelcome,
        meta: { title: '欢迎' }
      },
      {
        path: '/monitoring/overview',
        name: 'MonitoringOverview',
        ...placeholder('监测概览', '监测概览')
      },
      {
        path: '/organization',
        name: 'Organization',
        component: OrganizationManagement,
        meta: { title: '机构管理', section: null }
      },
      {
        path: '/crypto-device/resources',
        name: 'CryptoDeviceResources',
        component: CryptoDeviceResources,
        meta: { title: '密码设备资源管理', section: null }
      },
      {
        path: '/crypto-device/resources/groups/:groupId',
        name: 'CryptoDeviceGroupDetail',
        component: CryptoDeviceGroupDetail,
        meta: { title: '密码资源管理详情', section: '密码设备资源管理' }
      },
      {
        path: '/crypto-device/resources/groups/:groupId/authorize',
        name: 'CryptoDeviceGroupAuthorize',
        component: CryptoDeviceGroupAuthorize,
        meta: { title: '密码资源授权机构', section: '密码设备资源管理' }
      },
      {
        path: '/cloud-hsm/host',
        name: 'CloudHsmHost',
        ...placeholder('宿主机管理', '云密码机管理')
      },
      {
        path: '/cloud-hsm/virtual-hsm',
        name: 'CloudHsmVirtual',
        component: VirtualHsmManagement,
        meta: { title: '虚拟密码机管理', section: '云密码机管理' }
      },
      {
        path: '/cloud-hsm/media',
        name: 'CloudHsmMedia',
        component: CloudHsmMediaManagement,
        meta: { title: '影像管理', section: '云密码机管理' }
      },
      {
        path: '/cloud-hsm/ip-pool',
        name: 'CloudHsmIpPool',
        component: IpPoolManagement,
        meta: { title: 'IP池管理', section: '云密码机管理' }
      },
      {
        path: '/cloud-hsm/third-party',
        name: 'CloudHsmThirdParty',
        ...placeholder('第三方接管平台', '云密码机管理')
      },
      {
        path: '/cloud-hsm/drift',
        name: 'CloudHsmDrift',
        ...placeholder('漂移列表', '云密码机管理')
      },
      {
        path: '/vm-cluster/clusters',
        name: 'VmClusterList',
        ...placeholder('虚拟机集群', '虚拟机集群管理')
      },
      {
        path: '/vm-cluster/auto-scale',
        name: 'VmClusterAutoScale',
        ...placeholder('集群动态扩容配置', '虚拟机集群管理')
      },
      {
        path: '/vm-cluster/monitoring',
        name: 'VmClusterMonitoring',
        ...placeholder('集群监控', '虚拟机集群管理')
      },
      {
        path: '/images',
        name: 'ImageManagement',
        ...placeholder('镜像管理', '镜像管理')
      },
      {
        path: '/keys/resource-pool',
        name: 'KeysResourcePool',
        ...placeholder('密钥资源池', '密钥信息')
      },
      {
        path: '/keys/list',
        name: 'KeysList',
        ...placeholder('密钥列表', '密钥信息')
      },
      {
        path: '/logs/operation',
        name: 'LogsOperation',
        ...placeholder('操作日志', '日志管理')
      },
      {
        path: '/system/admins',
        name: 'SystemAdmins',
        ...placeholder('管理员管理', '系统管理')
      },
      {
        path: '/system/permissions',
        name: 'SystemPermissions',
        ...placeholder('权限管理', '系统管理')
      },
      {
        path: '/system/settings',
        name: 'SystemSettings',
        ...placeholder('系统设置', '系统管理')
      },
      {
        path: '/system/applications',
        name: 'SystemApplications',
        ...placeholder('系统应用', '系统管理')
      },
      {
        path: '/system/device-operations',
        name: 'SystemDeviceOperations',
        ...placeholder('设备操作', '系统管理')
      },
      {
        path: '/system/snmp',
        name: 'SystemSnmp',
        ...placeholder('snmp配置', '系统管理')
      },
      {
        path: '/system/syslog',
        name: 'SystemSyslog',
        ...placeholder('Syslog配置', '系统管理')
      },
      {
        path: '/system/nodes',
        name: 'SystemNodes',
        ...placeholder('节点管理', '系统管理')
      },
      {
        path: '/about',
        name: 'About',
        ...placeholder('关于', '关于')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
