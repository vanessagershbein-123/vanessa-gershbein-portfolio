"""Builds Vanessa's multi-page site (v3: bolder look, playful copy). Shared header and contact block on every page."""
from pathlib import Path

OUT = Path(__file__).resolve().parent / "site"

def page(filename, title, current, body, home=False, back=("index.html", "Back home"), landing=False):
    nav_about = ' aria-current="page"' if current == "about" else ""
    nav_home = ' aria-current="page"' if home or landing else ""
    crumb = "" if home or landing else f'<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>' + ("" if back[0] == "index.html" else f'<span>/</span><a href="{back[0]}">{back[1].replace("Back to ", "")}</a>') + '</nav>\n'
    no_bubbles = filename not in ("career.html",)  # floating bubbles only on Career (About has the bubble mind; home has its bubble field)
    bubble = "" if no_bubbles else '<div class="page-bubbles" aria-label="Floating bubbles">' + ''.join(f'<button class="page-bubble b{i}" type="button" aria-label="Pop a bubble"></button>' for i in range(1, 8)) + '</div>\n'
    bubble_js = "" if home else '<script src="bubble.js" defer></script>\n'  # still loaded for the back-home pop
    body = crumb + bubble + body
    foot_link = "" if home or landing else f'<a href="{back[0]}">← {back[1]}</a>'
    body_class = ' class="home site"' if home else (' class="inner site landing"' if landing else ' class="inner site"')
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="Vanessa Gershbein: marketer, customer-insights nerd, and MBA candidate at UT Austin McCombs.">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="Six years figuring out why people choose what they choose. Now an MBA candidate at UT Austin McCombs.">
<meta property="og:image" content="https://vanessagershbein.netlify.app/images/og-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="images/logo-vg.png">
<link rel="apple-touch-icon" href="images/logo-vg.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Work+Sans:wght@400;600;700&family=Caveat:wght@600&family=Mrs+Saint+Delafield&display=swap">
<link rel="stylesheet" href="styles.css">
</head>
<body{body_class}>
<div>
<div class="wrap">
<header class="site-head">
  <a class="brand" href="index.html"><span class="avatar logo"><img src="images/logo-vg.png" alt="" width="96" height="96"></span>Vanessa Gershbein</a>
  <nav aria-label="Main"><a href="index.html"{nav_home}>Home</a><a href="about.html"{nav_about}>About me</a><div class="explore-menu"><button type="button" class="explore-btn" aria-expanded="false" aria-controls="explore-list">Explore <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><ul class="explore-list" id="explore-list" hidden><li><a href="work.html">Selected Work</a></li><li><a href="career.html">My Career</a></li><li><a href="mba.html">At McCombs</a></li><li><a href="made.html">What I've Made</a></li><li><a href="photography.html">Photography</a></li><li><a href="projects.html">Projects &amp; Builds</a></li></ul></div><a href="#contact">Say hello</a></nav>
</header>
{body}
<section class="talk" id="contact">
  <p class="hand">psst, I love a good coffee chat</p>
  <div class="talk-info">
  <h2><span class="sig">Pick my brain</span> over coffee. Or a breakfast taco.</h2>
  <div class="rows">
    <div class="row"><span class="label">Email</span><span class="addr" id="email">vanessa.gershbein@my.utexas.edu</span><button class="copy" type="button" data-copy="email">Copy</button></div>
    <div class="row"><span class="label">LinkedIn</span><a class="addr" href="https://www.linkedin.com/in/vanessa-gershbein/" target="_blank" rel="noopener">linkedin.com/in/vanessa-gershbein ↗</a></div>
    <div class="row"><span class="label">Based in</span><span>Austin, Texas</span></div>
  </div>
  </div>
  <form class="talk-form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="contact">
    <input type="hidden" name="page" value="{filename}">
    <p class="hp" hidden><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <label class="f"><span>Name</span><input name="name" autocomplete="name" required></label>
    <label class="f"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>
    <label class="f"><span>What's on your mind?</span><textarea name="message" rows="4" required></textarea></label>
    <button type="submit" class="send">Send it</button>
    <p class="form-status" role="status" aria-live="polite"></p>
  </form>
</section>
<footer class="site-foot"><span>© 2026 Vanessa Gershbein</span>{foot_link}</footer>
</div>
</div>
<script>
document.querySelectorAll('.copy').forEach(function (btn) {{
  btn.addEventListener('click', function () {{
    var el = document.getElementById(btn.dataset.copy);
    var done = function () {{ btn.textContent = 'Copied!'; setTimeout(function () {{ btn.textContent = 'Copy'; }}, 1500); }};
    var fallback = function () {{ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }};
    if (navigator.clipboard && navigator.clipboard.writeText) {{ navigator.clipboard.writeText(el.textContent.trim()).then(done, fallback); }} else {{ fallback(); }}
  }});
}});
// Explore menu in the header
document.querySelectorAll('.explore-menu').forEach(function (m) {{
  var btn = m.querySelector('.explore-btn'), list = m.querySelector('.explore-list');
  function set(open) {{ btn.setAttribute('aria-expanded', open); list.hidden = !open; m.classList.toggle('open', open); }}
  btn.addEventListener('click', function (e) {{ e.stopPropagation(); set(list.hidden); }});
  document.addEventListener('click', function (e) {{ if (!m.contains(e.target)) set(false); }});
  document.addEventListener('keydown', function (e) {{ if (e.key === 'Escape') {{ set(false); btn.focus(); }} }});
}});
// contact form: send to Netlify without leaving the page
document.querySelectorAll('.talk-form').forEach(function (form) {{
  var status = form.querySelector('.form-status'), btn = form.querySelector('.send');
  form.addEventListener('submit', function (e) {{
    e.preventDefault();
    btn.disabled = true; status.textContent = 'Sending...';
    fetch('/', {{ method: 'POST', headers: {{ 'Content-Type': 'application/x-www-form-urlencoded' }}, body: new URLSearchParams(new FormData(form)).toString() }})
      .then(function (r) {{ if (!r.ok) throw new Error(r.status); form.reset(); form.classList.add('sent'); status.textContent = 'Thanks! Your note is on its way to my inbox.'; }})
      .catch(function () {{ status.textContent = "Hmm, that didn't send. You can email me at vanessa.gershbein@my.utexas.edu."; }})
      .then(function () {{ btn.disabled = false; }});
  }});
}});
</script>
{bubble_js}</body>
</html>
"""
    (OUT / filename).write_text(html, encoding="utf-8")

# ---------- HOME ----------
page("index.html", "Vanessa Gershbein", "home", landing=True, body="""
<section class="lp-hero">
  <div class="lp-copy">
    <h1>Six years figuring out <span class="hl">why people choose what they choose.</span></h1>
    <p class="lp-lede">I'm Vanessa, an MBA candidate at UT Austin McCombs (Class of 2028). I spent six years in customer insights at TapResearch, Kantar, and Swayable, and I'm looking for a marketing role for summer 2027.</p>
    <div class="lp-actions">
      <a class="lp-btn" href="about.html">Step inside my head <span aria-hidden="true">→</span></a>
    </div>
  </div>
  <div class="lp-field" aria-label="Soap bubbles you can pop">
    <button type="button" class="lp-float f1" aria-label="Pop a bubble"></button>
    <button type="button" class="lp-float f2" aria-label="Pop a bubble"></button>
    <button type="button" class="lp-float f3" aria-label="Pop a bubble"></button>
    <button type="button" class="lp-float f4" aria-label="Pop a bubble"></button>
    <button type="button" class="lp-float f5" aria-label="Pop a bubble"></button>
    <p class="lp-hint" aria-hidden="true">go ahead, pop one</p>
  </div>
</section>

<section class="lp-logos" aria-label="Where I've worked and studied">
  <p>Where I've worked and studied</p>
  <div>
    <img src="images/logo-tapresearch.png" alt="TapResearch">
    <img src="images/logo-kantar.png" alt="Kantar">
    <img src="images/logo-swayable.png" alt="Swayable">
    <img src="images/logo-ut-seal.png" alt="UT Austin">
    <img src="images/logo-northeastern.png" alt="Northeastern University">
  </div>
</section>

<section class="lp-proof" aria-label="The short version">
  <p><span><b>6+</b> years in market research</span><span class="lp-tip-wrap"><b>100+</b> <button type="button" class="lp-tip" aria-describedby="brands-tip">brands advised</button><span class="lp-tip-box" id="brands-tip" role="tooltip">Across 60+ clients, from tech and CPG to retail, financial services, entertainment, and advocacy campaigns.</span></span><span><b>650+</b> studies</span><span class="lp-tip-wrap"><b>1 of 47</b> <button type="button" class="lp-tip" aria-describedby="gs-tip">Goldstar Achievers</button><span class="lp-tip-box" id="gs-tip" role="tooltip">Kantar's annual program for emerging talent. 47 people were chosen worldwide from 500+ applicants for leadership challenges, events with regional leadership, and one-on-one mentoring from a senior leader.</span></span></p>
</section>

<nav class="lp-index" aria-label="Explore">
  <a href="work.html"><span class="lp-i-title">Selected Work</span><span class="lp-i-desc">The projects I still bring up at dinner.</span><span class="lp-i-go" aria-hidden="true">→</span></a>
  <a href="career.html"><span class="lp-i-title">My Career</span><span class="lp-i-desc">Three companies, six years, a lot of survey data. The resume, with more personality.</span><span class="lp-i-go" aria-hidden="true">→</span></a>
  <a href="mba.html"><span class="lp-i-title">At McCombs</span><span class="lp-i-desc">What I'm learning, working on, and joining as a first-year MBA.</span><span class="lp-i-go" aria-hidden="true">→</span></a>
  <a href="made.html"><span class="lp-i-title">What I've Made</span><span class="lp-i-desc">Film photography, creative side projects, and things I've built.</span><span class="lp-i-go" aria-hidden="true">→</span></a>
</nav>
<script src="landing.js" defer></script>
""")

# ---------- ABOUT ----------
page("about.html", "About Vanessa", "about", body="""
<div class="home about-mind">
<section class="mind" aria-labelledby="hi-h">
  <p class="hero-line"><span class="invite">Step inside my head. Pop a thought.</span></p>
  <div class="mind-stage">
    <h1 id="hi-h" class="giant-name"><span class="sig">hi, I'm</span><span class="word">vanessa</span><svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.9 6.3 5.7 11.1 12 12-6.3.9-11.1 5.7-12 12-.9-6.3-5.7-11.1-12-12C6.3 11.1 11.1 6.3 12 0Z"/></svg></h1>
    <img class="me" src="images/face/face-5.jpg" alt="Vanessa Gershbein smiling, wearing a dark green blazer" width="404" height="404">
    <a class="thought t1" href="career.html" style="--c:var(--sun)"><span class="puff p1" aria-hidden="true"></span><span class="puff p2" aria-hidden="true"></span><span class="t-title">My Career</span></a>
    <a class="thought t2" href="work.html" style="--c:var(--cobalt)"><span class="puff p1" aria-hidden="true"></span><span class="puff p2" aria-hidden="true"></span><span class="t-title">Selected Work</span></a>
    <a class="thought t3" href="made.html" style="--c:var(--tomato)"><span class="puff p1" aria-hidden="true"></span><span class="puff p2" aria-hidden="true"></span><span class="t-title">What I've Made</span></a>
    <a class="thought t4" href="mba.html" style="--c:var(--pink)"><span class="puff p1" aria-hidden="true"></span><span class="puff p2" aria-hidden="true"></span><span class="t-title">At McCombs</span></a>
  </div>
</section>
</div>

<section class="page-title calm">
  <h1>West Coast raised, East Coast trained, <span class="hl">now figuring out Texas.</span></h1>
</section>

<section class="about-quiet">
  <div class="route" aria-label="Places I've lived">
    <span>San Francisco</span><span>Boston</span><span>New York</span><span>Austin <em>now</em></span>
  </div>
</section>

<section class="about-section">
  <h2>The short version of my story</h2>
  <div class="prose">
    <p>I studied Communication Studies at Northeastern, with a minor in Environmental Studies and Sustainable Business Practices.</p>
    <p>Then I spent six years as the person brands called when they needed to understand their customers: first at TapResearch, then Kantar, then Swayable. Two startups and one global consulting firm. The startups taught me to build from scratch and move fast. Kantar taught me rigor, and how to turn complex data into recommendations senior leaders could act on. Either way, I handed marketing leaders the insight, and they decided what to do with it.</p>
    <p>At some point I realized I wanted to be the one making the call. So now I'm at McCombs as a Hildebrand Scholar, Forté Fellow, MIINT Fellow, and Marketing Fellow, getting ready to do exactly that.</p>
  </div>
</section>

<section class="about-section">
  <h2>A few things I love</h2>
  <ul class="loves">
    <li style="--c:var(--mint)"><strong>Backpacking</strong>Two summers as a counselor in Yosemite, and I've been chasing trails and road trips ever since.</li>
    <li style="--c:var(--pink)"><strong>Rollerskating</strong>The one place I happily look a little silly. Highly recommend!</li>
    <li style="--c:var(--paper)"><strong>Film photography</strong><span>More on that in <a href="made.html">What I've Made</a>.</span></li>
  </ul>
</section>
<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js" defer></script>
<script src="mind.js" defer></script>
""")

# ---------- CAREER ----------
page("career.html", "Vanessa's Career", "career", body="""
<section class="page-title">
  <h1>Six years of <span class="hl">asking people why.</span></h1>
  <p>Newest first.</p>
</section>
<div class="stack timeline">
  <article class="entry" style="--c:var(--tomato)">
    <div class="logo has-img"><img src="images/logo-ut-seal.png" alt="University of Texas at Austin seal"></div>
    <div>
      <span class="when">2026 – 2028</span>
      <h2>MBA</h2>
      <p class="where">UT Austin McCombs School of Business · Austin, TX</p>
      <ul>
        <li>Hildebrand Scholar (full-tuition merit scholarship) and Forté Fellow.</li>
        <li>Tech Club, Graduate Marketing Network, Graduate Women in Business, and Graduate Consulting Group.</li>
        <li><a href="https://www.turnermiint.org/" target="_blank" rel="noopener">MIINT Fellow</a>: selected as 1 of 5 fellows for a competitive, year-long global program focused on impact investment sourcing, due diligence, and investment recommendations.</li>
        <li><a href="https://www.mccombs.utexas.edu/centers-initiatives/center-for-customer-insight-and-marketing-solutions/marketing-fellows/" target="_blank" rel="noopener">Marketing Fellow</a>: chosen for McCombs' selective marketing leadership program, combining company-sponsored consulting projects with a focused marketing curriculum.</li>
        <li>Currently hunting for a marketing role for summer 2027.</li>
      </ul>
    </div>
  </article>
  <article class="entry" style="--c:var(--cobalt)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div>
      <span class="when">2024 – 2026</span>
      <h2>Manager → Senior Manager, Client Success &amp; Research</h2>
      <p class="where">Swayable · New York, NY</p>
      <ul>
        <li>Turned client feedback into AI-powered product capabilities, supporting 20+ late-stage sales opportunities worth $500K+ in pipeline.</li>
        <li>Led strategy validation for enterprise accounts, shaping messaging, go-to-market, and media investment decisions across $5.1M in annual recurring revenue.</li>
        <li>Advised 60+ brand and advocacy clients on marketing, product launches, innovation messaging, and public communications before they went to market.</li>
        <li>Synthesized 650+ creative effectiveness studies, each reading 1,000+ performance signals per asset, into messaging, segmentation, and media decisions.</li>
      </ul>
    </div>
  </article>
  <article class="entry" style="--c:var(--sun)">
    <div class="logo has-img"><img src="images/logo-kantar.png" alt="Kantar logo"></div>
    <div>
      <span class="when">2022 – 2024</span>
      <h2>Client Leadership Manager → Consultant, Brand Guidance &amp; Strategy</h2>
      <p class="where">Kantar · New York, NY</p>
      <ul>
        <li>Turned brand equity and customer perception data into market-specific growth strategies for a global tech company's marketing organization.</li>
        <li>Led 14+ customer and merchant insight initiatives across APAC, EMEA, and Canada, shaping incentive design and positioning.</li>
        <li>Managed 35+ marketing effectiveness engagements for Fortune 500 clients, delivering $2.8M in revenue.</li>
        <li>Delivered 70+ executive-level recommendations a year on campaigns from $1M to $50M+ in spend.</li>
        <li><a href="https://www.credential.net/c148b7a5-beac-4953-873c-b2cd26478754" target="_blank" rel="noopener">Goldstar Achiever, 2023</a>: one of 47 chosen worldwide from 500+ applicants for Kantar's annual program for emerging talent, with leadership challenges, exclusive events with regional leadership, and one-on-one mentoring from a senior leader. I presented my final ESG project to Kantar's CEO of North America and graduated with an honorable mention for North America.</li>
      </ul>
    </div>
  </article>
  <article class="entry" style="--c:var(--mint)">
    <div class="logo has-img"><img src="images/logo-tapresearch.png" alt="TapResearch logo"></div>
    <div>
      <span class="when">2020 – 2022</span>
      <h2>Research Associate → Account Manager → Senior Customer Success Manager</h2>
      <p class="where">TapResearch · Menlo Park, CA</p>
      <ul>
        <li>Built the customer success playbook for a newly launched brand-tracking product. Sales doubled.</li>
        <li>Grew a national bread brand's insights program 250% in contract value at renewal.</li>
        <li>Grew portfolio revenue 40% in six months across 25+ accounts.</li>
      </ul>
    </div>
  </article>
  <article class="entry" style="--c:var(--pink)">
    <div class="logo has-img"><img src="images/logo-northeastern.png" alt="Northeastern University seal"></div>
    <div>
      <h2>BA, Communication Studies, Cum Laude</h2>
      <p class="where">Northeastern University · Boston, MA</p>
    </div>
  </article>
</div>

<section class="resume-dl">
  <p>Prefer the one-page version?</p>
  <div class="dl-menu">
    <button type="button" class="dl-btn" aria-expanded="false" aria-controls="dl-list">Download resume <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="dl-list" id="dl-list" hidden>
      <p class="dl-ask">Which one?</p>
      <a href="Vanessa-Gershbein-Resume-Brand-Marketing.pdf" download>Brand marketing <span aria-hidden="true">↓</span></a>
      <a href="Vanessa-Gershbein-Resume-Product-Marketing.pdf" download>Product marketing <span aria-hidden="true">↓</span></a>
    </div>
  </div>
</section>
<script>
(function () {
  var m = document.querySelector('.dl-menu'); if (!m) return;
  var btn = m.querySelector('.dl-btn'), list = m.querySelector('.dl-list');
  function set(open) { list.hidden = !open; btn.setAttribute('aria-expanded', open); m.classList.toggle('open', open); }
  btn.addEventListener('click', function () { set(list.hidden); if (!list.hidden) list.querySelector('a').focus(); });
  document.addEventListener('click', function (e) { if (!m.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !list.hidden) { set(false); btn.focus(); } });
  list.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(function () { set(false); }, 150); }); });
})();
</script>
""")

# ---------- SELECTED WORK ----------
page("work.html", "Vanessa's Selected Work", "work", body="""
<section class="page-title">
  <h1>The projects I still <span class="hl">bring up at dinner.</span></h1>
  <p>A few I'm proudest of.</p>
</section>
<script src="quiz.js" defer></script>
<div class="stack two">
  <article class="entry" style="--c:var(--sun)">
    <div class="logo has-img"><img src="images/logo-kantar.png" alt="Kantar logo"></div>
    <div class="body">
      <span class="when">Enterprise tech brand strategy · Kantar</span>
      <h2>Taking a tech giant's brand pulse</h2>
      <p>A global enterprise tech company needed to know how its brand was landing, market by market. Using quarterly brand health tracking, I analyzed brand equity and customer perception data with Tableau and statistical models, then turned the findings into market-specific growth strategies. Those recommendations guided where the company invested across its key international markets, and the work generated $3.6M in annual revenue.</p>
    </div>
  </article>
  <article class="entry" style="--c:var(--tomato)">
    <div class="logo has-img"><img src="images/logo-salesvu.png" alt="SalesVu logo"></div>
    <div class="body">
      <span class="when">Go-to-market · McCombs+ · in progress</span>
      <h2>Taking restaurant tech into Mexican restaurants</h2>
      <p>Building the go-to-market plan for an AI restaurant-tech startup entering a new segment: who to target and what to say to win them. Yes, the research involves tacos.</p>
    </div>
  </article>
  <article class="entry feature" style="--c:var(--sun)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div class="body">
      <span class="when">Creative testing · Swayable</span>
      <h2>Does a celebrity actually pay off?</h2>
      <p>A breakfast bread brand wanted to know if star power was worth the talent spend. I tested two versions of the same ad with 5,000+ viewers: one starring a celebrity, one with everyday people.</p>
      <div class="quiz" data-answer="everyday">
        <p class="quiz-q">Your turn. Which version won on brand favorability?</p>
        <div class="quiz-opts">
          <button type="button" data-pick="celebrity">The celebrity</button>
          <button type="button" data-pick="everyday">Everyday people</button>
        </div>
        <p class="quiz-result" aria-live="polite"><strong class="quiz-verdict"></strong> The everyday version drove the strongest lift in brand favorability. It felt more relatable, and viewers didn't need a celebrity to get the joke.</p>
      </div>
    </div>
  </article>
  <article class="entry" style="--c:var(--tomato)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div class="body">
      <span class="when">Iterative testing · Swayable</span>
      <h2>Three rounds to the perfect Friday night</h2>
      <p>A major baking brand needed a campaign built on a real family moment. Over three rounds of category and occasion research, each building on the last, I helped the team narrow a broad family idea to the one occasion that drove the strongest purchase consideration.</p>
      <div class="quiz" data-answer="reveal" data-reveal>
        <p class="quiz-q">Your turn. Picture the winning family moment, then check.</p>
        <div class="quiz-opts"><button type="button" data-pick="reveal">Show me the winner</button></div>
        <p class="quiz-result" aria-live="polite"><strong class="quiz-verdict"></strong> A nostalgic young family breaking free together on a Friday night.</p>
      </div>
    </div>
  </article>
  <article class="entry" style="--c:var(--cobalt)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div class="body">
      <span class="when">Creative testing · Swayable</span>
      <h2>Fixing an ad before it was made</h2>
      <p>A Mexican food brand was about to produce an awareness ad built around a grandmother's wisdom. Before they spent money on production, I tested the storyboard and presented the results to the brand and its creative agency together. Younger audiences, especially millennial moms, loved it. Older viewers were more hesitant.</p>
      <div class="quiz" data-answer="brand">
        <p class="quiz-q">Your turn. People liked the ad. What was holding it back?</p>
        <div class="quiz-opts">
          <button type="button" data-pick="brand">They couldn't tell which brand it was for</button>
          <button type="button" data-pick="story">The story was confusing</button>
        </div>
        <p class="quiz-result" aria-live="polite"><strong class="quiz-verdict"></strong> Viewers weren't connecting the ad to the brand. I recommended a watermark and more product moments throughout. After the changes, the produced ad lifted aided brand awareness almost 10 points.</p>
      </div>
    </div>
  </article>
  <article class="entry" style="--c:var(--mint)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div class="body">
      <span class="when">Loyalty · Swayable</span>
      <h2>Designing a loyalty program people want to join</h2>
      <p>An outdoor retailer was launching a rewards program that had to feel like the brand, not just a points card. I helped the team go from idea to decision on visual identity, messaging, incentive structure, and positioning, including a premium credit card tier. The research helped settle the program's name and its incentive structure. It also reshaped the credit card offer: outdoor-themed messaging didn't build trust at the point of sign-up, so we took it out of that stage.</p>
    </div>
  </article>
  <article class="entry" style="--c:var(--sun)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div class="body">
      <span class="when">Product · Swayable</span>
      <h2>Turning client complaints into a feature</h2>
      <p>Clients kept asking for an easier way to export and share research results with their teams, but nobody had made it a product priority. I went back through my client conversations, found an export issue in roughly 30% of them, and brought that case to product and engineering. I worked with engineering on the requirements, stayed the bridge between clients and the build, and helped test and roll it out. It launched within one development cycle, client satisfaction improved, and sales started using it as a selling point.</p>
    </div>
  </article>
  <article class="entry" style="--c:var(--pink)">
    <div class="logo has-img"><img src="images/logo-swayable.png" alt="Swayable logo"></div>
    <div class="body">
      <span class="when">Creative testing · Swayable</span>
      <h2>Which teaser makes people hit play?</h2>
      <p>A premium streaming network had two teasers for a new original series: one told the story of the crime empire at its center, the other focused on the stars and their characters' personal development. I ran a randomized controlled test with 1,000+ viewers per ad, walked the team through the results, and set up a test design they could reuse for the next round of creative.</p>
      <div class="quiz" data-answer="story">
        <p class="quiz-q">Your turn. Which teaser drove more intent to watch?</p>
        <div class="quiz-opts"><button type="button" data-pick="story">The crime empire story</button><button type="button" data-pick="other">The stars' personal journeys</button></div>
        <p class="quiz-result" aria-live="polite"><strong class="quiz-verdict"></strong> The crime empire story won: higher intent to watch, more urgency to watch right away, and broader appeal across audiences.</p>
      </div>
    </div>
  </article>
  <article class="entry" style="--c:var(--cobalt)">
    <div class="logo has-img"><img src="images/logo-kantar.png" alt="Kantar logo"></div>
    <div class="body">
      <span class="when">Media effectiveness · Kantar</span>
      <h2>When the results are bad news</h2>
      <p>A B2B software company had just rebranded two products and wanted to know how the campaign landed with tech decision-makers. The results came back negative across the board. Instead of sugarcoating it, I cut the data many ways, looking at brand equity, message association, and brand relationship separately to find what was landing and what wasn't. I built the report around clear fixes for the next campaign, and the marketing team used it to refine their future campaigns.</p>
    </div>
  </article>
  <article class="entry" style="--c:var(--mint)">
    <div class="logo has-img"><img src="images/logo-kantar.png" alt="Kantar logo"></div>
    <div class="body">
      <span class="when">Media effectiveness · Kantar</span>
      <h2>Where should a financial brand spend its next ad dollar?</h2>
      <p>A national financial services company wanted to know which channels were earning their budget. I ran a cross-media effectiveness study that helped optimize its media buying plan. It showed that how often people saw the ads mattered more in some channels than others, and it shed light on how different audience segments see the value of working with a financial advisor. Leadership walked away with a clear roadmap for how often each audience needs to see the ads and which channels to optimize.</p>
    </div>
  </article>
  <article class="entry" style="--c:var(--pink)">
    <div class="logo has-img"><img src="images/logo-kantar.png" alt="Kantar logo"></div>
    <div class="body">
      <span class="when">Payments customer insights · Kantar</span>
      <h2>Why merchants should want these cardholders</h2>
      <p>A global payments company needed to prove its cardholders were worth courting. Across 14+ research reports in three regions, I identified the drivers of merchant value perception, which shaped sales incentive design and positioning. The program generated $1M in revenue.</p>
    </div>
  </article>
</div>
""")

# ---------- WHAT I'VE MADE (hub) ----------
page("made.html", "What Vanessa Made", "made", body="""
<section class="page-title">
  <h1>Things I made when <span class="hl">nobody was paying me to.</span></h1>
  <p>Pictures, side projects, and things I've built. Pick one.</p>
</section>
<section class="explore" aria-label="What I've Made">
  <div class="blocks">
    <a class="block has-img" href="photography.html" style="--c:var(--sun)">
      <img class="block-img" src="images/show-room.jpg" alt="" loading="lazy">
      <h2>Photography</h2>
      <p>My creative passion. Shooting film sharpens how I observe the world, and I curated a gallery show for my Brooklyn film club.</p>
      <span class="go">See the photos →</span>
    </a>
    <a class="block has-img" href="projects.html" style="--c:var(--mint)">
      <img class="block-img" src="images/jewelry.jpg" alt="" loading="lazy">
      <h2>Projects &amp; Builds</h2>
      <p>I love pushing myself to try new things, from building with AI to volunteering and creative side projects.</p>
      <span class="go">Take a look →</span>
    </a>
  </div>
</section>
""")

MADE_BACK = ("made.html", "Back to What I've Made")

# ---------- PHOTOGRAPHY ----------
page("photography.html", "Vanessa's Photography", "made", back=MADE_BACK, body="""
<section class="page-title calm">
  <h1>I see the world <span class="hl">36 frames at a time.</span></h1>
  <div class="prose">
    <p>Give me a camera and I'll notice the light on a wall you've walked past a hundred times. Every frame is a choice about what matters and what gets cropped out. Photography keeps my eyes fresh.</p>
  </div>
</section>

<section class="show-wrap" aria-labelledby="show-h">
  <h2 id="show-h" class="label">The gallery show · Mews Art Gallery</h2>
  <div class="show-grid">
    <div class="show-item"><img src="images/show-room.jpg" alt="Opening night of the film club show, a crowded gallery with a pink paper lantern and prints on the walls" loading="lazy"></div>
    <div class="show-item"><video src="images/show-video.mp4" poster="images/show-video-poster.jpg" autoplay muted loop playsinline aria-label="Short video walking through the crowded gallery at the opening"></video></div>
    <div class="show-item"><img src="images/show-tv.jpg" alt="An old television playing the club's photo archive, surrounded by photo books on the floor" loading="lazy"></div>
  </div>
  <p class="show-note">I curated 35+ works for the show, representing one year of work from our film club, a group of practicing photographers still learning to call themselves artists. Each month brought a new theme and film stock, from double exposures and diptychs to strangers and maximalism. Visitors lounged in our recreated living room while our photo archive played on an old TV. Framed prints sold for $50 each, and we raised $1,000+ for Wide Rainbow, an after-school art program in under-resourced neighborhoods.</p>
</section>

<section class="gallery-wrap" aria-labelledby="photos-h">
  <h2 id="photos-h" class="label">My photos</h2>
  <div class="gallery">
    <figure class="g-item"><div class="g-shot"><img src="images/photo-tea.jpg" alt="Overhead shot of hands holding a teacup at a table set for dolls, on a green botanical tablecloth" width="1400" height="1007" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-beach.jpg" alt="Silhouette of a woman and a little girl with a pink bow on the beach at sunset" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-mirror.jpg" alt="A woman seen from behind, her face reflected in a yellow hand mirror in afternoon light" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-bubbles.jpg" alt="Kids chasing giant soap bubbles on a city street" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-laundry.jpg" alt="A red sheet drying on a line against a weathered white building, a child peeking from a window" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-creek.jpg" alt="A creek winding through snow-covered woods" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-sled.jpg" alt="A kid on a blue sled framed through a hole in the snow" width="1400" height="928" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-wall.jpg" alt="Two people walking past, seen through a hole in a weathered concrete wall with exposed rebar" width="722" height="1089" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-park.jpg" alt="A couple standing in a leafy city park at dusk, tall buildings behind the trees" width="722" height="1089" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-teacup.jpg" alt="A woman in a green sweater and pearls holding a floral teacup, giving the camera a knowing look" width="722" height="1089" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-gallery.jpg" alt="A dark hallway opening onto a blurred, glowing gallery room" width="722" height="1089" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-hillside.jpg" alt="A woman lying back against a rock in tall green grass, sun and shadow on her face" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-phone-glow.jpg" alt="A face lit by a phone screen in a dark room, surrounded by curly hair" width="1400" height="928" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-tree.jpg" alt="A pale tree trunk covered in carved initials beside the water" width="928" height="1400" loading="lazy"></div></figure>
    <figure class="g-item"><div class="g-shot"><img src="images/photo-runners.jpg" alt="Runners mid-stride on sunlit pavement, their long shadows stretching behind them" width="1400" height="928" loading="lazy"></div></figure>
  </div>
</section>
<script src="gallery.js" defer></script>
""")

# ---------- BUILT WITH CLAUDE (hidden for now) ----------
# ---------- PROJECTS ----------
page("projects.html", "Projects and Builds", "made", back=MADE_BACK, body="""
<section class="page-title">
  <h1>I like trying things <span class="hl">I don't know how to do yet.</span></h1>
  <p>From building with AI to volunteering and creative side projects, this is where I push myself.</p>
</section>

<section class="proj-section" aria-labelledby="ai-h">
  <h2 id="ai-h"><span class="dot" style="--c:var(--cobalt)"></span>Built with AI</h2>
  <div class="proj-grid fit">
    <article class="proj-card" style="--c:var(--cobalt)"><span class="when">Website · Sept 2026</span><h3>This website</h3><p>Designed and built with Claude, starting from two sites I admired. I wrote the copy, chose the look, and shipped it.</p></article>
  </div>
</section>

<section class="proj-section" aria-labelledby="creative-h">
  <h2 id="creative-h"><span class="dot" style="--c:var(--tomato)"></span>Creative</h2>
  <div class="proj-grid">
    <article class="proj-card has-photo" style="--c:var(--tomato)"><img src="images/jewelry.jpg" alt="Rows of handmade resin earrings with pressed flowers laid out on a mirrored tray" width="900" height="1200" loading="lazy"><div class="proj-text"><span class="when">Local markets</span><h3>Resin jewelry</h3><p>I design and pour resin jewelry with pressed flowers and have sold it at local markets. Ask me about my favorite piece!</p></div></article>
  </div>
</section>

<section class="proj-section" aria-labelledby="give-h">
  <h2 id="give-h"><span class="dot" style="--c:var(--sun)"></span>Giving back</h2>
  <ul class="give-list">
    <li><strong>Volunteer swim instructor</strong><span>Keens</span><span class="yrs">2025</span></li>
    <li><strong>Operations</strong><span>Artist Talk on Art</span><span class="yrs">2023 – 2025</span><p class="give-note">Every week I helped host and publish panel discussions where senior artists talked about their work. The series is archived at the Smithsonian's Archives of American Art.</p></li>
    <li><strong>Community Outreach Liaison</strong><span>Kantar</span><span class="yrs">2022 – 2023</span><p class="give-note">Organized community service events for the New York office, from volunteer days with Encore to clothing and food drives. I also co-created Lunch with a Leader, informal lunches that connected analysts and directors with visiting leaders. It became a monthly series that kept going after I left.</p></li>
    <li><strong>Marketing Specialist</strong><span>50:50 Startup</span><span class="yrs">2020 – 2021</span><p class="give-note">Helped fundraise for and promote a global entrepreneurship program that brings together Israeli Arabs, Jews, and Palestinians to build equally owned tech startups.</p></li>
  </ul>
</section>
""")

# ---------- AT MCCOMBS ----------
page("mba.html", "Vanessa at McCombs", "mba", body="""
<section class="page-title">
  <h1>Two years to learn how to <span class="hl">make the call.</span></h1>
  <p>I'm a first-year MBA at UT Austin McCombs, focused on marketing (Class of 2028).</p>
</section>

<section class="proj-section honors" aria-labelledby="honors-h">
  <h2 id="honors-h"><span class="dot" style="--c:var(--sun)"></span>Honors</h2>
  <div class="proj-grid fit">
    <article class="proj-card" style="--c:var(--cobalt)"><span class="when">Merit scholarship</span><h3><a href="https://www.mccombs.utexas.edu/graduate/mba/full-time-mba/tuition-financial-aid/hildebrand-scholars/" target="_blank" rel="noopener">Hildebrand Scholar</a></h3><p>A full-tuition merit scholarship.</p></article>
    <article class="proj-card" style="--c:var(--cobalt)"><span class="when">Fellowship</span><h3>Forté Fellow</h3><p>A fellowship for women in business. Read about the <a href="forte.html">Forté MBA Leadership Conference</a>.</p></article>
    <article class="proj-card" style="--c:var(--cobalt)"><span class="when">Fellowship</span><h3><a href="https://www.turnermiint.org/" target="_blank" rel="noopener">MIINT Fellow</a></h3><p>Turner MBA Impact Investing Network &amp; Training. Selected as 1 of 5 fellows for a competitive, year-long global program focused on impact investment sourcing, due diligence, and investment recommendations.</p></article>
    <article class="proj-card" style="--c:var(--cobalt)"><span class="when">Selective program</span><h3><a href="https://www.mccombs.utexas.edu/centers-initiatives/center-for-customer-insight-and-marketing-solutions/marketing-fellows/" target="_blank" rel="noopener">Marketing Fellow</a></h3><p>Selected for McCombs' program built to develop elite marketing talent. Fellows go deeper than the core MBA, taking on company-sponsored consulting projects alongside a focused marketing curriculum.</p></article>
  </div>
</section>

<section class="proj-section spotlight" aria-labelledby="hands-h">
  <h2 id="hands-h"><span class="dot" style="--c:var(--tomato)"></span>Hands-on work</h2>
  <div class="proj-grid fit">
    <article class="proj-card" style="--c:var(--tomato)"><span class="when">McCombs+ practicum · Fall 2026</span><h3>Go-to-market for an AI restaurant-tech startup</h3><p>A semester-long client project building the plan to enter the Mexican-restaurant segment: who to target and what to say. More on my <a href="work.html">Selected Work</a> page.</p></article>
  </div>
</section>

<section class="proj-section recaps" aria-labelledby="trek-h">
  <h2 id="trek-h"><span class="dot" style="--c:var(--cobalt)"></span>What I'm learning</h2>
  <div class="proj-grid fit">
    <a class="proj-card trek-link" href="kenvue.html" style="--c:var(--cobalt)"><span class="when">Kenvue DFML Summit · Nov 4 – 5, 2026</span><h3>What Kenvue taught me about the tensions in brand management</h3><p>Two days at Kenvue's Developing Future Marketing Leaders Summit, and the tradeoffs every brand manager learns to balance.</p><span class="go">Read the recap →</span></a>
    <a class="proj-card trek-link" href="trek.html" style="--c:var(--cobalt)"><span class="when">Tech Trek · Sept 24 – 25, 2026</span><h3>What I learned on the McCombs Tech Trek</h3><p>Two days with Adobe, Visa, Google, and more, and what shifted in how I think about marketing.</p><span class="go">Read the recap →</span></a>
    <a class="proj-card trek-link" href="camp.html" style="--c:var(--cobalt)"><span class="when">Marketing Camp · Sept 18, 2026</span><h3>What Marketing Camp taught me about insight</h3><p>Marketing leaders from CPG, fast food, tech, and gaming, plus a live KFC case where my team placed third.</p><span class="go">Read the recap →</span></a>
    <a class="proj-card trek-link" href="forte.html" style="--c:var(--cobalt)"><span class="when">Forté · June 26 – 27, 2026</span><h3>My MBA started before day one</h3><p>Two days in Atlanta at the Forté MBA Leadership Conference: exploring career paths, building recruiting skills, and meeting my McCombs classmates.</p><span class="go">Read the recap →</span></a>
  </div>
</section>

<section class="proj-section clubs" aria-labelledby="clubs-h">
  <h2 id="clubs-h"><span class="dot" style="--c:var(--mint)"></span>Where you'll find me</h2>
  <div class="club-chips">
    <span class="chip" style="--c:var(--mint)">Graduate Marketing Network</span>
    <span class="chip" style="--c:var(--mint)">Tech Club</span>
    <span class="chip" style="--c:var(--mint)">Graduate Women in Business</span>
    <span class="chip" style="--c:var(--mint)">Graduate Consulting Group</span>
  </div>
</section>
""")

# ---------- TECH TREK BLOG ----------
page("trek.html", "Tech Trek Recap", "mba", back=("mba.html", "Back to At McCombs"), body="""
<article class="blog">
  <header class="page-title">
    <h1>What I learned on the <span class="hl">McCombs Tech Trek</span></h1>
    <p class="meta">Tech Trek · Sept 24 – 25, 2026</p>
  </header>

  <figure class="trek-hero"><img src="images/trek-google.jpg" alt="Our McCombs Tech Trek group throwing up Hook 'em Horns in front of the Google sign" width="1600" height="960"></figure>

  <div class="post">
    <p class="hook">I expected to spend two days learning about tech companies. I came back having learned more about how to think like a marketer inside one.</p>
    <p>In September I joined the McCombs Tech Trek: two days of sessions with teams at Adobe, Visa, and Google, an AI startup founder, and the Quantum in Business Conference (QIB).</p>

    <h2>One company, two kinds of marketing</h2>
    <p>I'd assumed a company picks one growth strategy and everyone rows in the same direction. Then we heard how a single portfolio can be racing to grow monthly active users (MAU) while still protecting annual recurring revenue (ARR). The first goal is won by removing friction everywhere: easy onboarding, broad reach, convert later. The second is won by serving the people who already value the product most. Now when I look at a launch, the first thing I ask is which of those two games it's playing.</p>

    <h2>What they said about AI and interviews</h2>
    <p>One speaker told us interviews are moving toward "show me what you built," and that the people getting ahead keep pushing AI one step past what it does by default. In another session, the advice was to stay in the driver's seat and check everything AI gives you. Both are part of why I built <a href="projects.html">this website</a> with AI.</p>

    <h2>Thirty minutes with a CFO</h2>
    <p>One panel said the skill they value most is being able to brief a senior leader, like a CFO, in thirty minutes. That stuck with me because it's the hardest part of research work: choosing what to leave out so the recommendation is easy to act on.</p>

    <h2>An AI founder on planning for failure</h2>
    <p>An AI founder said most builders are optimists, and it shows: products get designed for the ideal customer on the ideal day. Real customers are messier. Their answer was to think about how something fails before celebrating how it works, a mindset they traced to Andy Grove's <i>Only the Paranoid Survive</i>. Marketing plans can fall into the same trap when they're built around the ideal customer.</p>

    <h2>What recruiters actually notice</h2>
    <p>Recruiters said they can tell quickly who is genuinely interested. The habits they described were practical: read the latest quarterly report and use AI to decode the confusing parts, compare where a company is hiring with where it's investing, watch a demo before talking about a product, and ask alumni for fifteen minutes. Most will say yes, and some know about roles that aren't posted yet.</p>

    <p>As someone switching careers myself, I liked hearing how many panelists had started out in journalism, teaching, or public accounting.</p>
<div class="trek-photos">
      <img src="images/trek-heic.jpg" alt="Me in front of the Visa sign" width="1200" height="1600" loading="lazy">
      <img src="images/trek-wall.jpg" alt="Me in front of a glowing red light wall during the trek" width="1094" height="1600" loading="lazy">
      <img src="images/trek-group.jpg" alt="The trek group in front of the same glowing light wall" width="1600" height="1172" loading="lazy">
    </div>

    <p>Thank you to every speaker who shared their time and honesty, and to the McCombs community that made the trek happen.</p>
  </div>
</article>
""")

# ---------- MARKETING CAMP BLOG ----------
page("camp.html", "Marketing Camp Recap", "mba", back=("mba.html", "Back to At McCombs"), body="""
<article class="blog">
  <header class="page-title">
    <h1>What Marketing Camp taught me about <span class="hl">insight</span></h1>
    <p class="meta">Marketing Camp · Sept 18, 2026</p>
  </header>

  <div class="post">
    <p class="hook">I spent six years handing insights to marketers. At Marketing Camp, I finally got to hear what the best ones do with them.</p>
    <p>In September I spent a day at the McCombs Marketing Camp. We heard from a panel of marketers in B2B tech, gaming, beverages, and a sustainability startup, a veteran marketing executive from snacks and fast food, and the head of marketing at a pasture-raised egg brand. The day ended with a live KFC case.</p>

    <h2>A snack launch that started with a magazine article</h2>
    <p><img class="wrap-img right" src="images/camp-2.jpg" alt="A speaker on the main stage at McCombs Marketing Camp" width="750" height="1000">The executive told the story of a snack launch that began with a magazine article. Parents wanted more whole grains, and their kids didn't want the taste. That tension became a product the company rejected five times internally before it launched and grew into a major line. Later, at two fast-food chains, the same pattern repeated: a sharp insight first, then the creative. His advice was to go sit with your own data before you ask for a big research budget. As someone who has spent years on the research side, I loved hearing a senior leader say that the best insights often come from digging into the data.</p>

    <h2>Positioning has to be true</h2>
    <p>The egg brand's marketing leader defined marketing as "getting people to think differently in order to generate demand," and was firm that positioning has to come from truth, not a brainstorm. The brand prints the name of the farm on every carton of its pasture-raised eggs and links to a video of it, proof that competitors can't easily copy. When the brand faced a wave of misinformation online, the team didn't fight back. They checked the facts, found that most critics weren't even customers, answered sincere questions directly, and watched sentiment recover. As she put it, "You exist in the woods. The storms are always coming."</p>

    <h2>Moving fast without breaking the brand</h2>
    <p>The panel kept coming back to one tension: how to move fast enough to stay relevant without chipping away at the brand. Their answer was clear brand guardrails. When everyone knows exactly what the brand stands for, teams and agencies can act on a social moment the same day without escalating every call, and save the slower, careful work for things that last, like packaging or a major campaign.</p>
    <p>A beverage marketer showed what that clarity looks like across a whole portfolio. Each brand owns a different occasion, like a quiet night in versus a social gathering. That keeps the brands from competing with each other. As one panelist put it, much of leadership is deciding what not to do.</p>

    <h2>A good brief is a good prompt</h2>
    <p>The egg brand's marketing leader pointed out that a great brief spells out the problem, the behavior you want to change, and the core insight, which is also what makes a good AI prompt. One executive described AI as a way to get to 85% of an answer faster, then check everything, because it will confidently get things wrong. Another speaker warned that presenting AI-generated work you don't understand gets exposed the moment someone asks a question.</p>

    <h2>The KFC case</h2>
    <p>The day ended with a live brand strategy case from KFC. My team had one hour to prepare and five minutes to present to a panel of judges, who dropped into our room halfway through to test our thinking.</p>
    <p><img class="wrap-img left" src="images/camp-1.jpg" alt="My team working on the KFC case in a breakout room" width="750" height="1000">With no time to perfect anything, we had to pick a direction early, use frameworks as scaffolding rather than a checklist, and answer as brand managers rather than as customers. When the judges came by with questions, we had to explain our reasoning on the spot. I learned how much of presenting with confidence comes from being clear on your one big idea, so you can think on your feet when the questions come.</p>
    <div class="quiz" data-answer="3">
      <p class="quiz-q">Your turn. Where do you think my team placed?</p>
      <div class="quiz-opts"><button type="button" data-pick="1">First</button><button type="button" data-pick="2">Second</button><button type="button" data-pick="3">Third</button></div>
      <p class="quiz-result" aria-live="polite"><strong class="quiz-verdict"></strong> Third! A podium finish on one hour of prep.</p>
    </div>
    <script src="quiz.js" defer></script>

    <p>Honestly, I left energized! It made me feel like six years on the research side was a head start. Nearly every speaker ended on the same advice: stay curious, and build relationships while you're still in school.</p>
  </div>
</article>
""")

# ---------- KENVUE BLOG ----------
page("kenvue.html", "Kenvue Recap", "mba", back=("mba.html", "Back to At McCombs"), body="""
<article class="blog">
  <header class="page-title">
    <h1>What Kenvue taught me about the <span class="hl">tensions in brand management</span></h1>
    <p class="meta">Kenvue DFML Summit · Nov 4 – 5, 2026</p>
  </header>

  <figure class="trek-hero"><img src="images/kenvue-group.jpg" alt="Our group of MBA students smiling in front of the Kenvue building" width="1600" height="1200"></figure>

  <div class="post">
    <p class="hook">Brand management, it turns out, is the art of holding two good ideas at once.</p>
    <p>In November I flew to New Jersey for Kenvue's Developing Future Marketing Leaders (DFML) Summit: two days at headquarters with MBA students from several schools, just days after Kenvue officially became part of Kimberly-Clark. Across panels, case studies, and coffee chats, the leaders kept coming back to the same tensions.</p>

    <h2>A company that invests in leaders before it hires them</h2>
    <p>Honestly, DFML itself impressed me most! Weeks before we arrived, the team ran a case interview prep session to get us ready. At the summit, each of us got a one-on-one with an associate brand manager buddy, an honest real-talk panel with current ABMs, and mock interview prep. The whole program is built to break down barriers into brand management. They bring people in before any offers are made, so everyone leaves with sharper skills and a network across schools, whether or not they end up joining.</p>
    <p>The proof was in the room. Two of the panelists had come through DFML themselves, and one of the leaders we heard from started as an associate brand manager intern and now leads sales for a whole business unit. They described a culture where development conversations start in your first month, new ABMs get boot camps from day one, managers map your skill gaps and push for your next rotation, and stretch assignments are normal. In the middle of a huge merger, this team still made time to invest in people who don't work there yet. That says everything about the kind of leaders Kenvue and Kimberly-Clark want to build.</p>

    <h2>Your brand vs. the retailer's category</h2>
    <p>Retailers don't care if your brand wins. They care if their category grows. So every pitch has to prove it brings in new shoppers, gets people using more, or gets them trading up. Even with AI shopping on the rise, most sales still happen in stores, so one rocky retailer relationship can sink a year.</p>

    <h2>Growth vs. cannibalization</h2>
    <p>Every new product, pack size, or bundle has to pass one filter first: is it truly incremental, or will it just pull sales from the brand's own shelf? A two-pack can look like a win and quietly shrink the single. These are the research questions I've been asking for six years, and it was so fun to see them sit at the center of brand decisions.</p>

    <h2>One global idea vs. many local markets</h2>
    <p>Global teams own the big idea, and local teams make it work in their market and channels. The hard part is language. A claim that lands in one country can fall flat in another, so the work has to resonate everywhere at once.</p>

    <h2>Moving fast vs. committing big</h2>
    <p>One leader sorted decisions into one-way and two-way doors. A digital test can fail fast and pivot. A TV campaign commits millions, so you get alignment first.</p>

    <h2>Reach vs. trust</h2>
    <div class="quiz" data-answer="3">
      <p class="quiz-q">Quick guess. Who moves an over-the-counter brand the most?</p>
      <div class="quiz-opts"><button type="button" data-pick="1">A creator with millions of followers</button><button type="button" data-pick="2">A big TV campaign</button><button type="button" data-pick="3">Your doctor</button></div>
      <p class="quiz-result" aria-live="polite"><strong class="quiz-verdict"></strong> Your doctor! The panel called doctor recommendations an annuity: slow to build, and they keep paying out.</p>
    </div>
    <script src="quiz.js" defer></script>
    <p>The panel on marketing to doctors flipped how I think about influence. Health brands need both creators with big audiences and the experts who publish research and teach other doctors. Patients now walk in with answers from ChatGPT, so brands also have to make sure accurate information is what AI tools learn from.</p>

    <h2>Being seen vs. making sense</h2>
    <p>One team walked us through a music festival activation for a pain-relief brand: recharge kits, a lounge with samples and phone charging, and recovery tools for tired legs. The best feedback wasn't about reach. It was festival-goers saying the brand being there actually made sense. Their lesson was to start with a business problem and a real consumer tension, not a cool execution.</p>

    <p>The leader I'll remember most called herself a steel umbrella: she takes the pressure from above and the heat for her team's calls, so they can take smart risks. Holding the tension so your team doesn't have to might be the most important job of all. Thank you to the DFML team and every Kenvue and Kimberly-Clark leader who gave us their time and such honest answers!</p>
  </div>
</article>
""")

# ---------- FORTE BLOG ----------
page("forte.html", "Forte Leadership Conference", "mba", back=("mba.html", "Back to At McCombs"), body="""
<article class="blog">
  <header class="page-title">
    <h1>My MBA started <span class="hl">before day one</span></h1>
    <p class="meta">Forté · June 26 – 27, 2026</p>
  </header>

  <figure class="trek-hero"><img src="images/forte-cohort.jpg" alt="The McCombs group in matching burnt-orange shirts in front of the Forté #MoreWomenLeading backdrop" width="1400" height="1050"></figure>

  <div class="post">
    <p class="hook">Before my first MBA class, I spent two days in a ballroom in Atlanta with 600+ other incoming MBA students.</p>
    <p>As a Forté Fellow, I attended the Forté MBA Leadership Conference in June, a two-day event for incoming MBA students at Forté member schools. Day one was about exploring careers. Day two was a professional development day focused on the skills that carry you through recruiting and beyond.</p>

    <h2>Meeting my class early</h2>
    <p><img class="wrap-img right" src="images/forte-sign.jpg" alt="The McCombs group throwing up Hook 'em Horns behind a glowing FORTÉ sign" width="1179" height="848">The McCombs group showed up in matching burnt-orange shirts, and it was the first time many of us were in the same room. By the time we got to Austin for orientation, I already had familiar faces, and a group of women I knew I could lean on through recruiting.</p>

    <h2>Day one: seeing what's possible</h2>
    <p>Friday was about exploring careers, and I used it to test my assumptions about where an MBA could take me. I went to three panels.</p>
    <p><strong>Marketing and Brand Management</strong> was the obvious pick for me. The panel had marketing leaders from Amazon, TD Bank, and American Airlines, moderated by a marketer from Boston Scientific. Seeing brand managers from e-commerce, banking, airlines, and medical devices on one stage showed me how well those skills carry across industries.</p>
    <p><strong>Technology</strong> had panelists from PwC, Dell Technologies, and ZS, moderated by someone from Meta. Two of the four came from consulting firms, which was a useful reminder that you can build a tech career from the outside in.</p>
    <p><strong>Beyond the Familiar: Exploring Differentiated MBA Career Paths</strong> was the one I picked to stretch myself. The panelists worked in strategy at Teach For America, commercial real estate at Trammell Crow, and franchise strategy at Sony Interactive Entertainment. I wouldn't have pictured any of those as MBA paths before that session.</p>

    <h2>Day two: building the skills</h2>
    <p><img class="wrap-img left" src="images/forte-tables.jpg" alt="Conference tables in a ballroom under the Forté More women leading sign" width="1050" height="1400">Saturday started with a plenary on recruiting in the age of AI: how it's changing the way companies hire and candidates get hired, how to stand out in an AI-assisted search, and which skills matter most as it evolves. None of us had started recruiting yet, so the timing was good. The rest of the day was hands-on, with workshops on negotiation, the nuance of networking, executive presence, and preparing for MBA interviews.</p>
    <p>The highlight for me was the alumni table talks, where Forté MBA alumnae led small-group conversations. Our table was led by a Darden MBA alumna whose career has moved from Capital One to PwC's New Ventures incubator to product leadership at Amazon, and back to Capital One in enterprise data. She answered every question honestly and made mentorship feel like something to start now.</p>

    <figure class="forte-wide"><img src="images/forte-booth.jpg" alt="Smiling McCombs classmates in a photo booth holding a #MoreWomenLeading sign" width="1179" height="774"></figure>

    <h2>What I carried into McCombs</h2>
    <p>I left Atlanta with new friends, a clearer map of MBA career paths, and two books on my reading list: <i>Runnin' Down a Dream</i> by Bill Gurley and <i>Good to Great</i> by Jim Collins.</p>
  </div>
</article>
""")

