class Editor{
  constructor(){
    this.codeFunc = null;
    this.DONT_REFRESH = false;

    const value = "// ctx is injected\n\nctx.fillRect(0, 0, 100, 100);\n\n";
    const language = "javascript";

    this.drawingMapper = new DrawingMapper();
    this.model = monaco.editor.createModel(value, language)

    this.editor = monaco.editor.create(document.getElementById('code-panel'), {
      value: value,
      language: language,
      glyphMargin: true
    });

    this.editor.setModel(this.model);
    
    this.editor.onDidChangeCursorPosition(this.onDidChangeCursorPosition.bind(this));
    this.model.onDidChangeContent(this.onDidChangeContent.bind(this));
  }

  onDidChangeCursorPosition(e){
    // code -> drawing mapping
    this.highlightCanvas(e.position.lineNumber);
  }

  onDidChangeContent(){
    const code = this.model.getValue();
    this.updateCode(code);
    this.executeCode();

    if(!this.DONT_REFRESH){
      this.saveCode(code);
    }
  }

  saveCode(code){
    localStorage.setItem('cclab_code', code);

    const viewState = this.editor.saveViewState();
    localStorage.setItem('cclab_viewstate', JSON.stringify(viewState))
  }

  loadCode(){
    return localStorage.getItem('cclab_code')
  }

  executeCode(){
    context.clearRect(0, 0, 800, 600);
    
    try{
      this.drawingMapper.calls = [];
      this.codeFunc(this.drawingMapper.getCtx())
      document.getElementById("indicator").style.backgroundColor = "rgb(0,230,23)";
      console.log(this.drawingMapper.calls);
    }
    catch (error){
      const err = extractErrorInfo(error);
      console.log(err);
      document.getElementById("indicator").style.backgroundColor = "rgb(243, 12,34)";
    }
  }

  highlightCanvas(curLine){
    const mappings = this.drawingMapper.calls;

    context.clearRect(0, 0, 800, 600);
    this.executeCode();

    context.save()
    context.strokeStyle = "red";
    context.lineWidth = 3;

    for(let i=0; i<mappings.length; i++){
      let m = mappings[i];
      if(m.lineNumber == curLine){
        context.strokeRect(m.x, m.y, m.w, m.h)
      }
    }
    context.restore();

  }

  updateCode(code){
    this.codeFunc = new Function("ctx", code)
    this.drawingMapper = new DrawingMapper()
  }

  start(){
    const savedCode = this.loadCode();
    if (savedCode) {
      this.DONT_REFRESH = true;
      this.model.setValue(savedCode);
      this.DONT_REFRESH = false;
      
      this.updateCode(savedCode);

        const viewState = localStorage.getItem('cclab_viewstate');
        if (viewState){
          this.editor.restoreViewState(JSON.parse(viewState));
        }
    }  
  }
}
	
//----------------------------------

const context = document.getElementById("canvas").getContext("2d");

// Wrap drawing context
class DrawingMapper{
  constructor(){
    this.calls = []
  }
  getCtx(){
    // all the ctx api has to be wrapped :\
    return {
      fillRect: (x,y,w,h) => {
        const err = new Error();
        this.calls.push({
          caller: this.getCaller(err),
          lineNumber: this.getLine(err),
          x,y,w,h
        })

        context.fillRect(x,y,w,h)
      }
    }
  }
  getCaller(err){
    var stackTrace = (new Error()).stack; // Only tested in latest FF and Chrome
    var callerName = stackTrace.replace(/^Error\s+/, ''); // Sanitize Chrome
    callerName = callerName.split("\n")[1]; // 1st item is this, 2nd item is caller
    callerName = callerName.replace(/^\s+at Object./, ''); // Sanitize Chrome
    callerName = callerName.replace(/ \(.+\)$/, ''); // Sanitize Chrome
    callerName = callerName.replace(/\@.+/, ''); // Sanitize Firefox

    return callerName
  }
  getLine(err){
    const start = err.stack.indexOf("<anonymous>:")
    const end = err.stack.indexOf(")", start+11);
    const str = err.stack.substr(start+12, end-1).split(":");
    return str[0]-2;
  }
}

function extractErrorInfo(err){
	const start = err.stack.indexOf("<anonymous>:")
	const end = err.stack.indexOf(")", start+11);
	const str = err.stack.substr(start+12, end-1).split(":");

	return {
		message: err.message,
		lineNumber: str[0]-2,
		columnNumber: str[1]
	}
}


const editor = new Editor()

editor.start();