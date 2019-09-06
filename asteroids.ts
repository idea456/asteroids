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
    .attr('maxVelocity',5)
    .attr('acceleration',1)
    .attr('acc',0)

  
  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr('x', 300)
    .attr('y', 300)
    .attr("style","fill:none;stroke:white;stroke-width:1")




  const 
    // add 180 to reverse the head of the ship
    toDegrees = (radians:number) => -(radians * 180/Math.PI) + 180,
    // subtract PI/2 to adjust direction of the ship
    toRadians = (degrees:number) => (degrees * Math.PI/180) - Math.PI/2,
    // function to add direction vector
    addDirection = (xChange:number, yChange:number) => 
      ship.attr('x',parseInt(ship.attr('x'))+xChange).attr('y',parseInt(ship.attr('y'))+yChange),
    // function to increase acceleration when the UP key is pressed
    increaseAcceleration = () => parseInt(g.attr('velocity')) < parseInt(g.attr('maxVelocity')) 
      ? g.attr('velocity', parseInt(g.attr('velocity')) + parseInt(g.attr("acceleration"))) 
      : g.attr('velocity',parseInt(g.attr('maxVelocity'))),
    // function to decrease acceleration when the UP key is released
    decreaseAcceleration = () => parseInt(g.attr('velocity')) > 0 
      ? g.attr('velocity', parseInt(g.attr('velocity')) - parseInt(g.attr("acceleration")))
      : g.attr('velocity',0),

    outOfBoundX = () => (parseInt(ship.attr('x')) > svg.getBoundingClientRect().right 
      || parseInt(ship.attr('x')) < 0),
    
    outOfBoundY = () => (parseInt(ship.attr('y')) > svg.getBoundingClientRect().bottom
      || parseInt(ship.attr('y')) < 0),

    backToBoundX = () => parseInt(ship.attr('x')) > svg.getBoundingClientRect().right 
         ? ship.attr('x',0).attr('y',parseInt(ship.attr('y'))) : ship.attr('x',svg.getBoundingClientRect().right),

    backToBoundY = () => parseInt(ship.attr('y')) < 0
         ? ship.attr('y',svg.getBoundingClientRect().bottom) : ship.attr('y',0),

    
    // mouse events
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    shoot = Observable.fromEvent<MouseEvent>(svg, 'mousedown'),
    // key events
    keyup = Observable.fromEvent<KeyboardEvent>(document,  'keyup'),
    moveup = Observable.fromEvent<KeyboardEvent>(document, 'keydown').filter(({keyCode}) => keyCode == 38),
    gameloop = Observable.interval(20);
    
  
  // Observable to rotate the ship using mouse as pointer
  mousemove
    .map(({clientX, clientY}) => ({shipX:ship.attr('x'), shipY: ship.attr('y'), 
                                   rotateX: clientX-svg.getBoundingClientRect().left-parseInt(ship.attr('x')), 
                                   rotateY: clientY-svg.getBoundingClientRect().top-parseInt(ship.attr('y'))}))
    .subscribe(({shipX,shipY,rotateX,rotateY}) => 
      g.attr("transform","translate("+ship.attr('x')+","+ship.attr('y')+") rotate("+toDegrees(Math.atan2(rotateX,rotateY))+")")
       .attr('angle',toDegrees(Math.atan2(rotateX,rotateY))));

 
  // Observable to move the ship towards the mouse pointer
  moveup
      .flatMap(() => gameloop
      .takeUntil(Observable.interval(100))
      .map(() => increaseAcceleration())
      // calculate direction vector using angle
      .map(() => addDirection(Math.cos(toRadians(parseInt(g.attr('angle'))))*parseInt(g.attr('velocity')),
                              Math.sin(toRadians(parseInt(g.attr('angle'))))*parseInt(g.attr('velocity')))))
      .map(() => outOfBoundX()  ? backToBoundX() : null)
      .map(() => outOfBoundY()  ? backToBoundY() : null)
    .subscribe(() => g.attr("transform","translate("+ship.attr('x')+","+ship.attr('y')+") rotate("+g.attr('angle')+")"))

  // moveup
  //   .flatMap(() => gameloop
  //     .takeUntil(Observable.interval(50))
  //     .map(() => g.attr('acc',parseInt(g.attr('acc')) + 1)))
  //   .subscribe(() => console.log(g.attr('acc')))


}



// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
