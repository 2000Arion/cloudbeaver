/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observable, makeObservable } from 'mobx';

import type { ResultDataFormat } from '@cloudbeaver/core-sdk';
import { uuid } from '@cloudbeaver/core-utils';

import { DatabaseDataAccessMode, IDatabaseDataModel } from './IDatabaseDataModel';
import type { IDatabaseDataResult } from './IDatabaseDataResult';
import type { IDatabaseDataSource, IRequestInfo } from './IDatabaseDataSource';

export class DatabaseDataModel<TOptions, TResult extends IDatabaseDataResult = IDatabaseDataResult>
implements IDatabaseDataModel<TOptions, TResult> {
  id: string;
  results: TResult[];
  source: IDatabaseDataSource<TOptions, TResult>;
  access: DatabaseDataAccessMode;
  countGain: number;

  get requestInfo(): IRequestInfo {
    return this.source.requestInfo;
  }

  get supportedDataFormats(): ResultDataFormat[] {
    return this.source.supportedDataFormats;
  }

  constructor(source: IDatabaseDataSource<TOptions, TResult>) {
    makeObservable(this, {
      results: observable,
      access: observable,
      countGain: observable,
    });

    this.id = uuid();
    this.source = source;
    this.countGain = 0;
    this.results = [];
    this.access = DatabaseDataAccessMode.Default;
  }

  isLoading(): boolean {
    return this.source.isLoading();
  }

  isDataAvailable(offset: number, count: number): boolean {
    return this.source.offset <= offset && this.source.count >= count;
  }

  async refresh(): Promise<void> {
    await this.requestData();
  }

  async reload(): Promise<void> {
    this.setSlice(0, this.countGain);
    await this.requestData();
  }

  setResults(results: TResult[]): this {
    this.results = results;
    return this;
  }

  setCountGain(count: number): this {
    this.countGain = count;
    return this;
  }

  getResult(index: number): TResult | null {
    if (this.results.length > index) {
      return this.results[index];
    }

    return null;
  }

  setAccess(access: DatabaseDataAccessMode): this {
    this.access = access;
    return this;
  }

  setSlice(offset: number, count = this.countGain): this {
    this.source.setSlice(offset, count);
    return this;
  }

  setDataFormat(dataFormat: ResultDataFormat): this {
    this.source.setDataFormat(dataFormat);
    return this;
  }

  setSupportedDataFormats(dataFormats: ResultDataFormat[]): this {
    this.source.setSupportedDataFormats(dataFormats);
    return this;
  }

  setOptions(options: TOptions): this {
    this.source.setOptions(options);
    return this;
  }

  async requestDataPortion(offset: number, count: number): Promise<void> {
    if (!this.isDataAvailable(offset, count)) {
      this.source.setSlice(offset, count);
      this.results = await this.source.requestData(this.results);
    }
  }

  async requestData(): Promise<void> {
    this.results = await this.source.requestData(this.results);
  }
}
