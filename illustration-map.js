/* November's first event has a distinct illustration; all other events use the shared monochrome placeholder. */
(function(root) {
  function novemberArtwork(event) {
    if (!event || event.month !== 11 || event.day < 1 || event.day > 30 ||
        event.id !== `11-${String(event.day).padStart(2,"0")}-01`) return null;
    if (event.day <= 7) return {sheet:"images/november-week1-playful.png",panel:event.day-1};
    const sheetIndex=Math.floor((event.day-8)/8);
    return {sheet:`images/november-main/nov-${["08-15","16-23","24-30"][sheetIndex]}.jpg`,panel:(event.day-8)%8};
  }
  if (typeof module!=="undefined" && module.exports) module.exports={novemberArtwork};
  if (root) root.novemberArtwork=novemberArtwork;
})(typeof window!=="undefined" ? window : null);
