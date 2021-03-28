/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { computed, observable, makeObservable } from 'mobx';

import type { ITask } from './ITask';

export type BlockedExecution<T> = (active: T, current: T) => boolean;

export class TaskScheduler<TIdentifier> {
  get activeList(): TIdentifier[] {
    return this.queue.map(task => task.id);
  }

  private readonly queue: Array<ITask<TIdentifier>>;

  private readonly isBlocked: BlockedExecution<TIdentifier> | null;

  constructor(isBlocked: BlockedExecution<TIdentifier> | null = null) {
    makeObservable<TaskScheduler<TIdentifier>, 'queue'>(this, {
      activeList: computed,
      queue: observable.shallow,
    });

    this.queue = [];
    this.isBlocked = isBlocked;
  }

  async schedule<T>(
    id: TIdentifier,
    promise: () => Promise<T>,
    after?: () => Promise<any> | any,
    success?: () => Promise<any> | any,
    error?: (exception: Error) => Promise<any> | any,
  ): Promise<T> {
    const task: ITask<TIdentifier> = {
      id,
      task: this.scheduler(id, promise),
    };

    this.queue.push(task);

    try {
      const value = await task.task;
      await success?.();
      return value;
    } catch (exception) {
      await error?.(exception);
      throw exception;
    } finally {
      this.queue.splice(this.queue.indexOf(task), 1);
      await after?.();
    }
  }

  async wait(): Promise<void> {
    const queueList = this.queue.slice();

    for (const task of queueList) {
      try {
        await task.task;
      } catch {}
    }
  }

  private async scheduler<T>(
    id: TIdentifier,
    promise: () => Promise<T>,
  ) {
    if (!this.isBlocked) {
      return promise();
    }

    const queueList = this.queue.filter(active => this.isBlocked!(active.id, id));

    for (const task of queueList) {
      try {
        await task.task;
      } catch {}
    }

    return promise();
  }
}
