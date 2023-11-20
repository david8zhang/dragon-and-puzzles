import { Game } from '~/scenes/Game'
import { Player } from './Player'
import { Board } from './Board'

export class TutorialPlayer extends Player {
  constructor(scene: Game, board: Board) {
    super(scene, board)
  }
}
