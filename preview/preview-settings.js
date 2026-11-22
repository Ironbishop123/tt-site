/* Tempered Tees, Preview Showing: settings and works (Claude, 2026-11-22).
   This file fills the page's data before the Daybook script starts. It reads nothing from Shopify's admin.
   SETTINGS: change only the values between the quotes. */
(function () {
  'use strict';
  var SET = {
    // Where the signup form sends an email address. This is the Kit form the old page at temperedtees.com already uses
    // (Arthur, Nov 22: "use the existing Kit free plan"). Blank ('') = the form shows and sends nothing.
    SIGNUP_URL: 'https://app.kit.com/forms/10117707/subscriptions',
    // The artist submit site.
    SUBMIT_URL: 'https://submit.temperedtees.com',
    // The Contact link.
    CONTACT_URL: 'mailto:hello@temperedtees.com',
    // The Founding Artists line on the Artists sheet. Blank ('') hides it. Fill it only with a true count, after George clears the line.
    // Example: 'Founding Artists: 0 of 50 places taken. Founding Artists earn more for every shirt sold.'
    FOUNDING_LINE: '',
    // The House: headline and text (Paul's own words from the Shopify theme, Nov 22).
    HOUSE_HEADLINE: 'Art by people. Worn by people.',
    HOUSE_TEXT: "Tempered Tees shows one artist's work each day. Every work is made by a person, never by AI. On its day, you can acquire it on a shirt. After that, it moves to The Archive. Enough requests can bring it back for a Return Showing.",
    // The line on the Tomorrow page.
    TOMORROW_LINE: 'Tomorrow, the next preview work comes out from under cover.',
    // Where the art pictures come from. The store's own files on Shopify's file server (public addresses).
    // To serve copies from this site instead, put the eight files in preview/art/ and set ART_FOLDER to 'preview/art/'.
    ART_CDN: 'https://cdn.shopify.com/s/files/1/0605/9366/8176/files/',
    ART_FOLDER: '',
    ART_WIDTH: 900
  };

  // The eight works. Each is public-domain art (checked against the museum's own record on Nov 22, 2026).
  var WORKS = [
    {
      "h": "great-wave",
      "t": "The Great Wave off Kanagawa",
      "a": "Katsushika Hokusai",
      "y": "ca. 1830–32",
      "s": "A woodblock print from Thirty-six Views of Mount Fuji. A great wave curls over three boats while Fuji sits small in the distance.",
      "file": "TT_FA-01_Hokusai_Great_Wave.jpg",
      "museum": "The Metropolitan Museum of Art",
      "record": "https://www.metmuseum.org/art/collection/search/39799"
    },
    {
      "h": "wheat-field-with-cypresses",
      "t": "Wheat Field with Cypresses",
      "a": "Vincent van Gogh",
      "y": "1889",
      "s": "Painted at Saint-Rémy in 1889. Cypresses, ripe wheat and a moving sky, laid down in thick, rhythmic strokes.",
      "file": "TT_FA-03_VanGogh_Wheat_Field_with_Cypresses.jpg",
      "museum": "The Metropolitan Museum of Art",
      "record": "https://www.metmuseum.org/art/collection/search/436535"
    },
    {
      "h": "water-lily-pond",
      "t": "Water Lily Pond",
      "a": "Claude Monet",
      "y": "1900",
      "s": "Monet painted the Japanese footbridge over his water garden at Giverny many times. Here it spans a pond of lilies in summer light.",
      "file": "TT_FA-06_Monet_Water_Lily_Pond.jpg",
      "museum": "The Art Institute of Chicago",
      "record": "https://www.artic.edu/artworks/87088"
    },
    {
      "h": "la-grande-jatte",
      "t": "A Sunday on La Grande Jatte — 1884",
      "a": "Georges Seurat",
      "y": "1884–86",
      "s": "A Sunday afternoon on an island in the Seine, built from small dots of pure color. Seurat worked on it for two years.",
      "file": "TT_FA-08_Seurat_La_Grande_Jatte.jpg",
      "museum": "The Art Institute of Chicago",
      "record": "https://www.artic.edu/artworks/27992"
    },
    {
      "h": "paris-street-rainy-day",
      "t": "Paris Street; Rainy Day",
      "a": "Gustave Caillebotte",
      "y": "1877",
      "s": "New boulevards, wet paving stones and umbrellas in Haussmann's Paris. Shown at the third Impressionist exhibition in 1877.",
      "file": "TT_FA-09_Caillebotte_Paris_Street_Rainy_Day.jpg",
      "museum": "The Art Institute of Chicago",
      "record": "https://www.artic.edu/artworks/20684"
    },
    {
      "h": "self-portrait",
      "t": "Self-Portrait",
      "a": "Vincent van Gogh",
      "y": "1887",
      "s": "Painted in Paris in 1887, one of more than twenty self-portraits Van Gogh made there.",
      "file": "TT_FA-05_VanGogh_Self-Portrait_1887.jpg",
      "museum": "The Art Institute of Chicago",
      "record": "https://www.artic.edu/artworks/80607"
    },
    {
      "h": "red-fuji",
      "t": "South Wind, Clear Sky (Red Fuji)",
      "a": "Katsushika Hokusai",
      "y": "ca. 1830–32",
      "s": "Also known as Red Fuji. Early light turns the mountain red beneath rows of small clouds.",
      "file": "TT_FA-02_Hokusai_Red_Fuji.jpg",
      "museum": "The Metropolitan Museum of Art",
      "record": "https://www.metmuseum.org/art/collection/search/55736"
    },
    {
      "h": "sudden-shower",
      "t": "Sudden Shower over Shin-Ōhashi Bridge and Atake",
      "a": "Utagawa Hiroshige",
      "y": "1857",
      "s": "From One Hundred Famous Views of Edo. A sudden rain sweeps across the bridge as walkers hurry for cover.",
      "file": "TT_FA-10_Hiroshige_Sudden_Shower.jpg",
      "museum": "The Metropolitan Museum of Art",
      "record": "https://www.metmuseum.org/art/collection/search/55433"
    }
  ];

  var el = document.querySelector('[data-ttd-data]'); if (!el) return;
  var root = el.closest('[data-ttd]'), base = (root && root.getAttribute('data-base')) || '', slug = (root && root.getAttribute('data-work')) || '';

  // Today's Central date as a day number. The work on show changes at 12:00 AM Central, as on the real site.
  function centralDay() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    } catch (e) { var n = new Date(); p = { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() }; }
    return Math.round(Date.UTC(+p.year, +p.month - 1, +p.day) / 86400000);
  }
  function iso(n) { return new Date(n * 86400000).toISOString().slice(0, 10); }
  var N = WORKS.length, day = centralDay(), ti = ((day % N) + N) % N;

  function img(w) {
    if (SET.ART_FOLDER) return base + SET.ART_FOLDER + w.file;
    return SET.ART_CDN + w.file + '?width=' + SET.ART_WIDTH;
  }
  // k = how many days ago this work was the one on show (0 = today)
  function make(i) {
    var w = WORKS[i], k = ((ti - i) % N + N) % N;
    return { id: 1000 + i, h: w.h, t: w.t, u: base + 'preview/work/' + w.h + '.html', a: w.a, y: w.y, d: iso(day - k), img: img(w),
      s: w.s + ' Public domain. Image: ' + w.museum + '.', ret: false, feat: false, mock: null, opts: [], cimg: {}, vars: [] };
  }
  var all = WORKS.map(function (w, i) { return make(i); }), today = all[ti];
  var work = null; if (slug) all.forEach(function (w) { if (w.h === slug) work = w; });
  var archive = work ? [] : all.filter(function (w) { return w !== today; });

  el.textContent = JSON.stringify({
    today: today, work: work, archive: archive, more: false,
    cfg: { cart: 0, cartUrl: '', home: base || './', view: '', register: '', submit: SET.SUBMIT_URL, login: '', privacy: '', terms: '', shipping: '',
      contact: SET.CONTACT_URL, aboutHead: SET.HOUSE_HEADLINE, aboutBody: SET.HOUSE_TEXT, tomorrow: SET.TOMORROW_LINE, tmArtist: '', tmAbout: '', tmLink: '',
      fit: '', chart: '', delivery: '', refund: '', mark: base + 'preview/tt-daybook-mark.jpg', regLive: false, notify: '', lotClose: false, threshold: 10, top: [],
      signup: SET.SIGNUP_URL, founding: SET.FOUNDING_LINE }
  });
  // the page title on a work page
  if (work) { try { document.title = work.t + ' by ' + work.a + ' (preview) | Tempered Tees'; } catch (e) {} }
})();
