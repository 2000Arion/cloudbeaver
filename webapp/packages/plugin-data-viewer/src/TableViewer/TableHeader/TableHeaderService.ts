/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import React from 'react';

import { PlaceholderContainer } from '@cloudbeaver/core-blocks';
import { Bootstrap, injectable } from '@cloudbeaver/core-di';
import { ActionService, DATA_CONTEXT_MENU, MenuService } from '@cloudbeaver/core-view';

import { DATA_VIEWER_CONSTRAINTS_DELETE_ACTION } from '../../DatabaseDataModel/Actions/ResultSet/Actions/DATA_VIEWER_CONSTRAINTS_DELETE_ACTION';
import { ResultSetConstraintAction } from '../../DatabaseDataModel/Actions/ResultSet/ResultSetConstraintAction';
import { DATA_CONTEXT_DV_DDM } from '../../DatabaseDataModel/DataContext/DATA_CONTEXT_DV_DDM';
import { DATA_CONTEXT_DV_DDM_RESULT_INDEX } from '../../DatabaseDataModel/DataContext/DATA_CONTEXT_DV_DDM_RESULT_INDEX';
import type { IDatabaseDataModel } from '../../DatabaseDataModel/IDatabaseDataModel';
import { DATA_VIEWER_DATA_MODEL_TOOLS_MENU } from './DATA_VIEWER_DATA_MODEL_TOOLS_MENU';

export const TableWhereFilter = React.lazy(async () => {
  const { TableWhereFilter } = await import('./TableWhereFilter');
  return { default: TableWhereFilter };
});
export const TableHeaderMenu = React.lazy(async () => {
  const { TableHeaderMenu } = await import('./TableHeaderMenu');
  return { default: TableHeaderMenu };
});

export interface ITableHeaderPlaceholderProps {
  model: IDatabaseDataModel<any, any>;
  resultIndex: number;
  simple: boolean;
}

@injectable()
export class TableHeaderService extends Bootstrap {
  readonly tableHeaderPlaceholder = new PlaceholderContainer<ITableHeaderPlaceholderProps>();

  constructor(
    private readonly menuService: MenuService,
    private readonly actionService: ActionService,
  ) {
    super();
  }

  register(): void {
    this.tableHeaderPlaceholder.add(TableWhereFilter, 1);
    this.tableHeaderPlaceholder.add(TableHeaderMenu, 2);

    this.actionService.addHandler({
      id: 'table-header-menu-base-handler',
      isActionApplicable(context) {
        const menu = context.hasValue(DATA_CONTEXT_MENU, DATA_VIEWER_DATA_MODEL_TOOLS_MENU);
        const model = context.tryGet(DATA_CONTEXT_DV_DDM);
        const resultIndex = context.tryGet(DATA_CONTEXT_DV_DDM_RESULT_INDEX);

        if (!menu || !model || resultIndex === undefined) {
          return false;
        }

        return true;
      },
      handler: async (context, action) => {
        switch (action) {
          case DATA_VIEWER_CONSTRAINTS_DELETE_ACTION: {
            const model = context.get(DATA_CONTEXT_DV_DDM);
            const resultIndex = context.get(DATA_CONTEXT_DV_DDM_RESULT_INDEX);
            const constraints = model.source.tryGetAction(resultIndex, ResultSetConstraintAction);

            if (constraints) {
              constraints.deleteData();
              await model.request();
            }
            break;
          }
        }
      },
      getActionInfo: (context, action) => {
        if (context.get(DATA_CONTEXT_MENU) === DATA_VIEWER_DATA_MODEL_TOOLS_MENU) {
          return { ...action.info, label: '' };
        }

        return action.info;
      },
      isDisabled: (context, action) => {
        const model = context.get(DATA_CONTEXT_DV_DDM);
        const resultIndex = context.get(DATA_CONTEXT_DV_DDM_RESULT_INDEX);

        if (model.isLoading() || model.isDisabled(resultIndex)) {
          return true;
        }

        if (action === DATA_VIEWER_CONSTRAINTS_DELETE_ACTION) {
          const constraints = model.source.tryGetAction(resultIndex, ResultSetConstraintAction);

          if (model.source.options?.whereFilter) {
            return false;
          }

          if (constraints) {
            return constraints.filterConstraints.length === 0 && constraints.orderConstraints.length === 0;
          }
        }

        return true;
      },
    });

    this.menuService.addCreator({
      menus: [DATA_VIEWER_DATA_MODEL_TOOLS_MENU],
      getItems: (context, items) => [...items, DATA_VIEWER_CONSTRAINTS_DELETE_ACTION],
    });
  }
}
