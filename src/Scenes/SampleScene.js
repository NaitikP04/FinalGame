class SampleScene extends Phaser.Scene {
    constructor() {
        super("sampleScene");
    }

    create() {
        // Add map
        this.map = this.add.image(0, 0, 'map').setOrigin(0);

        // Create player and boss
        this.player = new Player(this, 200, 150, 'playerIdle', 0);
        this.assassinBoss = new AssassinBoss(this, 400, 150, 'assassinIdle', 0);

        this.bats = this.physics.add.group();

        // Create bats
        this.bats.add(new Bat(this, 500, 300));
        
        // Set up keyboard input
        this.keys = this.input.keyboard.createCursorKeys();

        // Set up camera
        this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
        this.cameras.main.startFollow(this.player, false, 0.5, 0.5);
        this.physics.world.setBounds(0, 0, this.map.width, this.map.height);

        // Set up collision between player and boss
        this.physics.add.collider(this.player, this.assassinBoss.attackHitbox, this.handlePlayerBossCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.assassinBoss, this.handleBossAttackCollision, null, this);
        this.physics.add.collider(this.player, this.bats, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.bats, this.handleBatHitCollision, null, this);

    }

    handlePlayerBossCollision(player, boss) {
        player.takeDamage(boss.attackPower);
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
    
    update(time, delta) {
        this.player.update(time, delta);
        this.player.stateMachine.step();
        this.assassinBoss.update(time, delta);
        this.assassinBoss.stateMachine.step();

        // Update and step state machine for each bat
        Phaser.Actions.Call(this.bats.getChildren(), bat => {
            bat.update(time, delta);
            bat.stateMachine.step();
        });
    }
}