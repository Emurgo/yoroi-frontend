import moment from 'moment';

// TODO: Improve format
export const formatCID = function (id) {
  return `${id.slice(0, 5)}...${id.slice(id.length - 5, id.length)}`;
};

export const formatTimestamp = function (timestamp) {
  return moment.unix(timestamp).format('YYYY-MM-DD, h:mm:ss a');
};
