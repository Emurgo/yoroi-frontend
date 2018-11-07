# Component

Represents low-level building blocks of the UI. These are meant to contain **the raw HTML** and logic required to render the `component` and the styling to go with it. Higher-level concepts that don't require any HTML should be a `container`.

**Note**: Do NOT use core HTML controls (`button`, `input`, `checkbox`, etc.). These should instead be replaced by the customizable `react-polymorph` components in the `themes` folder.  

**Note**: Components should not depend on either `store` or `actions`. (Should be **stateless** with respect to the rest of the application)