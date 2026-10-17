/**
 * Judge0 compiles Main.java, so the program needs a public class Main with a main method.
 *  - a full program: rename its public class to Main;
 *  - a class without main (class Solution {...}): keep it and add a Main that calls it;
 *  - loose methods: wrap them in Main.
 */
export function wrapJava(snippet) {
  return withHelpers(wrap(snippet.replace(/\s+$/, '')));
}

// LeetCode's standard node types, added when a snippet uses one without declaring it.
const HELPER_TYPES = {
  TreeNode: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}`,
  ListNode: `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}`,
};
// Constants many DSA snippets lean on, added to Main when used but not declared.
const HELPER_FIELDS = {
  MOD: 'static final int MOD = 1_000_000_007;',
  DIRS: 'static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };',
};

function withHelpers(code) {
  let out = code;
  for (const [name, def] of Object.entries(HELPER_FIELDS)) {
    const declared = new RegExp(`\\b${name}\\s*=`).test(out);
    if (new RegExp(`\\b${name}\\b`).test(out) && !declared) out = out.replace(/public class Main \{\n/, `$&    ${def}\n\n`);
  }
  for (const [name, def] of Object.entries(HELPER_TYPES)) {
    if (new RegExp(`\\b${name}\\b`).test(out) && !new RegExp(`class\\s+${name}\\b`).test(out)) out += `\n${def}\n`;
  }
  return out;
}

function wrap(code) {
  const imports = 'import java.util.*;\nimport java.util.function.*;\nimport java.util.stream.*;\n\n';
  const hasImports = /^\s*import\s/m.test(code);
  const head = hasImports ? '' : imports;

  if (/public\s+static\s+void\s+main\s*\(/.test(code)) {
    const named = code.replace(/public\s+(final\s+)?class\s+\w+/, 'public $1class Main');
    return head + (named === code && !/class\s+Main\b/.test(code) ? `public class Main {\n${indent(code)}\n}\n` : named) + '\n';
  }
  if (/^\s*(public\s+|abstract\s+|final\s+)*(class|interface|record|enum)\s+\w+/m.test(code)) {
    const body = code.replace(/public\s+(?=(abstract\s+|final\s+)*(class|interface|record|enum)\s)/g, '');
    return `${head}${body}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Try the code above here, e.g.\n        // System.out.println(new Solution().method(...));\n    }\n}\n`;
  }
  return `${head}public class Main {\n${indent(code)}\n\n    public static void main(String[] args) {\n        // Call the method above, e.g. System.out.println(new Main().method(...));\n        // (or make it static and call it directly)\n    }\n}\n`;
}

const indent = (s) => s.split('\n').map((l) => (l ? `    ${l}` : l)).join('\n');
