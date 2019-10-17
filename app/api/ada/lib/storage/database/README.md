# Architecture

This folder handles interfacing with [lovefield](https://github.com/google/lovefield) which is a library that allows to write SQL-like queries in pure Javascript.

Folders are split based on the categories inside the [storage spec](../../../../../../docs/specs/code/STORAGE.md)

The main requirement of this architecture is that it must work well with [transactional queries](https://en.wikipedia.org/wiki/Database_transaction). Transactions in Lovefield work by requiring you to lock each table that will be used in the query BEFORE the query executes.

Notably:

1) If you query a table without locking it first, it is a runtime error
2) If you query a table that is already locked, you will block until it gets unlocked (note: risk of deadlock)

To avoid bugs, every high-level query is wrapped in a class with the following architecture

```js
export class MyTopLevelQuery {
  /** ONLY tables that I access directly **/
  static ownTables = Object.freeze({
    [Tables.SomeTableYouNeed.name]: Tables.SomeTableYouNeedSchema,
  });

  /** other high level queries you use inside this query **/
  static depTables = Object.freeze({
    OtherHighLevelQuery,
  });

  static async myHighLevelQuery(
    db: lf$Database,
    tx: lf$Transaction,
    /* other arguments here */
  ): Promise<{
    /* query return here */
  }> {
    /**
     * Note we do not not call other queries directly
     * Instead, we call them through our `depTables` variable
     * This ensure that refactoring causes statically detectable error
     * That way we can easily make sure all the dependencies are up-to-date
     */
    const result = await MyTopLevelQuery.depTables.OtherHighLevelQuery.exec(
      db, tx,
    );

    /**
     * Here we modify a table directly inside the query
     * Similarly, instead of referring to the table directly, we access it through
     * our `ownTables` variable
     */
    return await addNewRowToTable(
      db, tx,
      request,
      AddKey.ownTables[Tables.KeySchema.name].name,
    );

    return {};
  }
}
```

Now if you need to write code that uses our `MyTopLevelQuery`, we write the following:

```js
const myTransactionalQuery = db.createTransaction();

// recursively figure out all tables used by this query and lock them
await myTransactionalQuery.begin([
  ...getAllSchemaTables(db, MyTopLevelQuery),
]);

// execute query
const addressesForAccount = await MyTopLevelQuery.exec(
  db,
  myTransactionalQuery,
);

// commit result and unlock tables
await myTransactionalQuery.commit();
```

Although this architecture makes it easier to detect mistakes, you should still avoid having to write transactions yourself inside an application. It is better to instead wrap any behavior you need inside a well-tested function that handles it for you. If possible, you can at least use the `raii` wrapper to automatically handle transaction creation/commitment and rolling back in the case of an exception to avoid a deadlock

```js
await raii(
  db,
  getAllSchemaTables(db, MyTopLevelQuery),
  async tx => {
    // execute query
    const addressesForAccount = await MyTopLevelQuery.exec(
      db,
      tx,
    );
  }
);
```
