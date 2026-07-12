/* Hollow Creek & Northern Railway — Sponsor a Spike page
   Plain JavaScript, no dependencies. Two sponsorship options; each
   Add to Cart punches one of the chosen option into the shared cart.
   Name and mailing address are gathered at checkout. */

(function () {
  "use strict";

  var OPTIONS = {
    spike: { price: 25, noun: "spike", label: "Spike Sponsorship" },
    tie: { price: 100, noun: "tie", label: "Tie Sponsorship" },
  };

  var form = document.getElementById("spike-form");
  var noticeEl = document.getElementById("spike-notice");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var choice = form.querySelector('input[name="donation"]:checked');

    if (!choice || !OPTIONS[choice.value]) {
      noticeEl.textContent = "Pick a spike or a tie first.";
      return;
    }

    var option = OPTIONS[choice.value];
    Cart.addDonation("sponsor-" + choice.value, option.label, option.price);
    noticeEl.textContent =
      "One $" +
      option.price +
      " " +
      option.noun +
      " sponsorship punched into your cart!";
  });

  /* ---------- Cart badge ---------- */
  Cart.updateBadge();
})();
