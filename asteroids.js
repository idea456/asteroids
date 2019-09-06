"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300)")
        .attr('angle', 0)
        .attr('velocity', 1)
        .attr('maxVelocity', 5)
        .attr('acceleration', 1)
        .attr('acc', 0);
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr('x', 300)
        .attr('y', 300)
        .attr("style", "fill:none;stroke:white;stroke-width:1");
    const toDegrees = (radians) => -(radians * 180 / Math.PI) + 180, toRadians = (degrees) => (degrees * Math.PI / 180) - Math.PI / 2, addDirection = (xChange, yChange) => ship.attr('x', parseInt(ship.attr('x')) + xChange).attr('y', parseInt(ship.attr('y')) + yChange), increaseAcceleration = () => parseInt(g.attr('velocity')) < parseInt(g.attr('maxVelocity'))
        ? g.attr('velocity', parseInt(g.attr('velocity')) + parseInt(g.attr("acceleration")))
        : g.attr('velocity', parseInt(g.attr('maxVelocity'))), decreaseAcceleration = () => parseInt(g.attr('velocity')) > 0
        ? g.attr('velocity', parseInt(g.attr('velocity')) - parseInt(g.attr("acceleration")))
        : g.attr('velocity', 0), outOfBoundX = () => (parseInt(ship.attr('x')) > svg.getBoundingClientRect().right
        || parseInt(ship.attr('x')) < 0), outOfBoundY = () => (parseInt(ship.attr('y')) > svg.getBoundingClientRect().bottom
        || parseInt(ship.attr('y')) < 0), backToBoundX = () => parseInt(ship.attr('x')) > svg.getBoundingClientRect().right
        ? ship.attr('x', 0).attr('y', parseInt(ship.attr('y'))) : ship.attr('x', svg.getBoundingClientRect().right), backToBoundY = () => parseInt(ship.attr('y')) < 0
        ? ship.attr('y', svg.getBoundingClientRect().bottom) : ship.attr('y', 0), mousemove = Observable.fromEvent(svg, 'mousemove'), shoot = Observable.fromEvent(svg, 'mousedown'), keyup = Observable.fromEvent(document, 'keyup'), moveup = Observable.fromEvent(document, 'keydown').filter(({ keyCode }) => keyCode == 38), gameloop = Observable.interval(20);
    mousemove
        .map(({ clientX, clientY }) => ({ shipX: ship.attr('x'), shipY: ship.attr('y'),
        rotateX: clientX - svg.getBoundingClientRect().left - parseInt(ship.attr('x')),
        rotateY: clientY - svg.getBoundingClientRect().top - parseInt(ship.attr('y')) }))
        .subscribe(({ shipX, shipY, rotateX, rotateY }) => g.attr("transform", "translate(" + ship.attr('x') + "," + ship.attr('y') + ") rotate(" + toDegrees(Math.atan2(rotateX, rotateY)) + ")")
        .attr('angle', toDegrees(Math.atan2(rotateX, rotateY))));
    moveup
        .flatMap(() => gameloop
        .takeUntil(Observable.interval(100))
        .map(() => increaseAcceleration())
        .map(() => addDirection(Math.cos(toRadians(parseInt(g.attr('angle')))) * parseInt(g.attr('velocity')), Math.sin(toRadians(parseInt(g.attr('angle')))) * parseInt(g.attr('velocity')))))
        .map(() => outOfBoundX() ? backToBoundX() : null)
        .map(() => outOfBoundY() ? backToBoundY() : null)
        .subscribe(() => g.attr("transform", "translate(" + ship.attr('x') + "," + ship.attr('y') + ") rotate(" + g.attr('angle') + ")"));
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map