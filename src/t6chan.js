import accessor from "./accessor";
let _d3;

// If running in browser (window !undefined), assume d3 available
if ("undefined" != typeof window) _d3 = window.d3;
// else we're in the only other supported mode: v8/node
else
  throw "Unsupported runtime environment: Could not find d3. Ensure defined globally on window, or available as dependency.";

export default (() => {
  return {
    accessor: accessor()
  };
})(_d3);
