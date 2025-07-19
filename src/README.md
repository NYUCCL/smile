This gives some general overview of the codebase.

Folder and file overview:

- `/user` contains the user-specific components and logic for the application.

- `/core` contains the core components and logic for the application.

- `/builtins` contains the built-in components and logic for the application.

- `/dev` contains the developer-specific components and logic for the application.
  - `/dev/developer_mode` contains the developer-specific components and logic for the application.
  - `/dev/presentation_mode` contains the presentation-specific components and logic for the application.
  - `/dev/dashboard` contains the dashboard-specific components and logic for the application.

- `/uikit` contains the uikit components and logic for the application.
  - `/uikit/components/ui` contains the components for the application.
  - `/uikit/layouts` contains the layouts for the application.
  - `/uikit/lib` contains the utils for the application.

- `/assets` contains the assets for the application (e.g., graphics etc...).

A general overview of the codebase:

Execution starts from core/main.js. It imports core/MainApp.vue. This is the main
entry point for the application. Importantly this is replaced with dev/developer_mode/SmileDevApp.vue in
developer mode and dev/presentation_mode/PresentationModeApp.vue in presentation mode using the vite plugin
(so it can be a little confusing to navigate since it not part of the runcode). The
reason for this is that we want to completely strip out the devtools in developer mode
and presentation mode so that it is never delivered to the end user/participant.

The developer mode interface (`SmileDevApp.vue`) is organized into a structured layout with four main areas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────┐ ┌─────────────────────────────────────────────────────────────┐    │
│  │     │ │                    NAVBAR (TOP)                             │    │
│  │     │ │  Status indicators, mode controls, database buttons         │    │
│  │     │ └─────────────────────────────────────────────────────────────┘    │
│  │     │                                                                    │
│  │     │ ┌─────────────────────────────────────┐ ┌─────────────────────┐    │
│  │     │ │                                     │ │                     │    │
│  │     │ │                                     │ │                     │    │
│  │ MENU│ │            MAIN CONTENT             │ │                     │    │
│  │     │ │                                     │ │                     │    │
│  │     │ │      (Responsive Device Container)  │ │      SIDEBAR        │    │
│  │     │ │                                     │ │                     │    │
│  │     │ │                                     │ │     (RIGHT)         │    │
│  │     │ │                                     │ │                     │    │
│  │     │ └─────────────────────────────────────┘ │                     │    │
│  │     │                                         │  Steps,             │    │
│  │     │ ┌─────────────────────────────────────┐ │  randomization      │    │
│  │     │ │         CONSOLE (BOTTOM)            │ │  controls, study    │    │
│  │     │ │  Logs, database browser,            │ │  information        │    │
│  │     │ │  configuration panel                │ │                     │    │
│  └─────┘ └─────────────────────────────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Layout Components:**

- **Menu (Left)**: `dev/developer_mode/menu/SmileDevAppMenu.vue` - Collapsible sidebar with navigation options
- **Navbar (Top)**: `dev/developer_mode/navbar/SmileDevNavBar.vue` - Status bar with controls and indicators
- **Main Content (Center)**: `dev/developer_mode/ResponsiveDeviceContainer.vue` - The experiment interface
- **Sidebar (Right)**: `dev/developer_mode/sidebar/DevSideBar.vue` - Steps, randomization, study/db iunfo
- **Console (Bottom)**: `dev/developer_mode/console/SmileDevConsole.vue` - Logs, database browser, and configuration

within each subfolder are the components that help with that section, with descriptive names when possible (e.g., \*Button.vue, \*ButtonGroup.vue, \*Panel.vue, etc...)
