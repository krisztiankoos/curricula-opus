// Fill-in Activity
let fillScore = 0, fillAns = 0;

function initFill() {
  const c = document.getElementById('fill-container');
  if (!c || !fillData.items.length) return;
  c.innerHTML = '';

  fillData.items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'fill-question';
    div.innerHTML = `
      <h4>Q${i + 1}: ${item.prompt || item.sentence || ''}</h4>
      <input type="text" class="fill-input" data-idx="${i}" data-answer="${item.answer || ''}" placeholder="Type your answer...">
      <button class="btn btn-outline btn-sm fill-check" data-idx="${i}">Check</button>
      <div class="fill-feedback" id="fill-fb-${i}"></div>
    `;
    c.appendChild(div);
  });

  document.querySelectorAll('.fill-check').forEach(b => b.addEventListener('click', handleFill));
  document.querySelectorAll('.fill-input').forEach(i => i.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleFill({ target: e.target.nextElementSibling });
  }));
}

function handleFill(e) {
  const idx = e.target.dataset.idx;
  const q = e.target.closest('.fill-question');
  if (q.classList.contains('answered')) return;

  const input = q.querySelector('.fill-input');
  const userAnswer = input.value.trim().toLowerCase();
  const correctAnswer = input.dataset.answer.toLowerCase();
  const fb = document.getElementById('fill-fb-' + idx);

  q.classList.add('answered');

  if (userAnswer === correctAnswer) {
    input.classList.add('correct');
    fb.innerHTML = '<span class="correct-text">Correct!</span>';
    fillScore++;
  } else {
    input.classList.add('wrong');
    fb.innerHTML = `<span class="wrong-text">Answer: ${input.dataset.answer}</span>`;
  }

  document.getElementById('fill-score').textContent = fillScore;
  fillAns++;
  if (fillAns === fillData.items.length) document.getElementById('fill-complete').classList.add('show');
}

function resetFill() {
  fillScore = 0;
  fillAns = 0;
  document.getElementById('fill-score').textContent = '0';
  document.getElementById('fill-complete')?.classList.remove('show');
  initFill();
}
