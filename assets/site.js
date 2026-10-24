(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // mobile menu
  var mt = $('.menu-t'), mn = $('.mnav');
  if (mt && mn) mt.addEventListener('click', function () { var o = mn.hidden; mn.hidden = !o; mt.setAttribute('aria-expanded', String(o)); });

  // copy buttons
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy'), done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
      try { navigator.clipboard.writeText(v).then(done, function () { sel(b); }); } catch (e) { sel(b); }
    });
  });
  function sel(b) { var t = b.parentNode.querySelector('.v'); if (!t) return; var r = document.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  // ---------- Guard simulator (illustrative, sample data) ----------
  var con = $('#guard');
  if (con) {
    var CHECKS = ['Agent identity and scope', 'Mandate: action type', 'Counterparty', 'Value limit', 'Trust deed and consents', 'Behaviour pattern'];
    var A = {
      fees: { t: 'Pay custodian fees', a: 'S$12,400 · approved custodian', r: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok'], v: 'allow',
        why: 'Within the agent’s mandate: an approved counterparty, below the S$50,000 limit. Executed and recorded.', who: 'Payments agent · owner: Head of Operations', rule: 'M-2.1 payments ≤ S$50,000 to approved counterparties' },
      call: { t: 'Fund a capital call', a: 'S$180,000 · approved private equity fund', r: ['ok', 'ok', 'ok', 'warn', 'ok', 'ok'], v: 'hold',
        why: 'Exceeds the S$50,000 limit. Held and routed to the CFO for approval within a 4-hour window. Nothing moves until a named person decides.', who: 'Approver: Chief Financial Officer', rule: 'M-2.2 above S$50,000 requires CFO approval' },
      newcp: { t: 'Pay a new supplier', a: 'S$9,800 · counterparty not on file', r: ['ok', 'ok', 'warn', 'ok', 'ok', 'ok'], v: 'hold',
        why: 'The counterparty is not on the approved list. Held until onboarding and screening are complete and a person approves.', who: 'Approver: Compliance Officer', rule: 'M-3.1 new counterparties require screening and approval' },
      dist: { t: 'Distribute from Trust T-02', a: 'S$250,000 · beneficiary distribution', r: ['ok', 'ok', 'ok', 'warn', 'bad', 'ok'], v: 'block',
        why: 'Clause 7.1 of the trust deed requires the trustee’s written consent, and none is on record. Blocked. The trustee has been notified.', who: 'Notified: Trustee', rule: 'TD-7.1 distributions require trustee consent' },
      self: { t: 'Raise its own payment limit', a: 'Change mandate M-2.1 to S$500,000', r: ['bad', 'bad', 'ok', 'ok', 'ok', 'bad'], v: 'block',
        why: 'Agents cannot change their own mandate. Blocked, and flagged as anomalous behaviour for review. Mandates change only through approved governance.', who: 'Alert: Head of Operations and Risk', rule: 'G-1 mandates are changed by people, never by agents' }
    };
    var tally = { allow: 0, hold: 0, block: 0 }, seq = 1041, timers = [];
    var list = $('#checks', con), verdict = $('#verdict', con), rec = $('#record', con);
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function run(k) {
      timers.forEach(clearTimeout); timers = [];
      $$('.act', con).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); });
      var d = A[k];
      list.innerHTML = CHECKS.map(function (c) { return '<li class="wait"><span class="dot"></span><span>' + c + '</span><span class="st">…</span></li>'; }).join('');
      verdict.className = 'verdict'; verdict.hidden = true;
      var lis = $$('li', list), reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, step = reduce ? 0 : 170;
      lis.forEach(function (li, i) {
        timers.push(setTimeout(function () {
          var s = d.r[i]; li.className = s; $('.st', li).textContent = s === 'ok' ? 'pass' : s === 'warn' ? 'review' : 'fail';
        }, step * (i + 1)));
      });
      timers.push(setTimeout(function () {
        var V = { allow: 'ALLOWED', hold: 'HELD FOR APPROVAL', block: 'BLOCKED' }[d.v];
        verdict.className = 'verdict ' + d.v; verdict.hidden = false;
        verdict.innerHTML = '<span class="v">' + V + '</span><p>' + d.why + '</p>';
        tally[d.v]++; seq++;
        var now = new Date(), ts = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + '+08:00';
        rec.innerHTML = '<b>decision</b>   HMQ-DR-' + seq + '\n<b>time</b>       ' + ts + '\n<b>action</b>     ' + d.t + ' · ' + d.a + '\n<b>rule</b>       ' + d.rule + '\n<b>outcome</b>    ' + d.v.toUpperCase() + '\n<b>accountable</b> ' + d.who + '\n<b>record</b>     sealed · linked to HMQ-DR-' + (seq - 1);
        $('#t-a', con).textContent = tally.allow; $('#t-h', con).textContent = tally.hold; $('#t-k', con).textContent = tally.block;
      }, step * (CHECKS.length + 1)));
    }
    $$('.act', con).forEach(function (b) { b.addEventListener('click', function () { run(b.dataset.k); }); });
    run('call');
  }

  // ---------- briefing form ----------
  var f = $('#brief');
  if (f) f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var g = function (n) { return (f.elements[n].value || '').trim(); }, m = $('.msg', f);
    if (!g('name') || !g('org') || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('email'))) { m.textContent = 'Please add your name, organisation and a valid email address.'; return; }
    var body = 'Name: ' + g('name') + '\nOrganisation: ' + g('org') + '\nRole: ' + g('role') + '\nEmail: ' + g('email') + '\nInterest: ' + g('interest') + '\n\n' + g('note');
    m.textContent = 'Your email app should open with this request. If it does not, copy the address below and send it directly.';
    location.href = 'mailto:' + f.dataset.to + '?subject=' + encodeURIComponent('Briefing request: ' + g('org')) + '&body=' + encodeURIComponent(body);
  });
})();
