// @flow
import type { ReactIntlMessage } from './i18nTypes';

export type Notification = {
  id: string,
  message: ReactIntlMessage,
  duration: ?number,
  secondsTimerInterval?: ?IntervalID,
}
