import Phaser from 'phaser'

import { Game } from './scenes/Game'
import { Preload } from './scenes/Preload'
import { Constants } from './utils/Constants'
import GameOver from './scenes/GameOver'
import { Victory } from './scenes/Victory'
import { Start } from './scenes/Start'
import { Tutorial } from './scenes/Tutorial'
import GrayscalePipelinePlugin from 'phaser3-rex-plugins/plugins/grayscalepipeline-plugin'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Constants.WINDOW_WIDTH,
  height: Constants.WINDOW_HEIGHT,
  parent: 'phaser',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true,
    },
  },
  dom: {
    createContainer: true,
  },
  plugins: {
    global: [
      {
        key: 'rexGrayscalePipeline',
        plugin: GrayscalePipelinePlugin,
        start: true,
      },
    ],
  },
  pixelArt: true,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Preload, Start, Tutorial, Game, GameOver, Victory],
}

export default new Phaser.Game(config)
