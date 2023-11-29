export enum Elements {
  WATER = 'water',
  FIRE = 'fire',
  GRASS = 'grass',
  LIGHT = 'light',
  DARK = 'dark',
  HEALTH = 'health',
  NONE = 'none',
  ALL = 'all',
}

export class Constants {
  public static WINDOW_WIDTH = 600
  public static WINDOW_HEIGHT = 800
  public static MOVE_TIME_LIMIT = 8 // Time to move orbs (in seconds)

  public static SORT_ORDER = {
    background: -100,
    characters: 400,
    ui: 500,
    top: 600,
  }

  public static HEAL_MULTIPLIER = 2

  public static ORB_MOVE_SPEED = 0.35

  public static ELEMENT_TO_COLOR = {
    [Elements.FIRE]: 'dc1600', // #dc1600
    [Elements.WATER]: '2d7eff', // #2d7eff
    [Elements.GRASS]: '109e00', // #109e00
    [Elements.LIGHT]: 'fff415', // #fff415
    [Elements.DARK]: 'd65dff', // #d65dff
    [Elements.HEALTH]: 'ff169d', // #ff169d
    [Elements.ALL]: 'ffffff', // #ffffff
  }

  public static ALL_ELEMENTS = [
    Elements.FIRE,
    Elements.WATER,
    Elements.GRASS,
    Elements.LIGHT,
    Elements.DARK,
    Elements.HEALTH,
  ]

  public static WEAKNESS_MAP = {
    [Elements.FIRE]: [Elements.WATER],
    [Elements.WATER]: [Elements.GRASS],
    [Elements.GRASS]: [Elements.FIRE],
    [Elements.LIGHT]: [Elements.DARK],
    [Elements.DARK]: [Elements.LIGHT],
  }

  public static RESISTANCES_MAP = {
    [Elements.FIRE]: Elements.GRASS,
    [Elements.WATER]: Elements.FIRE,
    [Elements.GRASS]: Elements.WATER,
    [Elements.LIGHT]: [],
    [Elements.DARK]: [
      Elements.GRASS,
      Elements.FIRE,
      Elements.WATER,
      Elements.DARK,
    ],
  }

  public static INTRO_CUTSCENE = [
    {
      text: 'Welcome to Puzzlen Dragonia! Here, every dragon is born with magical scales imbued with the essence of one of the five elements: Water, Grass, Fire, Light, and Darkness',
      imageSrc: 'intro-1',
    },
    {
      text: 'Almost all dragons are limited to a single elemental power. However, a select few are special...',
      imageSrc: 'intro-2',
    },
    {
      text: 'These dragons can take the scales of other dragons and command the full rainbow of the elements. It is said that only one of these chosen few can rule as King of the Dragons',
      imageSrc: 'intro-3',
    },
    {
      text: 'Will you, a humble fire dragon who only recently discovered their royal potential, ascend to the throne?',
      imageSrc: 'intro-4',
    },
  ]

  public static PRE_BOSS_CUTSCENE = [
    {
      text: 'With the glistening scales of all five elements, you stand before the golden throne of Puzzlen Dragonia',
      imageSrc: 'boss-1',
    },
    {
      text: '"So, you think you can challenge me? Let me show you what it really means to be King!"',
      imageSrc: 'boss-2',
    },
  ]

  public static END_CUTSCENE = [
    {
      text: 'And so you took the scales of all the elements and dethroned your predecessor to become the King of the Dragons.',
      imageSrc: 'victory',
    },
    {
      text: 'With the five elements at your disposal, you are all but unbeatable!',
      imageSrc: 'victory',
    },
    {
      text: "Of course, that's also what the previous King of the Dragons had believed for so long, until you defeated him.",
      imageSrc: 'victory',
    },
    {
      text: 'Will one rise to challenge and overthrow you, or will you reign supreme? Only time will tell...',
      imageSrc: 'victory',
    },
    {
      text: 'Thanks for playing!',
      imageSrc: 'victory',
    },
  ]
}
