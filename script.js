/* Hollow Creek & Northern Railway — page behavior
   Plain JavaScript, no dependencies. */

(function () {
  "use strict";

  /* ---------- Mobile navigation menu ---------- */
  var navline = document.querySelector(".navline");
  var navToggle = document.querySelector(".nav-toggle");
  navToggle.addEventListener("click", function () {
    var open = navline.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  /* Close the menu once a destination is chosen */
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      navline.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Punch the tickets ---------- */
  document.querySelectorAll(".ticket").forEach(function (ticket) {
    function punch() { ticket.classList.toggle("punched"); }
    ticket.addEventListener("click", punch);
    ticket.addEventListener("keydown", function (e) {
      if (e.target !== ticket) return; /* let the Book Now button keep its keys */
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); punch(); }
    });
  });

  /* ---------- Miner's cart ---------- */
  /* Book Now links lead to the excursion's product page; keep the click
     from also punching the ticket on the way out. */
  document.querySelectorAll(".ticket .book-now").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });
  /* Show whatever is already in the localStorage cart */
  Cart.updateBadge();

  /* ---------- Easter egg: click the roundel for a whistle ----------
     Two detuned oscillators approximate a classic two-chime steam whistle. */
  var brand = document.getElementById("brand");
  var audioCtx = null;
  if (brand) brand.addEventListener("click", function () {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var now = audioCtx.currentTime;
      [311.1, 370.0, 466.2].forEach(function (freq) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.06);
        gain.gain.setValueAtTime(0.08, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch (e) { /* no audio support — the whistle stays polished but silent */ }
  });
})();
