import { Game } from '~/scenes/Game'
import { Enemy } from './Enemy'
import { Constants } from '~/utils/Constants'

export interface AnimatedSpriteConfig {
  // Names of the preloaded sprites (supports multiple)
  spriteNames: string[]
  // Where to put the sprite
  position: {
    x: number
    y: number
  }
  // Frame the animation start / stops at
  startFrame: number
  endFrame: number
  // Set custom duration for each frame
  frameDurations: number[]
}

/**
 * Sprite with a single animation from a sprite sheet. Supports having multiple animations play at the same time
 */
export class AnimatedSprite {
  private static readonly ANIMATION_KEY: string = 'animation'

  public sprites: Phaser.GameObjects.Sprite[] = []
  private game: Game

  constructor(game: Game, config: AnimatedSpriteConfig) {
    this.game = game
    this.sprites = config.spriteNames.map((spriteName) => {
      return this.game.add
        .sprite(config.position.x, config.position.y, spriteName, 0) // starting frame = 0
        .setDepth(Constants.SORT_ORDER.characters)
        .setScale(2)
    })
    // Setup animations
    config.spriteNames.forEach((spriteName, i) => {
      const { frameDurations, startFrame, endFrame } = config
      const frames = this.game.anims.generateFrameNumbers(spriteName, {
        start: startFrame,
        end: endFrame,
      })
      // Makes debugging easier
      if (frameDurations.length != endFrame - startFrame + 1)
        console.warn('Should define a duration (in ms) for each frame!')

      frameDurations.forEach((duration, i) => (frames[i].duration = duration))
      this.sprites[i].anims.create({
        key: AnimatedSprite.ANIMATION_KEY,
        frames: frames,
      })
      this.sprites[i].on('animationupdate', () => {
        this.boingSprite(this.sprites[i])
      })
    })
  }

  // Make sprite go boing
  protected boingSprite(sprite: Phaser.GameObjects.Sprite) {
    this.game.tweens.addCounter({
      from: -1,
      to: 0,
      duration: 200,
      ease: 'back.out',
      onUpdate: (tween) => {
        sprite.scaleX = 2 + tween.getValue() * 0.1
        sprite.scaleY = 2 - tween.getValue() * 0.1
      },
    })
  }

  play(onComplete: () => void) {
    this.sprites.forEach((sprite) => sprite.play(AnimatedSprite.ANIMATION_KEY))
    this.sprites[0].on('animationcomplete', () => {
      onComplete()
      this.sprites[0].removeAllListeners('animationcomplete')
    })
  }

  reset() {
    this.sprites.forEach((sprite) => sprite.setFrame(0))
  }

  fade(onComplete: () => void) {
    this.game.tweens.add({
      targets: this.sprites,
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 1000,
      onComplete,
    })
  }
}
