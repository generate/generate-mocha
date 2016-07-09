---
layout: default
install: 
  devDependencies: ['mocha']
---
  <%= indent(include("assert-function.js")) %>
  <%= indent(include("assert-object.js")) %>
  <%= indent(include("assert-error.js")) %>