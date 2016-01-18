import scene, effects, communityart;

var LASER_SIZE = 76;
scene.registerConfig('betterLaser', {
  type: 'default',
  opts: {
    hitOpts: {
      radius: PLAYER_SIZE / 2
    },
    viewOpts: {
      url: 'resources/images/bullet2.png',
      offsetX: -LASER_SIZE / 2,
      offsetY: -LASER_SIZE / 2,
      width: LASER_SIZE - 19,
      height: LASER_SIZE
    }
  }
});

var PLAYER_SIZE = 100;
scene.registerConfig('betterSpaceship', {
  type: 'default',
  opts: {
    hitOpts: {
      radius: PLAYER_SIZE / 10
    },
    viewOpts: {
      url: 'resources/images/Fighter.png',
      offsetX: -PLAYER_SIZE / 2,
      offsetY: -PLAYER_SIZE / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE
    }
  }
});

var BOSS_SIZE = 200;
scene.registerConfig('betterEnemy', {
  type: 'default',
  opts: {
    hitOpts: {
      radius: BOSS_SIZE / 3
    },
    viewOpts: {
      url: 'resources/images/Enemy.png',
      offsetX: -BOSS_SIZE / 2,
      offsetY: -BOSS_SIZE / 2,
      width: BOSS_SIZE,
      height: BOSS_SIZE
    }
  }
});

/**
  * @requires scene x.x.x
  */
exports = scene(function() {

  // Add the background
  scene.addBackground(scene.getConfig('swarm/bg'));

  // Show the game score
  scene.showScore(10, 10);

  // Add the player
  var player = scene.addPlayer(scene.getConfig('betterSpaceship'), {
    zIndex: 50,
    //vy: -250,
    followTouches: { x: true, xMultiplier: 0.3, y:true ,yMultiplier: 0.3 },
    cameraFunction: scene.camera.fullyOn
  });
	player.showHitBounds();


  // Add the camera to follow the player
  //scene.camera.follow(player,
//    new scene.shape.Rect({
//      x: 0, y: scene.screen.height - 100,
//      width: scene.screen.width, height: scene.screen.height - 100
//    })
//  );

  // Make the spawners
  var enemies = scene.addGroup();
  var enemySpeeds = [100, 150, 200];
//  var enemySpawner = enemies.addSpawner(new scene.spawner.Timed(
//    new scene.shape.Line({ x: 30, y: -100, x2: scene.screen.width - 30 }),
//    function(x, y, index, spawner) {
//      var enemyType = randRangeI(3);
//      var enemy = enemies.addActor(scene.getConfig('swarm/enemy_type' + enemyType), {
//        x: x, y: y, vy: enemySpeeds[enemyType]
//      });
//      enemy.onEntered(scene.camera.bottomWall, function() { enemy.destroy(); });
//      spawner.spawnDelay = randRange(50, 500 - Math.min(index, 450));
//    }
//  ));

  var bullets = scene.addGroup();
  bullets.addSpawner(new scene.spawner.Timed(player,
    function (x, y, index) {
      var bullet = bullets.addActor(scene.getConfig('betterLaser'), { x: x, y: y, vy: -2500 });
      bullet.onEntered(scene.camera.topWall, function() { bullet.destroy(); });
    }, 75, true
  ));

  player.onDestroy(function() {
    effects.explode(player);
    effects.shake(GC.app);
    bullets.destroySpawners();
    bossTimer.destroy();
  });

  // Collision rules
  scene.onCollision(bullets, enemies, function(bullet, enemy) {
    effects.explode(enemy);
    enemy.destroy();
    bullet.destroy();
    scene.addScore(1);
  });

  scene.onCollision(player, enemies, function() { player.destroy(); });

  // Store the boss spawn timers on this
  var bossTimer;

  // Triggers the boss to come in from above and start animating
  var triggerBoss = function() {
//    enemySpawner.active = false;

    var boss = scene.addActor(scene.getConfig('betterEnemy'), {
      x: scene.camera.x + scene.camera.width / 2,
      y: scene.camera.y - 200,
      vy: player.vy / 2,
      health: 320
    });
		boss.showHitBounds();

	  // A function we call to send the boss flying left and right
		var loopBossMovement = function(boss) {
			if(boss.health > 240) {
				scene.animate(boss).clear()
					.then({ x: 300 }, 1000)
					.then(function() { loopBossMovement(boss); })
			}
			else if(boss.health > 160) {
				scene.animate(boss).clear()
					.then({ x: 00 }, 1000)
					.then({ x: scene.camera.width - 100 }, 1000)
					.then(function() { loopBossMovement(boss); });
			}
			else if (boss.health > 80) {
				scene.animate(boss).clear()
					.then({ x: 300 }, 1000)
					.then(function() { loopBossMovement(boss); });
			}
			 else {
				 scene.animate(boss).clear()
					.then({ x: 100 }, 1000)
					.then({ x: scene.camera.width - 100 }, 1000)
					.then(function() { loopBossMovement(boss); })
			 }
			};

		var bossBullets = scene.addGroup()
    var bossBulletSpawner = scene.addSpawner(new scene.spawner.Timed(boss, function(x, y, index) {
			if(boss.health > 240) {
				//zig zag pattern
				var bullet = bossBullets.addActor(scene.getConfig('swarm/particleCircle'), {
					x: x,
					y: y,
					vx: Math.sin(index / 5) * 200,
					vy: 300
				});
			bossBulletSpawner.spawnDelay = 50
			}
			else if(boss.health > 160) {
				//circle pattern
				var bulletCount = 60;
				var bulletDensity = Math.PI*2.5/bulletCount;
				for(var i = 0; i<bulletCount; i++) {
					bullet = bossBullets.addActor(scene.getConfig('swarm/particleCircle'), {
						x: x,
						y: y,
						vx: Math.sin(i * bulletDensity) * 200,
						vy: Math.cos(i * bulletDensity) * 200 + 20
					});
					bullet.onExited(scene.camera, function() { bullet.destroy(); });
				};
				bossBulletSpawner.spawnDelay = 800
			}
			else if(boss.health > 80) {
				//spiral pattern
				bullet = bossBullets.addActor(scene.getConfig('swarm/particleCircle'), {
					x: x,
					y: y,
					vx: Math.sin(index / 2) * 200,
					vy: Math.cos(index / 2) * 200,
				});
				bullet.onExited(scene.camera, function() { bullet.destroy(); });
				bossBulletSpawner.spawnDelay = 50;
			}
			else {
				//star pattern
				bulletCount = 80;
				var bulletDensity = (Math.PI*2.5/bulletCount);
				for(i = 0; i<bulletCount; i++) {
					var vel = Math.sin(i * bulletDensity * 5);
					vel = vel * vel +2
					bullet = bossBullets.addActor(scene.getConfig('swarm/particleCircle'), {
						x: x,
						y: y,
						vx: Math.sin(i * bulletDensity) * 200 * vel,
						vy: Math.cos(i * bulletDensity) * (200 * vel)+ player.vy
					});
					bullet.onExited(scene.camera, function() { bullet.destroy(); });
				};
				bossBulletSpawner.spawnDelay = 600;
			}

//      scene.onCollision(bullet, player, function() { player.destroy(); });
    }, 600, true));

    scene.animate(boss).clear()
      .then({ y: 100}, 5000)
      .then(function() { loopBossMovement(boss); });

	scene.onCollision (bossBullets, player, function(bossBullet) {player.destroy();})

    scene.onCollision(bullets, boss, function(bullet) {
      effects.explode(bullet, { scale: 0.5 });
      bullet.destroy();
      boss.hurt(1);
    });

    boss.onDestroy(function() {
      bossBullets.destroy();
      scene.animate(boss).clear();
      effects.explode(boss);
      effects.shake(GC.app);
//      enemySpawner.active = true;

      bossSpawnTime *= 1.5;
      bossTimer = scene.addTimeout(triggerBoss, bossSpawnTime);
    });

  };

  var bossSpawnTime = 1;//20 * 1000;
  bossTimer = scene.addTimeout(triggerBoss, bossSpawnTime);
});