/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observable, makeObservable, action } from 'mobx';

import { Dependency } from '@cloudbeaver/core-di';
import { Executor, ExecutorInterrupter, IExecutor, IExecutorHandler, ISyncExecutor, SyncExecutor, TaskScheduler } from '@cloudbeaver/core-executor';
import { MetadataMap } from '@cloudbeaver/core-utils';

export interface ICachedResourceMetadata {
  outdated: boolean;
  loading: boolean;
  exception: Error | null;
}

export interface IDataError<TParam> {
  param: TParam;
  exception: Error;
}

export interface IParamAlias<TParam> {
  param: TParam;
  getAlias: (param: TParam) => TParam;
}

export type CachedResourceData<
  TResource extends CachedResource<any, any, any, any>
> = TResource extends CachedResource<infer T, any, any> ? T : never;

export type CachedResourceParam<
  TResource extends CachedResource<any, any, any, any>
> = TResource extends CachedResource<any, infer T, any> ? T : never;

export type CachedResourceKey<
  TResource extends CachedResource<any, any, any, any>
> = TResource extends CachedResource<any, any, infer T> ? T : never;

export abstract class CachedResource<
  TData,
  TParam,
  TKey = TParam,
  TContext = void
> extends Dependency {
  data: TData;

  readonly onDataOutdated: ISyncExecutor<TParam>;
  readonly onDataUpdate: ISyncExecutor<TParam>;
  readonly onDataError: ISyncExecutor<IDataError<TParam>>;
  readonly beforeLoad: IExecutor<TParam>;

  protected metadata: MetadataMap<TKey, ICachedResourceMetadata>;
  protected loadedKeys: TParam[];

  protected get loading(): boolean {
    return this.scheduler.executing;
  }

  protected scheduler: TaskScheduler<TParam>;
  protected paramAliases: Array<IParamAlias<TParam>>;
  protected logActivity: boolean;

  constructor(defaultValue: TData) {
    super();

    this.lock = this.lock.bind(this);
    this.includes = this.includes.bind(this);
    this.loadingTask = this.loadingTask.bind(this);

    this.logActivity = false;
    this.loadedKeys = [];

    this.paramAliases = [];
    this.metadata = new MetadataMap(() => (observable({
      outdated: true,
      loading: false,
      exception: null,
    }, undefined, { deep: false })));
    this.scheduler = new TaskScheduler(this.lock);
    this.data = defaultValue;
    this.beforeLoad = new Executor(null, this.lock);
    this.onDataOutdated = new SyncExecutor<TParam>(null);
    this.onDataUpdate = new SyncExecutor<TParam>(null);
    this.onDataError = new SyncExecutor<IDataError<TParam>>(null);

    if (this.logActivity) {
      // this.spy(this.beforeLoad, 'beforeLoad');
      // this.spy(this.onDataOutdated, 'onDataOutdated');
      this.spy(this.onDataUpdate, 'onDataUpdate');
      this.spy(this.onDataError, 'onDataError');
    }

    makeObservable<CachedResource<TData, TParam, TKey, TContext>, 'loader' | 'loadedKeys'>(this, {
      loadedKeys: observable,
      data: observable,
      loader: action,
      markDataLoading: action,
      markDataLoaded: action,
      markDataError: action,
      markOutdated: action,
      markUpdated: action,
    });
  }

  sync(
    resource: CachedResource<any, TParam, TParam, void>,
    context: TContext
  ): void {
    resource.outdateResource(this);

    if (this.logActivity) {
      // resource.onDataUpdate.addHandler(resource.logLock('onDataUpdate > ' + this.getName()));
    }

    // resource.onDataUpdate.addHandler(param => { this.load(param, context); });

    if (this.logActivity) {
      // resource.onDataUpdate.addHandler(resource.logLock('onDataUpdate < ' + this.getName()));
    }

    this.preloadResource(resource);
  }

  updateResource<T = TParam>(resource: CachedResource<any, T, any, any>, map?: (param: TParam) => T): this {
    this.onDataUpdate.addHandler(param => {
      try {
        if (this.logActivity) {
          console.group(this.getActionPrefixedName(' update - ' + resource.getName()));
        }

        if (map) {
          param = map(param) as any as TParam;
        }

        resource.markUpdated(param as any as T);
      } finally {
        if (this.logActivity) {
          console.groupEnd();
        }
      }
    });

    return this;
  }

  outdateResource<T = TParam>(resource: CachedResource<any, T, any, any>, map?: (param: TParam) => T): this {
    this.onDataOutdated.addHandler(param => {
      try {
        if (this.logActivity) {
          console.group(this.getActionPrefixedName(' outdate - ' + resource.getName()));
        }

        if (map) {
          param = map(param) as any as TParam;
        }

        resource.markOutdated(param as any as T);
      } finally {
        if (this.logActivity) {
          console.groupEnd();
        }
      }
    });

    return this;
  }

  preloadResource<T = TParam>(resource: CachedResource<any, T, any, any>, map?: (param: TParam) => T): this {
    this.beforeLoad.addHandler(async param => {
      try {
        if (this.logActivity) {
          console.group(this.getActionPrefixedName(' preload - ' + resource.getName()));
        }

        if (map) {
          param = map(param) as any as TParam;
        }

        await resource.load(param as any as T, undefined);
      } finally {
        if (this.logActivity) {
          console.groupEnd();
        }
      }
    });

    return this;
  }

  before(handler: IExecutorHandler<TParam, any>): this {
    this.beforeLoad.addHandler(async (param, contexts) => {
      try {
        if (this.logActivity) {
          console.group(this.getActionPrefixedName(' preload - ' + handler.name));
        }

        await handler(param, contexts);
      } finally {
        if (this.logActivity) {
          console.groupEnd();
        }
      }
    });

    return this;
  }

  abstract isLoaded(param: TParam, context: TContext): boolean;

  isAlias(key: TParam): boolean {
    return this.paramAliases.some(alias => this.includes(key, alias.param));
  }

  waitLoad(): Promise<void> {
    return this.scheduler.wait();
  }

  isLoading(): boolean {
    return this.loading;
  }

  isAliasLoaded(key: TParam): boolean {
    return this.loadedKeys.some(loadedKey => this.includes(key, loadedKey));
  }

  getException(param: TParam): Error | null {
    param = this.transformParam(param);
    return this.metadata.get(param as unknown as TKey).exception;
  }

  isOutdated(param: TParam): boolean {
    if (this.isAlias(param) && !this.isAliasLoaded(param)) {
      return true;
    }

    param = this.transformParam(param);
    const metadata = this.metadata.get(param as unknown as TKey);
    return metadata.outdated;
  }

  isDataLoading(param: TParam): boolean {
    param = this.transformParam(param);
    return this.metadata.get(param as unknown as TKey).loading;
  }

  markDataLoading(param: TParam, context: TContext): void {
    param = this.transformParam(param);
    const metadata = this.metadata.get(param as unknown as TKey);
    metadata.loading = true;
  }

  markDataLoaded(param: TParam, context: TContext): void {
    param = this.transformParam(param);
    const metadata = this.metadata.get(param as unknown as TKey);
    metadata.loading = false;
  }

  markDataError(exception: Error, param: TParam, context: TContext): void {
    if (this.isAlias(param) && !this.isAliasLoaded(param)) {
      this.loadedKeys.push(param);
    }

    param = this.transformParam(param);
    const metadata = this.metadata.get(param as unknown as TKey);
    metadata.exception = exception;
    metadata.outdated = false;
    this.onDataError.execute({ param, exception });
  }

  markOutdated(param: TParam): void {
    if (this.isAlias(param)) {
      const index = this.loadedKeys.findIndex(key => this.includes(param, key));

      if (index >= 0) {
        this.loadedKeys.splice(index, 1);
      }
    }

    param = this.transformParam(param);
    const metadata = this.metadata.get(param as unknown as TKey);
    metadata.outdated = true;
    this.onDataOutdated.execute(param);
  }

  markUpdated(param: TParam): void {
    if (this.isAlias(param) && !this.isAliasLoaded(param)) {
      this.loadedKeys.push(param);
    }

    param = this.transformParam(param);
    const metadata = this.metadata.get(param as unknown as TKey);
    metadata.outdated = false;
    metadata.exception = null;
  }

  addAlias(param: TParam, getAlias: (param: TParam) => TParam): void {
    this.paramAliases.push({ param, getAlias });
  }

  transformParam(param: TParam): TParam {
    let deep = 0;
    // eslint-disable-next-line no-labels
    transform:

    if (deep < 10) {
      for (const alias of this.paramAliases) {
        if (this.includes(alias.param, param)) {
          param = alias.getAlias(param);
          deep++;
          // eslint-disable-next-line no-labels
          break transform;
        }
      }
    } else {
      console.warn('CachedResource: parameter transform was stopped');
    }
    return param;
  }

  async refresh(param: TParam, context: TContext): Promise<any> {
    await this.loadData(param, true, context);
    return this.data;
  }

  async load(param: TParam, context: TContext): Promise<any> {
    await this.loadData(param, false, context);
    return this.data;
  }

  protected setData(data: TData): void {
    this.data = data;
  }

  protected lock(param: TParam, second: TParam): boolean {
    if (this.isAlias(param) || this.isAlias(second)) {
      return true;
    }

    return this.includes(param, second);
  }

  protected includes(param: TParam, second: TParam): boolean {
    if (param === second) {
      return true;
    }

    param = this.transformParam(param);
    second = this.transformParam(second);
    return param === second;
  }

  protected abstract loader(param: TParam, context: TContext): Promise<TData>;

  protected async performUpdate<T>(
    param: TParam,
    context: TContext,
    update: (param: TParam, context: TContext) => Promise<T>,
  ): Promise<T>
  protected async performUpdate<T>(
    param: TParam,
    context: TContext,
    update: (param: TParam, context: TContext) => Promise<T>,
    exitCheck: () => boolean
  ): Promise<T | undefined>;

  protected async performUpdate<T>(
    param: TParam,
    context: TContext,
    update: (param: TParam, context: TContext) => Promise<T>,
    exitCheck?: () => boolean
  ): Promise<T | undefined> {
    if (exitCheck?.()) {
      return;
    }

    const contexts = await this.beforeLoad.execute(param);

    if (ExecutorInterrupter.isInterrupted(contexts)) {
      return;
    }

    this.markDataLoading(param, context);
    let loaded = false;
    return this.scheduler.schedule(
      param,
      async () => {
        // repeated because previous task maybe has been load requested data
        if (exitCheck?.()) {
          return;
        }

        const result = await this.taskWrapper(param, context, update);
        loaded = true;
        return result;
      },
      {
        after: () => this.markDataLoaded(param, context),
        success: () => {
          if (loaded) {
            this.onDataUpdate.execute(param);
          }
        },
        error: exception => this.markDataError(exception, param, context),
      });
  }

  protected async loadData(param: TParam, refresh: boolean, context: TContext): Promise<void> {
    const contexts = await this.beforeLoad.execute(param);

    if (ExecutorInterrupter.isInterrupted(contexts) && !refresh) {
      return;
    }

    if (this.isLoaded(param, context) && !this.isOutdated(param) && !refresh) {
      return;
    }

    this.markDataLoading(param, context);
    let loaded = false;
    await this.scheduler.schedule(
      param,
      async () => {
        // repeated because previous task maybe has been load requested data
        if (this.isLoaded(param, context) && !this.isOutdated(param) && !refresh) {
          return;
        }

        const result = await this.taskWrapper(param, context, this.loadingTask);
        loaded = true;
        return result;
      },
      {
        after: () => this.markDataLoaded(param, context),
        success: async () => {
          if (loaded) {
            this.onDataUpdate.execute(param);
          }
        },
        error: exception => this.markDataError(exception, param, context),
      });
  }

  private async loadingTask(param: TParam, context: TContext) {
    this.setData(await this.loader(param, context));
  }

  private async taskWrapper<T>(
    param: TParam,
    context: TContext,
    promise: (param: TParam, context: TContext) => Promise<T>
  ) {
    if (this.logActivity) {
      console.log(this.getActionPrefixedName('loading'));
    }
    this.markOutdated(param);
    const value = await promise(param, context);
    this.markUpdated(param);
    return value;
  }

  public getName(): string {
    return this.constructor.name;
  }

  protected logLock = (action: string): IExecutorHandler<any> => () => {
    console.log(this.getActionPrefixedName(action));
  };

  private logName = (action: string): IExecutorHandler<any> => () => {
    console.log(this.getActionPrefixedName(action));
  };

  protected getActionPrefixedName(action: string): string {
    return this.constructor.name + ': ' + action;
  }

  private logInterrupted = (action: string): IExecutorHandler<any> => (data, contexts) => {
    if (ExecutorInterrupter.isInterrupted(contexts)) {
      console.log(this.getActionPrefixedName(action) + 'interrupted');
    }
  };

  private spy(executor: ISyncExecutor<any>, action: string): void {
    executor
      .addHandler(this.logName(action))
      .addPostHandler(this.logInterrupted(action));
  }
}
