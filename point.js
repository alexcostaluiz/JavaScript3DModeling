/**
 * point.js
 * 10/17/2019
 * Defines the 3D point objects to be used
 * for a 3D modeling program.
 *
 * @author Alexander Luiz Costa
 * @version 1.0.0
 */

/*
 * Represents a point in 3D space.
 */
class Point {
    /**
     * Constructs a Points object.
     *
     * @param x the x-coordinate of the point
     * @param y the y-coordinate of the point
     * @param z the z-coordinate of the point
     * @param parent the DOM element to which to append points if the point
     * should be attached; can be undefined
     */
    constructor(x, y, z, parent) {
	this.x = x
	this.y = y
	this.z = z
	this.parent = parent
	if (parent !== undefined) {
	    this.node = document.createElement("div")
	    this.node.classList.add("node")
	    parent.appendChild(this.node)
	    this.draw()
	}
	this.distortX = 0
	this.distortY = 0
    } // constructor
    
    /*
     * Rotates a point around the x-axis.
     * 
     * @param rad radians by which to rotate points (should be small to avoid
     * jumpy animations (~ Math.PI / 360))
     */
    rotateX(rad) {
	var tempY = this.y
	var tempZ = this.z
	this.y = tempY * Math.cos(rad) - tempZ * Math.sin(rad)
	this.z = tempY * Math.sin(rad) + tempZ * Math.cos(rad)
    } // rotateX
    
    /*
     * Rotates a point around the y-axis.
     * 
     * @param rad radians by which to rotate points (should be small to avoid
     * jumpy animations (~ Math.PI / 360))
     */
    rotateY(rad) {
	var tempX = this.x
	var tempZ = this.z
	this.x = tempX * Math.cos(rad) + tempZ * Math.sin(rad)
	this.z = tempX * -Math.sin(rad) + tempZ * Math.cos(rad)
    } // rotateY
    
    /*
     * Rotates a point around the z-axis.
     * 
     * @param rad radians by which to rotate points (should be small to avoid
     * jumpy animations (~ Math.PI / 360))
     */
    rotateZ(rad) {
	var tempX = this.x
	var tempY = this.y
	this.x = tempX * Math.cos(rad) - tempY * Math.sin(rad)
	this.y = tempX * Math.sin(rad) + tempY * Math.cos(rad)
    } // rotateZ

    /* 
     * Projects the 3D point onto a 2D view.
     */
    projectX() {
	return this.x / (this.z + 1.5) * mWidth / 2 + mWidth / 2 - 4.5 + mOffsetLeft
    }
    projectY() {
	return this.y / (this.z + 1.5) * mHeight / 2 + mHeight / 2 - 4.5 + mOffsetTop
    }
    
    // called after a rotation, projects the point and adds opacity and
    // scale effect with a basic linear function based on z value
    draw() {
	if (this.parent === undefined) return
	var sscale = ((1 - this.z - 0.5) * 0.7 + 0.3) * (0.7 * meshScale + 0.3)
	//var oscale = ((1 - this.z - 0.5) * 0.5 + 0.5)
	//this.node.style.opacity = oscale
	this.node.style.transform = "scale(" + sscale + ")"
	this.node.style.left = this.projectX() + this.distortX + "px"
	this.node.style.top = this.projectY() + this.distortY + "px"
    } // draw
 } // Point
