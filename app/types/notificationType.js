// @flow
import type { $npm$ReactIntl$IntlFormat, MessageDescriptor } from 'react-intl';

export type Notification = {|
  id: string,
  message: MessageDescriptor,
  duration: ?number,
  secondsTimerInterval?: ?IntervalID,
  values?: $npm$ReactIntl$IntlFormat => Object,
|}
