const state = {
  catalog: [],
  metadata: null,
  search: "",
  category: "all",
  platform: "all",
  install: "all",
  sort: "recommended",
};

const elements = {
  search: document.querySelector("#search-input"),
  category: document.querySelector("#category-filter"),
  platform: document.querySelector("#platform-filter"),
  install: document.querySelector("#install-filter"),
  sort: document.querySelector("#sort-select"),
  reset: document.querySelector("#reset-filters"),
  results: document.querySelector("#results"),
  summary: document.querySelector("#result-summary"),
  empty: document.querySelector("#empty-state"),
  error: document.querySelector("#error-banner"),
  template: document.querySelector("#card-template"),
  toast: document.querySelector("#toast"),
  version: document.querySelector("#catalog-version"),
};

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const getSearchText = (app) =>
  normalize(
    [
      app.name,
      app.description,
      app.category,
      ...app.alternativeTo,
      ...(app.aliases ?? []),
      ...app.tags,
      ...app.platforms,
    ].join(" "),
  );

const getFilteredApps = () => {
  const query = normalize(state.search);
  const matches = state.catalog.filter((app) => {
    const searchMatches = !query || getSearchText(app).includes(query);
    const categoryMatches = state.category === "all" || app.category === state.category;
    const platformMatches = state.platform === "all" || app.platforms.includes(state.platform);
    const installMatches =
      state.install === "all" ||
      (state.install === "manual" ? !app.install : app.install?.provider === state.install);
    return searchMatches && categoryMatches && platformMatches && installMatches;
  });

  if (state.sort === "name") {
    matches.sort((a, b) => a.name.localeCompare(b.name, "en"));
  } else if (state.sort === "recent") {
    matches.sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
  } else {
    matches.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "en"));
  }
  return matches;
};

const showToast = (message) => {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 1800);
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("安装命令已复制");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("安装命令已复制");
  }
};

const createCard = (app) => {
  const node = elements.template.content.firstElementChild.cloneNode(true);
  node.querySelector(".app-category").textContent = app.category;
  const badge = node.querySelector(".verification-badge");
  badge.textContent = "免费开源";
  badge.title = app.verified ? "免费开源，基础信息已整理" : "免费开源，社区提交信息待整理";
  badge.classList.toggle("community", !app.verified);
  node.querySelector(".app-monogram").textContent = app.name.slice(0, 2).toUpperCase();
  node.querySelector(".app-name").textContent = app.name;
  node.querySelector(".alternative-line").textContent = `可替代：${app.alternativeTo.join("、")}`;
  node.querySelector(".app-description").textContent = app.description;
  node.querySelector(".app-license").textContent = app.license;
  node.querySelector(".app-verified-date").textContent = formatDate(app.verifiedAt);

  const tags = node.querySelector(".tag-list");
  [...app.platforms, ...app.tags.slice(0, 2)].forEach((tag) => {
    const item = document.createElement("span");
    item.textContent = tag;
    tags.append(item);
  });

  if (app.install?.provider === "winget") {
    const command = `winget install --id ${app.install.packageId} --exact`;
    const install = node.querySelector(".install-command");
    install.hidden = false;
    install.querySelector("code").textContent = command;
    install.querySelector("button").addEventListener("click", () => copyText(command));
  }

  const website = node.querySelector(".primary-action");
  website.href = app.website;
  website.setAttribute("aria-label", `访问 ${app.name} 官网`);
  const repository = node.querySelector(".secondary-action");
  repository.href = app.repository;
  repository.setAttribute("aria-label", `查看 ${app.name} 源码`);
  return node;
};

const render = () => {
  const matches = getFilteredApps();
  elements.results.replaceChildren(...matches.map(createCard));
  elements.results.setAttribute("aria-busy", "false");
  elements.summary.textContent = `显示 ${matches.length} / ${state.catalog.length} 个项目`;
  elements.empty.hidden = matches.length !== 0;
  elements.results.hidden = matches.length === 0;
};

const resetFilters = () => {
  state.search = "";
  state.category = "all";
  state.platform = "all";
  state.install = "all";
  state.sort = "recommended";
  elements.search.value = "";
  elements.category.value = "all";
  elements.platform.value = "all";
  elements.install.value = "all";
  elements.sort.value = "recommended";
  render();
};

const addOptions = (select, values) => {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
};

const attachEvents = () => {
  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });
  elements.category.addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });
  elements.platform.addEventListener("change", (event) => {
    state.platform = event.target.value;
    render();
  });
  elements.install.addEventListener("change", (event) => {
    state.install = event.target.value;
    render();
  });
  elements.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });
  elements.reset.addEventListener("click", resetFilters);
  document.querySelector("[data-reset]").addEventListener("click", resetFilters);
  document.querySelectorAll("[data-query]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.search.value = button.dataset.query;
      state.search = button.dataset.query;
      render();
      document.querySelector("#catalog-heading").scrollIntoView({ behavior: "smooth" });
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== elements.search) {
      event.preventDefault();
      elements.search.focus();
    }
  });
};

const loadCatalog = async () => {
  try {
    let payload = window.OPENCHOICES_CATALOG;
    if (!payload) {
      const response = await fetch("data/catalog.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
      payload = await response.json();
    }
    state.catalog = payload.apps;
    state.metadata = payload.metadata;
    addOptions(elements.category, [...new Set(state.catalog.map((app) => app.category))].sort());
    addOptions(
      elements.platform,
      [...new Set(state.catalog.flatMap((app) => app.platforms))].sort(),
    );
    elements.version.textContent = `目录 v${payload.metadata.version} · 更新于 ${formatDate(payload.metadata.updatedAt)}`;
    render();
  } catch (error) {
    console.error(error);
    elements.results.setAttribute("aria-busy", "false");
    elements.results.hidden = true;
    elements.error.hidden = false;
    elements.summary.textContent = "目录载入失败";
  }
};

attachEvents();
loadCatalog();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
