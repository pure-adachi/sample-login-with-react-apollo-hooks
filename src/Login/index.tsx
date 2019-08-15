import React, { useState } from "react";
import { useQuery, useMutation } from "react-apollo-hooks";
import { Redirect, withRouter } from "react-router";
import { History } from "history";
import gql from "graphql-tag";

interface IProps {
  history: History;
}

const Login = ({ history }: IProps) => {
  const [loginid, setLoginid] = useState("");
  const [password, setPassword] = useState("");

  const loggedUserQuery = gql`
    {
      loggedUser {
        id
      }
    }
  `;

  const loginMutation = gql`
    mutation login($loginid: String!, $password: String!) {
      login(input: { loginid: $loginid, password: $password }) {
        user {
          accessToken {
            token
          }
        }
        result
      }
    }
  `;

  const [login] = useMutation(loginMutation, {
    update: (_proxy, response) => {
      if (response.data.login.result) {
        localStorage.setItem(
          "token",
          response.data.login.user.accessToken.token
        );
        history.push("/");
      } else {
        alert("ログイン情報が不正です。");
        setLoginid("");
        setPassword("");
      }
    },
    variables: { loginid, password }
  });

  const { loading, data } = useQuery(loggedUserQuery);

  if (loading) {
    return <div>Now Loading...</div>;
  } else if (data.loggedUser) {
    return <Redirect to="/" />;
  }

  return (
    <div>
      <div>
        <label>
          ID
          <br />
          <input
            type="text"
            value={loginid}
            onChange={e => setLoginid(e.target.value || "")}
          />
        </label>
      </div>
      <div>
        <label>
          PW
          <br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value || "")}
          />
        </label>
      </div>
      <div>
        <input type="submit" value="ログイン" onClick={() => login()} />
      </div>
    </div>
  );
};

export default withRouter(Login);
