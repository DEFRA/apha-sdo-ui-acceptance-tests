export const getCurrentMonth = function () {
  const month = new Date().getMonth() + 1
  return month
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1
}

export const getMonthName = function () {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const d = new Date()
  return monthNames[d.getMonth()]
}
