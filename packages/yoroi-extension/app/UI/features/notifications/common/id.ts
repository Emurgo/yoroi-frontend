export const generateNotificationId = (): number => {
  return generateRandomInteger(0, Number.MAX_SAFE_INTEGER)
}

export const parseNotificationId = (id: string | number): number => {
  return parseInt(String(id), 10)
}

const generateRandomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
