// Phaser: 3.70.0
// 

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    fps: { forceSetTimeOut: true, target: 60 },
    width: 500,
    height: 300,
    zoom: 2,
    scene: [Load, GameStartScene, SampleScene, GameOverScene, GameWinScene],
    physics: {
        default: 'arcade',
        arcade: {   
            debug: false,
        }
    }
}

const game = new Phaser.Game(config);
