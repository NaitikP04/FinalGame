class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ghost'); // Use 'ghost' texture
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        this.hp = 15; // Adjust as needed

        this.debuffDuration = 2000; // Duration of the speed debuff in ms
        this.debuffSpeed = 50; // Speed of the player when debuffed
        this.chaseSpeed = 80; // Speed of the ghost when chasing the player
        this.attackRange = 20; // Range at which the ghost will attack the player

        this.setAlpha(0.8); // Opacity of the ghost

        // Initialize state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new GhostIdleState(),
            chase: new GhostChaseState(),
            attack: new GhostAttackState(),
        }, [scene, this]);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.scene.sound.play('hitMarker');
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    debuffPlayer(player) {
        console.log('Player debuffed!');
        const originalSpeed = 150;
        player.playerVelocity = this.debuffSpeed;

        this.scene.time.delayedCall(this.debuffDuration, () => {
            player.playerVelocity = originalSpeed;
            console.log('Player debuff expired!');
        });
    }

    update(time, delta) {
        // Update logic handled in SampleScene update method
    }
}

// State Classes for Ghost
class GhostIdleState extends State {
    enter(scene, ghost) {
        ghost.setVelocity(0);
    }

    execute(scene, ghost) {
        const player = scene.player;
        const distance = Phaser.Math.Distance.Between(ghost.x, ghost.y, player.x, player.y);

        if (distance > ghost.attackRange) {
            this.stateMachine.transition('chase');
        } else if (distance < ghost.attackRange) {
            ghost.setVelocity(0);
            this.stateMachine.transition('attack');
        }
    }
}

class GhostChaseState extends State {
    enter(scene, ghost) {
        // ghost.anims.play('ghostIdle', true); // Assuming you have a flying animation
    }

    execute(scene, ghost) {
        const player = scene.player;
        scene.physics.moveToObject(ghost, player, ghost.chaseSpeed);

        const distance = Phaser.Math.Distance.Between(ghost.x, ghost.y, player.x, player.y);

        // Flip ghost based on the direction
        if (player.x < ghost.x) {
            ghost.setFlipX(true);  // Facing left
        } else {
            ghost.setFlipX(false); // Facing right
        }

        if (distance < ghost.attackRange) {
            this.stateMachine.transition('attack');
        }
    }
}

class GhostAttackState extends State {
    enter(scene, ghost) {
        const player = scene.player;
        ghost.debuffPlayer(player);
        player.takeDamage(10); // Adjust damage as needed
        ghost.destroy();
    }
}
