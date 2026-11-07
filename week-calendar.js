(function(root) {
  const DAY = 86400000;

  // Work in UTC calendar days so the Monday boundary is stable in every browser timezone.
  function elapsedWeekDates(date) {
    const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const monday = today - ((new Date(today).getUTCDay() + 6) % 7) * DAY;
    const dates = [];
    for (let time = monday; time <= today; time += DAY) {
      const day = new Date(time);
      dates.push({year:day.getUTCFullYear(), month:day.getUTCMonth()+1, day:day.getUTCDate()});
    }
    return dates;
  }

  const api = {elapsedWeekDates};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.WeeklyQuizWeek = api;
})(typeof window !== "undefined" ? window : null);
