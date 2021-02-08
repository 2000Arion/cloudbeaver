/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { css } from 'reshadow';

import { composes } from '@cloudbeaver/core-theming';

export const UNDERLINE_TAB_STYLES = composes(
  css`
    Tab {
      composes: theme-border-color-primary from global;
    }
  `,
  css`
    TabList {
      display: flex;
      & tab-outer:not(:last-child) {
        margin-right: 16px;
      }
    }
    Tab {
      composes: theme-typography--body2 from global;
      background: none;
      color: inherit;
      border: none;
      border-bottom: 2px solid;
      outline: none;
      opacity: 1;
      height: 30px !important;
      padding: 0 5px !important;
      border-top: none !important;
      font-weight: normal !important;
      &:global([aria-selected="false"]) {
        opacity: 0.8;
        border-bottom: 2px solid transparent !important;
      }
      &:hover {
        cursor: pointer;
        opacity: 1;
      }
    }
`);
