// @flow
import type { MessageDescriptor } from 'react-intl';

export type Notification = {
  id: string,
  message: MessageDescriptor,
  duration: ?number,
  secondsTimerInterval?: ?IntervalID,
}
