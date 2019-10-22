/**
 * Shapes:
 * - cube
 * - sphere
 * - full sphere
 * - spiral sphere
 * - noisy sphere
 * - disk
 * - ray
 * - energy
 * - torus
 * - meshes
 * - horn torus
 * - interlocking tori
 * - adjusted horn torus
 */

/**
 * An abstract representation of a shape, maintains a collection of points.
 * Should not be instantiated.
 */
class Shape {
    /**
     * Constructs a shape.
     *
     * @param parent the DOM element to which to append points if the point
     * should be attached; can be undefined
     */
    constructor(parent) {
	if (this.constructor === Shape)  {
	    throw new TypeError('Abstract class "Shape" cannot be instantiated directly.')
	}
	this.points = new Array()
	this.parent = parent
    } // constructor
    
    /**
     * Adds a point to this shape
     */
    add(p) {
	this.points.push(p)
    } // add
    
    /**
     * Removes the last point from this shape.
     */
    pop() {
	var p = this.points.pop()
	p.node.remove()
    } // pop
    
    /*
     * Rotates points around the x-axis.
     * 
     * @param rad radians by which to rotate points (should be small to avoid
     * jumpy animations (~ Math.PI / 360))
     */
    rotateX(rad) {
	for (var i = 0; i < this.points.length; i++) {
	    this.points[i].rotateX(rad)
	}
    } // rotateX

    /*
     * Rotates points around the y-axis.
     * 
     * @param rad radians by which to rotate points (should be small to avoid
     * jumpy animations (~ Math.PI / 360))
     */
    rotateY(rad) {
	for (var i = 0; i < this.points.length; i++) {
	    this.points[i].rotateY(rad)
	}
    } // rotateY

    /*
     * Rotates points around the z-axis.
     * 
     * @param rad radians by which to rotate points (should be small to avoid
     * jumpy animations (~ Math.PI / 360))
     */
    rotateZ(rad) {
	for (var i = 0; i < this.points.length; i++) {
	    this.points[i].rotateZ(rad)
	}
    } // rotateZ
    
    /** 
     * Draws all the points of this shape.
     */
    draw() {
	for (var i = 0; i < this.points.length; i++) {
	    this.points[i].draw()
	}
    } // draw
    
    /**
     * Sets the name of this shape
     *
     * @param name the new name
     */
    setName(name) {
	this.name = name
	// THIS IS WRONG
	if (this.name == "mesh") this.func = shape.func
	else this.func = undefined
    } // setName
    
    // collect distances necessary to morph to "shape"
    computeDistance(form) {
	var distance = new Array()

	// compute the distance for all points in this
	for (var i = 0; i < this.points.length; i++) {
	    // mark point for removal if it is not necessary to morph to form
	    if (i >= form.points.length) {
		distance.push([Math.random() * 1.8 - 0.9, Math.random() * 1.8 - 0.9, 2, true])
	    } else {
		var tp = this.points[i]
		var op = form.points[i]
		
		var dx = op.x - tp.x
		var dy = op.y - tp.y
		var dz = op.z - tp.z
		
		distance.push([dx, dy, dz])
	    }
	}
	
	// if form requires more points, add new ones
	var tlength = this.points.length
	var olength = form.points.length
	if (olength > tlength) {
	    var dl = olength - tlength
	    for (var i = 0; i < dl; i++) {
		var x = Math.random() * 1.25 - 0.625
		var y = Math.random() * 1.25 - 0.625
		var z = Math.random() * 1.25 - 0.625
		var p = new Point(x, y, z, this.parent)
		//p.node.style.opacity = 0
		this.add(p)
		var op = form.points[tlength + i]
		distance.push([op.x - x, op.y - y, op.z - z])
	    }
	}
	return distance
    } // computeDistance
    
    // DEBUG //
    // DEBUG // 
    // DEBUG //
    duplicates() {
	console.log(this.points.length)
	var distinct = new Array()
	for (var i = 0; i < this.points.length; i++) {
	    var p = this.points[i]
	    var h = false
	    for (var j = 0; j < distinct.length; j++) {
		var q = distinct[j]
		if (equal(p.x, q.x) && equal(p.y, q.y) && equal(p.z, q.z)) {
		    h = true
		}
	    }
	    if (!h) distinct.push(p)
	}
	console.log(this.points.length - distinct.length)
    } // duplicates
} // Shape

/**
 * A morph animation. Animations the change from one shape to another.
 */
class Morph extends Animation {
    /**
     * Constructs a new Morph animation. Morphs the specified shape to the
     * specified form (another shape object).
     *
     * @param shape a shape that is attached to the DOM
     * @param form another shape that is not attached to the DOM to which 
     * shape will be morphed
     */
    constructor(shape, form) {
	super(shape.parent)
	this.shape = shape
	this.count = 0
	this.distance = shape.computeDistance(form)
	this.shape.setName(form.name)
	Animator.cancel(this.node.id, Exhibit)
	// TODO: Do this better
	var sname = document.querySelector(".shape")
	Animator.queue(new Reveal(sname, this.shape.name))
    } // constructor
    
    anim() {
	// end morph
	if (this.count === 30) {
	    Animator.queue(new Exhibit(this.shape))
	    return true
	}
	
	// move each point one increment towards its destination
	for (var i = this.shape.points.length - 1; i >= 0; i--) {
	    var p = this.shape.points[i]

	    p.x += this.distance[i][0] / 30
	    p.y += this.distance[i][1] / 30
	    p.z += this.distance[i][2] / 30
	    
	    if (this.count == 29 && this.distance[i][3]) {
		shape.pop()
	    }
	}

	this.count++
    } // anim
} // Morph

/**
 * A fading reveal animation for text elements.
 */
class Reveal extends Animation {
    /**
     * Constructs a new Reveal animation.
     * 
     * @param node the parent node in which to add letters
     * @param the text to write in the parent node
     */
    constructor(node, text) {
	super(node)
	this.text = text
	this.count = 0
	// TODO: do this better
	this.fname = document.querySelector(".shape.fake")
	this.fname.textContent = this.text
    } // constructor
    
    anim() {
	// finish reveal
	if (this.count - 14 == this.text.length) {
	    if (shape.name == "mesh") {
		var fname = document.querySelector(".function")
		fname.textContent = "" + shape.func.toString().slice(29, -2) + ""
		Animator.queue(new Fade(fname, 0.5, 0.0625))
	    }
	    return true
	}
	
	// switch for the different stages of the reveal
	switch (true) {
	// fade the initial text out
	case (this.count < 5):
	    this.node.style.opacity = +this.node.style.opacity - 0.2
	    // remove all letters
	    if (this.count == 4) {
		while (this.node.firstChild) {
		    this.node.removeChild(this.node.firstChild)
		}
	    }
	    break
	// reveal empty text
	case (this.count == 5):
	    this.node.style.opacity = 1
	    this.node.style.left = this.fname.offsetLeft + "px"
	// add and fade in each letter
	default:
	    if (this.count - 5 < this.text.length) {
		var letter = document.createElement("span")
		letter.style.opacity = 0
		letter.textContent = this.text[this.count - 5]
		this.node.appendChild(letter)
	    }
	    for (var i = 0; i < this.node.childNodes.length; i++) {
		var l = this.node.childNodes[i]
		l.style.opacity = +l.style.opacity + 0.1
	    }
	    break
	} // switch
	
	this.count++
    } // anim
} // Reveal

// a cube!
class Cube extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "cube"
	var step = 0.1375
	var count = 0
	for (var i = -0.55; i <= 0.55; i += step) {
	    for (var j = -0.55; j <= 0.55; j += step) {
		for (var k = -0.55; k <= 0.55; k += step) {
		    if (count % pointCountScale == 0) {
			super.add(new Point(i, j, k, parent))
		    }
		    count++
		}
	    }
	}
    }
} // Cube

// a sphere!
class Sphere extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "fibonacci lattice"
	var numpts = 1000 / pointCountScale
	for (var i = 0; i < numpts; i++) {
	    var phi = Math.acos(1 - 2 * (i + 0.5) / numpts)
	    var theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
	    var radius = 0.9
	    var x = radius * Math.cos(theta) * Math.sin(phi)
	    var y = radius * Math.sin(theta) * Math.sin(phi)
	    var z = radius * Math.cos(phi)
	    super.add(new Point(x, y, z, parent))
	}
    }
} // Sphere

// a filled in sphere!
class FullSphere extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "nested fibonacci lattice"
	var numpts = 250 / pointCountScale
	for (var j = 0; j <= 0.9; j += 0.225) {
	    for (var i = 0; i < numpts; i++) {
		var phi = Math.acos(1 - 2 * (i + 0.5) / numpts)
		var theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
		var radius = j
		var x = radius * Math.cos(theta) * Math.sin(phi)
		var y = radius * Math.sin(theta) * Math.sin(phi)
		var z = radius * Math.cos(phi)
		super.add(new Point(x, y, z, parent))
		if (j == 0) break
	    }
	}
    }
} // Sphere

// a spiraling sphere!
class SpiralSphere extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "adjusted fibonacci lattice"
	var numpts = 1000 / pointCountScale
	for (var i = 0; i < numpts; i++) {
	    var phi = Math.acos(1 - 2 * (i + 0.5) / numpts)
	    var theta = Math.PI + (1 + Math.sqrt(5)) * (i + 0.5)
	    var radius = 0.9
	    var x = radius * Math.cos(theta) * Math.sin(phi)
	    var y = radius * Math.sin(theta) * Math.sin(phi)
	    var z = radius * Math.cos(phi)
	    super.add(new Point(x, y, z, parent))
	}
    }
} // SpiralSphere

// random points within a spherical shape
class NoisySphere extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "noisy sphere"
	var count = 0
	for (var i = -1; i < 1; i += 0.2) {
	    for (var j = -1; j < 1; j += 0.2) {
		for (var k = -1; k < 1; k += 0.2) {
		    if (count % pointCountScale !== 0) {
			count++
			continue
		    }
		    var lambda = Math.pow(Math.random(), 1/3)
		    var u = Math.random() * 2 - 1
		    var u2 = Math.sqrt(1 - Math.pow(u, 2))
		    var phi = Math.random() * 2 * Math.PI
		    var radius = 0.9
		    var x = radius * lambda * u2 * Math.cos(phi)
		    var y = radius * lambda * u2 * Math.sin(phi)
		    var z = radius * lambda * u
		    super.add(new Point(x, y, z, parent))
		    count++
		}
	    }
	}
    }
} // NoisySphere

// intersecting disks
class Disk extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "intersecting disks"
	var count = 0
	for (var i = 0; i <= 1; i += 0.0625) {
	    for (var j = 0; j <= 1; j += 0.125) {
		for (var k = 0; k < 1; k += 0.125) {
		    if (count % pointCountScale !== 0) {
			count++
			continue
		    }
		    var theta = i * Math.PI
		    var phi = j * 2 * Math.PI
		    var radius = k
		    var x = radius * Math.sin(theta) * Math.cos(phi)
		    var y = radius * Math.sin(theta) * Math.sin(phi)
		    var z = radius * Math.cos(theta)
		    if (!(x == 0 && y == 0 && z == 0)) {
			super.add(new Point(x, z, y, parent))
		    }
		    count++
		}
		if (i == 0) break
	    }
	}
    }
} // Disk

// beaming rays, like sun :)
class Ray extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "beaming rays; like a sun"
	var numpts = 200 / pointCountScale
	for (var i = 0; i < numpts; i++) {
	    var phi = Math.acos(1 - 2 * (i + 0.5) / numpts)
	    var theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
	    var radius = 0.28
	    var x = radius * Math.cos(theta) * Math.sin(phi)
	    var y = radius * Math.sin(theta) * Math.sin(phi)
	    var z = radius * Math.cos(phi)
	    super.add(new Point(x, y, z, parent))
	}
	var count = 0
	for (var i = 0; i <= 1; i += 0.125) {
	    for (var j = 0; j <= 1; j += 0.1) {
		for (var k = 0; k <= 1; k += 0.125) {
		    if (count % pointCountScale !== 0) {
			count++
			continue
		    }
		    var theta = i * Math.PI
		    var phi = j * 2 * Math.PI
		    var radius = (k + 0.9) * 0.5
		    var x = radius * Math.sin(theta) * Math.cos(phi)
		    var y = radius * Math.sin(theta) * Math.sin(phi)
		    var z = radius * Math.cos(theta)
		    super.add(new Point(x, z, y, parent))
		    count++
		}
		if (i == 0) break
	    }
	}
    }
} // Ray

// a mesh-like shape, basically a 3D graph of a 3D function
class Mesh extends Shape {
    constructor(parent, func) {
	super(parent)
	this.name = "mesh"

	if (func == undefined) {
	    func = Math.floor(Math.random() * functions.length)
	}
	
	this.func = functions[func]
	
	var count = 0
	for (var x = -0.7; x < 0.7; x += 0.04375) {
	    for (var z = -0.7; z < 0.7; z += 0.04375) {
		if (count % pointCountScale !== 0) {
		    count++
		    continue
		}
		var y = functions[func](x, z)
		if (y != undefined) super.add(new Point(x, y, z, parent))
		count++
	    }
	}
	
	shuffle(this.points)
	// add points
    }
} // Mesh

// pulsating energy!
class Energy extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "work in progress"
	this.pulses = 0
	var numpts = 1000 / pointCountScale
	for (var i = 0; i < numpts; i++) {
	    var phi = Math.acos(1 - 2 * (i + 0.5) / numpts)
	    var theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
	    var radius = 0.6
	    var x = radius * Math.cos(theta) * Math.sin(phi)
	    var y = radius * Math.sin(theta) * Math.sin(phi)
	    var z = radius * Math.cos(phi)
	    super.add(new Point(x, y, z, parent))
	}
	//this.pulse(this)
    }

    pulse(me) {
	var numpts = me.points.length
	for (var i = 0; i < numpts; i++) {
	    var p = me.points[i]
	    var phi = Math.acos(1 - 2 * (i + 0.5) / numpts)
	    var theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
	    var radius = 0.6
	    var x = radius * Math.cos(theta) * Math.sin(phi)
	    var y = radius * Math.sin(theta) * Math.sin(phi)
	    var z = radius * Math.cos(phi)
	    
	    p.x = x
	    p.y = y
	    p.z = z
	}
	me.pulses = (me.pulses + Math.PI / 16 >= 2 * Math.PI) ? 0 : me.pulses + Math.PI / 16

	window.requestAnimationFrame(() => {
	    me.pulse(me)
	})
    }
} // Energy

class Torus extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "torus; like a doughnut"
	var R = 0.65
	var r = 0.3
	var step = 0.001 * pointCountScale
	for (var i = 0; i < 1; i += step) {
	    var phi = i * 2 * Math.PI
	    var theta = 47 * phi
	    var x = (R + r * Math.cos(theta)) * Math.cos(phi)
	    var y = (R + r * Math.cos(theta)) * Math.sin(phi)
	    var z = r * Math.sin(theta)
	    super.add(new Point(x, y, z, parent))
	}
    }
} // Torus

class TwistedTorus extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "twisted torus"
	var step = 0.001 * pointCountScale
	for (var i = 0; i < 1; i += step) {
	    var u = i * 2 * Math.PI
	    var v = 58 * u
	    var x = 0.08 * (8+(Math.sin(2*(u-v+Math.sin(v-u)))+2.5)*Math.cos(u))*Math.cos(v)
	    var y = 0.08 * (8+(Math.sin(2*(u-v+Math.sin(v-u)))+2.5)*Math.cos(u))*Math.sin(v)
	    var z = 0.08 * ((Math.sin(2*(u-v+Math.sin(v-u)))+2.5)*Math.sin(u))
	    super.add(new Point(x, y, z, parent))
	}
    }
} // Torus

class HornTorus extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "horn torus"
	var R = 0.47
	var r = 0.47
	var step = 0.001 * pointCountScale
	for (var i = 0; i < 1; i += step) {
	    var phi = i * 2 * Math.PI
	    var theta = 45 * phi
	    var x = (R + r * Math.cos(theta)) * Math.cos(phi)
	    var y = (R + r * Math.cos(theta)) * Math.sin(phi)
	    var z = r * Math.sin(theta)
	    super.add(new Point(x, z, y, parent))
	}
    }
} // HornTorus

class Tori extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "interlocking tori"
	var R = 0.45
	var r = 0.225	
	var step = 0.002 * pointCountScale
	for (var i = 0; i < 1; i += step) {
	    var phi = i * 2 * Math.PI
	    var theta = 45 * phi
	    var x = (R + r * Math.cos(theta)) * Math.cos(phi)
	    var y = (R + r * Math.cos(theta)) * Math.sin(phi)
	    var z = r * Math.sin(theta)
	    super.add(new Point(x + r, z, y, parent))
	}
	for (var i = 0; i < 1; i += step) {
	    var phi = i * 2 * Math.PI
	    var theta = 45 * phi
	    var x = (R + r * Math.cos(theta)) * Math.cos(phi)
	    var y = (R + r * Math.cos(theta)) * Math.sin(phi)
	    var z = r * Math.sin(theta)
	    super.add(new Point(x - r, y, z, parent))
	}
    }
} // Tori

class Cylinder extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "adjusted horn torus"
	var R = 0.55
	var r = 0.55
	var step = 0.001 * pointCountScale
	for (var i = 0; i < 1; i += step) {
	    var phi = i * 2 * Math.PI
	    var theta = 45 * phi
	    var inter = Math.cos(theta) > 0.4 ? 0.4 : Math.cos(theta)
	    var x = (R + r * inter) * Math.cos(phi)
	    var y = (R + r * inter) * Math.sin(phi)
	    var z = r * Math.sin(theta)
	    super.add(new Point(x, z, -y, parent))
	}
    }
} // Cylinder

class Shell extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "nautilus shell"
	var count = 0
	for (var i = 0; i < 1; i += 0.03125) {
	    for (var j = 0; j < 1; j += 0.03125) {
		if (count % pointCountScale !== 0) {
		    count++
		    continue
		}
		var theta = i * Math.PI
		var phi = j * 11 * Math.PI / 4 - Math.PI / 4
		var x = 0.5 * Math.pow(1.1, phi) * (Math.pow(Math.sin(theta), 2) * Math.sin(phi))
		var y = 0.5 * Math.pow(1.1, phi) * (Math.pow(Math.sin(theta), 2) * Math.cos(phi))
		var z = 0.5 * Math.pow(1.1, phi) * (Math.sin(theta) * Math.cos(theta))
		super.add(new Point(-x, y, z, parent))
		count++
	    }
	}
    }
}

// 1000 points at the origin, used to transition to first shape
// actually, changed this to a bunch of random points for zoom in effect
class Singularity extends Shape {
    constructor(parent) {
	super(parent)
	this.name = "singularity"
	for (var i = 0; i < 1000 / pointCountScale; i++) {
	    super.add(new Point(Math.random() * 2.5 - 1.25, 
				Math.random() * 2.5 - 1.25,
				Math.random() * 2.5 - 1.25, parent))
	}
    }
} // Singularity

/**
 * Returns a shape based on the specified id.
 * (id corresponds to index in shapes array, see below)
 * 
 * @param i an integer specifying which shape to return. If i < 0, a random
 * shape is returned
 * @param parent the DOM element to which to append points if the point
 * should be attached; can be undefined
 */
function getShape(i, parent) {
    if (i < 0) {
	var newMorph = Math.floor(Math.random() * (shapes.length - 1))
	while (newMorph == morphc) {
	    newMorph = Math.floor(Math.random() * (shapes.length - 1))
	}
	morphc = newMorph
    } else morphc = i

    return new shapes[morphc](parent)
}

var shapes = [Cube, Sphere, FullSphere, SpiralSphere, NoisySphere, Disk, Ray, Energy, Torus, TwistedTorus, HornTorus, Tori, Cylinder, Shell, Mesh, Singularity]

/*
 * default mesh functions
 */

var a = function (x, z) {
    return Math.sin(-Math.pow(x * 2.2, 2) + Math.pow(z * 3, 2)) * (x / 1.5)
}

var b = function (x, z) {
    return (17.5 * x * z) / Math.exp((Math.pow(x * 2.5, 2)) + (Math.pow(z * 2.5, 2)))
}

var c = function (x, z) {
    var y = 1/((Math.pow(x, 2) + Math.pow(z, 2)) * 12 + 0.0625) * 0.5 - 0.33
    return (y >= 1) ? undefined : y
}

var functions = [a, b, c]
