"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300)")
        .attr('angle', 0)
        .attr('velocity', 1)
        .attr('maxVelocity', 6)
        .attr('acceleration', 0.1);
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr('x', 300)
        .attr('y', 300)
        .attr("style", "fill:white;stroke:white;stroke-width:1");
    const stats = {
        score: 0,
        level: 1,
        lives: 3,
        invincible: false,
        hit: false,
        win: false,
        gameOver: false
    };
    const toDegrees = (radians) => -(radians * 180 / Math.PI) + 180, toRadians = (degrees) => (degrees * Math.PI / 180) - Math.PI / 2, addDirection = (xChange, yChange) => ship.attr('x', Number(ship.attr('x')) + xChange).attr('y', Number(ship.attr('y')) + yChange), outOfBoundX = (x) => (x > svg.getBoundingClientRect().right || x < 0), outOfBoundY = (y) => (y > svg.getBoundingClientRect().bottom) || (y < 0), gameOverScreen = () => (svg.remove(), document.getElementById("gameOver").innerHTML = "<h1>GAME OVER!</h1>"), checkShipCollision = (asteroid) => Math.sqrt(Math.pow(Number(asteroid.attr('cx')) - Number(ship.attr('x')), 2) + Math.pow(Number(asteroid.attr('cy')) - Number(ship.attr('y')), 2)) < 80 ? true : false, invincibleShip = () => Observable.interval(100)
        .takeUntil(Observable.interval(1500).map(() => (stats.lives -= 1, stats.invincible = false, stats.hit = false, ship.attr('style', "fill:white;stroke:white;stroke-width:1"))))
        .map(() => ship.attr('style', "fill:yellow;stroke:white;stroke-width:1"))
        .subscribe(() => stats.invincible = true), reduceLives = () => (invincibleShip(), ship.attr('x', 300).attr('y', 300)), bulletCollidesAsteroidX = (bullet, asteroid) => Number(bullet.attr('x')) > (Number(asteroid.attr('cx')) - Number(asteroid.attr('r'))) && Number(bullet.attr('x')) < (Number(asteroid.attr('cx')) + Number(asteroid.attr('r')))
        ? true : false, bulletCollidesAsteroidY = (bullet, asteroid) => Number(bullet.attr('y')) > (Number(asteroid.attr('cy')) - Number(asteroid.attr('r'))) && Number(bullet.attr('y')) < (Number(asteroid.attr('cy')) + Number(asteroid.attr('r')))
        ? true : false, spawnAsteroidX = (x, spawnPoint, spawnRadius) => x < (spawnPoint - spawnRadius) || x > (spawnPoint + spawnRadius) ? x : spawnAsteroidX(Math.floor(Math.random() * svg.getBoundingClientRect().right), spawnPoint, spawnRadius), spawnAsteroidY = (y, spawnPoint, spawnRadius) => y < (spawnPoint - spawnRadius) || y > (spawnPoint + spawnRadius) ? y : spawnAsteroidY(Math.floor(Math.random() * svg.getBoundingClientRect().bottom), spawnPoint, spawnRadius), checkBulletCollisions = (bullet, array, index) => index == 0 ? null : bulletCollidesAsteroidX(bullet, array[index - 1]) && bulletCollidesAsteroidY(bullet, array[index - 1])
        ? index : checkBulletCollisions(bullet, array, index - 1), asteroidsInBoundX = (asteroid) => Number(asteroid.attr('cx')) - Number(asteroid.attr('r')) > svg.getBoundingClientRect().right
        ? asteroid.attr('cx', -Number(asteroid.attr('r')))
        : Number(asteroid.attr('cx')) + Number(asteroid.attr('r')) < 0 ? asteroid.attr('cx', svg.getBoundingClientRect().right + Number(asteroid.attr('r')))
            : null, asteroidsInBoundY = (asteroid) => Number(asteroid.attr('cy')) - Number(asteroid.attr('r')) > svg.getBoundingClientRect().bottom
        ? asteroid.attr('cy', -Number(asteroid.attr('r')))
        : Number(asteroid.attr('cy')) + Number(asteroid.attr('r')) < 0 ? asteroid.attr('cy', svg.getBoundingClientRect().bottom + Number(asteroid.attr('r')))
            : null, scoreElement = document.getElementById("score"), livesElement = document.getElementById("lives");
    let asteroids_array = [];
    let smallAsteroidCount = 0;
    let generateRate = 20;
    let spawnRadius = 100;
    let arrayObservable = Observable.fromArray(asteroids_array);
    let breakAsteroidObservable = Observable.interval(10).map(() => { smallAsteroidCount; });
    const gameloop = Observable.interval(10).map(() => { stats; }), gamestate = Observable.interval(20)
        .map(() => livesElement.innerHTML = "<h4>lives : " + ("&#10084").repeat(stats.lives < 0 ? 0 : stats.lives) + "</h4>")
        .map(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ? stats.lives <= 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null : null))
        .map(() => scoreElement.innerHTML = "<h4>Score : " + stats.score + " </h4>")
        .takeUntil(gameloop.filter(() => stats.gameOver == true || stats.win == true)), mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup'), keyup = Observable.fromEvent(document, 'keyup'), moveup = Observable.fromEvent(document, 'keydown')
        .filter(({ keyCode }) => keyCode == 38), shoot = Observable.fromEvent(svg, 'mousedown')
        .map(() => smallAsteroidCount = 0)
        .map(() => { stats; })
        .map(() => ({ bullets: new Elem(svg, 'g')
            .attr('transform', "translate(" + ship.attr('x') + ',' + ship.attr('y') + ")")
            .attr('xDirection', (Math.cos(toRadians(Number(g.attr('angle')))) * 5))
            .attr('yDirection', (Math.sin(toRadians(Number(g.attr('angle')))) * 5)),
    }))
        .map(({ bullets }) => ({ bullet: new Elem(svg, 'circle', bullets.elem)
            .attr('x', ship.attr('x'))
            .attr('y', ship.attr('y'))
            .attr('hit', 'false')
            .attr('style', "fill:white;stroke:white;r:1"), bullets: bullets }));
    mousemove
        .map(({ clientX, clientY }) => ({ shipX: ship.attr('x'),
        shipY: ship.attr('y'),
        rotateX: clientX - svg.getBoundingClientRect().left - Number(ship.attr('x')),
        rotateY: clientY - svg.getBoundingClientRect().top - Number(ship.attr('y')) }))
        .subscribe(({ shipX, shipY, rotateX, rotateY }) => g.attr("transform", "translate(" + shipX + "," + shipY + ") rotate(" + toDegrees(Math.atan2(rotateX, rotateY)) + ")")
        .attr('angle', toDegrees(Math.atan2(rotateX, rotateY))));
    moveup
        .map(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ? stats.lives <= 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null : null))
        .flatMap(() => gamestate
        .takeUntil(moveup.takeUntil(keyup))
        .takeUntil(keyup)
        .map(() => Number(g.attr('velocity')) < Number(g.attr('maxVelocity')) ? g.attr('velocity', Number(g.attr('velocity')) + Number(g.attr('acceleration'))) : g.attr('velocity', Number(g.attr('maxVelocity'))))
        .map(() => ({ xDirection: Math.cos(toRadians(Number(g.attr('angle')))) * Number(g.attr('velocity')),
        yDirection: Math.sin(toRadians(Number(g.attr('angle')))) * Number(g.attr('velocity')) }))
        .map(({ xDirection, yDirection }) => addDirection(xDirection, yDirection)))
        .map(() => (Number(ship.attr('x')) > svg.getBoundingClientRect().right ?
        ship.attr('x', 0) : Number(ship.attr('x')) < 0 ? ship.attr('x', svg.getBoundingClientRect().right) : null,
        Number(ship.attr('y')) > 600 ?
            ship.attr('y', 0) : Number(ship.attr('y')) < 0 ? ship.attr('y', 600) : null))
        .subscribe(() => g.attr("transform", "translate(" + ship.attr('x') + "," + ship.attr('y') + ") rotate(" + g.attr('angle') + ")"));
    keyup
        .subscribe(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ? stats.lives < 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null : null));
    const asteroidObservable = Observable.interval(generateRate)
        .map(() => ({
        asteroid: new Elem(svg, 'circle')
            .attr('cx', spawnAsteroidX(Math.floor(Math.random() * svg.getBoundingClientRect().right), 300, spawnRadius))
            .attr('cy', spawnAsteroidY(Math.floor(Math.random() * svg.getBoundingClientRect().bottom), 300, spawnRadius))
            .attr("r", Math.floor(Math.random() * (60 - 30) + 30))
            .attr('smallAsteroid', 'false')
            .attr('style', "fill:none;stroke:white;stroke-width:1")
            .attr('xDirection', Math.cos(toRadians(Math.floor(Math.random() * 360))))
            .attr('yDirection', Math.sin(toRadians(Math.floor(Math.random() * 360))))
    }));
    asteroidObservable
        .takeUntil(Observable.interval(200))
        .subscribe(({ asteroid }) => asteroids_array.push(asteroid));
    gamestate
        .flatMap(() => Observable.fromArray(asteroids_array)
        .forEach((element) => element
        .attr('cx', Number(element.attr('cx')) + Number(element.attr('xDirection')))
        .attr('cy', Number(element.attr('cy')) + Number(element.attr('yDirection'))))
        .forEach((element) => (asteroidsInBoundX(element), asteroidsInBoundY(element))))
        .subscribe(() => null);
    let breakIntoSmallerAsteroid = (element) => breakAsteroidObservable
        .map(() => ({
        x: Number(element.attr('cx')),
        y: Number(element.attr('cy')),
        spawnSmallRadius: 20
    }))
        .map(({ x, y, spawnSmallRadius }) => ({
        asteroid: new Elem(svg, 'circle', new Elem(svg, 'g').elem)
            .attr('cx', Math.floor(Math.random() * ((x + spawnSmallRadius) - (x - spawnSmallRadius)) + (x - spawnSmallRadius)))
            .attr('cy', Math.floor(Math.random() * ((y + spawnSmallRadius) - (y - spawnSmallRadius)) + (y - spawnSmallRadius)))
            .attr("r", Math.floor(Math.random() * (30 - 20) + 20))
            .attr('smallAsteroid', 'true')
            .attr('style', "fill:none;stroke:red;stroke-width:1")
            .attr('xDirection', Math.cos(toRadians(Math.floor(Math.random() * 360))))
            .attr('yDirection', Math.sin(toRadians(Math.floor(Math.random() * 360))))
    }))
        .map(({ asteroid }) => (asteroids_array.push(asteroid), console.log(asteroid.attr('cx'), asteroid.attr('cy'))))
        .takeUntil(breakAsteroidObservable.filter(() => smallAsteroidCount == 4))
        .subscribe(() => smallAsteroidCount += 1);
    shoot
        .flatMap(({ bullet, bullets }) => Observable.interval(5)
        .filter(() => !(outOfBoundX(Number(bullet.attr('x'))) || outOfBoundY(Number(bullet.attr('y')))))
        .forEach(() => bullet.attr('x', Number(bullet.attr('x')) + Number(bullets.attr('xDirection')))
        .attr('y', Number(bullet.attr('y')) + Number(bullets.attr('yDirection'))))
        .map(() => bullets.attr('transform', 'translate(' + bullet.attr('x') + ',' + bullet.attr('y') + ')'))
        .map(() => ({ bullet: bullet })))
        .flatMap(({ bullet }) => arrayObservable
        .map((element) => bulletCollidesAsteroidX(bullet, element) && bulletCollidesAsteroidY(bullet, element) ? element : null)
        .map((element) => element != null
        ?
            element.attr('smallAsteroid') != "true" ?
                (element.delete(),
                    bullet.delete(),
                    bullet.attr('x', 0).attr('y', 0),
                    asteroids_array.splice((asteroids_array.indexOf(element)), 1),
                    breakIntoSmallerAsteroid(element))
                : (element.delete(),
                    bullet.delete(),
                    bullet.attr('x', 0).attr('y', 0),
                    asteroids_array.splice(asteroids_array.indexOf(element), 1),
                    stats.score += 1)
        : null))
        .subscribe(() => null);
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map