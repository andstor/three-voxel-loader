# three-voxel-loader

> three.js plugin for loading voxel data

[![npm version](http://img.shields.io/npm/v/three-voxel-loader.svg?style=flat)](https://npmjs.org/package/three-voxel-loader "View this project on npm")
![Build](https://github.com/andstor/three-voxel-loader/workflows/Build/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/andstor/three-voxel-loader/badge.svg?branch=master)](https://coveralls.io/github/andstor/three-voxel-loader?branch=master)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/andstor/three-voxel-loader.svg?)](https://lgtm.com/projects/g/andstor/three-voxel-loader/context:javascript)

This is a plugin for [three.js](https://github.com/mrdoob/three.js). It provides support for loading voxel data and turning it into a three.js [Mesh](https://threejs.org/docs/#api/en/objects/Mesh).

[Examples](https://andstor.github.io/three-voxel-loader/examples/) - 
[Documentation](https://andstor.github.io/three-voxel-loader/) - 
[Wiki](https://github.com/andstor/three-voxel-loader/wiki)

## Table of Contents

  * [Preview](#preview)
  * [Installation](#installation)
  * [Usage](#usage)
  * [Import support](#import-support)
  * [License](#license)


## 🖼 Preview

<p align=center>
	<img width="450" src="https://raw.githubusercontent.com/andstor/three-voxel-loader/master/media/load-model.png" alt="Preview">
</p>

## Installation

This library requires the peer dependency [three.js](https://github.com/mrdoob/three.js/).

```sh
$ npm install --save three
```

```sh
$ npm install --save three-voxel-loader
```

## Usage

### Syntax

```js
new VoxelLoader()
```

### Example

```js
const VoxelLoader = require('three-voxel-loader');

// Instantiate the loader
let loader = new VoxelLoader();

// Load a resource from provided URL.
loader.load(
  // Resource URL.
  'models/chicken.vox',

  // Called when resource is loaded.
  function ( voxels ) {
    scene.add( voxels );
  },

  // Called when loading is in progresses.
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },

  // Called when loading has errors.
  function ( error ) {
    console.log( 'An error happened' );
  }
);
```

## Import support

Importing of several file types and data structures with voxel data are supported.

### File formats

- VOX
- XML

### Data structures

- 3D array
- [Sparse octree](https://github.com/vanruesc/sparse-octree)

## License

Copyright © 2020 [André Storhaug](https://github.com/andstor)

three-voxel-loader is licensed under the [MIT License](https://github.com/andstor/three-voxel-loader/blob/master/LICENSE).

