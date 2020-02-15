/**
 * @author André Storhaug <andr3.storhaug@gmail.com>
 */

import autoBind from 'auto-bind';
import { Color, BufferGeometry, Loader, MeshPhongMaterial, BoxGeometry, Vector3, Mesh, Geometry, VertexColors } from 'three';
import { LoaderFactory } from "./LoaderFactory";

/**
 * Class for loading voxel data stored in various formats.
 * @extends Loader
 */
class VoxelLoader extends Loader {
  /**
   * Create a VoxelLoader.
   * @param {LoadingManager} manager
   */
  constructor(manager) {
    super(manager);
    autoBind(this);

    this.octree = null;
    this.LOD = null;
    this.setLOD();

    this.material = null;
    this.setVoxelMaterial();
    this.voxelSize = null;
    this.setVoxelSize();
  }

  /**
   * Set the material used for all voxels.
   * Note that the {@link Material.vertexColors} will be set to {@link VertexColors}.
   * @param {Material} Material The wanted material.
   */
  setVoxelMaterial(material) {
    let defaultMaterial = new MeshPhongMaterial({
      color: 0xffffff
    });

    material = typeof material !== 'undefined' ? material : defaultMaterial;
    material.vertexColors = VertexColors
    this.material = material;
  }

  /**
   * Set the size of the cubes representing voxels generated in {@link VoxelLoader#generateMesh}.
   * @param {float} [voxelSize=1]
   */
  setVoxelSize(voxelSize = 1) {
    this.voxelSize = voxelSize;
  }

  /**
   * Set the vanted level of detail (LOD).
   * @param {number} maxPoints Number of distinct points per octant in octree before it splits up.
   * @param {number} maxDepth The maximum octree depth level, starting at 0.
   */
  setLOD(maxPoints = 1, maxDepth = 8) {
    this.LOD = { maxPoints: maxPoints, maxDepth: maxDepth }
  }

  /**
	 * Loads and parses a 3D model file from a URL.
	 *
	 * @param {String} url - URL to the VOX file.
	 * @param {Function} [onLoad] - Callback invoked with the loaded object.
	 * @param {Function} [onProgress] - Callback for download progress.
	 * @param {Function} [onError] - Callback for download errors.
	 */
  loadFile(url, onLoad, onProgress, onError) {
    let scope = this;
    let extension = url.split('.').pop().toLowerCase();
    let loaderFactory = new LoaderFactory();

    let loader = loaderFactory.getLoader(extension);
    loader.setLOD(this.LOD.maxPoints, this.LOD.maxDepth);

    loader.load(url, function (octree) {
      scope.octree = octree;
      onLoad(scope.generateMesh(octree));
    }, onProgress, onError);
  }

  /**
   * Parses voxel data.
   * @param {PointOctree} octree Octree with voxel data stored as points in space.
	 * @return {Promise<PointOctree>} Promise with an octree filled with voxel data.
   */
  parseData(data, type) {
    let scope = this;
    let loaderFactory = new LoaderFactory();

    let loader = loaderFactory.getLoader(type);
    loader.setLOD(this.LOD.maxPoints, this.LOD.maxDepth);

    return new Promise((resolve, reject) => {
      loader.parse(data).then((octree) => {
        scope.octree = octree;
        resolve(scope.generateMesh(octree));
      });
    });
  }

  /**
   * Generates a polygon mesh with cubes based on voxel data.
   * One cube for each voxel.
   * @param {PointOctree} octree Octree with voxel data stored as points in space.
   * @returns {Mesh} 3D mesh based on voxel data
   */
  generateMesh(octree) {
    console.log("Generating Mesh")

    let mergedGeometry = new Geometry();
    let voxelGeometry = new BoxGeometry(this.voxelSize, this.voxelSize, this.voxelSize);
    const material = this.material;
    let s = 1
    //voxelGeometry.scale(s, s, s);

    console.log("Generating cubes")

    for (const leaf of octree.leaves()) {
      if (leaf.points !== null) {
        const pos = new Vector3();
        var i;
        for (i = 0; i < leaf.points.length; i++) {
          const point = leaf.points[i];
          pos.add(point);
        }
        pos.divideScalar(i);

        //voxelGeometry.scale(i, i, i);

        const rgb = leaf.data[0].color;
        if (rgb != null) {
          const color = new Color().setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);

          for (var i = 0; i < voxelGeometry.faces.length; i++) {
            let face = voxelGeometry.faces[i];
            face.color.set(color);
          }
        }

        voxelGeometry.translate(pos.x, pos.y, pos.z);
        mergedGeometry.merge(voxelGeometry);
        voxelGeometry.translate(-pos.x, -pos.y, -pos.z);

        //voxelGeometry.scale(-i, -i, -i);

      }
    }
    console.log("Generated cubes");

    let bufGeometry = new BufferGeometry().fromGeometry(mergedGeometry);
    bufGeometry.computeFaceNormals();
    bufGeometry.computeVertexNormals();

    var voxels = new Mesh(bufGeometry, material);
    console.log("Mesh Generated");
    return voxels;
  }
}

export default VoxelLoader;
