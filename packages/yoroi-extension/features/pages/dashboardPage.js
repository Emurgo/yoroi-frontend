// @flow

import type { LocatorObject } from '../support/webdriver';

export const cardValueText: LocatorObject = { locator: '.UserSummary_value', method: 'css' };
export const getTotalAdaValue = async (customWorld: any): Promise<number> => {
    const cardsElements = await customWorld.findElements(cardValueText)
    const totalValueText = await cardsElements[0].getText()
    return parseFloat((totalValueText).split(' ')[0])
}

export const getRewardValue = async (customWorld: any): Promise<number> => {
    const cardsElements = await customWorld.findElements(cardValueText)
    const rewardValueText = await cardsElements[1].getText()
    return parseFloat((rewardValueText).split(' ')[0])
}