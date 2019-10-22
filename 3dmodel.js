/**
 * 3dmodel.js
 * 10/17/2019
 * Driver for the 3d modeling program.
 *
 * @author Alexander Luiz Costa
 * @version 1.0.0
 */

// height and width of 3D viewport
var mWidth = 0
var mHeight = 0

// mouse coordinates
var mouseX = 0
var mouseY = 0

// step size of animation (dicatates speed)
var dTheta = Math.PI / 720

// for interactive mode
var interactive = false

// for rotation animation sequence
var pauseRotate = false

// for morph animation sequence
var morphc = shapes.length - 1

// main
window.addEventListener("load", () => {
    // determine if device is primary touch

    touch = getComputedStyle(document.querySelector(".hint-b")).display !== "none"

    // declare global DOM elements

    mesh = document.querySelector(".mesh")
    welcomeColumn = document.querySelector(".columns.welcome")
    hint = document.querySelector(".hint")
    tryhov = document.querySelector("#try")
    menu = document.querySelector(".menu")
    shapeName = document.querySelector(".shape")
    shapeNameFake = document.querySelector(".shape.fake")
    functionName = document.querySelector(".function")
    welcomes = document.querySelector("[welcome]")
    interactives = document.querySelector("[interactive]")

    pointCountScale = 1

    if (touch) {
	initTouchAccessibility()
    }
    
    init3DModel()
}) // load

window.addEventListener("resize", () => {
    meshScale = mesh.offsetWidth / 950
}) // resize

function initTouchAccessibility() {
    tryhov.textContent = "tapping"
    
    modal = document.querySelector(".modal")
    screen = document.querySelector(".screen")
    hintb = document.querySelector(".hint-b")
    for (var i = 0; i < shapes.length - 1; i++) {
	var p = document.createElement("p")
	p.textContent = new shapes[i]().name
	p.id = i
	p.addEventListener("click", (e) => {
	    Animator.queue(new Morph(shape, getShape(e.target.id)))
	    closeModal()
	})
	modal.appendChild(p)
    }
}

function init3DModel() {

    // set mesh aspect ratio

    mWidth = mesh.offsetWidth
    mHeight = mesh.offsetHeight
    if (mWidth > mHeight) {
	mWidth = mHeight * 1.1
	mOffsetLeft = (mesh.offsetWidth - mWidth) / 2
	mOffsetTop = 0
    } else {
	mHeight = mWidth / 1.1
	mOffsetTop = (mesh.offsetHeight - mHeight) / 2
	mOffsetLeft = 0
    }
    meshScale = mesh.offsetWidth / 950

    // initialize listeners

    window.addEventListener("mousemove", (e) => {
	mouseX = e.pageX
	mouseY = e.pageY
    })

    window.addEventListener("resize", () => {
	mWidth = mesh.offsetWidth
	mHeight = mesh.offsetHeight
	if (mWidth > mHeight) {
	    mWidth = mHeight * 1.1
	    mOffsetLeft = (mesh.offsetWidth - mWidth) / 2
	    mOffsetTop = 0
	} else {
	    mHeight = mWidth / 1.1
	    mOffsetTop = (mesh.offsetHeight - mHeight) / 2
	    mOffsetLeft = 0
	}
	shapeName.style.left = shapeNameFake.offsetLeft + "px"
    })

    mesh.addEventListener("mouseenter", (e) => {
	if (!interactive) {
	    Animator.queue(new Fade(hint, 0.5, 0.05))
	}
    })

    mesh.addEventListener("mouseleave", (e) => {
	if (!interactive) {
	    Animator.queue(new Fade(hint, 0.0, -0.05))
	}
    })

    // initialize 3D program

    shape = getShape(morphc, mesh)
    Animator.queue(new Draw(shape))
    if (!touch) Animator.queue(new Distort(shape, welcomeColumn, menu))
    Animator.queue(new Morph(shape, getShape(-1)))
} // init3DModel

/* 
 * Draws all points every animation frame.
 */
class Draw extends Animation {
    /** 
     * Constructs a new Draw animation. Simply draws all the points of the shape
     * every animation frame.
     *
     * @param shape the shape object which to draw
     */
    constructor(shape) {
	super(shape.parent)
	this.shape = shape
    } // constructor

    anim() {
	this.shape.draw()
    } // anim
} // Draw

/*
 * An exhibit animation. Passively rotates and morphs the shapes of a specified
 * shape.
 */
class Exhibit extends Animation {
    /**
     * Constructs a new Exhibit animation. Randomly rotates and morphs shapes
     * within a specified shape.
     * 
     * @param shape the shape in which to rotate shapes
     */
    constructor(shape) {
	super(shape.parent)
	this.shape = shape
	this.count = 0
	this.rotation = 0
    } // constructor
    
    anim() {
	if (pauseRotate) {
	    return true
	}
	
	if (this.count % 800 == 0) {
	    var newRotation = Math.floor(Math.random() * 2)
	    if (this.rotation < 2) newRotation += 2
	    this.rotation = newRotation
	}
		
	if (!interactive && this.count % 2400 == 0 && this.count > 0) {
	    Animator.queue(new Morph(this.shape, getShape(-1)))
	    return true
	}
	
	if (this.rotation == 0) this.shape.rotateX(dTheta)
	else if (this.rotation == 1) this.shape.rotateX(-dTheta)
	else if (this.rotation == 2) this.shape.rotateY(-dTheta)
	else if (this.rotation == 3) this.shape.rotateY(dTheta)
	
	this.count++
    } // anim
} // Exhibit

class Distort extends Animation {
    /**
     * Constructs a new Distort animation. Distorts the points on a specified shape
     * according to the pointer (mouse) location.
     *
     * @param the shape whose points should be distorted
     */
    constructor(shape, welcome, menu) {
	super(shape.parent)
	this.shape = shape
	this.mesh = shape.parent
	this.welcome = welcome
	this.menu = menu
    } // constructor

    anim() {
	for (var i = 0; i < this.shape.points.length; i++) {
	    var p = this.shape.points[i]
	    var homex = p.projectX()
	    var homey = p.projectY()
	    var x0 = p.node.offsetLeft
	    var y0 = p.node.offsetTop
	    var xOffset = this.mesh.offsetLeft + this.menu.offsetWidth
	    var yOffset = 0
	    if (xOffset === 0) {
		xOffset = this.welcome.parentElement.parentElement.offsetLeft
		yOffset = this.welcome.offsetHeight + this.welcome.offsetTop + 
		    this.welcome.offsetTop * .125 * .02
	    }
	    var dx = (mouseX - xOffset) - x0
	    var dy = (mouseY - yOffset) - y0
	    var distance2 = dx * dx + dy * dy
	    
	    var spread = 1200 * (1 - Math.abs(p.z + 1) / 2) * meshScale * meshScale
	    var magnet = 0.5 * (1 - Math.abs(p.z + 1) / 2) * meshScale

	    var powerx = x0 - dx / distance2 * spread
	    var powery = y0 - dy / distance2 * spread
	    
	    var forcex = ((homex - x0) / 2) * magnet
	    var forcey = ((homey - y0) / 2) * magnet
	    
	    var distortX = ((powerx + forcex) - homex)
	    var distortY = ((powery + forcey) - homey)
	    
	    var cap = 150 * meshScale

	    // issue with jumpy points when moving cursor rapidly
	    // adds a 150 ceiling to distortion value
	    p.distortX = (Math.abs(distortX) > cap) ? (distortX > 0) ? cap : -cap : distortX
	    p.distortY = (Math.abs(distortY) > cap) ? (distortY > 0) ? cap : -cap : distortY
	}
    } // anim
} // Distort

// enter interative mode
function enterInteractive() {
    interactive = true
    var h = (touch) ? hintb : hint
    Animator.queue(new Fade(h, 0, -0.1))
    Animator.queue(new CrossFade(welcomes, interactives, 1, 0.1))
} // enterInteractive

// exit interactive mode
function exitInteractive() {
    interactive = false
    Animator.queue(new CrossFade(interactives, welcomes, 1, 0.1))
    if (pauseRotate) {
	pauseRotate = false
	Animator.queue(new Exhibit(shape))
    }
    
    if (touch) {
	Animator.queue(new Fade(hintb, 1, 0.05))
    }
} // exitInteractive

// plays and pauses the auto rotation of the shape
function toggleAutoRotate() {
    pauseRotate = !pauseRotate
    if (!pauseRotate) {
	Animator.queue(new Exhibit(shape))
    }
} // toggleAutoRotate

// selects a specific shape with a modal menu
function selectShape() {
    modal.style.display = "block"
    screen.style.display = "block"
    Animator.queue(new FadeShift(modal, 1, 0.1, "y", 16, 0, -1.6))
} // selectShape

// closes the modal screen if it is open
function closeModal() {
    Animator.cancel(modal.id, FadeShift)
    screen.style.display = "none"
    modal.style.display = "none"
    modal.style.opacity = "0"
} // closeModal

// key input listener
document.addEventListener("keyup", (e) => {
    switch (e.key) {
    case "i": 
    case "I":
	enterInteractive()
	break
    case "Esc": 
    case "Escape":
	exitInteractive()
	break
    default:
	break
    }

    if (interactive) {
	var num = 0
	switch(e.key) {
	case "m":
	case "M":
	    Animator.queue(new Morph(shape, getShape(-1)))
	    break
	case "p":
	case "P":
	    toggleAutoRotate()
	    break
	case "0":
	case "1":
	case "2":
	case "3":
	case "4":
	case "5":
	case "6":
	case "7":
	case "8":
	case "9":
	    num = (+e.key - 1 < 0) ? 9 : +e.key - 1
	    Animator.queue(new Morph(shape, getShape(num)))
	    break
	case ")":
	    num++;
	case "(":
	    num++;
	case "*":
	    num++;
	case "&":
	    num++;
	case "^":
	    num++;
	case "%":
	    num++;
	case "$":
	    num++;
	case "#":
	    num++;
	case "@":
	    num++;
	case "!":
	    num++;
	    Animator.queue(new Morph(shape, getShape(num + 9)))
	    break
	default:
	    return
	}
    }    
}) // keyup

// keydown listener
document.addEventListener("keydown", (e) => {
    if (interactive) {
	var factor = 2
	switch (e.key) {
	case "s":
	case "S":
	    pauseRotate = true
	    shape.rotateX(dTheta * factor)
	    break
	case "w": 
	case "W":
	    pauseRotate = true
	    shape.rotateX(-dTheta * factor)
	    break
	case "a":
	case "A":
	    pauseRotate = true
	    shape.rotateY(dTheta * factor)
	    break
	case "d":
	case "D":
	    pauseRotate = true
	    shape.rotateY(-dTheta * factor)
	    break
	case "z": 
	case "Z":
	    pauseRotate = true
	    shape.rotateZ(-dTheta * factor)
	    break
	case "x": 
	case "X":
	    pauseRotate = true
	    shape.rotateZ(dTheta * factor)
	    break
	default:
	    return
	}
    }
}) // keydown
