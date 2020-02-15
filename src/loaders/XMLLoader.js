/**
 * @author André Storhaug <andr3.storhaug@gmail.com>
 */

import { Loader } from 'three/src/loaders/Loader';
import autoBind from 'auto-bind';
import { FileLoader, Vector3, LoadingManager } from 'three';
import { PointOctree } from "sparse-octree";

/**
 * Class for loading voxel data stored in XML files.
 * @extends Loader
 */
class XMLLoader extends Loader {
  /**
   * Create a XMLLoader.
   * @param {LoadingManager} manager
   */
  constructor(manager) {
    super(manager)
    autoBind(this);
    this.LOD = null;
    this.setLOD();
  }

	/**
	 * Loads and parses a XML file from a URL.
	 *
	 * @param {String} url - URL to the XML file.
	 * @param {Function} [onLoad] - Callback invoked with the loaded object.
	 * @param {Function} [onProgress] - Callback for download progress.
	 * @param {Function} [onError] - Callback for download errors.
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
	 * Parse XML file data.
	 * @param {Buffer} buffer Content of XML file.
	 * @return {Promise<PointOctree>} Promise with an octree filled with voxel data.
	 */
  parse(buffer) {
    return new Promise((resolve, reject) => {

      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(buffer, "application/xml");

      const dimensionsNode = xmlDoc.documentElement.getElementsByTagName("dimensions")[0];
      const widthNode = dimensionsNode.getElementsByTagName("width")[0];
      const width = widthNode.childNodes[0].nodeValue;
      const heightNode = dimensionsNode.getElementsByTagName("height")[0];
      const height = heightNode.childNodes[0].nodeValue;
      const depthNode = dimensionsNode.getElementsByTagName("depth")[0];
      const depth = depthNode.childNodes[0].nodeValue;

      const voxelsNode = xmlDoc.documentElement.getElementsByTagName("voxels")[0];
      const voxelNodes = voxelsNode.getElementsByTagName("voxel");

      const min = new Vector3(-width / 2, -height / 2, -depth / 2);
      const max = new Vector3(width / 2, height / 2, depth / 2);

      const octree = new PointOctree(min, max, 0, this.LOD.maxPoints, this.LOD.maxDepth);
      let voxelData = {};

      Array.from(voxelNodes).forEach(voxelNode => {
        for (let i = 0; i < voxelNode.children.length; i++) {
          const positionNode = voxelNode.children[i];
          let x, y, z;

          const xNode = positionNode.getElementsByTagName("x")[0];
          x = xNode.childNodes[0].nodeValue;
          const yNode = positionNode.getElementsByTagName("y")[0];
          y = yNode.childNodes[0].nodeValue;
          const zNode = positionNode.getElementsByTagName("z")[0];
          z = zNode.childNodes[0].nodeValue;

          x = x - width / 2;
          y = y - height / 2;
          z = z - depth / 2;
          octree.insert(new Vector3(x, y, z), voxelData);
        }
      });

      resolve(octree);
    });
  }


}

export { XMLLoader };
