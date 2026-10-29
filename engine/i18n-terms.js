/* ==========================================================================
   WuWay — vocabulary + element metadata
   The localization map is the single source of truth for how the traditional
   Five Elements terminology is expressed in English. Nothing in the UI should
   hard-code a translation; import it from here.
   ========================================================================== */

(function (root) {

  var api = (function () {

  /* ---------------------------------------------------------------------
     Localization vocabulary  (required, exact wording — see brief §4)
     --------------------------------------------------------------------- */
  var TERMS = {
    dayMaster:            'Your Core Element',
    shengKe:              'Energy Flow and Energy Friction',
    guanSha:              'Structure and Discipline',
    shiShang:             'Expression and Creativity',
    caiXing:              'Resources and Value',
    yinXing:              'Support and Inner Wisdom',
    biJie:                'Community and Self-Assertion',
    shenRuo:              'Depleted Energy',
    shenQiang:            'Abundant Energy',
    queXing:              'Energy Deficit in',
    xiYongShen:           'Your Anchor Element',
    anchorElement:        'Your Anchor Element',
    coreElement:          'Your Core Element',
    dominantElement:      'Dominant Element',
    deficitElement:       'Energy Deficit',
    elementalBlueprint:   'Your Elemental Blueprint',
    pillars:              'Four Pillars chart',
    trueSolarTime:        'True Solar Time',
    profile:              'profile',
    energy:               'energy',
    balance:              'balance',
    alignment:            'alignment',
  };

  /* ---------------------------------------------------------------------
     The five elements
     --------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
     Element marks — brush-style line glyphs drawn around the origin, so the
     same path data serves both the Element Wheel (large) and inline icons.
     --------------------------------------------------------------------- */
  var GLYPHS = {
    wood: '<path d="M0 10 C0 2 0 -4 0 -12"/><path d="M0 -4 C-6 -6 -9 -10 -9 -15 C-4 -14 -1 -10 0 -6"/><path d="M0 -4 C6 -6 9 -10 9 -15 C4 -14 1 -10 0 -6"/><path d="M0 4 C-5 2 -7 -1 -8 -5 C-4 -4 -1 -1 0 2"/><path d="M0 4 C5 2 7 -1 8 -5 C4 -4 1 -1 0 2"/>',
    fire: '<path d="M0 -12 C4 -7 8 -4 8 2 C8 8 4 12 0 12 C-4 12 -8 8 -8 2 C-8 -2 -6 -5 -4 -7 C-3 -4 -2 -3 0 -2 C-1 -5 0 -8 0 -12 Z"/>',
    earth: '<path d="M-10 6 L-4 -6 L2 6"/><path d="M-2 6 L4 -8 L10 6"/>',
    metal: '<path d="M0 -12 L9 0 L0 12 L-9 0 Z"/><path d="M0 -12 L0 12 M-9 0 L9 0"/>',
    water: '<path d="M-10 -2 C-6 -8 -2 -8 2 -2 C6 4 8 4 10 0"/><path d="M-10 6 C-6 0 -2 0 2 6 C6 12 8 12 10 8"/>',
  };

  var GLYPH_VIEWBOX = '-15 -18 30 32';

  function glyph(key, cls, width) {
    return '<svg class="' + cls + '" viewBox="' + GLYPH_VIEWBOX + '" fill="none" ' +
      'stroke="currentColor" stroke-width="' + (width || 1.4) + '" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + GLYPHS[key] + '</svg>';
  }

  var ICONS = {
    wood: glyph('wood', 'el-icon'),
    fire: glyph('fire', 'el-icon'),
    earth: glyph('earth', 'el-icon'),
    metal: glyph('metal', 'el-icon'),
    water: glyph('water', 'el-icon'),
  };

  /* the leaf mark used as the site logo */
  var LEAF_LOGO =
    '<svg class="brand-mark" viewBox="-15 -15 30 30" fill="none" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M0 12 C0 4 0 -2 0 -11"/>' +
    '<path d="M0 -3 C-6 -5 -9 -9 -9 -13 C-4 -12 -1 -8 0 -5"/>' +
    '<path d="M0 -3 C6 -5 9 -9 9 -13 C4 -12 1 -8 0 -5"/>' +
    '<path d="M0 5 C-5 3 -7 0 -8 -4 C-4 -3 -1 0 0 3"/>' +
    '<path d="M0 5 C5 3 7 0 8 -4 C4 -3 1 0 0 3"/>' +
    '<path d="M0 12 C-3 10 -5 8 -5.5 5"/>' +
    '<path d="M0 12 C3 10 5 8 5.5 5"/></svg>';

  var ELEMENTS = {
    wood: {
      key: 'wood',
      name: 'Wood',
      hanzi: '木',
      color: '#7C8A63',      // Elemental Vibe palette
      soft: 'rgba(124,138,99,0.16)',
      icon: ICONS.wood,
      trait: 'Growth · Vision',
      description: 'Wood carries the energy of spring — expansion, creativity and the courage to begin.',
      keyword: 'Growth, direction, initiative',
      essence:
        'Wood is the energy of spring — the push of a seedling through soil. It shows up as ' +
        'vision, forward motion, and the quiet insistence that things can be better than they are.',
      inBalance:
        'When Wood is steady you set a direction and actually walk it. You plan, you begin, you keep going.',
      tooMuch:
        'When Wood runs high, forward motion can tip into impatience — pushing when a situation needs waiting.',
      tooLittle:
        'When Wood is thin, starting can feel heavy and long-range plans lose their shape.',
      envColors: 'deep greens, olive, fresh leaf tones',
      envMaterials: 'living plants, reclaimed wood, linen, rattan',
      envSpace:
        'A workspace with something alive in it and a clear vertical line — a plant that grows toward ' +
        'the light, a shelf you can see the shape of. Wood likes visible progress.',
      styleNote:
        'Wood responds to movement and to beginnings. Keep one thing in your space that is actively growing.',
    },
    fire: {
      key: 'fire',
      name: 'Fire',
      hanzi: '火',
      color: '#C1704E',
      soft: 'rgba(193,112,78,0.16)',
      icon: ICONS.fire,
      trait: 'Passion · Energy',
      description: 'Fire is the spark of joy and connection — charisma, warmth and heartfelt expression.',
      keyword: 'Warmth, connection, visibility',
      essence:
        'Fire is summer and the light that gathers people around it. It shows up as enthusiasm, ' +
        'expressiveness, and the ability to make a room feel warmer just by arriving.',
      inBalance:
        'When Fire is steady you bring warmth without burning out — you connect people, and you are seen without needing to perform.',
      tooMuch:
        'When Fire runs high, brightness can become depletion: giving outward until the inner ember thins.',
      tooLittle:
        'When Fire is low, motivation can feel far away and it is harder to be visible, even to people who care about you.',
      envColors: 'terracotta, amber, warm clay, candlelight',
      envMaterials: 'beeswax candles, clay ceramics, wool, brushed brass',
      envSpace:
        'One warm light source you actually use, and a surface reserved for things you love looking at. ' +
        'Fire is fed by delight, not by more hours.',
      styleNote:
        'Fire responds to warmth and to being witnessed. Small, real pleasures refill it faster than big plans do.',
    },
    earth: {
      key: 'earth',
      name: 'Earth',
      hanzi: '土',
      color: '#C19A6B',
      soft: 'rgba(193,154,107,0.18)',
      icon: ICONS.earth,
      trait: 'Stability · Nurture',
      description: 'Earth grounds and nourishes — patience, loyalty and a deep sense of care.',
      keyword: 'Grounding, care, reliability',
      essence:
        'Earth is the late-summer harvest and the ground everything stands on. It shows up as ' +
        'steadiness, patience, and the instinct to take care of what is right in front of you.',
      inBalance:
        'When Earth is steady you are the person others rest against. You finish things, and you notice what a situation actually needs.',
      tooMuch:
        'When Earth runs high, care can become over-carrying — holding more than belongs to you.',
      tooLittle:
        'When Earth is thin, routines loosen and it gets harder to feel settled in your own day.',
      envColors: 'ocher, sand, warm taupe, unbleached linen',
      envMaterials: 'stoneware, clay, natural fiber rugs, raw wood',
      envSpace:
        'A surface that is always clear, and one repetitive ritual you do at the same time each day. ' +
        'Earth is built by repetition, not by intensity.',
      styleNote:
        'Earth responds to rhythm and to touch. Weight, texture, and sameness are its comforts.',
    },
    metal: {
      key: 'metal',
      name: 'Metal',
      hanzi: '金',
      color: '#9AA0A0',
      soft: 'rgba(154,160,160,0.20)',
      icon: ICONS.metal,
      trait: 'Clarity · Strength',
      description: 'Metal refines and defines — precision, integrity and quiet resilience.',
      keyword: 'Clarity, standards, discernment',
      essence:
        'Metal is autumn and the clean edge of a well-made tool. It shows up as precision, ' +
        'honesty, and the ability to know what is worth keeping.',
      inBalance:
        'When Metal is steady you are clear without being cold. You edit well, you keep your word, and you can let things go.',
      tooMuch:
        'When Metal runs high, discernment can sharpen into self-criticism or a standard nothing meets.',
      tooLittle:
        'When Metal is thin, boundaries blur and it is harder to say what you actually think.',
      envColors: 'soft gray, bone white, pewter, cool blue-gray',
      envMaterials: 'glass, brushed steel, marble, fine paper',
      envSpace:
        'One empty surface and one drawer that is genuinely sorted. Metal is restored by reduction — ' +
        'the pleasure of a clean line.',
      styleNote:
        'Metal responds to clarity and to air. Empty space is not absence for Metal; it is relief.',
    },
    water: {
      key: 'water',
      name: 'Water',
      hanzi: '水',
      color: '#7C97A5',
      soft: 'rgba(124,151,165,0.18)',
      icon: ICONS.water,
      trait: 'Flow · Wisdom',
      description: 'Water adapts and reflects — intuition, depth and the wisdom of rest.',
      keyword: 'Depth, reflection, intuition',
      essence:
        'Water is winter and the still water that holds the whole sky. It shows up as depth, ' +
        'intuition, and a mind that keeps working long after the conversation ends.',
      inBalance:
        'When Water is steady you are reflective without disappearing — you trust what you sense and you still act on it.',
      tooMuch:
        'When Water runs high, depth can become drift: thinking about the thing instead of moving on it.',
      tooLittle:
        'When Water is thin, rest stops restoring and it gets harder to hear your own instinct under the noise.',
      envColors: 'deep blue, ink, slate, sea glass',
      envMaterials: 'glass, water features, soft dark textiles, stone',
      envSpace:
        'A place to sit still with no screen in sight, and water you can see or hear. ' +
        'Water needs quiet more than it needs order.',
      styleNote:
        'Water responds to stillness and to sleep. Rest is not a reward for Water; it is the fuel.',
    },
  };

  var ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

  /* ---------------------------------------------------------------------
     Classical correspondences (knowledge base §1.2).
     Body associations are TRADITIONAL correspondences only — never health
     claims, never medical advice. The report layer always renders them
     behind an explicit "in the classical system" framing.
     --------------------------------------------------------------------- */
  var CLASSICAL = {
    wood: {
      nature: 'Wood bends and straightens — growth that adapts',
      virtuePy: 'Ren', virtueCn: '\u4ec1', virtue: 'humanity, growth',
      color: 'green and teal', direction: 'east', season: 'spring',
      sense: 'sight', taste: 'sour', body: 'liver and tendons',
      materials: 'plants, linen, bamboo, rattan',
      activities: 'walking, gardening, stretching, learning something new',
    },
    fire: {
      nature: 'Fire flames upward — radiance that rises',
      virtuePy: 'Li', virtueCn: '\u793c', virtue: 'propriety, joy',
      color: 'red and warm orange', direction: 'south', season: 'summer',
      sense: 'taste', taste: 'bitter', body: 'heart',
      materials: 'candlelight, sunlight, silk, warm metals',
      activities: 'dancing, socializing, morning light, cooking for others',
    },
    earth: {
      nature: 'Earth sows and reaps — the ground that holds',
      virtuePy: 'Xin', virtueCn: '\u4fe1', virtue: 'trust, steadiness',
      color: 'ocher and warm yellow', direction: 'center', season: 'late summer',
      sense: 'touch', taste: 'sweet', body: 'spleen and muscles',
      materials: 'clay, ceramic, stone, terracotta',
      activities: 'cooking, pottery, tidying, tending routines',
    },
    metal: {
      nature: 'Metal obeys and transforms — clarity that refines',
      virtuePy: 'Yi', virtueCn: '\u4e49', virtue: 'integrity, discernment',
      color: 'white and silver-gray', direction: 'west', season: 'autumn',
      sense: 'smell', taste: 'pungent', body: 'lungs and skin',
      materials: 'metal, glass, quartz, white ceramics',
      activities: 'breathwork, decluttering, journaling, finishing things',
    },
    water: {
      nature: 'Water moistens and descends — depth that seeks low ground',
      virtuePy: 'Zhi', virtueCn: '\u667a', virtue: 'wisdom, reflection',
      color: 'deep blue and black', direction: 'north', season: 'winter',
      sense: 'hearing', taste: 'salty', body: 'kidneys and bones',
      materials: 'water features, mirrors, dark stones',
      activities: 'swimming, meditation, writing, quiet evenings',
    },
  };

  /* ---------------------------------------------------------------------
     US English guard (knowledge base §1.10 — site locale is US English).
     Left side is the British form; the scan flags any of these in shipped
     customer-facing files. js/vendor/ is third-party MIT code and excluded.
     --------------------------------------------------------------------- */
  var BRITISH_SPELLINGS = [
    'colour', 'colours', 'coloured', 'colourful', 'behaviour', 'behaviours',
    'favour', 'favourite', 'favourites', 'honour', 'labour', 'neighbour',
    'neighbours', 'recognise', 'recognised', 'recognises', 'organise',
    'organised', 'organises', 'organisation', 'realise', 'realised',
    'normalise', 'normalised', 'normalisation', 'analyse', 'analysed',
    'analyses', 'generalise', 'apologise', 'prioritise', 'prioritised',
    'utilise', 'utilised', 'centre', 'centres', 'centred', 'grey',
    'defence', 'licence', 'offence', 'pretence', 'practise', 'practised',
    'traveller', 'travellers', 'travelling', 'cancelled', 'cancelling',
    'modelling', 'labelled', 'fuelled', 'signalling', 'judgement',
    'acknowledgement', 'ageing', 'whilst', 'amongst', 'learnt', 'cosy',
    'jewellery', 'sceptic', 'sceptical', 'aeroplane', 'programme',
    'programmes', 'towards', 'afterwards', 'storey', 'storeys', 'pyjamas',
    'tyre', 'tyres', 'kerb', 'plough', 'draught', 'mould', 'sulphur',
    'aluminium', 'manoeuvre', 'catalogue', 'dialogue', 'metre', 'metres',
    'litre', 'litres', 'fibre', 'theatre', 'cheque', 'enrol', 'enrolled',
    'fulfil', 'fulfilled', 'instalment', 'skilful', 'wilful',
    /* added in phase 3: the enumerated list had gaps — 'energised' shipped
       live for two phases because it was never in here. The patterns below
       are the real guard; this list is the high-signal backup. */
    'energise', 'energised', 'energises', 'energising', 'energisation',
    'flavour', 'flavours', 'flavoured', 'flavouring',
    'odour', 'odours', 'humour', 'humoured', 'armour', 'armoured',
    'endeavour', 'endeavours', 'rigour', 'vigour', 'clamour', 'parlour',
    'splendour', 'tumour', 'tumours', 'valour', 'savour', 'savoured',
    'behavioural', 'colourway', 'colourways', 'neighbouring',
    'organisation', 'organisations', 'realisation', 'utilisation',
    'familiarise', 'familiarised', 'minimise', 'minimised', 'maximise',
    'maximised', 'optimise', 'optimised', 'summarise', 'summarised',
    'emphasise', 'emphasised', 'characterise', 'characterised',
    'personalise', 'personalised', 'customise', 'customised',
    'standardise', 'standardised', 'specialise', 'specialised',
    'categorise', 'categorised', 'memorise', 'memorised', 'visualise',
    'visualised', 'criticise', 'criticised', 'supervize',
  ];

  /* ---------------------------------------------------------------------
     US-English guard, part 2: generative rules.

     The enumerated list above is a losing game — it only catches words
     somebody remembered to add, which is exactly how a single -ise verb survived
     two releases. These patterns catch a whole word family at once, so a
     new word in the same family cannot slip through.

     Each pattern is filtered against US_SAFE_WORDS: words that look British
     by suffix but are the correct US spelling (advertise, hour, your, ...).
     --------------------------------------------------------------------- */
  var US_SAFE_WORDS = [
    /* -ise is correct US English for these */
    'advertise', 'advertised', 'advertises', 'advertising',
    'advise', 'advised', 'advises', 'advising', 'adviser', 'advisers',
    'arise', 'arises', 'arising', 'arose',
    'chastise', 'chastised', 'comprise', 'comprised', 'comprises',
    'compromise', 'compromised', 'compromises', 'compromising',
    'demise', 'despise', 'despised', 'devise', 'devised', 'devises',
    'disguise', 'disguised', 'disguises', 'exercise', 'exercised',
    'exercises', 'exercising', 'expertise', 'franchise', 'franchises',
    'guise', 'improvise', 'improvised', 'incise', 'incised',
    'merchandise', 'premise', 'premises', 'raise', 'raised', 'raises',
    'raising', 'revise', 'revised', 'revises', 'revising', 'rise',
    'rises', 'rising', 'supervise', 'supervised', 'supervises',
    'surmise', 'surprise', 'surprised', 'surprises', 'surprising',
    'tease', 'teased', 'teases', 'teasing', 'wise', 'otherwise',
    'likewise', 'clockwise', 'noise', 'noises', 'praise', 'praised',
    'precise', 'promise', 'promised', 'promises', 'promising',
    /* -our is correct US English for these */
    'our', 'ours', 'hour', 'hours', 'hourly', 'four', 'fourth',
    'fourteen', 'fourteenth', 'forty', 'your', 'yours', 'yourself',
    'sour', 'sourness', 'tour', 'tours', 'tourist', 'tourists',
    'pour', 'pours', 'poured', 'pouring', 'detour', 'detours',
    'contour', 'contours', 'velour', 'devour', 'devours', 'flour',
    'flours', 'scour', 'scours', 'glamour',
  ];

  var BRITISH_PATTERNS = [
    /* -ise / -ised / -ises / -ising / -isation  (the family that leaked) */
    { label: '-ise verb', re: /\b[a-z]+is(?:e|ed|es|ing|ation|ations)\b/gi },
    /* -our / -ours / -oured / -ouring / -ourite / -ourful / -ourable */
    { label: '-our noun', re: /\b[a-z]+our(?:s|ed|ing|ite|ites|ite|able|ful)?\b/gi },
    /* -re spellings */
    { label: '-re noun', re: /\b(centre|centres|centred|theatre|theatres|metre|metres|litre|litres|fibre|fibres|sombre|lustre|spectre|calibre|sabre|ochre|macabre)\b/gi },
    /* -ogue */
    { label: '-ogue', re: /\b(catalogue|catalogues|dialogue|dialogues|analogue|monologue|epilogue|prologue|travelogue)\b/gi },
    /* doubled-l and -lling forms */
    { label: 'double-l', re: /\b(traveller|travellers|travelling|travelled|cancelled|cancelling|modelling|modelled|labelled|labelling|fuelled|fuelling|signalling|signalled|levelled|levelling|marvellous|marvellously|jewellery|instalment|instalments|enrol|enrolled|enrolling|fulfil|fulfilled|fulfilling)\b/gi },
    /* everything else that is unambiguous */
    { label: 'other', re: /\b(grey|greys|greyish|licence|licences|defence|defences|offence|offences|pretence|practise|practised|practises|practising|whilst|amongst|learnt|cosy|cosier|tyre|tyres|kerb|plough|mould|moulded|sulphur|aluminium|manoeuvre|manoeuvres|storey|storeys|pyjamas|sceptic|sceptical|aeroplane|aeroplanes|cheque|cheques|skilful|wilful|judgement|judgements|ageing|programme|programmes|towards|afterwards)\b/gi },
  ];

  /**
   * Find British spellings in a block of text.
   * @returns {Array<{word:string,index:number,label:string}>}
   *
   * Callers are expected to have stripped their own guard lists first, and to
   * have blanked camelCase identifiers (see tests.html sanitize()), so that
   * code names like getUtcHours cannot trip the -our pattern.
   */
  function spellingHits(text) {
    var out = [];
    var seen = {};
    BRITISH_PATTERNS.forEach(function (p) {
      p.re.lastIndex = 0;
      var m;
      while ((m = p.re.exec(text)) !== null) {
        var w = m[0].toLowerCase();
        if (US_SAFE_WORDS.indexOf(w) !== -1) continue;
        var key = w + '@' + m.index;
        if (seen[key]) continue;
        seen[key] = 1;
        out.push({ word: w, index: m.index, label: p.label });
      }
    });
    /* the enumerated list, for anything the patterns do not describe */
    BRITISH_SPELLINGS.forEach(function (w) {
      var re = new RegExp('\\b' + w + '\\b', 'gi');
      var m;
      while ((m = re.exec(text)) !== null) {
        var key = w + '@' + m.index;
        if (seen[key]) continue;
        seen[key] = 1;
        out.push({ word: w, index: m.index, label: 'list' });
      }
    });
    return out.sort(function (a, b) { return a.index - b.index; });
  }

  /**
   * Blank out code identifiers so a camelCase name cannot look like prose.
   * Only a lowercase letter immediately followed by an uppercase one is
   * removed — that leaves ordinary capitalized and all-caps words intact.
   */
  function stripIdentifiers(text) {
    return text
      .replace(/\b[A-Za-z0-9_$]*[a-z][A-Z][A-Za-z0-9_$]*\b/g, ' ')
      .replace(/\b[a-z0-9]+(?:_[a-z0-9]+)+\b/g, ' ')
      .replace(/\b[a-z0-9]+(?:-[a-z0-9]+)+\b/g, function (m) {
        /* keep hyphenated prose ('well-being'), drop class names
           ('btn-lg', 'test-table-wrap', 'd-flex') */
        return /\b(btn|col|row|d|text|bg|mt|mb|ml|mr|px|py|gap|flex|grid|w|h|min|max|xs|sm|md|lg|xl)-/.test(m) ? ' ' : m;
      });
  }

  /* ---------------------------------------------------------------------
     Generating cycle:  A feeds B   (Wood -> Fire -> Earth -> Metal -> Water)
     Controlling cycle: A controls B (Wood -> Earth -> Water -> Fire -> Metal)
     --------------------------------------------------------------------- */
  var FEEDS = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
  var CONTROLS = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };

  function fedBy(el) {
    for (var k in FEEDS) { if (FEEDS[k] === el) return k; }
    return null;
  }
  function controlledBy(el) {
    for (var k in CONTROLS) { if (CONTROLS[k] === el) return k; }
    return null;
  }

  /* ---------------------------------------------------------------------
     The five dimensions  (traditional -> localized)
     --------------------------------------------------------------------- */
  var DIMENSIONS = [
    {
      key: 'structure',
      term: 'guanSha',
      cn: '官杀',
      name: TERMS.guanSha,
      relation: 'controls',
      summary:
        'How you meet structure, expectation, and the parts of life that ask for discipline.',
    },
    {
      key: 'expression',
      term: 'shiShang',
      cn: '食伤',
      name: TERMS.shiShang,
      relation: 'generatedBy',
      summary:
        'How you make things, say things, and put your inner world into the outer one.',
    },
    {
      key: 'resources',
      term: 'caiXing',
      cn: '财星',
      name: TERMS.caiXing,
      relation: 'controlledBy',
      summary:
        'How you gather, hold, and use resources — money, time, attention, opportunity.',
    },
    {
      key: 'support',
      term: 'yinXing',
      cn: '印星',
      name: TERMS.yinXing,
      relation: 'feeds',
      summary:
        'How you receive support, learn, and let yourself be looked after.',
    },
    {
      key: 'community',
      term: 'biJie',
      cn: '比劫',
      name: TERMS.biJie,
      relation: 'self',
      summary:
        'How you stand alongside others — peers, allies, and your own sense of self.',
    },
  ];

  /* Element that plays a given role relative to the Core Element */
  function elementForDimension(dim, coreElement) {
    switch (dim.relation) {
      case 'self':          return coreElement;
      case 'feeds':         return fedBy(coreElement);
      case 'generatedBy':   return FEEDS[coreElement];
      case 'controlledBy':  return CONTROLS[coreElement];
      case 'controls':      return controlledBy(coreElement);
      default:              return coreElement;
    }
  }

  /* ---------------------------------------------------------------------
     Language guard — the brief forbids deterministic vocabulary of the
     "reading your future" kind. tests.html uses this list to scan every
     page and script, so the constraint stays enforced after any edit.
     --------------------------------------------------------------------- */
  var FORBIDDEN_WORDS = [
    'fortune', 'fortune-telling', 'destiny', 'fate', 'fated', 'prediction',
    'predict', 'luck', 'lucky', 'unlucky', 'zodiac reading', 'horoscope',
    'psychic', 'supernatural', 'will happen', 'you will', 'you will become',
    /* knowledge base §1.10 additions */
    'curse', 'cursed', 'bad omen', 'beware', 'you must avoid', 'you must',
    'misfortune', 'ill fortune', 'auspicious', 'inauspicious', 'talisman',
  ];

  return {
    TERMS: TERMS,
    ELEMENTS: ELEMENTS,
    ORDER: ORDER,
    ICONS: ICONS,
    GLYPHS: GLYPHS,
    GLYPH_VIEWBOX: GLYPH_VIEWBOX,
    glyph: glyph,
    LEAF_LOGO: LEAF_LOGO,
    FEEDS: FEEDS,
    CONTROLS: CONTROLS,
    fedBy: fedBy,
    controlledBy: controlledBy,
    DIMENSIONS: DIMENSIONS,
    elementForDimension: elementForDimension,
    CLASSICAL: CLASSICAL,
    FORBIDDEN_WORDS: FORBIDDEN_WORDS,
    BRITISH_SPELLINGS: BRITISH_SPELLINGS,
    BRITISH_PATTERNS: BRITISH_PATTERNS,
    US_SAFE_WORDS: US_SAFE_WORDS,
    spellingHits: spellingHits,
    stripIdentifiers: stripIdentifiers,
    el: function (key) { return ELEMENTS[key]; },
    title: function (key) { return ELEMENTS[key].name; },
    /* brand block reused by every page shell */
    brandBlock: function (opts) {
      opts = opts || {};
      var inner = LEAF_LOGO +
        '<span class="brand-meta"><span class="brand-name">Wu<em>Way</em></span>' +
        '<span class="brand-pron">pronounced &ldquo;woo-way&rdquo;</span></span>';
      if (opts.link === false) return '<div class="brand">' + inner + '</div>';
      return '<a class="brand" href="' + (opts.href || '/') + '" aria-label="WuWay home">' +
        inner + '</a>';
    },
  };
  })();

  root.WuWayTerms = api;
  if (typeof module === 'object' && module.exports) module.exports = api;

})(typeof window !== 'undefined' ? window : globalThis);
