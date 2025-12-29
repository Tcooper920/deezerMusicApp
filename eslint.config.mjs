// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
export default defineConfig([
    {
    // Apply to all JS files
        files: ["**/*.{js,mjs,cjs}"],
        // Use recommended JS rules
        plugins: { js },
        extends: ["js/recommended"],
        // Browser globals (window, document, etc.)
        languageOptions: {
            globals: globals.browser,
        },
        // Custom rules
        rules: {
            // Limit multiple empty lines to 1
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
            // Require blank lines between class members
            "lines-between-class-members": ["error", "always"],
            // Require blank lines before return statements
            "padding-line-between-statements": ["error", { blankLine: "always", prev: "*", next: "return" }],
            "max-len": ["error",
  						{
    				code: 165,            // max characters per line
    				tabWidth: 2,          // treat a tab as 2 spaces
    				ignoreUrls: true,     // long URLs are ignored
                    ignoreStrings: false, // enforce on strings
                    ignoreTemplateLiterals: false,
                    ignoreComments: false
  						}],
            "indent": ["error", 4, { "SwitchCase": 1, "ignoredNodes": ["TemplateLiteral"] }],

        },
    },
]);
