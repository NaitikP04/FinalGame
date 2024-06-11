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
    width: 400,
    height: 300,
    zoom: 2,
    scene: [Load, SampleScene],
    physics: {
        default: 'arcade',
        arcade: {   
            debug: true,
        }
    }
}

const game = new Phaser.Game(config);
