/* Hollow Creek & Northern Railway — checkout page
   Plain JavaScript, no dependencies. Draws an order summary from the
   shared cart, gathers passenger name, email, and mailing address,
   asks a unique dedication name for every $100 tie sponsorship, and
   takes pretend payment. Everything the visitor types is sanitized
   and rendered with textContent only — never markup. Checkout clears
   the cart and hands over an order number. */

(function () {
  "use strict";

  var MAX_LEN = 120;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var filledEl = document.getElementById("checkout-filled");
  var emptyEl = document.getElementById("checkout-empty");
  var doneEl = document.getElementById("checkout-done");
  var summaryEl = document.getElementById("checkout-summary");
  var form = document.getElementById("checkout-form");
  var tieSetEl = document.getElementById("tie-set");
  var tieFieldsEl = document.getElementById("tie-fields");
  var noticeEl = document.getElementById("checkout-notice");

  function dollars(n) {
    return "$" + n;
  }

  /* Scrub one typed value: strip angle brackets and control
     characters, collapse runs of whitespace, trim, cap the length.
     Belt to go with the textContent suspenders. */
  function sanitize(value) {
    return String(value == null ? "" : value)
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_LEN);
  }

  /* Dollar total of one line, mirroring cart.js's math */
  function lineTotal(line) {
    if (line.kind === "donation") return (line.qty || 0) * (line.price || 0);
    return (
      (line.adults || 0) * (line.adultPrice || 0) +
      (line.children || 0) * (line.childPrice || 0)
    );
  }

  /* One printed row on the order summary */
  function summaryRow(label, detail, amount) {
    var row = document.createElement("div");
    row.className = "fare-row";
    var left = document.createElement("span");
    left.textContent = label;
    if (detail) {
      var small = document.createElement("span");
      small.className = "fare-price";
      small.textContent = " " + detail;
      left.appendChild(small);
    }
    var right = document.createElement("span");
    right.textContent = amount;
    row.appendChild(left);
    row.appendChild(right);
    return row;
  }

  /* Draw the way-bill recap above the form */
  function renderSummary(cart, keys) {
    summaryEl.textContent = "";
    keys.forEach(function (key) {
      var line = cart[key];
      var label, detail;
      if (line.kind === "donation") {
        label = line.label;
        detail = line.qty + " × " + dollars(line.price);
      } else {
        label = line.title;
        detail =
          line.time +
          " · " +
          (line.adults || 0) +
          " adult, " +
          (line.children || 0) +
          " child";
      }
      summaryEl.appendChild(summaryRow(label, detail, dollars(lineTotal(line))));
    });

    var totalRow = summaryRow("Order Total", "", dollars(Cart.total()));
    totalRow.className = "fare-row fare-total-row";
    totalRow.lastChild.className = "fare-total";
    var strong = document.createElement("strong");
    strong.textContent = "Order Total";
    totalRow.firstChild.textContent = "";
    totalRow.firstChild.appendChild(strong);
    summaryEl.appendChild(totalRow);
  }

  /* Every $100 tie in the cart gets its own dedication-name field */
  function tieCount(cart) {
    var line = cart["sponsor-tie"];
    return line && line.kind === "donation" ? line.qty || 0 : 0;
  }

  function renderTieFields(count) {
    tieSetEl.hidden = count === 0;
    tieFieldsEl.textContent = "";
    for (var i = 1; i <= count; i++) {
      var field = document.createElement("div");
      field.className = "form-field";

      var label = document.createElement("label");
      label.setAttribute("for", "tie-name-" + i);
      label.textContent =
        count === 1 ? "Name on Your Tie" : "Name on Tie No. " + i;
      field.appendChild(label);

      var input = document.createElement("input");
      input.type = "text";
      input.id = "tie-name-" + i;
      input.className = "tie-name";
      input.maxLength = MAX_LEN;
      input.autocomplete = "off";
      field.appendChild(input);

      var error = document.createElement("p");
      error.className = "field-error";
      error.hidden = true;
      field.appendChild(error);

      tieFieldsEl.appendChild(field);
    }
  }

  /* ---------- Validation ---------- */

  function setError(input, message) {
    var errorEl = input.parentElement.querySelector(".field-error");
    errorEl.textContent = message || "";
    errorEl.hidden = !message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  /* Check every field; returns the cleaned values or null. Cleaned
     text is written back into each input so the visitor sees exactly
     what the agent recorded. */
  function validate() {
    var firstBad = null;

    function check(input, message, extra) {
      var value = sanitize(input.value);
      input.value = value;
      var bad = value === "" ? message : extra ? extra(value) : "";
      setError(input, bad);
      if (bad && !firstBad) firstBad = input;
      return value;
    }

    var values = {
      name: check(form.elements.name, "The agent needs your name."),
      email: check(form.elements.email, "An email keeps your tickets from wandering.", function (v) {
        return EMAIL_RE.test(v) ? "" : "That doesn't look like an email address.";
      }),
      street: check(form.elements.street, "A street address, please."),
      city: check(form.elements.city, "Which town?"),
      state: check(form.elements.state, "Which state?"),
      zip: check(form.elements.zip, "ZIP code, please."),
      card: check(form.elements.card, "Any made-up card number will do."),
      exp: check(form.elements.exp, "Any made-up date will do."),
      cvv: check(form.elements.cvv, "Any made-up digits will do."),
      tieNames: [],
    };

    /* Tie dedications: none blank, no two alike */
    var seen = {};
    Array.prototype.forEach.call(
      tieFieldsEl.querySelectorAll(".tie-name"),
      function (input) {
        var value = check(input, "Every tie wants a name.");
        var lower = value.toLowerCase();
        if (value && seen[lower]) {
          setError(input, "Each tie needs its own name — this one's taken.");
          if (!firstBad) firstBad = input;
        }
        if (value) seen[lower] = true;
        values.tieNames.push(value);
      }
    );

    if (firstBad) {
      noticeEl.textContent = "A few blanks still need ink — see above.";
      firstBad.focus();
      return null;
    }
    noticeEl.textContent = "";
    return values;
  }

  /* ---------- The punch ---------- */

  function orderNumber() {
    return (
      "HCN-" +
      new Date().getFullYear() +
      "-" +
      String(Math.floor(Math.random() * 900000) + 100000)
    );
  }

  function complete(values) {
    document.getElementById("done-thanks").textContent =
      "Much obliged, " +
      values.name +
      "! Your order is punched and the whole crew tips their caps.";
    document.getElementById("done-order").textContent = orderNumber();
    document.getElementById("done-email").textContent =
      "Your tickets have been mailed to " + values.email + ".";

    var tiesEl = document.getElementById("done-ties");
    if (values.tieNames.length > 0) {
      tiesEl.hidden = false;
      tiesEl.textContent =
        "The track gang will letter your " +
        (values.tieNames.length === 1 ? "tie" : "ties") +
        ": " +
        values.tieNames.join(" · ");
    }

    Cart.clear();
    filledEl.hidden = true;
    doneEl.hidden = false;
    window.scrollTo(0, 0);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var values = validate();
    if (values) complete(values);
  });

  /* ---------- First draw ---------- */
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

  if (keys.length > 0) {
    renderSummary(cart, keys);
    renderTieFields(tieCount(cart));
  }

  Cart.updateBadge();
})();
