import Editor from './Editor.js'
const recast = require('recast');
let acorn = require("acorn");


///////////////////////////////////

class Visitor {

  constructor(){
    this.ast = [];
  }

  /* Deal with nodes in an array */
  visitNodes(nodes) { 
    for (const node of nodes){ 
      this.visitNode(node); 
    }
  }

  /* Dispatch each type of node to a function */
  visitNode(node) {
    console.log("visit node");
    switch (node.type) {
      case 'Program': return this.visitProgram(node);
      case 'VariableDeclaration': return this.visitVariableDeclaration(node);
      case 'VariableDeclarator': return this.visitVariableDeclarator(node);
      case 'Identifier': return this.visitIdentifier(node);
      case 'Literal': return this.visitLiteral(node);
    }
  }
  /* Functions to deal with each type of node */
  visitProgram(node) { 
    this.ast.push({name: 'program'});
    return this.visitNodes(node.body); 
  }
  visitVariableDeclaration(node) {
    console.log("variable dec") 
    return this.visitNodes(node.declarations); 
  }
  visitVariableDeclarator(node) {
    this.visitNode(node.id);
    return this.visitNode(node.init);
  }
  visitIdentifier(node) { 
    return node.name; 
  }
  visitLiteral(node) { 
    return node.value; 
  }
}

test('adds 1 + 2 to equal 3', () => {

  const code = `
    function drawBg(){
      ctx.fillRect(0,0,100,100);
    }

    for(let i=0; i<10; i++){
      ctx.fillRect(0,0,i*10, i*100);
      drawBg();
    }
  `;

  const ast = acorn.parse(code, {ecmaVersion: 2020});

  /* Create a Visitor object and use it to traverse the AST */
  var visitor = new Visitor();
  visitor.visitNode(ast);
  
  console.log(visitor);

  expect(1+2).toBe(3);
});