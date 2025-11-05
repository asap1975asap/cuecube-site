document.addEventListener("DOMContentLoaded", function () {
  var thumbs = document.querySelectorAll("#thumbs img");
  var mainImg = document.getElementById("mainProductImage");

  if (thumbs && mainImg) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = this.getAttribute("data-img");
        mainImg.setAttribute("src", src);

        thumbs.forEach(function (t) {
          t.classList.remove("active");
        });
        this.classList.add("active");
      });
    });
  }

  var qtyInput = document.getElementById("qtyInput");
  var unitText = document.getElementById("unitPriceText");
  var totalText = document.getElementById("totalPriceText");
  var orderBtn = document.getElementById("placeOrderBtn");

  if (qtyInput && window.cuecubeProduct) {
    qtyInput.addEventListener("input", function () {
      var q = parseInt(qtyInput.value, 10);
      if (isNaN(q) || q < 10) q = 10;
      qtyInput.value = q;

      var price = window.cuecubeProduct.price10;
      if (q >= 100) price = window.cuecubeProduct.price100;
      else if (q >= 50) price = window.cuecubeProduct.price50;

      var total = (price * q).toFixed(2);

      unitText.textContent = "Unit price: $" + price.toFixed(2);
      totalText.textContent = "Total: $" + total;

      if (orderBtn) {
        orderBtn.setAttribute(
          "href",
          "/order?productId=" + window.cuecubeProduct.id + "&qty=" + q
        );
      }
    });
  }
});
