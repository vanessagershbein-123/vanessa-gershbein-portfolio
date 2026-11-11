// Guessing games on the site: hide the answer until the visitor picks.
// data-reveal quizzes have a single "show me" button and no right or wrong.
document.querySelectorAll('.quiz').forEach(function (quiz) {
  var result = quiz.querySelector('.quiz-result');
  var verdict = quiz.querySelector('.quiz-verdict');
  var buttons = quiz.querySelectorAll('button');
  var reveal = quiz.hasAttribute('data-reveal');
  var live = document.createElement('p');
  live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
  quiz.appendChild(live);
  result.hidden = true;
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var right = btn.dataset.pick === quiz.dataset.answer;
      verdict.textContent = reveal ? '' : (right ? 'You got it!' : 'Not this time.');
      buttons.forEach(function (b) {
        b.disabled = true;
        if (!reveal && b.dataset.pick === quiz.dataset.answer) b.classList.add('is-answer');
        if (!reveal && b === btn) b.classList.add('is-picked');
      });
      result.hidden = false;
      live.textContent = result.textContent.replace(/\s+/g, ' ').trim();
      result.setAttribute('tabindex', '-1'); result.focus({ preventScroll: true });
    });
  });
});
