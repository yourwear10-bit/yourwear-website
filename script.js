// ===== Active nav highlight (based on current page) =====
(function(){
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === path) a.classList.add("active");
    });
  })();
  const WHATSAPP_NUMBER = "+212773685871"; // <-- change to your real number
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;
  
  // ===== Shop: image preview =====
  (function(){
    const input = document.getElementById("userPhotos");
    const preview = document.getElementById("preview");
    if (!input || !preview) return;
  
    input.addEventListener("change", () => {
      preview.innerHTML = "";
      const files = Array.from(input.files || []);
      files.slice(0, 12).forEach(file => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = "Uploaded photo";
        preview.appendChild(img);
      });
    });
  })();
  
  // ===== Chatbot (UI ready — you will replace script later) =====
  const chatToggle = document.getElementById("chatToggle");
  const chatWidget = document.getElementById("chatWidget");
  const chatClose  = document.getElementById("chatClose");
  const chatBox    = document.getElementById("chatBox");
  const quickReplies = document.getElementById("quickReplies");
  const chatForm   = document.getElementById("chatForm");
  const chatInput  = document.getElementById("chatInput");
  
  function addMessage(text, who="bot"){
    if (!chatBox) return;
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  function setSuggestions(list){
    if (!quickReplies) return;
    quickReplies.innerHTML = "";
    list.forEach(txt => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = txt;
      b.addEventListener("click", () => handleUserMessage(txt));
      quickReplies.appendChild(b);
    });
  }
  
  // ===== Chatbot flow (updated) =====
let mode = null; // "customize" | "problem" | "info"
let step = 0;

// Customize script (your current one)
const customizeFlow = [
  {
    q: "Perfect ✅ What do you want to customize today?",
    suggestions: ["Hoodie", "T-shirt", "Cap" , "other"]
  },
  {
    q: "Nice. What style do you want?",
    suggestions: ["Embroidery", "Print", "Both"]
  },
  {
    q: "Type your details (text/logo/colors/size/placement) in the box below 👇",
    suggestions: ["I’ll type now", "Show examples", "Pricing info"]
  }
];

// Problems script (3 clickable problems)
const problemFlow = [
  {
    q: "Sorry about that 🙏 What issue are you facing?",
    suggestions: [
      "I can’t upload files/photos",
      "I can’t find what I want to customize",
      "Other problem"
    ]
  }
];

// Info script (3rd option)
const infoFlow = [
  {
    q: "Sure ✅ What do you want to know?",
    suggestions: [
      "Prices & how it works",
      "Delivery time",
      "Refund policy"
    ]
  }
];

function supportMessage() {
  return `If you need quick support, contact us on WhatsApp: ${WHATSAPP_NUMBER} ✅`;
}

function supportLinkMessage() {
  // clickable link inside chat (simple)
  return `WhatsApp support link: ${WHATSAPP_LINK}`;
}

function firstQuestion() {
  mode = null;
  step = 0;
  addMessage("How can I help you today?", "bot");
  setSuggestions([
    "I want to customize a product",
    "I’m facing a problem on the website",
    "I want pricing / delivery info"
  ]);
}

function askNext() {
  // Choose flow based on mode
  let flow = [];
  if (mode === "customize") flow = customizeFlow;
  if (mode === "problem") flow = problemFlow;
  if (mode === "info") flow = infoFlow;

  if (!flow.length) {
    firstQuestion();
    return;
  }

  if (step < flow.length) {
    addMessage(flow[step].q, "bot");
    setSuggestions(flow[step].suggestions);
  } else {
    // After flow ends, always encourage WhatsApp support
    setSuggestions([]);
    addMessage("✅ Thanks! You can type more details in the box below.", "bot");
    addMessage(supportMessage(), "bot");
    addMessage(supportLinkMessage(), "bot");
  }
}

function handleUserMessage(text) {
  const msg = (text || "").trim();
  if (!msg) return;

  addMessage(msg, "user");
  chatInput.value = "";

  // --- Mode selection based on first question ---
  if (mode === null) {
    const lower = msg.toLowerCase();

    if (lower.includes("customize") || lower.includes("customise") || lower.includes("person") || lower.includes("product")) {
      mode = "customize";
      step = 0;
      addMessage("Great ✅ Let’s customize.", "bot");
      addMessage(supportMessage(), "bot");
      addMessage(supportLinkMessage(), "bot");
      askNext();
      return;
    }

    if (lower.includes("problem") || lower.includes("issue") || lower.includes("difficulty") || lower.includes("bug")) {
      mode = "problem";
      step = 0;
      addMessage("Okay ✅ Let’s solve the issue.", "bot");
      addMessage(supportMessage(), "bot");
      addMessage(supportLinkMessage(), "bot");
      askNext();
      return;
    }

    if (lower.includes("price") || lower.includes("delivery") || lower.includes("refund") || lower.includes("info")) {
      mode = "info";
      step = 0;
      addMessage("Sure ✅ Here’s info.", "bot");
      addMessage(supportMessage(), "bot");
      addMessage(supportLinkMessage(), "bot");
      askNext();
      return;
    }

    // fallback if they type something else
    addMessage("Choose one option above or type: customize / problem / info.", "bot");
    return;
  }

  // --- If they are in problem mode, respond to the 3 problem buttons ---
  if (mode === "problem" && step === 0) {
    const lower = msg.toLowerCase();

    if (lower.includes("upload")) {
      addMessage("For upload issues: try refreshing the page, using Chrome, and uploading JPG/PNG under a reasonable size.", "bot");
      addMessage(supportMessage(), "bot");
      addMessage(supportLinkMessage(), "bot");
      step++;
      askNext();
      return;
    }

    if (lower.includes("find")) {
      addMessage("If you can’t find what to customize: tell us the clothing type (hoodie, jacket, cap…) and the style you want.", "bot");
      addMessage(supportMessage(), "bot");
      addMessage(supportLinkMessage(), "bot");
      step++;
      askNext();
      return;
    }

    // Other problem
    addMessage("No worries ✅ Describe the problem in one sentence (what you clicked + what happened).", "bot");
    addMessage(supportMessage(), "bot");
    addMessage(supportLinkMessage(), "bot");
    step++;
    askNext();
    return;
  }

  // --- Continue current flow normally ---
  addMessage("Noted ✅", "bot");
  step++;
  setTimeout(askNext, 200);
}

// Start chatbot
// Replace your previous start message / ask() call with:
addMessage("YourWear — 24/7 assistant is online ✅", "bot");
firstQuestion();
  
  function openChat(){
    if (!chatWidget) return;
    chatWidget.style.display = "block";
    chatWidget.setAttribute("aria-hidden", "false");
    if (chatBox && chatBox.childElementCount === 0){
      addMessage("YourWear — 24/7 assistant is online ✅", "bot");
      ask();
    }
  }
  
  function closeChat(){
    if (!chatWidget) return;
    chatWidget.style.display = "none";
    chatWidget.setAttribute("aria-hidden", "true");
  }
  
  if (chatToggle) chatToggle.addEventListener("click", openChat);
  if (chatClose)  chatClose.addEventListener("click", closeChat);
  
  if (chatForm){
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserMessage(chatInput.value);
      chatInput.value = "";
    });
  }
  // ===== Ready-to-wear modal (Shop page) =====
let currentBasePrice = 0;

function openProduct(card){
  const name = card.getAttribute("data-name");
  const price = Number(card.getAttribute("data-price")) || 0;

  currentBasePrice = price;

  const modal = document.getElementById("productModal");
  const title = document.getElementById("modalTitle");
  const priceEl = document.getElementById("modalPrice");
  const size = document.getElementById("modalSize");

  if (!modal || !title || !priceEl || !size) return;

  title.textContent = name;
  size.value = "M"; // default
  priceEl.textContent = String(price);

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeProduct(){
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

// Optional: price can vary by size (simple example)
function updateModalPrice(){
  const size = document.getElementById("modalSize").value;
  const priceEl = document.getElementById("modalPrice");
  if (!priceEl) return;

  let extra = 0;
  if (size === "L") extra = 10;
  if (size === "XL") extra = 20;

  priceEl.textContent = String(currentBasePrice + extra);
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("productModal");
  if (!modal || !modal.classList.contains("open")) return;

  if (e.target === modal) closeProduct();
});
// ===== REAL SEARCH (STATIC SITE) =====
// You can add/edit keywords any time.
const SEARCH_INDEX = [
  // Home
  { title: "Home — Wear what you imagine", page: "index.html", anchor: "#top", keywords: ["home", "yourwear", "wear what you imagine", "identity", "philosophy", "brand"] },
  { title: "Home — Details (tools & tailoring)", page: "index.html", anchor: "#details", keywords: ["details", "tools", "embroidery tools", "tailoring", "thread", "needle"] },

  // Shop
  { title: "Shop — Ready-to-wear products", page: "shop.html", anchor: "#ready", keywords: ["shop now", "ready", "ready to wear", "products", "hoodie", "tee", "cap", "jacket", "price", "sizes"] },
  { title: "Shop — Upload & customization", page: "shop.html", anchor: "#custom", keywords: ["upload", "custom", "customization", "edit", "embroidery", "print", "describe", "model"] },

  // About
  { title: "About us — Concept", page: "about.html", anchor: "#concept", keywords: ["about", "concept", "idea", "our story", "who we are"] },

  // Legal
  { title: "Legal — Delivery & refund", page: "legal.html", anchor: "#policy", keywords: ["legal", "delivery", "refund", "free delivery", "300dh", "policy"] },

  // Contact
  { title: "Contact — Socials & QR", page: "contact.html", anchor: "#contact", keywords: ["contact", "instagram", "tiktok", "email", "phone", "qr"] },
];

function normalizeText(s){
  return (s || "").toLowerCase().trim();
}

function scoreMatch(query, item){
  const q = normalizeText(query);
  if (!q) return 0;

  let score = 0;
  const title = normalizeText(item.title);

  // Strong match: query inside title
  if (title.includes(q)) score += 50;

  // Keyword matches
  item.keywords.forEach(k => {
    const kk = normalizeText(k);
    if (kk === q) score += 40;
    else if (kk.includes(q) || q.includes(kk)) score += 15;
  });

  // Multi-word query partials
  q.split(/\s+/).forEach(part => {
    if (part.length < 2) return;
    if (title.includes(part)) score += 6;
    item.keywords.forEach(k => {
      if (normalizeText(k).includes(part)) score += 3;
    });
  });

  return score;
}

function renderResults(list){
  const box = document.getElementById("searchResults");
  if (!box) return;

  if (!list.length){
    box.innerHTML = `<div class="search-item"><div class="title">No results</div><div class="meta">Try: hoodie, delivery, refund, about...</div></div>`;
    box.classList.add("open");
    return;
  }

  box.innerHTML = list.map(r => `
    <div class="search-item" data-page="${r.page}" data-anchor="${r.anchor}">
      <div class="title">${r.title}</div>
      <div class="meta">${r.page.replace(".html","")} ${r.anchor !== "#top" ? "• section" : ""}</div>
    </div>
  `).join("");

  box.classList.add("open");

  // Click handlers
  box.querySelectorAll(".search-item").forEach(el => {
    el.addEventListener("click", () => {
      const page = el.getAttribute("data-page");
      const anchor = el.getAttribute("data-anchor") || "";
      // go to page + anchor
      window.location.href = `${page}${anchor}`;
    });
  });
}

function runSearch(){
  const input = document.getElementById("searchInput");
  if (!input) return;

  const q = input.value;
  const ranked = SEARCH_INDEX
    .map(item => ({ ...item, _score: scoreMatch(q, item) }))
    .filter(x => x._score > 0)
    .sort((a,b) => b._score - a._score)
    .slice(0, 7);

  renderResults(ranked);
}

// Live results while typing + enter to search
(function(){
  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchResults");
  if (!input || !box) return;

  input.addEventListener("input", () => {
    const q = normalizeText(input.value);
    if (!q){ box.classList.remove("open"); box.innerHTML = ""; return; }
    runSearch();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){
      e.preventDefault();
      runSearch();
    }
    if (e.key === "Escape"){
      box.classList.remove("open");
    }
  });

  // close if click outside
  document.addEventListener("click", (e) => {
    if (!box.classList.contains("open")) return;
    const wrap = e.target.closest(".search-wrap");
    if (!wrap) box.classList.remove("open");
  });
})();
// ===== CART SYSTEM (localStorage) =====
const CART_KEY = "yourwear_cart_v1";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function cartItemId(name, size){
  return `${name}__${size}`;
}

function addToCart(name, basePrice, size, qty=1){
  const id = cartItemId(name, size);
  const existing = cart.find(i => i.id === id);

  if (existing){
    existing.qty += qty;
  } else {
    cart.push({
      id,
      name,
      size,
      price: Number(basePrice) || 0,
      qty
    });
  }
  saveCart();
  openCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0){
    removeFromCart(id);
    return;
  }
  saveCart();
}

function calcTotal(){
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function renderCart(){
  const body = document.getElementById("cartBody");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");

  if (!body || !totalEl || !countEl) return;

  const totalQty = cart.reduce((s,i) => s + i.qty, 0);
  countEl.textContent = totalQty;

  if (cart.length === 0){
    body.innerHTML = `<div class="cart-item"><div class="cart-item-name">Your cart is empty.</div><div class="cart-item-meta">Add a ready-to-wear product to start.</div></div>`;
    totalEl.textContent = "0";
    return;
  }

  body.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-top">
        <div>
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-meta">Size: ${i.size} • ${i.price} DH each</div>
        </div>
        <button class="remove" type="button" onclick="removeFromCart('${i.id}')">Remove</button>
      </div>

      <div class="cart-controls">
        <div class="qty">
          <button type="button" onclick="changeQty('${i.id}', -1)">−</button>
          <span>${i.qty}</span>
          <button type="button" onclick="changeQty('${i.id}', 1)">+</button>
        </div>
        <div><strong>${i.price * i.qty} DH</strong></div>
      </div>
    </div>
  `).join("");

  totalEl.textContent = String(calcTotal());
}

// Drawer open/close
function openCart(){
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}
function closeCart(){
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

// Cart button
(function(){
  const fab = document.getElementById("cartFab");
  if (fab) fab.addEventListener("click", openCart);
  renderCart();
})();

// Checkout to WhatsApp (simple)
function checkoutWhatsApp(){
  if (cart.length === 0){
    alert("Your cart is empty.");
    return;
  }

  // Put YOUR WhatsApp number here:
  const number = "212773685871"; // <-- replace with your WhatsApp (no +)
  const lines = cart.map(i => `• ${i.name} (Size ${i.size}) x${i.qty} = ${i.price * i.qty} DH`);
  const msg =
    `Hello YourWear 👋%0A` +
    `I want to order:%0A` +
    `${lines.join("%0A")}%0A%0A` +
    `Total: ${calcTotal()} DH`;

  window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
}
function addCurrentProductToCart(){
  const name = document.getElementById("modalTitle").textContent; // product name
  const size = document.getElementById("modalSize").value;       // selected size
  const price = Number(document.getElementById("modalPrice").textContent); // displayed price

  addToCart(name, price, size, 1); // add 1 item to cart
}
// ===== Reviews slider (swipe + buttons + dots) =====
(function(){
  const track = document.getElementById("revTrack");
  const viewport = document.getElementById("revViewport");
  const prev = document.getElementById("revPrev");
  const next = document.getElementById("revNext");
  const dotsWrap = document.getElementById("revDots");

  if (!track || !viewport || !prev || !next || !dotsWrap) return;

  const slides = Array.from(track.children);
  let index = 0;

  // Create dots
  dotsWrap.innerHTML = "";
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to review ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function update(){
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i){
    index = (i + slides.length) % slides.length;
    update();
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));

  // Swipe support
  let startX = 0;
  let dx = 0;
  let dragging = false;

  viewport.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dx = 0;
    dragging = true;
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    dx = e.touches[0].clientX - startX;
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;

    // threshold
    if (dx > 40) goTo(index - 1);
    else if (dx < -40) goTo(index + 1);
  });

  // Init
  update();
})();