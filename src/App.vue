<template>
  <router-view />
</template>

<script setup></script>

<style>
:root {
  --brand-1: #eff3fc;
  --brand-2: #1764e8;
  --brand-3: #91c2fa;
  --brand-4: #409eff;
  --brand-5: #3a7de0;
  --brand-6: #155bd4;
  --brand-7: #0940ad;
  --brand-8: #f1f2f6;

  --success-1: #e4f2e4;
  --success-6: #30b346;
  --success-7: #1f8c35;
  --warning-1: #fdf0e7;
  --warning-6: #ed6a0c;
  --warning-7: #c74c00;
  --error-1: #fbe5e5;
  --error-6: #d40000;
  --error-7: #bf0000;

  --neutral-0: #ffffff;
  --neutral-1: #f2f3f5;
  --neutral-2: #fafbfc;
  --neutral-3: #f2f3f5;
  --neutral-4: #dcdfe6;
  --neutral-5: #dcdfe6;
  --neutral-6: #c0c4cc;
  --neutral-7: #c8c9cc;
  --neutral-8: #969799;
  --neutral-9: #646566;
  --neutral-10: #323233;
  --neutral-11: #0e1d37;
  --neutral-11-60: rgba(10, 33, 64, 0.6);

  --shadow-1: 0 1px 4px rgba(0, 0, 0, 0.05);
  --shadow-2: 0 0 16px rgba(100, 110, 144, 0.2);
  --shadow-3: 0 0 40px rgba(0, 0, 0, 0.1);

  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

body {
  font-family: var(--font-family);
  font-size: 12px;
  line-height: 1.5;
  color: var(--neutral-9);
  background: var(--neutral-2);
}

.content-module {
  /* border-radius: 8px; */
}

.el-button {
  border-radius: 0 !important;
}

.el-button--primary {
  background-color: var(--brand-6) !important;
  border-color: var(--brand-6) !important;
}

.el-button--primary:hover {
  background-color: var(--brand-5) !important;
  border-color: var(--brand-5) !important;
}

.el-form-item .el-input,
.el-form-item .el-select {
  width: 200px;
}

.el-input__wrapper,
.el-select .el-input__wrapper {
  border-radius: 0 !important;
}

.el-form-item__label {
  font-family: Arial, Helvetica, sans-serif !important;
  width: 90px;
  text-align: left;
  padding-right: 12px;
}

.el-table {
  font-family: Arial, sans-serif !important;
  font-size: 12px !important;
}

.el-table td,
.el-table th {
  font-family: Arial, sans-serif !important;
  font-size: 12px !important;
}

.el-table th {
  color: var(--neutral-10) !important;
  font-weight: 500 !important;
}

.el-table td {
  color: var(--neutral-9) !important;
}

.el-table .el-tag {
  font-size: 12px !important;
}

.el-table .el-button {
  font-size: 12px !important;
}

.el-table .el-button.is-link {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  height: auto !important;
  color: var(--brand-6) !important;
}

.el-table .el-button.is-link:hover {
  background-color: transparent !important;
  color: var(--brand-6) !important;
}

.el-switch.is-checked .el-switch__core {
  background-color: var(--brand-6) !important;
  border-color: var(--brand-6) !important;
}

.el-radio__input.is-checked .el-radio__inner {
  background-color: var(--brand-6) !important;
  border-color: var(--brand-6) !important;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: var(--brand-6) !important;
  border-color: var(--brand-6) !important;
}

.el-tabs__item {
  font-size: 14px !important;
}

.el-tabs__item:hover {
  color: var(--brand-6) !important;
}

.el-tabs__item.is-active {
  color: var(--brand-6) !important;
  font-weight: 500 !important;
}

.el-tabs__active-bar {
  background-color: var(--brand-6) !important;
  height: 3px !important;
}

.el-tabs__nav-wrap::after {
  height: 1px !important;
  background-color: var(--neutral-4) !important;
}

.el-link {
  color: var(--brand-6);
}

.el-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 0;
}

.el-pagination .el-pager li,
.el-pagination .btn-prev,
.el-pagination .btn-next {
  min-width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--neutral-5);
  background: var(--neutral-0);
  border-radius: 0 !important;
  font-size: 12px;
  color: var(--neutral-9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.el-pagination .el-pager li + li,
.el-pagination .btn-prev + .el-pager,
.el-pagination .el-pager + .btn-next {
  margin-left: 8px;
}

.el-pagination .el-pager li:hover,
.el-pagination .btn-prev:hover:not(:disabled),
.el-pagination .btn-next:hover:not(:disabled) {
  color: var(--brand-6);
  border-color: var(--brand-6);
}

.el-pagination .el-pager li.is-active {
  background: var(--brand-6);
  color: var(--neutral-0);
  border-color: var(--brand-6);
}

.el-pagination .btn-prev:disabled,
.el-pagination .btn-next:disabled {
  color: var(--neutral-7);
  border-color: var(--neutral-5);
  background: var(--neutral-0);
  cursor: not-allowed;
}

.el-pagination .el-pagination__total {
  font-size: 12px;
  color: var(--neutral-9);
  margin-right: 8px;
}

.el-pagination .el-pagination__sizes {
  margin-right: 8px;
}

.el-pagination .el-pagination__sizes .el-select {
  width: auto;
}

.el-pagination .el-pagination__sizes .el-input__wrapper {
  border-radius: 0 !important;
  border: 1px solid var(--neutral-5);
  height: 24px;
}

.el-pagination .el-pagination__jump {
  margin-left: 8px;
  font-size: 12px;
  color: var(--neutral-9);
}

.el-pagination .el-pagination__jump .el-input {
  width: 50px;
  margin: 0 8px;
}

.el-pagination .el-pagination__jump .el-input__wrapper {
  border-radius: 0 !important;
  border: 1px solid var(--neutral-5);
  height: 24px;
}

.el-pagination .el-pagination__jump .el-input__inner {
  height: 24px;
  font-size: 12px;
}

.el-pagination .el-pagination__sizes .el-input__inner {
  height: 24px;
  font-size: 12px;
}

.el-pagination .el-select__wrapper {
  height: 24px;
  min-height: 24px;
}

.el-pagination .pagination-custom-total {
  font-size: 12px;
  color: var(--neutral-9);
  margin-right: 8px;
}
</style>
