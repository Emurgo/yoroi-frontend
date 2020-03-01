// @flow

import React from 'react';

import moment from 'moment';
import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { THEMES } from '../../themes';
import NoticeBoardPage from './NoticeBoardPage';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import { withScreenshot } from 'storycap';
import Notice from '../../domain/Notice';

export default {
  title: `Container/${nameof(NoticeBoardPage)}`,
  component: NoticeBoardPage,
  decorators: [withScreenshot],
};


let next = 0;
const NoticeCases = {
  ManyNotices: [
    new Notice({ id: (next++).toString(), kind: 2, date: new Date() }),
    new Notice({ id: (next++).toString(), kind: 0, date: moment().subtract(1, 'seconds').toDate() }),
    new Notice({ id: (next++).toString(), kind: 1, date: moment().subtract(5, 'seconds').toDate() }),
    new Notice({ id: (next++).toString(), kind: 2, date: moment().subtract(40, 'seconds').toDate() }),
    new Notice({ id: (next++).toString(), kind: 3, date: moment().subtract(1, 'minutes').toDate() }),
    new Notice({ id: (next++).toString(), kind: 4, date: moment().subtract(2, 'minutes').toDate() }),
    new Notice({ id: (next++).toString(), kind: 5, date: moment().subtract(5, 'minutes').toDate() }),
    new Notice({ id: (next++).toString(), kind: 6, date: moment().subtract(15, 'minutes').toDate() }),
    new Notice({ id: (next++).toString(), kind: 7, date: moment().subtract(30, 'minutes').toDate() }),
    new Notice({ id: (next++).toString(), kind: 7, date: moment().subtract(88, 'minutes').toDate() }),
    new Notice({ id: (next++).toString(), kind: 0, date: moment().subtract(10, 'hours').toDate() }),
    new Notice({ id: (next++).toString(), kind: 3, date: moment().subtract(1, 'days').toDate() }),
    new Notice({ id: (next++).toString(), kind: 4, date: moment().subtract(1, 'days').toDate() }),
    new Notice({ id: (next++).toString(), kind: 1, date: new Date(2019, 11, 5, 10, 15, 20) }),
    new Notice({ id: (next++).toString(), kind: 5, date: new Date(2019, 11, 5, 8, 20, 20) }),
    new Notice({ id: (next++).toString(), kind: 3, date: new Date(2019, 11, 4, 2, 15, 20) }),
    new Notice({ id: (next++).toString(), kind: 7, date: new Date(2019, 11, 4, 10, 40, 20) }),
    new Notice({ id: (next++).toString(), kind: 6, date: new Date(2019, 11, 4, 18, 55, 29) }),
    new Notice({ id: (next++).toString(), kind: 0, date: new Date(2019, 11, 2, 10, 45, 20) }),
    new Notice({ id: (next++).toString(), kind: 7, date: new Date(2019, 11, 1, 10, 18, 20) }),
  ],
  SingleNotice: [
    new Notice({ id: '0', kind: 2, date: new Date() }),
  ],
  NoNotice: [],
};

const ButtonCases = Object.freeze({
  NoMore: 0,
  HasMore: 1,
  HasMoreLoading: 2,
});
export const Generic = () => {
  const buttonState = () => select(
    'loadButton',
    ButtonCases,
    ButtonCases.NoMore,
  );
  return (
    <NoticeBoardPage
      generated={{
        stores: {
          profile: {
            isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
          },
          serverConnectionStore: {
            checkAdaServerStatus: select(
              'checkAdaServerStatus',
              ServerStatusErrors,
              ServerStatusErrors.Healthy,
            ),
          },
          topbar: {
            isActiveCategory: () => false,
            categories: [],
          },
          noticeBoard: {
            loadedNotices: select(
              'loadedNotices',
              NoticeCases,
              NoticeCases.ManyNotices,
            ),
            searchOptions: {
              skip: 0,
              limit: 0,
            },
            isLoading: buttonState() === ButtonCases.HasMoreLoading,
            hasMoreToLoad: buttonState() === ButtonCases.HasMore ||
              buttonState() === ButtonCases.HasMoreLoading,
          },
        },
        actions: {
          topbar: {
            activateTopbarCategory: { trigger: action('activateTopbarCategory') },
          },
          noticeBoard: {
            loadMore: { trigger: async () => action('loadMore')() },
          },
        }
      }}
    />
  );
};

/* ===== Notable variations ===== */
