/* =========================================================
   전시대 신청 가능 시간 확인
   토요일 신청 : 목요일 ~ 금요일
   일요일 신청 : 금요일 ~ 토요일
========================================================= */

function isVolunteerScheduleAvailable(schedule) {

  const koreaDate =
    new Date(
      new Date().toLocaleString(
        "en-US",
        {
          timeZone: "Asia/Seoul"
        }
      )
    );

  const today =
    koreaDate.getDay();


  /* =======================================================
     특정 날짜 추가 일정
     기존 토요일 / 일요일 신청 제한을 적용하지 않음
  ======================================================= */

  if (
    getCustomVolunteerSchedule(schedule)
  ) {

    return true;

  }


  /* 토요일 오전 / 오후 */

  if (
    schedule === "토오전" ||
    schedule === "토오후"
  ) {

    return (
      today === 4 ||
      today === 5
    );

  }


  /* 일요일 오전 */

  if (
    schedule === "일오전"
  ) {

    return (
      today === 5 ||
      today === 6
    );

  }


  return false;
}

/* =========================================================
   신청용 일정 버튼 마감 표시
========================================================= */

function updateVolunteerScheduleButtonStyle() {

  const buttons =
    document.querySelectorAll(
      "#volunteerScheduleArea .volunteer-schedule-btn"
    );

  buttons.forEach(function(button) {

    const onclick =
      button.getAttribute("onclick") || "";

    let schedule = "";

    if (onclick.includes("'토오전'")) {

      schedule = "토오전";

    }

    else if (onclick.includes("'토오후'")) {

      schedule = "토오후";

    }

    else if (onclick.includes("'일오전'")) {

      schedule = "일오전";

    }

    if (!schedule) {
      return;
    }


    if (
      isVolunteerScheduleAvailable(schedule)
    ) {

      button.classList.remove(
        "application-closed"
      );

    }

    else {

      button.classList.add(
        "application-closed"
      );

    }

  });

}


/* =========================================================
   봉사 일정 선택
========================================================= */

function selectVolunteerSchedule(schedule) {

  schedule =
    String(schedule || "").trim();


 /* 신청 가능 시간 확인 */

if (
  !isVolunteerScheduleAvailable(schedule)
) {

  showSubmitConfirm(
    "지금은 신청 시간이 아닙니다.<div>알림 탭을 확인하세요</div>"
  );

  return;

}

  selectedVolunteerSchedule =
    schedule;

  selectedServiceSchedule =
    selectedVolunteerSchedule;

  selectedAdminSchedule = "";

  if (!selectedServiceSchedule) {
    return;
  }

  const scheduleArea =
    document.getElementById(
      "volunteerScheduleArea"
    );

  const applyArea =
    document.getElementById(
      "volunteerApplyArea"
    );

  const submittedArea =
    document.getElementById(
      "submittedVolunteerArea"
    );

  const mainTitle =
    document.getElementById(
      "volunteerMainTitle"
    );

  /* 봉사 요일 선택 화면 숨기기 */
  if (scheduleArea) {
    scheduleArea.style.display = "none";
  }

  /* 제목 변경 */
  if (mainTitle) {
    mainTitle.textContent =
      "봉사자를 선택해주세요";
  }

  /* 봉사자 선택 화면 열기 */
  if (applyArea) {
    applyArea.style.display = "block";
    applyArea.classList.add("show");
  }

  /* 이전 신청 결과 숨기기 */
  if (submittedArea) {
    submittedArea.style.display = "none";
  }

  /* 봉사자 명단 불러오기 */
  selectedServiceSchedule =
    selectedVolunteerSchedule;

  loadMasterNames();

  /* 선택한 봉사 일정의 관리자 배정 그룹 불러오기 */
  loadGroups().then(function() {
    renderService();
  });
}

/* =========================================================
   봉사 신청 화면 뒤로가기
========================================================= */

function goToApplyHome() {

  const scheduleArea =
    document.getElementById(
      "volunteerScheduleArea"
    );

  const applyArea =
    document.getElementById(
      "volunteerApplyArea"
    );

  const submittedArea =
    document.getElementById(
      "submittedVolunteerArea"
    );

  const mainTitle =
    document.getElementById(
      "volunteerMainTitle"
    );

  selectedVolunteerSchedule = "";
  selectedServiceSchedule = "";
  selectedAdminSchedule = "";

  if (applyArea) {
    applyArea.style.display = "none";
    applyArea.classList.remove("show");
  }

  if (submittedArea) {
    submittedArea.style.display = "none";
  }

  if (scheduleArea) {
  scheduleArea.style.display =
    "flex";
}

  if (mainTitle) {
    mainTitle.textContent =
      "요일을 선택해 주세요";
  }

}


/* =========================================================
   봉사 신청 제출
========================================================= */

async function submitVolunteerApplication() {

  const button =
    document.getElementById(
      "volunteerSubmitButton"
    );

  if (button) {

    button.disabled = true;

    button.textContent =
      "제출 중...";

  }

  try {

    const newSelections =
      getMySelections();


    const scheduleKey =
      selectedVolunteerSchedule;


    if (!scheduleKey) {

      throw new Error(
        "봉사 일정이 선택되지 않았습니다."
      );

    }


    /*
       선택한 사람이 0명이어도 정상 제출
    */
    await saveScheduleApplicants(
      scheduleKey,
      newSelections
    );


    const area =
      document.getElementById(
        "volunteerApplyArea"
      );

    const scheduleArea =
      document.getElementById(
        "volunteerScheduleArea"
      );


    if (area) {

      area.classList.remove(
        "show"
      );

      area.style.display =
        "none";

    }


    renderSubmittedVolunteers(
      newSelections
    );


    if (scheduleArea) {

      scheduleArea.style.display =
        "flex";

    }


    if (button) {

      button.disabled = false;

      button.textContent =
        "제출";

    }


    showSubmitConfirm(
      newSelections.length +
      "명이 신청됨"
    );


  } catch (error) {

    console.error(
      "봉사 신청 제출 오류:",
      error
    );


    alert(
      "봉사 신청 제출에 실패했습니다.\n" +
      (
        error.message ||
        "잠시 후 다시 시도해 주세요."
      )
    );


    if (button) {

      button.disabled = false;

      button.textContent =
        "제출";

    }

  }

}

/* =========================================================
   일정별 봉사 신청자 저장
========================================================= */

async function saveScheduleApplicants(
  scheduleKey,
  applicants
) {

  const response =
    await fetch(
      SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({

          action:
            "saveJeonsidaeScheduleApplicants",

          key:
            scheduleKey,

          applicants:
            Array.isArray(applicants)
              ? applicants
              : []

        })

      }
    );


  const data =
    await response.json();


  if (!data.success) {

    throw new Error(
      data.message ||
      "봉사 신청 저장에 실패했습니다."
    );

  }

}

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyGNTjZf3wagn7kWW0u1ZhBVnwBqQv-5MaYVM3U4lN1OjQ4JVMgckPnTIODGlL8e7yO/exec";

const MY_SELECTION_KEY =
  "saturdayMySelections";

const GROUP_KEY =
  "saturdayVolunteerGroups";

const SATURDAY_SHEET_ID =
  "1ioseyMKbz8RJ-yiBhJpCztuoRkqynVkCl5WFNnsj-iw";

const SATURDAY_SHEET_NAME =
  "토요일";


let SERVICE_AREAS = [];
let SERVICE_CONDUCTOR = "";
let SATURDAY_REFERENCE = [];
let SERVICE_ORDER = [];


let masterNames = [...DEFAULT_MASTER_NAMES];
let applicants = [];
let groups = [];
let selectedApplicants = [];
let currentView = "apply";

/* =========================================================
   제출 완료 확인창
========================================================= */

function showSubmitConfirm(message) {

  const oldOverlay =
    document.getElementById("submitConfirmOverlay");

  if (oldOverlay) {
    oldOverlay.remove();
  }

  const overlay =
    document.createElement("div");

  overlay.id =
    "submitConfirmOverlay";

  overlay.style.cssText = `
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(0,0,0,0.18);
  `;

  const box =
    document.createElement("div");

  box.style.cssText = `
    width:350px;
    height:180px;
    box-sizing:border-box;
    padding:20px 28px 18px;
    border-radius:13px;
    background:#333;
    color:#fff;
    text-align:center;
    box-shadow:0 4px 12px rgba(0,0,0,0.25);
  `;

  const text =
  document.createElement("div");

text.style.cssText = `
  width:100%;
  min-height:76px;
  line-height:38px;
  font-size:22px;
  font-weight:700;
  white-space:normal;
  overflow:visible;
`;

text.innerHTML =
  message;

  const button =
    document.createElement("button");

  button.type =
    "button";

  button.textContent =
    "확인";

  button.style.cssText = `
    width:100%;
    height:53px;
    margin-top:8px;
    border:0;
    border-radius:11px;
    background:#fff;
    color:#333;
    font-size:20px;
    font-weight:700;
    cursor:pointer;
  `;

  button.onclick =
    function() {
      overlay.remove();
    };

  box.appendChild(text);
  box.appendChild(button);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/* =========================================================
   제출한 봉사자 표시
========================================================= */

function renderSubmittedVolunteers(
  names
) {

  const box =
    document.getElementById(
      "submittedVolunteerNames"
    );

  if (!box) {
    return;
  }


  box.innerHTML = "";


  if (
    !Array.isArray(names) ||
    names.length === 0
  ) {

    const empty =
      document.createElement("div");

    empty.className =
      "service-empty";

    empty.textContent =
      "신청한 봉사자가 없습니다.";

    box.appendChild(empty);

    return;

  }


  names.forEach(function(name) {

    const item =
      document.createElement("div");

    item.className =
      "submitted-volunteer-name";

    item.textContent =
      name;

    box.appendChild(item);

  });

}

/* =========================================================
   봉사용에서 선택한 전시대 일정
========================================================= */

let selectedServiceSchedule = "";

let serviceCancelReason = "";

/* =========================================================
   특정 날짜 추가 봉사 일정
========================================================= */

let customVolunteerSchedules = [];


/*
   특정 날짜 봉사 일정 추가 팝업 열기
*/
function openCustomVolunteerSchedulePopup() {

  const overlay =
    document.getElementById(
      "customVolunteerScheduleOverlay"
    );

  const dateInput =
    document.getElementById(
      "customScheduleDate"
    );

  const startSelect =
    document.getElementById(
      "customScheduleStartTime"
    );

  const endSelect =
    document.getElementById(
      "customScheduleEndTime"
    );


  if (!overlay) {
    return;
  }


  /*
     관리용에서 팝업이 정상적으로 보이도록
     숨겨진 serviceView 밖으로 이동
  */

  if (
    overlay.parentElement !==
    document.body
  ) {

    document.body.appendChild(
      overlay
    );

  }


  /*
     날짜 초기화
  */

  if (dateInput) {
    dateInput.value = "";
  }


  /*
     봉사 시작 시간 목록 생성
     오전 10:00 ~ 오후 5:00
     10분 간격
  */

  if (startSelect) {

    startSelect.innerHTML = "";

    for (
      let hour = 10;
      hour <= 17;
      hour++
    ) {

      const startMinute =
        hour === 17 ? 0 : 0;

      const endMinute =
        hour === 17 ? 0 : 50;

      for (
        let minute = startMinute;
        minute <= endMinute;
        minute += 10
      ) {

        if (
          hour === 17 &&
          minute > 0
        ) {
          break;
        }


        let displayHour =
          hour < 12
            ? "오전 " + hour
            : hour === 12
              ? "오후 12"
              : "오후 " + (hour - 12);


        const timeText =
          displayHour +
          ":" +
          String(minute).padStart(2, "0");


        const option =
          document.createElement("option");

        option.value = timeText;
        option.textContent = timeText;

        startSelect.appendChild(option);

      }

    }


    /*
       기본 시작 시간
    */

    startSelect.value =
      "오전 10:00";

  }


  /*
     봉사마감
     봉사시작 시간 + 2시간
  */

  function updateCustomScheduleEndTime() {

    const startSelect =
      document.getElementById(
        "customScheduleStartTime"
      );

    const endSelect =
      document.getElementById(
        "customScheduleEndTime"
      );


    if (
      !startSelect ||
      !endSelect ||
      !startSelect.value
    ) {
      return;
    }


    const startText =
      startSelect.value;


    const match =
      startText.match(
        /(오전|오후)\s*(\d+):(\d+)/
      );


    if (!match) {
      return;
    }


    let period = match[1];

    let hour =
      Number(match[2]);

    const minute =
      Number(match[3]);


    /*
       24시간으로 변환
    */

    if (
      period === "오전" &&
      hour === 12
    ) {
      hour = 0;
    }


    if (
      period === "오후" &&
      hour !== 12
    ) {
      hour += 12;
    }


    /*
       2시간 추가
    */

    hour += 2;


    /*
       24시간을 넘으면 종료
    */

    if (hour >= 24) {
      hour -= 24;
    }


    /*
       다시 오전 / 오후 표시
    */

    const endPeriod =
      hour < 12
        ? "오전"
        : "오후";


    let displayHour =
      hour % 12;


    if (displayHour === 0) {
      displayHour = 12;
    }


    const endTime =
      endPeriod +
      " " +
      displayHour +
      ":" +
      String(minute).padStart(2, "0");


    endSelect.innerHTML = "";


    const option =
      document.createElement("option");

    option.value = endTime;
    option.textContent = endTime;


    endSelect.appendChild(option);

    endSelect.disabled = true;

  }


  /*
     시작 시간 변경
  */

  if (startSelect) {

    startSelect.onchange =
      updateCustomScheduleEndTime;

  }


  /*
     기본 종료 시간 계산
  */

  updateCustomScheduleEndTime();


  /*
     확인 버튼 연결
  */

  const confirmButton =
    document.getElementById(
      "customVolunteerScheduleConfirmButton"
    );

  if (confirmButton) {

    confirmButton.onclick =
      async function() {

        await confirmCustomVolunteerSchedule();

      };

  }


  /*
     팝업 표시
  */

  overlay.style.display = "flex";

}

/*
   일정 Key로 특정 날짜 일정 찾기
*/
function getCustomVolunteerSchedule(scheduleKey) {

  return customVolunteerSchedules.find(
    function(item) {

      return String(
        item.key || ""
      ).trim() === String(
        scheduleKey || ""
      ).trim();

    }
  ) || null;

}


/*
   특정 날짜 일정 이름
*/
function getVolunteerScheduleName(scheduleKey) {

  const fixedNames = {

    "토오전":
      "토요일 오전",

    "토오후":
      "토요일 오후",

    "일오전":
      "일요일 오전"

  };

  if (fixedNames[scheduleKey]) {
    return fixedNames[scheduleKey];
  }


  const custom =
    getCustomVolunteerSchedule(
      scheduleKey
    );

  if (custom) {

    return String(
      custom.displayName ||
      custom.dateText ||
      scheduleKey
    ).trim();

  }


  return scheduleKey;

}


/*
   특정 날짜 일정 추가 팝업 닫기
*/
function closeCustomVolunteerSchedulePopup() {

  const overlay =
    document.getElementById(
      "customVolunteerScheduleOverlay"
    );

  if (!overlay) {
    return;
  }

  overlay.style.display = "none";

}


/*
   특정 날짜 일정 추가 확인
*/
async function confirmCustomVolunteerSchedule() {

  const dateInput =
    document.getElementById(
      "customScheduleDate"
    );

  const startSelect =
    document.getElementById(
      "customScheduleStartTime"
    );

  const endSelect =
    document.getElementById(
      "customScheduleEndTime"
    );


  if (
    !dateInput ||
    !startSelect ||
    !endSelect
  ) {
    return;
  }


  const serviceDate =
    String(
      dateInput.value || ""
    ).trim();


  const startTime =
    String(
      startSelect.value || ""
    ).trim();


  const endTime =
    String(
      endSelect.value || ""
    ).trim();


  if (!serviceDate) {

    alert(
      "날짜를 선택해 주세요."
    );

    return;
  }


  if (!startTime) {

    alert(
      "봉사시작 시간을 선택해 주세요."
    );

    return;
  }


  if (!endTime) {

    alert(
      "봉사마감 시간을 확인해 주세요."
    );

    return;
  }


  /*
     일정 Key는 날짜 자체를 사용
     예: 2026-10-06
  */

  const key =
    serviceDate;


  /*
     봉사시간
     예:
     오전 10:00 ~ 오후 12:00
  */

  const time =
    startTime +
    " ~ " +
    endTime;


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "saveJeonsidaeExtraSchedule",

              key:
                key,

              serviceDate:
                serviceDate,

              time:
                time,

              applicationStart:
                "",

              applicationEnd:
                ""

            })
        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "일정 저장에 실패했습니다."
      );

    }


    /*
       저장 성공
       → 팝업 닫기
    */

    closeCustomVolunteerSchedulePopup();


    /*
       서버에 저장된 추가 일정 다시 불러오기
       → 신청용
       → 봉사용
       → 관리용
       모두 다시 표시
    */

    await loadCustomVolunteerSchedules();

    renderCustomVolunteerSchedules();


    /*
       추가 완료 안내
    */

    alert(
      "추가 되었습니다."
    );


  } catch (error) {

    console.error(
      "특정 날짜 일정 저장 오류:",
      error
    );


    alert(
      error.message ||
      "일정 저장에 실패했습니다."
    );

  }

}
/*
   특정 날짜 일정 시간
*/
function getVolunteerScheduleTime(scheduleKey) {

  const fixedTimes = {

    "토오전": {
      startTime: "오전 10:00",
      endTime: "오후 12:00"
    },

    "토오후": {
      startTime: "오후 1:00",
      endTime: "오후 3:00"
    },

    "일오전": {
      startTime: "오전 10:00",
      endTime: "오후 12:00"
    }

  };


  if (fixedTimes[scheduleKey]) {

    return fixedTimes[scheduleKey];

  }


  const custom =
    getCustomVolunteerSchedule(
      scheduleKey
    );


  if (custom) {

    return {

      startTime:
        String(
          custom.startTime || ""
        ).trim(),

      endTime:
        String(
          custom.endTime || ""
        ).trim()

    };

  }


  return {
    startTime: "",
    endTime: ""
  };

}

const ADMIN_PASSWORD = "3061";
const ADMIN_PASSWORD_KEY = "saturdayAdminPassword";
let adminAuthenticated = false;


document.addEventListener(
  "DOMContentLoaded",
  async function() {

    loadSettings();

    await loadCustomVolunteerSchedules();

    await loadGroups();

    await loadServiceData();

    renderService();

    updateVolunteerScheduleButtonStyle();

  }
);

/* =========================================================
   설정
========================================================= */

function toggleSettings() {

  const panel =
    document.getElementById(
      "settingsPanel"
    );

  if (!panel) {
    return;
  }

  panel.classList.toggle("show");

}


function setTheme(theme) {

  document.body.classList.remove(
    "light",
    "dark"
  );

  document.body.classList.add(
    theme
  );

  localStorage.setItem(
    "jeonsidaeTheme",
    theme
  );

  updateSettingButtons();

}


function changeFontSize(amount) {

  const current =
  Number(
    localStorage.getItem(
      "jeonsidaeFontSize"
    ) || "100"
  );

  const next =
    Math.min(
      150,
      Math.max(
        80,
        current + amount
      )
    );

  document.documentElement.style.setProperty(
    "--font-scale",
    next / 100
  );

  localStorage.setItem(
  "jeonsidaeFontSize",
  String(next)
);

  const display =
    document.getElementById(
      "fontSizeDisplay"
    );

  if (display) {
    display.textContent =
      next + "%";
  }

}


function updateSettingButtons() {

  const theme =
    localStorage.getItem(
      "jeonsidaeTheme"
    ) || "light";

  const lightButton =
    document.getElementById(
      "lightButton"
    );

  const darkButton =
    document.getElementById(
      "darkButton"
    );

  if (lightButton) {

    lightButton.classList.toggle(
      "active",
      theme === "light"
    );

  }

  if (darkButton) {

    darkButton.classList.toggle(
      "active",
      theme === "dark"
    );

  }

}


function loadSettings() {

  const theme =
    localStorage.getItem(
      "jeonsidaeTheme"
    ) || "dark";

  const fontSize =
    Number(
      localStorage.getItem(
        "jeonsidaeFontSize"
      ) || "100"
    );

  setTheme(
    theme
  );

  document.documentElement.style.setProperty(
    "--font-scale",
    fontSize / 100
  );

  const display =
    document.getElementById(
      "fontSizeDisplay"
    );

  if (display) {
    display.textContent =
      fontSize + "%";
  }

}

/* =========================================================
   신청용 / 봉사용 / 관리용에 추가 일정 표시
========================================================= */

function renderCustomVolunteerSchedules() {


  /* =======================================================
     신청용
  ======================================================= */

  const volunteerArea =
    document.getElementById(
      "volunteerScheduleArea"
    );


  if (volunteerArea) {

    volunteerArea
      .querySelectorAll(
        ".custom-volunteer-schedule"
      )
      .forEach(function(button) {

        button.remove();

      });


   customVolunteerSchedules.forEach(
  function(schedule) {

    const button =
      document.createElement("button");

    button.type =
      "button";

    button.className =
      "service-schedule-button custom-service-schedule";

    button.textContent =
      String(
        schedule.key ||
        schedule.displayName ||
        schedule.dateText
      ).replace(
        /^(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})$/,
        "$1_$2:$3"
      );

    button.onclick =
      function() {

        selectServiceSchedule(
          schedule.key
        );

      };

    const customServiceArea =
      document.getElementById(
        "customServiceScheduleButtons"
      );

    if (customServiceArea) {

      customServiceArea.appendChild(
        button
      );

    }

  }
);

  /* =======================================================
     봉사용
  ======================================================= */

  const serviceSelector =
    document.getElementById(
      "serviceScheduleSelector"
    );


  if (serviceSelector) {

    serviceSelector
      .querySelectorAll(
        ".custom-service-schedule"
      )
      .forEach(function(button) {

        button.remove();

      });


    customVolunteerSchedules.forEach(
      function(schedule) {

        const button =
          document.createElement("button");

        button.type =
          "button";

        button.className =
          "service-schedule-button custom-service-schedule";


         button.textContent =
  String(
    schedule.key ||
    schedule.displayName ||
    schedule.dateText
  ).replace(
    /^(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})$/,
    "$1_$2:$3"
  );


        button.onclick =
          function() {

            selectServiceSchedule(
              schedule.key
            );

          };


        serviceSelector.appendChild(
          button
        );

      }
    );

  }


  /* =======================================================
     관리용
  ======================================================= */

  const adminSelector =
    document.getElementById(
      "adminScheduleSelector"
    );


  if (adminSelector) {

    adminSelector
      .querySelectorAll(
        ".custom-admin-schedule"
      )
      .forEach(function(button) {

        button.remove();

      });
 

        customVolunteerSchedules.forEach(
      function(schedule) {

        const row =
          document.createElement("div");

        row.className =
          "custom-admin-schedule";

        const button =
          document.createElement("button");

        button.type =
          "button";

        button.className =
          "admin-schedule-button";

        button.textContent =
          String(
            schedule.key ||
            schedule.displayName ||
            schedule.dateText
          ).replace(
            /^(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})$/,
            "$1_$2:$3"
          );

        button.onclick =
          function() {

            selectAdminSchedule(
              schedule.key
            );

          };

        const time =
          document.createElement("span");

        time.textContent =
          (
            schedule.startTime ||
            ""
          ) +
          " ~ " +
          (
            schedule.endTime ||
            ""
          );

        const deleteButton =
          document.createElement("button");

        deleteButton.type =
          "button";

        deleteButton.className =
          "custom-schedule-delete";

        deleteButton.textContent =
          "삭제";

        deleteButton.onclick =
          function(event) {

            event.stopPropagation();

            deleteCustomVolunteerSchedule(
              schedule.key
            );

          };

        row.appendChild(
          button
        );

        row.appendChild(
          time
        );

        row.appendChild(
          deleteButton
        );

        adminSelector.appendChild(
          row
        );

      }
    );

  }
}

  
/* =========================================================
   관리자용 봉사 일정 선택
========================================================= */

function selectAdminSchedule(scheduleKey) {

  selectedAdminSchedule =
    String(scheduleKey || "").trim();

  if (!selectedAdminSchedule) {
    return;
  }

  selectedApplicants = [];

  const scheduleSelector =
    document.getElementById(
      "adminScheduleSelector"
    );

  const managementArea =
    document.getElementById(
      "adminManagementArea"
    );

  /* 일정 선택 화면 숨기기 */
  if (scheduleSelector) {
    scheduleSelector.style.display =
      "none";
  }

  /* 선택한 일정의 관리자 화면 표시 */
  if (managementArea) {
    managementArea.style.display =
      "block";
  }

  /* 신청자 명단 불러오기 */
  loadApplicants();

}

/* =========================================================
   관리자용 특정 날짜 일정 추가 버튼
========================================================= */

function addCustomScheduleButton(
  container
) {

  if (
    container.querySelector(
      "#addCustomScheduleButton"
    )
  ) {
    return;
  }


  const button =
    document.createElement("button");

  button.type =
    "button";

  button.id =
    "addCustomScheduleButton";

  button.className =
    "admin-schedule-add-button";

  button.textContent =
    "+ 추가";


  button.onclick =
    function() {

      showAddCustomSchedulePopup();

    };


  container.appendChild(
    button
  );

}

/* =========================================================
   특정 날짜 봉사 일정 추가 팝업
========================================================= */

function showAddCustomSchedulePopup() {

  const old =
    document.getElementById(
      "customScheduleOverlay"
    );

  if (old) {
    old.remove();
  }


  const overlay =
    document.createElement("div");

  overlay.id =
    "customScheduleOverlay";

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(0,0,0,.45);
    padding:20px;
    box-sizing:border-box;
  `;


  const box =
    document.createElement("div");

  box.style.cssText = `
    width:100%;
    max-width:430px;
    box-sizing:border-box;
    padding:24px;
    border-radius:16px;
    background:#fff;
    color:#222;
    box-shadow:0 8px 30px rgba(0,0,0,.3);
  `;


  box.innerHTML = `

    <div
      style="
        font-size:22px;
        font-weight:800;
        text-align:center;
        margin-bottom:20px;
      "
    >
      봉사 일정 추가
    </div>


    <div style="margin-bottom:14px;">

      <label
        style="
          display:block;
          font-weight:700;
          margin-bottom:6px;
        "
      >
        날짜
      </label>

      <input
        type="date"
        id="customScheduleDate"
        style="
          width:100%;
          height:52px;
          box-sizing:border-box;
          padding:0 12px;
          border:2px solid #455A64;
          border-radius:10px;
          font-size:18px;
          font-weight:700;
        "
      >

    </div>


    <div style="margin-bottom:14px;">

      <label
        style="
          display:block;
          font-weight:700;
          margin-bottom:6px;
        "
      >
        봉사시작
      </label>

      <select
        id="customScheduleStart"
        style="
          width:100%;
          height:52px;
          box-sizing:border-box;
          padding:0 12px;
          border:2px solid #455A64;
          border-radius:10px;
          font-size:18px;
          font-weight:700;
        "
      ></select>

    </div>


    <div style="margin-bottom:20px;">

      <label
        style="
          display:block;
          font-weight:700;
          margin-bottom:6px;
        "
      >
        봉사마감
      </label>

      <input
        type="text"
        id="customScheduleEnd"
        readonly
        style="
          width:100%;
          height:52px;
          box-sizing:border-box;
          padding:0 12px;
          border:2px solid #455A64;
          border-radius:10px;
          background:#f1f1f1;
          font-size:18px;
          font-weight:700;
        "
      >

    </div>


    <div
      style="
        display:flex;
        gap:10px;
      "
    >

      <button
        type="button"
        id="customScheduleCancel"
        style="
          flex:1;
          height:58px;
          border:0;
          border-radius:10px;
          font-size:18px;
          font-weight:700;
        "
      >
        취소
      </button>


      <button
        type="button"
        id="customScheduleConfirm"
        style="
          flex:1;
          height:58px;
          border:0;
          border-radius:10px;
          background:#455A64;
          color:#fff;
          font-size:18px;
          font-weight:700;
        "
      >
        확인
      </button>

    </div>

  `;


  overlay.appendChild(box);

  document.body.appendChild(
    overlay
  );


  const dateInput =
    document.getElementById(
      "customScheduleDate"
    );


  const startSelect =
    document.getElementById(
      "customScheduleStart"
    );


  const endInput =
    document.getElementById(
      "customScheduleEnd"
    );


  /* =======================================================
     날짜 기본값 = 오늘
  ======================================================= */

  const today =
    new Date();


  const yyyy =
    today.getFullYear();


  const mm =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");


  const dd =
    String(
      today.getDate()
    ).padStart(2, "0");


  dateInput.value =
    `${yyyy}-${mm}-${dd}`;


  /* =======================================================
     오전 10:00 ~ 오후 5:00 10분 단위
  ======================================================= */

  for (
    let minutes = 10 * 60;
    minutes <= 17 * 60;
    minutes += 10
  ) {

    const hour =
      Math.floor(
        minutes / 60
      );

    const minute =
      minutes % 60;

    const ampm =
      hour < 12
        ? "오전"
        : "오후";


    const displayHour =
      hour > 12
        ? hour - 12
        : hour;


    const timeText =
      `${ampm} ${displayHour}:${String(
        minute
      ).padStart(2, "0")}`;


    const option =
      document.createElement(
        "option"
      );


    option.value =
      minutes;


    option.textContent =
      timeText;


    startSelect.appendChild(
      option
    );

  }


  startSelect.value =
    String(
      10 * 60
    );


  function updateEndTime() {

    const startMinutes =
      Number(
        startSelect.value
      );


    const endMinutes =
      startMinutes + 120;


    const endHour =
      Math.floor(
        endMinutes / 60
      );


    const endMinute =
      endMinutes % 60;


    const endAmpm =
      endHour < 12
        ? "오전"
        : "오후";


    const endDisplayHour =
      endHour > 12
        ? endHour - 12
        : endHour;


    endInput.value =
      `${endAmpm} ${endDisplayHour}:${String(
        endMinute
      ).padStart(2, "0")}`;

  }


  startSelect.addEventListener(
    "change",
    updateEndTime
  );


  updateEndTime();


  document
    .getElementById(
      "customScheduleCancel"
    )
    .onclick =
    function() {

      overlay.remove();

    };


  document
    .getElementById(
      "customScheduleConfirm"
    )
    .onclick =
    function() {

      createCustomVolunteerSchedule();

    };

}

/* =========================================================
   특정 날짜 봉사 일정 생성
========================================================= */

async function createCustomVolunteerSchedule() {

  const dateInput =
    document.getElementById(
      "customScheduleDate"
    );

  const startSelect =
    document.getElementById(
      "customScheduleStart"
    );

  const endInput =
    document.getElementById(
      "customScheduleEnd"
    );


  if (
    !dateInput ||
    !startSelect ||
    !endInput
  ) {
    return;
  }


  const date =
    String(
      dateInput.value || ""
    ).trim();


  if (!date) {

    alert(
      "날짜를 선택해 주세요."
    );

    return;

  }


  const startTime =
    startSelect
      .selectedOptions[0]
      ?.textContent || "";


  const endTime =
    endInput.value || "";


  const dateObject =
    new Date(
      date + "T00:00:00"
    );


  const year =
    dateObject.getFullYear();


  const month =
    dateObject.getMonth() + 1;


  const day =
    dateObject.getDate();


  const weekdayNames = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토"
  ];


  const weekday =
    weekdayNames[
      dateObject.getDay()
    ];


  const dateText =
    `${year}년 ${month}월 ${day}일(${weekday})`;


  const displayName =
    dateText;


  const scheduleKey =
    date;


  const existing =
    getCustomVolunteerSchedule(
      scheduleKey
    );


  if (existing) {

    alert(
      "이미 등록된 날짜입니다."
    );

    return;

  }


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "createCustomVolunteerSchedule",

              key:
                scheduleKey,

              date:
                date,

              dateText:
                dateText,

              displayName:
                displayName,

              startTime:
                startTime,

              endTime:
                endTime

            })

        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "봉사 일정 추가에 실패했습니다."
      );

    }


    const overlay =
      document.getElementById(
        "customScheduleOverlay"
      );


    if (overlay) {
      overlay.remove();
    }


    await loadCustomVolunteerSchedules();


    showSubmitConfirm(
      "봉사 일정이 추가되었습니다."
    );


  } catch (error) {

    console.error(
      "특정 날짜 봉사 일정 추가 오류:",
      error
    );


    alert(
      "봉사 일정 추가에 실패했습니다.\n" +
      (
        error.message ||
        "잠시 후 다시 시도해 주세요."
      )
    );

  }

}

/* =========================================================
   특정 날짜 봉사 일정 삭제
========================================================= */

async function deleteCustomVolunteerSchedule(
  scheduleKey
) {

  const schedule =
    getCustomVolunteerSchedule(
      scheduleKey
    );


  if (!schedule) {
    return;
  }


  if (
    !confirm(
      (
        schedule.displayName ||
        schedule.dateText ||
        scheduleKey
      ) +
      "\n\n이 봉사 일정을 삭제하시겠습니까?"
    )
  ) {

    return;

  }


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "deleteCustomVolunteerSchedule",

              key:
                scheduleKey

            })

        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "봉사 일정 삭제에 실패했습니다."
      );

    }


    customVolunteerSchedules =
      customVolunteerSchedules.filter(
        function(item) {

          return (
            String(item.key || "")
              .trim() !==
            String(scheduleKey || "")
              .trim()
          );

        }
      );


    renderCustomVolunteerSchedules();


    showSubmitConfirm(
      "봉사 일정이 삭제되었습니다."
    );


  } catch (error) {

    console.error(
      "특정 날짜 봉사 일정 삭제 오류:",
      error
    );


    alert(
      "봉사 일정 삭제에 실패했습니다.\n" +
      (
        error.message ||
        "잠시 후 다시 시도해 주세요."
      )
    );

  }

}

/* =========================================================
   관리자용 일정 선택으로 돌아가기
========================================================= */

function backToAdminSchedule() {

  selectedAdminSchedule = "";
  selectedApplicants = [];

  const scheduleSelector =
    document.getElementById(
      "adminScheduleSelector"
    );

  const managementArea =
    document.getElementById(
      "adminManagementArea"
    );

  if (managementArea) {
    managementArea.style.display =
      "none";
  }

  if (scheduleSelector) {
    scheduleSelector.style.display =
      "block";
  }

}

function showView(view) {

  if (
    view === "admin" &&
    !adminAuthenticated
  ) {

    const savedPassword =
      localStorage.getItem(
        ADMIN_PASSWORD_KEY
      );

    if (savedPassword === ADMIN_PASSWORD) {

      adminAuthenticated = true;

    } else {

      showAdminLogin();

      return;

    }

  }


  currentView = view;


  document
    .querySelectorAll(".view")
    .forEach(function(element) {

      element.classList.remove("active");

    });


  if (view === "notice") {

    document
      .getElementById("noticeView")
      .classList.add("active");

    document
      .getElementById("topTitle")
      .textContent = "전시대";

    setActiveNav("navNotice");

    return;

  }


  if (view === "apply") {

    document
      .getElementById("applyView")
      .classList.add("active");

    document
      .getElementById("topTitle")
      .textContent = "전시대";

    setActiveNav("navApply");

    loadMasterNames();

    return;

  }


  if (view === "admin") {

  document
    .getElementById("adminView")
    .classList.add("active");

  document
    .getElementById("topTitle")
    .textContent = "전시대";

  setActiveNav("navAdmin");

  loadCustomVolunteerSchedules();


  /* 관리자 화면에 처음 들어오면
     일정 선택 화면만 표시 */

  selectedAdminSchedule = "";

  selectedApplicants = [];


  const scheduleSelector =
    document.getElementById(
      "adminScheduleSelector"
    );

  const managementArea =
    document.getElementById(
      "adminManagementArea"
    );


  /* 일정 선택 화면 다시 표시 */
  if (scheduleSelector) {

    scheduleSelector.style.display =
      "block";

  }


  /* 관리자 관리 화면 숨기기 */
  if (managementArea) {

    managementArea.style.display =
      "none";

  }


  document
    .querySelectorAll(
      ".admin-schedule-button"
    )
    .forEach(function(button) {

      button.classList.remove(
        "selected"
      );

    });


  return;

}

  if (view === "service") {

    document
      .getElementById("serviceView")
      .classList.add("active");

    document
      .getElementById("topTitle")
      .textContent = "전시대";

    setActiveNav("navService");

    Promise.all([
      loadGroups(),
      loadServiceData(),
      loadSaturdayReference()
    ]).then(function() {

      renderService();

    });

    return;

  }

}


function showAdminLogin() {

  const overlay =
    document.getElementById(
      "adminLoginOverlay"
    );

  const input =
    document.getElementById(
      "adminPasswordInput"
    );

  const checkbox =
    document.getElementById(
      "saveAdminPassword"
    );

  if (!overlay || !input) {
    return;
  }

  const saved =
    localStorage.getItem(
      ADMIN_PASSWORD_KEY
    );

  input.value = "";

  if (checkbox) {
    checkbox.checked =
      saved === ADMIN_PASSWORD;
  }

  overlay.style.display = "flex";

  setTimeout(function() {

    input.focus();

  }, 50);

}


function cancelAdminLogin() {

  const overlay =
    document.getElementById(
      "adminLoginOverlay"
    );

  const input =
    document.getElementById(
      "adminPasswordInput"
    );

  if (input) {
    input.value = "";
  }

  if (overlay) {
    overlay.style.display = "none";
  }

}


function checkAdminPassword() {

  const input =
    document.getElementById(
      "adminPasswordInput"
    );

  const checkbox =
    document.getElementById(
      "saveAdminPassword"
    );

  const password =
    input
      ? input.value.trim()
      : "";

  if (password !== ADMIN_PASSWORD) {

    alert("비밀번호가 올바르지 않습니다.");

    return;

  }

  adminAuthenticated = true;

  if (checkbox && checkbox.checked) {

    localStorage.setItem(
      ADMIN_PASSWORD_KEY,
      ADMIN_PASSWORD
    );

  } else {

    localStorage.removeItem(
      ADMIN_PASSWORD_KEY
    );

  }

  cancelAdminLogin();

  showView("admin");

}


function setActiveNav(id) {

  document
    .querySelectorAll(".nav-button")
    .forEach(function(button) {

      button.classList.remove("active");

    });

  const target =
    document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }

}


function goBack() {

  if (currentView !== "apply") {

    showView("apply");

    return;

  }

  history.back();

}


function loadMasterNames() {

  masterNames = [...DEFAULT_MASTER_NAMES];

  renderNames();

}

/* =========================================================
   특정 날짜 일정 불러오기
========================================================= */

async function loadCustomVolunteerSchedules() {

  try {

    const response =
      await fetch(
        SCRIPT_URL +
        "?action=getCustomVolunteerSchedules&t=" +
        Date.now()
      );

    const data =
      await response.json();

    if (!data.success) {

      throw new Error(
        data.message ||
        "특정 날짜 일정을 불러오지 못했습니다."
      );

    }

    customVolunteerSchedules =
      Array.isArray(data.schedules)
        ? data.schedules.map(function(schedule) {

            return {

              key:
                String(
                  schedule.key || ""
                ).trim(),

              date:
                String(
                  schedule.date ||
                  schedule.serviceDate ||
                  ""
                ).trim(),

              dateText:
                String(
                  schedule.dateText ||
                  ""
                ).trim(),

              displayName:
                String(
                  schedule.displayName ||
                  schedule.dateText ||
                  ""
                ).trim(),

              startTime:
                String(
                  schedule.startTime ||
                  ""
                ).trim(),

              endTime:
                String(
                  schedule.endTime ||
                  ""
                ).trim(),

              time:
                String(
                  schedule.time ||
                  ""
                ).trim(),

              applicationStart:
                String(
                  schedule.applicationStart ||
                  ""
                ).trim(),

              applicationEnd:
                String(
                  schedule.applicationEnd ||
                  ""
                ).trim()

            };

          })
        : [];

    /*
       특정 날짜 일정이 새로 불러와졌으므로
       일정 선택 화면도 다시 그립니다.
    */

    renderCustomVolunteerSchedules();

    } catch (error) {

    console.error(
      "특정 날짜 일정 불러오기 오류:",
      error
    );

    alert(
      "추가 일정을 불러오지 못했습니다.\n\n" +
      (
        error.message ||
        String(error)
      )
    );

  }
}

/* =========================================================
   특정 날짜 일정 가져오기
========================================================= */

function getCustomVolunteerSchedule(key) {

  const targetKey =
    String(
      key || ""
    ).trim();

  if (!targetKey) {
    return null;
  }

  if (
    !Array.isArray(
      customVolunteerSchedules
    )
  ) {
    return null;
  }

  return (
    customVolunteerSchedules.find(
      function(schedule) {

        return (
          String(
            schedule.key || ""
          ).trim() === targetKey
        );

      }
    ) ||
    null
  );

}


/* =========================================================
   특정 날짜 일정 날짜 표시
========================================================= */

function formatCustomScheduleDate(dateValue) {

  const date =
    new Date(
      String(
        dateValue || ""
      ) +
      "T00:00:00"
    );

  if (
    isNaN(
      date.getTime()
    )
  ) {

    return "";

  }

  const weekdayNames = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토"
  ];

  return (
    date.getFullYear() +
    "년 " +
    (date.getMonth() + 1) +
    "월 " +
    date.getDate() +
    "일(" +
    weekdayNames[
      date.getDay()
    ] +
    ")"
  );

}


/* =========================================================
   특정 날짜 일정 시간 표시
========================================================= */

function getCustomScheduleTimeText(
  schedule
) {

  if (!schedule) {
    return "";
  }

  if (
    schedule.time
  ) {

    return String(
      schedule.time
    ).trim();

  }

  const start =
    String(
      schedule.startTime || ""
    ).trim();

  const end =
    String(
      schedule.endTime || ""
    ).trim();

  if (
    start &&
    end
  ) {

    return (
      start +
      " ~ " +
      end
    );

  }

  return start || end || "";

}


/* =========================================================
   특정 날짜 일정 추가
========================================================= */

function addCustomVolunteerSchedule() {

  if (
    document.getElementById(
      "customSchedulePopup"
    )
  ) {

    return;

  }


  const overlay =
    document.createElement("div");

  overlay.id =
    "customSchedulePopup";

  overlay.className =
    "custom-schedule-popup";


  overlay.innerHTML = `

    <div class="custom-schedule-popup-box">

      <div class="custom-schedule-popup-title">
        특정 날짜 일정 추가
      </div>


      <div class="custom-schedule-field">

        <label>
          날짜
        </label>

        <input
          type="date"
          id="customScheduleDate"
        >

      </div>


      <div class="custom-schedule-field">

        <label>
          봉사시작
        </label>

        <select
          id="customScheduleStartTime"
        ></select>

      </div>


      <div class="custom-schedule-field">

        <label>
          봉사마감
        </label>

        <input
          type="text"
          id="customScheduleEndTime"
          readonly
        >

      </div>


      <div class="custom-schedule-popup-buttons">

        <button
          type="button"
          id="customScheduleConfirm"
        >
          확인
        </button>

        <button
          type="button"
          id="customScheduleCancel"
        >
          취소
        </button>

      </div>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  const dateEl =
    document.getElementById(
      "customScheduleDate"
    );

  const startEl =
    document.getElementById(
      "customScheduleStartTime"
    );

  const endEl =
    document.getElementById(
      "customScheduleEndTime"
    );


  /*
     오늘 날짜를 기본값으로 표시
  */

  const today =
    new Date();

  const yyyy =
    today.getFullYear();

  const mm =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dd =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  dateEl.value =
    yyyy +
    "-" +
    mm +
    "-" +
    dd;


  /*
     오전 10:00 ~ 오후 5:00
     10분 간격
  */

  for (
    let minutes = 10 * 60;
    minutes <= 17 * 60;
    minutes += 10
  ) {

    const hour =
      Math.floor(
        minutes / 60
      );

    const minute =
      minutes % 60;

    const ampm =
      hour < 12
        ? "오전"
        : "오후";

    const displayHour =
      hour > 12
        ? hour - 12
        : hour;

    const timeText =
      ampm +
      " " +
      displayHour +
      ":" +
      String(
        minute
      ).padStart(
        2,
        "0"
      );


    const option =
      document.createElement(
        "option"
      );

    option.value =
      String(minutes);

    option.textContent =
      timeText;

    startEl.appendChild(
      option
    );

  }


  /*
     기본 시작시간
     오전 10:00
  */

  startEl.value =
    String(
      10 * 60
    );


  /*
     시작시간 + 2시간
  */

  function updateCustomEndTime() {

    const startMinutes =
      Number(
        startEl.value
      );

    const endMinutes =
      startMinutes +
      120;

    const endHour =
      Math.floor(
        endMinutes / 60
      );

    const endMinute =
      endMinutes % 60;

    const endAmpm =
      endHour < 12
        ? "오전"
        : "오후";

    const endDisplayHour =
      endHour > 12
        ? endHour - 12
        : endHour;

    endEl.value =
      endAmpm +
      " " +
      endDisplayHour +
      ":" +
      String(
        endMinute
      ).padStart(
        2,
        "0"
      );

  }


  startEl.addEventListener(
    "change",
    updateCustomEndTime
  );

  updateCustomEndTime();


  /*
     취소
  */

  document
    .getElementById(
      "customScheduleCancel"
    )
    .onclick =
      function() {

        overlay.remove();

      };


  /*
     확인
  */

  document
    .getElementById(
      "customScheduleConfirm"
    )
    .onclick =
      function() {

        createCustomVolunteerSchedule();

      };

}


/* =========================================================
   특정 날짜 일정 생성
========================================================= */

async function createCustomVolunteerSchedule() {

  const dateEl =
    document.getElementById(
      "customScheduleDate"
    );

  const startEl =
    document.getElementById(
      "customScheduleStartTime"
    );

  const endEl =
    document.getElementById(
      "customScheduleEndTime"
    );

  if (
    !dateEl ||
    !startEl ||
    !endEl
  ) {

    return;

  }


  const date =
    String(
      dateEl.value || ""
    ).trim();

  const startTime =
    String(
      startEl
        .selectedOptions[0]
        ?.textContent ||
      ""
    ).trim();

  const endTime =
    String(
      endEl.value || ""
    ).trim();


  if (!date) {

    alert(
      "날짜를 선택해 주세요."
    );

    return;

  }


  if (
    !startTime ||
    !endTime
  ) {

    alert(
      "봉사시간을 선택해 주세요."
    );

    return;

  }


  /*
     일정 고유키
  */

  const scheduleKey =
    "custom_" +
    date +
    "_" +
    String(
      startEl.value
    );


  /*
     이미 같은 일정이 있는지 확인
  */

  if (
    getCustomVolunteerSchedule(
      scheduleKey
    )
  ) {

    alert(
      "이미 같은 날짜와 시간의 일정이 있습니다."
    );

    return;

  }


  const dateText =
    formatCustomScheduleDate(
      date
    );


  const displayName =
    dateText;


  const time =
    startTime +
    " ~ " +
    endTime;


  const confirmButton =
    document.getElementById(
      "customScheduleConfirm"
    );


  if (confirmButton) {

    confirmButton.disabled =
      true;

    confirmButton.textContent =
      "저장 중...";

  }


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "saveJeonsidaeExtraSchedule",

              key:
                scheduleKey,

              applySheet:
                "신청용",

              manageSheet:
                "관리용",

              serviceDate:
                date,

              time:
                time,

              applicationStart:
                "",

              applicationEnd:
                ""

            })

        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "특정 날짜 일정 저장에 실패했습니다."
      );

    }


    /*
       저장 성공 후
       서버에서 다시 전체 일정을 읽습니다.
    */

    await loadCustomVolunteerSchedules();


    const popup =
      document.getElementById(
        "customSchedulePopup"
      );

    if (popup) {
      popup.remove();
    }


    alert(
      dateText +
      "\n" +
      time +
      "\n\n일정이 추가되었습니다."
    );


  } catch (error) {

    console.error(
      "특정 날짜 일정 추가 오류:",
      error
    );


    if (confirmButton) {

      confirmButton.disabled =
        false;

      confirmButton.textContent =
        "확인";

    }


    alert(
      "특정 날짜 일정 추가에 실패했습니다.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   특정 날짜 일정 삭제
========================================================= */

async function deleteCustomVolunteerSchedule(
  scheduleKey
) {

  const schedule =
    getCustomVolunteerSchedule(
      scheduleKey
    );

  if (!schedule) {
    return;
  }


  const dateText =
    formatCustomScheduleDate(
      schedule.date
    );


  const timeText =
    getCustomScheduleTimeText(
      schedule
    );


  if (
    !confirm(
      dateText +
      "\n" +
      timeText +
      "\n\n이 일정을 완전히 삭제하시겠습니까?"
    )
  ) {

    return;

  }


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "deleteSchedule",

              key:
                scheduleKey,

              scheduleKey:
                scheduleKey

            })

        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "특정 날짜 일정 삭제에 실패했습니다."
      );

    }


    await loadCustomVolunteerSchedules();


    /*
       현재 선택된 일정이 삭제된 경우
       기본 일정 선택 화면으로 복귀
    */

    if (
      selectedAdminSchedule ===
      scheduleKey
    ) {

      selectedAdminSchedule = "";

    }


    if (
      selectedServiceSchedule ===
      scheduleKey
    ) {

      selectedServiceSchedule = "";

    }


    if (
      selectedVolunteerSchedule ===
      scheduleKey
    ) {

      selectedVolunteerSchedule = "";

    }


    renderCustomVolunteerSchedules();


  } catch (error) {

    console.error(
      "특정 날짜 일정 삭제 오류:",
      error
    );


    alert(
      "특정 날짜 일정 삭제에 실패했습니다.\n\n" +
      error.message
    );

  }

}


function getMySelections() {

  try {

    const storageKey =
      MY_SELECTION_KEY +
      "_" +
      String(
        selectedVolunteerSchedule || "default"
      ).trim();

    const saved =
      localStorage.getItem(
        storageKey
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    return [];

  }

}


function saveMySelections(list) {

  const storageKey =
    MY_SELECTION_KEY +
    "_" +
    String(
      selectedVolunteerSchedule || "default"
    ).trim();

  localStorage.setItem(
    storageKey,
    JSON.stringify(
      Array.isArray(list)
        ? list
        : []
    )
  );

}

/* =========================================================
   봉사자 화면
========================================================= */

function renderNames() {

  const grid =
    document.getElementById("nameGrid");

  const selections =
    getMySelections();

  grid.innerHTML = "";

  if (masterNames.length === 0) {

    grid.innerHTML =
      '<div class="name-loading">' +
      '등록된 봉사자가 없습니다.' +
      '</div>';

    return;

  }


  masterNames.forEach(function(name) {

    const card =
      document.createElement("button");

    card.type = "button";

    card.className =
      "name-card";

    if (
      selections.includes(name)
    ) {

      card.classList.add("selected");

    }


    const check =
      document.createElement("span");

    check.className =
      "check-mark";

    check.textContent =
      selections.includes(name)
        ? "✓"
        : "";


    const text =
      document.createElement("span");

    text.textContent =
      name;


    card.appendChild(check);

    card.appendChild(text);


    card.addEventListener(
      "click",
      function() {

        toggleMySelection(
          name,
          card,
          check
        );

      }
    );


    grid.appendChild(card);

  });


}


function toggleMySelection(
  name,
  card,
  check
) {

  let selections =
    getMySelections();

  const alreadySelected =
    selections.includes(name);

  const newChecked =
    !alreadySelected;


  if (newChecked) {

    if (!selections.includes(name)) {

      selections.push(name);

    }

  } else {

    selections =
      selections.filter(function(item) {

        return item !== name;

      });

  }


  saveMySelections(selections);


  if (newChecked) {

    card.classList.add("selected");

    check.textContent = "✓";

  } else {

    card.classList.remove("selected");

    check.textContent = "";

  }


}


/* =========================================================
   관리자 - 신청자 가져오기
========================================================= */

async function loadApplicants() {

  try {

    const [response] =
      await Promise.all([

        fetch(
          SCRIPT_URL +
          "?action=jeonsidaeScheduleApplicants" +
          "&key=" +
          encodeURIComponent(
            selectedAdminSchedule
          ) +
          "&t=" +
          Date.now()
        ),

        loadGroups(),

        loadGroupSheetLabels()

      ]);

    const data =
      await response.json();

    if (!data.success) {

      throw new Error(
        data.message ||
        "신청자를 불러오지 못했습니다."
      );

    }

    applicants =
      Array.isArray(data.applicants)
        ? data.applicants
        : [];


    await cleanGroups();

    renderAdmin();

  } catch (error) {

    console.error(error);

    document
      .getElementById("adminNames")
      .innerHTML =
        '<div class="service-empty">' +
        '신청자를 불러오지 못했습니다.' +
        '</div>';

  }

}



/* =========================================================
   관리자 - 신청자 선택
========================================================= */

function renderAdmin() {

  const assignedNames = new Set();

groups.forEach(function(group) {

  if (!group) {
    return;
  }

  const members =
    Array.isArray(group)
      ? group
      : (
          Array.isArray(group.members)
            ? group.members
            : []
        );

  members.forEach(function(name) {

    if (name) {
      assignedNames.add(name);
    }

  });

});

  const unassignedApplicants = applicants.filter(function(name) {
    return !assignedNames.has(name);
  });

  document.getElementById("adminCount").textContent =
    "미배정 신청자 " + unassignedApplicants.length + "명";

  const namesBox = document.getElementById("adminNames");
  namesBox.innerHTML = "";

  if (selectedApplicants.length > 0) {
  const info = document.createElement("div");
  info.style.width = "100%";
  info.style.color = "#6FA8D8";
  info.style.fontWeight = "700";
  info.style.marginBottom = "2px";
  info.textContent = "선택 " + selectedApplicants.length + "/7명";
  namesBox.appendChild(info);
}
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "admin-add-button";
  addButton.textContent = "+ 추가";
  addButton.onclick = addManualApplicant;

  if (unassignedApplicants.length === 0) {
    const empty = document.createElement("div");
    empty.className = "service-empty";
    empty.style.width = "100%";
    empty.textContent = "미배정 신청자가 없습니다.";
    namesBox.appendChild(empty);
  } else {
    unassignedApplicants.forEach(function(name) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-name";

      const selectedIndex = selectedApplicants.indexOf(name);
      if (selectedIndex !== -1) {
        button.classList.add("selected");
        const badge = document.createElement("span");
        badge.className = "admin-selection-badge";
        badge.textContent = String(selectedIndex + 1);
        button.appendChild(badge);
      }

      button.appendChild(document.createTextNode(name));
      button.onclick = function() {
        toggleApplicantForGroup(name);
      };
      namesBox.appendChild(button);
    });
  }

  namesBox.appendChild(addButton);

  renderGroups();
}

function toggleApplicantForGroup(name) {

  const index = selectedApplicants.indexOf(name);

  if (index !== -1) {
    selectedApplicants.splice(index, 1);
    renderAdmin();
    return;
  }

  if (selectedApplicants.length >= 7) {

  alert("한 그룹에는 7명까지만 선택할 수 있습니다.");

  return;
}

  selectedApplicants.push(name);
  renderAdmin();
}
  
/* =========================================================
   관리자 직접 신청자 추가
========================================================= */

async function addManualApplicant() {

  const name =
    prompt("추가할 봉사자의 이름을 입력해 주세요.");

  if (name === null) {
    return;
  }

  const trimmedName =
    name.trim();

  if (!trimmedName) {

    alert("이름을 입력해 주세요.");

    return;
  }


  if (applicants.includes(trimmedName)) {

    alert("이미 신청자 목록에 있습니다.");

    return;
  }


  if (!selectedAdminSchedule) {

    alert("먼저 관리할 봉사 일정을 선택해 주세요.");

    return;
  }


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({

            action:
              "addManualApplicant",

            name:
              trimmedName,

            key:
              selectedAdminSchedule

          })
        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "신청자 추가에 실패했습니다."
      );
    }


    /*
       저장 성공 후
       현재 화면에도 즉시 반영
    */

    applicants.push(
      trimmedName
    );

    selectedApplicants = [
      trimmedName
    ];

    renderAdmin();


  } catch (error) {

    console.error(
      "관리자 직접 신청자 추가 오류:",
      error
    );

    alert(
      "신청자 추가에 실패했습니다.\n" +
      (
        error.message ||
        "잠시 후 다시 시도해 주세요."
      )
    );
  }

}

/* =========================================================
   전시대 시트 참조/표시 정보 불러오기
========================================================= */

async function loadGroupSheetLabels() {

  try {

    const response =
      await fetch(
        SCRIPT_URL +
        "?action=saturdayReference&t=" +
        Date.now()
      );

    if (!response.ok) {
      throw new Error(
        "전시대 시트 그룹 정보를 불러오지 못했습니다."
      );
    }

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "전시대 시트 그룹 정보를 불러오지 못했습니다."
      );
    }

    const rows =
      Array.isArray(data.reference)
        ? data.reference
        : [];

    window.SATURDAY_GROUP_LABELS =
      rows.slice(0, 10).map(function(item) {

        const number =
          String(
            item.number || ""
          ).trim();

        const house =
          String(
            item.ho || ""
          ).trim();

        const status =
          String(
            item.m || ""
          ).trim();

        return [
          number ? number + "번" : "",
          house ? house + "호" : "",
          status
        ]
        .filter(Boolean)
        .join(" ");

      });

  } catch (error) {

    console.error(
      "전시대 시트 그룹 표시 정보:",
      error
    );

    window.SATURDAY_GROUP_LABELS = [];

  }
}

/* =========================================================
  실제 봉사 그룹 불러오기
========================================================= */

async function loadGroups() {

  try {

    const groupScheduleKey =
      selectedAdminSchedule ||
      selectedServiceSchedule ||
      selectedVolunteerSchedule ||
      "";

    if (!groupScheduleKey) {
  groups = [];
  serviceCancelReason = "";
  return true;
}

    const response =
      await fetch(
        SCRIPT_URL +
        "?action=jeonsidaeScheduleGroups" +
        "&key=" +
        encodeURIComponent(
          groupScheduleKey
        ) +
        "&t=" +
        Date.now()
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "그룹을 불러오지 못했습니다."
      );

    }

serviceCancelReason =
  String(
    data.cancelReason || ""
  ).trim();
    
    const loaded =
      Array.isArray(data.groups)
        ? data.groups
        : [];


    groups =
      loaded.map(function(group) {

        /*
           Apps Script의 관리용 시트 데이터
           [1번~7번 봉사자, 봉사장소]
        */

        if (Array.isArray(group)) {

          const members =
            group
              .slice(0, 7)
              .map(function(name) {
                return String(
                  name || ""
                ).trim();
              })
              .filter(Boolean);


          const location =
            String(
              group[7] || ""
            ).trim();


          return {

            members:
              members,

            count:
              members.length,

            location:
              location,

            schedule:
              groupScheduleKey,

            startTime: "",

            endTime: ""

          };

        }


        /*
           새 구조
        */

        if (
          group &&
          typeof group === "object"
        ) {

          const members =
            Array.isArray(group.members)
              ? group.members
                  .slice(0, 7)
                  .map(function(name) {
                    return String(
                      name || ""
                    ).trim();
                  })
                  .filter(Boolean)
              : [];


          return {

            members:
              members,

            count:
              members.length,

            location:
              String(
                group.location || ""
              ).trim(),

            schedule:
              String(
                group.schedule ||
                groupScheduleKey ||
                ""
              ).trim(),

            startTime:
              String(
                group.startTime || ""
              ).trim(),

            endTime:
              String(
                group.endTime || ""
              ).trim()

          };

        }


        return {

          members: [],

          count: 0,

          location: "",

          schedule:
            groupScheduleKey,

          startTime: "",

          endTime: ""

        };

      });


    return true;


  } catch (error) {

    console.error(error);

    groups = [];

    return false;

  }

}

/* =========================================================
   그룹 정리
   ---------------------------------------------------------
   현재 신청자 명단을 기준으로
   기존 관리용 그룹의 봉사자를 정리한다.

   - 현재 신청한 사람 → 유지
   - 현재 신청하지 않은 사람 → 제거
   - 그룹 자체는 유지
   - 인원수 / 봉사장소 / 일정 정보는 유지
========================================================= */

async function cleanGroups() {

  const before =
    JSON.stringify(groups);


  /*
     현재 신청자 명단을 기준으로 사용
  */

  const applicantSet =
    new Set(
      applicants.map(function(name) {
        return String(
          name || ""
        ).trim();
      }).filter(Boolean)
    );


  /*
     이미 다른 그룹에 들어간 사람
     중복 배정을 막기 위한 Set
  */

  const used =
    new Set();


  /*
     현재 선택되어 있던 사람 중
     이제 신청하지 않은 사람은 제거
  */

  selectedApplicants =
    selectedApplicants.filter(function(name) {

      return applicantSet.has(
        String(
          name || ""
        ).trim()
      );

    });


  groups =
    groups.map(function(group) {

      if (!group) {

        return {
          members: [],
          count: 4,
          location: ""
        };

      }


      /*
         기존 배열 구조가 남아 있는 경우
      */

      if (Array.isArray(group)) {

        group = {

          members:
            group.filter(function(name) {

              return (
                name &&
                name !== "A팀" &&
                name !== "B팀"
              );

            }),

          count: 4,

          location: ""
        };

      }


      /*
         members가 배열이 아니면
         빈 배열로 초기화
      */

      if (
        !Array.isArray(group.members)
      ) {

        group.members = [];

      }


      /*
         그룹 인원수는
         기존 설정을 그대로 유지한다.

         4 / 5 / 6 / 7 이외의 값만
         기본값 4명으로 보정한다.
      */

      if (
        ![4, 5, 6, 7].includes(
          Number(group.count)
        )
      ) {

        group.count = 4;

      }


      /*
         핵심
         -----------------------------------------
         기존 그룹에 있던 사람 중

         ① 현재 신청자이고
         ② 다른 그룹에 아직 사용되지 않은 사람

         만 남긴다.
      */

      group.members =
        group.members
          .slice(0, 7)
          .map(function(name) {

            name =
              String(
                name || ""
              ).trim();


            /*
               이름이 없으면 제거
            */

            if (!name) {

              return "";

            }


            /*
               현재 신청자 명단에 없으면 제거

               ★ 이번 수정의 핵심
            */

            if (
              !applicantSet.has(name)
            ) {

              return "";

            }


            /*
               다른 그룹에 이미 들어간
               중복 이름이면 제거
            */

            if (
              used.has(name)
            ) {

              return "";

            }


            used.add(name);

            return name;

          });


      return group;

    });


  const after =
    JSON.stringify(groups);


  /*
     실제로 변경된 경우에만
     관리용 시트에 저장
  */

  if (before !== after) {

    await saveGroups();

  }

}

async function resetServiceDateOrder() {

  if (!confirm("현재 봉사 순서를 새로운 봉사 날짜 기준으로 초기화하시겠습니까?\n\n초기화 후에는 봉사자가 날짜를 기록해도 순서가 바뀌지 않습니다.")) {
    return;
  }

  try {
    const response = await fetch(
      SCRIPT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "createServiceOrder"
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "봉사 날짜 초기화에 실패했습니다."
      );
    }

    SERVICE_ORDER = Array.isArray(data.serviceOrder)
      ? data.serviceOrder.map(function(number) {
          return String(number || "").trim();
        }).filter(Boolean)
      : [];

    renderService();

    alert("봉사 날짜가 초기화되었습니다.\n현재 순서가 이번 봉사 순서로 고정됩니다.");

  } catch (error) {
    console.error(error);
    alert(
      "봉사 날짜 초기화에 실패했습니다.\n잠시 후 다시 시도해 주세요."
    );
  }
}


/* =========================================================
   봉사 그룹 추가
========================================================= */

function addGroup() {

  const groupsEl =
    document.getElementById("groups");

  if (!groupsEl) {
    return;
  }

  /* 이미 추가 선택창이 있으면 다시 만들지 않음 */
  if (
    document.getElementById("newGroupForm")
  ) {
    return;
  }

  const form =
    document.createElement("div");

  form.id =
    "newGroupForm";

  form.className =
    "new-group-form";

    form.innerHTML = `

    <div class="new-group-date-row">

      <div class="new-group-select-box">

        <label for="newGroupDate">
          날짜
        </label>

        <input
          type="text"
          id="newGroupDate"
          readonly
        >

      </div>

    </div>


       <div class="new-group-select-row">

      <div class="new-group-select-box">

        <label for="newGroupStartTime">
          봉사시작
        </label>

        <select id="newGroupStartTime">
        </select>

      </div>


      <div class="new-group-select-box">

        <label for="newGroupEndTime">
          봉사마감
        </label>

        <input
          type="text"
          id="newGroupEndTime"
          value="오후 12:00"
          readonly
        >

      </div>

    </div>


    <div class="new-group-select-row">

      <div class="new-group-select-box">

        <label for="newGroupCount">
          인원
        </label>

        <select id="newGroupCount">

          <option value="4">4명</option>
          <option value="5">5명</option>
          <option value="6">6명</option>
          <option value="7">7명</option>

        </select>

      </div>


      <div class="new-group-select-box">

        <label for="newGroupLocation">
          봉사장소
        </label>

        <select id="newGroupLocation">

          <option value="">
            봉사장소 선택
          </option>

          <option value="유타몰">
            유타몰
          </option>

          <option value="성북천(보문2교-아래)">
            성북천(보문2교-아래)
          </option>

          <option value="성북천(보문2교-위)">
            성북천(보문2교-위)
          </option>

          <option value="성북구청(광장)">
            성북구청(광장)
          </option>

          <option value="보문역(주변)">
            보문역(주변)
          </option>

          <option value="성신여대(주변)">
            성신여대(주변)
          </option>

           <option value="가두 증거">
            가두 증거
          </option>

        </select>

      </div>

    </div>


           <div
      class="new-group-action-row"
      style="
        display:flex;
        gap:10px;
        width:100%;
      "
    >

      <button
        type="button"
        class="new-group-create-button"
        onclick="createNewGroup()"
        style="
          flex:1;
          width:33.333%;
          min-width:0;
          height:70px;
          padding:0;
          box-sizing:border-box;
          border-radius:12px !important;
          font-size:calc(18px * var(--font-scale)) !important;
          font-weight:700;
        "
      >
        그룹 추가
      </button>

      <button
        type="button"
        class="new-group-stop-button"
        onclick="showStopReason()"
        style="
          flex:1;
          width:33.333%;
          min-width:0;
          height:70px;
          padding:0;
          box-sizing:border-box;
          border-radius:12px !important;
          background:#455A64 !important;
          color:#fff !important;
          font-size:calc(18px * var(--font-scale)) !important;
          font-weight:700;
        "
      >
        중단
      </button>

      <button
        type="button"
        class="new-group-cancel-button"
        onclick="cancelNewGroup()"
        style="
          flex:1;
          width:33.333%;
          min-width:0;
          height:70px;
          padding:0;
          box-sizing:border-box;
          border-radius:12px !important;
          font-size:calc(18px * var(--font-scale)) !important;
          font-weight:700;
        "
      >
        취소
      </button>

    </div>
  `;

   const startTimeEl =
    form.querySelector(
      "#newGroupStartTime"
    );

  const endTimeEl =
    form.querySelector(
      "#newGroupEndTime"
    );


  for (
    let minutes = 10 * 60;
    minutes <= 17 * 60;
    minutes += 10
  ) {

      const hour =
      Math.floor(minutes / 60);

    const minute =
      minutes % 60;

    const ampm =
      hour < 12
        ? "오전"
        : "오후";

    const displayHour =
      hour > 12
        ? hour - 12
        : hour;

   const timeText =
  `${ampm} ${displayHour}:${String(minute).padStart(2, "0")}`;

    const option =
      document.createElement("option");

    option.value =
      minutes;

    option.textContent =
      timeText;

        startTimeEl.appendChild(option);
  }


  if (selectedAdminSchedule === "토오후") {

    startTimeEl.value = 13 * 60;

  } else {

    startTimeEl.value = 10 * 60;

  }


  startTimeEl.addEventListener(
    "change",
    function() {

      const startMinutes =
        Number(this.value);

      const endMinutes =
        startMinutes + 120;

      const endHour =
        Math.floor(endMinutes / 60);

      const endMinute =
        endMinutes % 60;

      const endAmpm =
        endHour < 12
          ? "오전"
          : "오후";

      const endDisplayHour =
        endHour > 12
          ? endHour - 12
          : endHour;

      endTimeEl.value =
  `${endAmpm} ${endDisplayHour}:${String(endMinute).padStart(2, "0")}`;
    }
  );

  startTimeEl.dispatchEvent(
    new Event("change")
  );

  const dateEl =
    form.querySelector(
      "#newGroupDate"
    );

 const today =
    new Date();

const targetDate =
    new Date(today);

const todayDay =
    targetDate.getDay();

let daysUntilTarget;

if (
  getCustomVolunteerSchedule(
    selectedAdminSchedule
  )
) {

  const customSchedule =
    getCustomVolunteerSchedule(
      selectedAdminSchedule
    );

  const customDate =
    new Date(
      String(
        customSchedule.date || ""
      ) +
      "T00:00:00"
    );

  targetDate.setTime(
    customDate.getTime()
  );

  daysUntilTarget = null;

} else if (
  selectedAdminSchedule ===
  "일오전"
) {

  daysUntilTarget =
    (0 - todayDay + 7) % 7;

} else {

  daysUntilTarget =
    (6 - todayDay + 7) % 7;

}


if (
  daysUntilTarget !== null
) {

  targetDate.setDate(
    targetDate.getDate() +
    daysUntilTarget
  );

}

const year =
    targetDate.getFullYear();

const month =
    targetDate.getMonth() + 1;

const date =
    targetDate.getDate();

let dayText;

const customSchedule =
  getCustomVolunteerSchedule(
    selectedAdminSchedule
  );


if (customSchedule) {

  const customDate =
    new Date(
      String(
        customSchedule.date || ""
      ) +
      "T00:00:00"
    );

  const weekdayNames = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토"
  ];

  dayText =
    weekdayNames[
      customDate.getDay()
    ];

} else {

  dayText =
    selectedAdminSchedule ===
    "일오전"
      ? "일"
      : "토";

}

dateEl.value =
    `${year}. ${month}. ${date}(${dayText})`;
  groupsEl.prepend(form);

}

/* =========================================================
   중단 사유 선택
========================================================= */

function showStopReason() {

  const form =
    document.getElementById(
      "newGroupForm"
    );

  if (!form) {
    return;
  }

  /* 이미 중단 사유 영역이 있으면 다시 만들지 않음 */

  if (
    document.getElementById(
      "stopReasonBox"
    )
  ) {
    return;
  }

  const reasonBox =
    document.createElement("div");

  reasonBox.id =
    "stopReasonBox";

  reasonBox.style.cssText = `
    display:block !important;
    width:100% !important;
    margin-top:12px;
    box-sizing:border-box;
  `;

  reasonBox.innerHTML = `

    <!-- 중단 이유 / 중단 제출 버튼 -->

    <div
  id="stopReasonActionRow"
  style="
    display:flex !important;
    flex-direction:row !important;
    gap:10px;
    width:100% !important;
    box-sizing:border-box;
  "
>

  <!-- 중단 이유 선택 -->

  <select
    id="stopReasonSelect"
    style="
      flex:0 0 calc((100% - 20px) * 2 / 3 + 10px) !important;
      width:calc((100% - 20px) * 2 / 3 + 10px) !important;
      height:70px;
      padding:0 16px;
      box-sizing:border-box;
      border:2px solid #455A64;
      border-radius:12px;
      background:#fff;
      color:#222;
      font-size:calc(18px * var(--font-scale));
      font-weight:700;
      cursor:pointer;
    "
  >

    <option
      value=""
      selected
      disabled
    >
      중단 이유 선택
    </option>

    <option value="인원 부족으로 취소합니다">
      인원 부족으로 취소합니다
    </option>

    <option value="우천 시로 취소합니다">
      우천 시로 취소합니다
    </option>

    <option value="대회 주간 입니다">
      대회 주간 입니다
    </option>

    <option value="순회방문 주간 입니다">
     순회방문 주간 입니다
    </option>

    <option value="삭제">
      중단 이유 삭제
    </option>

  </select>


  <!-- 중단 제출 -->

  <button
    type="button"
    id="stopReasonSubmitButton"
    onclick="submitStopReason()"
    style="
      flex:1 1 0 !important;
      width:auto !important;
      height:70px;
      padding:0;
      box-sizing:border-box;
      border:0;
      border-radius:12px !important;
      background:#455A64 !important;
      color:#fff !important;
      font-size:calc(18px * var(--font-scale)) !important;
      font-weight:700;
      cursor:pointer;
    "
  >
    중단 제출
  </button>

</div>
  `;


  const actionRow =
    form.querySelector(
      ".new-group-action-row"
    );

  if (actionRow) {

    actionRow.insertAdjacentElement(
      "afterend",
      reasonBox
    );

  } else {

    form.appendChild(
      reasonBox
    );

  }

}

/* =========================================================
   중단 사유 제출
========================================================= */

async function submitStopReason() {

  const select =
    document.getElementById(
      "stopReasonSelect"
    );

  const submitButton =
    document.getElementById(
      "stopReasonSubmitButton"
    );

  if (!select) {
    return;
  }

  const cancelReason =
  String(
    select.value || ""
  ).trim();

if (!cancelReason) {

  alert(
    "중단 사유 선택"
  );

  return;
}

  if (submitButton) {
    submitButton.textContent =
      "중단 중...";
    submitButton.disabled = true;
  }

if (cancelReason === "삭제") {

  await saveStopReason("");

  return;
}

  const button =
    document.getElementById(
      "stopReasonSubmitButton"
    );

  if (button) {

    button.disabled = true;

    button.textContent =
      "제출 중...";
  }

  await saveStopReason(
    cancelReason
  );
}

/* =========================================================
   중단 사유 저장
========================================================= */

async function saveStopReason(
  cancelReason
) {

  const schedule =
    selectedAdminSchedule ||
    selectedServiceSchedule ||
    selectedVolunteerSchedule ||
    "";

  if (!schedule) {

    alert(
      "일정을 먼저 선택해주세요."
    );

    return;
  }

  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({
              action:
                "saveScheduleCancelReason",

              key:
                schedule,

              cancelReason:
                cancelReason
            })
        }
      );

    const data =
      await response.json();

    if (!data.success) {

      throw new Error(
        data.message ||
        "중단 사유 저장에 실패했습니다."
      );
    }

    const form =
      document.getElementById(
        "newGroupForm"
      );

    if (form) {
      form.remove();
    }

        showSubmitConfirm(
      "중단 사유가 저장됨"
    );

  } catch (error) {

    console.error(error);

    const button =
      document.getElementById(
        "stopReasonSubmitButton"
      );

    if (button) {

      button.disabled = false;

      button.textContent =
        "중단 제출";
    }

    alert(
      "중단 사유 저장 중 오류가 발생했습니다.\n\n" +
      error.message
    );
  }
}

/* =========================================================
   새 봉사 그룹 생성
========================================================= */

async function createNewGroup() {

  const countEl =
    document.getElementById(
      "newGroupCount"
    );

  const locationEl =
    document.getElementById(
      "newGroupLocation"
    );

  if (
    !countEl ||
    !locationEl
  ) {
    return;
  }

  const count =
    Number(countEl.value);

  const location =
    String(
      locationEl.value || ""
    ).trim();

  if (
    ![4, 5, 6, 7].includes(count)
  ) {
    alert(
      "인원을 선택해 주세요."
    );
    return;
  }

  if (!location) {
    alert(
      "봉사장소를 선택해 주세요."
    );
    return;
  }


  /*
     선택되어 있던 봉사자를
     새 그룹에 넣습니다.
  */

  const members =
    selectedApplicants.slice(
      0,
      count
    );


  groups.push({

    members: members,

    count: count,

    location: location,

    schedule:
      selectedAdminSchedule,

    startTime:
      document.getElementById(
        "newGroupStartTime"
      )?.selectedOptions[0]?.textContent || "",

    endTime:
      document.getElementById(
        "newGroupEndTime"
      )?.value || ""

  });


  /*
     그룹에 배정된 봉사자는
     선택 목록에서 제거합니다.
  */

  selectedApplicants =
    selectedApplicants.slice(
      count
    );


  /*
     그룹 추가 단계에서는
     서버에 저장하지 않습니다.
     실제 저장은 [제출] 버튼에서 합니다.
  */

  const form =
    document.getElementById(
      "newGroupForm"
    );

  if (form) {
    form.remove();
  }


  renderAdmin();

  renderGroups();

  renderService();

}
/* =========================================================
   새 봉사 그룹 추가 취소
========================================================= */

function cancelNewGroup() {

  const form =
    document.getElementById(
      "newGroupForm"
    );

  if (form) {

    form.remove();

  }

}

/* =========================================================
   그룹 삭제
========================================================= */

async function deleteGroup(index) {

  if (
    !confirm(
      "그룹" +
      (index + 1) +
      "을 삭제하시겠습니까?"
    )
  ) {

    return;

  }


  groups.splice(
    index,
    1
  );


  selectedApplicants = [];


  try {

    await saveGroups();

    renderAdmin();

    renderService();

  } catch (error) {

    console.error(error);

    alert(
      "그룹 삭제 저장에 실패했습니다."
    );

  }

}

/* =========================================================
   봉사 그룹 저장
========================================================= */

async function saveGroups() {

  if (!selectedAdminSchedule) {

    throw new Error(
      "관리 일정이 선택되지 않았습니다."
    );

  }

  const response =
    await fetch(
      SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({

          action:
            "saveGroups",

          key:
            selectedAdminSchedule,

          groups:
            groups

        })
      }
    );

  const data =
    await response.json();

  if (!data.success) {

    throw new Error(
      data.message ||
      "봉사 그룹 저장에 실패했습니다."
    );

  }

  return true;

}


/* =========================================================
   그룹 초기화
========================================================= */

async function resetGroup(index) {

  if (!groups[index]) {
    return;
  }


  if (
    !confirm(
      "그룹" +
      (index + 1) +
      "의 봉사자 명단을 초기화하시겠습니까?"
    )
  ) {

    return;

  }


  /*
     인원과 봉사위치는 유지
     봉사자 이름만 초기화
  */

  groups[index].members = [];

  selectedApplicants = [];


  try {

    await saveGroups();

    renderAdmin();

    renderService();

  } catch (error) {

    console.error(error);

    alert(
      "그룹 초기화 저장에 실패했습니다."
    );

  }

}

 
/* =========================================================
   관리자 - 봉사 그룹 표시
========================================================= */

function renderGroups() {

  const box =
    document.getElementById("groups");

  if (!box) {
    return;
  }

  box.innerHTML = "";

  if (groups.length === 0) {

    box.innerHTML =
      '<div class="service-empty">' +
      '아직 만든 봉사 그룹이 없습니다.<br>' +
      '「+ 봉사 그룹 추가」를 눌러 그룹을 만들어 주세요.' +
      '</div>';

    return;
  }


  groups.forEach(
    function(group, groupIndex) {

      if (Array.isArray(group)) {

        group = {

          members:
            group.filter(function(name) {

              return (
                name &&
                name !== "A팀" &&
                name !== "B팀"
              );

            }),

          count: 4,

          location: "",

          schedule:
            selectedAdminSchedule,

          startTime: "",

          endTime: ""

        };

        groups[groupIndex] =
          group;
      }


      if (!Array.isArray(group.members)) {
        group.members = [];
      }

      if (
        ![4, 5, 6, 7].includes(
          Number(group.count)
        )
      ) {
        group.count = 4;
      }


      /* ===================================================
         그룹 카드
      =================================================== */

      const card =
        document.createElement("div");

      card.className =
        "group-card";


      /* ===================================================
         그룹 제목 + 초기화 + 삭제
      =================================================== */

      const header =
        document.createElement("div");

      header.className =
        "group-header";


      const title =
        document.createElement("div");

      title.className =
        "group-title";

      title.textContent =
        "그룹" +
        (groupIndex + 1);


      const headerButtons =
        document.createElement("div");

      headerButtons.style.display =
        "flex";

      headerButtons.style.gap =
        "8px";


      const resetButton =
        document.createElement("button");

      resetButton.type =
        "button";

      resetButton.className =
        "delete-group";

      resetButton.textContent =
        "초기화";

      resetButton.onclick =
        function() {

          resetGroup(
            groupIndex
          );

        };


      const deleteButton =
        document.createElement("button");

      deleteButton.type =
        "button";

      deleteButton.className =
        "delete-group";

      deleteButton.textContent =
        "삭제";

      deleteButton.onclick =
        function() {

          deleteGroup(
            groupIndex
          );

        };


      headerButtons.appendChild(
        resetButton
      );

      headerButtons.appendChild(
        deleteButton
      );

      header.appendChild(
        title
      );

      header.appendChild(
        headerButtons
      );

      card.appendChild(
        header
      );


      /* ===================================================
         날짜
      =================================================== */

      const dateArea =
        document.createElement("div");

      dateArea.style.fontWeight =
        "700";

      dateArea.style.marginBottom =
        "8px";


      const today =
        new Date();

      const targetDate =
        new Date(today);

      const todayDay =
        targetDate.getDay();

      let daysUntilTarget;

      if (
        selectedAdminSchedule ===
        "일오전"
      ) {

        daysUntilTarget =
          (0 - todayDay + 7) % 7;

      } else {

        daysUntilTarget =
          (6 - todayDay + 7) % 7;

      }

      targetDate.setDate(
        targetDate.getDate() +
        daysUntilTarget
      );


      const year =
        targetDate.getFullYear();

      const month =
        targetDate.getMonth() + 1;

      const date =
        targetDate.getDate();

      const dayText =
        selectedAdminSchedule ===
        "일오전"
          ? "일"
          : "토";


      dateArea.textContent =
        "날짜 : " +
        year +
        ". " +
        month +
        ". " +
        date +
        "(" +
        dayText +
        ")";


      card.appendChild(
        dateArea
      );


      /* ===================================================
         봉사시간
      =================================================== */

      const scheduleTimes = {

        "토오전": {
          startTime: "오전 10:00",
          endTime: "오후 12:00"
        },

        "토오후": {
          startTime: "오후 1:00",
          endTime: "오후 3:00"
        },

        "일오전": {
          startTime: "오전 10:00",
          endTime: "오후 12:00"
        }

      };


      const groupSchedule =
        String(
          group.schedule ||
          selectedAdminSchedule ||
          ""
        ).trim();


      let scheduleTime =
  scheduleTimes[groupSchedule];


if (!scheduleTime) {

  scheduleTime =
    getVolunteerScheduleTime(
      groupSchedule
    );

}


if (!scheduleTime) {

  scheduleTime = {

    startTime: "",
    endTime: ""

  };

}


      const startTime =
        group.startTime ||
        scheduleTime.startTime;


      const endTime =
        group.endTime ||
        scheduleTime.endTime;


      const timeArea =
        document.createElement("div");

      timeArea.style.width =
        "100%";

      timeArea.style.marginBottom =
        "10px";


      const startTimeText =
        document.createElement("div");

      startTimeText.style.fontWeight =
        "700";

      startTimeText.textContent =
        "봉사시작 : " +
        startTime;


      const endTimeText =
        document.createElement("div");

      endTimeText.style.fontWeight =
        "700";

      endTimeText.textContent =
        "봉사마감 : " +
        endTime;


      timeArea.appendChild(
        startTimeText
      );

      timeArea.appendChild(
        endTimeText
      );

      card.appendChild(
        timeArea
      );


      /* ===================================================
         인원 + 봉사장소
      =================================================== */

      const settingRow =
        document.createElement("div");

      settingRow.style.display =
        "flex";

      settingRow.style.alignItems =
        "flex-end";

      settingRow.style.gap =
        "12px";

      settingRow.style.width =
        "100%";


      /* 인원 */

      const countArea =
  document.createElement("div");

countArea.style.flex =
  "1";


const countLabel =
  document.createElement("div");

countLabel.textContent =
  "인원";

countLabel.style.fontWeight =
  "700";

countLabel.style.marginBottom =
  "5px";


const countSelect =
  document.createElement("select");

countSelect.className =
  "group-count-select";

countSelect.style.width =
  "100%";

      [4, 5, 6, 7].forEach(
        function(count) {

          const option =
            document.createElement("option");

          option.value =
            String(count);

          option.textContent =
            count + "명";


          if (
            Number(group.count) ===
            count
          ) {

            option.selected =
              true;

          }


          countSelect.appendChild(
            option
          );

        }
      );


      countSelect.onchange =
        function() {

          const newCount =
            Number(this.value);

          group.count =
            newCount;


          if (
            group.members.length >
            newCount
          ) {

            group.members =
              group.members.slice(
                0,
                newCount
              );

          }


          /*
             제출하기 전에는
             서버에 저장하지 않습니다.
          */

          renderAdmin();

          renderGroups();

          renderService();

        };


      countArea.appendChild(
        countLabel
      );

      countArea.appendChild(
        countSelect
      );


      /* ===================================================
         봉사장소
      =================================================== */

      const locationArea =
  document.createElement("div");

locationArea.style.flex =
  "1";


const locationLabel =
  document.createElement("div");

locationLabel.textContent =
  "봉사장소";

      locationLabel.style.fontWeight =
        "700";

      locationLabel.style.marginBottom =
        "5px";


      const locationSelect =
        document.createElement("select");

      locationSelect.className =
        "group-location-select";

      locationSelect.style.width =
        "100%";


      const locations = [

        "",

        "유타몰",

        "성북천(보문2교-아래)",

        "성북천(보문2교-위)",

        "성북구청(광장)",

        "보문역(주변)",

        "성신여대(주변)",

        "가두 증거"

      ];


      locations.forEach(
        function(location) {

          const option =
            document.createElement("option");

          option.value =
            location;

          option.textContent =
            location ||
            "선택해 주세요";


          if (
            group.location ===
            location
          ) {

            option.selected =
              true;

          }


          locationSelect.appendChild(
            option
          );

        }
      );


      locationSelect.onchange =
        function() {

          group.location =
            this.value;

          /*
             제출하기 전에는
             서버에 저장하지 않습니다.
          */

          renderGroups();

        };


      locationArea.appendChild(
        locationLabel
      );

      locationArea.appendChild(
        locationSelect
      );


      settingRow.appendChild(
        countArea
      );

      settingRow.appendChild(
        locationArea
      );

      card.appendChild(
        settingRow
      );


      /* ===================================================
         봉사자 명단
      =================================================== */

      const slots =
        document.createElement("div");

      slots.className =
        "group-slots";


      for (
        let slotIndex = 0;
        slotIndex < group.count;
        slotIndex++
      ) {

        const slot =
          document.createElement("button");

        slot.type =
          "button";

        slot.className =
          "group-slot";


        const person =
          group.members[slotIndex];


        if (person) {

          slot.classList.add(
            "filled"
          );

          slot.textContent =
            person;

        } else {

          slot.classList.add(
            "empty"
          );

          slot.textContent =
            "봉사자";

        }


        slot.onclick =
          function() {

            handleSlotClick(
              groupIndex,
              slotIndex
            );

          };


        slots.appendChild(
          slot
        );

      }


      card.appendChild(
        slots
      );


      /* ===================================================
         제출 버튼
      =================================================== */

      const submitButton =
        document.createElement("button");

      submitButton.type =
        "button";

      submitButton.textContent =
        "제출";

      submitButton.style.display =
        "block";

      submitButton.style.width =
        "100%";

      submitButton.style.height =
        "44px";

      submitButton.style.marginTop =
        "12px";

      submitButton.style.border =
        "0";

      submitButton.style.borderRadius =
        "10px";

      submitButton.style.background =
        "#455A64";

      submitButton.style.color =
        "#fff";

      submitButton.style.fontSize =
        "18px";

      submitButton.style.fontWeight =
        "700";

      submitButton.style.cursor =
        "pointer";


            submitButton.onclick =
        async function() {

          await submitGroup(
            groupIndex,
            submitButton
          );

        };


      card.appendChild(
        submitButton
      );


      box.appendChild(
        card
      );

    }
  );

}


async function handleSlotClick(
  groupIndex,
  slotIndex
) {

  const group =
    groups[groupIndex];

  if (!group) {
    return;
  }


  if (
    !Array.isArray(
      group.members
    )
  ) {
    group.members = [];
  }


  const currentName =
    group.members[slotIndex] ||
    "";


  /*
     이미 배정된 봉사자를 클릭하면
     해당 자리만 비웁니다.
  */

if (currentName) {

  group.members[slotIndex] = "";

  renderAdmin();

  renderGroups();

  renderService();

  return;
}


  /*
     위 신청자 명단에서
     선택한 사람이 있으면
     현재 빈 자리에 배정합니다.
  */

  if (
    selectedApplicants.length > 0
  ) {

    const name =
      selectedApplicants[0];


    /*
       이미 다른 자리에 배정된 사람은
       다시 배정하지 않습니다.
    */

    if (
      group.members.includes(name)
    ) {

      selectedApplicants.shift();

      renderAdmin();

      renderGroups();

      return;

    }


    group.members[slotIndex] =
      selectedApplicants.shift();


    renderAdmin();

    renderGroups();

    renderService();

    return;
  }


  alert(
    "위 신청자 명단에서 봉사자를 선택한 후 이 칸을 눌러 주세요."
  );

}

/* =========================================================
   그룹 제출
   - 실제 저장은 제출할 때만 합니다.
========================================================= */

async function submitGroup(
  groupIndex,
  submitButton
) {

  const group =
    groups[groupIndex];

  if (!group) {
    return;
  }


  const count =
    Number(group.count);


  /*
     봉사장소 확인
  */

  if (
    !String(
      group.location || ""
    ).trim()
  ) {

    alert(
      "봉사장소를 선택해 주세요."
    );

    return;
  }


  /*
     인원수만큼 봉사자가 배정되었는지 확인
  */

  const members =
    Array.isArray(
      group.members
    )
      ? group.members.filter(
          function(name) {
            return String(
              name || ""
            ).trim() !== "";
          }
        )
      : [];


  if (
    members.length <
    count
  ) {

    alert(
      "선택한 인원 " +
      count +
      "명 모두 배정해 주세요."
    );

    return;
  }


  /*
     중복 봉사자 확인
  */

  const uniqueMembers =
    [
      ...new Set(
        members
      )
    ];


    if (
    uniqueMembers.length !==
    members.length
  ) {

    alert(
      "같은 봉사자가 중복 배정되어 있습니다."
    );

    return;
  }


  /* 제출 버튼을 제출 중으로 변경 */

  if (submitButton) {

    submitButton.disabled = true;

    submitButton.textContent =
      "제출 중...";

  }


  try {

    await saveGroups();

    selectedApplicants = [];

    renderAdmin();

    renderGroups();

    renderService();

        showSubmitConfirm(
      "그룹" +
      (groupIndex + 1) +
      "이 저장됨"
    );

   } catch (error) {

    console.error(error);

    if (submitButton) {

      submitButton.disabled = false;

      submitButton.textContent =
        "제출";

    }

    alert(
      "그룹 저장에 실패했습니다.\n" +
      "잠시 후 다시 시도해 주세요."
    );

  }

}
  
async function loadServiceData() {

  try {

    const response =
      await fetch(
        SCRIPT_URL +
        "?action=serviceData&t=" +
        Date.now()
      );

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "봉사 구역 정보를 불러오지 못했습니다."
      );
    }

    SERVICE_ORDER =
      Array.isArray(data.serviceOrder)
        ? data.serviceOrder.map(function(number) {
            return String(number || "").trim();
          }).filter(Boolean)
        : [];

    SERVICE_AREAS =
      Array.isArray(data.data)
        ? data.data.map(function(item) {
            return {
              number: String(item.number || "").trim(),
              name: String(item.zone || "").trim(),
              ho: String(item.house || "").trim(),
              m: String(item.weekday || "").trim(),
              person: String(item.person || "").trim(),
              startDate: String(item.startDate || "").trim(),
              completeDate: String(item.completeDate || "").trim(),
              linkUrl: String(item.linkUrl || "").trim()
            };
          })
        : [];

    return true;

  } catch (error) {

    console.error(error);
    return false;

  }
}


async function loadSaturdayReference() {

  SERVICE_CONDUCTOR = "";

  try {

    const response =
      await fetch(
        SCRIPT_URL +
        "?action=saturdayReference&t=" +
        Date.now()
      );

    if (!response.ok) {
      throw new Error(
        "전시대 데이터를 불러오지 못했습니다."
      );
    }

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "전시대 데이터를 불러오지 못했습니다."
      );
    }

    SATURDAY_REFERENCE =
      Array.isArray(data.reference)
        ? data.reference.map(function(item) {

            return {

              number:
                String(item.number || "").trim(),

              name:
                String(item.name || "").trim(),

              ho:
                String(item.ho || "").trim(),

              m:
                String(item.m || "").trim(),

              conductor:
                String(item.conductor || "").trim()

            };

          }).filter(function(item) {

            return (
              item.number ||
              item.name ||
              item.ho ||
              item.m ||
              item.conductor
            );

          })
        : [];

    SERVICE_CONDUCTOR =
      String(
        data.conductor || ""
      ).trim();

    console.log(
      "★★★★★ 지금 확인할 SATURDAY_REFERENCE ★★★★★",
      SATURDAY_REFERENCE
    );

    console.log(
      "★★★★★ 지금 확인할 SERVICE_CONDUCTOR ★★★★★",
      SERVICE_CONDUCTOR
    );

    return true;

  } catch (error) {

    console.error(
      "전시대 시트 기준 데이터:",
      error
    );

    SATURDAY_REFERENCE = [];

    SERVICE_CONDUCTOR = "";

    return false;
  }
}

function getServiceAreasForDisplay() {

  if (!Array.isArray(SERVICE_AREAS)) {
    return [];
  }

  const byNumber = new Map();

  SERVICE_AREAS.forEach(function(area) {
    const key = String(area.number || "").trim();
    if (key) {
      byNumber.set(key, area);
    }
  });

  const refByNumber = new Map();

  if (Array.isArray(SATURDAY_REFERENCE)) {
    SATURDAY_REFERENCE.forEach(function(ref) {
      const key = String(ref.number || "").trim();
      if (key) {
        refByNumber.set(key, ref);
      }
    });
  }

  const ordered = [];
  const used = new Set();

  if (Array.isArray(SERVICE_ORDER) && SERVICE_ORDER.length > 0) {

    SERVICE_ORDER.forEach(function(number) {

      const key =
        String(number || "").trim();

      if (
        !key ||
        !byNumber.has(key) ||
        used.has(key)
      ) {
        return;
      }

      const source =
        byNumber.get(key);

      const ref =
        refByNumber.get(key);

      ordered.push({
        number: source.number,
        name: ref && ref.name ? ref.name : source.name,
        ho: ref && ref.ho ? ref.ho : source.ho,
        m: ref && ref.m ? ref.m : source.m,
        person: source.person,
        startDate: source.startDate,
        completeDate: source.completeDate,
        linkUrl: source.linkUrl
      });

      used.add(key);

    });

  } else if (
    Array.isArray(SATURDAY_REFERENCE) &&
    SATURDAY_REFERENCE.length > 0
  ) {

    SATURDAY_REFERENCE.forEach(function(ref) {

      const key =
        String(ref.number || "").trim();

      if (
        !key ||
        !byNumber.has(key) ||
        used.has(key)
      ) {
        return;
      }

      const source =
        byNumber.get(key);

      ordered.push({
        number: source.number,
        name: ref.name || source.name,
        ho: ref.ho || source.ho,
        m: ref.m || source.m,
        person: source.person,
        startDate: source.startDate,
        completeDate: source.completeDate,
        linkUrl: source.linkUrl
      });

      used.add(key);

    });

  }

  SERVICE_AREAS.forEach(function(area) {

    const key =
      String(area.number || "").trim();

    if (
      !key ||
      used.has(key)
    ) {
      return;
    }

    ordered.push(area);

    used.add(key);

  });

  return ordered;
}


/* =========================================================
   봉사용 - 전시대 임명 표시
========================================================= */

function renderService() {

  const list =
    document.getElementById(
      "serviceList"
    );

  if (!list) {
    return;
  }


  list.innerHTML = "";


  /* ---------------------------------------------------------
     일정이 아직 선택되지 않은 경우
  --------------------------------------------------------- */

  if (!selectedServiceSchedule) {

    return;

  }


  /* ---------------------------------------------------------
     일정 이름
  --------------------------------------------------------- */

  const scheduleNames = {

  "토오전":
    "토요일 오전",

  "토오후":
    "토요일 오후",

  "일오전":
    "일요일 오전"

};


const customSchedule =
  getCustomVolunteerSchedule(
    selectedServiceSchedule
  );


if (customSchedule) {

  scheduleNames[
    selectedServiceSchedule
  ] =
    customSchedule.displayName ||
    customSchedule.dateText ||
    selectedServiceSchedule;

}


  /* ---------------------------------------------------------
     선택된 일정의 그룹만 표시
  --------------------------------------------------------- */

  const serviceGroups =
    groups.filter(
      function(group) {

        if (!group) {
          return false;
        }


        const schedule =
          String(
            group.schedule || ""
          ).trim();


        return (
          schedule ===
          selectedServiceSchedule
        );

      }
    );

/* ---------------------------------------------------------
   일정이 중단된 경우
--------------------------------------------------------- */

if (serviceCancelReason) {

  const notice =
    document.createElement(
      "div"
    );

  notice.className =
    "service-cancel-card";


  /* -------------------------------------------------------
     📢 안내 아이콘
  ------------------------------------------------------- */

  const infoIcon =
    document.createElement(
      "div"
    );

  infoIcon.className =
    "service-cancel-info-icon";

  infoIcon.textContent =
    "📢";


  /* -------------------------------------------------------
     제목
  ------------------------------------------------------- */

  const title =
    document.createElement(
      "div"
    );

  title.className =
    "service-cancel-title";

  title.textContent =
    "오늘은";


  /* -------------------------------------------------------
     실선
  ------------------------------------------------------- */

  const divider =
    document.createElement(
      "div"
    );

  divider.className =
    "service-cancel-divider";


  /* -------------------------------------------------------
     중단 사유
  ------------------------------------------------------- */

  const reason =
    document.createElement(
      "div"
    );

  reason.className =
    "service-cancel-reason";

  reason.textContent =
    serviceCancelReason;


  /* -------------------------------------------------------
     취소 안내 화면 구성
  ------------------------------------------------------- */

  notice.appendChild(
    infoIcon
  );

  notice.appendChild(
    title
  );

  notice.appendChild(
    divider
  );

  notice.appendChild(
    reason
  );


  list.appendChild(
    notice
  );

  return;
}
  
  /* ---------------------------------------------------------
     그룹이 없는 경우
  --------------------------------------------------------- */

 if (serviceGroups.length === 0) {

  const empty =
    document.createElement(
      "div"
    );

  empty.className =
    "service-empty";

  empty.textContent =
    "잠시만 기다려 주세요";

  list.appendChild(
    empty
  );

  return;
}

  /* =========================================================
     4명 / 5명 / 6명 / 7명 시간표
  ========================================================= */

  const schedules = {

    4: [
      [0, 1, "오전 10:00"],
      [2, 3, "오전 10:30"],
      [0, 1, "오전 11:00"],
      [2, 3, "오전 11:30"]
    ],

    5: [
      [0, 1, "오전 10:00"],
      [2, 3, "오전 10:25"],
      [4, 0, "오전 10:50"],
      [1, 2, "오전 11:15"],
      [3, 4, "오전 11:35"]
    ],

    6: [
      [0, 1, "오전 10:00"],
      [2, 3, "오전 10:20"],
      [4, 5, "오전 10:40"],
      [0, 1, "오전 11:00"],
      [2, 3, "오전 11:20"],
      [4, 5, "오전 11:40"]
    ],

    7: [
      [0, 1, "오전 10:00"],
      [2, 3, "오전 10:20"],
      [4, 5, "오전 10:40"],
      [6, 0, "오전 11:00"],
      [1, 2, "오전 11:15"],
      [3, 4, "오전 11:30"],
      [5, 6, "오전 11:45"]
    ]

  };


  /* =========================================================
     그룹 표시
  ========================================================= */

  serviceGroups.forEach(
    function(group) {

      const members =
        Array.isArray(
          group.members
        )
          ? group.members
          : [];


      const count =
        Number(group.count) ||
        members.length;


      if (
        ![4, 5, 6, 7].includes(
          count
        )
      ) {
        return;
      }


/* -----------------------------------------------------
   임명 1개 = 카드 1개
----------------------------------------------------- */

const card =
  document.createElement(
    "div"
  );

card.className =
  "service-appointment-card";


      /* -----------------------------------------------------
   제목
----------------------------------------------------- */

const title =
  document.createElement(
    "div"
  );

title.className =
  "service-appointment-title";

title.textContent =
  "📋 전시대 임명 (" +
  count +
  "명)";

card.appendChild(
  title
);


/* -----------------------------------------------------
   봉사장소
----------------------------------------------------- */

const location =
  document.createElement(
    "div"
  );

location.className =
  "service-appointment-location";

location.textContent =
  "📍 " +
  (group.location || "");

card.appendChild(
  location
);

/* -----------------------------------------------------
   시작 / 종료
----------------------------------------------------- */

      const defaultTimes = {

        "토오전": {
          start:
            "오전 10:00",
          end:
            "오후 12:00"
        },

        "토오후": {
          start:
            "오후 1:00",
          end:
            "오후 3:00"
        },

        "일오전": {
          start:
            "오전 10:00",
          end:
            "오후 12:00"
        }

      };


      let defaultTime =
  defaultTimes[
    selectedServiceSchedule
  ];


if (!defaultTime) {

  const customTime =
    getVolunteerScheduleTime(
      selectedServiceSchedule
    );

  defaultTime = {

    start:
      customTime.startTime || "",

    end:
      customTime.endTime || ""

  };

}


if (!defaultTime) {

  defaultTime = {

    start: "",
    end: ""

  };

}


      const startTime =
        String(
          group.startTime ||
          defaultTime.start ||
          ""
        ).trim();


      const endTime =
        String(
          group.endTime ||
          defaultTime.end ||
          ""
        ).trim();


      const time =
  document.createElement(
    "div"
  );

time.className =
  "service-appointment-time";

time.style.textAlign =
  "center";

time.style.width =
  "100%";

time.innerHTML =
  "시작 : " +
  startTime +
  "<br>" +
  "종료 : " +
  endTime;

card.appendChild(
  time
);

/* -----------------------------------------------------
   구분선
----------------------------------------------------- */

const divider =
  document.createElement(
    "div"
  );

divider.className =
  "service-appointment-divider";

card.appendChild(
  divider
);

      /* -----------------------------------------------------
         시간표
      ----------------------------------------------------- */

      const rows =
        document.createElement(
          "div"
        );

      rows.className =
        "service-appointment-rows";


      const scheduleRows =
        schedules[count] || [];


      scheduleRows.forEach(
        function(row) {

          const firstIndex =
            row[0];

          const secondIndex =
            row[1];

          const time =
            row[2];


          const scheduleRow =
            document.createElement(
              "div"
            );

          scheduleRow.className =
            "service-appointment-row";


          const names =
            document.createElement(
              "span"
            );

          names.className =
            "service-appointment-names";


          const firstPerson =
            members[firstIndex] ||
            "배정 전";

          const secondPerson =
            members[secondIndex] ||
            "배정 전";


          names.textContent =
            firstPerson +
            ", " +
            secondPerson;


          const timeText =
            document.createElement(
              "span"
            );

          timeText.className =
            "service-appointment-slot";

          timeText.textContent =
            time;


          scheduleRow.appendChild(
            names
          );

          scheduleRow.appendChild(
            timeText
          );

          rows.appendChild(
            scheduleRow
          );

        }
      );


      card.appendChild(
        rows
      );


      list.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   봉사용 - 토요일 오전 / 토요일 오후 / 일요일 오전 선택
========================================================= */

async function selectServiceSchedule(
  schedule
) {

  selectedServiceSchedule =
    String(
      schedule || ""
    ).trim();

  /* 봉사용에서는 관리자 일정 선택값을 사용하지 않습니다. */
  selectedAdminSchedule = "";

  if (!selectedServiceSchedule) {
    return;
  }


  const selector =
    document.getElementById(
      "serviceScheduleSelector"
    );

  const managementArea =
    document.getElementById(
      "serviceManagementArea"
    );


  /* 일정 선택 버튼 숨기기 */

  if (selector) {
    selector.style.display =
      "none";
  }


  /* 임명 화면 표시 */

  if (managementArea) {
    managementArea.style.display =
      "block";
  }


  /* 선택한 일정의 그룹을 서버에서 다시 불러오기 */

  try {

    await loadGroups();

    renderService();

  } catch (error) {

    console.error(
      "봉사용 전시대 그룹 불러오기 오류:",
      error
    );

    const list =
      document.getElementById(
        "serviceList"
      );

    if (list) {

      list.innerHTML =
        '<div class="service-empty">' +
        '임명 정보를 불러오지 못했습니다.' +
        '</div>';

    }

  }

}

/* =========================================================
   봉사용 - 최신 임명 정보 새로고침
   - 현재 선택된 일정의 관리용 시트 정보를 다시 불러옵니다.
   - 불러오는 동안 "잠시만 기다려 주세요"를 표시합니다.
========================================================= */

async function refreshServiceGroups() {

  const button =
    document.querySelector(
      "#serviceView .service-refresh-button"
    );

  const list =
    document.getElementById(
      "serviceList"
    );

  try {

    /* 현재 선택된 일정이 없으면 종료 */
    if (!selectedServiceSchedule) {
      return;
    }


    /* =====================================================
       새로고침 중 표시
    ===================================================== */

    if (button) {

      button.disabled = true;

      button.classList.add(
        "refreshing"
      );

    }


    if (list) {

      list.innerHTML =
        '<div class="service-empty service-loading">' +
        '<span class="service-loading-spinner">↻</span>' +
        '<span>잠시만 기다려 주세요</span>' +
        '</div>';

    }


    /* =====================================================
       관리용 시트에서 현재 일정의 최신 정보를 다시 읽습니다.
    ===================================================== */

    await loadGroups();


    /* =====================================================
       최신 정보를 다시 화면에 표시합니다.
    ===================================================== */

    renderService();


  } catch (error) {

    console.error(
      "봉사용 임명 정보 새로고침 오류:",
      error
    );


    if (list) {

      list.innerHTML =
        '<div class="service-empty">' +
        '최신 임명 정보를 불러오지 못했습니다.' +
        '</div>';

    }


  } finally {

    /* =====================================================
       새로고침 완료 → 버튼 원상복구
    ===================================================== */

    if (button) {

      button.disabled = false;

      button.classList.remove(
        "refreshing"
      );

    }

  }

}


/* =========================================================
   봉사용 일정 선택 화면으로 돌아가기
========================================================= */

function backToServiceSchedule() {

  selectedServiceSchedule = "";
  selectedAdminSchedule = "";

  const selector =
    document.getElementById(
      "serviceScheduleSelector"
    );

  const managementArea =
    document.getElementById(
      "serviceManagementArea"
    );

  if (managementArea) {
    managementArea.style.display =
      "none";
  }

  if (selector) {
    selector.style.display =
      "block";
  }

  const list =
    document.getElementById(
      "serviceList"
    );

  if (list) {
    list.innerHTML = "";
  }

}
