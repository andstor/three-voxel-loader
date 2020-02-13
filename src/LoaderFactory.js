/**
 * @author André Storhaug <andr3.storhaug@gmail.com>
 */

import { ArrayLoader } from "./loaders/ArrayLoader"
import { VOXLoader } from "./loaders/VOXLoader"

/**
 * Factory class for creating various loaders.
 */
class LoaderFactory {
  /**
   * Get a loader based on type.
   * @param {string} type The type of loader to get.
   */
  getLoader(type) {
    switch (type) {
      case 'vox':
        return new VOXLoader();
        break;
      case 'array':
        return new ArrayLoader();
        break;
      default:
        throw new Error('Unsupported type (' + type + ').');
        break;
    }
  }
}

export { LoaderFactory };
