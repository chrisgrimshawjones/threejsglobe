//--------------------------------------------------------------------------------------------------

// the wrapper for the canvas
var globe = document.getElementById("globe");

// sizing (set to window height, and width for default)
// var	_height = window.innerHeight;
// var	_width = window.innerWidth;
var	_height = 1200;
var	_width = 1200;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, _width/_height, 0.1, 1000 );	// dont want a stretched effect like widescreen tv
var renderer = new THREE.WebGLRenderer({ alpha: true });	// allow alpha
renderer.setSize( _width, _height );
renderer.setClearColor( 0xffffff, 0);

globe.appendChild( renderer.domElement );

// create the shape in this case a globe
var geometry   = new THREE.SphereGeometry(0.5, 32, 32);
var material = new THREE.MeshPhongMaterial();
var globe = new THREE.Mesh( geometry, material );

scene.add( globe );

// for meshPhoneMaterial to work you need to add a light
// var light	= new THREE.DirectionalLight( 'white', 1)
// light.position.set(5,5,5)
// light.target.position.set( 0, 0, 0 )
// scene.add( light )

var light	= new THREE.DirectionalLight( 0xcccccc, 0.9)
light.position.set(5,3,3)
scene.add( light )

// set camera position 0 is inside the shape and the higher you go the further away it gets
camera.position.z = 1;

// wrap the sphere in an image of the earth
material.map = THREE.ImageUtils.loadTexture('images/earthmap10k.jpg');

//add some textures (another image layer)
// material.bumpMap    = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
// material.bumpScale = 0.05;

// create destination canvas
var canvasResult	= document.createElement('canvas')
canvasResult.width	= 1024
canvasResult.height	= 512
var contextResult	= canvasResult.getContext('2d')		

//add specular textures (I think this makes things reflective and fucks with the lights)
// material.specularMap    = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg')
// material.specular  = new THREE.Color('grey')



//--------------------------------------------------------------------------------------------------

// load earthcloudmap
var imageMap	= new Image();
imageMap.addEventListener("load", function() {
	
	// create dataMap ImageData for earthcloudmap
	var canvasMap	= document.createElement('canvas')
	canvasMap.width	= imageMap.width
	canvasMap.height= imageMap.height
	var contextMap	= canvasMap.getContext('2d')
	contextMap.drawImage(imageMap, 0, 0)
	var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

	// load earthcloudmaptrans
	var imageTrans	= new Image();
	imageTrans.addEventListener("load", function(){
		// create dataTrans ImageData for earthcloudmaptrans
		var canvasTrans		= document.createElement('canvas')
		canvasTrans.width	= imageTrans.width
		canvasTrans.height	= imageTrans.height
		var contextTrans	= canvasTrans.getContext('2d')
		contextTrans.drawImage(imageTrans, 0, 0)
		var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
		// merge dataMap + dataTrans into dataResult
		var dataResult		= contextMap.createImageData(canvasMap.width, canvasMap.height)
		for(var y = 0, offset = 0; y < imageMap.height; y++){
			for(var x = 0; x < imageMap.width; x++, offset += 4){
				dataResult.data[offset+0]	= dataMap.data[offset+0]
				dataResult.data[offset+1]	= dataMap.data[offset+1]
				dataResult.data[offset+2]	= dataMap.data[offset+2]
				dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]
			}
		}
		// update texture with result
		contextResult.putImageData(dataResult,0,0)	
		material.map.needsUpdate = true;
	})
	imageTrans.src	= 'images/earthcloudmaptrans.jpg';
}, false);
imageMap.src	= 'images/earthcloudmap.jpg';

var geometry	= new THREE.SphereGeometry(0.503, 32, 32)
var material	= new THREE.MeshPhongMaterial({
	map		: new THREE.Texture(canvasResult),
	side		: THREE.DoubleSide,
	transparent	: true,
	opacity		: 0.8,
})

var mesh = new THREE.Mesh(geometry, material);

scene.add( mesh );

var render = function () {
	requestAnimationFrame( render );

	//globe.rotation.x += 0.0;
	globe.rotation.y += 0.001;
		mesh.rotation.x += 0.0001;
	mesh.rotation.y += 0.001;

	renderer.render(scene, camera);
};

render();


//--------------------------------------------------------------------------------------------------