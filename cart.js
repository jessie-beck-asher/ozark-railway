/* Hollow Creek & Northern Railway — shared cart storage
   Plain JavaScript, no dependencies. The cart lives in localStorage
   keyed by line item. Each line carries everything the cart page
   needs to list it and total it — no catalog lookups required.

   Ticket lines, keyed by excursion and departure:
   { "dusty-gulch @ 11:00 AM": { kind: "tickets", excursion: "dusty-gulch",
     title: "The Dusty Gulch Hold-Up", time: "11:00 AM",
     adults: n, children: n, adultPrice: 18, childPrice: 12 }, ... }

   Donation lines, keyed by donation id:
   { "sponsor-spike": { kind: "donation", id: "sponsor-spike",
     label: "Spike Sponsorship", price: 25, qty: n }, ... } */

var Cart = (function () {
  "use strict";

  var KEY = "ozark-cart";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function write(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) {
      /* private browsing or full storage — the cart just won't persist */
    }
  }

  /* Items in one cart line, whatever its kind */
  function lineCount(line) {
    if (line.kind === "donation") return line.qty || 0;
    return (line.adults || 0) + (line.children || 0);
  }

  /* Dollar total of one cart line */
  function lineTotal(line) {
    if (line.kind === "donation") return (line.qty || 0) * (line.price || 0);
    return (
      (line.adults || 0) * (line.adultPrice || 0) +
      (line.children || 0) * (line.childPrice || 0)
    );
  }

  /* Total items across every line in the cart */
  function count() {
    var cart = read();
    var total = 0;
    Object.keys(cart).forEach(function (key) {
      total += lineCount(cart[key]);
    });
    return total;
  }

  /* Dollar total across every line in the cart */
  function total() {
    var cart = read();
    var sum = 0;
    Object.keys(cart).forEach(function (key) {
      sum += lineTotal(cart[key]);
    });
    return sum;
  }

  /* Add tickets for one excursion departure, merging with any
     already in the cart for that same departure */
  function addTickets(id, title, time, adults, children, adultPrice, childPrice) {
    var cart = read();
    var key = time ? id + " @ " + time : id;
    var line = cart[key] || {
      kind: "tickets",
      excursion: id,
      title: title,
      time: time,
      adults: 0,
      children: 0,
      adultPrice: adultPrice,
      childPrice: childPrice,
    };
    line.adults += adults;
    line.children += children;
    cart[key] = line;
    write(cart);
    updateBadge();
  }

  /* Add one donation (spike or tie sponsorship), merging with any
     already in the cart for that same option */
  function addDonation(id, label, price) {
    var cart = read();
    var line = cart[id] || {
      kind: "donation",
      id: id,
      label: label,
      price: price,
      qty: 0,
    };
    line.qty += 1;
    cart[id] = line;
    write(cart);
    updateBadge();
  }

  /* Drop one line from the cart entirely */
  function removeLine(key) {
    var cart = read();
    delete cart[key];
    write(cart);
    updateBadge();
  }

  /* Set the ticket counts on an existing line; dropping both to
     zero removes the line */
  function setTicketCounts(key, adults, children) {
    var cart = read();
    var line = cart[key];
    if (!line || line.kind !== "tickets") return;
    if (adults + children === 0) {
      delete cart[key];
    } else {
      line.adults = adults;
      line.children = children;
    }
    write(cart);
    updateBadge();
  }

  /* Empty the cart entirely — the checkout page calls this once an
     order is punched */
  function clear() {
    write({});
    updateBadge();
  }

  /* Sync the floating cart icon with whatever is in storage */
  function updateBadge() {
    var cartBtn = document.getElementById("cart");
    var cartCountEl = document.getElementById("cart-count");
    if (!cartBtn || !cartCountEl) return;
    /* The icon doubles as the door to the cart page */
    if (!cartBtn.dataset.cartBound) {
      cartBtn.dataset.cartBound = "true";
      cartBtn.addEventListener("click", function () {
        window.location.href = "cart.html";
      });
    }
    var total = count();
    cartCountEl.textContent = total;
    cartCountEl.hidden = total === 0;
    cartBtn.setAttribute(
      "aria-label",
      total === 0
        ? "Shopping cart, empty"
        : "Shopping cart, " + total + (total === 1 ? " item" : " items")
    );
  }

  return {
    read: read,
    count: count,
    total: total,
    addTickets: addTickets,
    addDonation: addDonation,
    removeLine: removeLine,
    setTicketCounts: setTicketCounts,
    clear: clear,
    updateBadge: updateBadge,
  };
})();
