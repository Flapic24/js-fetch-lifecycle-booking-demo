const state = {
  slots: {
    status: 'idle',      // idle | loading | success | error
    data: [],
    error: null,
    requestId: 0
  },
  booking: {
    statusBySlotId: {},
    errorBySlotId: {}
  },
  selectedService: null,
  selectedDate: null,
};

const serviceSelectedEl = document.getElementById("service-selected");
const serviceButtons = document.querySelectorAll("[data-service]");
const inputDateSelected = document.getElementById("date-picker");
const fetchSlotsBtn = document.getElementById("fetch-slots")
const statusText = document.getElementById("status");
const slotsEl = document.getElementById("slots");
const SERVICE_LABELS = {
    kardiologia: "Kardiológia",
    nogyogyaszat: "Nőgyógyászat",
    labor: "Labor",
};


function render() {
    fetchSlotsBtn.disabled = !(state.selectedService && state.selectedDate)
    renderServiceSelected();
    showStatus();
    renderSlots();
}

function renderServiceSelected() {
    if(!state.selectedService){
        serviceSelectedEl.textContent = "Nincs kiválasztott szolgáltatás.";
        return
    }

    const label = SERVICE_LABELS[state.selectedService] ?? state.selectedService;
    serviceSelectedEl.textContent = `Kiválasztott szolgáltatás: ${label}`;
};

function showStatus() {
    statusText.textContent = "";
    if (state.slots.status === "error") {
        const msg = document.createElement("p");
        msg.textContent = state.slots.error || "Nem sikerült lekérni az időpontokat.";

        const btn = document.createElement("button");
        btn.id = "retry-btn";
        btn.type = "button";
        btn.textContent = "Újrapróbálás";

        statusText.appendChild(msg);
        statusText.appendChild(btn);
        return;
    }
    if(state.slots.status == `idle`) {
        statusText.textContent = `Állapot: idle`;
    }
    else if(state.slots.status == `loading`) {
        statusText.textContent = `Állapot: loading`
    }
    else if(state.slots.status == `success`) {
        statusText.textContent = `Állapot: success`
    }
}

function renderSlots() {
  if (!slotsEl) return;
  slotsEl.textContent = "";

  const { status, data } = state.slots;

  if (status === "idle") {
    const p = document.createElement("p");
    p.textContent = "Válassz szolgáltatást és dátumot, majd kérd le az időpontokat.";
    slotsEl.appendChild(p);
    return;
  }

  if (status === "loading") {
    const p = document.createElement("p");
    p.textContent = "Időpontok betöltése...";
    slotsEl.appendChild(p);

    // opcionális kis skeleton lista
    const ul = document.createElement("ul");
    for (let i = 0; i < 6; i++) {
      const li = document.createElement("li");
      li.textContent = "— — : — —";
      ul.appendChild(li);
    }
    slotsEl.appendChild(ul);
    return;
  }

  if (status === "error") {
    const p = document.createElement("p");
    p.textContent = "Nem tudtuk megjeleníteni az időpontokat.";
    slotsEl.appendChild(p);
    return;
  }

  if (status === "success") {
    if (!Array.isArray(data) || data.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Nincs elérhető időpont erre a napra.";
      slotsEl.appendChild(p);
      return;
    }

    const ul = document.createElement("ul");
    ul.className = "slots-list";

    data.forEach((slot) => {
        const li = document.createElement("li");
        li.className = "slot-row";
        li.dataset.slotId = slot.id;

        const time = document.createElement("span");
        time.className = "slot-time";
        time.textContent = slot.time;

        // Per-slot booking state
        const bStatus = state.booking.statusBySlotId[slot.id] || "idle";
        const bError = state.booking.errorBySlotId[slot.id];

        const actions = document.createElement("div");
        actions.className = "slot-actions";

        if (bStatus === "idle") {
            const btn = document.createElement("button");
            btn.className = "btn-book-slot";
            btn.type = "button";
            btn.textContent = "Foglalás";
            btn.dataset.action = "book";
            btn.dataset.slotId = slot.id;
            actions.appendChild(btn);
        }

        if (bStatus === "loading") {
            const p = document.createElement("span");
            p.textContent = "⏳ Foglalás folyamatban…";
            actions.appendChild(p);
        }

        if (bStatus === "success") {
            const p = document.createElement("span");
            p.textContent = "✅ Lefoglalva";
            actions.appendChild(p);
        }

        if (bStatus === "error") {
            const errP = document.createElement("span");
            errP.textContent = `❌ ${bError || "Nem sikerült foglalni."}`;

            const retry = document.createElement("button");
            retry.type = "button";
            retry.textContent = "Újrapróbálás";
            retry.dataset.action = "retry-book";
            retry.dataset.slotId = slot.id;

            actions.appendChild(errP);
            actions.appendChild(retry);
        }

        li.appendChild(time);
        li.appendChild(actions);
        ul.appendChild(li);
    });

    slotsEl.appendChild(ul);
    return;
  }
}


async function fetchSlots () {
    if(!state.selectedService || !state.selectedDate) {
        return;
    }
    state.slots.status = 'loading';
    state.booking.statusBySlotId = {};
    state.booking.errorBySlotId = {};
    state.slots.error = null;
    state.slots.data = [];
    render();

    state.slots.requestId++;
    const myRequestId = state.slots.requestId;

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (Math.random() < 0.3) {
            throw new Error('Random hiba');
        }
        if(myRequestId !== state.slots.requestId){
            return;
        }
        state.slots.status = 'success'
        state.slots.error = null;
        state.slots.data = generateFakeSlots(6);
        render();
    }

    catch (err) {
        // ha közben új fetch indult, ezt a hibát dobd el
        if (myRequestId !== state.slots.requestId) {
            return;
        }

        state.slots.status = 'error';
        state.slots.error = 'Nem sikerült lekérni az időpontokat.';
        render();
    }
}

async function fakeBookSlot(slotId) {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  const roll = Math.random();

  if (roll < 0.2) {
    const err = new Error("Már elvitték ezt az időpontot.");
    err.code = "TAKEN";
    throw err;
  }

  if (roll < 0.3) {
    const err = new Error("Hálózati hiba történt.");
    err.code = "NETWORK";
    throw err;
  }

  return { ok: true, slotId };
}

async function bookSlot(slotId) {
  const current = state.booking.statusBySlotId[slotId];

  // Ha már épp foglal, ne indítsunk rá még egyet
  if (current === "loading") return;

  // Állapot: loading
  state.booking.statusBySlotId[slotId] = "loading";
  state.booking.errorBySlotId[slotId] = null;
  render();

  try {
    await fakeBookSlot(slotId);

    // Success
    state.booking.statusBySlotId[slotId] = "success";
    state.booking.errorBySlotId[slotId] = null;
    render();
  } catch (err) {
    state.booking.statusBySlotId[slotId] = "error";
    state.booking.errorBySlotId[slotId] =
      err?.message || "Ismeretlen hiba történt foglalás közben.";
    render();
  }
}

function generateFakeSlots(count = 6) {
    const slots = [];
    let hour = 9;
    let minute = 0;

    for (let i = 0; i < count; i++) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        slots.push({
            id: `slot-${Date.now()}-${i}`,
            time
        });

        minute += 30;
        if (minute >= 60) {
            minute = 0;
            hour++;
        }
    }

    return slots;
}


inputDateSelected.addEventListener("change", (event) => {
    if(!event.target.value) {
        state.selectedDate = null;
        render();
        return;
    }
    state.selectedDate = event.target.value;
    render();
})
fetchSlotsBtn.addEventListener("click", () => {
    fetchSlots();
}) 
serviceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const serviceKey = btn.dataset.service;
        state.selectedService = serviceKey;
        render();
    });
});
statusText.addEventListener("click", (e) => {
  const retryBtn = e.target.closest("#retry-btn");
  if (!retryBtn) return;

  fetchSlots();
});
if (slotsEl) {
  slotsEl.addEventListener("click", (e) => {
    const bookBtn = e.target.closest('[data-action="book"]');
    const retryBtn = e.target.closest('[data-action="retry-book"]');

    const btn = bookBtn || retryBtn;
    if (!btn) return;

    const slotId = btn.dataset.slotId;
    if (!slotId) return;

    bookSlot(slotId);
  });
}
render();