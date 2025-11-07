document.addEventListener('DOMContentLoaded', function () {
  const diameterSelect = document.getElementById('diameterSelect');
  const diameterInput = document.getElementById('diameterInput');
  const mainImage = document.getElementById('mainImage');
  const thumbStrip = document.getElementById('thumbStrip');

  function activateThumb(imgEl) {
    if (!thumbStrip) return;
    const allThumbs = thumbStrip.querySelectorAll('.thumb-img');
    allThumbs.forEach(function (t) {
      t.classList.remove('is-active');
    });
    imgEl.classList.add('is-active');
    const full = imgEl.getAttribute('data-full');
    if (full && mainImage) {
      mainImage.src = full;
    }
  }

  if (thumbStrip) {
    thumbStrip.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('thumb-img')) {
        activateThumb(evt.target);
      }
    });
  }

  function rebuildThumbs(images) {
    if (!thumbStrip) return;
    thumbStrip.innerHTML = '';
    images.forEach(function (src, index) {
      const img = document.createElement('img');
      img.src = src;
      img.setAttribute('data-full', src);
      img.className = 'thumb-img' + (index === 0 ? ' is-active' : '');
      thumbStrip.appendChild(img);
    });
    if (images.length > 0 && mainImage) {
      mainImage.src = images[0];
    }
  }

  if (diameterSelect) {
    diameterSelect.addEventListener('change', function () {
      const selected = diameterSelect.options[diameterSelect.selectedIndex];
      const imagesAttr = selected.getAttribute('data-images') || '';
      const images = imagesAttr.split(',').filter(function (x) {
        return x;
      });

      if (diameterInput) {
        diameterInput.value = selected.value;
      }

      rebuildThumbs(images);
    });
  }
});
