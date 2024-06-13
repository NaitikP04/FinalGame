
class SampleScene extends Phaser.Scene {
    constructor() {
        super("sampleScene");
    }

    create() {
        // Load the tilemap
        this.map = this.add.tilemap('dungeon_map', 16, 16);

        // Add the tilesets to the map
        this.dungeonMapTiles = this.map.addTilesetImage('dungeon-map', 'dungeon-tiles');
        this.grassTiles = this.map.addTilesetImage('spr_grass_tileset', 'spr_grass_tileset');
        this.waterTiles = this.map.addTilesetImage('water', 'water');
        this.animatedWaterTiles = this.map.addTilesetImage('water-tiles', 'water-tiles');

        // Create the layers
        this.groundLayer = this.map.createLayer('Ground', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.staticObjectLayer = this.map.createLayer('StaticObjects', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.layeringLayer = this.map.createLayer('layering', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.bridgeWaterLayer = this.map.createLayer('BridgeWaterLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.bridgeLayer = this.map.createLayer('BridgeLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);


        // Set up collision by property
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.staticObjectLayer.setCollisionByProperty({ collides: true });
        this.layeringLayer.setCollisionByProperty({ collides: true });


        // Create player and boss
        this.player = new Player(this, 550, 1532, 'playerIdle', 0);
        this.assassinBoss = new AssassinBoss(this, 400, 150, 'assassinIdle', 0);

        //add colliders for the player and every layer
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.staticObjectLayer);
        this.physics.add.collider(this.player, this.layeringLayer);

        this.bats = this.physics.add.group();
        this.ghosts = this.physics.add.group();
        this.spiders = this.physics.add.group();

        // Set up keyboard input
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.c = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keys.p = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);


        // Set up camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, false, 0.5, 0.5);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.physics.world.setBoundsCollision(true, true, true, true);

        // Set up collision between player and boss
        this.physics.add.collider(this.player, this.assassinBoss.attackHitbox, this.handlePlayerBossCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.assassinBoss, this.handleBossAttackCollision, null, this);
        this.physics.add.collider(this.player, this.bats, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.bats, this.handleBatHitCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.ghosts, this.handleGhostHitCollision, null);
        this.physics.add.collider(this.player.hitbox, this.spiders, this.handleSpiderHitCollision, null, this);
    }

    handlePlayerBossCollision(player) {
        player.takeDamage(this.assassinBoss.attackPower);
    }

    handleBossAttackCollision() {
        this.assassinBoss.takeDamage(20);
    }

    handlePlayerEnemyCollision(player, enemy) {
        player.takeDamage(10);
    }

    handleBatHitCollision(hitbox, bat) {
        bat.takeDamage(20);
    }

    handleGhostHitCollision(hitbox, ghost) {
        ghost.takeDamage(20);
    }

    handleSpiderHitCollision(hitbox, spider) {
        spider.takeDamage(20);
    }

    handleShurikenHitEnemy(shuriken, enemy) {
        enemy.takeDamage(shuriken.damage);
        shuriken.piercing -= 1;
        if (shuriken.piercing <= 0) {
            shuriken.destroy();
        }
    }
    
    update(time, delta) {
        this.player.update(time, delta);
        this.player.stateMachine.step();
        this.assassinBoss.update(time, delta);
        this.assassinBoss.stateMachine.step();

        if (Phaser.Input.Keyboard.JustDown(this.keys.p)) {
            console.log(`Player position: x=${this.player.x}, y=${this.player.y}`);
        }

        // Update and step state machine for each bat
        Phaser.Actions.Call(this.bats.getChildren(), bat => {
            bat.update(time, delta);
            bat.stateMachine.step();
        });

        Phaser.Actions.Call(this.ghosts.getChildren(), ghost => {
            ghost.update(time, delta);
            ghost.stateMachine.step();
        });

        Phaser.Actions.Call(this.spiders.getChildren(), spider => {
            spider.update(time, delta);
            spider.stateMachine.step();
        });
    }
}

