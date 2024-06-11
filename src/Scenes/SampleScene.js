//import Player from '../Prefabs/Player.js';

class SampleScene extends Phaser.Scene {
    constructor() {
        super("sampleScene");
    }

    create (){
        this.map = this.add.image(0, 0, 'map').setOrigin(0);
        this.player = new Player(this, 200, 150, 'playerIdle', 0);

        // Set up keyboard input
        this.keys = this.input.keyboard.createCursorKeys()

        //cams 
        this.cameras.main.setBounds(0, 0, this.map.width, this.map.height)
        this.cameras.main.startFollow(this.player, false, 0.5, .5)
        this.physics.world.setBounds(0, 0, this.map.width, this.map.height)
    }

    update (time, delta){
        this.stateMachine.step();
        // this.player.update(time, delta);
    }
}