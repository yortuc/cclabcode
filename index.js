import Editor from './Editor.js';

const context = document.getElementById("canvas").getContext("2d");

const editor = new Editor(context)

editor.start();