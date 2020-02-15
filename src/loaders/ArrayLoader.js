/**
 * @author André Storhaug <andr3.storhaug@gmail.com>
 */

import { FileLoader, Loader, LoadingManager, Vector3 } from 'three';
import { PointOctree } from "sparse-octree";
import autoBind from 'auto-bind';

/**
 * Class for loading voxel data stored as a 3D array.
 */
class ArrayLoader extends Loader {
  /**
   * Create an ArrayLoader.
   * @param {LoadingManager} manager
   */
  constructor(manager) {
    super(manager)
    autoBind(this);
    this.LOD = null;
    this.setLOD();
  }

	/**
	 * Loads and parses a 3D array stored in a JS file from a URL.
	 * @param {String} url URL to the JS file with array.
	 * @param {Function} [onLoad] Callback invoked with the loaded object.
	 * @param {Function} [onProgress] Callback for download progress.
	 * @param {Function} [onError] Callback for download errors.
	 */
  load(url, onLoad, onProgress, onError) {
    var scope = this;

    var loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    //loader.setResponseType('arraybuffer')
    loader.load(url, function (buffer) {

      scope.parse(buffer)
        .then(octree => onLoad(octree))
        .catch(err => console.error(err))

    }, onProgress, onError);
  }

  /**
   * Set the vanted level of detail (LOD).
   * @param {number} [maxPoints=1] Number of distinct points per octant in octree before it splits up.
   * @param {number} [maxDepth=8] The maximum octree depth level, starting at 0.
   */
  setLOD(maxPoints = 1, maxDepth = 8) {
    this.LOD = { maxPoints: maxPoints, maxDepth: maxDepth }
  }

	/**
	 * Parses a 3D array.
   * @param {number[][][]} matrix The matrix to be transformed.
	 * @return {Promise<PointOctree>} Promise with an octree filled with voxel data.
	 */
  parse(array) {
    var scope = this;
    return new Promise((resolve, reject) => {

      const minX = -(array[0][0].length - 1)/2
      const maxX = (array[0][0].length - 1)/2

      const minZ = -(array.length - 1)/2
      const maxZ = (array.length - 1)/2

      const minY = -(array[0].length - 1)/2
      const maxY = (array[0].length - 1)/2

      const min = new Vector3(minX, minY, minZ);
      const max = new Vector3(maxX, maxY, maxZ);

      const octree = new PointOctree(min, max, 0, scope.LOD.maxPoints, scope.LOD.maxDepth);

      var voxelData = {};

      for (var i = 0; i < array.length; i++) { // z-axis
        for (let j = 0; j < array[i].length; j++) { // y-axis
          for (let k = 0; k < array[i][j].length; k++) { // x-axis
            const element = array[i][j][k];
            if (element === 1) {

              let x = k - ((array[i][j].length - 1) / 2);
              let y = j - ((array[i].length - 1) / 2);
              let z = i - ((array.length - 1) / 2);

              octree.insert(new Vector3(x, y, z), voxelData);
            }
          }
        }
      }

      resolve(octree);
    });
  }
}

export { ArrayLoader };
