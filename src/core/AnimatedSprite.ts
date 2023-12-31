import { Game } from '~/scenes/Game'
import { Enemy } from './Enemy'
import { Constants } from '~/utils/Constants'

export interface AnimatedSpriteConfig {
  isCharacter?: boolean
  // Names of the preloaded sprites (supports multiple)
  spriteNames: string[]
  // Where to put the sprite
  position: {
    x: number
    y: number
  }
  // Frame the animation start / stops at
  startFrame?: number
  endFrame?: number
  // Set custom duration for each frame
  frameDurations?: number[]
  frameRate?: number
  destroyOnComplete?: boolean
}

/**
 * Sprite with a single animation from a sprite sheet. Supports having multiple animations play at the same time
 */
export class AnimatedSprite {
  private static readonly ANIMATION_KEY: string = 'animation'

  public sprites: Phaser.GameObjects.Sprite[] = []
  public idleTween?: Phaser.Tweens.Tween
  private game: Game
  private destroyOnComplete: boolean = false
  private frameListeners: Array<(frame: number) => void> = []

  constructor(game: Game, config: AnimatedSpriteConfig) {
    this.game = game
    this.destroyOnComplete = config.destroyOnComplete ?? false
    this.sprites = config.spriteNames.map((spriteName) => {
      return this.game.add
        .sprite(config.position.x, config.position.y, spriteName, 0) // starting frame = 0
        .setDepth(Constants.SORT_ORDER.characters)
        .setScale(2)
    })
    // Setup animations
    config.spriteNames.forEach((spriteName, i) => {
      const { frameRate, frameDurations, startFrame, endFrame } = config
      const frames = this.game.anims.generateFrameNumbers(
        spriteName,
        startFrame != null && endFrame != null
          ? {
              start: startFrame,
              end: endFrame,
            }
          : {}
      )
      // Makes debugging easier
      if (
        frameDurations != null &&
        endFrame != null &&
        startFrame != null &&
        frameDurations.length != endFrame - startFrame + 1
      )
        console.warn('Must define a duration (in ms) for each frame!')
      if (frameDurations == null && frameRate == null)
        console.warn('Must define frame rate or frame durations!')

      if (frameDurations != null)
        frameDurations.forEach((duration, i) => (frames[i].duration = duration))
      this.sprites[i].anims.create({
        key: AnimatedSprite.ANIMATION_KEY,
        frames: frames,
        frameRate: frameRate ?? 24,
      })

      this.sprites[i].on('animationstart', () => {
        this.boingSprite(this.sprites[i])
        if (i == 0) {
          this.frameListeners.forEach((fn) => fn(1))
        }
      })
      this.sprites[i].on('animationupdate', () => {
        this.boingSprite(this.sprites[i])
        if (i == 0) {
          this.frameListeners.forEach((fn) =>
            fn(this.sprites[0].anims.currentFrame.index)
          )
        }
      })
    })

    // Idle animation if sprite is a character
    if (config.isCharacter) {
      const originY = config.position.y
      this.idleTween = this.game.tweens.addCounter({
        from: -1,
        to: 1,
        duration: Math.random() * 2000 + 2000,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        onUpdate: (tween) => {
          this.sprites.forEach((sprite) =>
            sprite.setPosition(
              config.position.x,
              originY + tween.getValue() * 5
            )
          )
        },
      })
    }
  }

  // Make sprite go boing
  private boingSprite(sprite: Phaser.GameObjects.Sprite) {
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

  play(onComplete?: () => void, onUpdate?: (frame: number) => void) {
    if (onUpdate != null) this.frameListeners.push(onUpdate)
    this.sprites.forEach((sprite) => sprite.play(AnimatedSprite.ANIMATION_KEY))
    this.sprites[0].on('animationcomplete', () => {
      if (onComplete != null) onComplete()
      this.sprites[0].removeAllListeners('animationcomplete')

      if (this.destroyOnComplete)
        this.sprites.forEach((sprite) => sprite.destroy())

      if (onUpdate != null) {
        const index = this.frameListeners.indexOf(onUpdate)
        this.frameListeners.splice(index, 1)
      }
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

  flash() {
    this.sprites[0].setTintFill(0xffffff)
    this.game.time.delayedCall(100, () => {
      // Don't tint all sprites because rainbow dragon has custom tint on scales / eyes / outline
      this.sprites[0].clearTint()
    })
  }

  setMask(mask: Phaser.Display.Masks.BitmapMask) {
    this.sprites.forEach((sprite) => sprite.setMask(mask))
  }

  setFlipX(flipX: boolean) {
    this.sprites.forEach((sprite) => sprite.setFlipX(flipX))
  }

  addFrameListener(fn: (frame: number) => void) {
    this.frameListeners.push(fn)
  }
}
