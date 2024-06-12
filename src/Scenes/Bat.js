class Bat extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'DungeonTileset', 120); // Tile ID 120 for bat
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        this.attackCooldown = 2000; // Time between attacks in ms
        this.projectileSpeed = 200; // Speed of the projectiles
        this.chaseSpeed = 70; // Speed of the bat when chasing the player

        // Initialize state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new BatIdleState(),
            chase: new BatChaseState(),
            attack: new BatAttackState(),
        }, [scene, this]);

        this.startFloating();

        this.scene.time.addEvent({
            delay: this.attackCooldown,
            callback: this.shootProjectile,
            callbackScope: this,
            loop: true
        });

        
    }

    shootProjectile() {
        const player = this.scene.player;
        if (!player) return;

        const projectile = this.scene.physics.add.sprite(this.x, this.y, 'DungeonTileset', 101); // Using ghost sprite for projectile, can be changed
        this.scene.physics.moveToObject(projectile, player, this.projectileSpeed);

        this.scene.physics.add.collider(player, projectile, (player, projectile) => {
            player.takeDamage(10); // Adjust damage as needed
            projectile.destroy();
        });
    }

    startFloating() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10, // Adjust the value as needed for the floating effect
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 1000 // Adjust the value for speed of floating
        });
    }

    update(time, delta) {
        // this.stateMachine.step();
    }
}


// State Classes for Bat
class BatIdleState extends State {
    enter(scene, bat) {
        bat.setVelocity(0);
    }

    execute(scene, bat) {
        const player = scene.player;
        if (Phaser.Math.Distance.Between(bat.x, bat.y, player.x, player.y) < 300) {
            this.stateMachine.transition('chase');
        }
    }
}

class BatChaseState extends State {
    enter(scene, bat) {
        // bat.anims.play('batIdle', true); // Assuming you have a flying animation
    }

    execute(scene, bat) {
        const player = scene.player;
        scene.physics.moveToObject(bat, player, bat.chaseSpeed);

        if (Phaser.Math.Distance.Between(bat.x, bat.y, player.x, player.y) < 300) {
            this.stateMachine.transition('attack');
        }

        if (Phaser.Math.Distance.Between(bat.x, bat.y, player.x, player.y) > 300) {
            this.stateMachine.transition('idle');
        }
    }
}

class BatAttackState extends State {
    enter(scene, bat) {
        bat.shootProjectile();
        this.stateMachine.transition('idle');
    }
}