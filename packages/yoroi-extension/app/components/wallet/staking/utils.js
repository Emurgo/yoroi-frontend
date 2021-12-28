// @flow
import { toSvg } from 'jdenticon';

export const getAvatarFromPoolId = (id: string): string => {
  const avatarSource = toSvg(id, 36, { padding: 0 });
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
};

export const groupByKey = (items: Array<any>, key: string): Object =>
  items.reduce(
    (accumulator, item) => ({
      ...accumulator,
      [item[key]]: (accumulator[item[key]] || []).concat(item),
    }),
    {}
  );

export const groupByPoolName = (items: Array<any>): Object => groupByKey(items, 'poolName');
