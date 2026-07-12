/* Hollow Creek & Northern Railway — excursion product page
   Plain JavaScript, no dependencies. Reads ?excursion=<id> from the
   URL and fills in the handbill for that ride. */

(function () {
  "use strict";

  /* ---------- The season's excursions ---------- */
  var EXCURSIONS = {
    "dusty-gulch": {
      // no: "№ 01",
      title: "The Dusty Gulch Hold-Up",
      lede: "The valley's most polite outlaws board at the trestle to raid the cookie tin.",
      expect: [
        "Somewhere past milepost 3, the Dusty Gulch Gang comes thundering out of the treeline on horseback and boards the train — bandanas up, manners intact. They're after the conductor's famous cookie tin, and they'll charm every coach on the way to it.",
        "Before departure, every rider age 3 and up is sworn in as a deputy and issued an official tin star. Deputies help the sheriff track the gang through the train, and the whole affair is settled — peacefully, with cookies for all — before the run home.",
        "The hold-up is played for laughs, not frights: the outlaws are volunteers, the horses are old pros, and nobody loses anything but a cookie.",
      ],
      schedule: "May – September · Saturdays",
      // duration: "About 90 minutes, rain or shine",
      times: ["11:00 AM", "2:00 PM"],
      adultPrice: 18,
      childPrice: 12,
    },
    "lost-spike": {
      // no: "№ 02",
      title: "The Lost Spike Treasure Run",
      lede: "Legend says a gold spike is hidden along the line. Solve the map's riddles before milepost 7 and claim your prize.",
      expect: [
        "At boarding, the conductor hands every family a weathered treasure map of the line. Each landmark out the window — the water tower, the trestle, Miller's Bend — unlocks another riddle in the hunt for the Lost Spike of 1926.",
        "Crack the final riddle before the train reaches milepost 7 and your crew claims a prize from the depot's treasure chest. Stumped? The crew wanders the coaches dropping hints, and no map goes home unsolved.",
        "Bring a pencil and sharp eyes. The riddles are pitched so the kids do the solving and the grown-ups do the assisting.",
      ],
      schedule: "June – October · First Sundays",
      // duration: "About 90 minutes, rain or shine",
      times: ["1:00 PM"],
      adultPrice: 20,
      childPrice: 14,
    },
    "firefly-flyer": {
      // no: "№ 03",
      title: "The Firefly Flyer",
      lede: "An evening run to Miller's Bend, where the meadow glitters with fireflies.",
      expect: [
        "The Flyer eases out of the depot at dusk and rolls seven slow miles to Miller's Bend, where the train stops, the lanterns dim, and the meadow puts on its show — thousands of fireflies rising out of the tall grass.",
        "The crew pours cold lemonade in every coach and swaps stories from a century on the line while you watch. On a clear night the stars over the meadow are nearly as good as the fireflies.",
        "Evenings get cool in the valley, even in July — bring a light jacket. Lanterns are provided; jars, alas, must stay at home. The fireflies stay in the meadow.",
      ],
      schedule: "June – August · Friday evenings",
      // duration: "About 90 minutes, rain or shine",
      times: ["7:30 PM"],
      adultPrice: 16,
      childPrice: 10,
    },
    centennial: {
      // no: "№ 04",
      title: "The Centennial Steam Special",
      lede: "Old No. 9 turns one hundred! Brass band on the platform, cake in every coach, and a whistle salute at the trestle.",
      expect: [
        "One hundred years to the month after Old No. 9 rolled out of the works, she leads the Centennial Special down the same seven miles she's always run — with the Hollow Creek brass band seeing her off from Platform 1.",
        "There's birthday cake in every coach, commemorative tickets for every rider, and a three-blast whistle salute as she crosses the trestle — one blast for each generation of volunteers who kept her in steam.",
        "The engine crew opens the cab for visits at the depot after each run. Come early, stay late, and wish the old girl a happy hundredth.",
      ],
      schedule: "July 4 weekend",
      // duration: "About 90 minutes, rain or shine",
      times: ["9:00 AM", "1:00 PM", "4:00 PM"],
      adultPrice: 24,
      childPrice: 16,
    },
  };

  /* ---------- Look up the requested excursion ---------- */
  var params = new URLSearchParams(window.location.search);
  var id = params.get("excursion");
  var excursion = EXCURSIONS[id];

  if (!excursion) {
    /* Unknown or missing id — send the rider back to the depot */
    window.location.replace("index.html");
    return;
  }

  /* ---------- Fill in the handbill ---------- */
  document.title = excursion.title + " — Hollow Creek & Northern Railway";
  document.getElementById("product-no").textContent = excursion.no;
  document.getElementById("product-title").textContent = excursion.title;
  document.getElementById("product-lede").textContent = excursion.lede;
  document.getElementById("product-schedule").textContent = excursion.schedule;
  document.getElementById("product-duration").textContent = excursion.duration;

  var expectEl = document.getElementById("product-expect");
  excursion.expect.forEach(function (text) {
    var p = document.createElement("p");
    p.textContent = text;
    expectEl.appendChild(p);
  });

  /* ---------- Departure times ---------- */
  var timesEl = document.getElementById("departure-times");
  excursion.times.forEach(function (time) {
    var label = document.createElement("label");
    label.className = "departure-time";
    var input = document.createElement("input");
    input.type = "radio";
    input.name = "departure";
    input.value = time;
    var span = document.createElement("span");
    span.textContent = time;
    label.appendChild(input);
    label.appendChild(span);
    timesEl.appendChild(label);
  });

  document.getElementById("adult-price").textContent =
    "$" + excursion.adultPrice + " each";
  document.getElementById("child-price").textContent =
    "$" + excursion.childPrice + " each · ages 2–12";

  /* ---------- Fare math ---------- */
  var adultInput = document.getElementById("adult-qty");
  var childInput = document.getElementById("child-qty");
  var totalEl = document.getElementById("fare-total");

  function qty(input) {
    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < 0) n = 0;
    if (n > 20) n = 20;
    return n;
  }

  function updateTotal() {
    var total =
      qty(adultInput) * excursion.adultPrice +
      qty(childInput) * excursion.childPrice;
    totalEl.textContent = "$" + total;
  }

  adultInput.addEventListener("input", updateTotal);
  childInput.addEventListener("input", updateTotal);
  updateTotal();

  /* ---------- Quantity steppers ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll(".qty-btn"),
    function (btn) {
      btn.addEventListener("click", function () {
        var input = document.getElementById(btn.getAttribute("data-target"));
        var next = qty(input) + parseInt(btn.getAttribute("data-step"), 10);
        if (next < 0) next = 0;
        if (next > 20) next = 20;
        input.value = next;
        updateTotal();
      });
    },
  );

  /* ---------- Add to cart ---------- */
  var form = document.getElementById("fare-form");
  var noticeEl = document.getElementById("fare-notice");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var adults = qty(adultInput);
    var children = qty(childInput);
    var timeChoice = form.querySelector('input[name="departure"]:checked');

    if (!timeChoice) {
      noticeEl.textContent = "Pick a departure time first.";
      return;
    }

    if (adults + children === 0) {
      noticeEl.textContent = "Choose at least one ticket first.";
      return;
    }

    Cart.addTickets(
      id,
      excursion.title,
      timeChoice.value,
      adults,
      children,
      excursion.adultPrice,
      excursion.childPrice,
    );
    var added = adults + children;
    noticeEl.textContent =
      added +
      (added === 1 ? " ticket" : " tickets") +
      " for the " +
      timeChoice.value +
      " departure punched into your cart!";
    timeChoice.checked = false;
    adultInput.value = 0;
    childInput.value = 0;
    updateTotal();
  });

  /* ---------- Cart badge ---------- */
  Cart.updateBadge();
})();
