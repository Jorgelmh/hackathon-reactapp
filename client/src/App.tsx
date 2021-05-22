import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "components/templates/home";
import Signup from "components/templates/signup";
import "./styles/theme/hackaton.css";
import GlobalStyles from "./styles/global";
import Profile from "components/templates/profile"
import Mood from "components/templates/mood"
import Notification from "components/templates/notification"

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <GlobalStyles />
          <Home />
        </Route>
        <Route exact path="/signup">
          <Signup />
        </Route>
        <Route exact path="/profile">
          <Profile />
        </Route>
        <Route exact path="/mood">
          <Mood/>
        </Route>
        <Route exact path="/notification">
          <Notification/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
