
var camera, scene, renderer,
  model, loader, stats, controls;

function init() {
  // Stats
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFFFFFF);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  let mainNode = document.getElementById("viewport");
  mainNode.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(20, 4, 10);

  // Camera Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.update();

  controls.addEventListener('start', function () {
    controls.autoRotate = false;
  });

  // Lights
  var ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);

  var light = new THREE.DirectionalLight(0xdfebff, 1);
  light.position.set(300, 500, 100);
  light.position.multiplyScalar(1);
  scene.add(light);

  // GUI
  const models = {
    'chicken': './models/chicken.vox',
  }

  var params = {
    model: models["chicken"],
    size: 0.93,
    material: {
      color: 0xffffff,
    },
    LOD: {
      maxPoints: 1,
      maxDepth: 10
    },
    renderer: {
      triangles: 0
    }
  };

  var gui = new dat.GUI();

  gui.add(params, 'model', models).onChange(m => {
    _toggleLoading(true);
    loader.loadFile(params.model, function (voxels) {
      resetScene();
      model = voxels;
      renderModel();
    });
  });

  gui.add(params, 'size').min(0.01).max(1).step(0.01).onFinishChange(d => {
    params.size = d;
    loader.setVoxelSize(params.size);
    resetScene();
    model = loader.generateMesh(loader.octree);
    renderModel();
  });

  var lod = gui.addFolder('Level Of Detail');
  lod.add(params.LOD, 'maxPoints').min(1).max(30).step(1).onFinishChange(d => {
    params.LOD.maxPoints = d;
    resetScene();
    loader.setLOD(d);
    _toggleLoading(true);
    loader.update().then((octree) => {
      model = loader.generateMesh(octree);
      renderModel();
    });
  });
  lod.add(params.LOD, 'maxDepth').min(1).max(10).step(1).onFinishChange(d => {
    params.LOD.maxDepth = d;
    resetScene();
    loader.setLOD(undefined, d);
    _toggleLoading(true);
    loader.update().then((octree) => {
      model = loader.generateMesh(octree);
      renderModel();
    });
  });
  lod.open();

  var mat = gui.addFolder('Material');
  mat.addColor(params.material, 'color').onChange(color => {
    params.material.color = color;
    model.material.color.set(color)
    requestRenderIfNotRequested();
  });
  var info = gui.addFolder('Render Info');
  info.add(renderer.info.render, 'triangles').listen();


  // Voxel Loader
  loader = new VoxelLoader();
  loader.setVoxelSize(params.size)
  loader.setLOD(params.LOD.maxPoints, params.LOD.maxDepth);

  loader.loadFile(params.model, function (voxels) {
    model = voxels;
    renderModel()
  });

  function _toggleLoading(bool) {
    let loaderNode = document.getElementById("loader");
    if (bool) {
      loaderNode.style.display = "block";
    } else {
      loaderNode.style.display = "none";
    }
    function wait() {
      if (loaderNode.style.display != "block") {
        requestAnimationFrame(wait);
      }
    }
    wait();
  }

  function renderModel() {
    _toggleLoading(false);
    model.position.x = 0.5
    model.position.z = 0.5
    scene.add(model)
    requestRenderIfNotRequested()
  }

  function resetScene() {
    scene.remove(model);
    model.geometry.dispose()
    scene.dispose();
    requestRenderIfNotRequested();
  }
}

function resizeRendererToDisplaySize() {
  const canvas = renderer.domElement;
  const height = window.innerHeight;
  const width = window.innerWidth;
  const needResize = canvas.width != width || canvas.height != height;
  if (needResize) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRenderIfNotRequested()
  }
}

let renderRequested = false;
function render() {
  renderRequested = false;
  controls.update();

  stats.begin();
  renderer.render(scene, camera);
  stats.end();
}

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

window.addEventListener('load', function () {
  init();
  render();

  controls.addEventListener('change', requestRenderIfNotRequested);
  window.addEventListener('resize', resizeRendererToDisplaySize);
})
