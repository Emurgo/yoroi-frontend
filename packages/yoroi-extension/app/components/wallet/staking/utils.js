// @flow
import { toSvg } from 'jdenticon';

export const getAvatarFromPoolId = (id: string): string => {
  const avatarSource = toSvg(id, 36, { padding: 0 });
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
};
