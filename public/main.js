// image preview change
document.addEventListener('click', function (e) {
  if (e.target.matches('.gallery-thumbs .thumb')) {
    const src = e.target.getAttribute('data-src');
    const main = document.getElementById('mainImage');
    if (main && src) {
      main.src = src;
    }
    document.querySelectorAll('.gallery-thumbs .thumb').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }
});

// tip profile change -> reload thumbs and update order link
document.addEventListener('change', function (e) {
  if (e.target.id === 'tipSelect') {
    const productId = e.target.getAttribute('data-product-id');
    const selected = e.target.value;

    fetch(`/products/${productId}?json=1&tip=${encodeURIComponent(selected)}`)
      .then(r => r.json())
      .then(data => {
        const main = document.getElementById('mainImage');
        const thumbs = document.getElementById('thumbContainer');
        if (main && data.images && data.images.length) {
          main.src = data.images[0];
        }
        if (thumbs) {
          thumbs.innerHTML = '';
          data.images.forEach((img, idx) => {
            const im = document.createElement('img');
            im.src = img;
            im.dataset.src = img;
            im.className = 'thumb' + (idx === 0 ? ' active' : '');
            thumbs.appendChild(im);
          });
        }
        const qtyInput = document.getElementById('qtyInput');
        const qty = qtyInput ? parseInt(qtyInput.value, 10) : 10;
        const placeBtn = document.getElementById('placeOrderBtn');
        if (placeBtn) {
          placeBtn.href = `/order?productId=${productId}&qty=${qty}&diameter=${encodeURIComponent(selected)}`;
        }
      })
      .catch(() => {});
  }
});

// qty change -> recalc total (we recalc on client, but real price is server-side)
document.addEventListener('input', function (e) {
  if (e.target.id === 'qtyInput') {
    let qty = parseInt(e.target.value, 10);
    if (isNaN(qty) || qty < 10) qty = 10;
    e.target.value = qty;

    const unitSpan = document.getElementById('unitPrice');
    const totalSpan = document.getElementById('totalPrice');
    const tipSelect = document.getElementById('tipSelect');
    const placeBtn = document.getElementById('placeOrderBtn');

    // we cannot perfectly recalc tier on client without knowing base price, so we simply update total if unit is shown
    if (unitSpan && totalSpan) {
      const unit = parseFloat(unitSpan.textContent);
      const total = (unit * qty).toFixed(2);
      totalSpan.textContent = total;
    }

    if (placeBtn && tipSelect) {
      const productId = tipSelect.getAttribute('data-product-id');
      placeBtn.href = `/order?productId=${productId}&qty=${qty}&diameter=${encodeURIComponent(tipSelect.value)}`;
    }
  }
});
