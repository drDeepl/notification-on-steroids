export interface CalendarCell {
  day: number;
  currentMonth: boolean;
}

export function buildCalendar(year: number, month: number): CalendarCell[][] {
  const calendar: CalendarCell[][] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month, 0);
  const startDay = startDate.getDay(); // День недели первого дня месяца
  const daysInMonth = endDate.getDate(); // Количество дней в месяце

  let currentDate = 1;

  // Создаем матрицу для календаря
  for (let week = 0; week < 6; week++) {
    calendar[week] = [];

    for (let day = 0; day < 7; day++) {
      if (week === 0 && day < startDay) {
        // Дни предыдущего месяца
        const prevMonthDate = new Date(
          year,
          month,
          daysInMonth - (startDay - day - 1),
        );
        calendar[week][day] = {
          day: prevMonthDate.getDate(),
          currentMonth: false,
        };
      } else if (currentDate > daysInMonth) {
        // Дни следующего месяца
        const nextMonthDate = new Date(
          year,
          month + 1,
          currentDate - daysInMonth,
        );
        calendar[week][day] = {
          day: nextMonthDate.getDate(),
          currentMonth: false,
        };
        currentDate++;
      } else {
        // Дни текущего месяца
        calendar[week][day] = { day: currentDate, currentMonth: true };
        currentDate++;
      }
    }
  }

  return calendar;
}
