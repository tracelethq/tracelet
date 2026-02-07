# Project layout

Reference structure of the Tracelet repository.

```
tracelet/
├── package.json              # Root workspace config and scripts
├── packages/
│   ├── sdk-core/             # @tracelet/core – core SDK
│   ├── sdk-express/          # @tracelet/express – middleware + traceletDoc
│   │   ├── dist/             # Compiled output
│   │   │   └── ui/           # Bundled docs UI (after build, for packed .tgz)
│   │   └── scripts/
│   │       └── copy-ui.js    # Copies sdk-ui/dist → dist/ui at build time
│   └── sdk-ui/               # @tracelet/ui – Vite + React docs UI
│       └── dist/             # Built static UI (index.html + assets)
├── examples/
│   └── express-basic/        # Minimal Express app using Tracelet
└── docs/
    ├── README.md             # Docs index
    ├── SETUP.md
    ├── BUILD.md
    ├── INSTALLING-PACKED-SDKS.md
    ├── RUNNING-LOCALLY.md
    ├── PROJECT-LAYOUT.md     # This file
    ├── TROUBLESHOOTING.md
    └── EXTERNAL-TESTING.md
```
