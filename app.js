(() => {
  const data = window.EVENT_DATA;
  if (!data) return;
  const key = (m, d) => `${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const dateMap = new Map(data.dates.map(x => [key(x.month,x.day), x]));
  const eventMap = new Map(data.events.map(x => [x.id,x]));
  const todayParts = new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Seoul", year:"numeric", month:"numeric", day:"numeric"}).formatToParts(new Date());
  const part = type => Number(todayParts.find(p => p.type === type).value);
  const today = new Date(part("year"), part("month") - 1, part("day"));
  let selected = {month: today.getMonth()+1, day: today.getDate()};
  let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let currentEvent = null;
  let saved = new Set(JSON.parse(localStorage.getItem("nyearsago:saved") || "[]"));
  const $ = id => document.getElementById(id);
  const fmtDate = (m,d) => `${m}월 ${d}일`;
  const getDay = (m,d) => dateMap.get(key(m,d)) || dateMap.get("02-28");
  const featured = (m,d) => {
    const day = getDay(m,d);
    return day.events.find(e=>e.id===day.featuredId) || day.events[0];
  };
  const yearsAgo = e => e.year ? today.getFullYear()-e.year : null;
  const esc = s => String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function illustration(event, compact=false) {
    const text = (event.title+" "+event.summary).toLowerCase();
    if (event.month === 11 && event.day <= 7 && event.id.endsWith("-01")) {
      const index = event.day - 1;
      return `<div class="illustration-sprite" role="img" aria-label="${esc(event.title)} 일러스트" style="background-position:${index%2 ? 100 : 0}% ${Math.floor(index/2)*100/3}%"></div>`;
    }
    if (text.includes("타코마") || text.includes("다리 붕괴")) {
      return `<svg viewBox="0 0 480 340" role="img" aria-label="바람에 흔들리는 현수교 일러스트" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="340" fill="#d9e2df"/><path d="M0 222 Q72 194 141 218T282 216T480 206V340H0Z" fill="#6c8794"/><path d="M0 252Q86 245 160 256T322 252T480 260" fill="none" stroke="#f4eee0" stroke-width="3"/>
      <path d="M54 244V92M387 238V42" stroke="#f4eee0" stroke-width="13"/><path d="M54 93Q218 43 387 43" fill="none" stroke="#263a43" stroke-width="5"/><path d="M54 102Q210 59 387 52" fill="none" stroke="#263a43" stroke-width="3"/>
      <path d="M54 98L96 214M98 88L132 216M144 77L168 220M194 67L205 224M245 59L244 229M294 52L281 225M341 47L319 221M387 43L357 221" fill="none" stroke="#263a43" stroke-width="1.8"/>
      <path d="M43 217 Q112 208 171 216 Q220 225 269 214 Q326 202 399 208" fill="none" stroke="#f6f1e5" stroke-width="11" stroke-linecap="round"/><path d="M47 222 Q112 213 172 221 Q220 230 271 219 Q326 207 397 213" fill="none" stroke="#263a43" stroke-width="2"/>
      <path d="M84 59q-22-18-43 0M111 39q-22-18-43 0M141 25q-22-18-43 0" fill="none" stroke="#fffaf0" stroke-width="4" stroke-linecap="round"/>
      <path d="M329 286q32-8 62 0m-133 15q28-7 51 0" stroke="#cbd8d3" fill="none" stroke-width="3" stroke-linecap="round"/>
      <path d="M29 286l10-24 10 24-10-6zM54 290l8-18 8 18-8-5z" fill="#ee5938"/><circle cx="39" cy="280" r="2" fill="#fff"/><circle cx="62" cy="283" r="2" fill="#fff"/>
      </svg>`;
    }
    const palette = text.includes("스포츠") || text.includes("월드컵") ? ["#d7e1df","#ef5938","#425d69"] : ["#e8e2d6","#778b89","#ee5938"];
    return `<svg viewBox="0 0 480 340" role="img" aria-label="${esc(event.title)}를 상징하는 일러스트" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="340" fill="${palette[0]}"/><circle cx="345" cy="85" r="49" fill="#f2ead6"/><path d="M0 245Q82 202 166 235T335 222T480 221V340H0Z" fill="${palette[2]}" opacity=".84"/><path d="M0 271Q104 232 190 263T354 250T480 250V340H0Z" fill="${palette[1]}"/><path d="M72 224h150l21 34H55z" fill="#f6f1e5"/><path d="M108 184v40m73-40v40m-91 0h114" stroke="#273238" stroke-width="5"/><path d="M98 184q42-53 90 0" fill="none" stroke="#273238" stroke-width="3"/><path d="M285 204l15-34 14 34-14-9z" fill="#ee5938"/><circle cx="300" cy="188" r="2" fill="white"/><circle cx="310" cy="190" r="2" fill="white"/><path d="M385 285h44m-22-17v35" stroke="#f7f4ea" stroke-width="3"/><path d="M20 33l6-21 6 21 20 6-20 6-6 21-6-21-20-6z" fill="#ee5938" transform="translate(18 4) scale(.55)"/></svg>`;
  }
  let restoringHistory = false;
  let navigationDepth = 0;
  function snapshot(view) { return {app:true, view, selected:{...selected}, eventId:currentEvent?.id || null, depth:navigationDepth}; }
  function activeView(id) {
    if (!restoringHistory) {
      const previous = document.querySelector(".view.active")?.id;
      if (previous !== id) {
        history.replaceState(snapshot(previous || "homeView"), "");
        navigationDepth++;
        history.pushState(snapshot(id), "", "#" + id.replace("View", ""));
      }
    }
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
    document.querySelectorAll(".nav-item").forEach(v=>v.classList.toggle("selected",v.dataset.view===id));
    window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }
  function openStory(event) { currentEvent=event; $("storyArticle").innerHTML=storyHtml(event); activeView("storyView"); }
  const weeklyQuestions = [
    {day:1, q:"시스티나 성당 천장화를 그린 예술가는?", choices:["미켈란젤로","레오나르도 다빈치","라파엘로"], answer:0, explanation:"미켈란젤로는 1508년부터 시스티나 성당 천장화를 그렸어요."},
    {day:2, q:"국제우주정거장 첫 상주 승무원은 몇 명이었을까요?", choices:["두 명","세 명","다섯 명"], answer:1, explanation:"셰퍼드, 기젠코, 크리칼료프 세 사람이 첫 상주 승무원이었어요."},
    {day:3, q:"광주학생항일운동은 어디까지 퍼져 나갔을까요?", choices:["광주에만 머물렀다","전국으로 확산됐다","해외에서만 이어졌다"], answer:1, explanation:"학생들의 연대와 조직적인 활동을 통해 전국으로 퍼졌어요."},
    {day:4, q:"투탕카멘 무덤의 입구로 이어진 첫 단서는?", choices:["바위에 파인 계단","사막 위의 비석","무덤을 그린 지도"], answer:0, explanation:"발굴팀은 왕가의 계곡에서 계단의 첫 단을 발견했어요."},
    {day:5, q:"화약 음모를 발견하는 계기가 된 것은?", choices:["의회에 가지 말라는 경고 편지","신문의 일기예보","왕의 생일 초대장"], answer:0, explanation:"익명의 경고 편지가 수색으로 이어졌고 화약이 발견됐어요."},
    {day:6, q:"1860년 미국 대통령으로 선출된 인물은?", choices:["조지 워싱턴","에이브러햄 링컨","프랭클린 루스벨트"], answer:1, explanation:"링컨은 1860년 미국의 제16대 대통령으로 선출됐어요."},
    {day:7, q:"11월에 일어난 사건이 ‘10월혁명’인 이유는?", choices:["당시 러시아에서 쓰던 달력이 달라서","사건을 한 달 뒤에 발표해서","혁명이 10월 내내 계속돼서"], answer:0, explanation:"러시아가 당시 쓰던 율리우스력으로는 10월이었어요."}
  ];
  const streakKey="nyearsago:weekly-streak";
  function readStreak() { try { return JSON.parse(localStorage.getItem(streakKey) || "null"); } catch { return null; } }
  function renderStreak() { const count=WeeklyStreak.current(readStreak(),today); $("streakCount").textContent=count; $("streakBadge").setAttribute("aria-label",`연속 퀴즈 ${count}주`); }
  function completeStreak() { const record=WeeklyStreak.complete(readStreak(),today); try { localStorage.setItem(streakKey,JSON.stringify(record)); } catch { return; } renderStreak(); }
  let quizIndex=0, quizCorrect=0, quizAnswered=false;
  function availableQuestions() {
    return today.getMonth()===10 && today.getDate()<=7 ? weeklyQuestions.filter(q=>q.day<=Math.min(today.getDate(),7)) : [];
  }
  const quizMascot = '<img class="quiz-mascot" src="images/quiz-mascot.png" alt="" width="170" height="114" loading="lazy">';
  function startQuiz() { quizIndex=0; quizCorrect=0; quizAnswered=false; renderQuiz(); activeView("quizView"); }
  function quizEntry() {
    const questions=availableQuestions();
    $("weeklyQuizEntry").innerHTML = questions.length ? `<button class="quiz-entry" id="startQuiz"><span class="quiz-entry-copy"><small>잠깐, 기억력 체크!</small><strong>이번 주 이야기를<br>얼마나 기억하고 있나요?</strong><span class="quiz-entry-cta">주간 퀴즈 풀기 <span aria-hidden="true">→</span></span></span>${quizMascot}</button>` : "";
    const button=$("startQuiz"); if(button)button.onclick=startQuiz;
  }
  function renderQuiz() {
    const questions=availableQuestions(), q=questions[quizIndex];
    if (!questions.length) { $("quizContent").innerHTML=`<section class="quiz-card quiz-result">${quizMascot}<span class="quiz-kicker">주간 퀴즈</span><h1>이번 주 퀴즈를<br>준비하고 있어요</h1><p>새로운 이야기가 쌓이면 다시 만나요.</p></section>`; return; }
    if (!q) { completeStreak(); $("quizContent").innerHTML=`<section class="quiz-card quiz-result">${quizMascot}<span class="quiz-kicker">퀴즈 완료!</span><h1>이번 주 이야기, 잘 살펴봤어요</h1><p><strong>${questions.length}문제 중 ${quizCorrect}문제 정답</strong><br>${quizCorrect===questions.length?"모두 기억하고 있었네요!":"몰랐던 이야기도 하나씩 알아가면 돼요."}</p><div class="quiz-result-actions"><button class="primary-button" id="quizRetry">다시 풀기</button><button class="secondary-button" id="quizHome">오늘의 이야기로</button></div></section>`;$("quizRetry").onclick=()=>{quizIndex=0;quizCorrect=0;quizAnswered=false;renderQuiz();};$("quizHome").onclick=()=>activeView("homeView");return; }
    quizAnswered=false;
    $("quizContent").innerHTML=`<section class="quiz-card"><div class="quiz-topline"><span class="quiz-kicker">이번 주의 퀴즈</span><span class="quiz-counter">${quizIndex+1} <span>/ ${questions.length}</span></span></div><div class="quiz-progress" role="progressbar" aria-label="퀴즈 진행률" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${quizIndex}"><span style="width:${quizIndex/questions.length*100}%"></span></div><p class="quiz-date">가볍게 골라보세요</p><h1>${esc(q.q)}</h1><div class="quiz-options">${q.choices.map((choice,i)=>`<button class="quiz-option" data-choice="${i}"><span>${i+1}</span>${esc(choice)}</button>`).join("")}</div><div id="quizFeedback" class="quiz-feedback" role="status" aria-live="polite"></div></section>`;
    $("quizContent").querySelectorAll("[data-choice]").forEach(button=>button.onclick=()=>{ if(quizAnswered)return; quizAnswered=true;const choice=Number(button.dataset.choice),correct=choice===q.answer;if(correct)quizCorrect++;$("quizContent").querySelectorAll("[data-choice]").forEach(b=>{b.disabled=true;if(Number(b.dataset.choice)===q.answer)b.classList.add("correct");});if(!correct)button.classList.add("incorrect");$("quizFeedback").innerHTML=`<strong>${correct?"맞았어요!":"괜찮아요, 같이 알아가요"}</strong><p>${esc(q.explanation)}</p><button class="primary-button" id="quizNext">${quizIndex+1===questions.length?"결과 확인하기":"다음 문제"} →</button>`;$("quizNext").onclick=()=>{quizIndex++;renderQuiz();}; });
  }
  const researchedStories = {
    "11-01-01": { paragraphs: ["1512년 11월 1일, 교황 율리오 2세가 시스티나 성당에서 미사를 집전할 때 새 천장화가 모습을 드러냈습니다. 미켈란젤로가 1508년부터 작업한 거대한 그림이었습니다.", "천장 중앙에는 창세기의 이야기가 이어지고, 그중에는 두 손끝이 닿을 듯한 ‘아담의 창조’도 있습니다. 그림은 이후 르네상스 미술을 대표하는 작품이 됐습니다."], source: "바티칸 미술관", url: "https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/cappella-sistina/volta.html" },
    "11-02-01": { paragraphs: ["2000년 11월 2일, 윌리엄 셰퍼드와 유리 기젠코, 세르게이 크리칼료프가 국제우주정거장에 도착했습니다. 사흘 전 카자흐스탄 바이코누르에서 출발한 첫 상주 승무원이었습니다.", "세 사람은 식사와 수면, 통신에 필요한 설비를 준비하며 우주정거장을 사람이 살아갈 수 있는 공간으로 만들었습니다. 이날 시작된 우주정거장의 연속 유인 체류는 이후에도 이어졌습니다."], source: "NASA · 익스페디션 1", url: "https://www.nasa.gov/history/space-station-20th-expedition-1-arrives-at-the-international-space-station/" },
    "11-03-01": { paragraphs: ["1929년 11월 3일, 광주의 학생들이 일제의 차별과 식민지 교육에 맞서 거리로 나섰습니다. 며칠 전 나주역에서 일본인 학생과 한국인 학생 사이에 벌어진 충돌이 직접적인 계기가 됐습니다.", "시위는 광주에 머물지 않았습니다. 학생들의 연대와 조직적인 활동을 통해 전국으로 확산됐고, 이듬해까지 이어진 항일 학생운동은 식민지 지배에 맞선 중요한 저항으로 기억됩니다."], source: "한국민족문화대백과사전 · 광주학생운동", url: "https://encykorea.aks.ac.kr/Article/E0005301" },
    "11-04-01": { paragraphs: ["1922년 11월 4일, 하워드 카터의 발굴팀은 이집트 왕가의 계곡에서 바위에 파인 계단의 첫 단을 발견했습니다. 그 아래에는 투탕카멘의 무덤으로 이어지는 입구가 있었습니다.", "첫 계단을 찾은 날과 무덤 안을 들여다본 날은 다릅니다. 발굴팀은 계단과 봉인된 문을 더 파낸 뒤, 같은 달 후반에 내부를 확인했습니다. 이 발견은 고대 이집트의 장례 문화와 유물을 연구할 귀중한 기회를 열었습니다."], source: "옥스퍼드대학교 · 투탕카멘 발굴 기록", url: "https://tutankhamun.griffith.ox.ac.uk/seasons/1st-season-1922-1923" },
    "11-05-01": { paragraphs: ["1605년 11월 5일로 예정된 영국 의회 개회식. 공모자들은 국왕과 의회를 폭파할 계획이었지만, 전날 밤 수색 과정에서 가이 포크스와 화약이 발견됐습니다.", "의회에 가지 말라는 익명의 경고 편지가 수색으로 이어졌습니다. 의회 지하에는 화약통이 놓여 있었고, 계획은 실행되지 못했습니다. 영국 의회 기록은 이 사건을 ‘화약 음모’라고 부릅니다."], source: "영국 의회 · 화약 음모", url: "https://www.parliament.uk/about/faqs/house-of-commons-faqs/gunpowder-plot/" },
    "11-06-01": { paragraphs: ["1860년 11월 6일, 에이브러햄 링컨이 미국의 제16대 대통령으로 선출됐습니다. 당시 미국은 노예제와 그 확대를 둘러싸고 깊이 갈라져 있었습니다.", "선거 다음 달 사우스캐롤라이나가 연방에서 탈퇴했고, 다른 남부 주들도 뒤따랐습니다. 1861년 4월 포트섬터에서 교전이 시작되며 미국 남북전쟁이 발발했습니다."], source: "미국 의회도서관 · 남북전쟁 연표", url: "https://www.loc.gov/exhibits/civil-war-in-america/timeline.html" },
    "11-07-01": { paragraphs: ["1917년 11월, 러시아 수도 페트로그라드에서 볼셰비키 세력이 주요 시설을 장악하고 임시정부를 무너뜨렸습니다. 1차 세계대전과 정치적 혼란 속에서 일어난 이 사건은 러시아 혁명의 전환점이 됐습니다.", "11월에 일어났는데 왜 ‘10월혁명’일까요? 당시 러시아가 사용하던 율리우스력으로는 10월 24~25일이었기 때문입니다. 오늘날 쓰는 그레고리력으로는 11월 6~7일에 해당합니다."], source: "미국 홀로코스트 기념관 · 러시아 혁명", url: "https://encyclopedia.ushmm.org/content/en/article/the-russian-revolution-1917" }
  };
  function storyHtml(e) {
    const m=selected.month,d=selected.day,ago=yearsAgo(e);
    const researched=researchedStories[e.id];
    const paragraphs=researched?.paragraphs || (e.summary||"이야기를 준비하고 있습니다.").split(/(?<=[.!?다])\s+/).filter(Boolean);
    return `<div class="story-meta">${fmtDate(m,d)} · ${ago===null?"연도 확인 필요":`${ago}년 전`} · ${esc(e.category)}</div><h1>${esc(e.title)}</h1><figure class="story-hero">${illustration(e)}</figure><p>${esc(paragraphs[0]||e.summary)}</p>${paragraphs.slice(1).map(p=>`<p>${esc(p)}</p>`).join("")}${researched?`<div class="source-note">출처 · <a href="${esc(researched.url)}" target="_blank" rel="noopener noreferrer">${esc(researched.source)} ↗</a></div>`:""}<div class="story-actions"><button class="secondary-button" data-save="${e.id}">${saved.has(e.id)?"저장됨 ✓":"이야기 저장"}</button><button class="secondary-button" data-share="${e.id}">공유</button></div>`;
  }
  function renderHome() {
    quizEntry();
    const e=featured(selected.month,selected.day), ago=yearsAgo(e), day=getDay(selected.month,selected.day);
    $("homeDate").innerHTML=`${fmtDate(selected.month,selected.day)} <span>${ago===null?"":`· ${ago}년 전 오늘`}</span>`;
    $("heroCard").innerHTML=`<div class="hero-art">${illustration(e)}</div><div class="hero-content"><h2>${esc(e.title)}</h2><p>${esc(e.summary||"이야기를 준비하고 있습니다.")}</p><div class="hero-footer"><button class="primary-button" id="readStory">이야기 읽기 <span aria-hidden="true">→</span></button><div class="date-line"><strong>${e.year||"연도 미상"}</strong><span>·</span><span>${esc(e.category)}</span></div></div></div>`;
    $("readStory").onclick=()=>openStory(e);

    const others=day.events.filter(x=>x.id!==e.id).slice(0,5);
    $("eventCount").textContent=`${day.events.length}개의 이야기`;
    $("moreEvents").innerHTML=others.map((x,i)=>`<button class="event-row" data-event="${x.id}"><span class="event-index">${String(i+2).padStart(2,"0")}</span><span><strong>${esc(x.title)}</strong><small>${x.year||"연도 미상"}</small></span><span class="event-arrow">→</span></button>`).join("")||'<p class="empty-state">다른 사건이 없습니다.</p>';
    $("moreEvents").querySelectorAll("[data-event]").forEach(b=>b.onclick=()=>openStory(eventMap.get(b.dataset.event)));
  }
  function renderCalendar() {
    const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth()+1;
    $("monthLabel").textContent=`${y}년 ${m}월`;
    const first=new Date(y,m-1,1), start=(first.getDay()+6)%7, days=new Date(y,m,0).getDate();
    const labels=["월","화","수","목","금","토","일"];
    let html=labels.map(x=>`<div class="weekday">${x}</div>`).join("");
    for(let i=0;i<42;i++){
      const date=new Date(y,m-1,i-start+1), mm=date.getMonth()+1, dd=date.getDate(), valid=date.getMonth()===m-1;
      const locked=date>today, isSel=valid&&mm===selected.month&&dd===selected.day, isToday=date.getTime()===today.getTime();
      html+=`<button class="day-cell ${valid?"":"outside"} ${isSel?"selected":""} ${isToday?"today":""} ${locked?"locked":""}" data-date="${date.getFullYear()}-${mm}-${dd}" ${locked?'disabled aria-label="'+mm+'월 '+dd+'일 잠김"':''}>${dd}${locked?'<span class="lock-mark" aria-hidden="true"> ·</span>':''}</button>`;
    }
    $("calendarGrid").innerHTML=html;
    $("calendarGrid").querySelectorAll("[data-date]:not(:disabled)").forEach(b=>b.onclick=()=>{const [year,m0,d0]=b.dataset.date.split("-").map(Number);if(!dateMap.has(key(m0,d0)))return;selected={month:m0,day:d0};calendarMonth=new Date(year,m0-1,1);renderCalendar();renderHome();});
    const e=featured(selected.month,selected.day);$("calendarPreview").innerHTML=`<p class="preview-label">${fmtDate(selected.month,selected.day)}의 이야기</p><button class="preview-card" id="previewOpen"><span><h3>${esc(e.title)}</h3><p>${e.year||"연도 미상"}</p></span><span class="event-arrow">→</span></button>`;
    $("previewOpen").onclick=()=>openStory(e);
  }
  function renderSaved() {
    const items=[...saved].map(id=>eventMap.get(id)).filter(Boolean);
    $("savedList").innerHTML=items.length?items.map(e=>`<article class="saved-card"><div class="saved-thumb">${illustration(e,true)}</div><div><h3>${esc(e.title)}</h3><p>${e.year||"연도 미상"}</p></div><button class="save-toggle" data-remove="${e.id}" aria-label="저장 취소">♥</button></article>`).join(""):'<p class="empty-state">아직 저장한 이야기가 없습니다.<br>마음에 드는 사건을 저장해 다시 읽어보세요.</p>';
    $("savedList").querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>toggleSave(b.dataset.remove));
  }
  function toggleSave(id) { const wasSaved=saved.has(id); if(wasSaved)saved.delete(id);else saved.add(id); toast(wasSaved?"저장을 취소했어요.":"이야기를 저장했어요.");localStorage.setItem("nyearsago:saved",JSON.stringify([...saved]));renderSaved();if(currentEvent?.id===id)$("storyArticle").innerHTML=storyHtml(currentEvent); }
  document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{const id=b.dataset.view;if(id==="quizView"){startQuiz();return;}activeView(id);if(id==="calendarView")renderCalendar();if(id==="savedView")renderSaved();});
  $("calendarShortcut").onclick=()=>{calendarMonth=new Date(today.getFullYear(),selected.month-1,1);activeView("calendarView");renderCalendar();};
  $("prevMonth").onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderCalendar();};
  $("nextMonth").onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderCalendar();};
  document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>{if(navigationDepth>0)history.back();else activeView("homeView");});
  window.addEventListener("popstate", event=>{const state=event.state;if(!state?.app)return;restoringHistory=true;navigationDepth=state.depth||0;selected=state.selected||selected;if(state.eventId)currentEvent=eventMap.get(state.eventId)||null;renderHome();if(state.view==="calendarView")renderCalendar();if(state.view==="savedView")renderSaved();if(state.view==="quizView")renderQuiz();if(state.view==="storyView" && currentEvent)$("storyArticle").innerHTML=storyHtml(currentEvent);activeView(state.view||"homeView");restoringHistory=false;});
  document.addEventListener("click",async e=>{const save=e.target.closest("[data-save]");if(save)toggleSave(save.dataset.save);const share=e.target.closest("[data-share]");if(share){const item=eventMap.get(share.dataset.share);try{await navigator.share({title:item.title,text:item.summary,url:location.href})}catch{await navigator.clipboard?.writeText(location.href);toast("링크를 복사했습니다.");}}});
  function toast(text){document.querySelector(".toast")?.remove();const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=text;document.body.append(t);setTimeout(()=>t.remove(),1800);}
  renderStreak();
  history.replaceState(snapshot("homeView"), "");
  renderHome();
})();
