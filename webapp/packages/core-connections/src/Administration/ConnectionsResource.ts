/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { action, makeObservable } from 'mobx';
import { Observable, Subject } from 'rxjs';

import { injectable } from '@cloudbeaver/core-di';
import {
  GraphQLService,
  AdminConnectionFragment,
  ConnectionConfig,
  CachedMapResource,
  ResourceKey,
  AdminConnectionGrantInfo,
  AdminConnectionSearchInfo,
  ObjectPropertyInfo,
  ResourceKeyUtils,
  ConnectionInfo,
  NetworkHandlerConfig
} from '@cloudbeaver/core-sdk';
import { MetadataMap, uuid } from '@cloudbeaver/core-utils';

import type { DBDriver } from '../DBDriverResource';

export const NEW_CONNECTION_SYMBOL = Symbol('new-connection');

export type AdminConnection = AdminConnectionFragment;
export type NewConnection = AdminConnectionFragment & { [NEW_CONNECTION_SYMBOL]: boolean; timestamp: number };

@injectable()
export class ConnectionsResource extends CachedMapResource<string, AdminConnection> {
  readonly onConnectionCreate: Observable<AdminConnection>;

  private changed: boolean;
  private loadedKeyMetadata: MetadataMap<string, boolean>;
  private connectionCreateSubject: Subject<AdminConnection>;

  constructor(
    private graphQLService: GraphQLService
  ) {
    super(new Map());

    makeObservable(this, {
      add: action,
    });

    this.changed = false;
    this.connectionCreateSubject = new Subject<AdminConnection>();
    this.onConnectionCreate = this.connectionCreateSubject.asObservable();
    this.loadedKeyMetadata = new MetadataMap(() => false);
  }

  has(id: string): boolean {
    if (this.loadedKeyMetadata.has(id)) {
      return this.loadedKeyMetadata.get(id);
    }

    return this.data.has(id);
  }

  getEmptyConnection(): AdminConnection {
    return {
      id: uuid(),
      template: false,
      saveCredentials: false,
      useUrl: false,
      authProperties: [],
      properties: {},
      providerProperties: {},
      origin: {
        type: 'local',
        displayName: 'Local',
      },
      networkHandlersConfig: [],
    } as Partial<AdminConnection> as any;
  }

  async loadAll(): Promise<Map<string, AdminConnection>> {
    await this.load('all');
    return this.data;
  }

  async searchDatabases(hosts: string[]): Promise<AdminConnectionSearchInfo[]> {
    const { databases } = await this.graphQLService.sdk.searchDatabases({ hosts });

    return databases;
  }

  async create(config: ConnectionConfig): Promise<AdminConnection> {
    const { connection } = await this.graphQLService.sdk.createConnectionConfiguration({ config });

    return this.add(connection, true);
  }

  add(connection: AdminConnection, isNew = false): AdminConnection {
    this.changed = true;

    const newConnection: NewConnection = {
      ...connection,
      [NEW_CONNECTION_SYMBOL]: isNew,
      timestamp: Date.now(),
    };
    this.set(newConnection.id, newConnection);

    const observedConnection = this.get(connection.id)!;
    this.connectionCreateSubject.next(observedConnection);
    return observedConnection;
  }

  async test(config: ConnectionConfig): Promise<void> {
    await this.graphQLService.sdk.testConnection({
      config,
    });
  }

  async update(id: string, config: ConnectionConfig): Promise<AdminConnection> {
    await this.performUpdate(id, () => this.updateConnection(id, config));
    this.changed = true;
    return this.get(id)!;
  }

  async delete(key: ResourceKey<string>): Promise<void> {
    await this.performUpdate(key, () => this.deleteConnectionTask(key));
    this.changed = true;
  }

  async updateSessionConnections(): Promise<boolean> {
    if (!this.changed) {
      return false;
    }

    await this.graphQLService.sdk.refreshSessionConnections();
    this.changed = false;
    return true;
  }

  async loadAccessSubjects(connectionId: string): Promise<AdminConnectionGrantInfo[]> {
    const { subjects } = await this.graphQLService.sdk.getConnectionAccess({ connectionId });

    return subjects;
  }

  async loadNetworkHandlers(connectionId: string): Promise<NetworkHandlerConfig[]> {
    const { connection } = await this.graphQLService.sdk.getConnectionNetworkHandlers({ connectionId });
    return connection.networkHandlersConfig;
  }

  async loadOrigin(connectionId: string): Promise<ObjectPropertyInfo[]> {
    const { connection } = await this.graphQLService.sdk.getConnectionOriginDetails({ connectionId });
    return connection.origin.details || [];
  }

  async setAccessSubjects(connectionId: string, subjects: string[]): Promise<void> {
    await this.graphQLService.sdk.setConnectionAccess({ connectionId, subjects });
  }

  cleanNewFlags() {
    for (const connection of this.data.values()) {
      (connection as NewConnection)[NEW_CONNECTION_SYMBOL] = false;
    }
  }

  protected async loader(key: ResourceKey<string>): Promise<Map<string, AdminConnection>> {
    const { connections } = await this.graphQLService.sdk.getConnections();
    this.data.clear();

    for (const connection of connections) {
      this.set(connection.id, connection);
    }

    // TODO: getConnections must accept connectionId, so we can update some connection or all connections,
    //       here we should check is it's was a full update
    this.loadedKeyMetadata.set('all', true);

    return this.data;
  }

  private async deleteConnectionTask(key: ResourceKey<string>) {
    await ResourceKeyUtils.forEachAsync(key, key => this.deleteConnection(key));
    await this.onItemDelete.execute(key);
  }

  private async deleteConnection(connectionId: string) {
    if (!this.data.has(connectionId)) {
      return;
    }

    await this.graphQLService.sdk.deleteConnectionConfiguration({ id: connectionId });
    this.data.delete(connectionId);
  }

  private async updateConnection(id: string, config: ConnectionConfig) {
    const { connection } = await this.graphQLService.sdk.updateConnectionConfiguration({ id, config });

    this.set(id, connection);
  }
}

export function isJDBCConnection(driver?: DBDriver, connection?: ConnectionInfo): boolean {
  return connection?.useUrl || !driver?.sampleURL || false;
}

export function isLocalConnection(connection: AdminConnection): boolean {
  return connection.origin.type === 'local';
}

export function isCloudConnection(connection: AdminConnection): boolean {
  return connection.origin.type === 'cloud';
}

export function isNewConnection(connection: AdminConnection | NewConnection): connection is NewConnection {
  return (connection as NewConnection)[NEW_CONNECTION_SYMBOL];
}

export function compareConnections(a: AdminConnection, b: AdminConnection): number {
  if (isNewConnection(a) && isNewConnection(b)) {
    return b.timestamp - a.timestamp;
  }

  if (isNewConnection(b)) {
    return 1;
  }

  if (isNewConnection(a)) {
    return -1;
  }

  return a.name.localeCompare(b.name);
}
