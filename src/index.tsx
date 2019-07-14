import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import { ApolloProvider } from "react-apollo-hooks";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { setContext } from "apollo-link-context";
import { createHttpLink } from "apollo-link-http";
import { Route, Switch } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";

const uri = "http://localhost:5000/graphql";
const context = setContext((_, { headers }) => {
  return {
    headers: { ...headers, token: localStorage.getItem("access_token") }
  };
});
const link = context.concat(createHttpLink({ uri }));
const cache = new InMemoryCache();
const client = new ApolloClient({ cache, link });

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/login" component={Login} />
      </Switch>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
