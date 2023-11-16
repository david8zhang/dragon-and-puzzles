export enum Elements {
  WATER = 'water',
  FIRE = 'fire',
  GRASS = 'grass',
  LIGHT = 'light',
  DARK = 'dark',
  HEALTH = 'health',
  NONE = 'none',
}

export class Constants {
  public static WINDOW_WIDTH = 600
  public static WINDOW_HEIGHT = 800

  public static SORT_ORDER = {
    background: 100,
    enemy: 300,
    player: 400,
    ui: 500,
    top: 600,
  }

  public static ELEMENT_TO_COLOR = {
    [Elements.FIRE]: '#dc1600',
    [Elements.WATER]: '#1940cf',
    [Elements.GRASS]: '#109e00',
    [Elements.LIGHT]: '#fff415',
    [Elements.DARK]: '#6c0b93',
    [Elements.HEALTH]: '#ff169d',
  }
}
