document.addEventListener("DOMContentLoaded", function () {
  var thumbs = document.querySelectorAll("#thumbs img");
  var mainImg = document.getElementById("mainProductImage");
  var qtyInput = document.getElementById("qtyInput");
  var unitText = document.getElementById("unitPriceText");
  var totalText = document.getElementById("totalPriceText");
  var orderBtn = document.getElementById("placeOrderBtn");
  var profileSelect = document.getElementById("profileSelect");

  // Helper: rebuild the thumbnails when switching variant
  function renderThumbnails(imgArray) {
    var thumbsContainer = document.getElementById("thumbs");
    thumbsContainer.innerHTML = "";
    imgArray.forEach(function (src, index) {
      var img = document.createElement("img");
      img.src = src;
      img.setAttribute("data-img", src);
      if (index === 0) img.classList.add("active");
      img.addEventListener("click", function () {
        mainImg.src = src;
        var all = thumbsContainer.querySelectorAll("img");
        all.forEach(function (t) {
          t.classList.remove("active");
        });
        img.classList.add("active");
      });
      thumbsContainer.appendChild(img);
    });
    mainImg.src = imgArray[0];
  }

  // Thumbnail click for static images (non-variant products)
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

  // Handle variant change for CueCube Grey (.353 / .418)
  if (profileSelect && window.cuecubeVariants) {
    profileSelect.addEventListener("change", function () {
      var val = profileSelect.value;
      var imgs = window.cuecubeVariants[val];
      if (imgs && imgs.length) {
        renderThumbnails(imgs);
      }
    });
  }

  // Quantity and price calculation
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
