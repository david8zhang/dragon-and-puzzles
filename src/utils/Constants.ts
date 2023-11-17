export enum Elements {
  WATER = 'water',
  FIRE = 'fire',
  GRASS = 'grass',
  LIGHT = 'light',
  DARK = 'dark',
  HEALTH = 'health',
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
}
