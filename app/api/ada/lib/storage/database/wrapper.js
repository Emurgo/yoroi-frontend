// @flow

/**
 * We have to wrap all functions that access database tables in a class
 * That way we can explicitly state which tables will be used by which functions
 * This is required because transactional queries in Lovefield
 * Need to know which tables will be accessed beforehand.
 * Getting the tables wrong will lead to either
 * - Deadlock if you lock a table which is already locked
 * - Runtime error if you access a table which is not locked
 */

import { size } from 'lodash';

export type OwnTableType = { [key: string]: string };
export type DepTableType = { [key: string]: TableClassType };
export type TableClassType = {
  ownTables: OwnTableType,
  /**
   * Recursively specify which tables will be required
   * We need to recursivley store this information
   * That way each wrapper only needs to care about the tables it specifically will access
   * and not what its dependencies will require
   */
  depTables: DepTableType,
}

/** recursively get all tables required for a database query */
export function getAllTables(tableClass: TableClassType): Set<string> {
  return new Set(_getAllTables(tableClass));
}

function _getAllTables(tableClass: TableClassType): Array<string> {
  const ownTables = Object.keys(tableClass.ownTables).map(key => tableClass.ownTables[key]);
  if (size(tableClass.depTables) === 0) {
    return ownTables;
  }
  return ownTables.concat(
    ...Object.keys(tableClass.depTables)
      .map(key => tableClass.depTables[key])
      .map(clazz => _getAllTables(clazz))
  );
}
