document.addEventListener('DOMContentLoaded', () => {
  // thumbnails on product list
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const mainImg = card.querySelector('.product-image-main');
    const thumbs = card.querySelectorAll('.product-thumb');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-full');
        if (src) mainImg.src = src;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  });

  // product detail thumbnail + price calc
  const detail = document.querySelector('.product-detail');
  if (detail) {
    const mainImg = detail.querySelector('.product-image-main');
    const thumbs = detail.querySelectorAll('.product-thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-full');
        if (src) mainImg.src = src;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // price calc
    const qtyInput = document.getElementById('orderQty');
    const unitPriceEl = document.getElementById('unitPrice');
    const totalPriceEl = document.getElementById('totalPrice');
    const hiddenQty = document.getElementById('orderQtyHidden');

    const price10 = parseFloat(detail.dataset.price10);
    const price50 = parseFloat(detail.dataset.price50);
    const price100 = parseFloat(detail.dataset.price100);
    const minQty = parseInt(qtyInput.min, 10) || 10;

    function recalc() {
      let qty = parseInt(qtyInput.value, 10);
      if (isNaN(qty) || qty < minQty) qty = minQty;
      qtyInput.value = qty;
      if (hiddenQty) hiddenQty.value = qty;

      let unit = price10;
      if (qty >= 100) unit = price100;
      else if (qty >= 50) unit = price50;

      const total = (unit * qty).toFixed(2);
      unitPriceEl.textContent = `$${unit.toFixed(2)}`;
      totalPriceEl.textContent = `$${total}`;
    }

    qtyInput.addEventListener('input', recalc);
    recalc();
  }
});
