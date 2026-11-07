(function(root) {
  // Equal interest grades retain the dataset's editorial order.
  function topStories(events, limit=3) {
    return events.map((event,index)=>({event,index})).sort((a,b)=>(Number(b.event.grade)||0)-(Number(a.event.grade)||0)||a.index-b.index).slice(0,limit).map(item=>item.event);
  }
  if (typeof module!=="undefined" && module.exports) module.exports={topStories};
  if (root) root.topStories=topStories;
})(typeof window!=="undefined" ? window : null);
