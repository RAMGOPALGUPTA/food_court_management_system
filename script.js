/**
 * EATOO Food Court Management System — script.js
 * Handles: Menu loading, Cart management, Order placement, Top Rated section
 */

// ============================================================
// CONFIG
// ============================================================
const API_BASE = "http://localhost:5000";
const MENU_URL = `${API_BASE}/foods`;
const ORDER_URL = `${API_BASE}/order`;
const TOP_URL = `${API_BASE}/top-rated`; // extra endpoint
const REVIEW_URL = `${API_BASE}/add-review`;

// ============================================================
// STATE
// ============================================================
let allFoodItems = []; // full menu fetched from API
let cart = []; // array of food item objects

// Food emoji mapping by keywords (fallback decoration)
const FOOD_EMOJI = {
  pizza: "🍕",
  burger: "🍔",
  noodle: "🍜",
  pasta: "🍝",
  rice: "🍚",
  biryani: "🍛",
  sandwich: "🥪",
  wrap: "🌯",
  salad: "🥗",
  soup: "🍲",
  chai: "☕",
  coffee: "☕",
  juice: "🥤",
  shake: "🥤",
  lassi: "🥛",
  cake: "🍰",
  sweet: "🍮",
  halwa: "🍮",
  paratha: "🫓",
  roti: "🫓",
  dosa: "🥞",
  idli: "🍡",
  vada: "🍩",
  samosa: "🥟",
  roll: "🌯",
  fries: "🍟",
  chicken: "🍗",
  fish: "🐟",
  egg: "🍳",
  paneer: "🧀",
  dal: "🥘",
  sabzi: "🥦",
  default: "🍽",
};

function getFoodEmoji(name = "") {
  const n = name.toLowerCase();
  for (const [key, val] of Object.entries(FOOD_EMOJI)) {
    if (n.includes(key)) return val;
  }
  return FOOD_EMOJI.default;
}

// ============================================================
// SECTION NAVIGATION
// ============================================================
function showSection(name, btn) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.remove("active");
    s.classList.add("hidden");
  });

  // Show target section
  const target = document.getElementById(`section-${name}`);
  if (target) {
    target.classList.add("active");
    target.classList.remove("hidden");
  }

  // Update nav active state
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  // Lazy-load data
  if (name === "menu" && allFoodItems.length === 0) loadMenu();
  if (name === "top") loadTopRated();
  if (name === "orders") renderCart();
}

// ============================================================
// MENU — FETCH & RENDER
// ============================================================
async function loadMenu() {
  const grid = document.getElementById("menuGrid");
  const loader = document.getElementById("menuLoader");
  const error = document.getElementById("menuError");

  // Reset UI
  grid.classList.add("hidden");
  error.classList.add("hidden");
  loader.classList.remove("hidden");

  try {
    const res = await fetch(MENU_URL);
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();

    // Normalise: accept array or { foods: [...] }
    allFoodItems = Array.isArray(data) ? data : data.foods || data.items || [];

    loader.classList.add("hidden");
    renderMenuGrid(allFoodItems);
  } catch (err) {
    console.error("Menu fetch error:", err);
    loader.classList.add("hidden");
    document.getElementById("menuErrorMsg").textContent =
      `Could not reach ${MENU_URL}. Make sure your backend is running.`;
    error.classList.remove("hidden");
  }
}

function renderMenuGrid(items) {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = "";

  if (!items || items.length === 0) {
    grid.innerHTML =
      '<p style="color:var(--muted);text-align:center;padding:3rem">No items found.</p>';
    grid.classList.remove("hidden");
    return;
  }

  items.forEach((item, idx) => {
    const card = buildFoodCard(item, idx, false);
    grid.appendChild(card);
  });

  grid.classList.remove("hidden");
}

function buildFoodCard(item, idx, isTopRated) {
  // Normalise field names (flexible for different API shapes)
  const id = item.id || item.food_id || idx;
  const name = item.name || item.food_name || item.title || "Unnamed Dish";
  const price = item.price || item.cost || 0;
  const vendor = item.vendor || item.vendor_name || item.stall || "";
  const rating = item.rating || item.avg_rating || null;
  const emoji = getFoodEmoji(name);

  const card = document.createElement("div");
  card.className = "food-card";
  card.style.animationDelay = `${Math.min(idx * 0.04, 0.4)}s`;

  card.innerHTML = `
    <div class="card-top">
      <div class="card-emoji">${emoji}</div>
      <div class="card-info">
        <div class="card-name" title="${name}">${name}</div>
        ${vendor ? `<div class="card-vendor">${vendor}</div>` : ""}
      </div>
    </div>
    <div class="card-bottom">
      <span class="card-price">${Number(price).toFixed(2)}</span>
      <div style="display:flex;align-items:center;gap:.5rem">
        ${rating ? `<span class="card-rating">⭐ ${parseFloat(rating).toFixed(1)}</span>` : ""}
        <button class="btn-order-card" onclick="addToCart(${JSON.stringify({ id, name, price, vendor, emoji }).replace(/"/g, "&quot;")})">+ Add</button>
<button class="btn-review" onclick="openReviewModal(${id}, '${name}')">⭐ Rate</button>
      </div>
    </div>
  `;
  return card;
}

// ============================================================
// SEARCH / FILTER
// ============================================================
function filterMenu() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const filtered = q
    ? allFoodItems.filter((item) => {
        const name = (item.name || item.food_name || "").toLowerCase();
        const vendor = (item.vendor || item.vendor_name || "").toLowerCase();
        return name.includes(q) || vendor.includes(q);
      })
    : allFoodItems;
  renderMenuGrid(filtered);
}

// ============================================================
// CART MANAGEMENT
// ============================================================
function addToCart(item) {
  // Prevent duplicates — just bump a qty concept or just add
  cart.push(item);
  updateCartBadge();
  showToast(`${item.emoji} ${item.name} added to cart!`);

  // Flash button green
  const btn = document.getElementById(`addbtn-${item.id}`);
  if (btn) {
    btn.textContent = "✓ Added";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "+ Add";
      btn.classList.remove("added");
    }, 1200);
  }
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  document.getElementById("cartCount").textContent = cart.length;
}

function renderCart() {
  const emptyEl = document.getElementById("emptyCart");
  const listEl = document.getElementById("cartItems");
  const formEl = document.getElementById("checkoutForm");
  const successEl = document.getElementById("orderSuccess");

  successEl.classList.add("hidden");

  if (cart.length === 0) {
    emptyEl.style.display = "";
    listEl.classList.add("hidden");
    formEl.classList.add("hidden");
    return;
  }

  emptyEl.style.display = "none";
  listEl.classList.remove("hidden");
  formEl.classList.remove("hidden");

  // Render cart items
  listEl.innerHTML = "";
  cart.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${item.vendor ? `<div class="cart-item-vendor">🏪 ${item.vendor}</div>` : ""}
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">${Number(item.price).toFixed(2)}</span>
        <button class="btn-remove" onclick="removeFromCart(${idx})" title="Remove">✕</button>
      </div>
    `;
    listEl.appendChild(row);
  });

  // Render order summary
  const total = cart.reduce((sum, i) => sum + Number(i.price), 0);
  const summaryEl = document.getElementById("orderSummary");
  const lines = cart
    .map(
      (i) =>
        `<div>${i.name} <span style="float:right">₹${Number(i.price).toFixed(2)}</span></div>`,
    )
    .join("");
  summaryEl.innerHTML = `
    ${lines}
    <div class="total-line">Total &nbsp; <span style="float:right">₹${total.toFixed(2)}</span></div>
  `;
}

// ============================================================
// PLACE ORDER
// ============================================================

async function placeOrder() {
  const studentId = document.getElementById("studentIdInput").value.trim();

  if (!studentId) {
    showToast("⚠️ Please enter your Student ID");
    document.getElementById("studentIdInput").focus();
    return;
  }

  if (cart.length === 0) {
    showToast("⚠️ Your cart is empty!");
    return;
  }

  const btn = document.getElementById("orderBtn");
  const btnTxt = document.getElementById("orderBtnText");

  // Loading state
  btn.disabled = true;
  btnTxt.textContent = "⏳ Placing order…";

  try {
    const payload = {
      student_id: studentId,
      items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price })),
      total: cart.reduce((s, i) => s + Number(i.price), 0),
    };

    const res = await fetch(ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok)
      throw new Error(
        data.message || data.error || `Server error ${res.status}`,
      );

    // Success
    const orderId = data.order_id || data.id || data.orderId || "—";

    document.getElementById("successMsg").innerHTML =
      `Order <strong>#${orderId}</strong> placed successfully for Student <strong>${studentId}</strong>.`;

    document.getElementById("checkoutForm").classList.add("hidden");
    document.getElementById("cartItems").classList.add("hidden");
    document.getElementById("orderSuccess").classList.remove("hidden");

    // ✅ RESET BUTTON STATE
    btn.disabled = false;
    btnTxt.textContent = "✓ Confirm Order";

    // ✅ CLEAR CART
    cart = [];
    updateCartBadge();

    // Clear cart
    cart = [];
    updateCartBadge();
  } catch (err) {
    console.error("Order error:", err);
    showToast(`❌ Order failed: ${err.message}`);
    btn.disabled = false;
    btnTxt.textContent = "✓ Confirm Order";
  }
}

function resetOrder() {
    cart = [];
    updateCartBadge();

    document.getElementById('studentIdInput').value = "";

    document.getElementById('orderSuccess').classList.add('hidden');
    document.getElementById('checkoutForm').classList.remove('hidden');
    document.getElementById('cartItems').classList.remove('hidden');

    renderCart();
}

// ============================================================
// TOP RATED
// ============================================================
async function loadTopRated() {
  const grid = document.getElementById("topGrid");
  const loader = document.getElementById("topLoader");
  const error = document.getElementById("topError");

  if (grid.children.length > 0) return; // already loaded

  grid.classList.add("hidden");
  error.classList.add("hidden");
  loader.classList.remove("hidden");

  try {
    const res = await fetch(TOP_URL);
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.foods || data.items || [];

    loader.classList.add("hidden");

    if (!items.length) {
      grid.innerHTML =
        '<p style="color:var(--muted);text-align:center;padding:3rem">No top-rated items found.</p>';
      grid.classList.remove("hidden");
      return;
    }

    items.forEach((item, idx) => {
      grid.appendChild(buildFoodCard(item, idx, true));
    });
    grid.classList.remove("hidden");
  } catch (err) {
    console.error("Top rated fetch error:", err);
    loader.classList.add("hidden");
    document.getElementById("topErrorMsg").textContent =
      `Could not load top-rated items from ${TOP_URL}.`;
    error.classList.remove("hidden");
  }
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 350);
  }, 2500);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Set footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Auto-load menu on startup
  loadMenu();
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    currentUser = JSON.parse(savedUser);

    document.getElementById("authSection").style.display = "none";
    document.getElementById("userSection").classList.remove("hidden");
    document.getElementById("userName").innerText = currentUser.name;

    document.getElementById("studentIdInput").value = currentUser.student_id;
  }
});

let currentFoodId = null;

function openReviewModal(id, name) {
  currentFoodId = id;
  document.getElementById("foodName").innerText = name;
  document.getElementById("reviewModal").classList.remove("hidden");
}

function closeReviewModal() {
  document.getElementById("reviewModal").classList.add("hidden");
}

async function submitReview() {
  const student_id = document.getElementById("reviewStudentId").value;
  const rating = document.getElementById("ratingValue").value;
  const comment = document.getElementById("reviewComment").value;

  const res = await fetch(REVIEW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id,
      food_id: currentFoodId,
      rating,
      comment,
    }),
  });

  alert("Review Submitted!");
  closeReviewModal();
}

const REGISTER_URL = `${API_BASE}/register`;
const LOGIN_URL = `${API_BASE}/login`;

let currentUser = null;

async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const res = await fetch(REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });

  const data = await res.json();

  alert("Registered! Your ID: " + data.student_id);
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (data.student) {
    currentUser = data.student;

    // Save session
    localStorage.setItem("user", JSON.stringify(currentUser));

    document.getElementById("authSection").style.display = "none";

    document.getElementById("userSection").classList.remove("hidden");
    document.getElementById("userName").innerText = currentUser.name;

    document.getElementById("studentIdInput").value = currentUser.student_id;

    showToast("Welcome " + currentUser.name);
  } else {
    alert("Login failed");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("user");

  document.getElementById("authSection").style.display = "flex";
  document.getElementById("userSection").classList.add("hidden");

  showToast("Logged out successfully");
}
