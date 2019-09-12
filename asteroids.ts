// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!;
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let g = new Elem(svg,'g')
    .attr("transform","translate(300 300)")  
    .attr('angle',0)
    .attr('velocity',1)
    .attr('maxVelocity',6)
    .attr('acceleration',0.1)

  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem) 
      .attr("points","-15,20 15,20 0,-20")
      .attr('x', 300)
      .attr('y', 300)
      .attr("style","fill:white;stroke:white;stroke-width:1")
  
  // stats of the game
  const stats = {
      score: 0,
      level: 1,
      lives : 3,
      invincible : false,
      win: false,
      gameOver : false
  }

  const 
      // add 180 to reverse the head of the ship
      toDegrees = (radians:number) => -(radians * 180/Math.PI) + 180,
      // subtract PI/2 to adjust direction of the ship
      toRadians = (degrees:number) => (degrees * Math.PI/180) - Math.PI/2,

      addDirection = (xChange:number, yChange:number) => ship.attr('x',Number(ship.attr('x'))+xChange).attr('y',Number(ship.attr('y'))+yChange),

      outOfBoundX = (x:number) => (x > svg.getBoundingClientRect().right || x < 0),
      outOfBoundY = (y:number) => (y > svg.getBoundingClientRect().bottom) || (y < 0),

      backToBoundX = (element:Elem, x:string, y:string) => Number(element.attr(x)) > svg.getBoundingClientRect().right 
        ? ship.attr(x,0).attr(y,Number(element.attr(y))) : element.attr(x,svg.getBoundingClientRect().right),

      backToBoundY = (element:Elem, x:string, y:string) => Number(element.attr(y)) < 0
        ? element.attr(x, Number(element.attr(x))).attr(y,svg.getBoundingClientRect().bottom) : element.attr(y,0),

      // ! at the end indicates removal of strict null checks
      scoreElement : HTMLElement  = document.getElementById("score")!,
      livesElement : HTMLElement = document.getElementById("lives")!,
      // game loop
      gameloop = Observable.interval(10).map(() => {stats}),
      // game observable
      gamestate = Observable.interval(20)
        .map(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ?  stats.lives <= 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null :null))
        .map(() => scoreElement.innerHTML="<h4>Score : " + stats.score + " </h4>")
        .takeUntil(gameloop.filter(() => stats.gameOver == true || stats.win == true)),


      // mouse events
      mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
      mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
      // observable to create bullets when mouse is clicked
      shoot = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
                .map(() => smallAsteroidCount = 0)
                .map(() => {stats})
                .map(() => 
                ({bullets:new Elem(svg,'g')
                  .attr('transform',"translate("+ship.attr('x')+','+ship.attr('y')+")")
                  .attr('xDirection',(Math.cos(toRadians(Number(g.attr('angle'))))*5))
                  .attr('yDirection',(Math.sin(toRadians(Number(g.attr('angle'))))*5)),
                }))
                .map(({bullets}) => 
                ({bullet: new Elem(svg,'circle',bullets.elem)
                  .attr('x',ship.attr('x'))
                  .attr('y',ship.attr('y'))
                  .attr('hit','false')
                  .attr('style',"fill:white;stroke:white;r:1"),bullets: bullets})),
      // keyboard events
      keyup = Observable.fromEvent<KeyboardEvent>(document,  'keyup'),
      // Observable for UP key
      moveup = Observable.fromEvent<KeyboardEvent>(document, 'keydown')
        .filter(({keyCode}) => keyCode == 38)

      const gameOverScreen = () => (svg.remove(), document.getElementById("gameOver")!.innerHTML="<h1>GAME OVER!</h1>")

      let smallAsteroidCount = 0
      
      // observable to ensure the ship points towards the mouse pointer
      mousemove
      .map(({clientX, clientY}) => ({shipX:ship.attr('x'), shipY: ship.attr('y'), 
                                     rotateX: clientX-svg.getBoundingClientRect().left-Number(ship.attr('x')), 
                                     rotateY: clientY-svg.getBoundingClientRect().top-Number(ship.attr('y'))}))
      .subscribe(({shipX,shipY,rotateX,rotateY}) => 
        g.attr("transform","translate("+ship.attr('x')+","+ship.attr('y')+") rotate("+toDegrees(Math.atan2(rotateX,rotateY))+")")
         .attr('angle',toDegrees(Math.atan2(rotateX,rotateY))));

      // observable to move the ship in the right direction by pressing the UP key
      moveup
        .map(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ?  stats.lives <= 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null : null))
        .flatMap(() => gamestate  
          .takeUntil(moveup.takeUntil(keyup))
          .takeUntil(keyup)
          // increase acceleration
          .map(() => Number(g.attr('velocity')) < Number(g.attr('maxVelocity')) ? g.attr('velocity', Number(g.attr('velocity')) + Number(g.attr('acceleration'))) : g.attr('velocity',Number(g.attr('maxVelocity'))))
          .map(() => ({xDirection:  Math.cos(toRadians(Number(g.attr('angle'))))*Number(g.attr('velocity')),
                       yDirection: Math.sin(toRadians(Number(g.attr('angle'))))*Number(g.attr('velocity'))}))
          .map(({xDirection, yDirection}) => ship.attr('x', Number(ship.attr('x')) + xDirection)
                                                 .attr('y', Number(ship.attr('y')) + yDirection)))
          .subscribe(() => g.attr("transform","translate("+ship.attr('x')+","+ship.attr('y')+") rotate("+g.attr('angle')+")"))

      keyup
        .flatMap(() => Observable.interval(5).takeUntil(gameloop.map(() => ({g:g})).filter(({g}) => Number(g.attr('velocity')) < 2))
        .map(() => g.attr('velocity',Number(g.attr('velocity')) - 1))
        .map(() => ship
                    .attr('x',Number(ship.attr('x')) + Math.cos(toRadians(Number(g.attr('angle'))))*Number(g.attr('velocity')))
                    .attr('y',Number(ship.attr('y')) + Math.sin(toRadians(Number(g.attr('angle'))))*Number(g.attr('velocity')))))
        .subscribe(() => g.attr("transform","translate("+ship.attr('x')+","+ship.attr('y')+") rotate("+g.attr('angle')+")"))

    // using 70 as an estimate for area of collision
    const checkShipCollision = (asteroid:Elem) => Math.sqrt(Math.pow(Number(asteroid.attr('cx'))-Number(ship.attr('x')),2) + Math.pow(Number(asteroid.attr('cy'))-Number(ship.attr('y')),2)) < 80 ? true : false;

    const invincibleShip = () => Observable.interval(100).takeUntil(Observable.interval(2000).map(() => (stats.invincible = false, stats.lives -= 1, ship.attr('style',"fill:white;stroke:white;stroke-width:1")))).map(() => ship.attr('style',"fill:yellow;stroke:white;stroke-width:1")).subscribe(() => stats.invincible = true)
    const reduceLives = () => (
      invincibleShip(),
      livesElement.innerHTML="<h4>lives : " + ("&#10084").repeat(stats.lives < 0 ? 0 : stats.lives) + "</h4>",
      ship.attr('x',300).attr('y',300)
      )

    // function to check for asteroid collisions
    const bulletCollidesAsteroidX = (bullet:Elem, asteroid:Elem) => 
      Number(bullet.attr('x')) > (Number(asteroid.attr('cx')) - Number(asteroid.attr('r'))) && Number(bullet.attr('x')) < (Number(asteroid.attr('cx')) + Number(asteroid.attr('r')))
        ? true : false;
    const bulletCollidesAsteroidY = (bullet:Elem, asteroid:Elem) => 
      Number(bullet.attr('y')) > (Number(asteroid.attr('cy')) - Number(asteroid.attr('r'))) && Number(bullet.attr('y')) < (Number(asteroid.attr('cy')) + Number(asteroid.attr('r')))
        ? true : false;


      const spawnAsteroidX = (x:number, spawnPoint: number, spawnRadius:number) : number => x > (spawnPoint-spawnRadius) || x < (spawnPoint+spawnRadius)  ? x : spawnAsteroidX(Math.floor(Math.random() * svg.getBoundingClientRect().right), spawnPoint, spawnRadius)

      const spawnAsteroidY = (y:number, spawnPoint: number, spawnRadius:number) : number => y > (spawnPoint-spawnRadius) || y < (spawnPoint+spawnRadius) ? y : spawnAsteroidY(Math.floor(Math.random() * svg.getBoundingClientRect().bottom), spawnPoint, spawnRadius)

    // use generateRate to increase or decrease the amount of generated asteroids
    let generateRate = 80;
    let spawnRadius = 200;
    const asteroidObservable = Observable.interval(generateRate)
        .map(() => 
          ({ 
            asteroid: new Elem(svg, 'circle')
              .attr('cx',spawnAsteroidX(Math.floor(Math.random() * svg.getBoundingClientRect().right), 300, spawnRadius))
              .attr('cy',spawnAsteroidY(Math.floor(Math.random() * svg.getBoundingClientRect().bottom), 300, spawnRadius))
              // max = 60 and min = 30, generate radiues between 30-60 using the formula 
              // x = Math.random() * (max - min) + min;
              // credits to https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range/1527834
              .attr("r",Math.floor(Math.random()*(60-30)+30))
              .attr('smallAsteroid','false')
              .attr('style',"fill:grey;stroke:white;stroke-width:1")
              .attr('xDirection', Math.cos(toRadians(Math.floor(Math.random() * 360))))
              .attr('yDirection', Math.sin(toRadians(Math.floor(Math.random() * 360))))}))
        

    let asteroids_array : Elem[] = []

    let arrayObservable = Observable.fromArray(asteroids_array)

    let breakAsteroidObservable = Observable.interval(10).map(() => {smallAsteroidCount})

    let breakIntoSmallerAsteroid = (element:Elem) => 
    // function to break asteroid into smaller pieces
    // @param index : the index of the asteroid in asteroid_array to break
     breakAsteroidObservable
    //.map(() => console.log(asteroids_array, index))
    .map(() => ({
      x: Number(element.attr('cx')),
      y: Number(element.attr('cy')),
      spawnSmallRadius: 20
    }))
    .map(({x,y, spawnSmallRadius}) => ({
      asteroid : new Elem(svg, 'circle',new Elem(svg,'g').elem)
        // spawn within a radius of the large asteroid
         // x = Math.random() * (max - min) + min;
        .attr('cx',Math.floor(Math.random() * ((x+spawnSmallRadius)-(x-spawnSmallRadius)) + (x-spawnSmallRadius)))
        .attr('cy',Math.floor(Math.random() * ((y+spawnSmallRadius)-(y-spawnSmallRadius)) + (y-spawnSmallRadius)))
        .attr("r",Math.floor(Math.random()*(30-20)+20))
        .attr('smallAsteroid','true')
        .attr('style',"fill:red;stroke:white;stroke-width:1")
        .attr('xDirection', Math.cos(toRadians(Math.floor(Math.random() * 360))))
        .attr('yDirection', Math.sin(toRadians(Math.floor(Math.random() * 360))))
    }))
    .map(({asteroid}) => (asteroids_array.push(asteroid), console.log(asteroid.attr('cx'),asteroid.attr('cy'))))
    .takeUntil(breakAsteroidObservable.filter(() => smallAsteroidCount == 4))
    .subscribe(() => smallAsteroidCount += 1)


    let checkBulletCollisions = (bullet:Elem, array:Elem[], index:number) : number | null => index == 0 ? null :  bulletCollidesAsteroidX(bullet, array[index-1]) && bulletCollidesAsteroidY(bullet, array[index-1]) ? index : checkBulletCollisions(bullet, array, index-1)

    // Observable to spawn bullets 
    shoot
      .flatMap(({bullet, bullets}) => Observable.interval(5)
        //takeUntil(shoot.filter(() => asteroidHit != 0)) 
        .filter(() => !(outOfBoundX(Number(bullet.attr('x'))) || outOfBoundY(Number(bullet.attr('y')))))
        .forEach(() => bullet.attr('x',Number(bullet.attr('x'))+Number(bullets.attr('xDirection')))
                      .attr('y',Number(bullet.attr('y'))+Number(bullets.attr('yDirection'))))
        .map(() => bullets.attr('transform','translate('+bullet.attr('x')+','+bullet.attr('y')+')'))
        .map(() => ({bullet:bullet})))
      .flatMap(({bullet}) => arrayObservable
      .map((element) => bulletCollidesAsteroidX(bullet, element) && bulletCollidesAsteroidY(bullet, element) ? element : null)
      .map((element) => 
      // if the bullet hits an asteroid
      element != null 
      ? 
        // if it is a big asteroid
        element.attr('smallAsteroid') != "true" ?
        (element.delete(), 
        bullet.delete(),
        bullet.attr('x',0).attr('y',0),
        // find a way to store index
        asteroids_array.splice((asteroids_array.indexOf(element)), 1),
        breakIntoSmallerAsteroid(element))
        //asteroids_array.splice((asteroids_array.indexOf(element)), 1))
        // else it is a small asteroid
        :  (element.delete(), 
            bullet.delete(),
            bullet.attr('x',0).attr('y',0),
            asteroids_array.splice(asteroids_array.indexOf(element),1), 
            stats.score += 1) 
      // else the bullet does not hit an asteroid
      : null))
    .subscribe(() => null)





// observable to create random asteroids 
asteroidObservable
  .takeUntil(Observable.interval(200))
  .subscribe(({asteroid}) => asteroids_array.push(asteroid))


  let asteroidsInBoundX = (asteroid:Elem) => Number(asteroid.attr('cx')) - Number(asteroid.attr('r')) > svg.getBoundingClientRect().right 
                                            ?  asteroid.attr('cx',-Number(asteroid.attr('r'))) 
                                            : Number(asteroid.attr('cx')) + Number(asteroid.attr('r')) < 0 ? asteroid.attr('cx', svg.getBoundingClientRect().right+Number(asteroid.attr('r')))
                                            : null  

  let asteroidsInBoundY = (asteroid:Elem) => Number(asteroid.attr('cy')) - Number(asteroid.attr('r')) > svg.getBoundingClientRect().bottom
                                            ?  asteroid.attr('cy',-Number(asteroid.attr('r'))) 
                                            : Number(asteroid.attr('cy')) + Number(asteroid.attr('r')) < 0 ? asteroid.attr('cy', svg.getBoundingClientRect().bottom+Number(asteroid.attr('r')))
                                            : null  

                                            // observable to add motion to the asteroids
gamestate
  .flatMap(() => Observable.fromArray(asteroids_array)
    .forEach((element)  => element
      .attr('cx',Number(element.attr('cx'))+Number(element.attr('xDirection')))
      .attr('cy',Number(element.attr('cy'))+Number(element.attr('yDirection'))))
      // wrap position of asteroid to the correct position if it moves out of bounds
      .forEach((element) => (asteroidsInBoundX(element),asteroidsInBoundY(element))))
    .subscribe(() => null)


}


// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
window.onload = ()=>{
  asteroids();
}
