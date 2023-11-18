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
    background: 100,
    enemy: 300,
    player: 400,
    ui: 500,
    top: 600,
  }

  public static ELEMENT_TO_COLOR = {
    [Elements.FIRE]: 'dc1600',
    [Elements.WATER]: '1940cf',
    [Elements.GRASS]: '109e00',
    [Elements.LIGHT]: 'fff415',
    [Elements.DARK]: '6c0b93',
    [Elements.HEALTH]: 'ff169d',
    [Elements.ALL]: 'ffffff',
  }

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
}
