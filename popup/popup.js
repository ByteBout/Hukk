const headerEl = document.querySelector("header");
const settingSwitchContainerEl = document.querySelector("#setting-switch-container");
const settingSwitchEl = document.querySelector("#setting-switch");
const idleBadgeEl = document.querySelector("#idle-badge");
const siteBarEl = document.querySelector("#site-bar");
const siteNameEl = document.querySelector("#site-name");
const settingStatusEl = document.querySelector("#setting-status");
const contentEl = document.querySelector("#content");
const versionEl = document.querySelector("#version");

let sld;
let tabId;
let manifest;
const supportedWebsites = {
  youtube: loadYouTubeContent,
  x: loadXContent,
};

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs || !tabs[0]) return;
  tabId = tabs[0].id;

  // Extract the second-level domain from the URL
  const url = new URL(tabs[0].url);
  const hostname = url.hostname;
  const hostnameParts = hostname.split(".");
  sld = hostnameParts.length == 2 ? hostnameParts[0] : hostnameParts[1];

  sld in supportedWebsites ? supportedWebsites[sld]() : displayWarning();
});

// Load power switch condition from browser storage
chrome.storage.sync.get(["power"], (condition) => {
  const c = condition.power || "on";

  if (c === "off") {
    settingSwitchEl.checked = false;
    settingStatusEl.classList.replace("bg-[#3D9159]", "bg-[#D9543F]");
  }
});

// Save power switch condition to browser storage
settingSwitchEl.addEventListener("change", () => {
  let condition;

  if (settingSwitchEl.checked) {
    condition = "on";
    settingStatusEl.classList.replace("bg-[#D9543F]", "bg-[#3D9159]");
  } else {
    condition = "off";
    settingStatusEl.classList.replace("bg-[#3D9159]", "bg-[#D9543F]");
  }

  chrome.tabs.sendMessage(tabId, { power: condition, sld: sld });
  chrome.storage.sync.set({ power: condition });
});

// Read and display the version from manifest.json
manifest = chrome.runtime.getManifest();
versionEl.textContent = `v${manifest.version}`;

function loadSettings(sld) {
  // Load settings condition from browser storage
  chrome.storage.sync.get([sld], (settings) => {
    const activeSettings = settings[sld] || [];

    activeSettings.forEach((setting) => {
      document.querySelector("#" + setting).checked = true;
    });
  });
}

function saveSetting(setting, sld) {
  // Save a setting condition to browser storage
  chrome.storage.sync.get([sld], (settings) => {
    let activeSettings = settings[sld] || [];

    if (!activeSettings.includes(setting)) {
      activeSettings.push(setting);
    } else {
      let i = activeSettings.indexOf(setting);
      activeSettings.splice(i, 1);
    }

    chrome.tabs.sendMessage(tabId, { settings: activeSettings, sld: sld });
    chrome.storage.sync.set({ [sld]: activeSettings });
  });
}

function displayWarning() {
  // Display a warning for unsupported websites
  idleBadgeEl.classList.replace("hidden", "flex");
  siteBarEl.classList.replace("flex", "hidden");
  headerEl.classList.replace("bg-[#FFC107]", "bg-[#F2EFE6]");

  contentEl.innerHTML = `
    <span
      class="mt-3 flex h-15 w-15 items-center justify-center rounded-[10px] border-2 border-[#1A1814] bg-white shadow-[2px_2px_0_#1A1814]">
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6" fill="#1A1814">
        <path
          d="M10.5,17.696c-.173,0-.349-.03-.52-.093-.887-.328-1.676-.834-2.347-1.505-.585-.586-.585-1.536,0-2.121,.586-.586,1.536-.586,2.122,0,.361,.362,.786,.635,1.263,.811,.777,.287,1.175,1.15,.888,1.927-.224,.605-.797,.98-1.407,.98ZM1.907,12.885c-2.539,2.539-2.539,6.669,0,9.208,1.27,1.27,2.937,1.904,4.604,1.904s3.335-.635,4.604-1.904c.031-.031,.062-.064,.09-.098l.445-.532c.531-.635,.447-1.581-.188-2.113-.637-.532-1.582-.448-2.113,.188l-.398,.477c-1.373,1.325-3.566,1.313-4.923-.042-1.369-1.369-1.369-3.597,0-4.966l1.988-1.989c.586-.586,.586-1.536,0-2.121-.586-.586-1.535-.586-2.121,0l-1.988,1.989ZM.439,2.561L21.439,23.561c.293,.293,.677,.439,1.061,.439s.768-.146,1.061-.439c.586-.585,.586-1.536,0-2.121l-5.896-5.896,4.428-4.428c2.539-2.539,2.539-6.669,0-9.208-2.537-2.539-6.667-2.541-9.208,0-.586,.585-.586,1.536,0,2.121,.586,.586,1.535,.586,2.121,0,1.37-1.369,3.598-1.368,4.966,0s1.369,3.597,0,4.966l-4.428,4.428-4.417-4.417c1.024-.111,2.077,.233,2.857,1.012,.293,.293,.677,.439,1.061,.439s.768-.146,1.061-.439c.586-.585,.586-1.536,0-2.121-1.984-1.985-4.929-2.451-7.377-1.289L2.561,.439c-.586-.586-1.535-.586-2.121,0-.586,.585-.586,1.536,0,2.121Z" />
      </svg>
    </span>

    <p class="font-space mt-3 text-lg font-bold text-[#1A1814]">Nothing to unhook here</p>
    <p class="font-space mt-1 px-5 text-center text-xs text-[#5C574B]">
      Hukk doesn't run here, you can request support for this website.
    </p>

    <div class="font-ibm-semibold mt-3 flex w-full flex-wrap items-center justify-center gap-1.25 px-5">
      <span
        class="flex items-center rounded-md border-2 border-[#423E34] bg-white px-2 pb-0.5 text-[11px] text-[#1A1814]">
        youtube.com
      </span>
      <span
        class="flex items-center rounded-md border-2 border-[#423E34] bg-white px-2 pb-0.5 text-[11px] text-[#1A1814]">
        x.com
      </span>
    </div>

    <a
      href="https://tally.so/r/PdLkk5"
      target="_blank"
      class="font-space mt-3 mb-3 cursor-pointer rounded-lg border-2 border-[#1A1814] bg-[#FFC107] px-4 py-2 text-[13px] font-bold text-[#1A1814] shadow-[2px_2px_0_#1A1814] duration-200 ease-in-out hover:bg-[#FFD54D]">
      REQUEST THIS SITE
    </a>
  `;
}

function loadYouTubeContent() {
  settingSwitchContainerEl.classList.replace("hidden", "flex");
  siteNameEl.textContent = "YouTube";

  contentEl.innerHTML = `
    <div class="group">
      <p class="group-title">GENERAL</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="ads" class="peer hidden" />
      <p class="setting-title">Hide ads</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="shorts" class="peer hidden" />
      <p class="setting-title">Hide shorts</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="notifications" class="peer hidden" />
      <p class="setting-title">Hide notifications</p>
      <div class="toggle-primary"></div>
    </label>

    <div class="group">
      <p class="group-title">HOME</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="feed" class="peer hidden" />
      <p class="setting-title">Hide feed</p>
      <div class="toggle-primary"></div>
    </label>

    <div class="group">
      <p class="group-title">SIDEBAR</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="subscriptions" class="peer hidden" />
      <p class="setting-title">Hide subscriptions</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="explore" class="peer hidden" />
      <p class="setting-title">Hide explore</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="more-from-youtube" class="peer hidden" />
      <p class="setting-title">Hide more from YouTube</p>
      <div class="toggle-primary"></div>
    </label>

    <div class="group">
      <p class="group-title">VIDEO PAGE</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="recommendations" class="peer hidden" />
      <p class="setting-title">Hide recommendations</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="comments" class="peer hidden" />
      <p class="setting-title">Hide comments</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="live-chat" class="peer hidden" />
      <p class="setting-title">Hide live chat</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="shop" class="peer hidden" />
      <p class="setting-title">Hide shop</p>
      <div class="toggle-primary"></div>
    </label>

    <div class="group">
      <p class="group-title">VIDEO</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="video-cards" class="peer hidden" />
      <p class="setting-title">Hide end video cards</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="video-wall" class="peer hidden" />
      <p class="setting-title">Hide end video wall</p>
      <div class="toggle-primary"></div>
    </label>
  `;

  const settings = document.querySelectorAll(".setting");
  settings.forEach((setting) => {
    setting.addEventListener("change", (e) => saveSetting(e.target.id, "youtube"));
  });

  loadSettings("youtube");
}

function loadXContent() {
  settingSwitchContainerEl.classList.replace("hidden", "flex");
  siteNameEl.textContent = "X";

  contentEl.innerHTML = `
    <div class="group">
      <p class="group-title">GENERAL</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="grok" class="peer hidden" />
      <p class="setting-title">Hide Grok</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="chat" class="peer hidden" />
      <p class="setting-title">Hide chat</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="who-to-follow" class="peer hidden" />
      <p class="setting-title">Hide who to follow</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="what-is-happening" class="peer hidden" />
      <p class="setting-title">Hide what's happening</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="premium" class="peer hidden" />
      <p class="setting-title">Hide premium offer</p>
      <div class="toggle-primary"></div>
    </label>

    <div class="group">
      <p class="group-title">HOME</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="feed" class="peer hidden" />
      <p class="setting-title">Hide feed</p>
      <div class="toggle-primary"></div>
    </label>

    <div class="group">
      <p class="group-title">SIDEBAR</p>
      <span class="group-line"></span>
    </div>

    <label class="setting">
      <input type="checkbox" id="explore" class="peer hidden" />
      <p class="setting-title">Hide explore</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="notifications" class="peer hidden" />
      <p class="setting-title">Hide notifications</p>
      <div class="toggle-primary"></div>
    </label>

    <label class="setting">
      <input type="checkbox" id="follow" class="peer hidden" />
      <p class="setting-title">Hide follow</p>
      <div class="toggle-primary"></div>
    </label>
  `;

  const settings = document.querySelectorAll(".setting");
  settings.forEach((setting) => {
    setting.addEventListener("change", (e) => saveSetting(e.target.id, "x"));
  });

  loadSettings("x");
}
