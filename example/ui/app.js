const state = {
  members: [],
  loading: false,
  error: "",
};

const elements = {
  form: document.querySelector("#member-form"),
  list: document.querySelector("#member-list"),
  status: document.querySelector("#status"),
  refresh: document.querySelector("#refresh-button"),
  formMessage: document.querySelector("#form-message"),
  name: document.querySelector("#name"),
  role: document.querySelector("#role"),
  email: document.querySelector("#email"),
};

function resolveApiBase() {
  const configured = window.__TEAM_DIRECTORY_API_BASE__;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const { protocol, hostname, port } = window.location;
  if (port === "" || port === "80" || port === "443") {
    return "/api";
  }

  return `${protocol}//${hostname}:3001/api`;
}

const apiBase = resolveApiBase();

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function setStatus(message, kind = "info") {
  elements.status.textContent = message;
  elements.status.dataset.kind = kind;
}

function setFormMessage(message, kind = "info") {
  elements.formMessage.textContent = message;
  elements.formMessage.dataset.kind = kind;
}

function renderMembers() {
  if (state.loading) {
    elements.list.innerHTML = '<p class="empty-state">Loading members...</p>';
    return;
  }

  if (state.error) {
    elements.list.innerHTML = `<p class="empty-state">${state.error}</p>`;
    return;
  }

  if (!state.members.length) {
    elements.list.innerHTML = '<p class="empty-state">No members found.</p>';
    return;
  }

  elements.list.innerHTML = state.members.map((member) => `
    <article class="member-card" data-id="${member.id}">
      <div class="member-avatar">${initials(member.name)}</div>
      <div class="member-body">
        <div class="member-meta">
          <h3>${member.name}</h3>
          <p>${member.role}</p>
          <a href="mailto:${member.email}">${member.email}</a>
        </div>
        <button type="button" class="danger" data-action="delete" data-id="${member.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

async function loadMembers() {
  state.loading = true;
  state.error = "";
  renderMembers();
  setStatus("Loading members...");

  try {
    const response = await fetch(`${apiBase}/members`);
    if (!response.ok) {
      throw new Error("Could not load members.");
    }
    state.members = await response.json();
    setStatus(`Loaded ${state.members.length} members.`);
  } catch (error) {
    state.error = error.message;
    setStatus(error.message, "error");
  } finally {
    state.loading = false;
    renderMembers();
  }
}

async function createMember(event) {
  event.preventDefault();
  setFormMessage("Creating member...");

  const payload = {
    name: elements.name.value.trim(),
    role: elements.role.value.trim(),
    email: elements.email.value.trim(),
  };

  try {
    const response = await fetch(`${apiBase}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not create member.");
    }

    elements.form.reset();
    setFormMessage(`Created ${data.name}.`, "success");
    await loadMembers();
  } catch (error) {
    setFormMessage(error.message, "error");
  }
}

async function deleteMember(id) {
  setStatus("Deleting member...");

  try {
    const response = await fetch(`${apiBase}/members/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not delete member.");
    }
    await loadMembers();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

elements.form.addEventListener("submit", createMember);
elements.refresh.addEventListener("click", loadMembers);
elements.list.addEventListener("click", (event) => {
  const button = event.target.closest('button[data-action="delete"]');
  if (!button) {
    return;
  }
  deleteMember(button.dataset.id);
});

loadMembers();
