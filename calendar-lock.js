(function(root) {
  // Release recurs by month/day; changing the calendar's displayed year must not expose future stories.
  function isLockedDate(month,day,today) {
    return month>today.getMonth()+1 || (month===today.getMonth()+1 && day>today.getDate());
  }
  if (typeof module!=="undefined" && module.exports) module.exports={isLockedDate};
  if (root) root.isLockedDate=isLockedDate;
})(typeof window!=="undefined" ? window : null);
