// @flow
import BigNumber from 'bignumber.js';
import { splitAmount } from './formatters'

test('Should return only integer of no decimals', () => {
    const amount = new BigNumber('1')
    const [before, after] = splitAmount(amount, 5)
    expect(before).toBe('1')
    expect(after).toBe('')
})


test('Should return 0 without decimals if amount is 0', () => {
    const amount = new BigNumber('0')
    const [before, after] = splitAmount(amount, 5)
    expect(before).toBe('0')
    expect(after).toBe('')
})


test('Should return 1.5 if amount is 1.500000', () => {
    const amount = new BigNumber('1.500000')
    const [before, after] = splitAmount(amount, 5)
    expect(before).toBe('1.')
    expect(after).toBe('5')
})

test('Should not remove zeros if amount like 1.00005', () => {
    const amount = new BigNumber('1.00005')
    const [before, after] = splitAmount(amount, 5)
    expect(before).toBe('1.')
    expect(after).toBe('00005')
})

test('splitAmount with 0 decimal place', () => {
    const amount = new BigNumber('1')
    const [before, after] = splitAmount(amount, 0)
    expect(before).toBe('1')
    expect(after).toBe('')
})