// Print buttons, wired up without inline handlers so they work under a strict
// Content-Security-Policy (script-src 'self'). Any element with the
// data-print-trigger attribute opens the browser's print dialog.
document.addEventListener('click', function (event) {
  var target = event.target;
  if (target && target.closest && target.closest('[data-print-trigger]')) {
    window.print();
  }
});
