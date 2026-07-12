/* Hollow Creek & Northern Railway — cart page
   Plain JavaScript, no dependencies. Renders the way-bill from the
   shared localStorage cart. Ticket lines get quantity steppers and a
   remove link; donation lines get a remove link. Checkout leads to
   the checkout page. */

(function () {
  "use strict";

  var MAX_QTY = 20;

  var filledEl = document.getElementById("cart-filled");
  var emptyEl = document.getElementById("cart-empty");
  var linesEl = document.getElementById("cart-lines");
  var totalEl = document.getElementById("cart-total");

  function dollars(n) {
    return "$" + n;
  }

  /* Dollar total of one line, mirroring cart.js's math */
  function lineTotal(line) {
    if (line.kind === "donation") return (line.qty || 0) * (line.price || 0);
    return (
      (line.adults || 0) * (line.adultPrice || 0) +
      (line.children || 0) * (line.childPrice || 0)
    );
  }

  /* A −/n/+ stepper for one fare class on one ticket line */
  function buildStepper(key, line, field, label) {
    var row = document.createElement("div");
    row.className = "cart-fare";

    var name = document.createElement("span");
    name.className = "cart-fare-label";
    name.textContent =
      label +
      " · " +
      dollars(field === "adults" ? line.adultPrice : line.childPrice) +
      " each";
    row.appendChild(name);

    var stepper = document.createElement("div");
    stepper.className = "qty-stepper";

    var count = document.createElement("span");
    count.className = "cart-qty";
    count.textContent = line[field];

    function step(delta, stepLabel) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qty-btn";
      btn.textContent = delta < 0 ? "−" : "+";
      btn.setAttribute("aria-label", stepLabel + " for " + line.title);
      btn.addEventListener("click", function () {
        var next = line[field] + delta;
        if (next < 0 || next > MAX_QTY) return;
        var adults = field === "adults" ? next : line.adults;
        var children = field === "children" ? next : line.children;
        Cart.setTicketCounts(key, adults, children);
        render();
      });
      return btn;
    }

    stepper.appendChild(step(-1, "One fewer " + label.toLowerCase()));
    stepper.appendChild(count);
    stepper.appendChild(step(1, "One more " + label.toLowerCase()));
    row.appendChild(stepper);
    return row;
  }

  /* The remove link every line carries */
  function buildRemove(key, what) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cart-remove";
    btn.textContent = "Remove";
    btn.setAttribute("aria-label", "Remove " + what + " from cart");
    btn.addEventListener("click", function () {
      Cart.removeLine(key);
      render();
    });
    return btn;
  }

  function buildTicketLine(key, line) {
    var item = document.createElement("article");
    item.className = "cart-line";

    var head = document.createElement("div");
    head.className = "cart-line-head";
    var title = document.createElement("h2");
    title.className = "cart-line-title";
    title.textContent = line.title;
    head.appendChild(title);
    head.appendChild(buildRemove(key, line.title + " tickets"));
    item.appendChild(head);

    var meta = document.createElement("p");
    meta.className = "cart-line-meta";
    meta.textContent = "Excursion tickets · Departs " + line.time;
    item.appendChild(meta);

    item.appendChild(buildStepper(key, line, "adults", "Adult"));
    item.appendChild(buildStepper(key, line, "children", "Child"));

    var foot = document.createElement("div");
    foot.className = "cart-line-foot";
    var footLabel = document.createElement("span");
    footLabel.textContent = "Line total";
    var footTotal = document.createElement("strong");
    footTotal.className = "cart-line-total";
    footTotal.textContent = dollars(lineTotal(line));
    foot.appendChild(footLabel);
    foot.appendChild(footTotal);
    item.appendChild(foot);

    return item;
  }

  function buildDonationLine(key, line) {
    var item = document.createElement("article");
    item.className = "cart-line";

    var head = document.createElement("div");
    head.className = "cart-line-head";
    var title = document.createElement("h2");
    title.className = "cart-line-title";
    title.textContent = line.label;
    head.appendChild(title);
    head.appendChild(buildRemove(key, line.label));
    item.appendChild(head);

    var meta = document.createElement("p");
    meta.className = "cart-line-meta";
    meta.textContent =
      "Track fund donation · " +
      line.qty +
      " × " +
      dollars(line.price) +
      " · Tax-deductible";
    item.appendChild(meta);

    var foot = document.createElement("div");
    foot.className = "cart-line-foot";
    var footLabel = document.createElement("span");
    footLabel.textContent = "Line total";
    var footTotal = document.createElement("strong");
    footTotal.className = "cart-line-total";
    footTotal.textContent = dollars(lineTotal(line));
    foot.appendChild(footLabel);
    foot.appendChild(footTotal);
    item.appendChild(foot);

    return item;
  }

  /* Redraw the whole way-bill from storage */
  function render() {
    var cart = Cart.read();
    var keys = Object.keys(cart);

    /* Tickets ride up front, donations in the caboose */
    keys.sort(function (a, b) {
      var kindA = cart[a].kind === "donation" ? 1 : 0;
      var kindB = cart[b].kind === "donation" ? 1 : 0;
      return kindA - kindB;
    });

    filledEl.hidden = keys.length === 0;
    emptyEl.hidden = keys.length > 0;

    linesEl.textContent = "";
    keys.forEach(function (key) {
      var line = cart[key];
      linesEl.appendChild(
        line.kind === "donation"
          ? buildDonationLine(key, line)
          : buildTicketLine(key, line)
      );
    });

    totalEl.textContent = dollars(Cart.total());
  }

  /* All aboard for the ticket window */
  document
    .getElementById("checkout-btn")
    .addEventListener("click", function () {
      window.location.href = "checkout.html";
    });

  render();
  Cart.updateBadge();
})();
