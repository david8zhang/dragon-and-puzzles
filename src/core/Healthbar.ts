import { Scene } from 'phaser'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export interface HealthbarConfig {
  position: {
    x: number
    y: number
  }
  length: number
  width: number
}
export class Healthbar {
  private scene: Scene

  private bar: Phaser.GameObjects.Graphics
  private entity: { health: number; maxHealth: number }
  private config: HealthbarConfig
  private text: Phaser.GameObjects.Text

  constructor(
    scene: Scene,
    config: HealthbarConfig,
    entity: { health: number; maxHealth: number }
  ) {
    this.scene = scene
    this.entity = entity
    this.config = config

    // Draw bar
    this.bar = new Phaser.GameObjects.Graphics(this.scene)
    this.bar.setDepth(Constants.SORT_ORDER.ui)
    this.scene.add.existing(this.bar)
    this.draw()

    const heart = this.scene.add
      .image(this.config.position.x + 10, this.config.position.y + 8, 'heart')
      .setTintFill(0xff0000)
      .setScale(0.5)
      .setDepth(Constants.SORT_ORDER.ui)

    this.text = this.scene.add
      .text(
        this.config.position.x + heart.displayWidth + config.length / 2,
        this.config.position.y + config.width + 5,
        `${this.entity.health}/${this.entity.maxHealth}`,
        {
          fontSize: '20px',
          color: 'white',
        }
      )
      .setStroke('black', 5)
      .setDepth(Constants.SORT_ORDER.ui)
      .setOrigin(0.5, 0)
  }

  toggleHealthText(isVisible: boolean) {
    this.text.setVisible(isVisible)
  }

  setVisible(isVisible) {
    this.text.setVisible(isVisible)
    this.bar.setVisible(isVisible)
  }

  draw(): void {
    this.bar.clear()
    const percentage = this.entity.health / this.entity.maxHealth
    const length = Math.max(0, Math.floor(percentage * this.config.length))
    this.bar.fillStyle(0x000000)

    if (this.text) {
      this.text.setText(`${this.entity.health}/${this.entity.maxHealth}`)
    }

    // Draw a black rectangle for healthbar BG
    this.bar.fillRect(
      this.config.position.x + 28,
      this.config.position.y - 2,
      this.config.length + 4,
      this.config.width + 4
    )

    if (percentage <= 0.33) {
      this.bar.fillStyle(0xff0000)
    } else if (percentage <= 0.67) {
      this.bar.fillStyle(0xf1c40f)
    } else {
      this.bar.fillStyle(0x2ecc71)
    }

    // Draw a colored rectangle to represent health
    this.bar.fillRect(
      this.config.position.x + 30,
      this.config.position.y,
      length,
      this.config.width
    )
  }
}
