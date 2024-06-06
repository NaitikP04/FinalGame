// Phaser: 3.70.0
// 

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    fps: { forceSetTimeOut: true, target: 60 },
    width: 1000,
    height: 1000,
    scene: [DungeonMap],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        }
    }
}

// Global variable to hold sprites
var my = {sprite: {}};

const game = new Phaser.Game(config);
