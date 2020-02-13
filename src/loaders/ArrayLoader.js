/**
 * @author André Storhaug <andr3.storhaug@gmail.com>
 */

import { FileLoader, LoadingManager, Vector3, DefaultLoadingManager, BoxBufferGeometry, Mesh } from 'three';
import { PointOctree } from "sparse-octree";

/**
 * Class for loading voxel data stored as a 3D array.
 */
class ArrayLoader {
  /**
   * Create an ArrayLoader.
   * @param {LoadingManager} manager
   */
  constructor(manager) {
    this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;
  }

	/**
	 * Loads and parses a 3D array stored in a JS file from a URL.
	 * @param {String} url URL to the JS file with array.
	 * @param {Function} [onLoad] Callback invoked with the loaded object.
	 * @param {Function} [onProgress] Callback for download progress.
	 * @param {Function} [onError] Callback for download errors.
	 */
	load ( url, onLoad, onProgress, onError ) {
		var scope = this;

    var loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer')
    loader.load(url, function (buffer) {

      scope.parse(buffer)
        .then(octree => onLoad(octree))
        .catch(err => console.error(err))

    }, onProgress, onError);
	}

	/**
	 * Parses a 3D array.
   * @param {number[][][]} matrix The matrix to be transformed.
	 * @return {PointOctree} Octree with data from the VOX file data.
	 */
	parse ( array ) {
    const minX = 0
    const maxX = array[0][0].length - 1

    const minZ = 0
    const maxZ = array.length - 1

    const minY = 0
    const maxY = array[0].length - 1

    const min = new Vector3(minX, minY, minZ);
    const max = new Vector3(maxX, maxY, maxZ);

    const octree = new PointOctree(min, max, 0, 1, 100);

    var geometry = new BoxBufferGeometry(1, 1, 1);
    var voxel = new Mesh(geometry);

		for ( var i = 0; i < array.length; i ++ ) { // z-axis
      for (let j = 0; j < array[i].length; j++) { // y-axis
        for (let k = 0; k < array[i][j].length; k++) { // x-axis
          const element = array[i][j][k];
          if (element === 1) {
            octree.insert(new Vector3(k, j, i), voxel);
          }
        }
      }
		}

    return octree;
  }
}

export { ArrayLoader };
