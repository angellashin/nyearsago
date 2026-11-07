/* Weekly streaks use Monday–Sunday, based on the app's Korean calendar date. */
(function(root) {
  function weekIndex(date) { return Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()) / 86400000 + 3) / 7); }
  function current(record,date) {
    const week=weekIndex(date);
    if (!record || !Number.isInteger(record.week) || !Number.isInteger(record.count) || record.count<1) return 0;
    return record.week===week || record.week===week-1 ? record.count : 0;
  }
  function complete(record,date) {
    const week=weekIndex(date);
    if (record && record.week===week && Number.isInteger(record.count) && record.count>0) return record;
    return {week,count:record && record.week===week-1 && Number.isInteger(record.count) && record.count>0 ? record.count+1 : 1};
  }
  const api={weekIndex,current,complete};
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (root) root.WeeklyStreak=api;
})(typeof window!=="undefined" ? window : null);
