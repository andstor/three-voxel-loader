import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from "rollup-plugin-babel";
import { terser } from 'rollup-plugin-terser';

const pkg = require("./package.json");
const date = (new Date()).toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @copyright ${date.slice(-4)} ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @build ${date}
 */`;

const external = ["three"];
const globals = { "three": "THREE" };
const libraryName = "VoxelLoader";

const lib = {

  module: {
    input: "src/index.js",
    external,
    plugins: [resolve(), commonjs(), babel(), json()],
    output: {
      file: pkg.module,
      format: "esm",
      banner
    }
  },

  main: {
    input: "src/index.js",
    external,
    plugins: [resolve(), commonjs(), babel(), json()],
    output: {
      file: pkg.main,
      format: 'umd',
      name: libraryName,
      sourcemap: true,
      globals,
      banner
    }
  },

  min: {
    input: "src/index.js",
    external,
    plugins: [resolve(), commonjs(), babel(), json()],
    output: {
      file: pkg.main.replace(".js", ".min.js"),
      format: 'umd',
      name: libraryName,
      plugins: [terser()],
      globals,
      banner
    }
  }

};

export default [lib.module, lib.main, lib.min];
