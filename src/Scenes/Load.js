class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        // Load the visual assets
        this.load.path = './assets/';

        //player assets
        this.load.spritesheet('playerIdle', 'Player_Idle_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('playerRun', 'Player_Run_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('playerAttack', 'Player_Attack_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('playerDash', 'Player_Dash_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });

        //assassin boss assets
        this.load.spritesheet('assassinIdle', 'Assassin_Idle_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('assassinRun', 'Assassin_Run_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('assassinAttack', 'Assassin_Attack_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('assassinHit', 'Assassin_Hit_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('assassinDeath', 'Assassin_Death_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('assassinStun', 'Assassin_Stun_Outlined.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        // Load the tileset for enemies
        this.load.spritesheet('DungeonTileset', 'tilemap_packed.png', {
            frameWidth: 32,
            frameHeight: 32,
        });        
        // this.load.tilemapTiledJSON("map", "dungeonMap..tmj"); // Load JSON of tilemap  
        this.load.image('map', 'map-scroll.jpg')
  
    }

    create() {
        // Player idle animation
        this.anims.create({
            key: 'idle',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 7 }),
        });

        // Player run animation
        this.anims.create({
            key: 'run',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 7 }),
        });

        // Player attack animation
        this.anims.create({
            key: 'attack',
            frameRate: 30,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('playerAttack', { start: 0, end: 13 }),
        });

        // Player dash animation
        this.anims.create({
            key: 'dash',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('playerDash', { start: 0, end: 5 }),
        }); 

        // Assassin Boss animations
        // Assassin idle animation
        this.anims.create({
            key: 'assassinIdle',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('assassinIdle', { start: 0, end: 7 }),
        });

        // Assassin run animation
        this.anims.create({
            key: 'assassinRun',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('assassinRun', { start: 0, end: 7 }),
        });

        // Assassin attack animation 
        this.anims.create({
            key: 'assassinAttack',
            frameRate: 45,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('assassinAttack', { start: 0, end: 18 }),
        });

        this.anims.create({
            key: 'assassinHit',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('assassinHit', { start: 0, end: 8 }),
        });

        this.anims.create({
            key: 'assassinDeath',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('assassinDeath', { start: 0, end: 18 }),
        });

        this.anims.create({
            key: 'assassinStun',
            frameRate: 14.67,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('assassinStun', { start: 0, end: 21 }),
        });

        // Proceed once loading completes
        this.scene.start('sampleScene');
    }
}
