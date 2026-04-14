/** 虚拟机影像管理 — 原型列表数据 */

export const VM_IMAGE_ROWS = [
  {
    id: 'img-1',
    imageName: '211镜像',
    vmCryptoName: 'os-vsm1.2.0-0c36a165-fff7-4cf3-9798-9931dcd1017e',
    remark: '',
    status: 'export_ok',
    time: '2024-04-09 10:58:44'
  },
  {
    id: 'img-2',
    imageName: '测试备份镜像',
    vmCryptoName: 'os-vsm1.2.0-51281a1e-92dc-459e-a65b-198c1c660462',
    remark: '预发布环境',
    status: 'export_ok',
    time: '2024-03-21 09:12:03'
  }
]

export const VM_IMAGE_STATUS_META = {
  export_ok: { label: '导出成功', dotClass: 'status-dot--success' },
  exporting: { label: '导出中', dotClass: 'status-dot--warning' },
  failed: { label: '失败', dotClass: 'status-dot--danger' }
}
