import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
  input: ["./src/Game.ts"],
  output: {
    file: "./dist/game.js",
    name: "TripleTriadRemastered",
    format: "iife",
    sourcemap: false,
    intro: "var global = window;",
  },
  plugins: [
    replace({
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
      "typeof EXPERIMENTAL": JSON.stringify(true),
      "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
      "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
      "typeof FEATURE_SOUND": JSON.stringify(true),
    }),
    resolve({
      extensions: [".ts", ".tsx"],
    }),
    nodeResolve({ browser: true }),
    commonjs({
      include: [
        "node_modules/eventemitter3/**",
        "node_modules/phaser/**",
        "node_modules/seedrandom/**",
        "node_modules/shuffle-array/**",
      ],
      exclude: ["node_modules/phaser/src/polyfills/requestAnimationFrame.js"],
      sourceMap: false,
      ignoreGlobal: true,
    }),
    typescript(),
    terser({
      mangle: false,
    }),
  ],
};
