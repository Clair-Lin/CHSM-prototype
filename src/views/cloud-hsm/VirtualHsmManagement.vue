<template>
  <div class="page-container">
    <div class="breadcrumb">
      <span class="crumb-leaf">虚拟密码机管理</span>
    </div>
    <h1 class="page-title">虚拟密码机管理</h1>

    <div class="content-module filter-card">
      <el-form :inline="true" :model="query" class="filter-form" label-width="auto" @submit.prevent>
        <el-form-item label="虚拟密码机名称" class="filter-form__item">
          <el-input v-model="query.name" placeholder="请输入虚拟密码机名称" clearable class="filter-input" />
        </el-form-item>
        <el-form-item label="IP地址" class="filter-form__item">
          <el-input v-model="query.ip" placeholder="请输入IP地址" clearable class="filter-input" />
        </el-form-item>
        <el-form-item class="filter-form__item filter-form__actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset-outline" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-module table-card">
      <div class="table-card__toolbar">
        <div class="toolbar-row toolbar-row--check">
          <el-checkbox v-model="autoShelf" class="toolbar-check">虚拟机自动上架</el-checkbox>
          <el-tooltip content="开启后，新建虚拟机将按策略自动上架（原型说明）。" placement="top">
            <el-icon class="toolbar-help" :size="14"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="toolbar-row toolbar-row--btns">
          <el-button type="primary" @click="onAdd">新增</el-button>
          <el-button class="btn-batch-delete" @click="onBatchDelete">批量删除</el-button>
        </div>
      </div>
      <div class="table-card__sheet">
        <el-table
          ref="tableRef"
          :data="pagedRows"
          class="vsm-table"
          style="width: 100%"
          row-key="id"
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection" width="48" reserve-selection />
          <el-table-column label="序列号" min-width="200" class-name="col-wrap">
            <template #default="{ row }">
              <span class="cell-multiline">{{ row.serial }}</span>
            </template>
          </el-table-column>
          <el-table-column label="虚拟密码机名称" min-width="200" class-name="col-wrap">
            <template #default="{ row }">
              <span class="cell-multiline">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="IP地址" min-width="160" class-name="col-ip">
            <template #default="{ row }">
              <div class="ip-cell">
                <div class="ip-line">IPV4: {{ row.ipv4 || '--' }}</div>
                <div class="ip-line ip-line--v6">IPV6: {{ formatDash(row.ipv6) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="imageLabel" label="虚拟机镜像" min-width="140" show-overflow-tooltip />
          <el-table-column prop="version" label="版本" width="88" align="center" />
          <el-table-column prop="hostName" label="所属宿主机" width="100" show-overflow-tooltip />
          <el-table-column prop="manufacturer" label="生产厂商" width="100" show-overflow-tooltip />
          <el-table-column label="状态" width="88" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'normal'" type="success" size="small">正常</el-tag>
              <el-tag v-else type="info" size="small">--</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="268">
            <template #default="{ row }">
              <div class="ops-row">
                <el-button type="primary" link class="ops-link" @click="onDetail(row)">详情</el-button>
                <el-button type="primary" link class="ops-link" @click="onEdit(row)">编辑</el-button>
                <el-dropdown
                  trigger="click"
                  popper-class="vsm-more-dropdown"
                  @command="(cmd) => onMoreCommand(cmd, row)"
                >
                  <span class="ops-link ops-more-trigger" role="button" tabindex="0">
                    更多操作
                    <el-icon class="ops-more-icon"><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="item in MORE_ACTIONS"
                        :key="item.command"
                        :command="item.command"
                      >
                        {{ item.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          class="resource-pager"
          :total="filteredRows.length"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, sizes"
        />
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      title="查看详情"
      width="660px"
      class="vsm-detail-dialog"
      destroy-on-close
      align-center
      @closed="onDetailClosed"
    >
      <div v-if="detailRecord" class="detail-body">
        <div class="detail-block detail-block--kv">
          <div class="detail-kv">
            <span class="detail-kv__label">虚拟密码机名称</span>
            <span class="detail-kv__value">{{ detailRecord.name }}</span>
          </div>
          <div class="detail-kv">
            <span class="detail-kv__label">序列号</span>
            <span class="detail-kv__value">{{ detailRecord.serial }}</span>
          </div>
          <div class="detail-kv">
            <span class="detail-kv__label">虚拟机镜像</span>
            <span class="detail-kv__value">{{ detailRecord.imageLabel }}</span>
          </div>
          <div class="detail-kv">
            <span class="detail-kv__label">版本</span>
            <span class="detail-kv__value">{{ detailRecord.version }}</span>
          </div>
          <div class="detail-kv">
            <span class="detail-kv__label">状态</span>
            <span class="detail-kv__value">
              <span v-if="detailRecord.status === 'normal'" class="detail-status detail-status--ok">正常</span>
              <span v-else class="detail-status">--</span>
            </span>
          </div>
          <div class="detail-kv">
            <span class="detail-kv__label">规格</span>
            <span class="detail-kv__value">{{ detailRecord.specText }}</span>
          </div>
        </div>

        <div class="detail-block detail-kv detail-kv--progress">
          <span class="detail-kv__label">CPU使用率</span>
          <div class="detail-progress-wrap">
            <el-progress
              :percentage="Math.min(100, detailRecord.cpuUsagePct)"
              :stroke-width="14"
              text-inside
              :format="() => `${detailRecord.cpuUsagePct}%`"
              color="var(--el-color-success)"
            />
          </div>
        </div>
        <div class="detail-block detail-kv detail-kv--progress detail-kv--progress-mem">
          <span class="detail-kv__label">内存使用率</span>
          <div class="detail-progress-wrap">
            <el-progress
              :percentage="Math.min(100, detailRecord.memUsagePct)"
              :stroke-width="14"
              text-inside
              :format="() => `${detailRecord.memUsagePct}%`"
            />
            <div class="detail-mem-foot">
              内存量: {{ detailRecord.memUsedText || `${detailRecord.memUsedMb} MB` }} / {{ detailRecord.memTotalText || `${detailRecord.memTotalGb} GB` }}
            </div>
          </div>
        </div>
        <div class="detail-block detail-kv detail-kv--conn">
          <span class="detail-kv__label">连接数（新）</span>
          <div class="detail-kv__value">
            {{ detailRecord.connectionCount ?? 0 }}
          </div>
        </div>
        <div class="detail-block detail-kv detail-kv--perf-link">
          <span class="detail-kv__label">性能（新）</span>
          <div class="detail-kv__value">
            <el-button type="primary" link class="detail-open-perf-btn" @click="openPerfDialog">
              查看性能
            </el-button>
          </div>
        </div>
        <div class="detail-block detail-kv detail-kv--single">
          <span class="detail-kv__label">描述</span>
          <span class="detail-kv__value">{{ formatDash(detailRecord.description) }}</span>
        </div>

        <div class="detail-block detail-columns">
          <div class="detail-col">
            <div class="detail-kv">
              <span class="detail-kv__label">所属宿主机</span>
              <span class="detail-kv__value">{{ detailRecord.hostName }}</span>
            </div>
            <div class="detail-kv">
              <span class="detail-kv__label">生产厂商</span>
              <span class="detail-kv__value">{{ detailRecord.manufacturer }}</span>
            </div>
            <div class="detail-kv">
              <span class="detail-kv__label">密钥管理端口</span>
              <span class="detail-kv__value">{{ detailRecord.keyMgmtPort }}</span>
            </div>
            <div class="detail-kv">
              <span class="detail-kv__label">管理协议</span>
              <span class="detail-kv__value">{{ detailRecord.mgmtProtocol }}</span>
            </div>
          </div>
          <div class="detail-col">
            <div class="detail-kv">
              <span class="detail-kv__label">所属分组</span>
              <span class="detail-kv__value">{{ detailRecord.group }}</span>
            </div>
            <div class="detail-kv">
              <span class="detail-kv__label">型号</span>
              <span class="detail-kv__value">{{ detailRecord.model }}</span>
            </div>
            <div class="detail-kv">
              <span class="detail-kv__label">统计监控端口</span>
              <span class="detail-kv__value">{{ detailRecord.monitorPort }}</span>
            </div>
            <div class="detail-kv">
              <span class="detail-kv__label">KMIP管理端口</span>
              <span class="detail-kv__value">{{ detailRecord.kmipMgmtPort }}</span>
            </div>
          </div>
        </div>

        <div class="detail-block">
          <el-table :data="detailRecord.interfaces" class="detail-net-table" size="small">
            <el-table-column prop="id" label="网口标识" width="100" align="center" />
            <el-table-column label="IP地址" min-width="160">
              <template #default="{ row: iface }">
                <div class="detail-ip-cell">
                  <div>IPV4: {{ iface.ipV4 }}</div>
                  <div class="detail-ip-cell__v6">IPV6: {{ iface.ipV6 }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="子网掩码" min-width="140">
              <template #default="{ row: iface }">
                <div class="detail-ip-cell">
                  <div>IPV4: {{ iface.maskV4 }}</div>
                  <div class="detail-ip-cell__v6">IPV6: {{ iface.maskV6 }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="网关地址" min-width="140">
              <template #default="{ row: iface }">
                <div class="detail-ip-cell">
                  <div>IPV4: {{ iface.gwV4 }}</div>
                  <div class="detail-ip-cell__v6">IPV6: {{ iface.gwV6 }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="perfVisible"
      title="性能查看"
      width="560px"
      class="vsm-perf-dialog"
      append-to-body
      destroy-on-close
      align-center
      @closed="onPerfDialogClosed"
    >
      <div class="perf-body">
        <el-table :data="perfRows" size="small" class="perf-table" max-height="320" scrollbar-always-on>
          <el-table-column prop="item" label="密码运算项" min-width="160" />
          <el-table-column prop="tps" label="TPS" min-width="120"  />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="perfVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="migrateVisible"
      :title="migrateDialogTitle"
      width="700px"
      align-center
      destroy-on-close
      class="vsm-migrate-dialog"
      @closed="onMigrateDialogClosed"
    >
      <el-steps :active="migrateStep - 1" finish-status="finish" align-center class="migrate-steps">
        <el-step title="确认虚拟机信息" />
        <el-step title="选择虚拟机" />
        <el-step title="完成" />
      </el-steps>

      <div v-if="migrateStep === 1" class="migrate-step migrate-step--confirm">
        <h3 class="migrate-step-title">确认待迁移虚拟密码机信息</h3>
        <div v-if="migrateLoading" class="migrate-loading">
          <el-icon class="migrate-loading__icon is-loading"><Loading /></el-icon>
          <p class="migrate-loading__text">加载中...</p>
        </div>
        <template v-else-if="migrateDetail">
          <div class="migrate-kv-list">
            <div class="migrate-kv">
              <span class="migrate-kv__label">规格</span>
              <span class="migrate-kv__value">{{ formatMigrateSpecLine(migrateDetail.specText) }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">虚拟密码机名称</span>
              <span class="migrate-kv__value">{{ migrateDetail.name }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">序列号</span>
              <span class="migrate-kv__value">{{ migrateDetail.serial }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">虚拟机镜像</span>
              <span class="migrate-kv__value">{{ migrateDetail.imageLabel }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">版本</span>
              <span class="migrate-kv__value">{{ migrateDetail.version }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">状态</span>
              <span class="migrate-kv__value">
                <el-tag v-if="migrateDetail.status === 'normal'" type="success" size="small">正常</el-tag>
                <el-tag v-else type="info" size="small">--</el-tag>
              </span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">所属宿主机</span>
              <span class="migrate-kv__value">{{ migrateDetail.hostName }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">所属分组</span>
              <span class="migrate-kv__value">{{ migrateDetail.group }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">生产厂商</span>
              <span class="migrate-kv__value">{{ migrateDetail.manufacturer }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">型号</span>
              <span class="migrate-kv__value">{{ migrateDetail.model }}</span>
            </div>
          </div>
        </template>
      </div>

      <div v-else-if="migrateStep === 2" class="migrate-step migrate-step--pick">
        <h3 class="migrate-step-title">请选择目标虚拟机</h3>
        <el-form label-width="112px" class="migrate-pick-form">
          <el-form-item label="目标虚拟机" required>
            <div class="migrate-target-pick-row">
              <el-input
                readonly
                :model-value="migrateTargetDisplayLabel"
                placeholder="请点击右侧选择目标虚拟机"
                class="migrate-target-input"
              />
              <el-button class="migrate-target-suffix-btn" title="选择虚拟机" @click="openMigratePicker">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="分组名称">
            <el-select
              v-model="migrateGroupId"
              placeholder="请选择分组"
              filterable
              disabled
              class="migrate-pick-select"
            >
              <el-option v-for="opt in migrateGroupSelectOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="机构名称">
            <el-select
              v-model="migrateOrgId"
              placeholder="请选择机构"
              filterable
              :disabled="migrateOrgDisabled"
              class="migrate-pick-select"
            >
              <el-option v-for="opt in migrateOrgSelectOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
            </el-select>
            <p class="migrate-field-hint">提示：勾选“虚拟机自动上架”后才需要选择分组和机构，未勾选为非必填。</p>
          </el-form-item>
          <div v-if="migrateTargetVmId && !migrateTargetResourceOnShelf" class="migrate-shelf-tip-wrap">
            <p class="migrate-shelf-tip">系统未上架，无需选择密码资源分组</p>
          </div>
        </el-form>
      </div>

      <div v-else-if="migrateStep === 3" class="migrate-step migrate-step--done">
        <el-result icon="success" title="迁移已提交" :sub-title="migrateDoneSubtitle" />
      </div>

      <template #footer>
        <el-button @click="migrateVisible = false">取消</el-button>
        <template v-if="migrateStep === 1">
          <el-button
            type="primary"
            :loading="migrateLoading"
            :disabled="migrateLoading || !migrateDetail"
            @click="onMigrateStep1Next"
          >
            下一步
          </el-button>
        </template>
        <template v-else-if="migrateStep === 2">
          <el-button @click="migrateStep = 1">上一步</el-button>
          <el-button type="primary" @click="onMigrateStep2Next">下一步</el-button>
        </template>
        <template v-else-if="migrateStep === 3">
          <el-button @click="migrateStep = 2">上一步</el-button>
          <el-button type="primary" @click="migrateVisible = false">完成</el-button>
        </template>
      </template>
    </el-dialog>

    <el-dialog
      v-model="cloneVisible"
      :title="cloneDialogTitle"
      width="700px"
      align-center
      destroy-on-close
      class="vsm-clone-dialog"
      @closed="onCloneDialogClosed"
    >
      <el-steps :active="cloneStep - 1" finish-status="finish" align-center class="migrate-steps">
        <el-step title="确认虚拟机信息" />
        <el-step title="选择目标宿主机" />
        <el-step title="克隆虚拟机" />
        <el-step title="完成" />
      </el-steps>

      <div v-if="cloneStep === 1" class="migrate-step migrate-step--confirm">
        <h3 class="migrate-step-title">确认待克隆虚拟密码机信息</h3>
        <div v-if="cloneLoading" class="migrate-loading">
          <el-icon class="migrate-loading__icon is-loading"><Loading /></el-icon>
          <p class="migrate-loading__text">加载中...</p>
        </div>
        <template v-else-if="cloneDetail">
          <div class="migrate-kv-list">
            <div class="migrate-kv">
              <span class="migrate-kv__label">规格</span>
              <span class="migrate-kv__value">{{ formatMigrateSpecLine(cloneDetail.specText) }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">虚拟密码机名称</span>
              <span class="migrate-kv__value">{{ cloneDetail.name }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">序列号</span>
              <span class="migrate-kv__value">{{ cloneDetail.serial }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">虚拟机镜像</span>
              <span class="migrate-kv__value">{{ cloneDetail.imageLabel }}</span>
            </div>
            <div class="migrate-kv clone-kv-row--version">
              <span class="migrate-kv__label">版本</span>
              <span class="migrate-kv__value">{{ cloneDetail.version }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">状态</span>
              <span class="migrate-kv__value">
                <el-tag v-if="cloneDetail.status === 'normal'" type="success" size="small">正常</el-tag>
                <el-tag v-else type="info" size="small">--</el-tag>
              </span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">所属宿主机</span>
              <span class="migrate-kv__value">{{ cloneDetail.hostName }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">所属分组</span>
              <span class="migrate-kv__value">{{ cloneDetail.group }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">生产厂商</span>
              <span class="migrate-kv__value">{{ cloneDetail.manufacturer }}</span>
            </div>
            <div class="migrate-kv">
              <span class="migrate-kv__label">型号</span>
              <span class="migrate-kv__value">{{ cloneDetail.model }}</span>
            </div>
          </div>
        </template>
      </div>

      <div v-else-if="cloneStep === 2" class="migrate-step clone-step--host">
        <h3 class="migrate-step-title">请选择新虚拟机所在的宿主机</h3>
        <el-form label-width="112px" class="migrate-pick-form clone-host-pick-form">
          <el-form-item label="目标宿主机" required>
            <el-select
              v-model="cloneTargetHostId"
              placeholder="请选择目标宿主机"
              filterable
              class="migrate-pick-select"
            >
              <el-option
                v-for="h in CLONE_TARGET_HOSTS"
                :key="h.id"
                :label="formatCloneTargetHostLabel(h)"
                :value="h.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div v-else-if="cloneStep === 3" class="migrate-step clone-step--exec">
        <h3 class="migrate-step-title">填写新虚拟机信息</h3>
        <el-alert
          class="clone-step3-alert"
          type="info"
          :closable="false"
          show-icon
          title="克隆前请先新建分组并授权给指定机构"
        />
        <el-form label-width="112px" class="migrate-pick-form clone-step3-form">
          <el-form-item label="IP分配" required>
            <el-radio-group v-model="cloneIpMode" class="clone-ip-mode-group">
              <el-radio label="random">随机分配</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="IP池选择" required>
            <el-select
              v-model="cloneIpPoolId"
              placeholder="请选择IP池选择"
              filterable
              class="migrate-pick-select"
            >
              <el-option v-for="p in cloneIpPoolSelectOptions" :key="p.id" :label="p.label" :value="p.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="cloneIpMode === 'custom'" label="IP地址" required>
            <el-input v-model="cloneCustomIp" placeholder="请输入IP地址" clearable class="migrate-pick-select" />
          </el-form-item>
          <el-form-item label="选择分组">
            <div class="clone-group-field">
              <el-select
                v-model="cloneTargetGroupId"
                placeholder="请选择分组"
                filterable
                class="migrate-pick-select"
                :disabled="!cloneEmptyGroupOptions.length"
              >
                <el-option
                  v-for="g in cloneEmptyGroupOptions"
                  :key="g.id"
                  :label="formatCloneGroupOptionLabel(g)"
                  :value="g.id"
                />
              </el-select>
              <p v-if="!cloneEmptyGroupOptions.length" class="clone-group-empty-tip">
                提示：当前没有可作为克隆目标的空自定义分组，请先新建分组。
              </p>
              <el-button
                v-if="!cloneEmptyGroupOptions.length"
                type="primary"
                size="small"
                class="clone-new-group-btn"
                @click="openCloneAddGroupDialog"
              >
                新建分组
              </el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="cloneTargetGroupId" label="机构">
            <div v-if="cloneEnabledAuthOrgOptions.length" class="clone-org-field">
              <el-select
                v-model="cloneAuthOrgCode"
                placeholder="请选择机构"
                filterable
                class="migrate-pick-select"
              >
                <el-option
                  v-for="o in cloneEnabledAuthOrgOptions"
                  :key="o.orgCode"
                  :label="`${o.orgName}（${o.orgCode}）`"
                  :value="o.orgCode"
                />
              </el-select>
            </div>
            <div v-else class="clone-org-field">
              <el-alert
                type="warning"
                :closable="false"
                show-icon
                title="该分组尚未授权机构，请先完成授权后再继续克隆。"
                class="clone-step3-org-warn"
              />
              <el-button type="primary" size="small" class="clone-auth-open-btn" @click="openCloneAuthorizeDialog">
                授权机构
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div v-else-if="cloneStep === 4" class="migrate-step migrate-step--done">
        <el-result icon="success" title="克隆已提交" :sub-title="cloneDoneSubtitle" />
      </div>

      <template #footer>
        <el-button @click="cloneVisible = false">取消</el-button>
        <template v-if="cloneStep === 1">
          <el-button
            type="primary"
            :loading="cloneLoading"
            :disabled="cloneLoading || !cloneDetail"
            @click="onCloneStep1Next"
          >
            下一步
          </el-button>
        </template>
        <template v-else-if="cloneStep === 2">
          <el-button @click="cloneStep = 1">上一步</el-button>
          <el-button type="primary" :disabled="!cloneTargetHostId" @click="cloneStep = 3">下一步</el-button>
        </template>
        <template v-else-if="cloneStep === 3">
          <el-button @click="cloneStep = 2">上一步</el-button>
          <el-button type="primary" @click="onCloneStep3Next">下一步</el-button>
        </template>
        <template v-else-if="cloneStep === 4">
          <el-button @click="cloneStep = 3">上一步</el-button>
          <el-button type="primary" @click="cloneVisible = false">完成</el-button>
        </template>
      </template>
    </el-dialog>

    <el-dialog
      v-model="migratePickerVisible"
      title="选择虚拟机"
      width="1080px"
      append-to-body
      align-center
      destroy-on-close
      class="migrate-vm-picker-dialog"
      @closed="onMigratePickerClosed"
    >
      <div class="migrate-picker-toolbar">
        <el-form
          :inline="true"
          :model="migratePickerQuery"
          class="migrate-picker-filter"
          label-width="auto"
          @submit.prevent
        >
          <el-form-item label="虚拟密码机名称" class="migrate-picker-filter__item">
            <el-input
              v-model="migratePickerQuery.name"
              placeholder="请输入虚拟密码机名称"
              clearable
              class="migrate-picker-filter-input"
            />
          </el-form-item>
          <el-form-item label="IP地址" class="migrate-picker-filter__item">
            <el-input v-model="migratePickerQuery.ip" placeholder="请输入IP地址" clearable class="migrate-picker-filter-input" />
          </el-form-item>
          <el-form-item class="migrate-picker-filter__item migrate-picker-filter-actions">
            <el-button type="primary" @click="handleMigratePickerSearch">查询</el-button>
            <el-button @click="handleMigratePickerReset">重置</el-button>
          </el-form-item>
        </el-form>
        <p class="migrate-picker-meta">已选 {{ migratePickerSelectedCount }} 个虚拟机</p>
      </div>
      <div class="migrate-picker-table-host">
        <el-table
          :data="migratePickerPagedRows"
          class="vsm-table migrate-picker-table"
          row-key="id"
          stripe
          table-layout="fixed"
          max-height="420"
          scrollbar-always-on
          style="width: 100%"
        >
          <el-table-column fixed="left" width="52" align="center">
            <template #default="{ row }">
              <input
                type="radio"
                class="migrate-picker-native-radio"
                name="migrate-vm-picker-target"
                :checked="migratePickerTempId === row.id"
                :disabled="isMigratePickerRowDisabled(row)"
                @click.stop
                @change="onMigratePickerNativeRadioChange(row)"
              />
            </template>
          </el-table-column>
            <el-table-column fixed="left" label="序列号" width="200" class-name="col-wrap">
              <template #default="{ row }">
                <span class="cell-multiline">{{ row.serial }}</span>
              </template>
            </el-table-column>
          <el-table-column label="虚拟密码机名称" min-width="200" class-name="col-wrap">
            <template #default="{ row }">
              <span class="cell-multiline">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="IP地址" min-width="160" class-name="col-ip">
            <template #default="{ row }">
              <div class="ip-cell">
                <div class="ip-line">IPV4: {{ row.ipv4 || '--' }}</div>
                <div class="ip-line ip-line--v6">IPV6: {{ formatDash(row.ipv6) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="imageLabel" label="虚拟机镜像" min-width="140" show-overflow-tooltip />
          <el-table-column label="所属分组" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ getVmGroupLabel(row.id) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="88" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'normal'" type="success" size="small">正常</el-tag>
              <el-tag v-else type="info" size="small">--</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="hostName" label="所属宿主机" min-width="100" show-overflow-tooltip />
          <el-table-column prop="manufacturer" label="生产厂商" min-width="100" show-overflow-tooltip />
          <el-table-column prop="version" label="版本" width="88" align="center" />
        </el-table>
      </div>
      <div class="migrate-picker-pager-wrap">
        <el-pagination
          v-model:current-page="migratePickerPage"
          v-model:page-size="migratePickerPageSize"
          class="resource-pager migrate-picker-pager"
          :total="migratePickerFilteredRows.length"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, sizes"
        />
      </div>
      <template #footer>
        <el-button @click="migratePickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMigratePicker">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="cloneAddGroupVisible"
      title="新增设备分组"
      width="520px"
      append-to-body
      align-center
      destroy-on-close
      class="vsm-clone-add-group-dialog"
      @closed="resetCloneAddGroupForm"
    >
      <el-form
        ref="cloneAddGroupFormRef"
        class="device-group-create-form"
        :model="cloneAddGroupForm"
        :rules="cloneAddGroupRules"
        label-width="100px"
      >
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="cloneAddGroupForm.name" placeholder="请输入分组名称" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="厂商" prop="manufacturer">
          <el-select v-model="cloneAddGroupForm.manufacturer" placeholder="请选择厂商">
            <el-option v-for="o in MANUFACTURER_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="cloneAddGroupForm.deviceType" placeholder="请选择设备类型" disabled>
            <el-option v-for="o in DEVICE_TYPE_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cloneAddGroupVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCloneAddGroup">确定</el-button>
      </template>
    </el-dialog>

    <AddAuthorizedOrgDialog
      v-model="cloneAuthorizeDialogVisible"
      :group-id="cloneAuthorizeEmbedGroupId"
      @success="onCloneAuthEmbedUpdated"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, Loading, MoreFilled, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listCloneIpPoolSelectOptions } from '../../mock/ipPoolMock.js'
import {
  CLONE_TARGET_HOSTS,
  VIRTUAL_HSM_ROWS,
  formatCloneTargetHostLabel,
  getVirtualHsmDetail
} from '../../mock/virtualHsmMock.js'
import AddAuthorizedOrgDialog from '../../components/AddAuthorizedOrgDialog.vue'
import {
  addCustomGroup,
  DEVICE_TYPE_OPTIONS,
  findGroupById,
  groupHasEnabledAuthorizedOrg,
  listEmptyCustomGroupsForClone,
  listEnabledAuthorizedOrgsForGroup,
  MANUFACTURER_OPTIONS
} from '../../mock/cryptoDeviceResourceMock.js'
import {
  getVmGroupId,
  groupHasAtLeastOneControlVsm,
  isOrgAuthorizedAndManaged,
  isVmImportEligible,
  listAuthorizedOrgSelectOptions
} from '../../mock/importVmDialogScopeMock.js'

const router = useRouter()

const MORE_ACTIONS = [
  { command: 'start', label: '启动' },
  { command: 'stop', label: '停止' },
  { command: 'restart', label: '重启' },
  { command: 'upgrade', label: '升级' },
  { command: 'importImage', label: '导入影像' },
  { command: 'exportImage', label: '导出影像' },
  { command: 'clone', label: '克隆' },
  { command: 'migrate', label: '迁移' },
  { command: 'net', label: '配置网络' },
  { command: 'isolateToken', label: '隔离Token' },
  { command: 'reset', label: '重置' },
  { command: 'delete', label: '删除' },
  { command: 'opLog', label: '操作记录' }
]

const AUTO_SHELF_STORAGE_KEY = 'CHSM_AUTO_SHELF_ENABLED'

const query = reactive({ name: '', ip: '' })
const applied = reactive({ ...query })
const autoShelf = ref(readAutoShelfEnabled())
const tableRef = ref()
const selectedRows = ref([])
const rows = ref(VIRTUAL_HSM_ROWS.map((r) => ({ ...r })))
const page = ref(1)
const pageSize = ref(10)

function removeByIds(ids) {
  const set = new Set(ids)
  rows.value = rows.value.filter((r) => !set.has(r.id))
}

watch(pageSize, () => {
  page.value = 1
})

watch(autoShelf, (enabled) => {
  persistAutoShelfEnabled(enabled)
}, { immediate: true })

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.name = ''
  query.ip = ''
  Object.assign(applied, query)
  page.value = 1
}

function formatDash(val) {
  return val == null || val === '' ? '--' : val
}

function getVmGroupLabel(vmId) {
  const gid = getVmGroupId(vmId)
  if (!gid) return '--'
  return findGroupById(gid)?.name ?? '--'
}

function readAutoShelfEnabled() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(AUTO_SHELF_STORAGE_KEY) === '1'
}

function persistAutoShelfEnabled(enabled) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTO_SHELF_STORAGE_KEY, enabled ? '1' : '0')
}

/** 迁移确认页规格展示：与稿一致压缩空白 */
function formatMigrateSpecLine(text) {
  if (text == null || text === '') return '--'
  return String(text).replace(/\s+/g, ' ').trim()
}

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    if (applied.name && !row.name.includes(applied.name)) return false
    if (applied.ip) {
      const hit = (row.ipv4 && row.ipv4.includes(applied.ip)) || (row.ipv6 && row.ipv6.includes(applied.ip))
      if (!hit) return false
    }
    return true
  })
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch(filteredRows, (rows) => {
  const maxPage = Math.max(1, Math.ceil(rows.length / pageSize.value) || 1)
  if (page.value > maxPage) page.value = maxPage
})

function onSelectionChange(rows) {
  selectedRows.value = rows
}

function onAdd() {
  ElMessage.info('新增虚拟密码机为占位能力，后续接入接口。')
}

function onBatchDelete() {
  const rows = selectedRows.value
  if (!rows.length) {
    ElMessage.warning('请先勾选要删除的虚拟密码机。')
    return
  }
  ElMessageBox.confirm(`确定批量删除已选 ${rows.length} 台虚拟密码机吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      removeByIds(rows.map((r) => r.id))
      tableRef.value?.clearSelection?.()
      selectedRows.value = []
      ElMessage.success('已删除（原型数据）')
      page.value = 1
    })
    .catch(() => {})
}

const detailVisible = ref(false)
const detailRecord = ref(null)
const perfVisible = ref(false)
const perfRows = computed(() => detailRecord.value?.perfMetrics || [])

function onDetail(row) {
  detailRecord.value = getVirtualHsmDetail(row)
  detailVisible.value = true
}

function onDetailClosed() {
  detailRecord.value = null
  perfVisible.value = false
}

function openPerfDialog() {
  if (!detailRecord.value) return
  perfVisible.value = true
}

function onPerfDialogClosed() {
  perfVisible.value = false
}

function onEdit(row) {
  ElMessage.info(`编辑：${row.name}（占位）`)
}

const MORE_LABELS = Object.fromEntries(MORE_ACTIONS.map((a) => [a.command, a.label]))

/** 克隆向导第 1 步：与详情同源；所属分组按密码设备资源解析；规格与稿一致为 4GB 内存示例 */
function buildCloneConfirmDetail(row) {
  const d = getVirtualHsmDetail(row)
  const gid = getVmGroupId(row.id)
  const g = gid ? findGroupById(gid) : null
  return {
    ...d,
    group: g?.name ?? d.group,
    specText: 'CPU: 2核  内存: 4GB  带宽: 500Mbps'
  }
}

const cloneVisible = ref(false)
const cloneSourceRow = ref(null)
const cloneStep = ref(1)
const cloneLoading = ref(false)
const cloneDetail = ref(null)
const cloneTargetHostId = ref('')
const cloneIpMode = ref('random')
const cloneIpPoolId = ref('')
const cloneCustomIp = ref('')
const cloneTargetGroupId = ref('')
const cloneAuthOrgCode = ref('')
const cloneAuthorizeDialogVisible = ref(false)
const cloneAuthorizeEmbedGroupId = ref('')

const cloneIpPoolSelectOptions = computed(() => listCloneIpPoolSelectOptions())

const cloneEmptyGroupOptions = computed(() => listEmptyCustomGroupsForClone())

const cloneEnabledAuthOrgOptions = computed(() =>
  cloneTargetGroupId.value ? listEnabledAuthorizedOrgsForGroup(cloneTargetGroupId.value) : []
)

function formatCloneGroupOptionLabel(g) {
  if (!g) return ''
  const code = g.code != null && g.code !== '' ? g.code : '--'
  return `${g.name}（${code}）`
}

const cloneAddGroupVisible = ref(false)
const cloneAddGroupFormRef = ref()
const cloneAddGroupForm = reactive({
  name: '',
  manufacturer: '',
  deviceType: ''
})
const cloneAddGroupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请选择厂商', trigger: 'change' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
}

const cloneDialogTitle = computed(() => {
  const n = cloneSourceRow.value?.name ?? ''
  return n ? `克隆虚拟机(${n})` : '克隆虚拟机'
})

const cloneDoneSubtitle = computed(() => {
  const n = cloneSourceRow.value?.name ?? ''
  const g = cloneTargetGroupId.value ? findGroupById(cloneTargetGroupId.value) : null
  const gname = g?.name ?? ''
  const org = cloneEnabledAuthOrgOptions.value.find((o) => o.orgCode === cloneAuthOrgCode.value)
  const oname = org?.orgName ?? ''
  if (gname && oname) return `已提交克隆任务：${n}，目标分组「${gname}」，机构「${oname}」（原型）`
  if (gname) return `已提交克隆任务：${n}，目标分组「${gname}」（原型）`
  return `已提交克隆任务：${n}（原型）`
})

let cloneLoadTimer = null

function openClone(row) {
  cloneSourceRow.value = row
  cloneStep.value = 1
  cloneDetail.value = null
  cloneLoading.value = true
  cloneVisible.value = true
  if (cloneLoadTimer) clearTimeout(cloneLoadTimer)
  cloneLoadTimer = setTimeout(() => {
    cloneLoadTimer = null
    cloneDetail.value = buildCloneConfirmDetail(row)
    cloneLoading.value = false
  }, 650)
}

function onCloneDialogClosed() {
  if (cloneLoadTimer) {
    clearTimeout(cloneLoadTimer)
    cloneLoadTimer = null
  }
  cloneSourceRow.value = null
  cloneStep.value = 1
  cloneLoading.value = false
  cloneDetail.value = null
  cloneTargetHostId.value = ''
  resetCloneStep3Form()
}

function resetCloneStep3Form() {
  cloneIpMode.value = 'random'
  cloneIpPoolId.value = ''
  cloneCustomIp.value = ''
  cloneTargetGroupId.value = ''
  cloneAuthOrgCode.value = ''
  cloneAuthorizeDialogVisible.value = false
  cloneAuthorizeEmbedGroupId.value = ''
}

function syncCloneAuthOrgSelection() {
  const gid = cloneTargetGroupId.value
  if (!gid) return
  const opts = listEnabledAuthorizedOrgsForGroup(gid)
  if (opts.length === 1) {
    cloneAuthOrgCode.value = opts[0].orgCode
  } else if (!opts.some((o) => o.orgCode === cloneAuthOrgCode.value)) {
    cloneAuthOrgCode.value = ''
  }
}

watch(cloneTargetGroupId, (gid) => {
  cloneAuthOrgCode.value = ''
  if (!gid) return
  syncCloneAuthOrgSelection()
})

watch(cloneAuthorizeDialogVisible, (v) => {
  if (!v) cloneAuthorizeEmbedGroupId.value = ''
})

function openCloneAuthorizeDialog() {
  if (!cloneTargetGroupId.value) {
    ElMessage.warning('请先选择分组')
    return
  }
  cloneAuthorizeEmbedGroupId.value = cloneTargetGroupId.value
  cloneAuthorizeDialogVisible.value = true
}

function onCloneAuthEmbedUpdated() {
  syncCloneAuthOrgSelection()
}

function onCloneStep3Next() {
  if (!cloneIpPoolId.value) {
    ElMessage.warning('请选择IP池')
    return
  }
  if (cloneIpMode.value === 'custom') {
    const ip = cloneCustomIp.value.trim()
    if (!ip) {
      ElMessage.warning('请输入IP地址')
      return
    }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      ElMessage.warning('请输入合法的IPv4地址')
      return
    }
  }
  if (cloneTargetGroupId.value) {
    if (!groupHasEnabledAuthorizedOrg(cloneTargetGroupId.value)) {
      ElMessage.warning('所选分组尚未授权机构，请先点击「授权机构」完成授权或清空分组后继续')
      return
    }
    const orgOpts = listEnabledAuthorizedOrgsForGroup(cloneTargetGroupId.value)
    if (cloneAuthOrgCode.value && !orgOpts.some((o) => o.orgCode === cloneAuthOrgCode.value)) {
      ElMessage.warning('所选机构不在该分组可用机构列表中')
      return
    }
  }
  cloneStep.value = 4
}

/** 克隆源虚拟机 `imageLabel` 与密码设备分组「设备类型」选项对齐 */
function resolveCloneSourceDeviceType(row) {
  if (row?.imageLabel && DEVICE_TYPE_OPTIONS.some((o) => o.value === row.imageLabel)) {
    return row.imageLabel
  }
  return '云服务器密码机'
}

function openCloneAddGroupDialog() {
  cloneAddGroupForm.name = ''
  cloneAddGroupForm.manufacturer = ''
  cloneAddGroupForm.deviceType = resolveCloneSourceDeviceType(cloneSourceRow.value)
  cloneAddGroupVisible.value = true
  nextTick(() => cloneAddGroupFormRef.value?.clearValidate?.())
}

function resetCloneAddGroupForm() {
  cloneAddGroupForm.name = ''
  cloneAddGroupForm.manufacturer = ''
  cloneAddGroupForm.deviceType = ''
  cloneAddGroupFormRef.value?.clearValidate?.()
}

async function submitCloneAddGroup() {
  await cloneAddGroupFormRef.value?.validate?.()
  const row = addCustomGroup({ ...cloneAddGroupForm })
  cloneAddGroupVisible.value = false
  ElMessage.success('已新增分组（原型数据）')
  if (row?.id) {
    cloneTargetGroupId.value = row.id
    nextTick(() => {
      cloneAuthorizeEmbedGroupId.value = row.id
      cloneAuthorizeDialogVisible.value = true
    })
  }
}

function onCloneStep1Next() {
  if (!cloneDetail.value) return
  if (!cloneTargetHostId.value && CLONE_TARGET_HOSTS.length) {
    cloneTargetHostId.value = CLONE_TARGET_HOSTS[0].id
  }
  cloneStep.value = 2
}

const migrateVisible = ref(false)
const migrateSourceRow = ref(null)
const migrateStep = ref(1)
const migrateLoading = ref(false)
const migrateDetail = ref(null)
const migrateTargetVmId = ref('')
const migrateGroupId = ref('')
const migrateOrgId = ref('')

const migrateDialogTitle = computed(() => {
  const n = migrateSourceRow.value?.name ?? ''
  return n ? `迁移虚拟机(${n})` : '迁移虚拟机'
})

const selectedMigrateTargetVm = computed(
  () => VIRTUAL_HSM_ROWS.find((r) => r.id === migrateTargetVmId.value) ?? null
)

const migrateTargetResourceOnShelf = computed(() => {
  const row = selectedMigrateTargetVm.value
  if (!row) return false
  return row.resourceOnShelf !== false
})

const migrateNeedSelectScope = computed(() => autoShelf.value && migrateTargetResourceOnShelf.value)

const migrateTargetDisplayLabel = computed(() => {
  const r = selectedMigrateTargetVm.value
  if (!r) return ''
  return `${r.name} (IP: ${r.ipv4 || '—'})${r.resourceOnShelf === false ? '（未上架）' : ''}`
})

const migratePickerVisible = ref(false)
const migratePickerQuery = reactive({ name: '', ip: '' })
const migratePickerApplied = reactive({ name: '', ip: '' })
const migratePickerPage = ref(1)
const migratePickerPageSize = ref(10)
const migratePickerTempId = ref('')

const migratePickerAllRows = computed(() => {
  const sid = migrateSourceRow.value?.id
  return VIRTUAL_HSM_ROWS.filter((r) => r.id !== sid)
})

const migratePickerFilteredRows = computed(() => {
  return migratePickerAllRows.value.filter((row) => {
    if (migratePickerApplied.name && !row.name.includes(migratePickerApplied.name)) return false
    if (migratePickerApplied.ip) {
      const hit =
        (row.ipv4 && row.ipv4.includes(migratePickerApplied.ip)) ||
        (row.ipv6 && row.ipv6.includes(migratePickerApplied.ip))
      if (!hit) return false
    }
    return true
  })
})

const migratePickerPagedRows = computed(() => {
  const start = (migratePickerPage.value - 1) * migratePickerPageSize.value
  return migratePickerFilteredRows.value.slice(start, start + migratePickerPageSize.value)
})

const migratePickerSelectedCount = computed(() => (migratePickerTempId.value ? 1 : 0))

function isMigratePickerRowDisabled(row) {
  if (!row) return true
  if (row.hasCryptoData) return true
  if (!isVmImportEligible(row.id)) return true
  return false
}

function onMigratePickerNativeRadioChange(row) {
  if (isMigratePickerRowDisabled(row)) return
  migratePickerTempId.value = row.id
}

const migrateGroupSelectOptions = computed(() => {
  if (!migrateTargetVmId.value) return []
  const row = selectedMigrateTargetVm.value
  if (!row || row.resourceOnShelf === false) return []
  const gid = getVmGroupId(migrateTargetVmId.value)
  if (!gid || !groupHasAtLeastOneControlVsm(gid)) return []
  const g = findGroupById(gid)
  return g ? [{ id: g.id, label: g.name }] : []
})

const migrateOrgSelectOptions = computed(() => {
  if (!migrateGroupId.value) return []
  const row = selectedMigrateTargetVm.value
  if (row && row.resourceOnShelf === false) return []
  return listAuthorizedOrgSelectOptions(migrateGroupId.value)
})

const migrateOrgDisabled = computed(
  () =>
    !migrateTargetVmId.value ||
    !migrateTargetResourceOnShelf.value ||
    !migrateGroupId.value ||
    !migrateOrgSelectOptions.value.length
)

const migrateDoneSubtitle = computed(() => {
  const src = migrateSourceRow.value?.name ?? ''
  const vmLabel = migrateTargetDisplayLabel.value
  const grp = migrateGroupSelectOptions.value.find((o) => o.id === migrateGroupId.value)
  const org = migrateOrgSelectOptions.value.find((o) => o.id === migrateOrgId.value)
  if (selectedMigrateTargetVm.value && selectedMigrateTargetVm.value.resourceOnShelf === false) {
    return `已将「${src}」迁移至目标「${vmLabel}」（目标未上架，未选分组/机构）（原型）`
  }
  return `已将「${src}」迁移至「${vmLabel}」，分组「${grp?.label ?? ''}」，机构「${org?.label ?? ''}」（原型）`
})

function syncMigrateGroupFromTargetVm() {
  const row = selectedMigrateTargetVm.value
  if (!row || row.resourceOnShelf === false) {
    migrateGroupId.value = ''
    return
  }
  const gid = getVmGroupId(migrateTargetVmId.value)
  if (gid && groupHasAtLeastOneControlVsm(gid)) {
    migrateGroupId.value = gid
  } else {
    migrateGroupId.value = ''
  }
}

function syncMigrateOrgFromGroup() {
  const opts = migrateOrgSelectOptions.value
  if (!opts.some((o) => o.id === migrateOrgId.value)) {
    migrateOrgId.value = opts[0]?.id ?? ''
  }
}

function initMigrateStep2Selection() {
  migrateTargetVmId.value = ''
  migrateGroupId.value = ''
  migrateOrgId.value = ''
}

function handleMigratePickerSearch() {
  Object.assign(migratePickerApplied, migratePickerQuery)
  migratePickerPage.value = 1
}

function handleMigratePickerReset() {
  migratePickerQuery.name = ''
  migratePickerQuery.ip = ''
  Object.assign(migratePickerApplied, migratePickerQuery)
  migratePickerPage.value = 1
}

function openMigratePicker() {
  migratePickerQuery.name = ''
  migratePickerQuery.ip = ''
  Object.assign(migratePickerApplied, migratePickerQuery)
  migratePickerPage.value = 1
  migratePickerTempId.value = migrateTargetVmId.value
  const row = VIRTUAL_HSM_ROWS.find((r) => r.id === migratePickerTempId.value)
  if (!row || isMigratePickerRowDisabled(row)) migratePickerTempId.value = ''
  migratePickerVisible.value = true
}

function confirmMigratePicker() {
  if (!migratePickerTempId.value) {
    ElMessage.warning('请选择虚拟机')
    return
  }
  const row = VIRTUAL_HSM_ROWS.find((r) => r.id === migratePickerTempId.value)
  if (!row || isMigratePickerRowDisabled(row)) {
    ElMessage.warning('所选虚拟机不可作为迁移目标（含数据或未满足资源条件）')
    return
  }
  migrateTargetVmId.value = migratePickerTempId.value
  migratePickerVisible.value = false
}

function onMigratePickerClosed() {
  migratePickerQuery.name = ''
  migratePickerQuery.ip = ''
  Object.assign(migratePickerApplied, migratePickerQuery)
  migratePickerTempId.value = ''
  migratePickerPage.value = 1
}

watch(migrateTargetVmId, (id) => {
  if (!id) {
    migrateGroupId.value = ''
    migrateOrgId.value = ''
    return
  }
  syncMigrateGroupFromTargetVm()
  syncMigrateOrgFromGroup()
})

watch(migrateGroupId, () => {
  syncMigrateOrgFromGroup()
})

watch(migratePickerPageSize, () => {
  migratePickerPage.value = 1
})

watch(migratePickerFilteredRows, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / migratePickerPageSize.value) || 1)
  if (migratePickerPage.value > maxPage) migratePickerPage.value = maxPage
})

let migrateLoadTimer = null

function openMigrate(row) {
  migrateSourceRow.value = row
  migrateStep.value = 1
  migrateDetail.value = null
  migrateLoading.value = true
  migrateTargetVmId.value = ''
  migrateGroupId.value = ''
  migrateOrgId.value = ''
  migrateVisible.value = true
  if (migrateLoadTimer) clearTimeout(migrateLoadTimer)
  migrateLoadTimer = setTimeout(() => {
    migrateLoadTimer = null
    migrateDetail.value = getVirtualHsmDetail(row)
    migrateLoading.value = false
  }, 650)
}

function onMigrateDialogClosed() {
  if (migrateLoadTimer) {
    clearTimeout(migrateLoadTimer)
    migrateLoadTimer = null
  }
  migratePickerVisible.value = false
  migrateSourceRow.value = null
  migrateStep.value = 1
  migrateLoading.value = false
  migrateDetail.value = null
  migrateTargetVmId.value = ''
  migrateGroupId.value = ''
  migrateOrgId.value = ''
}

function onMigrateStep1Next() {
  if (!migrateDetail.value) return
  migrateStep.value = 2
  initMigrateStep2Selection()
}

function onMigrateStep2Next() {
  if (!migrateTargetVmId.value) {
    ElMessage.warning('请选择目标虚拟机')
    return
  }
  const sel = selectedMigrateTargetVm.value
  if (sel?.hasCryptoData) {
    ElMessage.warning('目标虚拟机含有数据，无法作为迁移目标')
    return
  }
  if (!isVmImportEligible(migrateTargetVmId.value)) {
    ElMessage.warning('所选目标虚拟机所属分组不满足「至少 1 台受控 VSM」条件')
    return
  }
  const tgt = selectedMigrateTargetVm.value
  if (!migrateNeedSelectScope.value || (tgt && tgt.resourceOnShelf === false)) {
    migrateStep.value = 3
    return
  }
  const scopeGid = getVmGroupId(migrateTargetVmId.value)
  if (migrateGroupId.value && migrateGroupId.value !== scopeGid) {
    ElMessage.warning('所选分组须与密码设备资源管理中该目标虚拟机 IP 所属分组一致')
    return
  }
  if (migrateGroupId.value && !groupHasAtLeastOneControlVsm(migrateGroupId.value)) {
    ElMessage.warning('该分组内无受控 VSM，无法提交')
    return
  }
  if (migrateOrgId.value && !isOrgAuthorizedAndManaged(scopeGid, migrateOrgId.value)) {
    ElMessage.warning('所选机构须为该分组已授权且在机构管理中为启用状态')
    return
  }
  migrateStep.value = 3
}

function onMoreCommand(cmd, row) {
  if (cmd === 'importImage') {
    router.push({ path: '/cloud-hsm/media', query: { tab: 'vm-image' } })
    return
  }
  if (cmd === 'migrate') {
    openMigrate(row)
    return
  }
  if (cmd === 'clone') {
    openClone(row)
    return
  }
  if (cmd === 'delete') {
    ElMessageBox.confirm(`确定删除虚拟密码机「${row.name}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
      .then(() => {
        removeByIds([row.id])
        ElMessage.success('已删除（原型数据）')
      })
      .catch(() => {})
    return
  }
  ElMessage.info(`${MORE_LABELS[cmd] || cmd}：${row.name}（占位）`)
}
</script>

<style scoped>
.page-container {
  background: var(--neutral-1);
  padding: 16px;
  min-height: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
  font-family: var(--font-family);
  color: var(--neutral-9);
  margin-bottom: 6px;
}

.crumb-segment {
  color: var(--neutral-10);
  font-weight: 500;
}

.crumb-leaf {
  color: var(--neutral-10);
  font-weight: 500;
}

.crumb-sep {
  font-size: 12px;
  color: var(--neutral-7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.slash {
  font-style: normal;
  line-height: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  color: var(--neutral-10);
  margin: 0 0 16px;
}

.content-module {
  background: var(--neutral-0);
  padding: 12px;
  box-shadow: var(--shadow-1);
}

.table-card {
  padding: 0;
}

.filter-card {
  margin-bottom: 12px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 16px;
  row-gap: 8px;
}

.filter-form :deep(.el-form-item) {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 0;
  margin-right: 0;
}

.filter-form :deep(.el-form-item__label) {
  float: none;
  height: 32px;
  line-height: 32px;
  padding: 0 8px 0 0;
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-form :deep(.el-form-item__content) {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-left: 0 !important;
  line-height: 32px;
}

.filter-input {
  width: 200px;
}

.filter-form__actions :deep(.el-form-item__content) {
  gap: 8px;
}

.btn-reset-outline {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--neutral-0);
}

.btn-reset-outline:hover {
  border-color: var(--el-color-primary-light-3);
  color: var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
}

.table-card__toolbar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.toolbar-row--check {
  gap: 6px;
}

.toolbar-row--btns {
  gap: 12px;
}

.toolbar-check {
  font-size: 12px;
}

.toolbar-help {
  color: var(--neutral-7);
  cursor: help;
  outline: none;
}

.toolbar-row--btns :deep(.el-button) {
  padding: 2px 16px;
  font-size: 12px;
}

.toolbar-row--btns :deep(.el-button.btn-batch-delete) {
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary);
  color: var(--el-color-primary);
}

.toolbar-row--btns :deep(.el-button.btn-batch-delete:hover),
.toolbar-row--btns :deep(.el-button.btn-batch-delete:focus-visible) {
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.table-card__sheet {
  width: 100%;
}

.vsm-table :deep(td.col-wrap .cell) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.45;
}

.cell-multiline {
  display: block;
  font-size: 12px;
  color: var(--neutral-10);
}

.vsm-table :deep(td.col-ip .cell) {
  white-space: normal;
  line-height: 1.45;
}

.ip-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.ip-line {
  font-size: 12px;
  color: var(--neutral-10);
}

.ip-line--v6 {
  color: var(--neutral-8);
}

/* 与 App.vue 中 `.el-table .el-button.is-link` 的 var(--brand-6) 一致，避免「更多操作」走 --el-color-primary 偏亮 */
.ops-row {
  --vsm-ops-color: var(--brand-6);
  --vsm-ops-hover: var(--brand-5);
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.ops-row :deep(.el-dropdown) {
  vertical-align: middle;
}

.ops-row :deep(.el-button.is-link) {
  color: var(--vsm-ops-color) !important;
}

.ops-row :deep(.el-button.is-link:hover) {
  color: var(--vsm-ops-hover) !important;
}

.ops-link {
  padding: 0;
  font-size: 12px;
  height: auto;
  min-height: 0;
  align-items: center;
}

.ops-more-trigger {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--vsm-ops-color);
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
}

.ops-more-trigger:hover {
  color: var(--vsm-ops-hover);
}

.ops-more-icon {
  color: inherit;
  font-size: 10px;
  align-items: center;
  justify-content: center;
  display: inline-flex;
}

.ops-more-trigger :deep(svg) {
  color: inherit;
}

.vsm-table {
  font-size: 12px;
  color: var(--neutral-10);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.vsm-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.vsm-table :deep(.el-table__border-left-patch),
.vsm-table :deep(.el-table__border-right-patch) {
  display: none;
}

.vsm-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-right: none !important;
  border-left: none !important;
  border-top: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.vsm-table :deep(tbody .el-table__cell) {
  background-color: #ffffff !important;
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.vsm-table :deep(tbody tr:hover > td.el-table__cell) {
  background-color: #ffffff !important;
}

.vsm-table :deep(.el-table__fixed-right::before) {
  background-color: transparent;
}

.vsm-table :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 12px -8px rgba(0, 0, 0, 0.06);
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 12px 1px 12px 0;
  background: var(--neutral-0);
}

.resource-pager {
  flex-wrap: wrap;
  row-gap: 8px;
  justify-content: flex-end;
  margin-right: 12px;
}

.resource-pager :deep(.el-pagination__total) {
  margin-right: 12px;
  color: var(--neutral-10);
}

.resource-pager :deep(.btn-prev),
.resource-pager :deep(.btn-next),
.resource-pager :deep(.el-pager li) {
  border-radius: 4px !important;
}

.resource-pager :deep(.el-pagination__sizes .el-select .el-input__wrapper),
.resource-pager :deep(.el-pagination__sizes .el-select__wrapper) {
  border-color: var(--brand-6) !important;
  border-radius: 4px !important;
}

.resource-pager :deep(.el-pagination__sizes .el-select:hover .el-input__wrapper),
.resource-pager :deep(.el-pagination__sizes .el-select:hover .el-select__wrapper) {
  border-color: var(--brand-5) !important;
}

/* —— 查看详情弹窗 —— */
.detail-body {
  --vsm-detail-progress-w: 360px;
  max-height: min(68vh, 600px);
  overflow-y: auto;
  font-size: 12px;
}

.detail-block {
  margin-bottom: 8px;
}

.detail-block:last-child {
  margin-bottom: 0;
}

.detail-block--kv {
  padding-bottom: 4px;
}

.detail-kv {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  column-gap: 8px;
  align-items: start;
  padding: 2px 0;
  line-height: 1.5;
}

.detail-kv--single {
  padding-top: 2px;
}

.detail-kv__label {
  color: var(--neutral-8);
  text-align: left;
  font-size: 12px;
}

.detail-kv__value {
  color: var(--neutral-10);
  word-break: break-all;
  font-size: 12px;
}

.detail-kv--progress {
  align-items: center;
  padding: 0;
}

.detail-kv--progress-mem {
  align-items: start;
}

.detail-kv--progress-mem .detail-progress-wrap {
  padding-top: 0;
}

.detail-kv--conn {
  align-items: center;
}

.detail-kv--perf-link {
  margin-top: -2px;
}

.detail-open-perf-btn {
  font-size: 12px;
  padding: 0;
  min-height: 0;
  height: auto;
  color: var(--brand-6) !important;
  background-color: transparent !important;
  --el-button-hover-bg-color: transparent;
  --el-button-active-bg-color: transparent;
  --el-button-focus-bg-color: transparent;
  border-color: transparent !important;
  box-shadow: none !important;
}

.detail-open-perf-btn:hover,
.detail-open-perf-btn:focus,
.detail-open-perf-btn:active {
  color: var(--brand-5) !important;
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

.detail-progress-wrap {
  max-width: var(--vsm-detail-progress-w, 360px);
  width: 100%;
  min-width: 200px;
}

.detail-progress-wrap :deep(.el-progress) {
  width: 100%;
}

.detail-progress-wrap :deep(.el-progress-bar__outer) {
  border-radius: 999px;
  overflow: hidden;
  background-color: var(--neutral-4);
}

.detail-progress-wrap :deep(.el-progress-bar__inner) {
  border-radius: 999px;
}

.detail-mem-foot {
  margin-top: 4px;
  font-size: 12px;
  color: var(--neutral-8);
}

.detail-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 18px;
  align-items: start;
}

.detail-col .detail-kv {
  padding: 3px 0;
}

.detail-status {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  line-height: 1.3;
}

.detail-status--ok {
  color: var(--success-7);
}

.detail-ip-cell {
  font-size: 12px;
  line-height: 1.4;
  color: var(--neutral-10);
}

.detail-ip-cell__v6 {
  color: var(--neutral-8);
  margin-top: 1px;
}

.detail-net-table {
  font-size: 12px;
  --el-table-border-color: var(--neutral-3);
}

.detail-net-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.detail-net-table :deep(thead .el-table__cell) {
  background-color: #f7f8fa !important;
  color: var(--neutral-10) !important;
  border-bottom: 1px solid var(--neutral-3) !important;
  border-left: none !important;
  border-right: none !important;
}

.detail-net-table :deep(tbody .el-table__cell) {
  border-bottom: 1px solid var(--neutral-3) !important;
  border-left: none !important;
  border-right: none !important;
}

/* —— 迁移虚拟机向导 —— */
.migrate-steps {
  margin: 20px 10px;
}

.migrate-steps-title {
  margin: 10px 10px;
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* 步骤条：实心蓝 + 白字为当前/已完成；浅灰描边 + 灰字为未开始；连线前段主色（finish-status=finish 避免绿勾） */
.migrate-steps :deep(.el-step__line) {
  background-color: var(--neutral-5);
  height: 2px;
  top: 14px;
}

.migrate-steps :deep(.el-step__line-inner) {
  border-color: var(--el-color-primary);
}

.migrate-steps :deep(.el-step__icon.is-text) {
  width: 28px;
  height: 28px;
  font-size: 14px;
  font-weight: 600;
  border-width: 2px;
  box-sizing: border-box;
}

.migrate-steps :deep(.el-step__head.is-wait .el-step__icon.is-text) {
  background: var(--neutral-0);
  border-color: var(--neutral-5);
  color: var(--neutral-6);
}

.migrate-steps :deep(.el-step__head.is-process .el-step__icon.is-text),
.migrate-steps :deep(.el-step__head.is-finish .el-step__icon.is-text) {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #fff;
}

.migrate-steps :deep(.el-step__main) {
  text-align: center;
}

.migrate-steps :deep(.el-step__title) {
  margin-top: 10px;
  font-size: 16px;
  line-height: 1.35;
  margin-left: auto;
  margin-right: auto;
  white-space: normal;
}

.migrate-steps :deep(.el-step__title.is-wait) {
  color: var(--neutral-6);
  font-weight: 400;
}

.migrate-steps :deep(.el-step__title.is-process),
.migrate-steps :deep(.el-step__title.is-finish) {
  color: var(--neutral-10);
  font-weight: 600;
}

.migrate-steps :deep(.el-step__description) {
  display: none;
}

.migrate-step-title {
  margin: 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-10);
  text-align: center;
}

.migrate-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 12px;
}

.migrate-loading__icon {
  font-size: 36px;
  color: var(--brand-6);
}

.migrate-loading__text {
  margin: 0;
  font-size: 14px;
  color: var(--neutral-8);
}

.migrate-kv-list {
  font-size: 12px;
}

.migrate-kv {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  column-gap: 8px;
  padding: 6px 0;
  line-height: 1.45;
  align-items: center;
}

.migrate-kv__label {
  color: var(--neutral-8);
  text-align: right;
}

.migrate-kv__value {
  color: var(--neutral-10);
  word-break: break-all;
}

.migrate-pick-form {
  max-width: 100%;
  margin: 20px;
  font-size: 12px;
  padding: 0 6px;
}

.migrate-pick-form :deep(.el-form-item__label) {
  font-size: 12px;
  line-height: 32px;
}

.migrate-pick-form :deep(.el-form-item__content) {
  font-size: 12px;
}

.migrate-pick-form :deep(.el-input__inner),
.migrate-pick-form :deep(.el-input__wrapper),
.migrate-pick-form :deep(.el-select__wrapper),
.migrate-pick-form :deep(.el-select__placeholder) {
  font-size: 12px;
}

.migrate-pick-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.migrate-pick-select {
  width: 100%;
}

.migrate-target-pick-row {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.migrate-target-input {
  flex: 1;
  min-width: 0;
}

.migrate-target-input :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.migrate-target-suffix-btn {
  padding: 0 12px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
  font-size: 12px;
}

.migrate-picker-toolbar {
  margin-bottom: 10px;
}

.migrate-picker-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 16px;
  row-gap: 8px;
  margin-bottom: 0;
}

.migrate-picker-filter :deep(.el-form-item) {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 0;
  margin-right: 0;
}

.migrate-picker-filter :deep(.el-form-item__label) {
  float: none;
  height: 32px;
  line-height: 32px;
  padding: 0 8px 0 0;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 12px;
}

.migrate-picker-filter :deep(.el-form-item__content) {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-left: 0 !important;
  line-height: 32px;
  font-size: 12px;
}

.migrate-picker-filter-actions :deep(.el-form-item__content) {
  gap: 8px;
  font-size: 12px;
}

.migrate-picker-filter-input {
  width: 200px;
  font-size: 12px;
}

.migrate-picker-meta {
  margin: 18px  0;
  font-size: 12px;
  color: var(--neutral-10);

}

.migrate-picker-table-host {
  width: 100%;
}

.migrate-picker-native-radio {
  width: 16px;
  height: 16px;
  margin: 0;
  vertical-align: middle;
  cursor: pointer;
  accent-color: var(--el-color-primary);
}

.migrate-picker-native-radio:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.migrate-picker-table {
  font-size: 12px;
  width: 100%;
}

/* 列表页为「去竖线」隐藏了 border-patch；有固定列时恢复显示，避免主表与固定区缝隙错位 */
.migrate-picker-table :deep(.el-table__border-left-patch),
.migrate-picker-table :deep(.el-table__border-right-patch) {
  display: block !important;
}

.migrate-picker-table :deep(.el-table__inner-wrapper) {
  min-width: 0;
}

.migrate-picker-table :deep(.el-scrollbar__bar.is-horizontal) {
  height: 8px;
  left: 2px;
  right: 2px;
}

.migrate-picker-table :deep(.el-scrollbar__bar.is-horizontal .el-scrollbar__thumb) {
  border-radius: 4px;
}

.migrate-picker-pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 10px 2px 0;
}

.migrate-picker-pager {
  margin-right: 0;
}

.migrate-shelf-tip-wrap {
  margin-top: -6px;
  margin-bottom: 4px;
}

.migrate-shelf-tip {
  margin: 0;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.5;
}

.migrate-field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--neutral-8);
}

.migrate-step--done :deep(.el-result) {
  padding: 8px 4px 4px;
}

.migrate-step--done :deep(.el-result__title) {
  font-size: 16px;
}

.migrate-step--done :deep(.el-result__subtitle) {
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.55;
}

.clone-kv-row--version {
  margin-left: -4px;
  margin-right: -4px;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 4px;
  background: transparent;
  transition: background-color 0.15s ease;
}

.clone-kv-row--version:hover {
  background: var(--el-color-primary-light-9);
}

.clone-step-placeholder {
  margin: 12px auto 0;
  max-width: 420px;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.55;
  text-align: center;
}

.clone-step3-alert {
  margin: 0 20px 12px;
  box-sizing: border-box;
}

.clone-step3-alert :deep(.el-alert__title) {
  font-size: 12px;
  line-height: 1.5;
}

.clone-step3-form {
  margin-top: 0;
}

.clone-group-field {
  width: 100%;
}

.clone-group-empty-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.45;
}

.clone-new-group-btn {
  margin-top: 10px;
  font-size: 12px;
}

.clone-org-field {
  width: 100%;
}

.clone-step3-org-warn {
  margin-bottom: 10px;
}

.clone-step3-org-warn :deep(.el-alert__title) {
  font-size: 12px;
  line-height: 1.45;
}

.clone-auth-open-btn {
  font-size: 12px;
}

.clone-ip-mode-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.clone-step3-form .migrate-pick-select :deep(.el-input__wrapper) {
  width: 100%;
}
</style>

<style>
/* 下拉挂载在 body，需非 scoped */
.vsm-more-dropdown .el-dropdown-menu {
  min-width: 132px;
}

.vsm-more-dropdown .el-dropdown-menu__item {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--el-color-primary);
}

.vsm-more-dropdown .el-dropdown-menu__item:not(.is-disabled):hover {
  color: var(--el-color-primary-light-3);
  background-color: var(--el-color-primary-light-9);
}

.vsm-detail-dialog .el-dialog__header {
  margin-right: 0;
  padding: 12px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-3);
}

.vsm-detail-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 500;
  color: var(--neutral-10);
}

.vsm-detail-dialog .el-dialog__body {
  padding: 12px 14px 8px;
}

.vsm-detail-dialog .el-dialog__footer {
  padding: 9px 14px 10px;
  border-top: 1px solid var(--neutral-3);
}

.vsm-clone-add-group-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.vsm-clone-add-group-dialog .el-dialog__header {
  margin: 0;
  padding: 10px 48px 10px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-4);
  box-sizing: border-box;
}

.vsm-clone-add-group-dialog .el-dialog__headerbtn {
  top: 6px;
  right: 8px;
  width: 40px;
  height: 40px;
}

.vsm-clone-add-group-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--neutral-10);
}

.vsm-clone-add-group-dialog .el-dialog__body {
  padding: 10px 14px 8px;
}

.vsm-clone-add-group-dialog .el-dialog__footer {
  padding: 8px 14px 12px;
  border-top: 1px solid var(--neutral-4);
}

.vsm-clone-add-group-dialog .device-group-create-form .el-input,
.vsm-clone-add-group-dialog .device-group-create-form .el-select {
  width: 100%;
  max-width: 100%;
}

.vsm-clone-add-group-dialog .device-group-create-form .el-form-item__label,
.vsm-clone-add-group-dialog .device-group-create-form .el-input__inner,
.vsm-clone-add-group-dialog .device-group-create-form .el-select__placeholder,
.vsm-clone-add-group-dialog .device-group-create-form .el-select__selected-item {
  font-size: 12px;
}

/* 根节点默认带 var(--el-dialog-padding-primary)，会在标题四周留出大块空白 */
.vsm-migrate-dialog.el-dialog,
.vsm-clone-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.vsm-migrate-dialog .el-dialog__header,
.vsm-clone-dialog .el-dialog__header {
  margin: 0;
  padding: 10px 48px 10px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-4);
  box-sizing: border-box;
}

.vsm-migrate-dialog .el-dialog__headerbtn,
.vsm-clone-dialog .el-dialog__headerbtn {
  top: 6px;
  right: 8px;
  width: 40px;
  height: 40px;
}

.vsm-migrate-dialog .el-dialog__title,
.vsm-clone-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--neutral-10);
  line-height: 1.35;
  padding-right: 0;
}

.vsm-migrate-dialog .el-dialog__body,
.vsm-clone-dialog .el-dialog__body {
  padding: 10px 14px 8px;
  min-height: 0;
}

.vsm-migrate-dialog .el-dialog__footer,
.vsm-clone-dialog .el-dialog__footer {
  padding: 8px 14px 12px;
  border-top: 1px solid var(--neutral-4);
}

.migrate-vm-picker-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.migrate-vm-picker-dialog .el-dialog__header {
  margin: 0;
  padding: 10px 48px 10px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-4);
  box-sizing: border-box;
}

.migrate-vm-picker-dialog .el-dialog__headerbtn {
  top: 6px;
  right: 8px;
  width: 40px;
  height: 40px;
}

.migrate-vm-picker-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--neutral-10);
}

.migrate-vm-picker-dialog .el-dialog__body {
  padding: 12px 14px 4px;
  max-height: min(72vh, 640px);
  /* 勿让 body 横向滚动，否则整块表平移导致固定列「跟着动」、表头与表体错位 */
  overflow-x: hidden;
  overflow-y: auto;
}

.migrate-vm-picker-dialog .el-dialog__footer {
  padding: 8px 14px 12px;
  border-top: 1px solid var(--neutral-4);
}

.vsm-perf-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.vsm-perf-dialog .el-dialog__header {
  margin: 0;
  padding: 10px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-3);
}

.vsm-perf-dialog .el-dialog__body {
  padding: 12px 14px 8px;
  max-height: 380px;
  overflow-y: scroll;
}

.vsm-perf-dialog .el-dialog__footer {
  padding: 8px 14px 12px;
  border-top: 1px solid var(--neutral-3);
}

.perf-table {
  font-size: 12px;
}

.vsm-perf-dialog .perf-table .el-table__header th.el-table__cell {
  background: var(--neutral-2);
}
</style>
