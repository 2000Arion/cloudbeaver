/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { RowRendererProps } from 'react-data-grid';
import { Row } from 'react-data-grid';

import { CellRenderer } from '../CellRenderer/CellRenderer';

export const RowRenderer: React.FC<RowRendererProps<any>> = function RowRenderer(props) {
  return (
    <Row cellRenderer={CellRenderer} {...props} />
  );
};
