import {extractErrorInfo} from './utils.js'

export default class Editor {
    constructor(context) {
        this.context = context;
        this.codeFunc = null;
        this.DONT_REFRESH = false;
        this.pendingUpdate = null;
        this.codeUpdateBuffer = 500;

        const value = "// ctx is injected\n\nctx.fillRect(0, 0, 100, 100);\n\n";
        const language = "javascript";

        this.model = monaco.editor.createModel(value, language);

        this.editor = monaco.editor.create(
            document.getElementById("code-panel"),
            {
                value: value,
                language: language,
                glyphMargin: true,
            }
        );

        this.editor.setModel(this.model);
        this.model.onDidChangeContent(this.onDidChangeContent.bind(this));
    }

    onDidChangeContent() {
        const code = this.model.getValue();
        
        if (this.pendingUpdate) {
            clearTimeout(this.pendingUpdate)
        }

        this.pendingUpdate = setTimeout(()=> {
            this.updateCode(code);
            this.executeCode();
    
            if (!this.DONT_REFRESH) {
                this.saveCode(code);
            }
        }, this.codeUpdateBuffer);
    }

    saveCode(code) {
        localStorage.setItem("cclab_code", code);

        const viewState = this.editor.saveViewState();
        localStorage.setItem("cclab_viewstate", JSON.stringify(viewState));
    }

    loadCode() {
        return localStorage.getItem("cclab_code");
    }

    executeCode() {
        this.context.clearRect(0, 0, 800, 800);

        try {
            this.codeFunc(this.context);
            document.getElementById("indicator").style.backgroundColor = "rgb(0,230,23)";
        } catch (error) {
            const err = extractErrorInfo(error);
            console.log(err);
            document.getElementById("indicator").style.backgroundColor = "rgb(243, 12,34)";
        }
    }

    updateCode(code) {
        this.codeFunc = new Function("ctx", code);
    }

    start() {
        const savedCode = this.loadCode();
        if (savedCode) {
            this.DONT_REFRESH = true;
            this.model.setValue(savedCode);
            this.DONT_REFRESH = false;

            this.updateCode(savedCode);

            const viewState = localStorage.getItem("cclab_viewstate");
            if (viewState) {
                this.editor.restoreViewState(JSON.parse(viewState));
            }
        }
        this.executeCode()
    }
}

