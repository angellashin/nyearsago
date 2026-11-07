(() => {
  const data = window.WIDGET_DAILY;
  if (!data) return;
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());
  const get = type => Number(parts.find(part => part.type === type).value);
  const year = get('year'), month = get('month'), day = get('day');
  const story = data[`${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`];
  if (!story) return;
  const label = story.year ? `${year - story.year}년 전 오늘` : `${month}월 ${day}일의 이야기`;
  const title = story.title.replace(/^\d{3,4}년\s*·\s*/, '');
  const summary = story.summary?.trim().match(/^[^.!?]+[.!?]/)?.[0] || story.summary?.trim() || '이 날짜의 사건을 앱에서 함께 살펴보세요.';
  for (const widget of document.querySelectorAll('.widget-card')) {
    widget.querySelector('.widget-date').textContent = label;
    widget.querySelector('.widget-title').textContent = title;
    widget.querySelector('.widget-summary').textContent = summary;
    widget.setAttribute('aria-label', `${month}월 ${day}일, ${title}. 오늘의 이야기 열기`);
  }
  const size = new URLSearchParams(location.search).get('size');
  if (size === 'small' || size === 'medium') document.body.classList.add('embed-mode', `size-${size}`);
})();
