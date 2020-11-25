import Editor from './Editor.js'
const recast = require('recast');
let acorn = require("acorn");


///////////////////////////////////

class Visitor {

  /* Deal with nodes in an array */
  visitNodes(nodes) { 
    return nodes.map(n => this.visitNode(n))
  }

  /* Dispatch each type of node to a function */
  visitNode(node) {
    console.log("node_type", node.type)
    switch (node.type) {
      case 'Program': return this.visitProgram(node);
      case 'VariableDeclaration': return this.visitVariableDeclaration(node);
      case 'VariableDeclarator': return this.visitVariableDeclarator(node);
      case 'ExpressionStatement': return this.visitExpressionStatement(node);
      case 'ForStatement': return this.visitForStatement(node);
      case 'Identifier': return this.visitIdentifier(node);
      case 'Literal': return this.visitLiteral(node);
    }
  }
  /* Functions to deal with each type of node */
  visitProgram(node) { 
    return {
      type: 'program',
      nodes: this.visitNodes(node.body)
    } 
  }
  visitVariableDeclaration(node) {
    return {
      type: 'variableDecleration',
      nodes: this.visitNodes(node.declarations)
    } 
  }
  visitVariableDeclarator(node) {
    this.visitNode(node.id);
    return {
      type: 'variableDeclarator',
      nodes: this.visitNode(node.init)
    }
  }
  visitIdentifier(node) { 
    return {
      type: 'identifier',
      name: node.name
    } 
  }
  visitLiteral(node) { 
    return {
      type: 'literal',
      value: node.value
    } 
  }
  visitExpressionStatement(node){
    if(node.expression.type !== "CallExpression"){
      return;
    }

    return {
      type: 'expression',
      start: node.start,
      end: node.end,
      name: node.expression.callee.object.name
    }
  }
  visitForStatement(node){
    return {
      type: 'forStatement',
      start: node.start, 
      end: node.end,
      nodes: this.visitNodes(node.body.body)
    }
  }
}

test('adds 1 + 2 to equal 3', () => {

  const code = `
      ctx.fillRect(0,0,100,100);
      
      for(let i=0; i<10; i++){
        ctx.fillRect(0,0,100,100);
      }
  `;

  const ast = acorn.parse(code, {ecmaVersion: 2020});

  /* Create a Visitor object and use it to traverse the AST */
  var visitor = new Visitor();
  const z = visitor.visitNode(ast);
  
  console.log(z);
 
  expect(1+2).toBe(3);
});