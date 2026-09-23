function selectVolunteerSchedule(schedule) {

  selectedVolunteerSchedule =
    String(schedule || "").trim();

  if (!selectedVolunteerSchedule) {
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
  loadMasterNames();
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
   관리자용 선택 일정
========================================================= */

let selectedAdminSchedule = "";
let selectedServiceSchedule = "";

const ADMIN_PASSWORD = "3061";
const ADMIN_PASSWORD_KEY = "saturdayAdminPassword";
let adminAuthenticated = false;


document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadSettings();

    loadGroups();

    loadServiceData();

    renderService();

  }
);

/* =========================================================
   관리자용 봉사 일정 선택
========================================================= */

function selectAdminSchedule(scheduleKey) {

  selectedAdminSchedule =
    String(scheduleKey || "").trim();

  if (!selectedAdminSchedule) {
    return;
  }

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


  /* 관리자 화면에 처음 들어오면
     일정 선택 화면만 표시 */

  selectedAdminSchedule = "";

  selectedApplicants = [];


  const managementArea =
    document.getElementById(
      "adminManagementArea"
    );

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

function getMySelections() {

  try {

    const saved =
      localStorage.getItem(
        MY_SELECTION_KEY
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

  localStorage.setItem(
    MY_SELECTION_KEY,
    JSON.stringify(list)
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

  const confirmButton = document.getElementById("confirmGroupButton");
if (confirmButton) {
  confirmButton.disabled = selectedApplicants.length < 4;
}

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
   관리자 - 배정 확정
========================================================= */

async function confirmSelectedGroup() {

  if (
    selectedApplicants.length < 4
  ) {

    alert(
      "봉사자를 4명 이상 선택해 주세요."
    );

    return;

  }


  /*
     선택한 봉사자로 새로운 그룹 생성
  */

  const newGroup = {

    members:
      selectedApplicants.slice(0, 7),

    count:
      selectedApplicants.length,

    location:
      ""

  };


  groups.push(newGroup);


  try {

    await saveGroups();

    /*
       배정이 끝났으므로
       현재 선택 표시 초기화
    */

    selectedApplicants = [];

    renderAdmin();

    renderService();

  } catch (error) {

    console.error(error);

    /*
       저장 실패 시 방금 만든 그룹 제거
    */

    groups.pop();

    alert(
      "그룹 배정 저장에 실패했습니다.\n" +
      "잠시 후 다시 시도해 주세요."
    );

  }

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

  name:
    trimmedName,

  checked:
    true,

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


    applicants.push(trimmedName);

    selectedApplicants = [trimmedName];

    renderAdmin();

  } catch (error) {

    console.error(error);

    alert(
      "신청자 추가에 실패했습니다.\n잠시 후 다시 시도해 주세요."
    );

  }

}


/* =========================================================
   그룹 불러오기
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
   그룹 불러오기
========================================================= */

async function loadGroups() {

  try {

    if (!selectedAdminSchedule) {

      groups = [];

      return true;
    }


    const response =
      await fetch(
        SCRIPT_URL +
        "?action=jeonsidaeScheduleGroups" +
        "&key=" +
        encodeURIComponent(
          selectedAdminSchedule
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


    const loaded =
      Array.isArray(data.groups)
        ? data.groups
        : [];


    groups =
      loaded.map(function(group) {

        if (
          group &&
          !Array.isArray(group) &&
          typeof group === "object"
        ) {

          return {

            members:
              Array.isArray(group.members)
                ? group.members.slice(0, 7)
                : [],

            count:
              [4, 5, 6, 7].includes(
                Number(group.count)
              )
                ? Number(group.count)
                : 4,

            location:
              String(
                group.location || ""
              ).trim()

          };

        }


        if (Array.isArray(group)) {

          const oldMembers =
            group
              .slice(0, 7)
              .filter(function(name) {

                return (
                  name &&
                  name !== "A팀" &&
                  name !== "B팀"
                );

              });


          const location =
            group.length >= 8
              ? String(
                  group[7] || ""
                ).trim()
              : "";


          return {

            members:
              oldMembers,

            count:
              oldMembers.length >= 4
                ? Math.min(
                    oldMembers.length,
                    7
                  )
                : 4,

            location:
              location

          };

        }


        return {

          members: [],

          count: 4,

          location: ""

        };

      });


    return true;


  } catch (error) {

    console.error(error);

    groups = [];

    return false;

  }

}


async function saveGroups() {

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
            "saveJeonsidaeScheduleGroups",

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
      "그룹 저장에 실패했습니다."
    );

  }


  return true;

}


/* =========================================================
   그룹 정리
========================================================= */

async function cleanGroups() {

  const before =
    JSON.stringify(groups);


  const applicantSet =
    new Set(applicants);


  const used =
    new Set();


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


      if (
        !Array.isArray(group.members)
      ) {

        group.members = [];

      }


      if (
        ![4, 5, 6, 7].includes(
          Number(group.count)
        )
      ) {

        group.count = 4;

      }


      group.members =
        group.members
          .slice(0, 7)
          .map(function(name) {

            name =
              String(
                name || ""
              ).trim();


            if (!name) {
              return "";
            }


            if (
              !applicantSet.has(name)
            ) {

              return "";

            }


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
            봉사장소를 선택하세요
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

          <option value="성북천(하늘다리)">
            성북천(하늘다리)
          </option>

          <option value="성북천(바람마당교)">
            성북천(바람마당교)
          </option>

          <option value="성북천(분수대)">
            성북천(분수대)
          </option>

          <option value="성북천(용문교)">
            성북천(용문교)
          </option>

          <option value="가두 증거">
            가두 증거
          </option>

        </select>

      </div>

    </div>


    <div class="new-group-action-row">

      <button
        type="button"
        class="new-group-create-button"
        onclick="createNewGroup()"
      >
        그룹 추가
      </button>

      <button
        type="button"
        class="new-group-cancel-button"
        onclick="cancelNewGroup()"
      >
        취소
      </button>

    </div>

  `;

  groupsEl.prepend(form);

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


  groups.push({

    members: [],

    count: count,

    location: location

  });


  try {

    await saveGroups();

    renderAdmin();

    renderService();

  } catch (error) {

    console.error(error);

    groups.pop();

    alert(
      "봉사 그룹 추가에 실패했습니다."
    );

  }

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


      /*
         기존 배열 데이터가 남아 있으면
         새 구조로 변환
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

        groups[groupIndex] =
          group;

      }


      if (!group.members) {
        group.members = [];
      }

      if (!group.count) {
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
         그룹 제목
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


      /* 초기화 */

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


      /* 삭제 */

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


/* ===================================================
   인원
=================================================== */

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
  async function() {

    const newCount =
      Number(this.value);


    group.count =
      newCount;


    /*
       인원을 줄였을 경우
       뒤쪽 이름 제거
    */

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


    try {

      await saveGroups();

      renderGroups();

      renderService();

    } catch (error) {

      console.error(error);

      alert(
        "인원 변경 저장에 실패했습니다."
      );

    }

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
  "2";


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

  "성북천(하늘다리)",

  "성북천(바람마당교)",

  "성북천(분수대)",

  "성북천(용문교)",

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
  async function() {

    group.location =
      this.value;


    try {

      await saveGroups();

    } catch (error) {

      console.error(error);

    }

  };


locationArea.appendChild(
  locationLabel
);

locationArea.appendChild(
  locationSelect
);


/* ===================================================
   한 줄에 인원 + 봉사장소
=================================================== */

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
          document.createElement("div");

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


        slots.appendChild(
          slot
        );

      }


      card.appendChild(
        slots
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
  
  if (groups[groupIndex] && groups[groupIndex][slotIndex]) {
    groups[groupIndex][slotIndex] = "";
    renderAdmin();
    renderService();
    saveGroups().catch(function(error) { console.error(error); });
    return;
  }

  alert("위에서 봉사자 4명을 선택한 후 배정 확정 버튼을 눌러 주세요.");
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


function renderService() {

  const list =
    document.getElementById("serviceList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  const conductor =
    document.getElementById("serviceConductor");

  if (conductor) {

    conductor.textContent =
      "인도자 : " +
      (SERVICE_CONDUCTOR || "");

  }


  if (groups.length === 0) {

    list.innerHTML =
      '<div class="service-empty">' +
      '관리자용에서 봉사 그룹을 만들어 주세요.' +
      '</div>';

    return;

  }


  const displayAreas =
    getServiceAreasForDisplay();


  groups.forEach(
    function(group, index) {

      const members =
        Array.isArray(group)
          ? group
          : (
              group &&
              Array.isArray(group.members)
                ? group.members
                : []
            );


      const count =
        Array.isArray(group)
          ? group.length
          : (
              group &&
              Number(group.count)
                ? Number(group.count)
                : 4
            );


      const hasVolunteer =
        members.some(function(person) {
          return Boolean(person);
        });


      if (!hasVolunteer) {
        return;
      }


      const area =
        displayAreas[index];


      const card =
        document.createElement("div");

      card.className =
        "service-card";


      const head =
        document.createElement("div");

      head.className =
        "service-head";


      const number =
        document.createElement("div");

      number.className =
        "service-number";


      if (area) {

        if (area.linkUrl) {

          const link =
            document.createElement("a");

          link.href =
            area.linkUrl;

          link.target =
            "_blank";

          link.rel =
            "noopener";

          link.textContent =
            area.number;

          link.style.color =
            "inherit";

          link.style.textDecoration =
            "none";

          link.style.display =
            "flex";

          link.style.width =
            "100%";

          link.style.height =
            "100%";

          link.style.alignItems =
            "center";

          link.style.justifyContent =
            "center";

          number.appendChild(
            link
          );

        } else {

          number.textContent =
            area.number;

        }

      } else {

        number.textContent =
          index + 1;

      }


      const name =
        document.createElement("div");

      name.className =
        "service-name";

      if (area) {

        name.textContent =
          area.name;

      } else {

        name.textContent =
          "봉사 구역 " +
          (index + 1);

      }


      const info =
        document.createElement("div");

      info.className =
        "service-info";

      info.appendChild(name);


      const detail =
        document.createElement("div");

      detail.className =
        "service-detail";

      if (area) {

        detail.textContent =
          area.ho +
          " 호 " +
          area.m;

      } else {

        detail.textContent =
          "등록된 봉사 구역 정보가 없습니다.";

      }

      info.appendChild(detail);

      head.appendChild(number);
      head.appendChild(info);


      const volunteers =
        document.createElement("div");

      volunteers.className =
        "service-volunteers";


      for (
        let slotIndex = 0;
        slotIndex < count;
        slotIndex++
      ) {

        const person =
          members[slotIndex] || "";


        const personBox =
          document.createElement("div");

        personBox.className =
          "service-person" +
          (
            person
              ? " filled"
              : ""
          );


        personBox.textContent =
          person || "배정 전";


        volunteers.appendChild(
          personBox
        );

      }


      card.appendChild(
        head
      );

      card.appendChild(
        volunteers
      );

      list.appendChild(
        card
      );

    }
  );

}
