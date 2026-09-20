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


let masterNames = [];
let applicants = [];
let groups = [];
let selectedApplicants = [];
let currentView = "apply";

/* =========================================================
   관리자용 선택 일정
========================================================= */

let selectedAdminSchedule = "토오전";

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
    scheduleKey;

  selectedApplicants = [];

  const scheduleButtons =
    document.querySelectorAll(
      ".admin-schedule-button"
    );

  scheduleButtons.forEach(
    function(button) {

      button.classList.toggle(
        "selected",
        button.dataset.schedule === scheduleKey
      );

    }
  );

  const title =
    document.getElementById(
      "adminScheduleTitle"
    );

  if (title) {

    const titleMap = {

      "토오전":
        "토요일 오전",

      "토오후":
        "토요일 오후",

      "일오전":
        "일요일 오전"

    };

    title.textContent =
      titleMap[scheduleKey] ||
      "토요일 오전";

  }

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

  selectAdminSchedule(
    selectedAdminSchedule
  );

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


async function loadMasterNames() {

  try {

    const response =
      await fetch(
        SCRIPT_URL +
        "?action=jeonsidaeNames&t=" +
        Date.now()
      );

    const data =
      await response.json();

    if (!data.success) {

      throw new Error(
        data.message ||
        "봉사자 명단을 불러오지 못했습니다."
      );

    }

    masterNames =
      Array.isArray(data.names)
        ? data.names
        : [];

    renderNames();

  } catch (error) {

    console.error(error);

    const grid =
      document.getElementById("nameGrid");

    if (grid) {

      grid.innerHTML =
        '<div class="name-loading">' +
        '봉사자 명단을 불러오지 못했습니다.' +
        '</div>';

    }

  }

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
    group.forEach(function(name) {
      if (name) assignedNames.add(name);
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

async function confirmSelectedGroup() {

  if (selectedApplicants.length < 4) {
  alert("봉사자를 4명 이상 선택해 주세요.");
  return;
 }

  const newGroup = selectedApplicants.slice(0, 7);
  let targetIndex = -1;

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i] || [];
    if (group.every(function(name) { return !name; })) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
  groups.push(newGroup);
} else {
  groups[targetIndex] = newGroup;
}

while (groups[targetIndex === -1 ? groups.length - 1 : targetIndex].length < 7) {
  groups[targetIndex === -1 ? groups.length - 1 : targetIndex].push("");
}

  try {
  await saveGroups();
  selectedApplicants = [];
  renderAdmin();
  renderService();
} catch (error) {
  console.error(error);
  if (targetIndex === -1) {
    groups.pop();
  } else {
    groups[targetIndex] = ["", "", "", "", "", "", ""];
  }
  alert("그룹 배정 저장에 실패했습니다.\n잠시 후 다시 시도해 주세요.");
  renderAdmin();
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

async function loadGroups() {

  try {

    const response =
  await fetch(
    SCRIPT_URL +
    "?action=groups" +
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

        const result =
          Array.isArray(group)
            ? group.slice(0, 4)
            : [];

        while (result.length < 4) {
          result.push("");
        }

        return result;

      });

    return true;

  } catch (error) {

    console.error(error);

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

  action: "saveGroups",

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

  groups =
    groups.map(function(group) {

      return group.map(function(name) {

        if (
          name &&
          applicantSet.has(name)
        ) {

          return name;

        }

        return "";

      });

    });


  const used =
    new Set();


  groups =
    groups.map(function(group) {

      return group.map(function(name) {

        if (!name) {
          return "";
        }

        if (used.has(name)) {
          return "";
        }

        used.add(name);

        return name;

      });

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


async function addGroup() {

  groups.push([
    "",
    "",
    "",
    ""
  ]);

  await saveGroups();

  renderAdmin();

  renderService();

}


async function deleteGroup(index) {

  if (
    !confirm(
      (index + 1) +
      "번 그룹을 삭제하시겠습니까?"
    )
  ) {

    return;

  }

  groups.splice(
    index,
    1
  );

  selectedApplicants = [];

  renderAdmin();

  renderService();

  saveGroups().catch(function(error) {
    console.error(error);
  });

}


async function resetGroup(index) {

  if (
    !confirm(
      (index + 1) +
      "번 그룹의 봉사자를 초기화하시겠습니까?"
    )
  ) {

    return;

  }

  groups[index] = [
    "",
    "",
    "",
    ""
  ];

  selectedApplicants = [];

  renderAdmin();

  renderService();

  saveGroups().catch(function(error) {
    console.error(error);
  });

}


function renderGroups() {

  const box =
    document.getElementById("groups");

  box.innerHTML = "";


  if (groups.length === 0) {

    box.innerHTML =
      '<div class="service-empty">' +
      '아직 만든 봉사 그룹이 없습니다.<br>' +
      '「+ 봉사 그룹 추가」를 눌러 그룹을 만들어 주세요.' +
      '</div>';

    return;

  }


  groups.slice().reverse().forEach(
    function(group, reverseIndex) {

      const groupIndex =
        groups.length - 1 - reverseIndex;

      const card =
        document.createElement("div");

      card.className =
        "group-card";


      const header =
        document.createElement("div");

      header.className =
        "group-header";


      const title =
        document.createElement("div");

      title.className =
        "group-title";

      const sheetLabel =
        Array.isArray(window.SATURDAY_GROUP_LABELS)
          ? (window.SATURDAY_GROUP_LABELS[groupIndex] || "")
          : "";

      title.textContent =
        "그룹" +
        (groupIndex + 1) +
        (sheetLabel ? "  " + sheetLabel : "");


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


      const headerButtons =
        document.createElement("div");

      headerButtons.style.display = "flex";
      headerButtons.style.gap = "6px";

      header.appendChild(title);

      headerButtons.appendChild(
        resetButton
      );

      headerButtons.appendChild(
        deleteButton
      );

      header.appendChild(
        headerButtons
      );


      const slots =
        document.createElement("div");

      slots.className =
        "group-slots";


      group.forEach(
        function(name, slotIndex) {

          const slot =
            document.createElement("button");

          slot.type =
            "button";

          slot.className =
            "group-slot";


          if (name) {

            slot.classList.add(
              "filled"
            );

            slot.textContent =
              name;

          } else {

            slot.classList.add(
              "empty"
            );

            slot.textContent =
              slotIndex < 2 ? "A팀" : "B팀";

          }


          slot.onclick =
            function() {

              handleSlotClick(
                groupIndex,
                slotIndex
              );

            };


          slots.appendChild(slot);

        }
      );


      card.appendChild(header);

      card.appendChild(slots);

      box.appendChild(card);

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

      const hasVolunteer =
        group.some(function(person) {
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
        let pairIndex = 0;
        pairIndex < 2;
        pairIndex++
      ) {

        const pair =
          document.createElement("div");

        pair.className =
          "service-pair";

        const teamLabel =
          document.createElement("div");

        teamLabel.className =
          "service-team-label";

        teamLabel.textContent =
          pairIndex === 0
            ? "A팀"
            : "B팀";

        pair.appendChild(teamLabel);

        const pairPeople =
          document.createElement("div");

        pairPeople.className =
          "service-pair-people";

        for (
          let i = 0;
          i < 2;
          i++
        ) {

          const slotIndex =
            pairIndex * 2 + i;

          const person =
            group[slotIndex];

          const personBox =
            document.createElement("div");

          personBox.className =
            "service-person" +
            (person ? " filled" : "");

          personBox.textContent =
            person || "배정 전";

          pairPeople.appendChild(
            personBox
          );

        }

        pair.appendChild(pairPeople);

        volunteers.appendChild(pair);

      }


      card.appendChild(head);

      card.appendChild(volunteers);

      list.appendChild(card);

    }
  );

}


function toggleSettings() {

  document
    .getElementById("settingsPanel")
    .classList.toggle("show");

}


function setTheme(theme) {

  if (theme === "light") {

    document.body.classList.add(
      "light"
    );

    localStorage.setItem(
      "saturdayTheme",
      "light"
    );

  } else {

    document.body.classList.remove(
      "light"
    );

    localStorage.setItem(
      "saturdayTheme",
      "dark"
    );

  }

  updateSettingButtons();

}


function setFontSize(size) {

  size =
    Math.max(
      80,
      Math.min(150, size)
    );

  document.documentElement.style.setProperty(
    "--font-scale",
    size / 100
  );

  localStorage.setItem(
    "saturdayFontSize",
    String(size)
  );

  updateSettingButtons();

}


function changeFontSize(amount) {

  const current =
    Number(
      localStorage.getItem(
        "saturdayFontSize"
      ) || "100"
    );

  setFontSize(
    current + amount
  );

}


function loadSettings() {

  const theme =
    localStorage.getItem(
      "saturdayTheme"
    ) || "dark";

  const fontSize =
    localStorage.getItem(
      "saturdayFontSize"
    ) || "100";

  setTheme(theme);

  setFontSize(
    Number(fontSize)
  );

}


function updateSettingButtons() {

  const theme =
    document.body.classList.contains(
      "light"
    )
      ? "light"
      : "dark";


  document
    .getElementById("darkButton")
    .classList.toggle(
      "active",
      theme === "dark"
    );


  document
    .getElementById("lightButton")
    .classList.toggle(
      "active",
      theme === "light"
    );

  const fontSizeDisplay =
    document.getElementById(
      "fontSizeDisplay"
    );

  if (fontSizeDisplay) {

    fontSizeDisplay.textContent =
      (
        Number(
          localStorage.getItem(
            "saturdayFontSize"
          ) || "100"
        )
      ) + "%";

  }

}


document.addEventListener(
  "click",
  function(event) {

    const panel =
      document.getElementById(
        "settingsPanel"
      );

    const button =
      document.querySelector(
        ".top-right"
      );


    if (
      panel.classList.contains("show") &&
      !panel.contains(event.target) &&
      !button.contains(event.target)
    ) {

      panel.classList.remove(
        "show"
      );

    }

  }
);


async function refreshServiceGroups() {

  const button =
    document.querySelector(
      ".service-refresh-button"
    );

  if (button) {
    button.disabled = true;
  }

  try {

    await loadApplicants();

    const results =
      await Promise.all([
        loadGroups(),
        loadServiceData(),
        loadSaturdayReference()
      ]);

    if (!results[0] || !results[1]) {
      throw new Error(
        "봉사용 정보를 불러오지 못했습니다."
      );
    }

    renderService();

  } catch (error) {

    console.error(error);

    alert(
      "새로고침에 실패했습니다."
    );

  } finally {

    if (button) {
      button.disabled = false;
    }

  }

}


function openVolunteerApply() {

  const area =
    document.getElementById(
      "volunteerApplyArea"
    );

  const button =
    document.getElementById(
      "volunteerApplyButton"
    );

  if (!area) {
    return;
  }

  area.classList.add("show");
  
  if (button) {

    button.classList.add("open");

    button.style.display = "flex";

  }

  loadMasterNames();

  const controlRow =
    document.getElementById(
      "volunteerControlRow"
    );

  if (controlRow) {

    controlRow.style.display =
      "flex";

  }

}


function goToApplyHome() {

  selectedVolunteerSchedule = "";

  const scheduleArea =
    document.getElementById(
      "volunteerScheduleArea"
    );

  const applyButton =
    document.getElementById(
      "volunteerApplyButton"
    );

  const controlRow =
    document.getElementById(
      "volunteerControlRow"
    );

  const applyArea =
    document.getElementById(
      "volunteerApplyArea"
    );

  const submittedArea =
    document.getElementById(
      "submittedVolunteerArea"
    );

 if (scheduleArea) {
  scheduleArea.style.display = "";
}

const mainTitle =
  document.getElementById(
    "volunteerMainTitle"
  );

if (mainTitle) {
  mainTitle.textContent =
    "요일을 선택해주세요";
}

  if (applyButton) {

    applyButton.style.display =
      "none";

    applyButton.classList.remove(
      "open"
    );

  }

  if (controlRow) {
    controlRow.style.display = "none";
  }

  if (applyArea) {

    applyArea.style.display =
      "none";

    applyArea.classList.remove(
      "show"
    );

  }

  if (submittedArea) {
    submittedArea.style.display = "none";
  }

}


async function refreshVolunteerNames() {

  const button =
    document.querySelector(
      "#volunteerControlRow .volunteer-control-button:last-child"
    );

  if (button) {

    button.textContent =
      "↻ 불러오는 중...";

    button.disabled = true;

  }

  try {

    await loadMasterNames();

  } finally {

    if (button) {

      button.textContent =
        "↻ 새로고침";

      button.disabled = false;

    }

  }

}


function closeVolunteerApply() {

  const area =
    document.getElementById(
      "volunteerApplyArea"
    );

  const button =
    document.getElementById(
      "volunteerApplyButton"
    );

  if (area) {

    area.style.display =
      "none";

    area.classList.remove(
      "show"
    );

  }

  if (button) {

    button.classList.remove(
      "open"
    );

    button.style.display =
      "flex";

  }

  const controlRow =
    document.getElementById(
      "volunteerControlRow"
    );

  if (controlRow) {

    controlRow.style.display =
      "none";

  }

}


let selectedVolunteerSchedule = "";

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

    if (!newSelections.length) {

      alert(
        "봉사자를 한 명 이상 선택해 주세요."
      );

      if (button) {

        button.disabled = false;

        button.textContent =
          "제출";

      }

      return;

    }


    const scheduleKey =
      selectedVolunteerSchedule;

    if (!scheduleKey) {

      throw new Error(
        "봉사 일정이 선택되지 않았습니다."
      );

    }


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


    alert(
      newSelections.length +
      "명이 신청되었습니다."
    );

  } catch (error) {

    console.error(error);

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
            applicants
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
