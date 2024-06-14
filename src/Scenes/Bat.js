class Bat extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bat'); // Use 'bat' texture
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        this.hp = 10; // Adjust as needed

        this.attackCooldown = 3500; // Time between attacks in ms
        this.projectileSpeed = 200; // Speed of the projectiles
        this.chaseSpeed = 80; // Speed of the bat when chasing the player
        this.attackRange = 250; // Range at which the bat will attack the player
        this.lastShotTime = 0; // Initialize the last shot time

        // Initialize state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new BatIdleState(),
            chase: new BatChaseState(),
            attack: new BatAttackState(),
        }, [scene, this]);

        this.startFloating();

        this.scene.time.addEvent({
            delay: this.attackCooldown,
            callback: this.resetShotCooldown,
            callbackScope: this,
            loop: true
        });
    }

    resetShotCooldown() {
        this.canShoot = true;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.scene.sound.play('hitMarker');
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    shootProjectile() {
        const player = this.scene.player;
        if (!player || !this.canShoot) return;

        this.canShoot = false; // Prevent shooting again until cooldown is reset
        this.lastShotTime = this.scene.time.now;

        const projectile = this.scene.physics.add.sprite(this.x, this.y, 'batAttack1'); 
        projectile.setSize(10, 10); // Adjust size as needed
        projectile.setScale(1.5); // Adjust scale as needed
        projectile.play('batProjectileAnim')
        this.scene.physics.moveToObject(projectile, player, this.projectileSpeed);

        this.scene.physics.add.collider(player, projectile, (player, projectile) => {
            player.takeDamage(10); // Adjust damage as needed
            projectile.destroy();
        });
    }

    startFloating() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 15, 
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 500 
        });
    }

    update(time, delta) {
    }
}

// State Classes for Bat
class BatIdleState extends State {
    enter(scene, bat) {
        bat.setVelocity(0);
    }

    execute(scene, bat) {
        const player = scene.player;
        if (Phaser.Math.Distance.Between(bat.x, bat.y, player.x, player.y) > bat.attackRange) {
            this.stateMachine.transition('chase');
        }
        else if (Phaser.Math.Distance.Between(bat.x, bat.y, player.x, player.y) < bat.attackRange) {
            bat.setVelocity(0);
            this.stateMachine.transition('attack');
        }
    }
}

class BatChaseState extends State {
    enter(scene, bat) {

    }

    execute(scene, bat) {
        const player = scene.player;
        scene.physics.moveToObject(bat, player, bat.chaseSpeed);

        if (Phaser.Math.Distance.Between(bat.x, bat.y, player.x, player.y) < bat.attackRange) {
            this.stateMachine.transition('attack');
        }
    }
}

class BatAttackState extends State {
    enter(scene, bat) {
        const currentTime = scene.time.now;
        if (currentTime - bat.lastShotTime > bat.attackCooldown) {
            bat.shootProjectile();
            bat.lastShotTime = currentTime;
        }
        this.stateMachine.transition('chase');
    }
}