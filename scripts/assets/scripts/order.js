// Order/Unjumble Activity
let orderScore = 0, orderTotal = 0;

function initOrder() {
  const c = document.getElementById('order-container');
  if (!c || !orderData.items.length) return;
  c.innerHTML = '';

  orderTotal = orderData.items.length;

  // Shuffle items for display
  const shuffled = [...orderData.items].map((item, idx) => ({ text: item, origIdx: idx }));
  shuffled.sort(() => Math.random() - 0.5);

  const div = document.createElement('div');
  div.className = 'order-items';
  div.innerHTML = shuffled.map((item, i) => `
    <div class="order-item" draggable="true" data-orig="${item.origIdx}">
      <span class="order-handle">☰</span>
      <span class="order-text">${item.text}</span>
    </div>
  `).join('');
  c.appendChild(div);

  const checkBtn = document.createElement('button');
  checkBtn.className = 'btn btn-outline';
  checkBtn.textContent = 'Check Order';
  checkBtn.onclick = checkOrder;
  c.appendChild(checkBtn);

  // Enable drag and drop
  initDragDrop();
}

function initDragDrop() {
  const items = document.querySelectorAll('.order-item');
  let dragItem = null;

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      dragItem = item;
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      dragItem = null;
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragItem || dragItem === item) return;
      const container = item.parentNode;
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        container.insertBefore(dragItem, item);
      } else {
        container.insertBefore(dragItem, item.nextSibling);
      }
    });
  });
}

function checkOrder() {
  const items = document.querySelectorAll('.order-item');
  const currentOrder = Array.from(items).map(item => parseInt(item.dataset.orig));

  // Check if order is correct (0, 1, 2, 3, ...)
  let correct = true;
  currentOrder.forEach((val, idx) => {
    const expectedIdx = orderData.correctOrder.length ? orderData.correctOrder[idx] : idx;
    if (val !== expectedIdx) correct = false;
  });

  items.forEach((item, idx) => {
    const expectedIdx = orderData.correctOrder.length ? orderData.correctOrder[idx] : idx;
    if (parseInt(item.dataset.orig) === expectedIdx) {
      item.classList.add('correct');
      item.classList.remove('wrong');
    } else {
      item.classList.add('wrong');
      item.classList.remove('correct');
    }
  });

  if (correct) {
    orderScore = orderTotal;
    document.getElementById('order-score').textContent = orderScore;
    document.getElementById('order-complete').classList.add('show');
  }
}

function resetOrder() {
  orderScore = 0;
  document.getElementById('order-score').textContent = '0';
  document.getElementById('order-complete')?.classList.remove('show');
  initOrder();
}
