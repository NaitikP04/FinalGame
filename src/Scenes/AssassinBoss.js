class AssassinBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.health = 100;
        this.attackPower = 10;
        this.isStunned = false;
        this.hurtTimer = 250; // in ms
        this.stunDuration = 1500; // in ms
        this.attackRange = 40;
        this.followSpeed = 85;
        this.stunCooldown = 15000; // Cooldown period for stun
        this.canBeStunned = true; // Flag to check if the boss can be stunned
        this.isHurt = false;
        this.setTint(0x00ff00);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        // Create attack hitbox
        this.attackHitbox = scene.add.rectangle(x, y+5, 60, 15, 0xff0000, 0);
        scene.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.enable = false;

        // Initialize state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new BossIdleState(),
            chase: new BossChaseState(),
            attack: new BossAttackState(),
            stun: new BossStunState(),
            death: new BossDeathState(),
        }, [scene, this]);
    }

    update(time, delta) {
        this.attackHitbox.x = this.x;
        this.attackHitbox.y = this.y+5;
    }

    takeDamage(amount) {
        if (!this.isHurt) {
            this.health -= amount;
            this.isHurt = true;
            this.setTint(0xff0000); // Flash red
            if (this.health <= 0) {
                this.stateMachine.transition('death');
            }
            this.scene.time.delayedCall(this.hurtTimer, () => {
                this.clearTint();
                this.isHurt = false;
            });

            if (!this.isStunned && this.canBeStunned) {
                this.stateMachine.transition('stun');
                this.canBeStunned = false;
                this.clearTint();
                this.scene.time.delayedCall(this.stunCooldown, () => {
                    this.canBeStunned = true;
                    this.setTint(0x00ff00);
                });
            }  
        }
    }

}

// State Classes for AssassinBoss
class BossIdleState extends State {
    enter(scene, boss) {
        boss.setVelocity(0);
        boss.setFlipX(true);
        boss.anims.play('assassinIdle', true);
    }

    execute(scene, boss) {
        const player = scene.player;
        if (Phaser.Math.Distance.Between(boss.x, boss.y, player.x, player.y) < 200) {
            this.stateMachine.transition('chase');
        }
    }
}

class BossChaseState extends State {
    execute(scene, boss) {
        if (boss.health <= 0) {
            this.stateMachine.transition('death');
        }
        const player = scene.player;
        scene.physics.moveToObject(boss, player, boss.followSpeed);
        boss.anims.play('assassinRun', true);

        // Flip the sprite based on the direction
        if (player.x < boss.x) {
            boss.setFlipX(true);  // Facing left
        } else {
            boss.setFlipX(false); // Facing right
        }
        if (Phaser.Math.Distance.Between(boss.x, boss.y, player.x, player.y) < boss.attackRange) {
            this.stateMachine.transition('attack');
        }
    }
}

class BossAttackState extends State {
    enter(scene, boss) {
        boss.setVelocity(0);
        boss.anims.play('assassinAttack');
        boss.attackHitbox.body.enable = true; // Enable attack hitbox
        boss.once('animationcomplete', () => {
            boss.attackHitbox.body.enable = false; // Disable attack hitbox
            this.stateMachine.transition('chase');
        });
    }
}

class BossStunState extends State {
    enter(scene, boss) {
        boss.setVelocity(0);
        boss.isStunned = true;
        boss.setTint(0xaaaaaa);
        boss.anims.play('assassinStun');

        scene.time.delayedCall(boss.stunDuration, () => {
            boss.clearTint();
            boss.isStunned = false;
            this.stateMachine.transition('chase');
        });
    }
}

class BossDeathState extends State {
    enter(scene, boss) {
        boss.setVelocity(0);
        boss.anims.play('assassinDeath');
        boss.once('animationcomplete', () => {
            boss.destroy();
        });
    }
}
