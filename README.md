# Go Implementation Lense

Go Implementation Lense enhances your Go development experience in VS Code by adding inline links to quickly navigate to symbol implementations. This extension provides CodeLens annotations for structs, classes, interfaces, and methods, helping you find and jump to their implementations with a single click.  

## Features  
- Displays the number of implementations for each relevant symbol  
- Clickable CodeLens links for fast navigation  
- Works seamlessly with Go code using VS Code's built-in symbol and implementation providers  

## How It Works  
1. The extension analyzes the document to find structs, classes, interfaces, and methods.  
2. It queries the implementation provider to determine available implementations.  
3. A CodeLens link (e.g., **🔗 impls: 3**) is added above the symbol.  
4. Clicking the link navigates to the implementations.  
