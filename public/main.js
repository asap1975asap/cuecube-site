// handle gallery and price on product detail
document.addEventListener("DOMContentLoaded", function () {
  var mainImage = document.getElementById("mainImage");
  var thumbs = document.querySelectorAll(".thumb");
  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      var src = t.getAttribute("data-full");
      if (mainImage && src) {
        mainImage.src = src;
      }
      thumbs.forEach(function (x) {
        x.classList.remove("active-thumb");
      });
      t.classList.add("active-thumb");
    });
  });

  var qtyInput = document.getElementById("qtyInput");
  var unitLine = document.getElementById("unitPriceLine");
  var totalLine = document.getElementById("totalPriceLine");
  var orderBtn = document.getElementById("orderButton");
  var diameterSelect = document.getElementById("diameterSelect");

  function recalc() {
    if (!qtyInput) return;
    var qty = parseInt(qtyInput.value || "10", 10);
    if (qty < 10) qty = 10;
    qtyInput.value = qty;

    // default base price 15
    var base = 15.0;
    var unit = base;
    if (qty >= 100) {
      unit = parseFloat((base * 0.72).toFixed(2));
    } else if (qty >= 50) {
      unit = parseFloat((base * 0.85).toFixed(2));
    }
    var total = parseFloat((unit * qty).toFixed(2));

    if (unitLine) unitLine.textContent = "Unit price: $" + unit.toFixed(2);
    if (totalLine) totalLine.textContent = "Total: $" + total.toFixed(2);

    if (orderBtn) {
      var productId = window.location.pathname.split("/").pop();
      var diameter = diameterSelect ? diameterSelect.value : "";
      orderBtn.href =
        "/order?productId=" +
        productId +
        "&qty=" +
        qty +
        "&diameter=" +
        encodeURIComponent(diameter);
    }
  }

  if (qtyInput) {
    qtyInput.addEventListener("input", recalc);
  }
  if (diameterSelect) {
    diameterSelect.addEventListener("change", function () {
      // when diameter changes we should also change thumbs shown
      // but for now we just update order link
      recalc();
    });
  }

  recalc();
});
