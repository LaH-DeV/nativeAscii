import * as vscode from "vscode";

enum Mode {
  toAscii,
  toNative,
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("asciihandler.asciitonative", () => {
      handleCommands(Mode.toNative);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("asciihandler.nativetoascii", () => {
      handleCommands(Mode.toAscii);
    })
  );
}

const handleCommands = (mode: Mode) => {
  const { activeTextEditor } = vscode.window;
  let message = "This extension works only with '.properties' files!";
  if (activeTextEditor && activeTextEditor.document.fileName.endsWith(".properties")) {
    const { document } = activeTextEditor;
    const textInFile = document.getText();
    const edit = new vscode.WorkspaceEdit();
    let textConverted;
    switch (mode) {
      case Mode.toAscii:
        textConverted = native2Ascii(textInFile);
        message = "All the native characters converted to ASCII successfully!";
        break;
      case Mode.toNative:
        textConverted = ascii2Native(textInFile);
        message = "All the ASCII characters converted to native successfully!";
        break;
    }
    let range = new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    edit.replace(document.uri, range, textConverted);
    vscode.window.showInformationMessage(message);
    return vscode.workspace.applyEdit(edit);
  } else {
    vscode.window.showInformationMessage(message);
    return null;
  }
};

const native2Ascii = (text: string) => {
  let ascii = "";
  for (let i = 0; i < text.length; i++) {
    let code = Number(text[i].charCodeAt(0));
    if (code > 127) {
      let charAscii = code.toString(16);
      charAscii = new String("0000").substring(charAscii.length, 4) + charAscii;
      ascii += "\\u" + charAscii;
    } else {
      ascii += text[i];
    }
  }
  return ascii;
};

const ascii2Native = (text: string) => {
  let textArray = text.split("\\u");
  let native1 = textArray[0];
  for (let i = 1; i < textArray.length; i++) {
    let code = textArray[i];
    native1 += String.fromCharCode(parseInt("0x" + code.substring(0, 4)));
    if (code.length > 4) {
      native1 += code.substring(4, code.length);
    }
  }
  return native1;
};
