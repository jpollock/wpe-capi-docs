# WP Engine Customer API Documentation

The project was started by taking the Open API specification (located in public/openapi) to produce a doc-as-code solution for delivering external developer facing documentation. Originally, a combination of AI and scripting was used to produce the first set of documentation. Unfortuantely that code has been lost.

## New Requirements

1. Produce a robust, repeatable process for building and modifying the API documentation located in the src directory.
2. Provide a solution where when updates are made to a swagger.yml file located in a separate GitHub repository, then the build process is run again. Or at minimum, enable the build process to be automatable.