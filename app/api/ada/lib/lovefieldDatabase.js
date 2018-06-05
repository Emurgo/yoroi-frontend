import lf from 'lovefield';

// CHECK
const txsTableFields = {
  CT_AMOUNT: 'ctAmount',
  CT_BLOCK_NUMBER: 'ctBlockNumber',
  CT_ID: 'ctId',
  CT_INPUTS: 'ctInputs',
  CT_IS_OUTGOING: 'ctIsOutgoing',
  CT_META: 'ctMeta',
  CTM_DATE: 'ctmDate',
  CT_OUTPUTS: 'ctOutputs',
  CT_CONDITION: 'ctCondition'
};
const orders = {
  ASC: lf.Order.ASC,
  DESC: lf.Order.DESC
};

const LovefieldDB = {
  db: null,
  txsTableFields,
  orders
};

export default LovefieldDB;

// Ensure we are only creating a single instance of the lovefield database
export const loadLovefieldDB = async() => {
  if (LovefieldDB.db) {
    return Promise.resolve(LovefieldDB.db);
  }
  const schemaBuilder = lf.schema.create('icarus-schema', 1);
  schemaBuilder.createTable('Txs')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn(txsTableFields.CT_AMOUNT, lf.Type.OBJECT)
    .addColumn(txsTableFields.CT_BLOCK_NUMBER, lf.Type.STRING)
    .addColumn(txsTableFields.CT_ID, lf.Type.STRING)
    .addColumn(txsTableFields.CT_INPUTS, lf.Type.OBJECT)
    .addColumn(txsTableFields.CT_IS_OUTGOING, lf.Type.BOOLEAN)
    .addColumn(txsTableFields.CT_META, lf.Type.OBJECT)
    .addColumn(txsTableFields.CTM_DATE, lf.Type.DATE_TIME)
    .addColumn(txsTableFields.CT_OUTPUTS, lf.Type.OBJECT)
    .addColumn(txsTableFields.CT_CONDITION, lf.Type.STRING)
    .addPrimaryKey(['id'], lf.Order.ASC)
    .addUnique('unique', [txsTableFields.CT_ID]);
  return await schemaBuilder.connect().then(db => {
    LovefieldDB.db = db;
    return db;
  });
};
