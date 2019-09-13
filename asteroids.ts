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
      hit: false,
      win: false,
      gameOver : false
  }

  const 
      /*  
       function to convert radians to degrees
       add 180 to reverse the head of the ship
       @param : radians : the number to convert to degrees
      */
      toDegrees = (radians:number) => -(radians * 180/Math.PI) + 180,
      //function to convert degrees to radians
      // subtract PI/2 to adjust direction of the ship
      toRadians = (degrees:number) => (degrees * Math.PI/180) - Math.PI/2,
      
      /*  
       function to add direction to the ship's x and y position
       @param : xChange : the number to add to the ship's x position
       @param : yChange : the number to add to the ship's y position
      */
      addDirection = (xChange:number, yChange:number) => ship.attr('x',Number(ship.attr('x'))+xChange).attr('y',Number(ship.attr('y'))+yChange),

      /*  
       function to check if the x and y axis are outside the canvas
       @param : x : the x position to check
       @param : y : the y position to check
       @return : true if the x and y positions are out of bounds else return false if not
      */
     outOfBoundX = (x:number) => (x > svg.getBoundingClientRect().right || x < 0),
     outOfBoundY = (y:number) => (y > svg.getBoundingClientRect().bottom) || (y < 0),

      /*  
      function to end the game and display "game over" screen
      */
      gameOverScreen = () => (svg.remove(), document.getElementById("gameOver")!.innerHTML="<h1>GAME OVER!</h1>"),

      /*  
      function to check if ship collides with an asteroid
       @param : asteroid : the asteroid to check if the ship collides with it
       @return : true if the ship collides with an asteroid else return false if it does not
      */
      checkShipCollision = (asteroid:Elem) => Math.sqrt(Math.pow(Number(asteroid.attr('cx'))-Number(ship.attr('x')),2) + Math.pow(Number(asteroid.attr('cy'))-Number(ship.attr('y')),2)) < 80 ? true : false,
   
      // function to start an Observable interval stream to make the ship invincible momentarily
      invincibleShip = () => Observable.interval(100)
      // 1500 is how long the ship will stay invincible
        .takeUntil(Observable.interval(1500).map(() => (stats.lives -= 1, stats.invincible = false, stats.hit = false, ship.attr('style',"fill:white;stroke:white;stroke-width:1"))))
        .map(() => ship.attr('style',"fill:yellow;stroke:white;stroke-width:1"))
        .subscribe(() => stats.invincible = true),
      
      // function to reset the ship's position, reduce the number of lives and update the lives text in the document HTML
      // the ship resets its position to the center (300,300) to allow the player another chance to escape the asteroids
      reduceLives = () => (invincibleShip(), ship.attr('x',300).attr('y',300)),

      /*  
      function to check if the bullet collides with an asteroid by its x and y position
       @param : bullet : the bullet to check if it collides with an asteroid
       @param : asteroid : the asteroid to check if it collides with the bullet
       @return : true if the bullet collides with an asteroid else return false if it does not
      */
      bulletCollidesAsteroidX = (bullet:Elem, asteroid:Elem) => 
        Number(bullet.attr('x')) > (Number(asteroid.attr('cx')) - Number(asteroid.attr('r'))) && Number(bullet.attr('x')) < (Number(asteroid.attr('cx')) + Number(asteroid.attr('r')))
      ? true : false,
      bulletCollidesAsteroidY = (bullet:Elem, asteroid:Elem) => 
        Number(bullet.attr('y')) > (Number(asteroid.attr('cy')) - Number(asteroid.attr('r'))) && Number(bullet.attr('y')) < (Number(asteroid.attr('cy')) + Number(asteroid.attr('r')))
      ? true : false,

      /*  
      function to ensure asteroids are spawn outside the spawn radius
      the spawn radius surrounds the ship's spawning location
      this is to ensure that when the ship respawns it does not immediately collide with an asteroid
       @param : x : the bullet to check if it collides with an asteroid
       @param : spawnPoint : the centre spawn point 
       @param : spawnRadius : the spawn radius
      */
      spawnAsteroidX = (x:number, spawnPoint: number, spawnRadius:number) : number => 
        x < (spawnPoint-spawnRadius) || x > (spawnPoint+spawnRadius)  ? x : spawnAsteroidX(Math.floor(Math.random() * svg.getBoundingClientRect().right), spawnPoint, spawnRadius),
      spawnAsteroidY = (y:number, spawnPoint: number, spawnRadius:number) : number => 
        y < (spawnPoint-spawnRadius) || y > (spawnPoint+spawnRadius) ? y : spawnAsteroidY(Math.floor(Math.random() * svg.getBoundingClientRect().bottom), spawnPoint, spawnRadius),

      /*  
      function to check every asteroid if a bullet collides with it
       @param : bullet : the bullet to check if it collides with an asteroid
       @param : array : the asteroids_array
       @param : index : the index of the asteroid in the asteroids_array to check
       @return : the index of the asteroid the bullet collides else return null if the bullet does not collide with any asteroid
      */
     checkBulletCollisions = (bullet:Elem, array:Elem[], index:number) : number | null => 
       index == 0 ? null :  bulletCollidesAsteroidX(bullet, array[index-1]) && bulletCollidesAsteroidY(bullet, array[index-1]) 
      ? index : checkBulletCollisions(bullet, array, index-1),
   

    /*  
      function to check if the asteroid x and y position is still in bound with the canvas and adjust its x and y position if it is out of bounds
       @param : asteroid : the asteroid to check
       @return : null if it is in bound
      */
    asteroidsInBoundX = (asteroid:Elem) => Number(asteroid.attr('cx')) - Number(asteroid.attr('r')) > svg.getBoundingClientRect().right 
      ?  asteroid.attr('cx',-Number(asteroid.attr('r'))) 
      : Number(asteroid.attr('cx')) + Number(asteroid.attr('r')) < 0 ? asteroid.attr('cx', svg.getBoundingClientRect().right+Number(asteroid.attr('r')))
      : null,

    asteroidsInBoundY = (asteroid:Elem) => Number(asteroid.attr('cy')) - Number(asteroid.attr('r')) > svg.getBoundingClientRect().bottom
      ?  asteroid.attr('cy',-Number(asteroid.attr('r'))) 
      : Number(asteroid.attr('cy')) + Number(asteroid.attr('r')) < 0 ? asteroid.attr('cy', svg.getBoundingClientRect().bottom+Number(asteroid.attr('r')))
      : null,




      
      // VARIABLES
      // variables to store HTMLElement references
      // ! at the end indicates removal of strict null checks
      scoreElement : HTMLElement  = document.getElementById("score")!,
      livesElement : HTMLElement = document.getElementById("lives")!

      // variable to store and reference all the asteroids in the canvas
      let asteroids_array : Elem[] = []
      // variable to store the number of small asteroids to spawn
      let smallAsteroidCount = 0
      // use generateRate to increase or decrease the amount of generated asteroids
      // the smaller the generateRate the more asteroids will spawn
      let generateRate = 20;
      // the spawn radius of the asteroids away from the ship
      let spawnRadius = 100;
      // observable stream for asteroids_array
      let arrayObservable = Observable.fromArray(asteroids_array)
      // observable stream to break asteroids
      let breakAsteroidObservable = Observable.interval(10).map(() => {smallAsteroidCount})

      

    const
      // Observable implementing the game loop
      // a game loop is required to ensure that the game keeps running and calling functions to move elements in the canvas
      gameloop = Observable.interval(10).map(() => {stats}),
      // Observable to update the game score and end the game
      gamestate = Observable.interval(20)
        // update the number of lives text
        .map(() =>  livesElement.innerHTML="<h4>lives : " + ("&#10084").repeat(stats.lives < 0 ? 0 : stats.lives) + "</h4>")
        // constantly check for ship collisions
        .map(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ?  stats.lives <= 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null :null))
        .map(() => scoreElement.innerHTML="<h4>Score : " + stats.score + " </h4>")
        .takeUntil(gameloop.filter(() => stats.gameOver == true || stats.win == true)),

      // Observable for mouse events
      // Observable stream for mouse move events
      mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
      // Observable stream for mouse up events
      mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),

      // Observabke for keyboard events
      // Observable stream for key up events
      keyup = Observable.fromEvent<KeyboardEvent>(document,  'keyup'),
      // Observable stream for UP key being pressed with key code of 38
      moveup = Observable.fromEvent<KeyboardEvent>(document, 'keydown')
        .filter(({keyCode}) => keyCode == 38),

      // OBSERVABLE IMPLEMENTATIONS
      // observable to create bullets when mouse is clicked
      shoot = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
                .map(() => smallAsteroidCount = 0)
                .map(() => {stats})
                .map(() => 
                // create a new group for the bullet
                ({bullets:new Elem(svg,'g')
                  .attr('transform',"translate("+ship.attr('x')+','+ship.attr('y')+")")
                  .attr('xDirection',(Math.cos(toRadians(Number(g.attr('angle'))))*5))
                  .attr('yDirection',(Math.sin(toRadians(Number(g.attr('angle'))))*5)),
                }))
                .map(({bullets}) => 
                // create a new bullet every time mouse is clicked
                ({bullet: new Elem(svg,'circle',bullets.elem)
                  .attr('x',ship.attr('x'))
                  .attr('y',ship.attr('y'))
                  .attr('hit','false')
                  .attr('style',"fill:white;stroke:white;r:1"),bullets: bullets}));

      // Observable to ensure the ship points towards the mouse pointer
      mousemove
        .map(({clientX, clientY}) => ({shipX:ship.attr('x'), 
                                       shipY: ship.attr('y'), 
                                       rotateX: clientX-svg.getBoundingClientRect().left-Number(ship.attr('x')), 
                                       rotateY: clientY-svg.getBoundingClientRect().top-Number(ship.attr('y'))}))
      .subscribe(({shipX,shipY,rotateX,rotateY}) => 
        g.attr("transform","translate("+shipX+","+shipY+") rotate("+toDegrees(Math.atan2(rotateX,rotateY))+")")
         .attr('angle',toDegrees(Math.atan2(rotateX,rotateY))));


  
      // observable to move the ship in the right direction by pressing the UP key
      moveup
      .map(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ?  stats.lives <= 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null : null))
      .flatMap(() => gamestate  
        // move the ship until the Up key is released
        .takeUntil(moveup.takeUntil(keyup))
        .takeUntil(keyup)
        // increase acceleration
        .map(() => Number(g.attr('velocity')) < Number(g.attr('maxVelocity')) ? g.attr('velocity', Number(g.attr('velocity')) + Number(g.attr('acceleration'))) : g.attr('velocity',Number(g.attr('maxVelocity'))))
        // calculate the direction of the ship using direction vector calculation
        .map(() => ({xDirection:  Math.cos(toRadians(Number(g.attr('angle'))))*Number(g.attr('velocity')),
                    yDirection: Math.sin(toRadians(Number(g.attr('angle'))))*Number(g.attr('velocity'))}))
        // add to the ship's x and y position the directional vector to move
        .map(({xDirection, yDirection}) => addDirection(xDirection, yDirection)))
        // check if ship is out of bounds and if it is out of bounds then position the ship to the correct location
        .map(() => 
        (Number(ship.attr('x')) > svg.getBoundingClientRect().right ? 
        ship.attr('x',0) : Number(ship.attr('x')) < 0 ? ship.attr('x',svg.getBoundingClientRect().right) : null,
        // here, svg.getBoundingClientRect().bottom is not used since it returns the total height of the document not the canvas which is 800
        Number(ship.attr('y')) > 600 ? 
        ship.attr('y',0) : Number(ship.attr('y')) < 0 ? ship.attr('y',600) : null
        ))
        // transform the ship to move
        .subscribe(() => g.attr("transform","translate("+ship.attr('x')+","+ship.attr('y')+") rotate("+g.attr('angle')+")"))

      // when the ship is stationary check if any incoming asteroids hits the ship
      keyup
      .subscribe(() => asteroids_array.forEach((asteroid) => checkShipCollision(asteroid) ?  stats.lives < 0 ? gameOverScreen() : stats.invincible != true ? reduceLives() : null :null))
      
      // observable to spawn the asteroids 
      const asteroidObservable = Observable.interval(generateRate)
        .map(() => 
          ({ 
            // spawn asteroids within a spawn radius
            asteroid: new Elem(svg, 'circle')
              .attr('cx',spawnAsteroidX(Math.floor(Math.random() * svg.getBoundingClientRect().right), 300, spawnRadius))
              .attr('cy',spawnAsteroidY(Math.floor(Math.random() * svg.getBoundingClientRect().bottom), 300, spawnRadius))
              // max = 60 and min = 30, generate radiues between 30-60 using the formula 
              // x = Math.random() * (max - min) + min;
              // credits to https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range/1527834
              .attr("r",Math.floor(Math.random()*(60-30)+30))
              .attr('smallAsteroid','false')
              .attr('style',"fill:none;stroke:white;stroke-width:1")
              .attr('xDirection', Math.cos(toRadians(Math.floor(Math.random() * 360))))
              .attr('yDirection', Math.sin(toRadians(Math.floor(Math.random() * 360))))}))

      // start the observable to spawn the asteroids  
      asteroidObservable
        .takeUntil(Observable.interval(200))
        // push the new asteroids into the asteroids_array
        .subscribe(({asteroid}) => asteroids_array.push(asteroid))
      
      // observable to add motion to the asteroids
      gamestate
      .flatMap(() => Observable.fromArray(asteroids_array)
        .forEach((element)  => element
          .attr('cx',Number(element.attr('cx'))+Number(element.attr('xDirection')))
          .attr('cy',Number(element.attr('cy'))+Number(element.attr('yDirection'))))
          // wrap position of asteroid to the correct position if it moves out of bounds
          .forEach((element) => (asteroidsInBoundX(element),asteroidsInBoundY(element))))
        .subscribe(() => null)
          
      // function to start the break asteroid observable and break large asteroids into smaller asteroids
      let breakIntoSmallerAsteroid = (element:Elem) => 
        breakAsteroidObservable
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
          .attr('style',"fill:none;stroke:red;stroke-width:1")
          .attr('xDirection', Math.cos(toRadians(Math.floor(Math.random() * 360))))
          .attr('yDirection', Math.sin(toRadians(Math.floor(Math.random() * 360))))
      }))
      .map(({asteroid}) => (asteroids_array.push(asteroid), console.log(asteroid.attr('cx'),asteroid.attr('cy'))))
      .takeUntil(breakAsteroidObservable.filter(() => smallAsteroidCount == 4))
      .subscribe(() => smallAsteroidCount += 1)

    
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
      // delete the big asteroid and the bullet
      (element.delete(), 
      bullet.delete(),
      // stop the bullet from moving
      bullet.attr('x',0).attr('y',0),
      // find a way to store index
      asteroids_array.splice((asteroids_array.indexOf(element)), 1),
      breakIntoSmallerAsteroid(element))
      //asteroids_array.splice((asteroids_array.indexOf(element)), 1))
      // else it is a small asteroid
        // delete the large asteroid and the bullet
      :  (element.delete(), 
          bullet.delete(),
          bullet.attr('x',0).attr('y',0),
          asteroids_array.splice(asteroids_array.indexOf(element),1),
          // increase the score since the small asteroid is destroyed 
          stats.score += 1) 
    // else the bullet does not hit an asteroid
    : null))
  .subscribe(() => null)

}
  

        // the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
window.onload = ()=>{
  asteroids();
}
