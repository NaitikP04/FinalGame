class SampleScene extends Phaser.Scene {
    constructor() {
        super("sampleScene");
        this.currentLayer = null;
        this.waveCounts = {
            ghost: 0,
            bat: 0,
            spider: 0,
            mixed: 0
        };
        this.currentWaveIndex = {
            ghost: 0,
            bat: 0,
            spider: 0,
            mixed: 0
        };
        this.waveConfigurations = {
            ghost: [
                { ghosts: 3, bats: 0, spiders: 0 },
                { ghosts: 5, bats: 2, spiders: 0 },
                { ghosts: 5, bats: 3, spiders: 0 },
                { ghosts: 6, bats: 1, spiders: 0 },
                { ghosts: 5, bats: 2, spiders: 1 }
            ],
            bat: [
                { ghosts: 0, bats: 2, spiders: 0 },
                { ghosts: 0, bats: 4, spiders: 0 },
                { ghosts: 0, bats: 4, spiders: 1 },
                { ghosts: 0, bats: 5, spiders: 1 },
                { ghosts: 0, bats: 5, spiders: 2 }
            ],
            spider: [
                { ghosts: 0, bats: 0, spiders: 3 },
                { ghosts: 0, bats: 1, spiders: 3 },
                { ghosts: 0, bats: 0, spiders: 5 },
                { ghosts: 0, bats: 2, spiders: 4 },
                { ghosts: 0, bats: 2, spiders: 3 }
            ],
            mixed: [
                { ghosts: 1, bats: 1, spiders: 1 },
                { ghosts: 1, bats: 2, spiders: 1 },
                { ghosts: 0, bats: 1, spiders: 1 },
                { ghosts: 2, bats: 1, spiders: 3 },
                { ghosts: 2, bats: 2, spiders: 3 }
            ]
        };
        this.isSpawning = false;
        this.assassinBoss = null; // Initialize to null
        this.isBackgroundMusicPlaying = false; 
        this.isBossMusicPlaying = false;
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

        // Spawn layers
        this.GhostLayer = this.map.createLayer('GhostLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.GhostLayer.setVisible(false);
        this.BatLayer = this.map.createLayer('BatLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.BatLayer.setVisible(false);
        this.SpiderLayer = this.map.createLayer('SpiderLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.SpiderLayer.setVisible(false);
        this.MixedLayer = this.map.createLayer('MixedLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.MixedLayer.setVisible(false);
        this.BossLayer = this.map.createLayer('BossLayer', [this.dungeonMapTiles, this.grassTiles, this.waterTiles, this.animatedWaterTiles], 0, 0);
        this.BossLayer.setVisible(false);

        // Set up collision by property
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.staticObjectLayer.setCollisionByProperty({ collides: true });
        this.layeringLayer.setCollisionByProperty({ collides: true });

        // Create objects from object layers
        this.revives = this.map.createFromObjects("Objects",{
            name: "Revive",
            key: "water-object-sheet",
            frame: 195
        });
        this.physics.world.enable(this.revives, Phaser.Physics.Arcade.STATIC_BODY)
        this.reviveGroup = this.add.group(this.revives);

        this.hpPotions = this.map.createFromObjects("Objects",{
            name: "HP",
            key: "dungeon-map-tiles",
            frame: 115
        });
        this.physics.world.enable(this.hpPotions, Phaser.Physics.Arcade.STATIC_BODY)
        this.hpPotionGroup = this.add.group(this.hpPotions);

        this.basicShurikens = this.map.createFromObjects("Objects",{
            name: "ShurikenBasic",
            key: "dungeon-map-tiles",
            frame: 91
        });
        this.physics.world.enable(this.basicShurikens, Phaser.Physics.Arcade.STATIC_BODY)

        this.upgradedShurikens = this.map.createFromObjects("Objects",{
            name: "ShurikenUpgrade",
            key: "dungeon-map-tiles",
            frame: 91
        });
        this.physics.world.enable(this.upgradedShurikens, Phaser.Physics.Arcade.STATIC_BODY)

        this.dash = this.map.createFromObjects("Objects",{
            name: "Dash",
            key: "dungeon-map-tiles",
            frame: 113
        });
        this.physics.world.enable(this.dash, Phaser.Physics.Arcade.STATIC_BODY)

        // Create player and boss
        this.player = new Player(this, 666, 1603, 'playerIdle', 0); // 5735 3761 near boss
        // this.assassinBoss = new AssassinBoss(this, 400, 150, 'assassinIdle', 0);

        //add colliders for the player and every layer
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.staticObjectLayer);
        this.physics.add.collider(this.player, this.layeringLayer);

        this.physics.add.overlap(this.player, this.GhostLayer, this.handleGhostLayerCollision, null, this);
        this.physics.add.overlap(this.player, this.BatLayer, this.handleBatLayerCollision, null, this);
        this.physics.add.overlap(this.player, this.SpiderLayer, this.handleSpiderLayerCollision, null, this);
        this.physics.add.overlap(this.player, this.MixedLayer, this.handleMixedLayerCollision, null, this);
        this.physics.add.overlap(this.player, this.BossLayer, this.handleBossLayerCollision, null, this);

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
        this.physics.add.collider(this.player, this.bats, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.bats, this.handleBatHitCollision, null, this);
        this.physics.add.collider(this.player.hitbox, this.ghosts, this.handleGhostHitCollision, null);
        this.physics.add.collider(this.player.hitbox, this.spiders, this.handleSpiderHitCollision, null, this);

        //Object collision handling
        this.physics.add.overlap(this.player, this.reviveGroup, (obj1, obj2) => {
            obj2.destroy();
            this.sound.play('revive');
            this.player.lives ++;
        });
        this.physics.add.overlap(this.player, this.hpPotionGroup, (obj1, obj2) => {
            obj2.destroy();
            this.sound.play('hpPickup');
            //increase hp by 20, if player if below 80, increase by 10 if player is 90, do nothing is player is full hp
            if (this.player.health <= 70) {
                this.player.health += 30;
            } else if (this.player.health <= 80) {
                this.player.health += 20;
            } else if (this.player.health <= 90) {
                this.player.health += 10;
            }
        });
        this.physics.add.overlap(this.player, this.basicShurikens, (obj1, obj2) => {
            obj2.destroy();
            this.player.unlockShuriken();
            this.sound.play('shurikenBasic');
        });
        this.physics.add.overlap(this.player, this.upgradedShurikens, (obj1, obj2) => {
            obj2.destroy();
            this.player.upgradeShuriken();
            this.sound.play('shurikenUpgraded');
        });
        this.physics.add.overlap(this.player, this.dash, (obj1, obj2) => {
            obj2.destroy();
            this.player.unlockDash();
            this.sound.play('dash');
        });

        this.inGhostLayer = false;
        this.inBatLayer = false;
        this.inSpiderLayer = false;
        this.inMixedLayer = false;
        this.inBossLayer = false;

        this.timeSinceLastSpawn = 0;
        this.timeSinceLastSpawn = 0;
        this.spawnDelay = 5000; // Delay between waves in milliseconds

        //skip mode 
        // Add the "U" key for skip mode
        this.keys.u = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);

        // Add a listener for the "U" key
        this.keys.u.on('down', () => {
            this.activateSkipMode();
        });

        if (this.isBossMusicPlaying){
            this.sound.stopByKey('bossMusic');
            this.isBossMusicPlaying = false;
        }
        // Play background music
        if (!this.isBackgroundMusicPlaying) {
            this.backgroundMusic = this.sound.add('backgroundMusic', { volume: 0.5, loop: true });
            this.backgroundMusic.play();
            this.isBackgroundMusicPlaying = true;
        }
    }

    activateSkipMode() {
        this.player.lives++;
        this.player.health = this.player.maxHealth;
        this.player.unlockDash();
        this.player.unlockShuriken();
        this.player.upgradeShuriken();
        this.player.x = 5720; // Teleport player near the boss
        this.player.y = 3838;
    }

    handleBatHitCollision(hitbox, bat) {
        if (bat.takeDamage) {
            bat.takeDamage(20);  // Adjust damage as needed
        } else {
            console.warn("Bat does not have takeDamage method");
        }
    }
    
    handleSpiderHitCollision(hitbox, spider) {
        if (spider.takeDamage) {
            spider.takeDamage(20);  // Adjust damage as needed
        } else {
            console.warn("Spider does not have takeDamage method");
        }
    }

    handleGhostHitCollision(hitbox, ghost) {
        if (ghost.takeDamage) {
            ghost.takeDamage(20);  // Adjust damage as needed
        } else {
            console.warn("Ghost does not have takeDamage method");
        }
    }

    handlePlayerBossCollision(player, boss) {
        if (player.takeDamage) {
            player.takeDamage(10);  // Adjust damage as needed
        } else {
            console.warn("Player does not have takeDamage method");
        }
    }

    handleBossAttackCollision(hitbox, boss) {
        if (boss.takeDamage) {
            boss.takeDamage(10);  // Adjust damage as needed
        } else {
            console.warn("Boss does not have takeDamage method");
        }
    }

    handleGhostLayerCollision(player, tile) {
        if (tile && tile.properties && tile.properties.SpawnTiles) {
            if (!this.inGhostLayer) {
                this.inGhostLayer = true;
                this.inBatLayer = false;
                this.inSpiderLayer = false;
                this.inMixedLayer = false;
                this.inBossLayer = false;
                this.startSpawning('ghost');
            }
        }
    }

    handleBatLayerCollision(player, tile) {
        if (tile && tile.properties && tile.properties.SpawnTiles) {
            if (!this.inBatLayer) {
                this.inGhostLayer = false;
                this.inBatLayer = true;
                this.inSpiderLayer = false;
                this.inMixedLayer = false;
                this.inBossLayer = false;
                this.startSpawning('bat');
            }
        }
    }

    handleSpiderLayerCollision(player, tile) {
        if (tile && tile.properties && tile.properties.SpawnTiles) {
            if (!this.inSpiderLayer) {
                this.inGhostLayer = false;
                this.inBatLayer = false;
                this.inSpiderLayer = true;
                this.inMixedLayer = false;
                this.inBossLayer = false;
                this.startSpawning('spider');
            }
        }
    }

    handleMixedLayerCollision(player, tile) {
        if (tile && tile.properties && tile.properties.SpawnTiles) {
            if (!this.inMixedLayer) {
                this.inGhostLayer = false;
                this.inBatLayer = false;
                this.inSpiderLayer = false;
                this.inMixedLayer = true;
                this.inBossLayer = false;
                this.startSpawning('mixed');
            }
        }
    }

    handleBossLayerCollision(player, tile) {
        if (tile && tile.properties && tile.properties.SpawnTiles) {
            if (!this.inBossLayer) {
                this.inGhostLayer = false;
                this.inBatLayer = false;
                this.inSpiderLayer = false;
                this.inMixedLayer = false;
                this.inBossLayer = true;
                this.spawnBoss();
            }
        }
    }

    startSpawning(layerType) {
        this.currentLayer = layerType;
        this.isSpawning = true;
        if (!this.waveIndex) {
            this.waveIndex = {
                'ghost': 0,
                'spider': 0,
                'bat': 0,
                'mixed': 0,
                'boss': 0
            };
        }
    
        this.spawnWave();
        console.log(`Entering ${layerType} Layer and starting wave ${this.waveIndex[layerType] + 1}`)
    }

    stopSpawning() {
        this.isSpawning = false;
        // this.timeSinceLastSpawn = 0;
        console.log(`Stopping spawning in ${this.currentLayer} Layer`);
    }

    spawnWave() {
        if (!this.isSpawning) return;

        const waveIndex = this.waveIndex[this.currentLayer];
        if (waveIndex < this.waveConfigurations[this.currentLayer].length) {
            const wave = this.waveConfigurations[this.currentLayer][waveIndex];
            console.log(`Spawning wave ${waveIndex + 1} in ${this.currentLayer} Layer`);
            this.spawnEnemies(wave);
            this.waveIndex[this.currentLayer]++;
            this.timeSinceLastSpawn = 0;
        } else {
            console.log(`Finished all waves in ${this.currentLayer} Layer`);
            this.stopSpawning();
        }
    }

    spawnEnemies(wave) {
        const spawnEnemy = (type, count, delay) => {
            if (count > 0) {
                let spawnedCount = 0;
                const spawnEvent = this.time.addEvent({
                    delay: delay,
                    callback: () => {
                        const x = Phaser.Math.Between(this.player.x - 400, this.player.x + 400);
                        const y = Phaser.Math.Between(this.player.y - 400, this.player.y + 400);
                        let enemy;
                        if (type === 'bat') {
                            enemy = new Bat(this, x, y);
                            this.bats.add(enemy);
                        } else if (type === 'ghost') {
                            enemy = new Ghost(this, x, y);
                            this.ghosts.add(enemy);
                        } else if (type === 'spider') {
                            enemy = new Spider(this, x, y);
                            this.spiders.add(enemy);
                        }
                        if (enemy) {
                            this.add.existing(enemy);
                            this.physics.add.existing(enemy);
                        }
    
                        spawnedCount++;
                        if (spawnedCount >= count) {
                            spawnEvent.remove();
                        }
                    },
                    repeat: count - 1
                });
            }
        };
    
        const enemySpawnDelay = 750; // Delay between each enemy spawn in milliseconds
    
        spawnEnemy('ghost', wave.ghosts, enemySpawnDelay);
        spawnEnemy('bat', wave.bats, enemySpawnDelay);
        spawnEnemy('spider', wave.spiders, enemySpawnDelay);
    
        this.timeSinceLastSpawn = 0;
    }
    
    
    

    update(time, delta) {
        this.player.update(time, delta);
        this.player.stateMachine.step();
        if (this.assassinBoss  &&  this.assassinBoss.hp > 0) {
            this.assassinBoss.update(time, delta);
            this.assassinBoss.stateMachine.step();
        }

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

        if (this.isSpawning) {
            this.timeSinceLastSpawn += delta;
            if (this.timeSinceLastSpawn >= this.spawnDelay) {
                this.spawnWave();
                this.timeSinceLastSpawn = 0;
            }
        }
    }

    spawnBoss() {
        this.stopSpawning();
        if (!this.assassinBoss) {
            this.assassinBoss = new AssassinBoss(this, 6885.666666666669, 4258.807118745772, 'assassinIdle', 0);
            this.add.existing(this.assassinBoss);
            this.backgroundMusic.stop();
            this.isBackgroundMusicPlaying = false;
            this.sound.play('bossSpawn', { volume: 0.6 });
            this.physics.add.existing(this.assassinBoss);
            this.physics.add.collider(this.player, this.assassinBoss.attackHitbox, this.handlePlayerBossCollision, null, this);
            this.physics.add.collider(this.player.hitbox, this.assassinBoss, this.handleBossAttackCollision, null, this);
            this.physics.add.collider(this.player.hitbox, this.assassinBoss.attackHitbox, this.handleBossAttackCollision, null, this);
            console.log("Assassin Boss spawned");
            // delayed call to start playing boss music after boss spawns
            this.time.delayedCall(11500, () => {
                this.sound.play('bossMusic', { volume: 0.6, loop: true });
                this.isBossMusicPlaying = true;
            });
        }
    }
}
